import React, { useMemo } from "react";
import { 
    Modal, 
    Descriptions, 
    Tag, 
    Tooltip, 
    Card, 
    Button, 
    Tabs,
    Empty,
} from "antd";
import { 
    FilePdfOutlined, 
    DownloadOutlined, 
    InfoCircleOutlined, 
    EyeOutlined,
    UserOutlined,
    BookOutlined,
    CalendarOutlined
} from "@ant-design/icons";
import ThesisViewer from "../ThesisViewer/ThesisViewer";

const statusColors = {
    approved_public: { color: "success", text: "Công khai" },
    submitted_internal: { color: "processing", text: "Nội bộ" },
    rejected_public: { color: "error", text: "Bị từ chối" }, 
    default: { color: "default", text: "Riêng tư/Khác" },
};

const ThesisDetailComponent = ({ visible, onClose, dataTable, selectedKey }) => {
    
    const request = useMemo(() => {
        return dataTable?.find(item => item.key === selectedKey) || null;
    }, [dataTable, selectedKey]);
    
    if (!request) return null;

    // --- Xử lý logic hiển thị Tác giả (Giữ nguyên) ---
    const renderAuthors = () => {
        const coAuthors = Array.isArray(request.coAuthorsNames) ? request.coAuthorsNames : [];
        
        if (coAuthors.length > 0) {
            const allAuthors = [request.authorName, ...coAuthors].filter(name => name && name !== "Chưa cập nhật");
            const displayedAuthors = allAuthors.slice(0, 3);
            
            return (
                <Tooltip title={allAuthors.join(", ")}>
                    <Tag color="blue">{displayedAuthors.join(", ") + (allAuthors.length > 3 ? '...' : '')}</Tag>
                </Tooltip>
            );
        }
        
        return request.authorName && request.authorName !== "Chưa cập nhật" 
            ? <Tag color="blue">{request.authorName}</Tag> 
            : <Tag color="default">Chưa cập nhật</Tag>;
    };

    const statusInfo = statusColors[request.status] || statusColors.default;
    
    // --- Nội dung Tab Thông tin Chi tiết (ĐÃ SỬA ĐỔI GIAO DIỆN) ---
    const detailTabContent = (
        <div style={{ padding: '0 10px' }}>
            {/* 1. Tiêu đề Luận văn (Header lớn) */}
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1890ff', marginBottom: 20 }}>
                {request.title || "Chưa cập nhật"}
            </h2>
            
            {/* 2. THÔNG TIN CHUNG VÀ TÁC GIẢ (Sử dụng Card và Descriptions không viền) */}
            
            <Card 
                title={<span style={{ fontWeight: 'bold' }}><BookOutlined /> Thông tin Đề tài</span>}
                size="small"
                style={{ marginBottom: 20 }}
            >
                <Descriptions 
                    size="middle"
                    // CHUYỂN SANG KHÔNG VIỀN VÀ SỬ DỤNG 3 CỘT CHO CÁC MỤC NGẮN
                    column={{ xs: 1, sm: 2, md: 3 }} 
                    labelStyle={{ fontWeight: 600, color: '#595959' }}
                >
                    <Descriptions.Item label="Khoa/Viện">{request.category || "N/A"}</Descriptions.Item>
                    <Descriptions.Item label="Chuyên ngành">{request.major || "N/A"}</Descriptions.Item>
                    <Descriptions.Item label="Chủ đề">{request.field || "N/A"}</Descriptions.Item>

                    <Descriptions.Item label="Năm thực hiện">{request.year || "N/A"}</Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                        <Tag color={statusInfo.color} style={{ fontWeight: 'bold' }}>
                            {statusInfo.text}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Mã luận văn">
                        <Tag color="cyan">{request.key}</Tag>
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            <Card 
                title={<span style={{ fontWeight: 'bold' }}><UserOutlined /> Tác giả & Hướng dẫn</span>}
                size="small"
                style={{ marginBottom: 20 }}
            >
                 <Descriptions 
                    size="middle"
                    bordered={false} 
                    column={2} 
                    labelStyle={{ fontWeight: 600, color: '#595959' }}
                >
                    <Descriptions.Item label="GVHD">
                        <Tag color="purple">{request.supervisorName || "N/A"}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Sinh viên">{renderAuthors()}</Descriptions.Item>
                 </Descriptions>
            </Card>

            {/* 3. TẢI XUỐNG */}
            <Card
                title={<span style={{ fontWeight: 'bold' }}><DownloadOutlined /> Tài liệu đính kèm</span>}
                size="small"
            >
                 <Descriptions 
                    size="middle"
                    bordered={false} 
                    column={1} 
                    labelStyle={{ fontWeight: 600, color: '#595959' }}
                >
                    <Descriptions.Item label="File Luận văn">
                        {request.fileUrl ? (
                            <Button
                                href={`${import.meta.env.VITE_API_URL}${request.fileUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                icon={<DownloadOutlined />}
                                type="primary"
                                size="large" // Tăng kích thước nút
                            >
                                Tải xuống File Gốc (PDF)
                            </Button>
                        ) : (
                            <Tag color="error">Chưa có file đính kèm</Tag>
                        )}
                    </Descriptions.Item>
                 </Descriptions>
            </Card>

        </div>
    );

    // --- Nội dung Tab Xem trước File (Giữ nguyên) ---
    const viewerTabContent = (
        <Card 
            
            styles={{
                body:{ padding:0}
            }}
            style={{ minHeight: 600, maxHeight: 'calc(100vh - 300px)', overflow: 'auto' }}
        >
            {request.fileUrl ? (
                <ThesisViewer fileUrl={request.fileUrl} thesisId={request.key} />
            ) : (
                <Empty 
                    description="Không có file để xem trước." 
                    style={{ padding: 50 }}
                />
            )}
        </Card>
    );
    
    // --- Cấu hình Tabs (Giữ nguyên) ---
    const items = [
        {
            key: '1',
            label: <span style={{ fontSize: '15px' }}><InfoCircleOutlined /> Thông tin chi tiết</span>,
            children: detailTabContent,
        },
        {
            key: '2',
            label: <span style={{ fontSize: '15px' }}><EyeOutlined /> Xem trước File</span>,
            children: viewerTabContent,
            disabled: !request.fileUrl,
        },
    ];

    return (
        <Modal
            open={visible}
            onCancel={onClose}
            footer={null}
            width={900} 
            style={{ top: 20 }}
        >
            <Tabs defaultActiveKey="1" items={items} size="large" />
        </Modal>
    );
}

export default ThesisDetailComponent;