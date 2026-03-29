import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function DashboardNavbar(){

  const [open,setOpen]=useState(false);
  const navigate=useNavigate();

  const go=(path)=>{
    setOpen(false);
    navigate(path);
  };

  const logout=()=>{
    localStorage.removeItem("token");
    navigate("/login",{replace:true});
  };

  return (
    <>
      {/* ===== TOP BAR ===== */}
      <div className="
        relative h-16 flex items-center justify-between px-6
        bg-gradient-to-r from-[#0b1220]/90 to-[#0a0f1a]/90
        backdrop-blur-xl
        border-b border-white/10
        shadow-[0_10px_40px_rgba(0,0,0,0.6)]
        text-white
      ">

        {/* subtle glow line */}
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-indigo-500 via-purple-500 to-transparent opacity-40" />

        {/* LEFT */}
        <div className="flex items-center gap-4">

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={()=>setOpen(true)}
            className="md:hidden text-2xl hover:text-indigo-400 transition"
          >
            ☰
          </button>

          <h2 className="
            font-semibold text-lg
            bg-gradient-to-r from-sky-300 via-indigo-400 to-purple-400
            bg-clip-text text-transparent
          ">
            Dashboard
          </h2>

        </div>

        {/* RIGHT */}
        <button
          onClick={logout}
          className="
            px-5 py-1.5 rounded-xl font-medium
            bg-gradient-to-r from-red-500 to-pink-500
            hover:from-pink-500 hover:to-red-500
            shadow-[0_8px_25px_rgba(239,68,68,0.4)]
            hover:shadow-[0_0_30px_rgba(239,68,68,0.6)]
            transition-all duration-300
          "
        >
          Logout
        </button>

      </div>


      {/* ===== MOBILE DRAWER ===== */}
      {open && (
        <div className="fixed inset-0 z-[999] md:hidden">

          {/* overlay */}
          <div
            onClick={()=>setOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* drawer */}
          <div className="
            relative w-72 h-full
            bg-gradient-to-b from-[#0b1220] to-[#0a0f1a]
            border-r border-white/10
            shadow-[0_0_60px_rgba(0,0,0,0.7)]
            p-6
            animate-slideIn
          ">

            {/* CLOSE */}
            <button
              onClick={()=>setOpen(false)}
              className="mb-10 text-white/80 hover:text-indigo-400 transition"
            >
              ✕ Close
            </button>

            {/* MENU */}
            <div className="flex flex-col gap-4 text-white/90">

              {[
                {label:"Dashboard", path:"/dashboard"},
                {label:"Verify", path:"/dashboard/verify"},
                {label:"History", path:"/dashboard/history"},
                {label:"Settings", path:"/dashboard/settings"}
              ].map((item,i)=>(
                <button
                  key={i}
                  onClick={()=>go(item.path)}
                  className="
                    text-left px-4 py-2 rounded-xl
                    hover:bg-white/5
                    hover:translate-x-1
                    transition-all duration-300
                  "
                >
                  {item.label}
                </button>
              ))}

            </div>

          </div>

        </div>
      )}
    </>
  );
}