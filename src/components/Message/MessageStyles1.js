// MessageStyles.js
import { createGlobalStyle } from "styled-components";

const MessageStyles1 = createGlobalStyle`
  /* Container chung */
  .ant-message-notice-content {
    border-radius: 12px;
    padding: 14px 22px;
    font-size: 15px;
    font-weight: 500;
    box-shadow: 0 6px 18px rgba(0,0,0,0.12);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* Thành công */
  .ant-message-success {
    background: #e8f5e9;   /* xanh nhạt */
    color: #2e7d32;        /* text xanh đậm */
  }
  .ant-message-success .anticon {
    color: #4caf50;        /* icon xanh lá */
    font-size: 18px;
  }

  /* Lỗi */
  .ant-message-error {
    background: #ffebee;   /* đỏ nhạt */
    color: #c62828;
  }
  .ant-message-error .anticon {
    color: #f44336;
    font-size: 18px;
  }

  /* Cảnh báo */
  .ant-message-warning {
    background: #fff3e0;   /* cam nhạt */
    color: #ef6c00;
  }
  .ant-message-warning .anticon {
    color: #ff9800;
    font-size: 18px;
  }

  /* Info */
  .ant-message-info {
    background: #e3f2fd;   /* xanh dương nhạt */
    color: #1565c0;
  }
  .ant-message-info .anticon {
    color: #2196f3;
    font-size: 18px;
  }
`;

export default MessageStyles1;
