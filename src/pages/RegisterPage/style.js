import styled from "styled-components";

export const AuthWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #e6f7ff 0%, #ffffff 100%);
  padding: 20px;

  @media (max-width: 768px) {
    padding: 10px;
  }
`;
