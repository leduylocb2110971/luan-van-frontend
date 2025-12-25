import React from "react";
import { Tag } from "antd"; // Import Tag từ Ant Design
// Import bộ Icon tương ứng
import { 
    EditOutlined, 
    SafetyCertificateOutlined, 
    ClockCircleOutlined, 
    CheckCircleOutlined, 
    CloseCircleOutlined,
    QuestionCircleOutlined 
} from "@ant-design/icons";

// --- CẤU HÌNH MAPPING TRẠNG THÁI ---
const STATUS_CONFIG = {
    // 1. Nháp: Màu xám trung tính (Default)
    draft: { 
        color: "default", 
        icon: <EditOutlined />, 
        label: "Bản nháp" 
    }, 
    
    // 2. Nội bộ: Màu xanh đậm (Geekblue) hoặc Cyan - Thể hiện tính chất lưu trữ/an toàn
    submitted_internal: { 
        color: "geekblue", 
        icon: <SafetyCertificateOutlined />, 
        label: "Đã duyệt (Nội bộ)" 
    }, 

    // 3. Chờ duyệt: Màu cam/vàng (Warning) - Thể hiện sự chờ đợi
    pending_public: { 
        color: "warning", 
        icon: <ClockCircleOutlined />, 
        label: "Chờ duyệt" 
    },

    // 4. Công khai: Màu xanh lá (Success) - Thể hiện thành công
    approved_public: { 
        color: "green", 
        icon: <CheckCircleOutlined />, 
        label: "Đã duyệt (Công khai)" 
    },

    // 5. Từ chối: Màu đỏ (Error)
    rejected_public: { 
        color: "error", 
        icon: <CloseCircleOutlined />, 
        label: "Bị từ chối" 
    },
};

const StatusTag = ({ status }) => {
    // Lấy config dựa trên status, nếu không tìm thấy thì fallback về "draft" hoặc hiển thị mặc định
    const config = STATUS_CONFIG[status] || { 
        color: "default", 
        icon: <QuestionCircleOutlined />, 
        label: "Không xác định" 
    };

    return (
        <Tag 
            color={config.color} 
            icon={config.icon}
            style={{ 
                fontSize: '13px', 
                padding: '4px 10px', 
                borderRadius: '6px', // Bo góc nhẹ cho mềm mại
                display: 'inline-flex', // Căn chỉnh icon và chữ thẳng hàng
                alignItems: 'center',
                gap: '4px',
                fontWeight: 500,
                border: 'none' // (Tùy chọn) Bỏ viền nếu muốn style phẳng hoàn toàn
            }}
        >
            {config.label}
        </Tag>
    );
};

export default StatusTag;