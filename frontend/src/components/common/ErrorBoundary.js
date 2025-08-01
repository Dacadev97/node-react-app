import styled from "styled-components";

const ErrorContainer = styled.div`
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
  padding: 15px;
  border-radius: 4px;
  margin: 10px 0;
`;

const ErrorTitle = styled.h4`
  margin: 0 0 10px 0;
  font-size: 16px;
`;

const ErrorMessage = styled.p`
  margin: 0;
  font-size: 14px;
`;

const ErrorBoundary = ({ error, title = "Error", onRetry }) => {
  if (!error) return null;

  return (
    <ErrorContainer>
      <ErrorTitle>{title}</ErrorTitle>
      <ErrorMessage>
        {typeof error === "string"
          ? error
          : error.message || "Ha ocurrido un error inesperado"}
      </ErrorMessage>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            marginTop: "10px",
            padding: "5px 10px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Reintentar
        </button>
      )}
    </ErrorContainer>
  );
};

export default ErrorBoundary;
