import {
    Layout,
    Menu,
    Breadcrumb,
    theme,
    Avatar,
    Popover,
    Grid,
    Modal
} from "antd";//Nhúng thư viện giao diện UI
import {
    DashboardOutlined,
    UsergroupAddOutlined,
    ReadOutlined,
    AppstoreOutlined,
    CommentOutlined,
    LogoutOutlined,
    SettingFilled,
    UserOutlined,
} from "@ant-design/icons";//Nhúng icons
import { FaUser,
    FaSignOutAlt,
    // FaUserGraduate, // Có thể không cần dùng
    // FaBook, // Có thể không cần dùng
} from "react-icons/fa";
//Outlet: Hiển thị nội dung con, useNavigate: Chuyển trang bằng code, useLocation: lấy tt trang hiện tại
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom"; // 🔥 THÊM Link
import ButtonComponent from "../ButtonComponent/ButtonComponent";
import NotificationComponent from "../NotificationComponent/NotificationComponent";
import ImageLogo from "../../assets/logo-admin-removebg.png";
//userState: quản lí trạng thái
import { useState, useMemo, useEffect } from "react";
import { PopupItem } from "./style";
//userSelecttor: lấy dữ liệu từ store toàn cục
import { useSelector, useDispatch } from "react-redux";
const { Header, Sider, Content, Footer } = Layout;

