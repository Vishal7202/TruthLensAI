import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";
import { setAuth } from "../utils/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (token) {
    if (role === "admin") {
      navigate("/admin-dashboard");
    } else {
      navigate("/user-dashboard");
    }
  }
}, [navigate]);

 const handleLogin = async (e) => {
  e.preventDefault();
  setError("");

  if (!email || !password) {
    setError("All fields are required ❌");
    return;
  }

  setLoading(true);

  try {
    const data = await apiFetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!data?.token) {
      throw new Error("Invalid response from server");
    }

    setAuth(data);

    if (data.role === "admin") {
      navigate("/admin-dashboard");
    } else {
      navigate("/user-dashboard");
    }

  } catch (err) {
    setError(err.message || "Login failed ❌");
  }

  setLoading(false);
};

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#020617] overflow-hidden px-4">

      {/* 🌌 Background Glow */}
      <div className="absolute w-[600px] h-[600px] bg-indigo-500/20 blur-[150px] rounded-full top-[-200px] left-[-150px]" />
      <div className="absolute w-[500px] h-[500px] bg-purple-500/20 blur-[140px] rounded-full bottom-[-200px] right-[-150px]" />

      {/* 🧊 Glass Card */}
      <form
        onSubmit={handleLogin}
        className="relative z-10 w-full max-w-md p-8 sm:p-10 rounded-3xl
        bg-gradient-to-b from-[#0f172a]/90 to-[#0b1324]/90
        border border-white/10 backdrop-blur-2xl
        shadow-[0_20px_60px_rgba(0,0,0,0.7)] transition-all duration-500"
      >

        {/* Title */}
        <h1 className="text-3xl font-semibold mb-2 text-center
          bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Welcome Back 👋
        </h1>

        <p className="text-center text-gray-400 mb-8 text-sm">
          Login to continue using TruthLens AI
        </p>

        {/* Email */}
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-4 rounded-xl
          bg-[#091122] border border-white/10
          text-white placeholder-gray-400
          focus:border-indigo-500 outline-none transition"
        />

        {/* Password */}
        <div className="relative mb-5">
          <input
            type={showPass ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 rounded-xl
            bg-[#091122] border border-white/10
            text-white placeholder-gray-400
            focus:border-indigo-500 outline-none transition"
          />

          <span
            onClick={() => setShowPass(!showPass)}
            className="absolute right-4 top-1/2 -translate-y-1/2
            text-gray-400 cursor-pointer text-sm hover:text-indigo-400"
          >
            {showPass ? "Hide" : "Show"}
          </span>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-400 text-sm text-center mb-4 animate-pulse">
            {error}
          </p>
        )}

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-full text-lg font-semibold
          bg-gradient-to-r from-indigo-500 to-purple-500
          hover:scale-[1.02] active:scale-[0.98]
          transition-all shadow-lg disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* Links */}
        <div className="mt-6 flex justify-between text-sm text-gray-400">
          <span
            onClick={() => navigate("/signup")}
            className="cursor-pointer hover:text-indigo-400"
          >
            Create account
          </span>

          <span
            onClick={() => navigate("/forgot")}
            className="cursor-pointer hover:text-indigo-400"
          >
            Forgot password?
          </span>
        </div>

      </form>
    </div>
  );
}