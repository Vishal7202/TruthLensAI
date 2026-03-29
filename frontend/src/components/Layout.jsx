import DashboardNavbar from "./DashboardNavbar";
import Sidebar from "./Sidebar";
import { Outlet, useLocation } from "react-router-dom";

export default function Layout() {

  const location = useLocation();

  const hideSidebarRoutes = ["/", "/login", "/signup"];
  const hideSidebar = hideSidebarRoutes.includes(location.pathname);

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
      <DashboardNavbar />

      {/* ===== Body ===== */}
      <div className="flex flex-1 relative z-10">

        {/* Sidebar */}
        {!hideSidebar && <Sidebar />}

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20">
          <Outlet />
        </main>

      </div>

    </div>
  );
}