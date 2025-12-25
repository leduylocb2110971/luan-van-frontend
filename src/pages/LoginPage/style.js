// style.js
import styled from "styled-components";

export const AuthWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #e6f7ff 0%, #ffffff 100%);
  padding: 24px;

  .auth-container {
    display: flex;
    align-items: center;
    gap: 40px;
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
    padding: 32px;
  }

  .auth-illustration {
    flex: 1;
    display: none; /* ẩn trên mobile */
  }

  .auth-form {
    flex: 1;
    max-width: 420px;
  }

  @media (min-width: 768px) {
    .auth-illustration {
      display: block;
    }
  }
`;
