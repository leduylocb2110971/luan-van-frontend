import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  Row,
  Col,
  Typography,
  Space,
  Divider,
  message
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  ReadOutlined,
  BankOutlined,
  IdcardOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  SolutionOutlined
} from "@ant-design/icons";

const { Title } = Typography;

const UserInfoForm = ({ user, departments = [], majors = [], onUpdate }) => {
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);

  // Theo dõi giá trị department để lọc major tương ứng theo thời gian thực
  const selectedDepartment = Form.useWatch("department", form);

  // Khởi tạo dữ liệu ban đầu
  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        phone: user.phone,
        // Xử lý trường hợp department/major là object hoặc id
        department: user.department?._id || user.department,
        major: user.major?._id || user.major,
        mssv: user.mssv,
        staffId: user.staffId,
      });
    }
  }, [user, form]);

  const handleCancel = () => {
    form.resetFields(); // Reset về giá trị ban đầu (từ useEffect trên)
    setIsEditing(false);
  };

  const handleFinish = (values) => {
    // Làm sạch dữ liệu thừa dựa trên role
    const dataToUpdate = { ...values };
    if (user?.role !== "student") delete dataToUpdate.mssv;
    if (user?.role !== "lecturer") delete dataToUpdate.staffId;

    onUpdate && onUpdate(dataToUpdate);
    setIsEditing(false);
    message.success("Thông tin đã được cập nhật!");
  };

  // Logic lọc ngành: Chỉ hiển thị ngành thuộc khoa đã chọn
  const filteredMajors = majors.filter((major) => {
    if (!selectedDepartment) return true; // Nếu chưa chọn khoa thì hiện hết (hoặc ẩn tùy logic)
    return major.category === selectedDepartment;
  });

  return (
    <Card
      style={{
        width: "100%",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)", // Đổ bóng nhẹ hiện đại
        borderRadius: "12px",
      }}
      title={
        <Space>
          <UserOutlined style={{ color: "#1890ff" }} />
          <span style={{ fontSize: 16, fontWeight: 600 }}>Thông tin cá nhân</span>
        </Space>
      }
      extra={
        !isEditing ? (
          <Button
            type="text"
            icon={<EditOutlined />}
            style={{ color: "#1890ff" }}
            onClick={() => setIsEditing(true)}
          >
            Chỉnh sửa
          </Button>
        ) : null
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        disabled={!isEditing} // Tính năng cực hay của AntD: Disable toàn form khi không edit
        requiredMark={isEditing ? "optional" : false} // Ẩn dấu sao khi chỉ xem
      >
        <Row gutter={24}>
          {/* Cột 1 */}
          <Col xs={24} md={12}>
            <Form.Item
              label="Họ và tên"
              name="name"
              rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
            >
              <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Nhập họ tên" />
            </Form.Item>
          </Col>

          {/* Cột 2 */}
          <Col xs={24} md={12}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập email" },
                { type: "email", message: "Email không hợp lệ" },
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="Nhập email" />
            </Form.Item>
          </Col>

          {/* Cột 3 */}
          <Col xs={24} md={12}>
            <Form.Item
              label="Số điện thoại"
              name="phone"
              rules={[{ message: "Vui lòng nhập SĐT" }]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại" />
            </Form.Item>
          </Col>

          {/* Các trường dành cho Sinh viên / Giảng viên */}
          {(user?.role === "student" || user?.role === "lecturer") && (
            <Col xs={24} md={12}>
              <Form.Item
                label="Khoa / Đơn vị"
                name="department"
                rules={[{ required: true, message: "Vui lòng chọn khoa" }]}
              >
                <Select
                  placeholder="Chọn Khoa"
                  suffixIcon={<BankOutlined />}
                  // Khi đổi khoa, reset chuyên ngành để tránh dữ liệu rác
                  onChange={() => form.setFieldValue("major", null)} 
                  options={departments.map((d) => ({ label: d.name, value: d._id }))}
                />
              </Form.Item>
            </Col>
          )}

          {user?.role === "student" && (
            <Col xs={24} md={12}>
              <Form.Item
                label="Chuyên ngành"
                name="major"
                rules={[{ required: true, message: "Vui lòng chọn chuyên ngành" }]}
              >
                <Select
                  placeholder="Chọn chuyên ngành"
                  suffixIcon={<ReadOutlined />}
                  options={filteredMajors.map((m) => ({ label: m.name, value: m._id }))}
                  // Disable nếu chưa chọn khoa (UX tốt hơn)
                  disabled={!selectedDepartment && isEditing} 
                />
              </Form.Item>
            </Col>
          )}

          {/* Mã số định danh */}
          {user?.role === "student" && (
            <Col xs={24} md={12}>
              <Form.Item label="Mã số sinh viên (MSSV)" name="mssv">
                <Input prefix={<IdcardOutlined />} 
                // disabled={true} 
                /> 
                {/* Thường MSSV không cho sửa */}
              </Form.Item>
            </Col>
          )}

          {user?.role === "lecturer" && (
            <Col xs={24} md={12}>
              <Form.Item label="Mã cán bộ" name="staffId">
                <Input prefix={<SolutionOutlined />} disabled={true} />
              </Form.Item>
            </Col>
          )}
        </Row>

        {/* Nút hành động */}
        {isEditing && (
          <>
            <Divider style={{ margin: "12px 0 24px 0" }} />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <Button icon={<CloseOutlined />} onClick={handleCancel}>
                Hủy bỏ
              </Button>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                Lưu thay đổi
              </Button>
            </div>
          </>
        )}
      </Form>
    </Card>
  );
};

export default UserInfoForm;