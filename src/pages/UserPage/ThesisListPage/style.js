import styled from "styled-components";

export const Wrapper = styled.div`
  padding: 24px;
`;

export const Thumbnail = styled.img`
  width: 100%;
  max-width: 150px;
  height: auto;
  object-fit: cover;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
`;

export const TitleStyled = styled.h4`
  margin-bottom: 8px;
  color: #0f172a;
  font-size: 17px;
  cursor: pointer;
  font-weight: 600;

  &:hover {
    color: #2563eb;
  }
`;

export const InfoText = styled.span`
  color: #6b7280;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const StatsRow = styled.div`
  display: flex;
  gap: 18px;
  margin-top: 8px;
  flex-wrap: wrap;
`;

export const Stat = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  color: #475569;
  font-size: 14px;
`;

export const FileTypeTag = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 500;
  background: #e2e8f0;
  color: #1e293b;

  svg {
    font-size: 16px;
    color: ${props =>
      props.children && props.children.includes("pdf") ? "#dc2626" : "#1e40af"};
  }
`;

export const CardModern = {
  borderRadius: 12,
  padding: 8,
  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  border: "none",
  background: "#ffffff"
};
