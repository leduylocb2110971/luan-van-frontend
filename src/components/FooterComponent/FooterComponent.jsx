// src/components/FooterComponent/FooterComponent.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { FooterWrapper, FooterContent, FooterColumn, FooterLink } from "./style";
import { MailOutlined, FacebookOutlined, InstagramOutlined, LinkedinOutlined } from "@ant-design/icons";
import LogoImage from "../../assets/logo-user.png";

const FooterComponent = () => {
  const navigate = useNavigate();

  return (
    <FooterWrapper style={{ background: "linear-gradient(90deg, #2563eb, #4f46e5)", color: "#ffffff", padding: "40px 20px 20px 20px" }}>
      <FooterContent style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: 40 }}>
        
        {/* Cột 1: Logo + Tagline */}
        <FooterColumn style={{ flex: "1 1 250px" }}>
          <img
            src={LogoImage}
            alt="ThesisExtracted Logo"
            style={{ width: "50%", height: "90px", borderRadius: 12, cursor: "pointer" }}
            onClick={() => navigate("/")}
          />
          <p style={{ marginTop: 12, color: "#e0e7ff", lineHeight: 1.6 }}>
            Nền tảng hỗ trợ sinh viên hoàn thành luận văn hiệu quả.
          </p>
        </FooterColumn>

        {/* Cột 2: Liên kết */}
        <FooterColumn style={{ flex: "1 1 200px" }}>
          <h4 style={{ color: "#ffffff", marginBottom: 12 }}>Liên kết nhanh</h4>
          <FooterLink href="#" style={{ color: "#dbeafe" }}>Giới thiệu</FooterLink>
          <FooterLink href="#" style={{ color: "#dbeafe" }}>Điều khoản</FooterLink>
          <FooterLink href="#" style={{ color: "#dbeafe" }}>Liên hệ</FooterLink>
          <FooterLink href="#" style={{ color: "#dbeafe" }}>Hỗ trợ</FooterLink>
        </FooterColumn>

        {/* Cột 3: Kết nối */}
        <FooterColumn style={{ flex: "1 1 250px" }}>
          <h4 style={{ color: "#ffffff", marginBottom: 12 }}>Kết nối với chúng tôi</h4>
          <p style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <MailOutlined /> contact@thesis-extracted.vn
          </p>
          <p style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <FacebookOutlined /> /thesis-extracted
          </p>
          <p style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <InstagramOutlined /> @thesis_extracted
          </p>
          <p style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <LinkedinOutlined /> Thesis Extracted
          </p>
        </FooterColumn>
      </FooterContent>

      <div style={{ textAlign: "center", marginTop: 40, fontSize: 14, opacity: 0.7 }}>
        © {new Date().getFullYear()} Thesis Extracted. All rights reserved.
      </div>
    </FooterWrapper>
  );
};

export default FooterComponent;
