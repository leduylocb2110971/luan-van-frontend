import { Form, Input, Checkbox, Card, Divider } from "antd";
import { MailOutlined, LockOutlined, UserOutlined } from "@ant-design/icons";
import ButtonComponent from "../ButtonComponent/ButtonComponent";
import GoogleLoginButtonComponent from "../GoogleLoginButtonComponent/GoogleLoginButtonComponent";
import { useNavigate } from "react-router-dom";

const LoginForm = ({ onSubmit, isPending }) => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const email = Form.useWatch("email", form);
  const password = Form.useWatch("password", form);

  const handleSubmit = (values) => {
    if (values.remember) {
      localStorage.setItem("email", values.email);
    } else {
      localStorage.removeItem("email");
    }
    onSubmit({
      email: values.email,
      password: values.password,
    });
  };

  return (
    <Card
      style={{
        maxWidth: 420,
        margin: "40px auto",
        padding: "32px 24px",
        borderRadius: "16px",
        boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
        background: "linear-gradient(145deg, #f0faff, #ffffff)",
      }}
    >
      {/* Avatar */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
        <img
          src="/src/assets/user-login.jpg"
          alt="User Avatar"
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            objectFit: "cover",
            border: "3px solid #1890ff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        />
      </div>

      {/* Title */}
      <h2
        style={{
          textAlign: "center",
          marginBottom: 24,
          fontWeight: 600,
          color: "#1890ff",
        }}
      >
        Đăng nhập
      </h2>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          email: localStorage.getItem("email") || "",
          remember: true,
        }}
        onFinish={handleSubmit}
        autoComplete="off"
        style={{ rowGap: 12 }}
      >
        <Form.Item
          label="Email"
          name="email"
          hasFeedback
          rules={[
            { required: true, message: "Vui lòng nhập email!" },
            { type: "email", message: "Email không hợp lệ!" },
          ]}
          style={{ marginBottom: 12 }}
        >
          <Input
            placeholder="Email"
            autoComplete="username"
            prefix={<MailOutlined />}
            allowClear
          />
        </Form.Item>

        <Form.Item
          label="Mật khẩu"
          name="password"
          hasFeedback
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu!" },
            { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
            { max: 20, message: "Mật khẩu không được quá 20 ký tự!" },
          ]}
          style={{ marginBottom: 12 }}
        >
          <Input.Password
            placeholder="Password"
            prefix={<LockOutlined />}
            autoComplete="current-password"
          />
        </Form.Item>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox>Ghi nhớ tôi</Checkbox>
          </Form.Item>

          <span
            style={{
              color: "#1890ff",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            Quên mật khẩu?
          </span>
        </div>
        <Form.Item style={{ marginBottom: 16 }}>
          <ButtonComponent
            type="primary"
            htmlType="submit"
            size="large"
            loading={isPending}
            disabled={!email || !password}
            styleButton={{
              width: "100%",
              fontWeight: 600,
              borderRadius: "8px",
              background: "linear-gradient(90deg, #1890ff, #40a9ff)",
              boxShadow: "0 4px 12px rgba(24, 144, 255, 0.4)",
            }}
          >
            Đăng nhập
          </ButtonComponent>
        </Form.Item>
        <Divider plain>Hoặc</Divider>
        <GoogleLoginButtonComponent />

        <div style={{ textAlign: "center", fontSize: 14 }}>
          Bạn chưa có tài khoản?{" "}
          <span
            style={{ color: "#1890ff", cursor: "pointer", fontWeight: 500 }}
            onClick={() => navigate("/register")}
          >
            Đăng ký ngay
          </span>
        </div>
      </Form>
    </Card>
  );
};

export default LoginForm;
