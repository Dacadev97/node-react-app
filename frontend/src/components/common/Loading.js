import styled from "styled-components";

const LoaderContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.p`
  margin-left: 10px;
  color: #666;
  font-size: 14px;
`;

const Loading = ({ text = "Cargando..." }) => {
  return (
    <LoaderContainer>
      <Spinner />
      <LoadingText>{text}</LoadingText>
    </LoaderContainer>
  );
};

export default Loading;
