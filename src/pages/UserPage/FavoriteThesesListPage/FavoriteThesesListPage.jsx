import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Pagination, Button, Skeleton, Tag, Tooltip } from "antd";
import { 
  StarFilled, 
  ClockCircleOutlined, 
  EyeOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined 
} from "@ant-design/icons";
import { FaUserGraduate, FaCalendarAlt, FaFilePdf, FaFileWord } from "react-icons/fa";

import DefaultLayout from "../../../components/DefaultLayout/DefaultLayout";
import BreadCrumbComponent from "../../../components/BreadcrumbComponent/BreadcrumbComponent";
import FavoriteButtonComponent from "../../../components/FavoriteButtonComponent/FavoriteButtonComponent";
import * as FavoriteService from "../../../services/FavoriteService";

// Import các styled components từ file style.js
import {
  Wrapper,
  HeaderContainer,
  FavoriteList,
  FavoriteCard,
  ThumbnailWrapper,
  ContentWrapper,
  TitleStyled,
  MetaRow,
  Abstract,
  ActionsWrapper,
  EmptyState
} from "./style";

const FavoriteThesesListPage = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const userId = user?.id;

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  
  const queryParams = {
    page: currentPage,
    limit: pageSize,
  };

  const queryGetFavoriteTheses = useQuery({
    queryKey: ["getFavoriteTheses", userId, currentPage, pageSize],
    queryFn: () => FavoriteService.getUserFavorites(userId, queryParams),
    enabled: !!userId,
  });

  const { data: responseFavoriteTheses, isLoading } = queryGetFavoriteTheses;
  const favoriteTheses = responseFavoriteTheses?.data.favorites || [];
  const total = responseFavoriteTheses?.data?.total || 0;

  return (
    <DefaultLayout>
      <BreadCrumbComponent customNameMap={{ "favorite-theses": "Luận văn đã lưu" }} />
      
      <Wrapper>
        {/* Header */}
        <HeaderContainer>
          <h2>
            <StarFilled style={{ color: "#fadb14" }} /> 
            Luận văn đã lưu 
            <span style={{ fontSize: '16px', color: '#9ca3af', fontWeight: 'normal' }}>
              ({total})
            </span>
          </h2>
        </HeaderContainer>

        {/* Content */}
        {isLoading ? (
          <FavoriteList>
            {[...Array(3)].map((_, i) => (
              <FavoriteCard key={i} style={{ display: 'block' }}>
                <Skeleton avatar active paragraph={{ rows: 3 }} />
              </FavoriteCard>
            ))}
          </FavoriteList>
        ) : favoriteTheses.length === 0 ? (
          <EmptyState>
            <img src="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg" alt="empty" />
            <p style={{ color: '#6b7280', fontSize: '16px' }}>Bạn chưa lưu luận văn nào vào danh sách yêu thích.</p>
            <Button type="primary" onClick={() => navigate('/')}>Khám phá ngay</Button>
          </EmptyState>
        ) : (
          <FavoriteList>
            {favoriteTheses.map((item) => {
              const thesis = item.thesis;
              const isDeleted = !thesis;

              // --- Trường hợp luận văn gốc đã bị xóa ---
              if (isDeleted) {
                return (
                  <FavoriteCard key={item._id} $isDeleted={true}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 15 }}>
                      <ExclamationCircleOutlined style={{ fontSize: '24px', color: '#ff4d4f' }} />
                      <div>
                        <h4 style={{ margin: 0, color: '#ff4d4f' }}>Luận văn này không còn tồn tại</h4>
                        <span style={{ color: '#6b7280', fontSize: '13px' }}>
                          Đã lưu: {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {/* Vẫn cho phép xóa khỏi danh sách yêu thích */}
                    <div title="Xóa khỏi danh sách">
                       <FavoriteButtonComponent thesisId={item.thesisId} />
                    </div>
                  </FavoriteCard>
                );
              }

              // --- Trường hợp hiển thị bình thường ---
              return (
                <FavoriteCard key={item._id}>
                  <ThumbnailWrapper onClick={() => navigate(`/thesis/${thesis._id}`)}>
                    <img
                      src={`${import.meta.env.VITE_API_URL}${thesis.thumbnail}`}
                      alt={thesis.title}
                      onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/300x200?text=No+Image"; }}
                    />
                  </ThumbnailWrapper>

                  <ContentWrapper>
                    <div>
                      <Tooltip title={thesis.title}>
                        <TitleStyled onClick={() => navigate(`/thesis/${thesis._id}`)}>
                          {thesis.title}
                        </TitleStyled>
                      </Tooltip>

                      <MetaRow>
                        <div className="item">
                          <FaUserGraduate /> {thesis.authorName || "N/A"}
                        </div>
                        <div className="item">
                          <FaCalendarAlt /> {thesis.year || "N/A"}
                        </div>
                        <Tag color={thesis.fileType === 'pdf' ? 'red' : 'blue'} bordered={false}>
                           {thesis.fileType === 'pdf' ? <FaFilePdf /> : <FaFileWord />} {thesis.fileType?.toUpperCase() || "DOC"}
                        </Tag>
                      </MetaRow>

                      <Abstract>
                        {thesis.tom_tat || thesis.abstract || "Chưa có mô tả tóm tắt."}
                      </Abstract>
                    </div>

                    <div style={{ marginTop: 10 }}>
                        <Tag color="gold" bordered={false} icon={<ClockCircleOutlined />}>
                            Đã lưu: {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                        </Tag>
                    </div>
                  </ContentWrapper>

                  <ActionsWrapper>
                    <Button 
                      type="primary" 
                      icon={<EyeOutlined />} 
                      onClick={() => navigate(`/thesis/${thesis._id}`)}
                      block
                    >
                      Xem
                    </Button>
                    
                    {/* Nút Favorite đảm nhận việc "Bỏ lưu" */}
                    <div style={{ width: '100%', textAlign: 'center' }}>
                        <FavoriteButtonComponent thesisId={thesis._id} />
                    </div>
                  </ActionsWrapper>
                </FavoriteCard>
              );
            })}
          </FavoriteList>
        )}

        {/* Pagination */}
        {total > pageSize && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 30 }}>
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={total}
              onChange={(page, size) => {
                setCurrentPage(page);
                setPageSize(size);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              showSizeChanger
              pageSizeOptions={['5', '10', '20']}
            />
          </div>
        )}
      </Wrapper>
    </DefaultLayout>
  );
};

export default FavoriteThesesListPage;