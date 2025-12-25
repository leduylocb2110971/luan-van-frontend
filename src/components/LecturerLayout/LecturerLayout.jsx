import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import DefaultLayout from '../DefaultLayout/DefaultLayout';
import LecturerSidebarComponent from '../LecturerSidebarComponent/LecturerSidebarComponent';
// Import Button và Icon của Ant Design
import { Button } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';

const LecturerLayout = () => {
    const [isCollapsed, setIsCollapsed] = useState(false); 

    const handleCollapse = () => {
        setIsCollapsed(prev => !prev);
    };

    // Chiều rộng Sidebar khi mở và đóng (Cần phải đồng bộ với LecturerSidebarComponent)
    const sidebarWidth = isCollapsed ? 80 : 250; 

    return (
        <DefaultLayout fluid> 
            <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)', position: 'relative' }}>
                
                {/* 1. Sidebar */}
                <LecturerSidebarComponent 
                    isCollapsed={isCollapsed} 
                    // Truyền width xuống để tính toán CSS cho nút
                    style={{ width: sidebarWidth, }} 
                />
                
                {/* 2. Nút Collapse nhỏ, cố định vị trí */}
                <Button 
                    type="default" // Có thể dùng primary/ghost tùy ý
                    shape="circle"
                    onClick={handleCollapse} 
                    icon={isCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    size="small"
                    style={{
                        position: 'absolute',
                        // Đặt nút cách mép Sidebar một khoảng nhỏ
                        left: `${sidebarWidth - 16}px`, 
                        top: 20, // Đặt ở vị trí cố định
                        zIndex: 10, // Đảm bảo nút nằm trên nội dung
                        transition: 'left 0.2s', // Tạo hiệu ứng chuyển động mượt mà
                        // Thêm box shadow nhẹ để nổi bật
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)', 
                    }}
                />
                
                {/* 3. Vùng Nội dung chính */}
                <div 
                    style={{ 
                        flex: 1, 
                        padding: 12, 
                        // Cần thêm padding/margin để tránh nút bị che khuất nội dung
                        marginLeft: isCollapsed ? 12 : 12, 
                        overflow: 'auto' 
                    }}
                >
                    <Outlet />
                </div>
            </div>
        </DefaultLayout>
    );
};

export default LecturerLayout;