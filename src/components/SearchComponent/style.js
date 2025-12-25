import styled from "styled-components";
import { Input, Button } from "antd";

export const SearchWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
`;

export const StyledInput = styled(Input)`
  font-size: 1rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  transition: all 0.2s ease-in-out;

  &:focus {
    box-shadow: 0 0 0 2px #93c5fd;
    border-color: #2563eb;
  }
`;

export const StyledButton = styled(Button)`
  border-radius: 25px;
  padding: 0 20px;
  height: 40px;
  background: #2563eb;
  font-weight: 600;
  transition: background 0.2s ease;

  &:hover {
    background: #1d4ed8 !important;
  }
`;
