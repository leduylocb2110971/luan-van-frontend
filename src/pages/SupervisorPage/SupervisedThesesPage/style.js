import styled from "styled-components";

// Wrapper toàn trang
export const PageWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

// Tiêu đề
export const Title = styled.h2`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #222;
`;

// Danh sách luận văn
export const ThesisList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

// Card luận văn
export const ThesisCard = styled.div`
  background: #fff;
  border-radius: 12px;
  border: 1px solid #eee;
  padding: 16px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
`;

// Layout card: 2 cột
export const CardLayout = styled.div`
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
`;

// Thumbnail
export const Thumbnail = styled.img`
  width: 120px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #ddd;
  
`;

// Nội dung bên phải
export const ThesisContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

// Header (title + status)
export const ThesisHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
`;

export const ThesisTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #333;
`;

// Metadata
export const MetaRow = styled.div`
  margin-top: 8px;
  font-size: 14px;
  color: #555;
  line-height: 1.6;
  display: flex; gap: 24px;
  flex-wrap: wrap; /* Đảm bảo không tràn card */
  gap: 16px;       /* Khoảng cách giữa các item */
`;

export const MetaItem = styled.p`
  margin: 0 0 4px;
  white-space: nowrap; /* Tránh bị xuống dòng giữa chừng */
`;

// Thống kê
export const StatsRow = styled.div`
  margin-top: 8px;
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #666;
`;

// Hàng button
export const ButtonRow = styled.div`
  margin-top: 16px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;
