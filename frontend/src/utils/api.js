const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export async function apiFetch(url, options = {}) {

  try {

    const token = localStorage.getItem("token");

    const headers = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(options.headers || {})
    };

    const res = await fetch(API + url, {
      ...options,
      headers
    });

    // 🔐 Handle auth failure
    if (res.status === 401) {
      localStorage.clear();
      window.location.href = "/login";
      return;
    }

    // ❌ Handle server errors
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Server error");
    }

    // ✅ Safe JSON parse
    const data = await res.json();
    return data;

  } catch (err) {
    console.error("API ERROR:", err);
    throw err;
  }
}