import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

// ANT DESIGN IMPORTS
import { 
    Select, Spin, Row, Col, Card, Statistic, Divider, Table, 
    Typography, Empty, Progress, Tag 
} from "antd";
import { 
    RiseOutlined, 
    FileTextOutlined, 
    PieChartOutlined, 
    BarChartOutlined,
    CalendarOutlined 
} from '@ant-design/icons';

// RECHARTS IMPORTS
import { 
    BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, 
    Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell 
} from 'recharts';

import BreadcrumbComponent from "../../../components/BreadcrumbComponent/BreadcrumbComponent";
import * as SupervisorService from "../../../services/SupervisorService";
import * as Messages from "../../../components/Message/Message";

const { Title, Text } = Typography;

// --- CONFIG MÀU SẮC & STYLE ---
const COLORS = ['#3ba0ff', '#36cfc9', '#fadd14', '#ff85c0', '#b37feb', '#ff9c6e', '#5cdbd3', '#95de64'];
const cardStyle = { 
    borderRadius: 16, 
    boxShadow: '0 4px 12px rgba(0,0,0,0.03)', 
    border: 'none',
    height: '100%' 
};

// --- CUSTOM TOOLTIP CHO BIỂU ĐỒ ---
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ background: '#fff', padding: '10px', border: '1px solid #f0f0f0', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <p style={{ fontWeight: 'bold', marginBottom: 5 }}>{label || payload[0].name}</p>
                <p style={{ color: payload[0].fill, margin: 0 }}>
                    {payload[0].name}: {payload[0].value} luận văn
                </p>
            </div>
        );
    }
    return null;
};

// --- COMPONENT BIỂU ĐỒ CỘT ---
const ThesisTotalBarChart = ({ data }) => {
    const chartData = data.map(item => ({
        year: item._id,
        count: item.count
    }));

    return (
        <ResponsiveContainer width="100%" height={300}>
            <RechartsBarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#8c8c8c' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8c8c8c' }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f5f5f5' }} />
                <Bar dataKey="count" name="Số lượng" fill="url(#colorUv)" radius={[4, 4, 0, 0]} barSize={40} />
                <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1890ff" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#1890ff" stopOpacity={0.3}/>
                    </linearGradient>
                </defs>
            </RechartsBarChart>
        </ResponsiveContainer>
    );
};

// --- COMPONENT BIỂU ĐỒ TRÒN ---
const FieldPieChart = ({ data }) => {
    if (!data || data.length === 0) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có dữ liệu phân bố" />;
    
    return (
        <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
                <Pie
                    data={data}
                    dataKey="count"
                    nameKey="field_name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60} // Donut chart nhìn hiện đại hơn
                    outerRadius={100}
                    paddingAngle={5}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </RechartsPieChart>
        </ResponsiveContainer>
    );
};

