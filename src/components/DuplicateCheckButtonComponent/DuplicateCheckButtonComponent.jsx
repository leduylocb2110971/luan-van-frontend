import React, { useState } from "react";
import { Form, Button, List, Typography, Modal, Progress, Result, Card, Tag, Divider, Row, Col, Alert } from "antd";
import { 
    SafetyCertificateOutlined, 
    ScanOutlined, 
    FileSearchOutlined, 
    ArrowLeftOutlined,
    LinkOutlined,
    FileTextOutlined,
    FontSizeOutlined,
    TagsOutlined,
    InfoCircleOutlined,
    WarningOutlined,
    CheckCircleOutlined,
    StopOutlined, 
    ExclamationCircleOutlined
} from "@ant-design/icons";
import * as TheSisService from "../../services/TheSisService";
import * as Message from "../Message/Message";

const { Text, Title } = Typography;

const DuplicateCheckButtonComponent = ({ 
    form,
    fieldsToValidate = ["title", "tom_tat", "keywords"],
    thesisData, 
    buttonProps = {},
    // --- 1. NHẬN THÊM PROPS TỪ CHA ---
    externalResult = null,  // Kết quả check tự động từ cha
    externalOpen = false,   // Lệnh mở modal từ cha
    onClose                 // Hàm để báo cha tắt modal
}) => {
    const [loading, setLoading] = useState(false);
    // State nội bộ (dùng khi bấm nút thủ công)
    const [internalResult, setInternalResult] = useState(null); 
    const [isInternalOpen, setIsInternalOpen] = useState(false);
    
    const [selectedItem, setSelectedItem] = useState(null); 

    // --- 2. HỢP NHẤT DỮ LIỆU & TRẠNG THÁI ---
    // Ưu tiên dùng dữ liệu của Cha (nếu có), nếu không thì dùng của Con
    const duplicateResult = externalResult || internalResult;
    const isModalOpen = externalOpen || isInternalOpen;

    const prepareKeywords = (keywordsValue) => {
        if (!keywordsValue) return [];
        if (Array.isArray(keywordsValue)) return keywordsValue.map(String).filter(k => k.trim());
        if (typeof keywordsValue === 'string') return keywordsValue.split(",").map(k => k.trim()).filter(k => k);
        return [];
    };

    const getScoreStatus = (score) => {
        if (score >= 95) return { 
            color: '#cf1322', 
            icon: <StopOutlined />, 
            text: 'DỮ LIỆU ĐÃ TỒN TẠI / SAO CHÉP', 
            status: 'exception',
            bg: '#fff1f0',
            borderColor: '#ffa39e',
            description: 'Nội dung trùng khớp hoàn toàn với dữ liệu cũ. Giảng viên có thể TỪ CHỐI bài nộp này.'
        }; 
        if (score >= 80) return { 
            color: '#ff4d4f', 
            icon: <WarningOutlined />, 
            text: 'Cảnh báo: Trùng lặp lớn', 
            status: 'exception',
            bg: '#fff2f0',
            borderColor: '#ffccc7',
            description: 'Phát hiện nhiều đoạn văn bản giống hệt tài liệu khác. Cần kiểm tra lại tính mới.'
        };
        if (score >= 50) return { 
            color: '#faad14', 
            icon: <InfoCircleOutlined />, 
            text: 'Có tính kế thừa/Tham khảo', 
            status: 'active',
            bg: '#fffbe6',
            borderColor: '#ffe58f',
            description: 'Nội dung có sự tương đồng với các nghiên cứu trước đây.'
        };
        return { 
            color: '#52c41a', 
            icon: <CheckCircleOutlined />, 
            text: 'Hợp lệ: Nội dung độc lập', 
            status: 'success',
            bg: '#f6ffed',
            borderColor: '#b7eb8f',
            description: 'Chưa tìm thấy tài liệu trùng lặp trong hệ thống.'
        };
    };

    // Hàm này chạy khi bấm nút "Kiểm tra trùng lặp" thủ công
    const handleCheckDuplicate = async () => {
        // Reset kết quả cũ
        setInternalResult(null);
        setSelectedItem(null);
        
        // Nếu cha đang truyền externalResult vào thì phải gọi onClose để clear nó đi đã, tránh xung đột
        if (onClose) onClose();

        let checkData = null;

        try {
            setLoading(true);
            if (form) {
                const values = await form.validateFields(fieldsToValidate);
                checkData = {
                    title: values.title,
                    tom_tat: values.tom_tat || "",
                    keywords: prepareKeywords(values.keywords),
                };
            } else if (thesisData) {
                checkData = {
                    title: thesisData.title,
                    tom_tat: thesisData.tom_tat || "",
                    keywords: prepareKeywords(thesisData.keywords),
                    thesisId: thesisData?.thesisId
                };
            }

            const result = await TheSisService.checkDuplicateThesis(
                checkData.title,
                checkData.tom_tat,
                checkData.keywords,
                checkData?.thesisId
            );

            const results = result?.data || [];
            results.sort((a, b) => (b.similarity || 0) - (a.similarity || 0));
            
            // Cập nhật vào state NỘI BỘ
            setInternalResult(results);
            setIsInternalOpen(true);

        } catch (error) {
            if (error.errorFields) {
                Message.warning("Vui lòng điền Tiêu đề và Từ khóa trước khi kiểm tra.");
            } else {
                Message.error("Lỗi: " + (error.message || "Không thể kết nối server"));
            }
        } finally {
            setLoading(false);
        }
    };

    // --- 3. XỬ LÝ ĐÓNG MODAL ---
    const handleCloseModal = () => {
        setIsInternalOpen(false); // Đóng state nội bộ
        setSelectedItem(null);
        if (onClose) onClose();   // Báo cho Cha biết để đóng state của Cha (nếu đang mở tự động)
    };

    const renderDetailView = () => {
        if (!selectedItem) return null;
        const { details, title, authorName, id, _id } = selectedItem;
        const thesisId = id || _id;
        const scores = details || { title_score: 0, abstract_score: 0, keywords_score: 0 };
        const totalScore = Math.round((selectedItem.similarity || 0) * 100);
        
        return (
            <div>
                <Button 
                    icon={<ArrowLeftOutlined />} 
                    onClick={() => setSelectedItem(null)} 
                    style={{ marginBottom: 16, border: 'none', paddingLeft: 0, background: 'transparent' }}
                >
                    Quay lại kết quả
                </Button>

                {totalScore >= 95 && (
                    <Alert
                        message="CẢNH BÁO: PHÁT HIỆN SAO CHÉP NGHIÊM TRỌNG"
                        description="Hệ thống nhận thấy tài liệu này gần như là bản sao của bài cũ. Vui lòng kiểm tra: Có phải bạn đang nộp lại bài của chính mình? Hay bạn đang sử dụng trái phép bài của người khác?"
                        type="error"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />
                )}

                <Card 
                    title={<div style={{ whiteSpace: 'normal' }}>{title}</div>} 
                    style={{ background: '#f5f7fa', borderRadius: 8 }}
                    styles={{ header: { borderBottom: '1px solid #e8e8e8' } }}
                >
                    <div style={{ marginBottom: 20 }}>
                        <Tag color="blue">Tác giả gốc: {authorName || "N/A"}</Tag>
                        {/* Sửa lại chỗ lấy dữ liệu tác giả, nếu view từ list thì item có sẵn authorName */}
                        <Tag color={getScoreStatus(totalScore).color} style={{ fontWeight: 'bold' }}>
                            Giống nhau: {totalScore}%
                        </Tag>
                    </div>
                    
                    <div style={{marginBottom: 16}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 4}}>
                            <Text strong><FileTextOutlined /> Tương đồng Nội dung</Text>
                            <Text strong>{scores.abstract_score}%</Text>
                        </div>
                        <Progress percent={scores.abstract_score} strokeColor={getScoreStatus(scores.abstract_score).color} showInfo={false} />
                    </div>
                    
                    <div style={{marginBottom: 16}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 4}}>
                            <Text strong><FontSizeOutlined /> Tương đồng Tiêu đề</Text>
                            <Text strong>{scores.title_score}%</Text>
                        </div>
                        <Progress percent={scores.title_score} strokeColor={getScoreStatus(scores.title_score).color} showInfo={false} />
                    </div>

                    <div style={{marginBottom: 20}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 4}}>
                            <Text strong><TagsOutlined /> Trùng lặp Từ khóa</Text>
                            <Text strong>{scores.keywords_score}%</Text>
                        </div>
                        <Progress percent={scores.keywords_score} strokeColor={getScoreStatus(scores.keywords_score).color} steps={5} showInfo={false} />
                    </div>

                    <Divider />
                    <div style={{textAlign: 'center'}}>
                        <Button type="dashed" icon={<LinkOutlined />} href={`/thesis/${thesisId}`} target="_blank" block>
                            Xem bài gốc để đối chiếu
                        </Button>
                    </div>
                </Card>
            </div>
        );
    };

    const renderListView = () => {
        // Kiểm tra an toàn: duplicateResult có thể là null
        if (!duplicateResult || duplicateResult.length === 0) {
            return (
                <Result
                    status="success"
                    title="Nội dung hợp lệ"
                    subTitle="Không tìm thấy tài liệu nào trùng khớp trong hệ thống."
                    icon={<SafetyCertificateOutlined style={{ color: '#52c41a' }} />}
                    // extra={[<Button type="primary" key="close" onClick={handleCloseModal}>Đóng</Button>]}
                />
            );
        }

        const maxScore = Math.round((duplicateResult[0]?.similarity || 0) * 100);
        const overallStatus = getScoreStatus(maxScore);

        return (
            <div>
                {maxScore >= 95 && (
                    <Alert
                        message={<Text strong style={{fontSize: 15}}>PHÁT HIỆN TÀI LIỆU ĐÃ TỒN TẠI</Text>}
                        description={
                            <div style={{marginTop: 5}}>
                                Chỉ số trùng lặp <b>{maxScore}%</b> cho thấy bài nộp này <b>đã có trong hệ thống</b>.
                                <ul style={{paddingLeft: 20, marginTop: 5, marginBottom: 0}}>
                                    <li>Nếu bạn nộp trùng: Vui lòng kiểm tra lại.</li>
                                    <li>Giảng viên hướng dẫn sẽ nhìn thấy kết quả này và có thể TỪ CHỐI hoặc HỦY bài nộp của bạn.</li>
                                </ul>
                            </div>
                        }
                        type="error"
                        showIcon
                        icon={<ExclamationCircleOutlined style={{fontSize: 24}} />}
                        style={{ marginBottom: 16, border: '1px solid #ffccc7', background: '#fff1f0' }}
                    />
                )}

                <Card 
                    bordered={false} 
                    style={{ background: overallStatus.bg, border: `1px solid ${overallStatus.borderColor}`, marginBottom: 20, textAlign: 'center' }}
                >
                    <Row align="middle" justify="center">
                        <Col span={8}>
                            <Progress type="circle" percent={maxScore} strokeColor={overallStatus.color} width={80} strokeWidth={8} status={overallStatus.status} />
                        </Col>
                        <Col span={16} style={{textAlign: 'left'}}>
                            <Title level={4} style={{ margin: 0, color: overallStatus.color }}>
                                {overallStatus.text}
                            </Title>
                            <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                                {overallStatus.description}
                            </Text>
                        </Col>
                    </Row>
                </Card>

                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10}}>
                    <Text strong>Nguồn đối chiếu ({duplicateResult.length})</Text>
                    <Text type="secondary" style={{fontSize: 12}}>Độ giống giảm dần</Text>
                </div>

                <List
                    itemLayout="horizontal"
                    dataSource={duplicateResult}
                    pagination={{ pageSize: 3, size: 'small' }}
                    renderItem={(item) => {
                        const percent = Math.round((item.similarity || 0) * 100);
                        const status = getScoreStatus(percent);
                        return (
                            <List.Item 
                                style={{ padding: '12px 0' }}
                                actions={[
                                    <Button type="link" size="small" onClick={() => setSelectedItem(item)} danger={percent >= 95}>
                                        So sánh
                                    </Button>
                                ]}
                            >
                                <List.Item.Meta
                                    avatar={
                                        <div style={{textAlign: 'center', width: 45}}>
                                            <div style={{ fontWeight: 'bold', color: status.color, fontSize: 16 }}>{percent}%</div>
                                        </div>
                                    }
                                    title={<Text ellipsis={{ tooltip: item.title }} style={{ maxWidth: 350, display: 'block' }}>{item.title}</Text>}
                                    description={
                                        <div style={{fontSize: 12}}>
                                            {item.authorName && <span style={{marginRight: 8}}>TG: {item.authorName}</span>}
                                            {item.year && <span>Năm: {item.year}</span>}
                                        </div>
                                    }
                                />
                            </List.Item>
                        );
                    }}
                />
            </div>
        );
    };

    return (
        <>
            <Button icon={<ScanOutlined />} onClick={handleCheckDuplicate} loading={loading} {...buttonProps}>
                {loading ? "Đang quét..." : "Kiểm tra trùng lặp"}
            </Button>

            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FileSearchOutlined style={{ color: '#1890ff' }} />
                        <span>{selectedItem ? "So sánh chi tiết" : "Kiểm soát Liêm chính học thuật"}</span>
                    </div>
                }
                open={isModalOpen} // Dùng biến đã hợp nhất
                onCancel={handleCloseModal} // Hàm đóng đã xử lý cả 2 trường hợp
                footer={[<Button key="close" onClick={handleCloseModal}>Đóng</Button>]}
                width={650}
                centered
                styles={{ 
                    body: { padding: '20px 24px' } 
                }}
            >
                {duplicateResult === null ? (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <ScanOutlined spin style={{ fontSize: 30, color: '#1890ff', marginBottom: 10 }} />
                        <div>Đang đối chiếu dữ liệu hệ thống...</div>
                    </div>
                ) : (selectedItem ? renderDetailView() : renderListView())}
            </Modal>
        </>
    );
};

export default DuplicateCheckButtonComponent;