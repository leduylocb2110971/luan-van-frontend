import styled from "styled-components";

export const Wrapper = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
`;

export const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;

  h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
    color: #1f2937;
    display: flex;
    align-items: center;
    gap: 10px;
  }
`;

export const FavoriteList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const FavoriteCard = styled.div`
  display: flex;
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #f0f0f0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  
  /* Nếu là item đã xóa thì làm mờ đi */
  opacity: ${props => props.$isDeleted ? 0.7 : 1};
  background-color: ${props => props.$isDeleted ? '#fff1f0' : '#fff'};

  &:hover {
    transform: ${props => props.$isDeleted ? 'none' : 'translateY(-4px)'};
    box-shadow: ${props => props.$isDeleted ? 'none' : '0 12px 20px -8px rgba(0, 0, 0, 0.08)'};
    border-color: ${props => props.$isDeleted ? '#ffccc7' : '#e5e7eb'};
  }

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const ThumbnailWrapper = styled.div`
  flex-shrink: 0;
  width: 180px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 20px;
  background-color: #f3f4f6;
  position: relative;
  cursor: pointer;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  ${FavoriteCard}:hover img {
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    width: 100%;
    height: 200px;
    margin-right: 0;
    margin-bottom: 16px;
  }
`;

export const ContentWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

export const TitleStyled = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
  cursor: pointer;
  line-height: 1.4;
  
  &:hover {
    color: #2563eb;
  }
`;

export const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 15px;
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 10px;

  .item {
    display: flex;
    align-items: center;
    gap: 6px;
  }
`;

export const Abstract = styled.p`
  font-size: 14px;
  color: #4b5563;
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const ActionsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  gap: 10px;
  margin-left: 16px;
  padding-left: 16px;
  border-left: 1px solid #f3f4f6;
  min-width: 120px;

  @media (max-width: 768px) {
    flex-direction: row;
    margin-left: 0;
    padding-left: 0;
    border-left: none;
    border-top: 1px solid #f3f4f6;
    padding-top: 12px;
    margin-top: 12px;
    justify-content: space-between;
    align-items: center;
  }
`;

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  background: #fff;
  border-radius: 12px;
  border: 1px dashed #d9d9d9;
  
  img {
    height: 160px;
    margin-bottom: 20px;
  }
`;