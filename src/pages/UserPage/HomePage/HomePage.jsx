import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

// --- ANT DESIGN IMPORTS ---
import { 
    Row, Col, Card, Button, Input, Tabs, Tag, Typography, 
    Skeleton, Badge, Space, Tooltip, Divider 
} from "antd";
import { 
    SearchOutlined, BookOutlined, DownloadOutlined, UserOutlined, 
    FireOutlined, EyeOutlined, ArrowRightOutlined, CalendarOutlined, 
    CloudUploadOutlined, StarOutlined 
} from "@ant-design/icons";

// --- COMPONENTS & SERVICES CỦA BẠN ---
import DefaultLayout from "../../../components/DefaultLayout/DefaultLayout";
import CounterComponent from "../../../components/CounterComponent/CounterComponent";
import FavoriteButonComponent from "../../../components/FavoriteButtonComponent/FavoriteButtonComponent";
import TrendingOverview from "../../../components/TrendingOverview/TrendingOverview";
import * as TheSisService from "../../../services/TheSisService";
import * as CategoryService from "../../../services/CategoryService";
import * as ViewHistoryService from "../../../services/ViewHistoryService";

const { Title, Text, Paragraph } = Typography;

// --- CSS STYLES (INLINE ĐỂ DỄ QUẢN LÝ) ---
const styles = {
    heroSection: {
        background: "linear-gradient(135deg, #003366 0%, #0056b3 100%)", // Gradient xanh hiện đại
        padding: "60px 20px 90px",
        textAlign: "center",
        color: "white",
        borderRadius: "0 0 50% 50% / 20px",
        marginBottom: "40px",
        position: "relative",
    },
    statCard: {
        background: "rgba(255, 255, 255, 0.1)", // Hiệu ứng kính mờ
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        borderRadius: "16px",
        padding: "20px",
        textAlign: "center",
        color: "white",
        height: "100%",
        boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
    },
    sectionHeader: {
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "20px"
    },
    cardHover: {
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        transition: "all 0.3s ease",
        height: "100%",
        border: "none"
    }
};

