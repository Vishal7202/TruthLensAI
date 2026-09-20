import { Routes, Route, Navigate } from "react-router-dom";
import { isLoggedIn } from "./utils/auth";

import Landing from "./components/Landing";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import AdminDashboard from "./components/AdminDashboard";

import VerifyPanel from "./components/VerifyPanel";
import History from "./components/History";
import Login from "./components/Login";
import Settings from "./components/Settings";
import Signup from "./components/Signup";
import ContactMessages from "./components/ContactMessages";
import Privacy from "./components/Privacy";
import Terms from "./components/Terms";

// ================= PROTECTED ROUTE =================
function PrivateRoute({ children }) {
  return isLoggedIn() ? children : <Navigate to="/login" replace />;
}

// ================= ADMIN ROUTE =================
function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// ================= PUBLIC BLOCK ROUTE =================
// Logged-in user ko login/signup par wapas nahi jaane dena
function PublicRoute({ children }) {
  if (!isLoggedIn()) {
    return children;
  }

  const role = localStorage.getItem("role");

  if (role === "admin") {
    return <Navigate to="/admin-dashboard" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <Routes>

      {/* ================= PUBLIC ================= */}

      <Route path="/" element={<Landing />} />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        }
      />

      <Route path="/privacy" element={<Privacy />} />

      <Route path="/terms" element={<Terms />} />


      {/* ================= USER PRIVATE ================= */}

      <Route
        path="/dashboard/*"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />

        <Route
          path="verify"
          element={<VerifyPanel />}
        />

        <Route
          path="history"
          element={<History />}
        />

        <Route
          path="settings"
          element={<Settings />}
        />

        <Route
          path="messages"
          element={<ContactMessages />}
        />
      </Route>


      {/* ================= ADMIN PRIVATE ================= */}

      <Route
        path="/admin-dashboard"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />


      {/* ================= FALLBACK ================= */}

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
}