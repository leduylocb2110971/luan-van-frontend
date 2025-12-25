import styled from "styled-components";
import { Upload, Form, Button, Input } from "antd";

export const UploadContainer = styled.div`
  max-width: 650px;
  margin: 24px auto;
  padding: 28px 32px;
  background: #fff;
  border-radius: 14px;
  overflow: hidden; 
  box-shadow: 0 8px 24px rgb(0 0 0 / 0.1);
`;

export const StyledDragger = styled(Upload.Dragger)`
  border-radius: 14px !important; /* Trùng với container */
  border: 2.5px dashed #1890ff !important;
  background-color: #f0f7ff !important;
  padding: 32px 16px !important;
  box-sizing: border-box !important;

  display: flex !important;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;

  .ant-upload-drag-icon {
    font-size: 52px;
    color: #1890ff;
    margin-bottom: 12px;
  }

  p {
    font-size: 17px;
    color: #3a3a3a;
    font-weight: 600;
    margin: 0;
  }
`;


export const ExtractButton = styled(Button)`
  margin-top: 24px;
  width: 100%;
  font-weight: 700;
  border-radius: 10px;
  height: 44px;

  &:hover,
  &:focus {
    background: linear-gradient(90deg, #155db2, #1e7ef4);
    border-color: #155db2;
    color: #fff;
  }
`;

export const StyledForm = styled(Form)`
  margin-top: 36px;

  .ant-form-item-label > label {
    font-weight: 600;
    font-size: 15px;
  }

  .ant-input {
    height: 42px;
    font-size: 15px;
    border-radius: 8px;
    border-color: #d9d9d9;
    transition: all 0.3s ease;

    &:focus {
      border-color: #1890ff;
      box-shadow: 0 0 8px rgb(24 144 255 / 0.3);
    }
  }

  .ant-form-item {
    margin-bottom: 20px;
  }

  .ant-btn-primary {
    font-weight: 700;
    border-radius: 10px;
    height: 46px;
    font-size: 16px;
  }
`;
