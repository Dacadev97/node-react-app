import React from "react";
import styled from "styled-components";
import Navbar from "../components/common/Navbar";

const Container = styled.div`
  min-height: 100vh;
  background-color: #f8f9fa;
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  text-align: center;
`;

const FeatureList = styled.ul`
  text-align: left;
  max-width: 500px;
  margin: 20px auto;
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Solicitudes = () => {
  return (
    <Container>
      <Navbar />
      <Content>
        <h1>Gestión de Solicitudes</h1>
        <p>
          Esta funcionalidad está en desarrollo y estará disponible
          próximamente.
        </p>

        <h3>Características a implementar:</h3>
        <FeatureList>
          <li>Lista de solicitudes con paginación</li>
          <li>Formulario de creación/edición</li>
          <li>Filtros por empleado y estado</li>
          <li>Gestión de permisos por rol</li>
        </FeatureList>

        <p>Mientras tanto, puedes explorar la gestión de empleados.</p>
      </Content>
    </Container>
  );
};

export default Solicitudes;
