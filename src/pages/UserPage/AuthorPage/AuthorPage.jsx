import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

// --- ANT DESIGN IMPORTS ---
import {
  List,
  Avatar,
  Typography,
  Button,
  Empty,
  Input,
  Select,
  Card,
  Tag,
  Row,
  Col,
  Statistic,
  Space,
  Skeleton
} from "antd";

import { 
    UserOutlined, 
    SearchOutlined, 
    BookOutlined, 
    MailOutlined,
    BankOutlined,
    ArrowRightOutlined,
    FilterOutlined
} from "@ant-design/icons";

// --- SERVICES & COMPONENTS ---
import * as SupervisorService from "../../../services/SupervisorService";
import * as CategoryService from "../../../services/CategoryService";
import DefaultLayout from "../../../components/DefaultLayout/DefaultLayout";
import BreadcrumbComponent from "../../../components/BreadcrumbComponent/BreadcrumbComponent";

const { Title, Text, Paragraph } = Typography;

const AuthorPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  // --- FETCH DATA ---
  const { data: response, isLoading } = useQuery({
    queryKey: ["supervisors"],
    queryFn: () => SupervisorService.getSupervisorsList({ limit: 1000 }),
  });

  const { data: categoryResponse } = useQuery({
    queryKey: ["categories"],
    queryFn: CategoryService.getCategories,
  });

  const supervisors = response?.data || [];
  const categories = categoryResponse?.data || [];

  // --- LỌC DỮ LIỆU ---
  const filteredSupervisors = useMemo(() => {
    // Bước 1: Lọc thesis rác trước
    const cleanedList = supervisors.map((s) => ({
      ...s,
      supervisedTheses: s.supervisedTheses?.filter(
        (t) => t.status !== "rejected_public" && t.status !== "pending_public"
      ),
    }));

    // Bước 2: Lọc theo từ khóa tìm kiếm & Khoa
    return cleanedList.filter((item) => {
      const matchName = item.name.toLowerCase().includes(search.toLowerCase());
      const matchCategory = !selectedCategory || item.department?._id === selectedCategory;
      return matchName && matchCategory;
    });
  }, [search, selectedCategory, supervisors]);

  // --- STYLES ---
  const styles = {
    pageHeader: {
        background: '#fff',
        padding: '24px',
        borderRadius: '12px',
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        border: '1px solid #f0f0f0'
    },
    cardHover: {
        borderRadius: '12px',
        border: '1px solid #f0f0f0',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        height: '100%', // Để các card bằng nhau
        display: 'flex',
        flexDirection: 'column'
    }
  };

  return (
    <DefaultLayout>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>
        <BreadcrumbComponent customNameMap={{ supervisors: "Giảng viên" }} />

        {/* --- HEADER & FILTER --- */}
        <div style={styles.pageHeader}>
            <Row gutter={[16, 16]} align="middle" justify="space-between">
                <Col xs={24} md={10}>
                    <Title level={3} style={{ margin: 0 }}>
                        Danh sách Giảng viên ({supervisors.length})
                    </Title>
                    <Text type="secondary">
                        Tìm kiếm giảng viên hướng dẫn và xem các luận văn họ đã hướng dẫn.
                    </Text>
                </Col>

                <Col xs={24} md={14}>
                    <Space.Compact style={{ width: '100%' }} size="large">
                        <Input
                            placeholder="Tìm tên giảng viên..."
                            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            allowClear
                        />
                        <Select
                            allowClear
                            placeholder="Lọc theo Khoa/Bộ môn"
                            style={{ width: '50%', minWidth: 160 }}
                            value={selectedCategory}
                            onChange={setSelectedCategory}
                            suffixIcon={<FilterOutlined />}
                            options={categories.map((cat) => ({
                                label: cat.name,
                                value: cat._id,
                            }))}
                        />
                    </Space.Compact>
                </Col>
            </Row>
        </div>

        {/* --- LIST CARD GRID --- */}
        {isLoading ? (
             <List
                grid={{ gutter: 24, xs: 1, sm: 2, md: 3, lg: 4 }}
                dataSource={[1, 2, 3, 4]}
                renderItem={() => (
                    <List.Item>
                        <Card loading style={{ borderRadius: 12, height: 300 }} />
                    </List.Item>
                )}
            />
        ) : filteredSupervisors.length === 0 ? (
             <div style={{ background: '#fff', padding: 60, borderRadius: 12, textAlign: 'center' }}>
                <Empty description="Không tìm thấy giảng viên nào phù hợp" />
             </div>
        ) : (
            <List
                grid={{ gutter: 24, xs: 1, sm: 2, md: 3, lg: 4 }}
                dataSource={filteredSupervisors}
                pagination={{
                    onChange: (page) => {
                        console.log(page);
                    },
                    pageSize: 10,
                    align: 'center',
                    style: { marginTop: 30 }
                }}
                renderItem={(item) => (
                    <List.Item>
                        {/* CARD GIẢNG VIÊN */}
                        <Card
                            hoverable
                            style={styles.cardHover}
                            styles={{ body: { padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' } }}
                            onClick={() => navigate(`/supervisors/${item._id}`)}
                        >
                            {/* Avatar */}
                            <div style={{ marginBottom: 16, position: 'relative' }}>
                                <Avatar
                                    size={100}
                                    src={item.avatar ? `${import.meta.env.VITE_API_URL}${item.avatar}` : null}
                                    icon={<UserOutlined />}
                                    style={{ 
                                        border: '4px solid #fff', 
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        backgroundColor: '#f56a00' 
                                    }}
                                >
                                    {item.name?.charAt(0)?.toUpperCase()}
                                </Avatar>
                            </div>

                            {/* Tên & Email */}
                            <Title level={5} style={{ margin: '0 0 4px', fontSize: 18 }} ellipsis={{rows: 1, tooltip: item.name}}>
                                {item.name}
                            </Title>
                            <Text type="secondary" style={{ fontSize: 13, marginBottom: 12 }} ellipsis>
                                <MailOutlined /> {item.email}
                            </Text>

                            {/* Khoa/Ngành */}
                            <div style={{ marginBottom: 20, minHeight: 22 }}>
                                {item.department ? (
                                    <Tag color="geekblue" style={{ borderRadius: 10, border: 'none' }}>
                                        <BankOutlined /> {item.department.name}
                                    </Tag>
                                ) : (
                                    <Tag>Chưa cập nhật khoa</Tag>
                                )}
                            </div>
                            
                            {/* Thống kê số lượng hướng dẫn */}
                            <div style={{ 
                                background: '#f9f9f9', 
                                width: '100%', 
                                padding: '12px', 
                                borderRadius: '8px',
                                display: 'flex',
                                justifyContent: 'space-around',
                                marginTop: 'auto' // Đẩy xuống đáy card
                            }}>
                                <Statistic 
                                    title={<span style={{ fontSize: 12 }}>Đã hướng dẫn</span>} 
                                    value={item.supervisedTheses?.length || 0} 
                                    valueStyle={{ fontSize: 18, fontWeight: 'bold', color: '#1890ff' }}
                                    prefix={<BookOutlined />}
                                />
                            </div>

                            {/* Nút Xem chi tiết (Hiện khi hover - tùy chọn, ở đây ta để mặc định ẩn hoặc dùng click card) */}
                            {/* <Button type="primary" ghost style={{ marginTop: 16, width: '100%', borderRadius: 6 }}>
                                Xem hồ sơ <ArrowRightOutlined />
                            </Button> */}
                        </Card>
                    </List.Item>
                )}
            />
        )}
      </div>
      <div style={{ height: 40 }} />
    </DefaultLayout>
  );
};

export default AuthorPage;