const ThesisStatisticsPage = () => {
    const navigate = useNavigate();
    const currentSupervisorId = useSelector(state => state.auth?.user?.id);
    
    // STATE
    const currentYear = new Date().getFullYear().toString();
    const [selectedYear, setSelectedYear] = useState(currentYear);

    const yearOptions = useMemo(() => {
        const years = [];
        for (let i = 0; i < 5; i++) {
            years.push({ value: (new Date().getFullYear() - i).toString(), label: ` ${new Date().getFullYear() - i}` });
        }
        return years;
    }, []);

    // FETCH DATA
    const thesisCountQuery = useQuery({
        queryKey: ['thesisCountByYear'],
        queryFn: SupervisorService.getThesisCountByYear,
        select: (data) => data?.data,
    });

    const fieldDistributionQuery = useQuery({
        queryKey: ['fieldDistribution', selectedYear],
        queryFn: () => SupervisorService.getFieldDistribution(selectedYear),
        select: (data) => data?.data,
    });

    const personalDistributionQuery = useQuery({
        queryKey: ['personalDistribution', selectedYear], 
        queryFn: () => SupervisorService.getPersonalDistribution(selectedYear), 
        enabled: !!currentSupervisorId,
        select: (data) => data?.data,
    });

    // DATA PROCESSING
    const processedFieldDistribution = useMemo(() => {
        if (!fieldDistributionQuery.data) return [];
        const data = fieldDistributionQuery.data;
        const totalCount = data.reduce((sum, item) => sum + item.count, 0);
        return data.map(item => ({
            ...item,
            field_name: item.field_name || item._id || 'Chưa xác định', 
            percentage: totalCount > 0 ? (item.count / totalCount) * 100 : 0,
            totalCount: totalCount
        })).sort((a, b) => b.count - a.count);
    }, [fieldDistributionQuery.data]);

    const processedPersonalDistribution = useMemo(() => {
        if (!personalDistributionQuery.data) return [];
        const data = personalDistributionQuery.data;
        const totalCount = data.reduce((sum, item) => sum + item.count, 0);
        return data.map(item => ({
            ...item,
            field_name: item.field_name || item._id || 'Chưa xác định', 
            percentage: totalCount > 0 ? (item.count / totalCount) * 100 : 0,
            totalCount: totalCount
        })).sort((a, b) => b.count - a.count);
    }, [personalDistributionQuery.data]);
    
    const personalTotal = processedPersonalDistribution.length > 0 ? processedPersonalDistribution[0].totalCount : 0; 

    // COLUMNS TABLE
    const columns = [
        { 
            title: '#', 
            dataIndex: 'rank', 
            key: 'rank', 
            render: (text, record, index) => <Tag color="default">#{index + 1}</Tag>, 
            width: 60 
        },
        { 
            title: 'Lĩnh vực / Chủ đề', 
            dataIndex: 'field_name', 
            key: 'field_name',
            render: (text) => <Text strong>{text}</Text>
        },
        { 
            title: 'Số lượng', 
            dataIndex: 'count', 
            key: 'count', 
            sorter: (a, b) => a.count - b.count, 
            width: 120,
            align: 'center'
        },
        { 
            title: 'Tỷ trọng', 
            dataIndex: 'percentage', 
            key: 'percentage', 
            width: 200,
            render: (percentage) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Progress 
                        percent={parseFloat(percentage.toFixed(1))} 
                        size="small" 
                        strokeColor={percentage > 30 ? '#ff4d4f' : '#1890ff'}
                        showInfo={false}
                        style={{ width: 100 }}
                    />
                    <Text type="secondary" style={{ fontSize: 12 }}>{percentage.toFixed(1)}%</Text>
                </div>
            )
        },
    ];

    const isLoading = thesisCountQuery.isLoading || fieldDistributionQuery.isLoading || personalDistributionQuery.isLoading;

    if (isLoading) {
        return <div style={{ textAlign: 'center', padding: '100px 0' }}><Spin size="large" tip="Đang tổng hợp số liệu..." /></div>;
    }

    return (
        <>
            <BreadcrumbComponent customNameMap={{ "thesis-statistics": "Thống kê", "lecturer": "Giảng viên" }} />

            <div style={{ margin: '0 auto', paddingBottom: 40 }}>
                {/* --- HEADER CONTROL --- */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div>
                        <Title level={3} style={{ margin: 0 }}>📊 Thống Kê & Xu Hướng</Title>
                        <Text type="secondary">Phân tích số liệu luận văn và xu hướng nghiên cứu</Text>
                    </div>
                    <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <CalendarOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                        <span style={{ marginRight: 8, fontWeight: 500 }}>Năm báo cáo:</span>
                        <Select
                            value={selectedYear} 
                            style={{ width: 100 }}
                            onChange={setSelectedYear}
                            options={yearOptions}
                            variant="borderless"
                        />
                    </div>
                </div>

                {/* --- 1. THỐNG KÊ CÁ NHÂN (HIGHLIGHT) --- */}
                <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                    <Col xs={24} md={6}>
                        <Card style={{ ...cardStyle, background: 'linear-gradient(135deg, #0050b3 0%, #1890ff 100%)' }} styles={{body:{ padding: "24px"}}} >
                            <Statistic
                                title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>Luận văn Bạn hướng dẫn ({selectedYear})</span>}
                                value={personalTotal}
                                precision={0}
                                valueStyle={{ color: '#fff', fontSize: 48, fontWeight: 'bold' }}
                                prefix={<FileTextOutlined />}
                            />
                            <div style={{ marginTop: 16, color: 'rgba(255,255,255,0.7)' }}>
                                Đóng góp vào thành tích chung của Khoa
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} md={18}>
                        <Card title={<><PieChartOutlined /> Phân bố Chủ đề Hướng dẫn của Bạn</>} style={cardStyle}>
                            <Row align="middle">
                                <Col span={14}>
                                    <FieldPieChart data={processedPersonalDistribution} />
                                </Col>
                                <Col span={10}>
                                    {processedPersonalDistribution.length > 0 ? (
                                        <div>
                                            <Text strong style={{ display: 'block', marginBottom: 12 }}>Top lĩnh vực:</Text>
                                            {processedPersonalDistribution.slice(0, 3).map((item, idx) => (
                                                <div key={idx} style={{ marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <span><Tag color={COLORS[idx]}>#{idx+1}</Tag> {item.field_name}</span>
                                                    <Text strong>{item.count}</Text>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <Empty description="Bạn chưa có luận văn nào năm nay" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                    )}
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>

                <Divider style={{ margin: '32px 0' }} />

                {/* --- 2. XU HƯỚNG TOÀN HỆ THỐNG --- */}
                <Row gutter={[24, 24]}>
                    <Col span={24}>
                        <Card title={<><BarChartOutlined /> Xu hướng Số lượng Luận văn qua các năm</>} style={cardStyle}>
                            <ThesisTotalBarChart data={thesisCountQuery.data || []} />
                        </Card>
                    </Col>
                </Row>

                <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                    <Col xs={24} lg={10}>
                        <Card title={`Cơ cấu Lĩnh vực Nghiên cứu (${selectedYear})`} style={cardStyle}>
                            <FieldPieChart data={processedFieldDistribution} />
                        </Card>
                    </Col>
                    <Col xs={24} lg={14}>
                        <Card title="Chi tiết Phân bố Lĩnh vực" style={cardStyle}>
                            <Table 
                                columns={columns} 
                                dataSource={processedFieldDistribution} 
                                rowKey="field_name"
                                pagination={{ pageSize: 5, hideOnSinglePage: true }}
                                size="middle"
                            />
                        </Card>
                    </Col>
                </Row>
            </div>
        </>
    );
};

export default ThesisStatisticsPage;