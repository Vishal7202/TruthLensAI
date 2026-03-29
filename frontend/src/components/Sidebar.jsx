import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ShieldCheck,
  History,
  Settings
} from "lucide-react";

export default function Sidebar() {

  const base =
    "group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium";

  const active =
    "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-400/30 shadow-[0_0_20px_rgba(99,102,241,0.4)]";

  const hover =
    "hover:bg-white/5 hover:translate-x-1";

  return (
    <aside className="
      relative w-64 shrink-0
      border-r border-white/10
      bg-gradient-to-b from-[#0b1220]/90 to-[#0a0f1a]/90
      backdrop-blur-xl
      shadow-[0_0_60px_rgba(0,0,0,0.6)]
      p-6
      hidden md:block
      overflow-hidden
    ">

      {/* Glow Accent Strip */}
      <div className="absolute top-0 right-0 w-[2px] h-full bg-gradient-to-b from-indigo-500 via-purple-500 to-transparent opacity-40" />

      {/* LOGO */}
      <h1 className="
        text-2xl font-semibold mb-12
        bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400
        text-transparent bg-clip-text
        tracking-wide
      ">
        TruthLens AI
      </h1>

      {/* MENU */}
      <nav className="space-y-3 text-white/90">

        {/* Dashboard */}
        <NavLink
          to="/dashboard"
          end
          className={({ isActive }) =>
            `${base} ${isActive ? active : hover}`
          }
        >
          {({ isActive }) => (
            <>
              <LayoutDashboard
                size={18}
                className={`transition-all duration-300 ${
                  isActive ? "text-indigo-400 drop-shadow-[0_0_6px_rgba(99,102,241,0.8)]" : "text-white/70"
                }`}
              />
              Dashboard
            </>
          )}
        </NavLink>

        {/* Verify */}
        <NavLink
          to="/dashboard/verify"
          className={({ isActive }) =>
            `${base} ${isActive ? active : hover}`
          }
        >
          {({ isActive }) => (
            <>
              <ShieldCheck
                size={18}
                className={`transition-all duration-300 ${
                  isActive ? "text-indigo-400 drop-shadow-[0_0_6px_rgba(99,102,241,0.8)]" : "text-white/70"
                }`}
              />
              Verify
            </>
          )}
        </NavLink>

        {/* History */}
        <NavLink
          to="/dashboard/history"
          className={({ isActive }) =>
            `${base} ${isActive ? active : hover}`
          }
        >
          {({ isActive }) => (
            <>
              <History
                size={18}
                className={`transition-all duration-300 ${
                  isActive ? "text-indigo-400 drop-shadow-[0_0_6px_rgba(99,102,241,0.8)]" : "text-white/70"
                }`}
              />
              History
            </>
          )}
        </NavLink>

        {/* Settings */}
        <NavLink
          to="/dashboard/settings"
          className={({ isActive }) =>
            `${base} ${isActive ? active : hover}`
          }
        >
          {({ isActive }) => (
            <>
              <Settings
                size={18}
                className={`transition-all duration-300 ${
                  isActive ? "text-indigo-400 drop-shadow-[0_0_6px_rgba(99,102,241,0.8)]" : "text-white/70"
                }`}
              />
              Settings
            </>
          )}
        </NavLink>

      </nav>

    </aside>
  );
}