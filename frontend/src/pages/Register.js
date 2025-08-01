import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../context/AuthContext";
import Loading from "../components/common/Loading";
import ErrorBoundary from "../components/common/ErrorBoundary";

const RegisterContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const RegisterCard = styled.div`
  background: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 28px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin-bottom: 5px;
  color: #555;
  font-weight: 500;
`;

const Input = styled.input`
  padding: 12px;
  border: 2px solid #e1e1e1;
  border-radius: 5px;
  font-size: 16px;
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: #007bff;
  }

  &:invalid {
    border-color: #dc3545;
  }
`;

const Select = styled.select`
  padding: 12px;
  border: 2px solid #e1e1e1;
  border-radius: 5px;
  font-size: 16px;
  transition: border-color 0.3s;
  background-color: white;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const Button = styled.button`
  background: #28a745;
  color: white;
  padding: 12px;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover:not(:disabled) {
    background: #218838;
  }

  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
  }
`;

const LinkContainer = styled.div`
  text-align: center;
  margin-top: 20px;
`;

const StyledLink = styled(Link)`
  color: #007bff;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const Register = () => {
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    rol: "empleado",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (userData.password !== userData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setIsLoading(true);

    const { confirmPassword, ...registrationData } = userData;
    const result = await register(registrationData);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.message);
    }

    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <RegisterContainer>
        <RegisterCard>
          <Loading text="Registrando usuario..." />
        </RegisterCard>
      </RegisterContainer>
    );
  }

  return (
    <RegisterContainer>
      <RegisterCard>
        <Title>Registrarse</Title>

        <ErrorBoundary error={error} />

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label htmlFor="username">Usuario</Label>
            <Input
              type="text"
              id="username"
              name="username"
              value={userData.username}
              onChange={handleChange}
              required
              minLength={3}
              maxLength={50}
              pattern="[a-zA-Z0-9_]+"
              title="Solo letras, números y guiones bajos"
            />
          </InputGroup>

          <InputGroup>
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={userData.email}
              onChange={handleChange}
              required
            />
          </InputGroup>

          <InputGroup>
            <Label htmlFor="password">Contraseña</Label>
            <Input
              type="password"
              id="password"
              name="password"
              value={userData.password}
              onChange={handleChange}
              required
              minLength={6}
              title="Mínimo 6 caracteres"
            />
          </InputGroup>

          <InputGroup>
            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
            <Input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={userData.confirmPassword}
              onChange={handleChange}
              required
            />
          </InputGroup>

          <InputGroup>
            <Label htmlFor="rol">Rol</Label>
            <Select
              id="rol"
              name="rol"
              value={userData.rol}
              onChange={handleChange}
            >
              <option value="empleado">Empleado</option>
              <option value="administrador">Administrador</option>
            </Select>
          </InputGroup>

          <Button type="submit" disabled={isLoading}>
            Registrarse
          </Button>
        </Form>

        <LinkContainer>
          ¿Ya tienes cuenta? <StyledLink to="/login">Iniciar Sesión</StyledLink>
        </LinkContainer>
      </RegisterCard>
    </RegisterContainer>
  );
};

export default Register;
