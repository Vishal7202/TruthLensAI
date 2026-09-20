import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  ShieldCheck,
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Mail,
  RefreshCw,
  LogOut,
} from "lucide-react";

import { apiFetch } from "../utils/api";
import { clearAuth, getUser } from "../utils/auth";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = getUser();

  useEffect(() => {
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");

    if (!token || role !== "admin") {
      navigate("/unauthorized", { replace: true });
      return;
    }

    loadAdminData();
  }, [navigate]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [statsData, usersData, messagesData] = await Promise.all([
        apiFetch("/admin/stats", {
          headers,
        }),

        apiFetch("/admin/users", {
          headers,
        }),

        apiFetch("/admin/messages", {
          headers,
        }),
      ]);

      if (!statsData?.success) {
        throw new Error("Failed to load admin statistics");
      }

      setStats(statsData);
      setUsers(usersData?.users || []);
      setMessages(messagesData?.messages || []);
    } catch (err) {
      console.error("ADMIN DASHBOARD ERROR:", err);

      if (err?.status === 401 || err?.status === 403) {
        clearAuth();
        navigate("/unauthorized", { replace: true });
        return;
      }

      setError(err.message || "Failed to load admin dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw
            size={32}
            className="mx-auto mb-4 animate-spin text-indigo-400"
          />

          <p className="text-white/60">
            Loading admin dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white/5 border border-red-500/20 rounded-2xl p-6 text-center">
          <AlertTriangle
            size={40}
            className="mx-auto mb-4 text-red-400"
          />

          <h2 className="text-xl font-semibold mb-2">
            Dashboard Error
          </h2>

          <p className="text-white/60 text-sm mb-5">
            {error}
          </p>

          <button
            onClick={loadAdminData}
            className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const totalUsers = stats?.users?.total || 0;
  const totalAdmins = stats?.users?.admins || 0;
  const normalUsers = stats?.users?.normal || 0;

  const totalVerifications =
    stats?.verifications?.total || 0;

  const trueCount =
    stats?.verifications?.true || 0;

  const falseCount =
    stats?.verifications?.false || 0;

  const unverifiedCount =
    stats?.verifications?.unverified || 0;

  const statCards = [
    {
      title: "Total Users",
      value: totalUsers,
      icon: Users,
      description: `${normalUsers} normal users`,
    },
    {
      title: "Admin Users",
      value: totalAdmins,
      icon: ShieldCheck,
      description: "System administrators",
    },
    {
      title: "Total Verifications",
      value: totalVerifications,
      icon: Activity,
      description: "AI claim checks",
    },
    {
      title: "TRUE Claims",
      value: trueCount,
      icon: CheckCircle2,
      description: "Classified as TRUE",
    },
    {
      title: "FALSE Claims",
      value: falseCount,
      icon: XCircle,
      description: "Classified as FALSE",
    },
    {
      title: "Unverified",
      value: unverifiedCount,
      icon: AlertTriangle,
      description: "Needs further verification",
    },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white px-4 sm:px-6 lg:px-8 py-8">

      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-8">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

          <div>
            <p className="text-sm text-indigo-400 font-medium mb-1">
              TruthLens AI
            </p>

            <h1 className="text-3xl md:text-4xl font-bold">
              Admin Dashboard
            </h1>

            <p className="text-white/50 mt-2 text-sm">
              Manage users, verification activity and contact messages.
            </p>
          </div>

          <div className="flex items-center gap-3">

            <button
              onClick={loadAdminData}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl
              bg-white/5 border border-white/10
              hover:bg-white/10 transition text-sm"
            >
              <RefreshCw size={16} />
              Refresh
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl
              bg-red-500/10 border border-red-500/20
              text-red-400 hover:bg-red-500/20 transition text-sm"
            >
              <LogOut size={16} />
              Logout
            </button>

          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">

        {/* WELCOME CARD */}
        <div className="relative overflow-hidden rounded-2xl
          border border-indigo-500/20
          bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent
          p-6">

          <div className="relative z-10">

            <p className="text-white/50 text-sm mb-1">
              Welcome back
            </p>

            <h2 className="text-2xl font-semibold">
              {user?.name || "Administrator"} 👋
            </h2>

            <p className="text-white/50 text-sm mt-1">
              You are logged in with administrator privileges.
            </p>

          </div>

          <div className="absolute -right-20 -top-20 w-64 h-64
            bg-indigo-500/20 blur-[100px] rounded-full" />

        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">

          {statCards.map((item) => {

            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="group rounded-2xl
                bg-white/[0.035]
                border border-white/10
                p-5
                hover:border-indigo-500/40
                hover:bg-white/[0.055]
                transition-all duration-300"
              >

                <div className="flex items-start justify-between">

                  <div>
                    <p className="text-sm text-white/50">
                      {item.title}
                    </p>

                    <p className="text-3xl font-bold mt-2">
                      {item.value}
                    </p>

                    <p className="text-xs text-white/35 mt-1">
                      {item.description}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-indigo-500/10">
                    <Icon
                      size={21}
                      className="text-indigo-400"
                    />
                  </div>

                </div>

              </div>
            );
          })}

        </div>

        {/* USERS */}
        <section className="rounded-2xl bg-white/[0.035] border border-white/10 overflow-hidden">

          <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">

            <div>
              <h2 className="text-lg font-semibold">
                Users
              </h2>

              <p className="text-xs text-white/40 mt-1">
                Registered TruthLens AI users
              </p>
            </div>

            <span className="text-xs px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-300">
              {users.length} users
            </span>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead>
                <tr className="text-left text-white/40 border-b border-white/10">

                  <th className="px-6 py-4 font-medium">
                    Name
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Email
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Role
                  </th>

                </tr>
              </thead>

              <tbody>

                {users.length === 0 ? (
                  <tr>
                    <td
                      colSpan="3"
                      className="px-6 py-10 text-center text-white/40"
                    >
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-white/5 hover:bg-white/[0.025] transition"
                    >

                      <td className="px-6 py-4">
                        {item.name || "—"}
                      </td>

                      <td className="px-6 py-4 text-white/60">
                        {item.email}
                      </td>

                      <td className="px-6 py-4">

                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                            item.role === "admin"
                              ? "bg-purple-500/10 text-purple-300"
                              : "bg-sky-500/10 text-sky-300"
                          }`}
                        >
                          {item.role}
                        </span>

                      </td>

                    </tr>
                  ))
                )}

              </tbody>

            </table>

          </div>
        </section>

        {/* CONTACT MESSAGES */}
        <section className="rounded-2xl bg-white/[0.035] border border-white/10 overflow-hidden">

          <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="p-2.5 rounded-xl bg-indigo-500/10">
                <Mail
                  size={19}
                  className="text-indigo-400"
                />
              </div>

              <div>
                <h2 className="text-lg font-semibold">
                  Contact Messages
                </h2>

                <p className="text-xs text-white/40 mt-1">
                  Messages submitted through the website
                </p>
              </div>

            </div>

            <span className="text-xs px-3 py-1.5 rounded-full bg-white/5 text-white/50">
              {messages.length} messages
            </span>

          </div>

          <div className="divide-y divide-white/5">

            {messages.length === 0 ? (
              <div className="px-6 py-12 text-center text-white/40">
                No contact messages yet.
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className="px-6 py-5 hover:bg-white/[0.02] transition"
                >

                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">

                    <div>

                      <h3 className="font-medium">
                        {message.name}
                      </h3>

                      <p className="text-xs text-indigo-300 mt-1">
                        {message.email}
                      </p>

                    </div>

                    <span className="text-xs text-white/30">
                      #{message.id}
                    </span>

                  </div>

                  <p className="text-sm text-white/60 leading-6 mt-4">
                    {message.message}
                  </p>

                </div>
              ))
            )}

          </div>

        </section>

      </div>
    </div>
  );
}