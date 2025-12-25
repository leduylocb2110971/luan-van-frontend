import styled from "styled-components";

export const Container = styled.div`
  margin: 0 auto;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

export const AvatarWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 20px;
`;

export const AvatarImage = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #ddd;
`;

export const Button = styled.button`
  margin-top: 10px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background-color: ${({ primary, danger }) =>
    primary ? "#4caf50" : danger ? "#f44336" : "#eee"};
  color: ${({ primary, danger }) => (primary || danger ? "#fff" : "#333")};
  transition: all 0.2s ease-in-out;

  &:hover {
    opacity: 0.9;
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
`;

export const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const Label = styled.label`
  font-weight: 500;
  color: #333;
`;

export const Input = styled.input`
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  background-color: ${({ readOnly }) => (readOnly ? "#f3f4f6" : "#fff")};
  transition: border 0.2s ease;

  &:focus {
    border-color: #4caf50;
    outline: none;
  }
`;

export const ActionList = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 15px;
`;

export const ActionItem = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: #ddd;
  cursor: pointer;
  &:hover {
    background: #ccc;
  }
`;

export const SaveButton = styled(ActionItem)`
  background: #4caf50;
  color: #fff;
  &:hover {
    background: #43a047;
  }
`;
