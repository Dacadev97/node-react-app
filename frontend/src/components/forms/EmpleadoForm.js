import React, { useState, useEffect } from "react";
import styled from "styled-components";

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
  padding: 10px;
  border: 2px solid #e1e1e1;
  border-radius: 5px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #007bff;
  }

  &:invalid {
    border-color: #dc3545;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;

  ${(props) =>
    props.variant === "primary"
      ? `
    background: #007bff;
    color: white;
    &:hover { background: #0056b3; }
  `
      : `
    background: #6c757d;
    color: white;
    &:hover { background: #545b62; }
  `}

  &:disabled {
    background: #e9ecef;
    color: #6c757d;
    cursor: not-allowed;
  }
`;

const EmpleadoForm = ({ empleado, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    fecha_ingreso: "",
    salario: "",
    activo: true,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (empleado) {
      setFormData({
        nombre: empleado.nombre || "",
        fecha_ingreso: empleado.fecha_ingreso || "",
        salario: empleado.salario || "",
        activo: empleado.activo !== undefined ? empleado.activo : true,
      });
    }
  }, [empleado]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const submitData = {
        ...formData,
        salario: formData.salario ? parseFloat(formData.salario) : null,
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error("Error al enviar formulario:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <InputGroup>
        <Label htmlFor="nombre">Nombre *</Label>
        <Input
          type="text"
          id="nombre"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          required
          maxLength={100}
        />
      </InputGroup>

      <InputGroup>
        <Label htmlFor="fecha_ingreso">Fecha de Ingreso *</Label>
        <Input
          type="date"
          id="fecha_ingreso"
          name="fecha_ingreso"
          value={formData.fecha_ingreso}
          onChange={handleChange}
          required
        />
      </InputGroup>

      <InputGroup>
        <Label htmlFor="salario">Salario</Label>
        <Input
          type="number"
          id="salario"
          name="salario"
          value={formData.salario}
          onChange={handleChange}
          min="0"
          step="0.01"
          placeholder="Opcional"
        />
      </InputGroup>

      {empleado && (
        <InputGroup>
          <Label>
            <input
              type="checkbox"
              name="activo"
              checked={formData.activo}
              onChange={handleChange}
              style={{ marginRight: "5px" }}
            />
            Empleado activo
          </Label>
        </InputGroup>
      )}

      <ButtonGroup>
        <Button type="button" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? "Guardando..." : empleado ? "Actualizar" : "Crear"}
        </Button>
      </ButtonGroup>
    </Form>
  );
};

export default EmpleadoForm;
