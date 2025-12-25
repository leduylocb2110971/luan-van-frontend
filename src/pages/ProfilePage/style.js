// src/pages/ProfilePage/ProfilePage.styles.js
import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  justify-content: center; /* Căn giữa theo chiều ngang */
`;

export const Sidebar = styled.div`
  width: 400px;
  background-color: #ffffff;
  padding: 2rem;
  box-shadow: 2px 0 6px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const Avatar = styled.img`
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #3b82f6;
  margin-bottom: 1rem;
`;

export const UserName = styled.div`
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 2rem;
  text-align: center;
`;

export const Menu = styled.div`
  width: auto;
`;

export const MenuItem = styled.button`
  width: 100%;
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  background-color: ${({ active }) => (active ? "#e0f2fe" : "transparent")};
  border: none;
  border-left: 4px solid ${({ active }) => (active ? "#3b82f6" : "transparent")};
  color: #374151;
  text-align: left;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  cursor: pointer;
}
`;

export const Main = styled.div`
  flex: 1;
  max-width: 800px;
`;

export const Card = styled.div`
  background-color: #ffffffff;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`;

export const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1.5rem;
`;
