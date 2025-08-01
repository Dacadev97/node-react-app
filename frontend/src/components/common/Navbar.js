import React from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../../context/AuthContext";

const NavbarContainer = styled.nav`
  background-color: #007bff;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const NavbarContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
`;

const Logo = styled(Link)`
  color: white;
  text-decoration: none;
  font-size: 24px;
  font-weight: bold;

  &:hover {
    color: #e3f2fd;
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: white;
`;

const UserName = styled.span`
  font-weight: 500;
`;

const UserRole = styled.span`
  background-color: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  text-transform: uppercase;
`;

const LogoutButton = styled.button`
  background: none;
  border: 1px solid white;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: white;
    color: #007bff;
  }
`;

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <NavbarContainer>
      <NavbarContent>
        <Logo to="/dashboard">Konecta</Logo>

        <NavLinks>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/empleados">Empleados</NavLink>
          <NavLink to="/solicitudes">Solicitudes</NavLink>

          <UserInfo>
            <div>
              <UserName>{user?.username}</UserName>
              {user?.rol && <UserRole>{user.rol}</UserRole>}
            </div>
            <LogoutButton onClick={handleLogout}>Cerrar Sesión</LogoutButton>
          </UserInfo>
        </NavLinks>
      </NavbarContent>
    </NavbarContainer>
  );
};

export default Navbar;
