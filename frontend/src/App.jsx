
/*

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

import Dashboard from "./pages/Dashboard";
import CallHistory from "./pages/CallHistory";
import CallDetails from "./pages/CallDetails";
import Settings from "./pages/Settings";

import "./styles/Layout.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />

        <main className="main-content">
          <Topbar />

          <div className="page-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/calls" element={<CallHistory />} />
              <Route path="/calls/:id" element={<CallDetails />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;

*/




import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

import Dashboard from "./pages/Dashboard";
import CallHistory from "./pages/CallHistory";
import CallDetails from "./pages/CallDetails";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Leads from "./pages/Leads";
import API from "./config/api";
import "./styles/Layout.css";

function ProtectedLayout() {
  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Topbar />

        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function AppRoutes() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const verifyAdmin = async () => {
      const token = localStorage.getItem("call_china_admin_token");

      if (!token) {
        setCheckingAuth(false);
        return;
      }

      try {
        const response = await fetch(`${API}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          localStorage.removeItem("call_china_admin_token");
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(true);
        }
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    };

    verifyAdmin();

    const handleAuthChange = () => {
      setIsAuthenticated(
        Boolean(localStorage.getItem("call_china_admin_token"))
      );
    };

    window.addEventListener("call-china-auth-change", handleAuthChange);

    return () => {
      window.removeEventListener("call-china-auth-change", handleAuthChange);
    };
  }, []);

  if (checkingAuth) {
    return <div className="auth-loading">Checking admin access...</div>;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/" replace />
          ) : (
            <Login onLogin={() => setIsAuthenticated(true)} />
          )
        }
      />

      <Route
        element={
          isAuthenticated ? (
            <ProtectedLayout />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/calls" element={<CallHistory />} />

        <Route path="/calls/:id" element={<CallDetails />} />
        <Route path="/leads" element={<Leads />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />}
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
