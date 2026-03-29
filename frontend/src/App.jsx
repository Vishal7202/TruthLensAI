import { Routes, Route, Navigate } from "react-router-dom";

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

function PrivateRoute({ children }) {
  const user = localStorage.getItem("token");
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {

  return (

    <Routes>

      {/* ================= PUBLIC ================= */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route path="/privacy" element={<Privacy />} />
<Route path="/terms" element={<Terms />} />


      {/* ================= PRIVATE DASHBOARD ================= */}
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

        {/* ⭐ CONTACT MESSAGES INSIDE DASHBOARD */}
        <Route path="messages" element={<ContactMessages />} />

      </Route>


      {/* ================= FALLBACK ================= */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>

    

  );
}