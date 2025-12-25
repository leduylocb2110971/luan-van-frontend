import React, { useState } from "react";
import { Form, Input, Button, Card, message, Typography } from "antd";
import { LockOutlined, KeyOutlined, CheckCircleOutlined } from "@ant-design/icons";

const { Title } = Typography;

const ChangePasswordComponent = ({ onChangePassword }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Gọi API đổi pass từ props
      await onChangePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
        confirmNewPassword: values.confirmNewPassword,
      });
      
      message.success("Đổi mật khẩu thành công!");
      form.resetFields(); // Reset form sau khi thành công
    } catch (error) {
      // Nếu API trả về lỗi
      message.error(error.message || "Đổi mật khẩu thất bại, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title={
        <span>
          <KeyOutlined style={{ marginRight: 8, color: "#1890ff" }} />
          Đổi mật khẩu
        </span>
      }
      style={{
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        borderRadius: 12,
        width: "100%",
        maxWidth: 500, // Giới hạn chiều rộng cho đẹp
        margin: "0 auto", // Căn giữa
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
      >
        {/* 1. Mật khẩu cũ */}
        <Form.Item
          label="Mật khẩu hiện tại"
          name="oldPassword"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu hiện tại!" },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="site-form-item-icon" />}
            placeholder="Nhập mật khẩu cũ"
            size="large"
          />
        </Form.Item>

        {/* 2. Mật khẩu mới */}
        <Form.Item
          label="Mật khẩu mới"
          name="newPassword"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu mới!" },
            { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
          ]}
          hasFeedback // Hiển thị icon tick xanh khi nhập đúng
        >
          <Input.Password
            prefix={<LockOutlined className="site-form-item-icon" />}
            placeholder="Nhập mật khẩu mới"
            size="large"
          />
        </Form.Item>

        {/* 3. Xác nhận mật khẩu mới */}
        <Form.Item
          label="Xác nhận mật khẩu mới"
          name="confirmNewPassword"
          dependencies={['newPassword']}
          hasFeedback
          rules={[
            { required: true, message: "Vui lòng xác nhận mật khẩu!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<CheckCircleOutlined className="site-form-item-icon" />}
            placeholder="Nhập lại mật khẩu mới"
            size="large"
          />
        </Form.Item>

        {/* Nút Submit */}
        <Form.Item style={{ marginBottom: 0 }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            size="large"
            style={{
              borderRadius: 8,
              fontWeight: 600,
              marginTop: 10
            }}
          >
            Cập nhật mật khẩu
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ChangePasswordComponent;