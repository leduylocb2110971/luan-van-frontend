import styled from "styled-components";

export const Wrapper = styled.div`
  padding: 24px;
`;

export const Thumbnail = styled.img`
  width: 100%;
  max-width: 150px;  // ảnh tối đa 120px
  height: auto;
  object-fit: cover; // giữ tỉ lệ
  border-radius: 8px;
`;

export const TitleStyled = styled.h4`
  margin-bottom: 8px;
  color: #1677ff;
  cursor: pointer;
  &:hover {
    color: #40a9ff;
    text-decoration: underline;
  }
`;

export const SpaceWrapper = styled.div`
  width: 100%;
`;

export const ViewCount = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const DownloadCount = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const FileTypeTag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  color: white;

  background-color: ${(props) =>
    props.children && props.children.includes("pdf") ? "#e74c3c" : "#1a5ea2ff"};

  svg {
    font-size: 16px;
  }
`;
