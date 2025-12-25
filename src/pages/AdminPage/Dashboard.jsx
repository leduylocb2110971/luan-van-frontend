import React, { useEffect, useState } from "react";
import { Card, Row, Col, Typography, Spin, Tabs } from "antd";
import { 
    CheckCircleOutlined, 
    SolutionOutlined, 
    TeamOutlined, 
    ClockCircleOutlined, 
    CloseCircleOutlined,
    UserOutlined,
    BarChartOutlined,
    LineChartOutlined
} from '@ant-design/icons';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line, CartesianGrid
} from "recharts";
import * as AuthService from "../../services/AuthService";

const { Title } = Typography;

// --- CUSTOM COMPONENTS ---
// 1. Thẻ thống kê (Stat Card) đẹp hơn
const StatCard = ({ title, value, icon, color, bgColor }) => (
    <Card
        hoverable
        style={{
            borderRadius: 12,
            overflow: 'hidden', // Để icon background không tràn ra ngoài
            height: '100%',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            position: 'relative' // Để absolute icon
        }}
        styles={{
                body:{ padding: "20px 24px"}
            }}
    >
        <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ color: '#8c8c8c', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
                {title}
            </div>
            <div style={{ color: '#262626', fontSize: 32, fontWeight: 'bold', lineHeight: 1 }}>
                {value}
            </div>
        </div>
        
        {/* Icon trang trí mờ ở góc phải */}
        <div style={{
            position: 'absolute',
            right: -10,
            bottom: -10,
            fontSize: 80,
            color: color,
            opacity: 0.15,
            transform: 'rotate(-15deg)',
            zIndex: 1
        }}>
            {icon}
        </div>

        {/* Thanh màu nhỏ bên trái */}
        <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 4,
            backgroundColor: color
        }} />
    </Card>
);

// 2. Custom Tooltip cho biểu đồ
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ background: '#fff', padding: '10px 15px', border: '1px solid #f0f0f0', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <p style={{ fontWeight: 'bold', marginBottom: 5 }}>{label}</p>
                <p style={{ color: payload[0].color, margin: 0 }}>
                    {payload[0].name}: <strong>{payload[0].value}</strong>
                </p>
            </div>
        );
    }
    return null;
};

