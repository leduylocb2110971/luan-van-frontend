// style.js (ĐÃ CẬP NHẬT)
import styled from "styled-components";

// Sửa CSS tại đây để chuyển từ cột dọc sang lưới 2 cột
export const InfoSection = styled.div`
  display: grid; /* Sử dụng Grid layout */
  grid-template-columns: repeat(2, 1fr); /* Chia thành 2 cột có độ rộng bằng nhau */
  gap: 18px 24px; /* Khoảng cách hàng (18px) và cột (24px) */
  
  padding: 24px;
  background: #ffffff;
  border: none;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;

  /* Responsive Design: Trở lại 1 cột khi màn hình nhỏ */
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;


export const ActionList = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

export const Select = styled.select`
  line-height: 44px; /* Giữ chiều cao tương đương Input */
  padding: 0 16px; /* Padding ngang, không cần icon nên không cần padding trái lớn */
  height: 44px; /* Đảm bảo chiều cao cố định */
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  background: #f9fafb;
  font-size: 1rem; /* Giữ font chữ mặc định */
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
    background: #ffffff;
  }
`;

export const Option = styled.option`
  font-size: 1rem;
`;


export const ActionItem = styled.button`
  padding: 10px 18px;
  font-size: 0.95rem;
  font-weight: 600;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  background: #f3f4f6;
  color: #374151;
  transition: all 0.2s ease;

  &:hover {
    background: #e5e7eb;
    transform: translateY(-1px); /* Sửa hiệu ứng hover cho tự nhiên hơn */
  }
`;

export const SaveButton = styled.button`
  padding: 10px 18px; /* Thêm padding cho nút Lưu */
  font-weight: 600;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  background: linear-gradient(90deg, #3b82f6, #2563eb);
  color: white;
  transition: all 0.25s ease; 

  &:hover {
    background: linear-gradient(90deg, #2563eb, #1d4ed8);
    transform: scale(1.02); /* Giữ hiệu ứng scale nhỏ gọn */
  }
`;

export const FieldWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
`;

export const IconWrapper = styled.span`
  position: absolute;
  left: 14px;
  top: 50%;
  font-size: 18px; 
  color: #aa9cafff;
  transform: translateY(2px); /* Căn chỉnh icon xuống giữa Input/Select */
  pointer-events: none; /* Đảm bảo không chặn click */
`;

export const Label = styled.label`
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 6px;
`;

export const Input = styled.input`  
  line-height: 44px;
  padding: 0 16px 0 42px; /* Giữ padding trái cho Icon */
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  background: #f9fafb;
  height: 44px; /* Đảm bảo chiều cao cố định */
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
    background: #ffffff;
  }

  &:read-only {
    background: #f3f4f6;
    color: #6b7280;
    cursor: not-allowed;
  }
`;