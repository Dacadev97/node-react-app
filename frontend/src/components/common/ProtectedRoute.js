import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Loading from "./Loading";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loading text="Verificando permisos..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin()) {
    return (
      <div
        style={{
          padding: "20px",
          textAlign: "center",
          backgroundColor: "#f8d7da",
          color: "#721c24",
          borderRadius: "4px",
          margin: "20px",
        }}
      >
        <h3>Acceso Denegado</h3>
        <p>No tienes permisos para acceder a esta página.</p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
