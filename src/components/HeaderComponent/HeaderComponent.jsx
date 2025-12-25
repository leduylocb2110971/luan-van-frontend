import React, { useMemo, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Dropdown, Avatar, Typography, Space, Button, Drawer, Grid, Menu } from "antd"; // Thêm Drawer, Grid, Menu
import { logout } from "../../redux/slice/authSlice";
import * as Message from "../Message/Message";
import * as AuthService from "../../services/AuthService";
import * as NotificationService from "../../services/NotificationService";
import NotificationComponent from "../NotificationComponent/NotificationComponent";
import CategoriesComponent from "../CategoriesComponent/CategoriesComponent";
import {
  HeaderWrapper,
  Logo,
  NavMenu,
  NavItem,
  AuthButtons,
  ExtraActions,
  IconButton,
} from "./style";
import LogoImage from "../../assets/logo-user.png";
import { useNavigate, useLocation } from "react-router-dom";

// Icons
import { FaUserGraduate, FaBook, FaHistory, FaChartBar, FaStar, FaSignOutAlt, FaUser } from "react-icons/fa";
import { MdAdminPanelSettings, MdOutlineInfo } from "react-icons/md";
import { UserOutlined, MenuOutlined, HomeOutlined, ContactsOutlined, UploadOutlined } from "@ant-design/icons"; // Thêm MenuOutlined

const { Text } = Typography;
const { useBreakpoint } = Grid; // Hook để check kích thước màn hình

const HeaderComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const screens = useBreakpoint(); // Check màn hình: screens.md = true (Desktop), false (Mobile)
  
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [openDrawer, setOpenDrawer] = useState(false); // State mở menu mobile

  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  const fetchNotifications = async () => {
    if (!user) return;
    const data = await NotificationService.getNotifications();
    setNotifications(data);
    setNotificationCount(data.filter((n) => !n.isRead).length);
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const handleLogoutUser = async () => {
    try {
      await AuthService.logoutUser();
      localStorage.removeItem("email");
      Message.success("Đăng xuất thành công");
      dispatch(logout());
      navigate("/login");
    } catch (error) {
      Message.error(error.message || "Đăng xuất thất bại");
    }
  };

  // --- MENU USER (DROPDOWN) ---
  const userMenuItems = useMemo(() => {
    const items = [
      {
        key: 'profile',
        label: 'Thông tin người dùng',
        icon: <FaUser style={{ color: "#1890ff" }} />,
        onClick: () => navigate("/profile"),
      },
    ];

    if (user?.role === "admin") {
      items.push({
        key: 'admin',
        label: 'Quản lý hệ thống',
        icon: <MdAdminPanelSettings style={{ color: "#ff4d4f" }} />,
        onClick: () => navigate("/admin/dashboard"),
      });
    }

    if (user?.role === "student") {
      items.push(
        {
          key: 'my-thesis',
          label: 'Quản lí luận văn',
          icon: <FaBook style={{ color: "#52c41a" }} />,
          onClick: () => navigate("/my-thesis"),
        },
        {
          key: 'share-requests',
          label: 'Các yêu cầu chia sẻ',
          icon: <MdOutlineInfo style={{ color: "#1433faff" }} />,
          onClick: () => navigate("/share-requests"),
        },
        {
          key: 'history',
          label: 'Lịch sử xem luận văn',
          icon: <FaHistory style={{ color: "#4a1ac4ff" }} />,
          onClick: () => navigate("/history"),
        },
        {
          key: 'favorite',
          label: 'Luận văn đã lưu',
          icon: <FaStar style={{ color: "#e6c200" }} />,
          onClick: () => navigate("/favorite-theses"),
        }
      );
    }

    if (user?.role === "lecturer") {
      items.push(
        {
          key: 'lecturer-dashboard',
          label: 'Quản lí hướng dẫn',
          icon: <FaBook style={{ color: "#11471aff" }} />,
          onClick: () => navigate("/lecturer/dashboard"),
        },
        {
          key: 'lecturer-requests',
          label: 'Các yêu cầu chia sẻ',
          icon: <MdOutlineInfo style={{ color: "#1433faff" }} />,
          onClick: () => navigate("/lecturer/share-requests"),
        },
        {
          key: 'statistics',
          label: 'Thống kê luận văn',
          icon: <FaChartBar style={{ color: "#f5222d" }} />,
          onClick: () => navigate("/lecturer/thesis-statistics"),
        }
      );
    }

    items.push(
      { type: 'divider' },
      {
        key: 'logout',
        label: 'Đăng xuất',
        icon: <FaSignOutAlt style={{ color: "#595959" }} />,
        onClick: handleLogoutUser,
        danger: true,
      }
    );

    return items;
  }, [user, navigate]);

  // --- LIST MENU NAVIGATION (Dùng chung cho Desktop và Mobile) ---
  const navItems = [
    { label: 'Trang chủ', path: '/', icon: <HomeOutlined /> },
    { label: 'Luận văn', path: '/thesis', icon: <FaBook /> },
    { label: 'Giảng viên', path: '/supervisors', icon: <UserOutlined /> },
    { label: 'Upload', path: '/upload', icon: <UploadOutlined /> },
    { label: 'Liên hệ', path: '/contact', icon: <ContactsOutlined /> },
  ];

  return (
    <HeaderWrapper>
      {/* 1. LOGO & HAMBURGER (MOBILE) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Nút Hamburger chỉ hiện trên Mobile (!screens.md) */}
        {!screens.md && (
          <Button 
            icon={<MenuOutlined />} 
            onClick={() => setOpenDrawer(true)} 
            type="text" 
          />
        )}
        
        <img
          style={{ borderRadius: "12px", height: "72px", cursor: "pointer" }} // Giảm height chút trên mobile cho gọn
          src={LogoImage}
          alt="Logo"
          onClick={() => navigate("/")}
        />
        
        {/* Categories chỉ hiện trên Desktop hoặc Tablet lớn */}
        {screens.md && <CategoriesComponent />}
      </div>

      {/* 2. MENU NAVIGATION (DESKTOP) - Ẩn trên Mobile */}
      {screens.md && (
        <NavMenu>
          {navItems.map((item) => (
            <NavItem 
              key={item.path}
              $active={item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path)} 
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </NavItem>
          ))}
        </NavMenu>
      )}

      {/* 3. ACTIONS (Notification + User) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: screens.md ? 20 : 10 }}>
        <ExtraActions>
          <IconButton>
            {user?.access_token && (
              <NotificationComponent
                count={notificationCount}
                notifications={notifications}
                setNotifications={setNotifications}
                setNotificationCount={setNotificationCount}
              />
            )}
          </IconButton>
        </ExtraActions>

        <AuthButtons>
          {user?.access_token ? (
            <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight" arrow>
              <div style={{ 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 8, 
                  padding: '4px', 
                  borderRadius: '8px', 
                  transition: 'background 0.3s' 
              }}>
                  <Avatar 
                      src={`${import.meta.env.VITE_API_URL}${user?.avatar}`} 
                      style={{ backgroundColor: '#1890ff', verticalAlign: 'middle' }}
                      size={screens.md ? "large" : "default"} // Avatar nhỏ hơn trên mobile
                  >
                      {user?.name?.charAt(0)?.toUpperCase() || <UserOutlined />}
                  </Avatar>
                  
                  {/* Tên và Role: Chỉ hiện trên Desktop (screens.md = true) */}
                  {screens.md && (
                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.3 }}>
                        <Text strong style={{ fontSize: 14, color: '#333' }}>{user?.name || "Người dùng"}</Text>
                        <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', fontWeight: 600 }}>{user?.role}</Text>
                    </div>
                  )}
              </div>
            </Dropdown>
          ) : (
            <Space>
               {/* Mobile: Chỉ hiện nút Đăng nhập. Desktop: Hiện cả 2 */}
               {screens.md && <Button type="text" onClick={() => navigate("/register")}>Đăng ký</Button>}
               <Button type="primary" onClick={() => navigate(`/login?redirect=${location.pathname}`)}>
                 {screens.md ? "Đăng nhập" : "Login"}
               </Button>
            </Space>
          )}
        </AuthButtons>
      </div>

      {/* --- DRAWER CHO MOBILE (MENU TRƯỢT) --- */}
      <Drawer
        title="Menu Luận Văn"
        placement="left"
        onClose={() => setOpenDrawer(false)}
        open={openDrawer}
        width={250} // Chiều rộng drawer
      >
        {/* Hiển thị lại Categories trong Drawer cho Mobile */}
        <div style={{ marginBottom: 20 }}>
            <CategoriesComponent />
        </div>
        
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          style={{ borderRight: 0 }}
          items={navItems.map(item => ({
             key: item.path,
             icon: item.icon,
             label: item.label,
             onClick: () => {
                navigate(item.path);
                setOpenDrawer(false); // Đóng menu sau khi chọn
             }
          }))}
        />
      </Drawer>

    </HeaderWrapper>
  );
};

export default HeaderComponent;