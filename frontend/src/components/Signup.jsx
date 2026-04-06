import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api"; // ✅ FIX

export default function Signup(){

  const navigate = useNavigate();

  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [showPass,setShowPass]=useState(false);
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);

  async function handleSignup(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // ✅ validation
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("All fields are required ❌");
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setError("Enter valid email address ❌");
      setLoading(false);
      return;
    }

    if (password.length < 5) {
      setError("Password must be at least 5 characters 🔒");
      setLoading(false);
      return;
    }

    try {
      // ✅ FIXED (direct backend call)
      const data = await apiFetch("/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });

      // ✅ FIXED (proper storage)
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);

      alert("Account created successfully ✅");

      navigate("/login");

    } catch (err) {
      setError(err.message || "Signup failed ❌");
    }

    setLoading(false);
  }

  return(

    <div
      className="min-h-screen flex items-center justify-center
                 bg-[url('/bg.jpg')] bg-cover bg-center px-4"
    >

      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"/>

      <form
        onSubmit={handleSignup}
        className="relative w-full max-w-lg p-8 sm:p-10
                   rounded-3xl border border-white/10
                   bg-gradient-to-br from-slate-900/80 to-slate-800/60
                   backdrop-blur-xl shadow-2xl"
      >

        <h1 className="text-3xl font-semibold mb-2 text-center
                       bg-gradient-to-r from-sky-400 to-indigo-400
                       text-transparent bg-clip-text">
          Create Account
        </h1>

        <p className="text-center text-gray-300 mb-8 text-sm">
          Join TruthLens and start verifying information instantly
        </p>

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={e=>setName(e.target.value)}
          required
          className="w-full mb-4 p-4 rounded-xl
                     bg-black/60 border border-slate-700
                     text-white placeholder-gray-400
                     focus:border-sky-500 outline-none transition"
        />

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={e=>setEmail(e.target.value)}
          required
          className="w-full mb-4 p-4 rounded-xl
                     bg-black/60 border border-slate-700
                     text-white placeholder-gray-400
                     focus:border-sky-500 outline-none transition"
        />

        <div className="relative mb-5">
          <input
            type={showPass ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={e=>setPassword(e.target.value)}
            required
            className="w-full p-4 rounded-xl
                       bg-black/60 border border-slate-700
                       text-white placeholder-gray-400
                       focus:border-sky-500 outline-none transition"
          />

          <span
            onClick={()=>setShowPass(!showPass)}
            className="absolute right-4 top-1/2 -translate-y-1/2
                       text-gray-400 cursor-pointer text-sm"
          >
            {showPass ? "Hide" : "Show"}
          </span>
        </div>

        {error && (
          <p className="text-red-400 mb-4 text-sm text-center">
            {error}
          </p>
        )}

        <button
          disabled={loading}
          className="w-full py-4 rounded-full text-lg font-semibold
                     bg-gradient-to-r from-sky-500 to-indigo-500
                     hover:scale-105 transition shadow-lg
                     disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>

        <p className="text-center text-sm text-gray-300 mt-6">
          Already have an account?{" "}
          <span
            onClick={()=>navigate("/login")}
            className="text-sky-400 cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>

      </form>

    </div>
  );
}