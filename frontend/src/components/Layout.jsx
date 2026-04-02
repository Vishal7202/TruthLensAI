import DashboardNavbar from "./DashboardNavbar";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import { useState } from "react";

export default function Layout() {

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#070f1f] text-white overflow-hidden">

      {/* ===== Global Glow Background ===== */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute w-[1000px] h-[1000px] bg-indigo-600/20 blur-[220px] rounded-full top-[-300px] left-[-250px]" />
        <div className="absolute w-[900px] h-[900px] bg-purple-600/20 blur-[200px] rounded-full bottom-[-300px] right-[-250px]" />
      </div>

      {/* Soft radial highlight */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.08),transparent_60%)] pointer-events-none" />

      {/* ===== Navbar ===== */}
      <DashboardNavbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* ===== Body ===== */}
      <div className="flex flex-1 relative z-10">

        {/* ===== Sidebar ===== */}
        <div
          className={`fixed md:static z-40 h-full transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        >
          <Sidebar closeSidebar={() => setSidebarOpen(false)} />
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
          />
        )}

        {/* ===== Main Content ===== */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full">
          <Outlet />
        </main>

      </div>

    </div>
  );
}