console.log("ENV:", import.meta.env);
console.log("BASE_URL:", import.meta.env.VITE_API_URL);
const BASE_URL = import.meta.env.VITE_API_URL;

if (!BASE_URL) {
  throw new Error("❌ VITE_API_URL is not defined in environment variables");
}

export async function apiFetch(endpoint, options = {}) {
  try {
    const token = localStorage.getItem("token");

    const url = endpoint.startsWith("/")
      ? BASE_URL + endpoint
      : BASE_URL + "/" + endpoint;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(options.headers || {}),
      },
    });

    clearTimeout(timeout);

    if (res.status === 401) {
      localStorage.clear();
      window.location.href = "/login";
      return;
    }

    let data;
    const text = await res.text();

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: text };
    }

    if (!res.ok) {
  let errorMessage = "Server error";

  if (Array.isArray(data.detail)) {
    errorMessage = data.detail.map(err => err.msg).join(", ");
  } else if (typeof data.detail === "string") {
    errorMessage = data.detail;
  } else if (data.message) {
    errorMessage = data.message;
  }

  throw new Error(errorMessage);
}

    return data;

  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("Request timeout ❌");
    }

    console.error("API ERROR:", err);
    throw err;
  }
}