const HomePage = () => {
    const user = useSelector((state) => state.auth.user);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("newest"); // Tab mặc định

    // ================== 1. PHẦN LOGIC (GIỮ NGUYÊN TỪ CODE CŨ) ==================

    // Lấy categories
    const queryGetAllCategories = useQuery({
        queryKey: ["getAllCategories"],
        queryFn: CategoryService.getCategories,
    });
    const { data: responseCategories, isLoading: isLoadingCategories } = queryGetAllCategories;
    const categories = responseCategories?.data || [];

    // Lấy luận văn (Main List)
    const queryGetAllThesis = useQuery({
        queryKey: ["getAllThesis", activeTab],
        queryFn: () => TheSisService.getAllTheSis({
            sort: activeTab,
            limit: 6,
        }), 
    });
    const { data: response, isLoading } = queryGetAllThesis;
    const theses = response?.data?.theses || [];
    const totalTheses = response?.data?.total || 0;

    // Lấy luận văn gợi ý (Suggested)
    const querySuggestThesis = useQuery({
        queryKey: ["suggestThesisFromViewHistory"],
        enabled: !!user, // Chỉ chạy khi đã đăng nhập
        queryFn: () => ViewHistoryService.suggestThesisFromViewHistory(),
    });
    const { data: responseSuggestThesis } = querySuggestThesis;
    const suggestedTheses = responseSuggestThesis?.data?.theses || [];
    console.log("Suggested Theses:", suggestedTheses);

    // Map màu sắc cho Categories (Giữ logic cũ nhưng hiển thị đẹp hơn)
    const categoryMap = {
        "Kinh tế": { emoji: "💰", color: "#FFD700" },
        "CNTT và Truyền thông": { emoji: "💻", color: "#1E90FF" },
        "Bách khoa": { emoji: "⚙️", color: "#FF4500" },
        "Xã hội Nhân văn": { emoji: "🌍", color: "#32CD32" },
        "Sư phạm": { emoji: "🎓", color: "#8A2BE2" },
        "Nông nghiệp": { emoji: "🌾", color: "#FF69B4" },
        "Thủy sản": { emoji: "🐟", color: "#00CED1" },
        "Luật": { emoji: "⚖️", color: "#FF6347" },
        "Viện công nghệ sinh học và thực phẩm": { emoji: "🔬", color: "#20B2AA" },
        "Khoa học tự nhiên": { emoji: "🔭", color: "#FF8C00" },
        "Môi trường": { emoji: "🌳", color: "#228B22" },
    };

    // ================== 2. HELPER RENDER CARD ==================
    const renderThesisCard = (thesis) => (
        <Col xs={24} sm={12} md={12} lg={8} key={thesis._id}>
            {/* Badge hiển thị Ngành học */}
                <Card
                    hoverable
                    style={styles.cardHover}
                    styles={{
                        body:{padding: "16px", flex: 1, display: "flex", flexDirection: "column"}
                    }}
                    cover={
                        <div style={{ 
                            position: "relative", 
                            height: "220px", // 🔽 GIẢM CHIỀU CAO (Trước là 220px)
                            overflow: "hidden", 
                            backgroundColor: "#f0f2f5", // Màu nền xám nhẹ làm nổi bật ảnh
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderBottom: "1px solid #f0f0f0" // Thêm đường kẻ nhẹ ngăn cách với nội dung
                        }}>
                            <img
                                alt={thesis.title}
                                src={`${import.meta.env.VITE_API_URL}${thesis.thumbnail}`}
                                style={{ 
                                    // 🔽 GIỮ TỶ LỆ ẢNH NHƯNG THU GỌN LẠI
                                    height: "100%", 
                                    width: "auto", // Để width tự động theo tỷ lệ ảnh
                                    maxWidth: "100%", // Không tràn chiều ngang
                                    objectFit: "contain", 
                                    transition: "transform 0.5s",
                                    padding: "10px", // 🔽 TĂNG PADDING: Tạo khoảng hở để ảnh không bị "ngộp"
                                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)" // Thêm bóng nhẹ cho ảnh tài liệu nổi lên
                                }}
                                onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.1)"}
                                onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
                                onClick={() => navigate(`/thesis/${thesis._id}`)}
                            />
                            <div style={{ position: "absolute", top: 10, right: 10, zIndex: 2 }}>
                                <FavoriteButonComponent thesisId={thesis._id} />
                            </div>
                        </div>
                    }
                >
                    {/* Tiêu đề */}
                    <div style={{ marginBottom: 8 }}>
                        <Tag color="blue">{thesis.major?.name}</Tag>
                    </div>
                    <Tooltip title={thesis.title}>
                        <Title 
                            level={5} 
                            ellipsis={{ rows: 2 }} 
                            style={{ marginBottom: 8, height: '50px', cursor: 'pointer', fontSize: '16px' }}
                            onClick={() => navigate(`/thesis/${thesis._id}`)}
                        >
                            {thesis.title}
                        </Title>
                    </Tooltip>

                    {/* Thông tin tác giả & GVHD */}
                    <Space direction="vertical" size={2} style={{ marginBottom: 16, width: '100%' }}>
                        <Text type="secondary" style={{ fontSize: 13 }} ellipsis>
                            <UserOutlined style={{ marginRight: 6 }} /> TG: <strong>{thesis.authorName}</strong>
                        </Text>
                        <Text type="secondary" style={{ fontSize: 13 }} ellipsis>
                            <BookOutlined style={{ marginRight: 6 }} /> GVHD: {thesis.supervisorName || "N/A"}
                        </Text>
                    </Space>

                    {/* Footer Stats */}
                    <div style={{ marginTop: "auto", paddingTop: 12, borderTop: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center", color: "#888", fontSize: 12 }}>
                        <Space size={10}>
                            <span><EyeOutlined /> {thesis.views || 0}</span>
                            <span><DownloadOutlined /> {thesis.downloads || 0}</span>
                        </Space>
                        <Button type="link" size="small" style={{ padding: 0, fontWeight: 600 }} onClick={() => navigate(`/thesis/${thesis._id}`)}>
                            Chi tiết <ArrowRightOutlined />
                        </Button>
                    </div>
                </Card>
        </Col>
    );

    // ================== 3. RENDER GIAO DIỆN ==================
    return (
        <DefaultLayout>
            
            {/* --- HERO SECTION --- */}
            <div style={styles.heroSection}>
                <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                    <Title level={1} style={{ color: "white", marginBottom: 16 }}>
                        Hệ thống Quản lý & Chia sẻ Luận văn
                    </Title>
                    <Paragraph style={{ color: "rgba(255,255,255,0.9)", fontSize: 18, marginBottom: 30 }}>
                        Tìm kiếm, tải xuống và tham khảo hàng ngàn tài liệu chất lượng cao
                    </Paragraph>

                    {/* Search Input thay thế SearchComponent cũ để đẹp hơn */}
                    <div style={{ maxWidth: 600, margin: "0 auto 40px" }}>
                        <Input.Search
                            placeholder="🔍 Tìm kiếm đề tài, tác giả..."
                            enterButton={<Button type="primary" size="large" style={{ background: '#FFD700', borderColor: '#FFD700', color: '#333', fontWeight: 'bold' }}>Tìm kiếm</Button>}
                            size="large"
                            // onSearch={(val) => navigate(`/thesis?search=${val}`)}
                            // Trong HomePage.jsx
                            onSearch={(val) => navigate(`/thesis?search=${encodeURIComponent(val)}`)}
                            style={{ borderRadius: "8px" }}
                        />
                    </div>

                    {/* Stats Cards Glassmorphism */}
                    <Row gutter={[24, 24]} justify="center">
                        <Col xs={24} sm={8} md={6}>
                            <div style={styles.statCard}>
                                <BookOutlined style={{ fontSize: 32, color: "#FFD700", marginBottom: 10 }} />
                                <Title level={2} style={{ color: "white", margin: 0 }}>
                                    <CounterComponent end={10000} duration={2.5} suffix="+" />
                                </Title>
                                <Text style={{ color: "rgba(255,255,255,0.8)" }}>Luận văn</Text>
                            </div>
                        </Col>
                        <Col xs={24} sm={8} md={6}>
                            <div style={styles.statCard}>
                                <DownloadOutlined style={{ fontSize: 32, color: "#00FFAB", marginBottom: 10 }} />
                                <Title level={2} style={{ color: "white", margin: 0 }}>
                                    <CounterComponent end={50000} duration={2.5} suffix="+" />
                                </Title>
                                <Text style={{ color: "rgba(255,255,255,0.8)" }}>Lượt tải</Text>
                            </div>
                        </Col>
                        <Col xs={24} sm={8} md={6}>
                            <div style={styles.statCard}>
                                <UserOutlined style={{ fontSize: 32, color: "#ff6b6b", marginBottom: 10 }} />
                                <Title level={2} style={{ color: "white", margin: 0 }}>
                                    <CounterComponent end={2000} duration={2.5} suffix="+" />
                                </Title>
                                <Text style={{ color: "rgba(255,255,255,0.8)" }}>Sinh viên</Text>
                            </div>
                        </Col>
                    </Row>
                </div>
            </div>

            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
                
                {/* --- CATEGORIES SECTION --- */}
                <div style={{ marginBottom: 50, textAlign: 'center' }}>
                    <Title level={3} style={{ marginBottom: 20 }}>🏷️ Khám phá theo Khoa</Title>
                    {isLoadingCategories ? <Skeleton.Input active block style={{width: 300}} /> : (
                        <Space wrap size={[8, 12]} justify="center">
                            {categories?.map((cat) => (
                                <Tag.CheckableTag
                                    key={cat._id}
                                    checked={false}
                                    onChange={() => navigate(`/thesis?categories=${cat._id}&open=categories`)}
                                    style={{ 
                                        fontSize: 14, 
                                        padding: "8px 20px", 
                                        borderRadius: "50px", 
                                        border: "1px solid #d9d9d9", 
                                        cursor: "pointer", 
                                        background: "white",
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    {/* Hiển thị Emoji nếu có trong map, không thì mặc định */}
                                    {categoryMap[cat.name]?.emoji || "📁"} {cat.name}
                                </Tag.CheckableTag>
                            ))}
                        </Space>
                    )}
                </div>

                {/* --- MAIN CONTENT LAYOUT (Row/Col) --- */}
                <Row gutter={40}>
                    
                    {/* CỘT TRÁI: DANH SÁCH LUẬN VĂN (Chiếm 17/24 cột) */}
                    <Col xs={24} lg={17}>
                        
                        {/* 1. Gợi ý dành cho bạn */}
                        {suggestedTheses?.length > 0 && (
                            <div style={{ marginBottom: 40 }}>
                                <div style={styles.sectionHeader}>
                                    <Title level={3} style={{ margin: 0 }}><StarOutlined style={{color: '#faad14'}} /> Gợi ý dành cho bạn</Title>
                                </div>
                                <Row gutter={[16, 24]}>
                                    {suggestedTheses.slice(0, 3).map(renderThesisCard)}
                                </Row>
                                <Divider />
                            </div>
                        )}

                        {/* 2. Danh sách luận văn chính */}
                        <div>
                            <div style={styles.sectionHeader}>
                                <Title level={3} style={{ margin: 0 }}>📌 Luận văn nổi bật</Title>
                                <Button type="link" onClick={() => navigate('/thesis')} style={{ fontSize: 16 }}>
                                    Xem tất cả <ArrowRightOutlined />
                                </Button>
                            </div>

                            {/* Tabs AntD thay cho Tabs thủ công */}
                            <Tabs
                                activeKey={activeTab}
                                onChange={setActiveTab}
                                type="card"
                                size="large"
                                items={[
                                    { key: "newest", label: <span>🆕 Mới nhất</span> },
                                    { key: "views", label: <span>👁️ Xem nhiều</span> },
                                    { key: "downloads", label: <span>⬇️ Tải nhiều</span> },
                                ]}
                                style={{ marginBottom: 20 }}
                            />

                            {/* Grid hiển thị luận văn */}
                            {isLoading ? <Skeleton active paragraph={{ rows: 6 }} /> : (
                                <Row gutter={[16, 24]}>
                                    {theses?.length > 0 ? (
                                        theses.map(renderThesisCard)
                                    ) : (
                                        <Col span={24}>
                                            <div style={{ textAlign: 'center', padding: '60px 0', background: '#f9f9f9', borderRadius: 8 }}>
                                                <Text type="secondary">Chưa có luận văn nào trong mục này.</Text>
                                            </div>
                                        </Col>
                                    )}
                                </Row>
                            )}
                        </div>
                    </Col>

                    {/* CỘT PHẢI: SIDEBAR (Chiếm 7/24 cột) */}
                    <Col xs={24} lg={7}>
                        {/* Sticky Container */}
                        <div style={{ position: "sticky", top: 100 }}>
                            
                            {/* Upload Banner (Gradient) */}
                            <div style={{ 
                                background: "linear-gradient(to right, #4facfe 0%, #00f2fe 100%)", 
                                borderRadius: "16px",
                                padding: "30px 20px",
                                textAlign: "center",
                                color: "white",
                                marginBottom: "30px",
                                boxShadow: "0 10px 20px rgba(79, 172, 254, 0.3)"
                            }}>
                                <CloudUploadOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                                <Title level={3} style={{ color: "white", margin: "0 0 8px 0" }}>Chia sẻ tài liệu?</Title>
                                <Paragraph style={{ color: "rgba(255,255,255,0.9)", marginBottom: 24 }}>
                                    Đóng góp luận văn của bạn để giúp đỡ cộng đồng sinh viên.
                                </Paragraph>
                                <Link to="/upload">
                                    <Button size="large" shape="round" style={{ height: '45px', padding: '0 30px', fontWeight: 'bold', color: '#0056b3', border: 'none' }}>
                                        Upload ngay
                                    </Button>
                                </Link>
                            </div>

                            {/* Trending Widget */}
                            <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", border: "1px solid #f0f0f0" }}>
                                <Title level={4} style={{ marginBottom: 20 }}>🔥 Xu hướng tìm kiếm</Title>
                                <TrendingOverview />
                            </div>

                        </div>
                    </Col>
                </Row>
            </div>

            {/* Spacer cuối trang */}
            <div style={{ height: 60 }} />
        </DefaultLayout>
    );
};

export default HomePage;