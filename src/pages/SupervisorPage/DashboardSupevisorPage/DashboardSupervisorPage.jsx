import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux"; // Để lấy tên user
import { Card, Row, Col, Typography, Tag, List, Avatar, Statistic, Button, Space, Empty, Badge } from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  BookOutlined,
  BellOutlined,
  RightOutlined,
  PieChartOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

import * as SupervisorService from "../../../services/SupervisorService";
import * as NotificationService from "../../../services/NotificationService";
import BreadcrumbComponent from "../../../components/BreadcrumbComponent/BreadcrumbComponent";

const { Title, Text } = Typography;

const DashboardSupervisorPage = () => {
  const user = useSelector((state) => state.auth.user); // Lấy user info

  // --- FETCH DATA ---
  const { data: thesisResponse } = useQuery({
    queryKey: ["theses"],
    queryFn: () => SupervisorService.getSupervisedThesis({limit: 1000}),
  });
  const { data: notificationResponse } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => NotificationService.getLatestNotifications(),
  });

  const thesis = thesisResponse?.theses || [];
  console.log("Thesis Data:", thesis);
  const notifications = notificationResponse || [];
  const totalTheses = thesisResponse?.total || 0;

  // --- HELPER FUNCTIONS ---
  const findCountByStatus = (status) => thesis.filter((t) => t.status === status).length || 0;
  
  // Dữ liệu cho biểu đồ
  const chartData = [
    { name: 'Đã duyệt', value: findCountByStatus("approved_public"), color: '#52c41a' },
    { name: 'Đã nộp nội bộ', value: findCountByStatus("submitted_internal"), color: '#146cfaff' },
    { name: 'Từ chối', value: findCountByStatus("rejected_public"), color: '#f5222d' },
  ].filter(item => item.value > 0); // Chỉ hiện những mục có dữ liệu

  const pendingThesis = thesis.filter((t) => t.status === "pending_public").slice(0, 5); // Lấy 5 bài mới nhất

  // --- COMPONENT THẺ THỐNG KÊ ---
  const StatCard = ({ title, value, icon, color, bgColor }) => (
    <Card hoverable style={{ borderRadius: 12, height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <Statistic 
            title={<Text type="secondary">{title}</Text>}
            value={value}
            valueStyle={{ color: color, fontWeight: 'bold' }}
            prefix={<span style={{ background: bgColor, padding: 8, borderRadius: '50%', marginRight: 8 }}>{icon}</span>}
        />
    </Card>
  );

  return (
    <>
      <BreadcrumbComponent customNameMap={{ dashboard: "Tổng quan", lecturer: "Giảng viên" }} />

      <div style={{ margin: '0 auto' }}>
        
        {/* 1. WELCOME BANNER */}
        <Card 
            style={{ 
                background: 'linear-gradient(135deg, #1890ff 0%, #0050b3 100%)', 
                borderRadius: 16, 
                marginBottom: 24,
                border: 'none'
            }}
           
            styles={{
                body:{ 
                    padding: "30px 40px"
                }
            }}        >
            <Row align="middle" justify="space-between">
                <Col>
                    <Title level={2} style={{ color: '#fff', margin: 0 }}>
                        Xin chào, {user?.name || "Giảng viên"}! 👋
                    </Title>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16 }}>
                        Chào mừng thầy/cô quay trở lại hệ thống quản lý luận văn.
                    </Text>
                </Col>
                <Col>
                    <Button size="large" ghost icon={<ClockCircleOutlined />}>
                        Xem lịch sử hoạt động
                    </Button>
                </Col>
            </Row>
        </Card>

        {/* 2. THỐNG KÊ TỔNG QUAN (GRID 4) */}
        <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
            <Col xs={12} sm={6}>
                <StatCard title="Tổng luận văn" value={totalTheses} icon={<BookOutlined style={{color: '#18d8ffff'}}/>} color="#18c9ffff" bgColor="#e6f7ff" />
            </Col>
            <Col xs={12} sm={6}>
                <StatCard title="Đã Công Khai" value={findCountByStatus("approved_public")} icon={<CheckCircleOutlined style={{color: '#52c41a'}}/>} color="#52c41a" bgColor="#f6ffed" />
            </Col>
            <Col xs={12} sm={6}>
                <StatCard title="Nộp nội bộ" value={findCountByStatus("submitted_internal")} icon={<ClockCircleOutlined style={{color: '#1418faff'}}/>} color="#1814faff" bgColor="#e6f7ff" />
            </Col>
            <Col xs={12} sm={6}>
                <StatCard title="Bị Từ Chối" value={findCountByStatus("rejected_public")} icon={<CloseCircleOutlined style={{color: '#f5222d'}}/>} color="#f5222d" bgColor="#fff0f6" />
            </Col>
        </Row>

        <Row gutter={[24, 24]}>
            {/* === CỘT TRÁI (65%) === */}
            <Col xs={24} lg={16}>
                
                {/* 3. DANH SÁCH CẦN DUYỆT (LIST VIEW) */}
                <Card 
                    title={<Title level={5} style={{margin:0}}>📌 Cần xử lý ngay ({pendingThesis.length})</Title>}
                    extra={<a href="/lecturer/share-requests">Xem tất cả</a>}
                    style={{ borderRadius: 16, marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                >
                    <List
                        itemLayout="horizontal"
                        dataSource={pendingThesis}
                        locale={{ emptyText: <Empty description="Tuyệt vời! Không có yêu cầu nào tồn đọng." image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
                        renderItem={item => (
                            <List.Item
                                actions={[
                                    <Button type="link" size="small" href="/lecturer/share-requests">Xử lý</Button>
                                ]}
                            >
                                <List.Item.Meta
                                    avatar={<Avatar style={{ backgroundColor: '#faad14' }} icon={<ClockCircleOutlined />} />}
                                    title={item.title}
                                    description={
                                        <Space size="middle" style={{ fontSize: 12 }}>
                                            <Text type="secondary"><UserOutlined /> {item.owner?.name || "Sinh viên"}</Text>
                                            <Tag color="orange">Chờ duyệt</Tag>
                                        </Space>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                </Card>

                {/* 4. BIỂU ĐỒ THỐNG KÊ (PIE CHART) */}
                <Card 
                    title={<Title level={5} style={{margin:0}}><PieChartOutlined /> Tỷ lệ trạng thái luận văn</Title>}
                    style={{ borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                >
                    <div style={{ height: 300, width: '100%' }}>
                        {chartData.length > 0 ? (
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <Empty description="Chưa có dữ liệu thống kê" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        )}
                    </div>
                </Card>
            </Col>

            {/* === CỘT PHẢI (35%) === */}
            <Col xs={24} lg={8}>
                
                {/* 5. THÔNG BÁO MỚI (TIMELINE STYLE) */}
                <Card 
                    title={<Title level={5} style={{margin:0}}><BellOutlined /> Thông báo mới</Title>}
                    extra={<a href="/notification">Chi tiết</a>}
                    style={{ borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', height: '100%' }}
                    styles={{
                        body:{ padding: "0 24px"}
                    }}
                >
                    <List
                        dataSource={notifications.slice(0, 6)}
                        renderItem={item => (
                            <List.Item style={{ padding: '16px 0' }}>
                                <List.Item.Meta
                                    title={
                                        // 1. Dùng div và flex để căn giữa chấm tròn và chữ
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <Badge 
                                                status="processing" 
                                                color="#1890ff" 
                                                style={{ marginRight: 8 }} 
                                            />
                                            {/* 2. Kiểm tra kỹ xem field là item.title hay item.message */}
                                            <Text style={{ fontSize: 13, fontWeight: 500 }}>
                                                {item.title || item.message || 'Thông báo không có tiêu đề'}
                                            </Text>
                                        </div>
                                    }
                                    description={
                                        <Text type="secondary" style={{ fontSize: 11 }}>
                                            {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Vừa xong'}
                                        </Text>
                                    }
                                />
                            </List.Item>
                        )}
                        locale={{ emptyText: <Empty description="Không có thông báo mới" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
                    />
                </Card>
            </Col>
        </Row>
      </div>
      <div style={{ height: 40 }} />
    </>
  );
};

export default DashboardSupervisorPage;