import { logout } from "../../redux/slice/authSlice";
import * as Message from "../Message/Message";
import * as AuthService from "../../services/AuthService";
import * as NotificationService from "../../services/NotificationService";
const AdminLayout = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const { useBreakpoint } = Grid;
    const screens = useBreakpoint();
    const [collapsed, setCollapsed] = useState(false);
    const [isOpenPopupUser, setIsOpenPopupUser] = useState(false);
    //Lấy user từ Redux store ở phần auth.user. Chứa thông tin như tên, email, avatar, vai trò...
    const user = useSelector((state) => state.auth.user);
    const [notifications, setNotifications] = useState([]);
    const [notificationCount, setNotificationCount] = useState(0);
    // Lấy danh sách thông báo
    const fetchNotifications = async () => {
        const data = await NotificationService.getNotifications();
        setNotifications(data);
        setNotificationCount(data.filter((n) => !n.isRead).length);
    };
    
    useEffect(() => {
        fetchNotifications();
    }, []);
    
    // Bản đồ tên đường dẫn tĩnh
    const breadcrumbNameMap = {
        "/admin": "Quản trị",
        "/admin/dashboard": "Dashboard",
        "/admin/students": "Tài khoản", // Sửa tên thân thiện hơn
        "/admin/lecturers": "Giảng viên",
        "/admin/category": "Khoa/Viện",
        "/admin/major": "Chuyên ngành",
        "/admin/field": "Chủ đề",
        "/admin/comments": "Bình luận",
        "/admin/notification": "Thông báo",
        "/admin/thesis": "Tất cả luận văn", // Sửa tên khớp với menu
        "/admin/thesis-editing": "Chỉnh sửa luận văn",
        "/admin/pending-thesis": "Luận văn chờ duyệt",
        "/admin/approved-thesis": "Luận văn đã duyệt",
        "/admin/request-share": "Yêu cầu chia sẻ", 
        "/admin/share-request-history": "Lịch sử chia sẻ", 
        "/admin/recyclebin": "Thùng rác",
    }
    
    // 🔥 LOGIC SỬA ĐỔI ĐỂ XỬ LÝ ID ĐỘNG
    
    // Hàm kiểm tra ID MongoDB 24 ký tự hex
    const isMongoId = (str) => str.match(/^[a-fA-F0-9]{24}$/i);
    
    // Tách URL tạo breadcumb
    // Lọc bỏ chuỗi rỗng (thường là kết quả từ dấu '/' đầu/cuối)
    const pathSnippets = location.pathname.split("/").filter((i) => i); 
    
    const breadcrumbItems = [
        {
            // Item Trang chủ luôn là Link
            title: <Link to="/">Trang chủ</Link>, 
            key: "home",
        },
        //Tạo mảng các mục breadcrumb
        ...pathSnippets.map((segment, index) => {
            const url = `/${pathSnippets.slice(0, index + 1).join("/")}`;
            const isLastSegment = index === pathSnippets.length - 1;
            
            let title;

            if (isLastSegment && isMongoId(segment)) {
                // 1. Xử lý item cuối cùng là ID động
                title = "Chỉnh sửa"; 
                // Item cuối cùng là text thuần, không Link
                return { title, key: url };
            } 
            
            // 2. Xử lý các đường dẫn tĩnh (và các đoạn giữa)
            // Lấy tên thân thiện, nếu không có thì dùng tên segment
            title = breadcrumbNameMap[url] || segment.charAt(0).toUpperCase() + segment.slice(1);
            
            // Các item giữa phải là Link
            return {
                title: <Link to={url}>{title}</Link>,
                key: url,
            };
        }),
    ];
    
    // ... (Giữ nguyên các đoạn code khác)
    
    //Lấy ra các biến màu nền và bo góc từ hệ thống theme của Ant Design
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    const handleLogoutUser = async () => {
        try {
            await AuthService.logoutUser();
            Message.success("Đăng xuất thành công");
            setIsOpenPopupUser(false);
            dispatch(logout());
            navigate("/login");
        } catch (error) {
            Message.error(error.message || "Đăng xuất thất bại");
            }
    };
    const confirmLogout = () => {
        Modal.confirm({
            title: "Xác nhận đăng xuất",
            content: "Bạn có chắc chắn muốn đăng xuất?",
            okText: "Đăng xuất",
            cancelText: "Hủy",
            onOk: handleLogoutUser
        });
    };
    const menuItems = [
        {
            key:"/admin/dashboard",
            icon: <DashboardOutlined/>,
            label:"Dashboard",
        },
        {
            key: "/admin/students",
            icon: <UsergroupAddOutlined />,
            label: "Quản lý tài khoản",
        },
        // {
        //     key: "/admin/lecturers",
        //     icon: <TeamOutlined />,
        //     label: "Quản lý giảng viên",
        // },
        {
            icon: <ReadOutlined />,
            label: "Quản lý luận văn",
            children: [
                { key: "/admin/thesis", label: "Tất cả luận văn" },
                { key: "/admin/request-share", label: "Yêu cầu chia sẻ" },
                { key: "/admin/share-request-history", label: "Lịch sử yêu cầu chia sẻ" },
                { key: "/admin/recyclebin", label: "Thùng rác" },
            ],
        },
        {
            icon: <AppstoreOutlined />,
            label: "Quản lý danh mục",
            children: [
                { key: "/admin/category", label: "Quản lý khoa/viện" },
                { key: "/admin/major", label: "Quản lý ngành" },
                { key: "/admin/field", label: "Quản lý chủ đề" },
            ],
        },
        {
            key: "/admin/comments",
            icon: <CommentOutlined />,
            label: "Quản lý bình luận",
        },
        { key: "/logout", icon: <LogoutOutlined />, label: <span onClick={confirmLogout}>Đăng xuất</span> },
    ];

    const handleMenuClick = ({ key }) => {
        if (key === "/logout") {
            // Xử lý logout nếu cần
            return;
        }
        navigate(key);
    };
    

    //DROPDOWN MENU
    const content = useMemo(
        () => (
            <>
                <PopupItem
                    onClick={() => navigate("/profile")}
                    $isSelected={location.pathname === "/profile"}
                >
                <FaUser style={{ fontSize: "15px", marginRight: "8px", color: "#1890ff" }} />
                    Thông tin người dùng
                </PopupItem>
                <PopupItem
                    onClick={() => navigate("/admin/settings")}
                    $isSelected={location.pathname === "/admin/settings"}
                >
                    <SettingFilled style={{ fontSize: "15px", marginRight: "8px", color: "#52c41a" }} />
                    Cài đặt hệ thống
                </PopupItem>
                <PopupItem onClick={confirmLogout}>
                    <FaSignOutAlt style={{ fontSize: "15px", marginRight: "8px", color: "#595959" }} />
                        Đăng xuất
                </PopupItem>
            </>
        ),
        [user?.role, location.pathname], // Thêm location.pathname để re-render khi chuyển trang
    );

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Sider
                breakpoint="lg"
                collapsible
                collapsed={collapsed}
                collapsedWidth={0} // Ẩn hoàn toàn khi nhỏ hơn lg
                onCollapse={(collapsed) => setCollapsed(collapsed)}
            >
                
                <div 
                    className="logo-container" 
                    style={{ 
                        height: '64px', 
                        padding: '16px', 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        marginTop: '8px',
                    }}
                >
                    <img
                        src={ImageLogo}
                        alt="Logo"
                        style={{
                            // 1. Tỷ lệ và kích thước cơ bản
                            width: collapsed ? "32px" : "100%", // Chiếm 100% của container khi Sider mở
                            height: 'auto', // Chiều cao tự động, không bị cắt
                            borderRadius: '18px',
                            
                            transition: 'all 0.3s',
                        }}
                    />
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    onClick={handleMenuClick}
                    defaultSelectedKeys={["/admin/dashboard"]}
                    items={menuItems}
                />
            </Sider>
            <Layout>
                <Header
                    style={{
                        background: "#fff",
                        padding: 0,
                        textAlign: "right",
                        paddingRight: 24,
                    }}
                >

                    {user?.access_token && (
                        <Popover
                            content={content}
                            open={isOpenPopupUser}//Tắt cái dropdown admin
                            onOpenChange={(visible) =>
                                setIsOpenPopupUser(visible)
                            }
                            placement="bottomRight"
                        >
                            <NotificationComponent 
                                style={{ 
                                    marginRight: "16px", border: "1px solid #1890ff"
                                }}
                                count={notificationCount}
                                notifications={notifications}
                                setNotifications={setNotifications}
                                setNotificationCount={setNotificationCount}
                            />

                            <ButtonComponent
                                type="default"
                                size="middle"
                                styleButton={{
                                    border: "1px solid #1890ff",
                                    marginLeft: "16px",
                                    borderRadius: "50px", // bo tròn như pill button
                                    padding: "0 16px",
                                    fontWeight: 600,
                                    background: "linear-gradient(90deg, #3B82F6, #2563EB)", // xanh biển
                                    color: "#fff",
                                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                                    transition: "all 0.3s ease",
                                }}
                                icon={
                                    <Avatar
                                    size={30}
                                    icon={<UserOutlined />}
                                    style={{
                                        backgroundColor: "#fff",
                                        color: "#2563EB",
                                        border: "2px solid #2563EB",
                                    }}
                                    />
                                }
                                onClick={() => navigate("/profile")}
                                >
                                {"Xin chào, Admin!"}
                            </ButtonComponent>

                        </Popover>
                    )}
                </Header>
                <Content style={{ margin: 16, overflow: "auto" }}>
                    <Breadcrumb
                        style={{ margin: "16px 0" }}
                        items={breadcrumbItems}
                    ></Breadcrumb>
                    <div
                        style={{
                            padding: 24,
                            minHeight: 360,
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}
                    >
                        <Outlet />
                    </div>
                </Content>
                <Footer style={{ textAlign: "center" }}>
                    © {new Date().getFullYear()}
                    {" "} Admin Dashboard
                </Footer>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;