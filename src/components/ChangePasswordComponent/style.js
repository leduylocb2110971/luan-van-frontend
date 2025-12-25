import styled from "styled-components";

export const Container = styled.div`
  margin: 20px auto;
  padding: 24px 32px;
  background: #fff;
  
  display: flex;
  flex-direction: column;
`;

export const StyledInput = styled.input`
  padding: 10px 14px;
  margin-bottom: 16px;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  outline-offset: 2px;
  transition: border-color 0.3s;

  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 8px rgb(59 130 246 / 0.5);
  }
`;

export const StyledPasswordInput = styled.input.attrs({ type: "password" })`
  padding: 10px 14px;
  margin-bottom: 16px;
  font-size: 1rem;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  outline-offset: 2px;
  transition: border-color 0.3s;

  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 8px rgb(59 130 246 / 0.5);
  }
`;

export const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`;

export const StyledButton = styled.button`
  background: linear-gradient(90deg, #2563eb, #3b82f6);
  border: none;
  color: #fff;
  font-weight: 700;
  font-size: 1rem;
  padding: 12px 24px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover:not(:disabled) {
    background: linear-gradient(90deg, #1e40af, #2563eb);
  }

  &:disabled {
    background: #a5b4fc;
    cursor: not-allowed;
  }
`;

export const ErrorMessage = styled.div`
  color: #ef4444;
  margin-bottom: 12px;
  font-size: 0.9rem;
  font-weight: 600;
`;

export const ToggleIcon = styled.div`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #9ca3af;
  font-size: 18px;
  user-select: none;
  transition: color 0.3s;

  &:hover {
    color: #3b82f6;
  }
`;
export const InputWrapper = styled.div`
  position: relative;
  margin-bottom: 16px;
`;
export const SuccessMessage = styled.div`
  color: #22c55e;
  margin-bottom: 12px;
  font-weight: 600;
`;
