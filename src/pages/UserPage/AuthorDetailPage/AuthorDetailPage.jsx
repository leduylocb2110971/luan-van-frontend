import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

// --- ANT DESIGN ---
import {
  Card,
  Avatar,
  Typography,
  Spin,
  Empty,
  Table,
  Button,
  Tooltip,
  Tag,
  Row,
  Col,
  Statistic,
  Space,
  Divider
} from "antd";

import { 
    UserOutlined, 
    EyeOutlined, 
    MailOutlined, 
    BankOutlined, 
    IdcardOutlined,
    BookOutlined,
    GlobalOutlined,
    ArrowLeftOutlined
} from "@ant-design/icons";

// --- SERVICES & COMPONENTS ---
import * as UserService from "../../../services/StudentService"; // Check lại service này nếu cần
import * as SupervisorService from "../../../services/SupervisorService";
import DefaultLayout from "../../../components/DefaultLayout/DefaultLayout";
import BreadcrumbComponent from "../../../components/BreadcrumbComponent/BreadcrumbComponent";

const { Title, Text, Paragraph } = Typography;

const AuthorDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // 1. Lấy thông tin giảng viên
  const { data: authorResponse, isLoading: isAuthorLoading } = useQuery({
    queryKey: ["supervisor", id],
    queryFn: () => UserService.getStudentById(id),
  });
  const author = authorResponse;

  // 2. Lấy danh sách luận văn
  const { data: thesisResponse, isLoading: isThesisLoading } = useQuery({
    queryKey: ["theses", id],
    queryFn: () =>
      SupervisorService.getSupervisedThesisBySupervisorId(id, {
        limit: 50,
        page: 1,
      }),
  });
  const theses = thesisResponse?.data.thesisList || [];

  // --- LOADING / EMPTY STATE ---
  if (isAuthorLoading || isThesisLoading) {
    return (
      <DefaultLayout>
        <div style={{ textAlign: "center", padding: "100px 0" }}>
          <Spin size="large" tip="Đang tải thông tin..." />
        </div>
      </DefaultLayout>
    );
  }

  if (!author) {
    return (
      <DefaultLayout>
        <Empty description="Không tìm thấy thông tin giảng viên" style={{ margin: "50px 0" }} />
      </DefaultLayout>
    );
  }

  // --- CẤU HÌNH CỘT BẢNG ---
  const columns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    {
      title: "Tên luận văn",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <a 
            onClick={() => navigate(`/thesis/${record._id}`)}
            style={{ fontWeight: 600, color: '#1890ff', fontSize: 15 }}
        >
          {text}
        </a>
      ),
      sorter: (a, b) => a?.title?.localeCompare(b?.title),
    },
    {
      title: "Năm",
      dataIndex: "year",
      key: "year",
      width: 100,
      align: 'center',
      sorter: (a, b) => (a.year || 0) - (b.year || 0),
      render: (year) => <Tag color="default">{year || "—"}</Tag>,
    },
    {
      title: "Quyền truy cập",
      dataIndex: "accessMode",
      key: "accessMode",
      width: 180,
      render: (mode) => {
        let color = "default";
        let text = "Riêng tư";
        switch (mode) {
            case "public_full": color = "cyan"; text = "Công khai (Toàn văn)"; break;
            case "abstract_only": color = "success"; text = "Công khai (Chỉ tóm tắt)"; break;
            case "department_only": color = "processing"; text = "Nội bộ trường"; break;
            case "hidden": color = "error"; text = "Riêng tư"; break;
        }
        return <Tag color={color} icon={<GlobalOutlined />}>{text}</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Tooltip title="Xem chi tiết">
            <Button
            type="text"
            icon={<EyeOutlined style={{ color: '#1890ff' }} />}
            onClick={() => navigate(`/thesis/${record._id}`)}
            style={{ background: '#e6f7ff', borderRadius: 8 }}
            />
        </Tooltip>
      ),
    },
  ];

  return (
    <DefaultLayout>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>
            {/* Breadcrumb & Back Button */}
            <div style={{ marginBottom: 16 }}>
                <BreadcrumbComponent
                    idNameMap={{ [author?._id]: author.name }}
                    customNameMap={{ supervisors: "Giảng viên" }}
                />
            </div>

            {/* --- 1. PROFILE HEADER CARD (GIAO DIỆN NGANG) --- */}
            <Card
                style={{
                    borderRadius: 16,
                    marginBottom: 24,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    border: 'none',
                    overflow: 'hidden'
                }}
                styles={{
                body:{ 
                    padding: 0
                }
            }} 
            >
                {/* Background Banner trang trí */}
                <div style={{ 
                    height: 100, 
                    background: "linear-gradient(135deg, #0050b3 0%, #1890ff 100%)",
                    position: 'relative'
                }} />

                <div style={{ padding: '0 30px 30px', position: 'relative' }}>
                    <Row gutter={[32, 24]} align="bottom">
                        {/* Avatar nổi lên trên banner */}
                        <Col flex="140px">
                            <div style={{ marginTop: -50 }}>
                                <Avatar
                                    size={120}
                                    src={`${import.meta.env.VITE_API_URL}${author?.avatar}`}
                                    icon={<UserOutlined />}
                                    style={{
                                        border: "4px solid #fff",
                                        boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                                        backgroundColor: '#fff'
                                    }}
                                />
                            </div>
                        </Col>

                        {/* Thông tin chính */}
                        <Col flex="auto">
                            <div style={{ marginTop: 16 }}>
                                <Space align="baseline">
                                    <Title level={2} style={{ margin: 0 }}>{author.name}</Title>
                                    <Tag color="blue" style={{ borderRadius: 10 }}>{author?.academicTitle || "Giảng viên"}</Tag>
                                </Space>
                                <Paragraph type="secondary" style={{ fontSize: 16, marginTop: 4, marginBottom: 12 }}>
                                    <MailOutlined style={{ marginRight: 6 }} /> {author.email}
                                </Paragraph>
                                
                                {/* Thông tin phụ (Khoa/Trường/Mã) */}
                                <Space size="large" wrap style={{ color: '#555' }}>
                                    <span>
                                        <BankOutlined style={{ color: '#1890ff' }} /> <strong>Khoa:</strong> {author?.department?.name || "—"}
                                    </span>
                                    <span>
                                        <BankOutlined style={{ color: '#1890ff' }} /> <strong>Trường:</strong> {author?.university || "—"}
                                    </span>
                                    <span>
                                        <IdcardOutlined style={{ color: '#1890ff' }} /> <strong>MSC:</strong> {author?.staffId || "—"}
                                    </span>
                                </Space>
                            </div>
                        </Col>

                        {/* Thống kê bên phải */}
                        <Col flex="none">
                            <Card 
                                styles={{body:{ padding: '12px 24px' }}}
                            >
                                <Statistic
                                    title="Luận văn hướng dẫn"
                                    value={theses.length}
                                    prefix={<BookOutlined style={{ color: '#1890ff' }} />}
                                    valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
                                />
                            </Card>
                        </Col>
                    </Row>
                </div>
            </Card>

            {/* --- 2. TABLE CONTENT --- */}
            <Card
                title={<Title level={4} style={{ margin: 0 }}><BookOutlined /> Danh sách luận văn hướng dẫn</Title>}
                style={{ borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
            >
                {theses.length > 0 ? (
                    <Table
                        dataSource={theses}
                        columns={columns}
                        rowKey={(record) => record._id}
                        pagination={{ 
                            pageSize: 10, 
                            showTotal: (total) => `Tổng ${total} luận văn`
                        }}
                        scroll={{ x: 700 }} // Cho phép cuộn ngang trên mobile
                    />
                ) : (
                    <Empty description="Giảng viên này chưa hướng dẫn luận văn nào" style={{ margin: '40px 0' }} />
                )}
            </Card>
        </div>
        
        {/* Spacer */}
        <div style={{ height: 40 }} />
    </DefaultLayout>
  );
};

export default AuthorDetailPage;