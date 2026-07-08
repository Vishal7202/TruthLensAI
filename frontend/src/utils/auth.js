import { apiFetch } from "./api";

// ================= SET AUTH =================
export const setAuth = (data) => {
  if (!data?.token) return;

  // ✅ token
  localStorage.setItem("token", data.token);

  // ✅ role (IMPORTANT FIX)
  if (data.role) {
    localStorage.setItem("role", data.role);
  }

  // ✅ user
  if (data.user) {
    localStorage.setItem("user", JSON.stringify(data.user));
  }
};

// ================= GET USER =================
export const getUser = () => {
  try {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch (err) {
    console.error("User parse error:", err);
    clearAuth();
    return null;
  }
};

// ================= GET TOKEN =================
export const getToken = () => {
  return localStorage.getItem("token");
};

// ================= GET ROLE =================
export const getRole = () => {
  return localStorage.getItem("role");
};

// ================= CHECK LOGIN =================
export const isLoggedIn = () => {
  return !!getToken();
};

// ================= LOGOUT =================
export const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("role"); // ✅ FIX

  window.location.href = "/login";
};

// ================= SIGNUP =================
export const signup = async ({ name, email, password }) => {
  try {
    const data = await apiFetch("/register", {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    return data;
  } catch (error) {
    console.error("Signup error:", error);
    throw new Error(error.message || "Signup failed");
  }
};

// ================= LOGIN =================
export const login = async ({ email, password }) => {
  try {
    const data = await apiFetch("/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
    });

    // ✅ auto save auth (ab role bhi save hoga)
    setAuth(data);

    return data;
  } catch (error) {
    console.error("Login error:", error);
    throw new Error(error.message || "Login failed");
  }
};