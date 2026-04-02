// ================= SET AUTH =================
export const setAuth = (data) => {
  if (!data?.token) return;

  localStorage.setItem("token", data.token);

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

// ================= CHECK LOGIN =================
export const isLoggedIn = () => {
  return !!getToken();
};

// ================= LOGOUT =================
export const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  // redirect after logout
  window.location.href = "/login";
};