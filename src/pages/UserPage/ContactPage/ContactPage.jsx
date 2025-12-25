import React, { useState } from "react";
import styled from "styled-components";
import DefaultLayout from "../../../components/DefaultLayout/DefaultLayout";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaPaperPlane, FaFacebook, FaLinkedin, FaTwitter } from "react-icons/fa";

// --- STYLED COMPONENTS ---

const PageWrapper = styled.div`
  min-height: 100vh;
  padding: 80px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); /* Gradient tím xanh hiện đại */
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ContactContainer = styled.div`
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  display: grid;
  grid-template-columns: 1fr;
  max-width: 1000px;
  width: 100%;
  overflow: hidden;

  @media (min-width: 850px) {
    grid-template-columns: 2fr 3fr; /* Bên trái nhỏ hơn bên phải chút */
  }
`;

// Cột bên trái: Thông tin (Màu tối/Gradient)
const InfoSection = styled.div`
  background: #2d3436;
  background-image: url("https://www.transparenttextures.com/patterns/cubes.png"); /* Pattern nhẹ */
  color: #fff;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    width: 150px;
    height: 150px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    bottom: -40px;
    right: -40px;
  }
`;

const InfoTitle = styled.h2`
  font-size: 28px;
  margin-bottom: 20px;
  font-weight: 700;
`;

const InfoText = styled.p`
  color: #b2bec3;
  margin-bottom: 30px;
  line-height: 1.6;
`;

const ContactItem = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 25px;
  font-size: 16px;

  svg {
    margin-right: 15px;
    margin-top: 5px;
    color: #74b9ff;
    font-size: 18px;
  }
`;

const SocialIcons = styled.div`
  display: flex;
  gap: 15px;
  margin-top: auto;
  
  svg {
    font-size: 20px;
    cursor: pointer;
    transition: transform 0.2s;
    &:hover {
      transform: translateY(-3px);
      color: #74b9ff;
    }
  }
`;

// Cột bên phải: Form (Màu sáng)
const FormSection = styled.div`
  padding: 40px;
  background-color: #fff;
`;

const FormTitle = styled.h2`
  font-size: 24px;
  color: #2d3436;
  margin-bottom: 30px;
  font-weight: 700;
`;

const FormGroup = styled.div`
  position: relative;
  margin-bottom: 20px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 15px;
  border-radius: 8px;
  border: 2px solid #f0f0f0;
  background-color: #f9f9f9;
  outline: none;
  font-size: 15px;
  transition: all 0.3s;
  color: #333;

  &:focus {
    border-color: #667eea;
    background-color: #fff;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 15px;
  border-radius: 8px;
  border: 2px solid #f0f0f0;
  background-color: #f9f9f9;
  outline: none;
  font-size: 15px;
  resize: vertical;
  min-height: 120px;
  transition: all 0.3s;
  font-family: inherit;

  &:focus {
    border-color: #667eea;
    background-color: #fff;
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(to right, #667eea, #764ba2);
  color: #fff;
  padding: 14px 30px;
  border: none;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 15px rgba(118, 75, 162, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(118, 75, 162, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

// Map giả lập
const MapPreview = styled.div`
  margin-top: 30px;
  height: 180px;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid rgba(255,255,255,0.1);
  background-image: url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg');
  background-size: cover;
  background-position: center;
  background-color: #4a5568;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,0.7);
  font-weight: 600;
  position: relative;

  &::after {
    content: "Map Preview";
    background: rgba(0,0,0,0.5);
    padding: 5px 15px;
    border-radius: 20px;
  }
`;

// --- COMPONENT ---

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    alert("Cảm ơn bạn đã gửi liên hệ!");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <DefaultLayout>
      <PageWrapper>
        <ContactContainer>
          {/* Cột trái: Thông tin */}
          <InfoSection>
            <div>
              <InfoTitle>Thông tin liên hệ</InfoTitle>
              <InfoText>
                Hãy để lại lời nhắn cho chúng tôi. Chúng tôi sẽ phản hồi lại bạn trong vòng 24 giờ làm việc.
              </InfoText>

              <ContactItem>
                <FaMapMarkerAlt />
                <span>123 Đường Nguyễn Văn Linh, Quận Ninh Kiều, TP. Cần Thơ</span>
              </ContactItem>
              
              <ContactItem>
                <FaPhoneAlt />
                <span>+84 901 234 567</span>
              </ContactItem>
              
              <ContactItem>
                <FaEnvelope />
                <span>support@thesis-system.edu.vn</span>
              </ContactItem>

              <SocialIcons>
                 <FaFacebook />
                 <FaTwitter />
                 <FaLinkedin />
              </SocialIcons>
            </div>

            <MapPreview />
          </InfoSection>

          {/* Cột phải: Form */}
          <FormSection>
            <FormTitle>Gửi tin nhắn</FormTitle>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <FormGroup>
                  <Input
                    type="text"
                    name="name"
                    placeholder="Họ và tên"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Input
                    type="email"
                    name="email"
                    placeholder="Email của bạn"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </FormGroup>
              </div>

              <FormGroup>
                <Input
                  type="text"
                  name="subject"
                  placeholder="Tiêu đề"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <TextArea
                  name="message"
                  rows="5"
                  placeholder="Nội dung tin nhắn..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </FormGroup>

              <SubmitButton type="submit">
                Gửi ngay <FaPaperPlane style={{ fontSize: '14px' }} />
              </SubmitButton>
            </form>
          </FormSection>
        </ContactContainer>
      </PageWrapper>
    </DefaultLayout>
  );
};

export default ContactPage;