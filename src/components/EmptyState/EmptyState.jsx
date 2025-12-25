import React from "react";
import { Empty, Button } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import styled, { keyframes } from "styled-components";

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
`;

const IconWrapper = styled.div`
  font-size: 80px;
  color: #fa541c; // cam đỏ nổi bật
  animation: ${bounce} 1.5s infinite;
`;

const GradientButton = styled(Button)`
  background: linear-gradient(90deg, #1890ff, #73d13d);
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
`;

const EmptyState = ({
  message = "Chưa có dữ liệu",
  onAction,
  actionLabel = "Tạo mới",
}) => {
  return (
    <Empty
      image={<IconWrapper><DeleteOutlined /></IconWrapper>}
      description={
        <span style={{ fontSize: "20px", fontWeight: 600, color: "#555" }}>
          {message}
        </span>
      }
    >
      {onAction && (
        <GradientButton type="primary" size="large" onClick={onAction}>
          {actionLabel}
        </GradientButton>
      )}
    </Empty>
  );
};

export default EmptyState;
