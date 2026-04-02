import { Routes, Route, Navigate } from "react-router-dom";
import { isLoggedIn } from "./utils/auth";

import Landing from "./components/Landing";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
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

// ================= PUBLIC BLOCK ROUTE =================
// (logged in user ko login/signup pe nahi jane dena)
function PublicRoute({ children }) {
  return isLoggedIn() ? <Navigate to="/dashboard" replace /> : children;
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

      {/* ================= PRIVATE ================= */}
      <Route
        path="/dashboard/*"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="verify" element={<VerifyPanel />} />
        <Route path="history" element={<History />} />
        <Route path="settings" element={<Settings />} />
        <Route path="messages" element={<ContactMessages />} />
      </Route>

      {/* ================= FALLBACK ================= */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>

  );
}