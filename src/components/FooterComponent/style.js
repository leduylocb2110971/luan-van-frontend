// style.js
import styled from "styled-components";

export const FooterWrapper = styled.footer`
  background: linear-gradient(135deg, #0072ff, #00c6ff);
  color: #fff;
  padding: 40px 20px 20px;
`;

export const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 32px;
`;

export const FooterColumn = styled.div`
  h3, h4 {
    margin-bottom: 12px;
    font-weight: 600;
    color: #fff;
  }

  p {
    margin: 4px 0;
    font-size: 14px;
    opacity: 0.85;
  }
`;

export const FooterLink = styled.a`
  display: block;
  margin: 4px 0;
  font-size: 14px;
  color: #d9d9d9;
  transition: color 0.3s ease;

  &:hover {
    color: #40a9ff;
  }
`;
