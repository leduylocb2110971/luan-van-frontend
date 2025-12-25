import React, { useMemo } from "react";
import { Menu, Tooltip } from "antd";
import {
    DashboardOutlined,
    CalendarOutlined,
    TeamOutlined,
    LogoutOutlined,
    BookOutlined,
    PieChartOutlined,
} from "@ant-design/icons";
import { FaUserGraduate, FaBook } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

// LOGIC LOGOUT GIẢ ĐỊNH
const confirmLogout = () => { console.log('Confirming logout...'); };

const LecturerSidebarComponent = ({ isCollapsed, width = 250 }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // 1. Menu items
    const lecturerMenuItems = useMemo(() => [
        { key: "/lecturer/dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
        { key: "/lecturer/all-theses", icon: <BookOutlined />, label: "Danh sách đề tài" },
        { 
            key: "management", 
            icon: <BookOutlined />, 
            label: "Quản lý luận văn", 
            children: [
                { key: "/lecturer/supervised", label: "Luận văn đã hướng dẫn" },
                { key: "/lecturer/share-requests", label: "Luận văn chờ duyệt" },
            ]
        },
        { key: "/lecturer/all-supervisors", icon: <TeamOutlined />, label: "Giảng viên" },
        { key: "/lecturer/thesis-statistics", icon: <PieChartOutlined />, label: "Thống kê luận văn" },
        { key: "/logout", icon: <LogoutOutlined />, label: <span onClick={confirmLogout}>Đăng xuất</span> },
    ], []);

    // 2. Handle menu click
    const handleMenuClick = ({ key }) => {
        if (key === "/logout") return;
        navigate(key);
    };

    // 3. Selected menu key
    const selectedKey = location.pathname;

    return (
        <div
            style={{
                position: 'sticky',
                top: 64,
                height: 'calc(100vh - 64px)',
                width: isCollapsed ? 80 : width,
                minHeight: '100vh',
                transition: 'width 0.3s',
                background: 'linear-gradient(180deg, #ffffff 0%, #e6f7ff 100%)',
                borderRight: '1px solid #f0f0f0',
                display: 'flex',
                flexDirection: 'column',
                flexShrink: 0,
                boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
            }}
        >
            {/* Logo / Header */}
            <div
                style={{
                    height: '64px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isCollapsed ? "center" : "flex-start",
                    padding: "0 16px",
                    fontWeight: 700,
                    fontSize: isCollapsed ? 20 : 22,
                    letterSpacing: "0.5px",
                    color: '#1890ff',
                    transition: "all 0.3s",
                    background: 'linear-gradient(90deg, #bfdbf5ff, #71b8f3ff)',
                    borderRadius: '0 8px 8px 0',
                }}
            >
                {isCollapsed ? "T" : "ThesisExtract"}
            </div>

            {/* Menu */}
            <Menu
                mode="inline"
                theme="light"
                inlineCollapsed={isCollapsed}
                onClick={handleMenuClick}
                selectedKeys={[selectedKey]}
                style={{
                    borderRight: 'none',
                    flex: 1,
                    background: 'transparent',
                    fontWeight: 500,
                    fontSize: 14,
                }}
                items={lecturerMenuItems.map(item => ({
                    ...item,
                    label: isCollapsed ? <Tooltip title={item.label}>{item.label}</Tooltip> : item.label,
                    style: {
                        borderRadius: 6,
                        margin: '4px 8px',
                        transition: 'all 0.2s',
                    },
                }))}
            />

            {/* Optional footer / quick action */}
            <div style={{ padding: '16px', textAlign: 'center', borderTop: '1px solid #f0f0f0' }}>
                {!isCollapsed && <span style={{ color: '#8c8c8c', fontSize: 12 }}>© 2025 ThesisExtract</span>}
            </div>
        </div>
    );
};

export default LecturerSidebarComponent;
