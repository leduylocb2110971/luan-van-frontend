// style.js
import styled from "styled-components";

export const HeaderWrapper = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  height: 72px;
  position: sticky;
  top: 0;
  z-index: 1000;

  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.4);

  box-shadow: 0 4px 18px rgba(0,0,0,0.08);
`;


export const Logo = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
`;

export const NavMenu = styled.nav`
  display: flex;
  gap: 12px;
  flex: 1;
  justify-content: center;
`;

export const NavItem = styled.div`
  padding: 8px 14px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 10px;
  transition: 0.25s ease;
  color: ${(p) => (p.$active ? "#0F62FE" : "#333")};
  background: ${(p) => (p.$active ? "rgba(15,98,254,0.12)" : "transparent")};

  &:hover {
    background: rgba(15, 98, 254, 0.12);
    color: #0F62FE;
  }
`;


export const AuthButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;

  button {
    border-radius: 10px;
    font-weight: 600;
    padding: 6px 16px;
    transition: 0.25s;

    &:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }
  }
`;


export const ExtraActions = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const IconButton = styled.div`
  cursor: pointer;
  font-size: 20px;
  color: #444;
  padding: 6px;
  margin-right: 20px
  border-radius: 10px;
  transition: 0.25s;

  &:hover {
    background: rgba(0,0,0,0.08);
  }
`;


export const PopupItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 6px;
  font-weight: 500;
  color: ${(props) => (props.$isSelected ? "#1890ff" : "#333")};
  background: ${(props) => (props.$isSelected ? "rgba(0,153,255,0.1)" : "transparent")};
  transition: 0.2s;

  &:hover {
    background: rgba(0,153,255,0.1);
  }
`;
