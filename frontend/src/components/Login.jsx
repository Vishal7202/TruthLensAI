import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";
import { setAuth } from "../utils/auth";

export default function Login(){

  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);
  const [showPass,setShowPass]=useState(false);

  const navigate=useNavigate();

  useEffect(()=>{
    const token = localStorage.getItem("token");
    if(token){
      navigate("/dashboard");
    }
  },[navigate]);

  async function handleLogin(e){
    e.preventDefault();
    setError("");
    setLoading(true);

    try{
      const data = await apiFetch("/login",{
        method:"POST",
        body:JSON.stringify({ email,password })
      });

      // ✅ save auth properly
      setAuth(data);

      navigate("/dashboard");

    }catch(err){
      setError(err.message || "Login failed");
    }

    setLoading(false);
  }

  return(

<div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#020617]">

  <form
    onSubmit={handleLogin}
    className="relative w-full max-w-md p-10 rounded-[32px]
    bg-gradient-to-b from-[#0f172a]/95 to-[#0b1324]/95
    border border-indigo-400/20
    backdrop-blur-2xl shadow-2xl"
  >

    <h1 className="text-3xl font-semibold mb-8 text-center text-indigo-400">
      Login to TruthLens
    </h1>

    <input
      type="email"
      placeholder="Email"
      value={email}
      onChange={e=>setEmail(e.target.value)}
      required
      className="w-full mb-5 p-4 rounded-xl bg-[#091122] text-white"
    />

    <div className="relative mb-5">
      <input
        type={showPass ? "text" : "password"}
        placeholder="Password"
        value={password}
        onChange={e=>setPassword(e.target.value)}
        required
        className="w-full p-4 rounded-xl bg-[#091122] text-white"
      />

      <span
        onClick={()=>setShowPass(!showPass)}
        className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400"
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
      className="w-full py-4 rounded-full bg-indigo-500 text-white"
    >
      {loading ? "Logging in..." : "Login"}
    </button>

    <div className="mt-6 flex justify-between text-sm text-gray-300">
      <span
        onClick={()=>navigate("/signup")}
        className="cursor-pointer hover:text-indigo-400">
        Create account
      </span>

      <span
        onClick={()=>navigate("/forgot")}
        className="cursor-pointer hover:text-indigo-400">
        Forgot password?
      </span>
    </div>

  </form>

</div>

);
}