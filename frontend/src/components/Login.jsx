import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
      const res = await fetch("http://127.0.0.1:8000/login",{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({ email,password })
      });

      const data = await res.json();

      if(!res.ok){
        setError(data.detail || "Invalid credentials");
        setLoading(false);
        return;
      }

      localStorage.setItem("token",data.token);
      localStorage.setItem("user",JSON.stringify(data.user));

      navigate("/dashboard");

    }catch{
      setError("Server error");
    }

    setLoading(false);
  }

  return(

<div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#020617]">

  {/* Moving Gradient Background */}
  <div className="absolute inset-0 -z-40 animate-gradientMove bg-[linear-gradient(120deg,#020617,#0b1120,#111827,#0b1120,#020617)] bg-[length:400%_400%]" />

  {/* Center Spotlight */}
  <div className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.25),transparent_65%)]" />

  {/* Bottom Glow Reflection */}
  <div className="absolute bottom-[-200px] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-indigo-600/20 blur-[200px] rounded-full -z-20" />

  {/* Floating Glow */}
  <div className="absolute w-[900px] h-[900px] bg-indigo-600/20 blur-[220px] rounded-full top-[-350px] left-[-250px] animate-pulse -z-10" />
  <div className="absolute w-[800px] h-[800px] bg-purple-600/20 blur-[200px] rounded-full bottom-[-300px] right-[-250px] animate-pulse -z-10" />

  {/* LOGIN CARD */}
  <form
    onSubmit={handleLogin}
    className="relative w-full max-w-md p-10 rounded-[32px]
    bg-gradient-to-b from-[#0f172a]/95 to-[#0b1324]/95
    border border-indigo-400/20
    backdrop-blur-2xl
    shadow-[0_70px_200px_rgba(0,0,0,0.9)]
    animate-fadeIn
    before:absolute before:inset-0 before:rounded-[32px]
    before:bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.05),transparent)]
    before:animate-lightSweep before:pointer-events-none"
  >

    <h1 className="text-3xl font-semibold mb-8 text-center
      bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400
      text-transparent bg-clip-text tracking-wide drop-shadow-lg">
      Login to TruthLens
    </h1>

    <input
      type="email"
      placeholder="Email address"
      value={email}
      onChange={e=>setEmail(e.target.value)}
      required
      className="w-full mb-5 p-4 rounded-xl
      bg-[#091122]
      border border-white/10
      text-white placeholder-gray-400
      focus:border-indigo-400
      focus:shadow-[0_0_30px_rgba(99,102,241,0.6)]
      outline-none transition-all duration-300"
    />

    <div className="relative mb-5">

      <input
        type={showPass ? "text" : "password"}
        placeholder="Password"
        value={password}
        onChange={e=>setPassword(e.target.value)}
        required
        className="w-full p-4 rounded-xl
        bg-[#091122]
        border border-white/10
        text-white placeholder-gray-400
        focus:border-indigo-400
        focus:shadow-[0_0_30px_rgba(99,102,241,0.6)]
        outline-none transition-all duration-300"
      />

      <span
        onClick={()=>setShowPass(!showPass)}
        className="absolute right-4 top-1/2 -translate-y-1/2
        text-gray-400 cursor-pointer text-sm
        hover:text-indigo-400 transition">
        {showPass ? "Hide" : "Show"}
      </span>

    </div>

    {error && (
      <p className="text-red-400 mb-4 text-sm text-center animate-pulse">
        {error}
      </p>
    )}

    <button
      disabled={loading}
      className="relative w-full py-4 rounded-full text-lg font-semibold
      bg-gradient-to-r from-sky-500 to-indigo-500
      hover:scale-105 transition-all duration-300
      shadow-lg disabled:opacity-60 overflow-hidden"
    >
      <span className="relative z-10">
        {loading ? "Logging in..." : "Login"}
      </span>

      <span className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.35),transparent)] translate-x-[-100%] hover:translate-x-[100%] transition duration-700" />
    </button>

    <div className="mt-6 flex justify-between text-sm text-gray-300">
      <span
        onClick={()=>navigate("/signup")}
        className="cursor-pointer hover:text-indigo-400 transition">
        Create account
      </span>

      <span className="cursor-pointer hover:text-indigo-400 transition">
        Forgot password?
      </span>
    </div>

  </form>

</div>

);
}