const Dashboard = () => {
    const [thesisStats, setThesisStats] = useState(null);
    const [userStats, setUserStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('thesis');

    // LOGIC GIỮ NGUYÊN
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const thesisRes = await AuthService.getThesisStats();
                if (thesisRes?.status === 'success') setThesisStats(thesisRes.data);

                const userRes = await AuthService.getUserStats();
                if (userRes?.status === 'success') setUserStats(userRes.data);
            } catch (error) {
                console.error("Lỗi khi lấy thống kê:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- RENDER THESIS STATS ---
    const renderThesisStats = () => {
        if (!thesisStats) return <div style={{ textAlign: 'center', padding: 40 }}>Không có dữ liệu.</div>;

        const totalTheses = thesisStats.byStatus.reduce((sum, item) => sum + item.count, 0);
        const findCountByStatus = (statusKey) => thesisStats.byStatus.find(item => item.status === statusKey)?.count || 0;
        
        const formattedMonthlyData = thesisStats.byMonth.map(item => ({
            ...item,
            name: `${item.dataLabel.split('-')[1]}/${item.dataLabel.split('-')[0]}` 
        }));

        const statCards = [
            { title: "Tổng số Luận văn", value: totalTheses, icon: <SolutionOutlined />, color: '#1890ff' },
            { title: "Đã Duyệt", value: findCountByStatus('approved_public'), icon: <CheckCircleOutlined />, color: '#52c41a' },
            { title: "Chờ Duyệt", value: findCountByStatus('pending_public'), icon: <ClockCircleOutlined />, color: '#faad14' },
            { title: "Bị Từ Chối", value: findCountByStatus('rejected_public'), icon: <CloseCircleOutlined />, color: '#f5222d' },
        ];

        return (
            <div style={{ marginTop: 16 }}>
                {/* 1. STAT CARDS */}
                <Row gutter={[24, 24]}>
                    {statCards.map((card, index) => (
                        <Col key={index} xs={24} sm={12} lg={6}>
                            <StatCard {...card} />
                        </Col>
                    ))}
                </Row>

                {/* 2. CHARTS SECTION */}
                <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                    {/* Biểu đồ cột: Phân bố theo Chủ đề */}
                    <Col xs={24} lg={12}>
                        <Card title={<><BarChartOutlined /> Top Chủ đề Phổ biến</>}  style={{ borderRadius: 12, height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                            <ResponsiveContainer width="100%" height={320}>
                                <BarChart layout="vertical" data={thesisStats.byField} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="field" type="category" width={120} tick={{ fontSize: 12 }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="count" name="Số lượng" fill="#1890ff" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>

                    {/* Biểu đồ đường: Xu hướng theo tháng */}
                    <Col xs={24} lg={12}>
                        <Card title={<><LineChartOutlined /> Xu hướng Nộp bài</>} style={{ borderRadius: 12, height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                            <ResponsiveContainer width="100%" height={320}>
                                <LineChart data={formattedMonthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend verticalAlign="top" height={36} />
                                    <Line type="monotone" dataKey="count" stroke="#722ed1" strokeWidth={3} name="Số lượng nộp" activeDot={{ r: 6 }} dot={{ r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    };

    // --- RENDER USER STATS ---
    const renderUserStats = () => {
        if (!userStats) return <div style={{ textAlign: 'center', padding: 40 }}>Không có dữ liệu.</div>;

        const totalUsers = userStats.byRole.reduce((sum, item) => sum + item.count, 0);
        const activeUsers = userStats.byActiveStatus.find(item => item.isActive)?.count || 0;
        
        const formattedMonthlyData = userStats.byRegistrationMonth.map(item => ({
            ...item,
            name: `${item.dataLabel.split('-')[1]}/${item.dataLabel.split('-')[0]}` 
        }));

        const statCards = [
            { title: "Tổng Người dùng", value: totalUsers, icon: <UserOutlined />, color: '#1890ff' },
            { title: "Đang hoạt động", value: activeUsers, icon: <CheckCircleOutlined />, color: '#52c41a' },
            { title: "Giảng viên", value: userStats.byRole.find(item => item.role === 'lecturer')?.count || 0, icon: <SolutionOutlined />, color: '#faad14' },
            { title: "Sinh viên", value: userStats.byRole.find(item => item.role === 'student')?.count || 0, icon: <TeamOutlined />, color: '#eb2f96' },
        ];

        return (
            <div style={{ marginTop: 16 }}>
                <Row gutter={[24, 24]}>
                    {statCards.map((card, index) => (
                        <Col key={index} xs={24} sm={12} lg={6}>
                            <StatCard {...card} />
                        </Col>
                    ))}
                </Row>

                <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                    <Col span={24}>
                        <Card title={<><LineChartOutlined /> Tăng trưởng Người dùng Mới</>} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                            <ResponsiveContainer width="100%" height={350}>
                                <LineChart data={formattedMonthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend verticalAlign="top" height={36} />
                                    <Line type="monotone" dataKey="count" stroke="#13c2c2" strokeWidth={3} name="Đăng ký mới" activeDot={{ r: 6 }} dot={{ r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    };

    // --- MAIN RENDER ---
    const tabItems = [
        { key: 'thesis', label: <span style={{fontSize: 16}}>📊 Thống kê Luận văn</span>, children: renderThesisStats() },
        { key: 'user', label: <span style={{fontSize: 16}}>👥 Thống kê Người dùng</span>, children: renderUserStats() },
    ];

    return (
        <div > {/* Padding bao quanh content */}
            <Spin spinning={loading} tip="Đang tải dữ liệu...">
                {/* Header Page */}
                <div style={{ marginBottom: 24, marginTop: 16 }}>
                    <Title level={2} style={{ margin: 0 }}>Dashboard Quản Trị</Title>
                </div>

                <Tabs 
                    activeKey={activeTab} 
                    onChange={setActiveTab} 
                    items={tabItems} 
                    size="large"
                    type="line"
                    tabBarStyle={{ marginBottom: 24 }}
                />
            </Spin>
        </div>
    );
};

export default Dashboard;