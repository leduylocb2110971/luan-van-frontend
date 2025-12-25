import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import { Form, Input, Radio, Card, Tooltip, Steps, Select, message } from "antd";
import { MailOutlined, LockOutlined, UserOutlined, QuestionCircleOutlined, IdcardOutlined, HomeOutlined } from "@ant-design/icons";
import ButtonComponent from "../ButtonComponent/ButtonComponent"; // Giả định component của bạn
import * as AuthService from "../../services/AuthService";
import * as CategoryService from "../../services/CategoryService";
import * as MajorService from "../../services/MajorService";

const MultiStepRegisterForm = ({ onSubmit, isPending }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [form] = Form.useForm();
  
  // Theo dõi vai trò để thay đổi nhãn
  const role = Form.useWatch("role", form); 

  const handleNext = async () => {
    try {
      // Xác thực chỉ các trường của bước hiện tại
      const values = await form.validateFields();
      
      // Lưu dữ liệu vào state tạm
      setFormData(prev => ({ ...prev, ...values }));
      
      // Chuyển sang bước kế tiếp
      setCurrentStep(currentStep + 1);

    } catch (error) {
      console.error('Validation failed:', error);
      // message.error('Vui lòng điền đủ và đúng các thông tin bắt buộc.');
    }
  };

  const handlePrev = () => {
    // Lưu dữ liệu hiện tại trước khi quay lại
    const values = form.getFieldsValue();
    setFormData(prev => ({ ...prev, ...values }));
    setCurrentStep(currentStep - 1);
  };

  const handleFinish = async () => {
    try {
      // Xác thực các trường của bước cuối cùng
      const finalValues = await form.validateFields();
      const finalData = { ...formData, ...finalValues };

      // Chuẩn bị payload cuối cùng
      const payload = {
        role: finalData.role,
        name: finalData.name,
        email: finalData.email,
        password: finalData.password,
        confirmPassword: finalData.confirmPassword,
        university: finalData.university,
        // Gán mã số định danh vào đúng trường backend
        [finalData.role === 'student' ? 'mssv' : 'staffId']: finalData.idNumber,
        department: finalData.department || null,
        major: finalData.major || null,
      };

      // Gửi dữ liệu đến prop onSubmit (hàm xử lý backend)
      onSubmit(payload);
      
      localStorage.setItem("email", finalData.email); // Lưu email để đăng nhập
      
    } catch (error) {
      console.error('Final form submission failed:', error);
      message.error('Vui lòng kiểm tra lại các trường thông tin cuối cùng.');
    }
  };
  
  // --- TÙY BIẾN NHÃN DỰA TRÊN VAI TRÒ ---
  const idLabel = role === 'student' ? "Mã số sinh viên (MSSV)" : "Mã số giảng viên";
  const idPlaceholder = role === 'student' ? "VD: B1912345" : "VD: 100000";
  // Gọi service lấy danh sách trường đại học
  const queryUniversities = useQuery({
    queryKey: ['universities'],
    queryFn: AuthService.getUniversities,
  });
  const universities = queryUniversities?.data?.data || [];
  console.log('Universities data:', universities);
  // Lấy toàn bộ khoa 
  const queryCategories = useQuery({
    queryKey: ['categories'],
    queryFn: CategoryService.getCategories,
  });
  const categories = queryCategories?.data?.data.map(cat => ({
    label: cat.name,
    value: cat._id,
  }));
  // Lấy danh sách ngành theo khoa đã chọn
  const selectedCategoryId = Form.useWatch('department', form);
  console.log('Selected Category ID:', selectedCategoryId);
  const queryMajors = useQuery({
    queryKey: ['majors', selectedCategoryId],
    queryFn: () => MajorService.getMajorsByCategoryId(selectedCategoryId),
    enabled: !!selectedCategoryId, // Chỉ gọi API khi có khoa được chọn
  });
  const majors = queryMajors?.data?.data.map(major => ({
    label: major.name,
    value: major._id,
  }));
  console.log('Majors data:', majors);

  const steps = [
    // -------------------------------------------------------------------
    // BƯỚC 1: XÁC ĐỊNH DANH TÍNH (BẮT BUỘC)
    // -------------------------------------------------------------------
    {
      title: 'Danh tính',
      content: (
        <>
          <Form.Item
            label="Vai trò"
            name="role"
            rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}
          >
            <Radio.Group buttonStyle="solid" style={{ width: "100%" }}>
              <Radio.Button value="student" style={{ width: "50%", textAlign: "center" }}>
                Sinh viên
              </Radio.Button>
              <Radio.Button value="lecturer" style={{ width: "50%", textAlign: "center" }}>
                Giảng viên 
                <Tooltip title="Quyền giảng viên sẽ được xét duyệt bởi quản trị viên sau khi đăng ký.">
                    <QuestionCircleOutlined style={{ color: "#1890ff", marginLeft: 8 }} />
                </Tooltip>
              </Radio.Button>
            </Radio.Group>
          </Form.Item>

          {/* <Form.Item
            label="Trường Đại học"
            name="university"
            rules={[{ required: true, message: "Vui lòng chọn trường!" }]}
            tooltip="Mã số định danh của bạn là duy nhất trong phạm vi trường."
          >
            <Select 
              placeholder="Chọn hoặc tìm kiếm trường" 
              options={universities}
              showSearch
              prefix={<HomeOutlined />}
            />
          </Form.Item> */}

          <Form.Item
            label="Tên"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
          >
            <Input
              placeholder="Nhập tên đầy đủ"
              prefix={<UserOutlined />}
              allowClear
            />
          </Form.Item>

          <Form.Item
            label={idLabel}
            name="idNumber"
            rules={[
                { required: true, message: `Vui lòng nhập ${idLabel}!` },
            ]}
          >
            <Input
              placeholder={idPlaceholder}
              prefix={<IdcardOutlined />}
              allowClear
            />
          </Form.Item>
        </>
      ),
      button: (
        <ButtonComponent 
          type="primary" 
          onClick={handleNext} 
          size="large"
          styleButton={{ width: "100%", fontWeight: 600 }}
        >
          Tiếp tục
        </ButtonComponent>
      )
    },
    // -------------------------------------------------------------------
    // BƯỚC 2: TẠO THÔNG TIN ĐĂNG NHẬP (BẮT BUỘC)
    // -------------------------------------------------------------------
    {
      title: 'Bảo mật',
      content: (
        <>
          <Form.Item
            label={
              <>
                Email{" "}
                <Tooltip title="Dùng email trường để dễ xác nhận">
                  <QuestionCircleOutlined style={{ color: "#1890ff" }} />
                </Tooltip>
              </>
            }
            name="email"
            hasFeedback
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input placeholder="Email" autoComplete="username" prefix={<MailOutlined />} allowClear />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            hasFeedback
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu!" },
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/,
                message: "Mật khẩu phải có chữ hoa, chữ thường và số!",
              },
            ]}
          >
            <Input.Password placeholder="Mật khẩu" prefix={<LockOutlined />} />
          </Form.Item>

          <Form.Item
            label="Nhập lại mật khẩu"
            name="confirmPassword"
            dependencies={["password"]}
            hasFeedback
            rules={[
              { required: true, message: "Vui lòng nhập lại mật khẩu!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Mật khẩu không khớp!"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Nhập lại mật khẩu" prefix={<LockOutlined />}/>
          </Form.Item>
        </>
      ),
      button: (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
            <ButtonComponent 
                onClick={handlePrev} 
                size="large"
                styleButton={{ width: "50%", fontWeight: 600 }}
            >
                Quay lại
            </ButtonComponent>
            <ButtonComponent 
                type="primary" 
                onClick={handleNext} 
                size="large"
                styleButton={{ width: "50%", fontWeight: 600 }}
            >
                Tiếp tục
            </ButtonComponent>
        </div>
      )
    },
    // -------------------------------------------------------------------
    // BƯỚC 3: THÔNG TIN HỌC THUẬT (TÙY CHỌN)
    // -------------------------------------------------------------------
    {
      title: 'Hồ sơ',
      content: (
        <>
          <p style={{ marginBottom: 20, color: '#999' }}>*Thông tin này không bắt buộc, bạn có thể bổ sung sau.</p>
          
          <Form.Item
            label="Khoa/Viện"
            name="department"
          >
            <Select 
              placeholder="Chọn hoặc tìm kiếm Khoa/Viện" 
              options={categories}
              showSearch
              onChange={() => { form.setFieldsValue({ major: undefined }); }} // Reset ngành khi đổi khoa
              prefix={<HomeOutlined />}
            />
          </Form.Item>

          {formData.role === 'student' && (
            <Form.Item
                label="Ngành học"
                name="major"
            >
                <Select 
                  placeholder="Chọn hoặc tìm kiếm Ngành học" 
                  options={majors}
                  showSearch
                />
            </Form.Item>
          )}

        </>
      ),
      button: (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
            <ButtonComponent 
                onClick={handlePrev} 
                size="large"
                styleButton={{ width: "50%", fontWeight: 600 }}
            >
                Quay lại
            </ButtonComponent>
            <ButtonComponent
                type="primary"
                onClick={handleFinish}
                size="large"
                loading={isPending}
                styleButton={{
                    width: "50%",
                    fontWeight: 600,
                    background: "linear-gradient(90deg, #1890ff, #40a9ff)",
                    boxShadow: "0 4px 12px rgba(24, 144, 255, 0.4)",
                }}
            >
                Hoàn tất Đăng ký
            </ButtonComponent>
        </div>
      )
    }
  ];
  return (
    <Card
      style={{
        maxWidth: 600, // Tăng kích thước để form nhìn thoáng hơn
        margin: "0 auto",
        padding: 24,
        borderRadius: "16px",
        boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
        background: "linear-gradient(145deg, #f0faff, #ffffff)",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: 24, fontWeight: 600, color: "#1890ff" }}>
        Đăng ký Tài khoản
      </h2>

      <Steps 
        current={currentStep} 
        items={steps.map(item => ({ title: item.title }))} 
        style={{ marginBottom: 30 }} 
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        autoComplete="off"
        // Gán lại initialValues của bước hiện tại từ formData khi bước thay đổi
        initialValues={{ ...formData, ...form.getFieldsValue() }} 
        key={currentStep} // Đảm bảo form được render lại với initialValues mới
      >
        {steps[currentStep].content}
        <Form.Item style={{ marginTop: 24 }}>
          {steps[currentStep].button}
        </Form.Item>

        <div style={{ textAlign: "center", fontSize: 14, marginTop: 15 }}>
          Bạn đã có tài khoản?{" "}
          <span
            style={{ color: "#1890ff", cursor: "pointer", fontWeight: 500 }}
            onClick={() => navigate("/login")}
          >
            Đăng nhập ngay
          </span>
        </div>
      </Form>
    </Card>
  );
};

export default MultiStepRegisterForm;