import React from "react";
import { Segmented } from "antd"; 
import { 
    AppstoreOutlined, 
    UploadOutlined, 
    ClockCircleOutlined, 
    CheckCircleOutlined, 
    CloseCircleOutlined 
} from "@ant-design/icons";

// --- CẤU HÌNH DỮ LIỆU ---
const STATUS_OPTIONS = [
    { 
        value: "", 
        label: "Tất cả", 
        icon: <AppstoreOutlined />, 
        color: "#1890ff" // Xanh dương
    },
    { 
        value: "submitted_internal", 
        label: "Nội bộ", 
        icon: <UploadOutlined />, 
        color: "#13c2c2" // Xanh ngọc
    },
    { 
        value: "pending_public", 
        label: "Chờ duyệt", 
        icon: <ClockCircleOutlined />, 
        color: "#fa8c16" // Cam
    },
    { 
        value: "approved_public", 
        label: "Đã duyệt", 
        icon: <CheckCircleOutlined />, 
        color: "#52c41a" // Xanh lá
    },
    { 
        value: "rejected_public", 
        label: "Từ chối", 
        icon: <CloseCircleOutlined />, 
        color: "#ff4d4f" // Đỏ
    },
];

const StatusFilterComponent = ({ selectedStatus, onChange }) => {
    
    // Xử lý map dữ liệu sang format của Segmented
    const segmentedOptions = STATUS_OPTIONS.map((opt) => ({
        value: opt.value,
        label: (
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: 8,
                padding: '4px 4px'
            }}>
                {/* Icon hiển thị màu sắc riêng biệt */}
                <span style={{ fontSize: '16px', color: opt.color, display: 'flex' }}>
                    {opt.icon}
                </span>
                {/* Chữ hiển thị */}
                <span style={{ fontWeight: 500 }}>
                    {opt.label}
                </span>
            </div>
        ),
    }));

    return (
        <div style={{ 
            overflowX: 'auto', // Cho phép cuộn ngang trên điện thoại nếu màn hình quá bé
            paddingBottom: 2,  // Tránh bị cắt bóng đổ
            whiteSpace: 'nowrap' // Giữ các nút trên 1 dòng
        }}>
            <Segmented
                options={segmentedOptions}
                value={selectedStatus}
                onChange={onChange}
                size="middle" // Kích thước lớn dễ bấm
                style={{
                    backgroundColor: '#f0f2f5', // Nền xám nhạt hiện đại
                    padding: 4,
                    borderRadius: 8,
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)', // Đổ bóng nhẹ vào trong tạo chiều sâu
                    fontWeight: 500
                }}
            />
        </div>
    );
};

export default StatusFilterComponent;