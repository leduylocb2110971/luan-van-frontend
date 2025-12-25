// MessageStyles.js
import { createGlobalStyle } from "styled-components";

const MessageStyles = createGlobalStyle`
  .ant-message {
    top: 20px !important;
  }

  .ant-message-notice-content {
    padding: 0 !important;
    border-radius: 10px;
    overflow: hidden;
    animation: fadeIn 0.25s ease-out;
    min-width: 260px;
    box-shadow: 0 8px 20px rgba(0,0,0,0.18);
  }

  .ant-message-custom-content {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 18px;
    font-size: 15px;
    font-weight: 500;
  }

  /* ICON luôn rõ ràng */
  .ant-message-custom-content .anticon {
    font-size: 20px;
  }

  /* ======= SUCCESS ======= */
  .ant-message-success .ant-message-custom-content {
    background: #e7f8ed; /* xanh nhẹ */
    color: #166534 !important; /* xanh đậm */
  }
  .ant-message-success .ant-message-custom-content .anticon {
    color: #16a34a !important;
  }

  /* ======= ERROR ======= */
  .ant-message-error .ant-message-custom-content {
    background: #fde6e6; /* đỏ nhạt */
    color: #991b1b !important; /* đỏ đậm */
  }
  .ant-message-error .ant-message-custom-content .anticon {
    color: #dc2626 !important;
  }

  /* ======= WARNING ======= */
  .ant-message-warning .ant-message-custom-content {
    background: #fff7e5; /* vàng nhạt */
    color: #b45309 !important; /* vàng đậm */
  }
  .ant-message-warning .ant-message-custom-content .anticon {
    color: #d97706 !important;
  }

  /* ======= INFO ======= */
  .ant-message-info .ant-message-custom-content {
    background: #e8f0ff; /* xanh dương nhạt */
    color: #1e40af !important; /* xanh đậm */
  }
  .ant-message-info .ant-message-custom-content .anticon {
    color: #2563eb !important;
  }

  /* animation */
  @keyframes fadeIn {
    0% { opacity: 0; transform: translateY(-6px); }
    100% { opacity: 1; transform: translateY(0); }
  }
`;

export default MessageStyles;
