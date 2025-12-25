import React from "react"
import HeaderComponent from "../HeaderComponent/HeaderComponent"
import FooterComponent from "../FooterComponent/FooterComponent"
import { Outlet } from "react-router-dom";
import styled from "styled-components";

const AppWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh; /* đảm bảo chiếm ít nhất full viewport */
`;

const ContentWrapper = styled.main`
  flex: 1; /* chiếm không gian còn lại */
`;

// 🔹 Container chuẩn, áp dụng cho mọi trang
const PageContainer = styled.div`
  max-width: 1200px;   /* khung tối đa */
  margin: 0 auto;      /* căn giữa */
  padding: 0 16px;     /* chừa khoảng trống hai bên */
  width: 100%;
`;

const DefaultLayout = ({ children, fluid = false }) => {
  return (
    <AppWrapper>
      <HeaderComponent />
        <ContentWrapper>
          {fluid ? (
            children || <Outlet />
          ) : (
            <PageContainer>
              {children || <Outlet />}
            </PageContainer>
          )}
        </ContentWrapper>
      <FooterComponent />
    </AppWrapper>
  )
}

export default DefaultLayout;
