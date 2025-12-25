import React from 'react';
import { Modal, Tag, Descriptions, Spin } from 'antd';
import DefaultAvatar from '../../assets/default-avatar.jpg'; 

const handleError = (e) => {
    e.target.src = DefaultAvatar;
    e.target.onError = null;
};

// Hàm chuyển đổi role để hiển thị đẹp hơn
const convertRole = (role) => {
    switch (role) {
        case "student":
            return "Sinh viên";
        case "lecturer":
            return "Giảng viên";
        case "admin":
            return "Admin";
        default:
            return role;
    }
}

const UserDetailModal = ({ isOpen, onClose, userData, isLoading }) => {
    
    // Nếu userData chưa có hoặc đang tải, không cần tạo items
    if (!userData && !isLoading) return null;

    // --- LOGIC XÂY DỰNG ITEMS DÙNG SPREAD SYNTAX CHO GỌN GÀNG ---
    
    // 1. Khai báo các items cơ bản
    const baseItems = [
        {
            key: 'name',
            label: 'Tên đầy đủ',
            children: userData?.name || <em style={{ color: "#999" }}>Chưa cập nhật</em>,
            span: 3, // Chiếm toàn bộ chiều rộng
        },
        {
            key: 'email',
            label: 'Email',
            children: userData?.email,
            span: 3, // Chiếm toàn bộ chiều rộng
        },
        {
            key: 'Khoa',
            label: 'Khoa',
            // Sử dụng Optional Chaining (?) để tránh lỗi nếu department là null
            children: userData?.department?.name || <em style={{ color: "#999" }}>Chưa cập nhật</em>,
            span: 3,
        },
    ];

    // 2. Tạo items tùy chỉnh theo Vai trò (MSSV/MSCB & Chuyên ngành)
    const roleSpecificItems = (
        userData?.role === 'student' ? [
            { // Item Chuyên ngành cho sinh viên
                key: 'major',
                label: 'Chuyên ngành',
                children: userData?.major?.name || <em style={{ color: "#999" }}>Chưa cập nhật</em>,
                span: 3,
            },
            { // Item MSSV cho sinh viên
                key: 'Mssv',
                label: 'MSSV',
                children: userData?.mssv || <em style={{ color: "#999" }}>Chưa cập nhật</em>,
                span: 3,
            }
        ] : [
            { // Item MSCB cho Giảng viên/Admin
                key: 'mscb',
                label: 'MSCB',
                children: userData?.staffId || <em style={{ color: "#999" }}>Chưa cập nhật</em>,
                span: 3,
            }
        ]
    );

    // 3. Tạo các items Trạng thái (Tags)
    const statusItems = [
        {
            key: 'role',
            label: 'Vai trò',
            children: <Tag color={userData?.role === 'student' ? 'blue' : 'green'}>{convertRole(userData?.role)}</Tag>,
            span: 1, // Chia 3 cột
        },
        {
            key: 'status',
            label: 'Trạng thái',
            children: (
                <Tag color={userData?.isActive ? "success" : "error"}>
                    {userData?.isActive ? "Đang hoạt động" : "Đã khóa"}
                </Tag>
            ),
            span: 1, // Chia 3 cột
        },
        // {
        //     key: 'verified',
        //     label: 'Xác thực',
        //     children: (
        //         <Tag color={userData?.isVerified ? "success" : "warning"}>
        //             {userData?.isVerified ? "Đã duyệt" : "Chưa duyệt"}
        //         </Tag>
        //     ),
        //     span: 1, // Chia 3 cột
        // },
    ];

    // Gộp tất cả items lại
    const items = [
        ...baseItems,
        ...roleSpecificItems,
        ...statusItems,
    ];

    return (
        <Modal
            title="Chi tiết Người dùng"
            open={isOpen}
            onCancel={onClose}
            footer={null}
            centered
            width={600}
        >
            <Spin spinning={isLoading}>
                {userData ? (
                    <div style={{ padding: "10px" }}>
                        {/* Khu vực Avatar */}
                        <div style={{ textAlign: 'center', marginBottom: 20 }}>
                            <img 
                                src={userData.avatar ? `${import.meta.env.VITE_API_URL}${userData.avatar}` : DefaultAvatar} 
                                alt="Avatar"
                                onError={handleError}
                                style={{
                                    width: "90px", // Tăng kích thước avatar 1 chút
                                    height: "90px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    border: '3px solid #f0f0f0', // Thêm viền nhẹ
                                }} 
                            />
                            {/* Tên được làm nổi bật hơn */}
                            <h3 style={{ marginTop: 10, fontWeight: 600, color: '#333' }}>{userData.name || userData.email}</h3> 
                        </div>

                        {/* Chi tiết bằng Descriptions */}
                        <Descriptions 
                            bordered 
                            // Layout: 1 cột trên mobile, 2 cột trên sm, 3 cột trên md (Tag items sẽ chia 3)
                            column={{ xs: 1, sm: 2, md: 3 }} 
                            items={items}
                            size="default" // Đặt size default để Descriptions dễ nhìn hơn
                            style={{ backgroundColor: '#fff' }}
                        />
                    </div>
                ) : (
                    !isLoading && <p style={{ textAlign: 'center', padding: 20 }}>Không tìm thấy dữ liệu người dùng.</p>
                )}
            </Spin>
        </Modal>
    );
};

export default UserDetailModal;