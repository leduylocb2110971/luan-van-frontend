import styled from 'styled-components';

export const AuthWrapper = styled.div`
  background-color: #e5e7eb;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 40px 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    justify-content: center;
    gap: 40px;
  }
`;