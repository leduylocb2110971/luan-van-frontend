import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";

// UI Libraries
import {
  Card, Typography, Space, Tag, Row, Col, Alert, Button, Skeleton, Divider, Result
} from "antd";
import {
  DownloadOutlined, ReadOutlined, 
  FilePdfOutlined, EyeOutlined, LockOutlined
} from "@ant-design/icons";
import { FaUserGraduate, FaCalendarAlt } from "react-icons/fa";

// Components & Services
import ThesisViewer from "../../../components/ThesisViewer/ThesisViewer";
import FavoriteButtonComponent from "../../../components/FavoriteButtonComponent/FavoriteButtonComponent";
import CommentSectionComponent from "../../../components/CommentSectionComponent/CommentSectionComponent";
import * as ThesisService from "../../../services/TheSisService";
import * as CommentService from "../../../services/CommentService";
import * as Message from "../../../components/Message/Message";
import DefaultLayout from "../../../components/DefaultLayout/DefaultLayout";
import BreadcrumbComponent from "../../../components/BreadcrumbComponent/BreadcrumbComponent";
import RelatedThesisComponent from "../../../components/RelatedThesisComponent/RelatedThesisComponent";
import CitationModalComponent from "../../../components/CitationModalComponent/CitationModalComponent";

const { Title, Paragraph, Text } = Typography;

const ThesisDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [isCitationModalVisible, setIsCitationModalVisible] = useState(false);

  // --- QUERIES ---
  // 1. Check Relation
  const { data: relationData } = useQuery({
    queryKey: ["userThesisRelation", id],
    queryFn: () => ThesisService.checkUserRelatedToThesis(id),
    enabled: !!id && !!user,
    refetchOnWindowFocus: false,
  });
  const hasAccess = relationData?.isRelated || false;

  // 2. Get Detail
  const { data: Response, isLoading, isError, error } = useQuery({
    queryKey: ["thesisDetail", id],
    queryFn: () => ThesisService.getThesisById(id),
    refetchOnWindowFocus: false,
  });
  const thesisDetail = Response?.data || {};

  // 3. Get Comments
  const { data: commentsRes } = useQuery({
    queryKey: ["comments", id],
    queryFn: () => CommentService.getCommentsByThesisId(id),
    refetchOnWindowFocus: false,
  });
  const commentsData = commentsRes?.data || [];

  // --- MUTATION ---
  const mutationDownload = useMutation({
    mutationFn: ThesisService.downloadTheSis,
    onError: () => Message.error("Không thể tải xuống luận văn"),
  });

  const handleDownload = (thesisId) => {
    mutationDownload.mutate(thesisId);
  };

  const fileUrl = thesisDetail?.fileUrl;

  // ---Giao diện khi load ---
  if (isLoading) {
    return (
      <DefaultLayout>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px" }}>
          <Skeleton active paragraph={{ rows: 1 }} />
          <Row gutter={32} style={{ marginTop: 20 }}>
            <Col xs={24} lg={16}>
              <Skeleton active avatar paragraph={{ rows: 4 }} />
              <Skeleton.Image active style={{ width: '100%', height: 400, marginTop: 20 }} />
            </Col>
            <Col xs={24} lg={8}>
              <Skeleton active paragraph={{ rows: 6 }} />
            </Col>
          </Row>
        </div>
      </DefaultLayout>
    );
  }

  // --- Giao diện khi lỗi ---
  if (isError) {
    return (
      <DefaultLayout>
        <div className="p-4" style={{ textAlign: 'center', marginTop: 50 }}>
          <Alert
            message="Không tìm thấy dữ liệu"
            description={error?.message || "Luận văn này không tồn tại hoặc đã bị xóa."}
            type="error"
            showIcon
            style={{ maxWidth: 600, margin: '0 auto' }}
          />
          <Button type="primary" style={{ marginTop: 16 }} onClick={() => navigate('/')}>
            Về trang chủ
          </Button>
        </div>
      </DefaultLayout>
    );
  }
  // Giao diện khi chặn người dùng vãng lai truy cập
  if (thesisDetail.accessMode === "department_only" && !user) {
    return (
      <DefaultLayout>
        {/* Vẫn nên hiện Tiêu đề luận văn để người ta biết mình đang xem cái gì */}
        <div style={{ padding: '20px', background: '#f5f5f5', textAlign: 'center' }}>
            <h2>{thesisDetail.title}</h2> 
            <p style={{color: '#888'}}>Tác giả: {thesisDetail.owner.name}</p>
        </div>

        <Result
          icon={<LockOutlined style={{ color: '#faad14' }} />} // Icon ổ khóa màu vàng cam
          status="warning" // Hoặc 403
          title="Nội dung giới hạn"
          subTitle="Tài liệu này chỉ dành cho sinh viên và giảng viên nội bộ. Vui lòng đăng nhập để xem toàn văn."
          extra={[
            <Button 
              type="primary" 
              key="login" 
              onClick={() => {
                  // Lưu lại trang hiện tại để login xong quay lại đúng bài này
                  navigate(`/login?redirect=${location.pathname}`);
              }}
            >
              Đăng nhập ngay
            </Button>,
            <Button key="back" onClick={() => navigate(-1)}>Quay lại</Button>,
          ]}
        />
      </DefaultLayout>
    );
  }

  // --- MAIN RENDER ---
  return (
    <DefaultLayout>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "16px 24px" }}>
        
        {/* Breadcrumb */}
        <div style={{ marginBottom: 16 }}>
            <BreadcrumbComponent
            idNameMap={{ [thesisDetail?._id]: thesisDetail?.title }}
            customNameMap={{ thesis: "Luận văn" }}
            />
        </div>

        <Row gutter={[32, 24]}>
          {/* === LEFT CONTENT (CHÍNH) === */}
          <Col xs={24} lg={17}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              {/* 1. HEADER SECTION (HERO) */}
              <div style={{ background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                {/* Title */}
                <Title level={2} style={{ marginTop: 0, color: '#1f1f1f', lineHeight: 1.3 }}>
                  {thesisDetail?.title}
                </Title>

                {/* Metadata Row - Cleaner Design */}
                <Space size="large" wrap style={{ color: '#8c8c8c', marginBottom: 20 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <FaUserGraduate style={{ color: '#1890ff' }} /> 
                        <Text strong style={{ color: '#595959' }}>{thesisDetail?.owner?.name || "Tác giả ẩn danh"}</Text>
                    </span>
                    <Divider type="vertical" />
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <FaCalendarAlt /> {new Date(thesisDetail?.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                    <Divider type="vertical" />
                    <span><EyeOutlined /> {thesisDetail?.views || 0} lượt xem</span>
                    <span><DownloadOutlined /> {thesisDetail?.downloads || 0} lượt tải</span>
                </Space>

                {/* Action Buttons Row */}
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {/* Nút Download Xanh (Primary) */}
                    {(hasAccess || (thesisDetail?.accessMode === "public_full" && thesisDetail.isDownload === true)) && (
                        <Button
                            type="primary"
                            size="middle"
                            icon={<DownloadOutlined />}
                            style={{ borderRadius: 8, padding: '0 24px', fontWeight: 500 }}
                            onClick={() => handleDownload(thesisDetail._id)}
                        >
                            Tải xuống
                        </Button>
                    )}

                    {/* Nút Trích dẫn */}
                    <Button 
                        size="middle" 
                        icon={<ReadOutlined />} 
                        style={{ borderRadius: 8 }}
                        onClick={() => setIsCitationModalVisible(true)}
                    >
                        Trích dẫn
                    </Button>

                    {/* Nút Yêu thích (Component con) */}
                    <FavoriteButtonComponent thesisId={thesisDetail._id} />
                </div>
              </div>

              {/* 2. ABSTRACT & KEYWORDS */}
              <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <Title level={4}>Tóm tắt</Title>
                <Paragraph 
                    style={{ fontSize: 16, lineHeight: 1.8, color: '#434343', textAlign: 'justify' }}
                    ellipsis={{ rows: 4, expandable: true, symbol: 'Xem thêm' }}
                >
                    {thesisDetail.tom_tat || "Đang cập nhật..."}
                </Paragraph>
                
                {/* Keywords as Chips */}
                {thesisDetail?.keywords?.length > 0 && (
                    <div style={{ marginTop: 20 }}>
                        <Text type="secondary" style={{ marginRight: 8 }}>Từ khóa:</Text>
                        {thesisDetail.keywords.map((keyword, idx) => (
                            <Tag 
                                key={idx} 
                                color="geekblue" 
                                style={{ borderRadius: 20, padding: '4px 12px', marginBottom: 8, cursor: 'pointer', border: 'none', background: '#f0f5ff', color: '#2f54eb' }}
                                onClick={() => navigate(`/thesis?keywords=${encodeURIComponent(keyword)}`)}
                            >
                                #{keyword}
                            </Tag>
                        ))}
                    </div>
                )}
              </Card>

              {/* 3. VIEWER SECTION */}
              <div id="viewer-section" style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid #f0f0f0' }}>
                 {/* Header nhỏ cho Viewer */}
                 <div style={{ padding: '12px 24px', background: '#fafafa', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text strong><FilePdfOutlined /> Xem trước tài liệu</Text>
                    <Tag color={['public_full','department_only'].includes(thesisDetail?.accessMode) ? 'green' : 'orange'}>
                        {['public_full','department_only'].includes(thesisDetail?.accessMode) ? 'Có thể xem toàn bộ nội dung' : 'Nội dung bị hạn chế (do phạm vi truy cập giới hạn)'}
                    </Tag>
                 </div>
                 <div style={{ padding: 0 }}>
                    <ThesisViewer
                        fileUrl={fileUrl}
                        thesisId={id}
                        accessMode={thesisDetail?.accessMode}
                    />
                 </div>
              </div>

              {/* 4. COMMENTS SECTION */}
              <div style={{ marginTop: 16 }}>
                 <Title level={4} style={{ marginBottom: 16 }}>Bình luận & Thảo luận</Title>
                 <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <CommentSectionComponent
                        thesisId={id}
                        commentsData={commentsData}
                    />
                 </Card>
              </div>

            </div>
          </Col>

          {/* === RIGHT SIDEBAR (STICKY) === */}
          <Col xs={24} lg={7}>
            <div style={{ position: "sticky", top: 20 }}>
                {/* INFO CARD */}
                <Card 
                    title="Thông tin chi tiết" 
                    size="small"
                    style={{ borderRadius: 12, marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div>
                            <Text type="secondary" style={{ fontSize: 12 }}>GVHD</Text>
                            <div style={{ fontWeight: 500 }}>{thesisDetail?.supervisorName || "Chưa cập nhật"}</div>
                        </div>
                        <div>
                            <Text type="secondary" style={{ fontSize: 12 }}>Chuyên ngành</Text>
                            <div style={{ fontWeight: 500 }}>{thesisDetail?.major?.name || "Chưa cập nhật"}</div>
                        </div>
                        <div>
                            <Text type="secondary" style={{ fontSize: 12 }}>Năm hoàn thành</Text>
                            <div style={{ fontWeight: 500 }}>{thesisDetail?.year || "Chưa cập nhật"}</div>
                        </div>
                        <div>
                            <Text type="secondary" style={{ fontSize: 12 }}>Định dạng file</Text>
                            <div style={{ marginTop: 4 }}>
                                {thesisDetail?.fileType === "pdf" ? <Tag color="red">PDF</Tag> : <Tag color="blue">DOCX</Tag>}
                            </div>
                        </div>
                    </div>
                </Card>

                {/* RELATED THESIS */}
                <Card 
                    title="Có thể bạn quan tâm" 
                    size="small"
                    style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: '12px' }}
                >
                    <RelatedThesisComponent thesisId={id} />
                </Card>
            </div>
          </Col>
        </Row>

        {/* MODAL CITATION */}
        <CitationModalComponent
            visible={isCitationModalVisible}
            onClose={() => setIsCitationModalVisible(false)}
            thesisDetail={thesisDetail}
        />
      </div>
    </DefaultLayout>
  );
};

export default ThesisDetailPage;