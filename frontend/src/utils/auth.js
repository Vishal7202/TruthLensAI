// save user after login
export const setAuth = (data) => {
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
};

// get logged user
export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

// logout
export const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
