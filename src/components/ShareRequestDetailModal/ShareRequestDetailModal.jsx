import React, { useMemo } from "react";
import { Modal, Descriptions, Tag, Timeline, Spin, Button, Avatar, Card, Space, Typography, Tooltip } from "antd";
import { useQuery } from "@tanstack/react-query";
import { 
    FileTextOutlined, 
    UserOutlined, 
    ClockCircleOutlined, 
    CheckCircleOutlined, 
    CloseCircleOutlined,
    SyncOutlined,
    DownloadOutlined,
    ReadOutlined,
    RobotOutlined
} from "@ant-design/icons";
import * as SharingService from "../../services/SharingService";

const { Text, Title } = Typography;

const ShareRequestDetailModal = ({ visible, onClose, dataTable, selectedKey }) => {
    const request = useMemo(() => dataTable?.find(item => item.key === selectedKey) || null, [dataTable, selectedKey]);
    console.log("Selected Request:", request);
    
    const { data: confirmations, isLoading } = useQuery({
        queryKey: ["getConfirmations", request?.sharingId],
        queryFn: () => SharingService.getConfirmations(request?.sharingId),
        enabled: visible && !!request?.sharingId,
    });

    if (!request) return null;

    // --- Helper: Màu trạng thái ---
    const getStatusInfo = (status) => {
        switch (status) {
            case "approved": return { color: "success", text: "Đã duyệt", icon: <CheckCircleOutlined /> };
            case "rejected": return { color: "error", text: "Từ chối", icon: <CloseCircleOutlined /> };
            case "pending": return { color: "processing", text: "Chờ duyệt", icon: <SyncOutlined spin /> };
            case "cancelled": return { color: "warning", text: "Đã bị huỷ", icon: <CloseCircleOutlined /> };
            default: return { color: "default", text: status, icon: null };
        }
    };

    // --- Helper: Render Timeline Item ---
    const renderTimelineItems = () => {
        const data = Array.isArray(confirmations?.data) ? confirmations.data : [];
        if (data.length === 0) return <Text type="secondary">Chưa có thông tin xác nhận.</Text>;

        return data.map((item) => {
            const statusInfo = getStatusInfo(item.status);
            const isDone = item.status === 'approved' || item.status === 'rejected';
            
            return {
                color: statusInfo.color === 'processing' ? 'blue' : (statusInfo.color === 'error' ? 'red' : 'green'),
                children: (
                    <div style={{ paddingBottom: 10 }}>
                        <Space align="start" style={{ width: '100%', justifyContent: 'space-between' }}>
                            <Space>
                                <Avatar 
                                    size="small" 
                                    icon={<UserOutlined />} 
                                    src={item.user?.avatar ? `${import.meta.env.VITE_API_URL}${item.user.avatar}` : null} 
                                />
                                <div>
                                    <Text strong>{item.user?.name || item.user?.email || "Người dùng ẩn"}</Text>
                                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                                        {item.byRole === 'lecturer' ? 'Giảng viên' : (item.byRole === 'student' ? 'Đồng tác giả' : 'Quản trị viên')}
                                    </div>
                                </div>
                            </Space>
                            <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
                        </Space>
                        
                        {/* Ghi chú nếu có */}
                        {item.reason && (
                            <div style={{ marginTop: 8, background: '#f5f5f5', padding: '8px 12px', borderRadius: 6, fontSize: 13, borderLeft: '3px solid #d9d9d9' }}>
                                <Text italic>{item.reason}</Text>
                            </div>
                        )}
                        
                        {/* Thời gian */}
                        {isDone && (
                            <div style={{ marginTop: 4, fontSize: 11, color: '#bfbfbf' }}>
                                <ClockCircleOutlined /> {new Date(item.updatedAt).toLocaleString("vi-VN")}
                            </div>
                        )}
                    </div>
                ),
            };
        });
    };

    const statusBadge = getStatusInfo(request.status);

    return (
        <Modal
            title={
                <Space>
                    <FileTextOutlined style={{ color: '#1890ff' }} /> 
                    <span style={{ fontSize: 16 }}>Chi tiết yêu cầu</span>
                </Space>
            }
            open={visible}
            onCancel={onClose}
            footer={
                <Button onClick={onClose}>Đóng</Button>
            }
            width={700}
            centered
        >
            <div style={{ maxHeight: '75vh', overflowY: 'auto', paddingRight: 4 }}>
                
                {/* --- 1. Header Card: Thông tin cơ bản --- */}
                <Card 
                    size="small" 
                    style={{ background: '#f9f9f9', marginBottom: 24, borderRadius: 8 }}
                >
                    <Space align="start" style={{ width: '100%', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div>
                            <Title level={5} style={{ margin: 0, color: '#1890ff' }}>
                                {request.title}
                            </Title>
                            <Space style={{ marginTop: 4, fontSize: 12, color: '#595959' }}>
                                <span><ClockCircleOutlined /> Gửi lúc: {new Date(request.createdAt).toLocaleString("vi-VN")}</span>
                            </Space>
                        </div>
                        <Tag icon={statusBadge.icon} color={statusBadge.color} style={{ fontSize: 14, padding: '4px 10px' }}>
                            {statusBadge.text}
                        </Tag>
                    </Space>

                    <Descriptions column={1} size="small" labelStyle={{ fontWeight: 600, color: '#595959', width: 140 }}>
                        <Descriptions.Item label="Sinh viên">
                            {request.authorName} 
                            {(request.coAuthorsNames?.length > 0) && <Text type="secondary"> (+ {request.coAuthorsNames.join(', ')})</Text>}
                        </Descriptions.Item>
                        <Descriptions.Item label="GVHD">
                            {request.supervisorName}
                        </Descriptions.Item>
                        <Descriptions.Item label="Hành động">
                            <Space>
                                {request.fileUrl && (
                                    <Button 
                                        type="dashed" size="small" icon={<DownloadOutlined />} 
                                        href={`${import.meta.env.VITE_API_URL}${request.fileUrl}`} target="_blank"
                                    >
                                        Tải PDF
                                    </Button>
                                )}
                                <Button 
                                    type="primary" ghost size="small" icon={<ReadOutlined />}
                                    onClick={() => window.open(`/thesis/${request.thesisId}`, "_blank")}
                                >
                                    Xem Luận văn
                                </Button>
                            </Space>
                        </Descriptions.Item>
                    </Descriptions>
                </Card>

                {/* --- 2. Timeline: Tiến trình duyệt --- */}
                <div>
                    <Title level={5} style={{ marginBottom: 16 }}>
                        <RobotOutlined /> Tiến trình phê duyệt
                    </Title>
                    
                    {isLoading ? (
                        <div style={{ textAlign: 'center', padding: 20 }}><Spin /></div>
                    ) : (
                        <div style={{ padding: '0 12px' }}>
                            <Timeline items={renderTimelineItems()} />
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default ShareRequestDetailModal;