import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Loading from "./components/common/Loading";
import "./App.css";

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Empleados = lazy(() => import("./pages/Empleados"));
const Solicitudes = lazy(() => import("./pages/Solicitudes"));

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Suspense fallback={<Loading text="Cargando aplicación..." />}>
            <Routes>
              {/* Rutas públicas */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Rutas protegidas */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/empleados"
                element={
                  <ProtectedRoute>
                    <Empleados />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/solicitudes"
                element={
                  <ProtectedRoute>
                    <Solicitudes />
                  </ProtectedRoute>
                }
              />

              {/* Redirección por defecto */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Ruta 404 */}
              <Route
                path="*"
                element={
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100vh",
                      flexDirection: "column",
                      backgroundColor: "#f8f9fa",
                    }}
                  >
                    <h1>404 - Página no encontrada</h1>
                    <p>La página que buscas no existe.</p>
                    <a href="/dashboard" style={{ color: "#007bff" }}>
                      Volver al Dashboard
                    </a>
                  </div>
                }
              />
            </Routes>
          </Suspense>

          {/* Toast notifications */}
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
