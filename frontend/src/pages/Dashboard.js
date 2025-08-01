import React from "react";
import styled from "styled-components";
import { useAuth } from "../context/AuthContext";
import { useDashboardStats } from "../hooks/useDashboardStats";
import Navbar from "../components/common/Navbar";
import Loading from "../components/common/Loading";

const DashboardContainer = styled.div`
  min-height: 100vh;
  background-color: #f8f9fa;
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const WelcomeSection = styled.div`
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
`;

const WelcomeTitle = styled.h1`
  color: #333;
  margin-bottom: 10px;
`;

const WelcomeSubtitle = styled.p`
  color: #666;
  font-size: 18px;
  margin: 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 36px;
  font-weight: bold;
  color: #007bff;
  margin-bottom: 10px;
`;

const StatLabel = styled.div`
  color: #666;
  font-size: 16px;
`;

const QuickActions = styled.div`
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const QuickActionsTitle = styled.h3`
  color: #333;
  margin-bottom: 20px;
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
`;

const ActionButton = styled.button`
  background: #007bff;
  color: white;
  padding: 15px 20px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background: #0056b3;
  }
`;

const AdminSection = styled.div`
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
  padding: 20px;
  border-radius: 10px;
  margin-top: 20px;
  text-align: center;
`;

const ErrorMessage = styled.div`
  background-color: #f8d7da;
  color: #721c24;
  padding: 15px;
  border-radius: 5px;
  margin: 20px 0;
  border: 1px solid #f5c6cb;

  button {
    background-color: #dc3545;
    color: white;
    border: none;
    padding: 5px 10px;
    margin-left: 10px;
    border-radius: 3px;
    cursor: pointer;

    &:hover {
      background-color: #c82333;
    }
  }
`;

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const { stats, loading, error } = useDashboardStats();

  if (loading) {
    return (
      <DashboardContainer>
        <Navbar />
        <Content>
          <Loading text="Cargando estadísticas..." />
        </Content>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <Navbar />
      <Content>
        <WelcomeSection>
          <WelcomeTitle>¡Bienvenido, {user?.username}!</WelcomeTitle>
          <WelcomeSubtitle>
            Sistema de Gestión de Empleados y Solicitudes - Konecta
          </WelcomeSubtitle>
        </WelcomeSection>

        <StatsGrid>
          <StatCard>
            <StatNumber>{stats.empleadosActivos}</StatNumber>
            <StatLabel>Empleados Activos</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>{stats.empleadosInactivos}</StatNumber>
            <StatLabel>Empleados Inactivos</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>{stats.totalEmpleados}</StatNumber>
            <StatLabel>Total Empleados</StatLabel>
          </StatCard>
        </StatsGrid>

        {error && (
          <ErrorMessage>
            Error al cargar estadísticas: {error}
            <button onClick={() => window.location.reload()}>Reintentar</button>
          </ErrorMessage>
        )}

        <QuickActions>
          <QuickActionsTitle>Acciones Rápidas</QuickActionsTitle>
          <ActionGrid>
            <ActionButton onClick={() => (window.location.href = "/empleados")}>
              Ver Empleados
            </ActionButton>
            <ActionButton
              onClick={() => (window.location.href = "/solicitudes")}
            >
              Ver Solicitudes
            </ActionButton>
            {isAdmin() && (
              <>
                <ActionButton
                  onClick={() => (window.location.href = "/empleados/nuevo")}
                >
                  Crear Empleado
                </ActionButton>
                <ActionButton
                  onClick={() => (window.location.href = "/solicitudes/nueva")}
                >
                  Nueva Solicitud
                </ActionButton>
              </>
            )}
          </ActionGrid>
        </QuickActions>

        {isAdmin() && (
          <AdminSection>
            <h3>Panel de Administrador</h3>
            <p>
              Tienes permisos de administrador. Puedes gestionar empleados y
              solicitudes.
            </p>
          </AdminSection>
        )}
      </Content>
    </DashboardContainer>
  );
};

export default Dashboard;
