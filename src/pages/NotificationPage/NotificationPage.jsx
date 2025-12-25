import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { List, Spin, Button, Tabs, Avatar, Typography, Tooltip, Empty, Card } from "antd";
import {
  FaCheckCircle, 
  FaTimesCircle, 
  FaUpload, 
  FaShareAlt, 
  FaInfoCircle,
  FaRedo, 
  FaCommentDots,
  FaTrashAlt,
  FaCircle
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi"; // Import tiếng Việt cho dayjs

import * as NotificationService from "../../services/NotificationService";
import * as Message from "../../components/Message/Message";
import DefaultLayout from "../../components/DefaultLayout/DefaultLayout";
import BreadcrumbComponent from "../../components/BreadcrumbComponent/BreadcrumbComponent";

dayjs.extend(relativeTime);
dayjs.locale("vi"); // Set ngôn ngữ tiếng Việt

const { Text, Title } = Typography;

// Định nghĩa màu sắc và icon cho từng loại
const getNotificationStyle = (type) => {
    switch (type) {
        case 'new_upload': 
        case 'share_request':
        case 'comment':
            return { icon: <FaUpload />, color: '#1890ff', bg: '#e6f7ff' }; // Xanh dương
        case 'approved':
        case 'share_approved':
            return { icon: <FaCheckCircle />, color: '#52c41a', bg: '#f6ffed' }; // Xanh lá
        case 'rejected':
        case 'share_rejected':
            return { icon: <FaTimesCircle />, color: '#ff4d4f', bg: '#fff1f0' }; // Đỏ
        case 'resubmit_upload':
        case 'share_resubmit':
        case 'share_reminder':
            return { icon: <FaInfoCircle />, color: '#faad14', bg: '#fffbe6' }; // Vàng/Cam
        default:
            return { icon: <FaInfoCircle />, color: '#8c8c8c', bg: '#f5f5f5' }; // Xám
    }
};

const NotificationPage = () => {
  const currentUser = useSelector((state) => state.auth.user);
  const userRole = currentUser?.role;
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'unread'
  const pageSize = 10;

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await NotificationService.getNotifications();
      setNotifications(data);
    } catch (error) {
      Message.error("Không thể tải thông báo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // --- ACTIONS ---
  const handleMarkAsRead = async (notificationId) => {
    try {
      await NotificationService.markAsRead(notificationId);
      setNotifications(prev => prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      Message.success("Đã đánh dấu tất cả là đã đọc");
    } catch (error) {
      Message.error("Lỗi khi xử lý");
    }
  };

  const handleDeleteNotification = async (e, notificationId) => {
    e.stopPropagation(); // Ngăn chặn click vào item
    try {
      await NotificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      Message.success("Đã xóa thông báo");
    } catch (error) {
      Message.error("Không thể xóa thông báo");
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) handleMarkAsRead(notification._id);
    
    // Điều hướng
    const redirectMap = {
        share_request: userRole === "lecturer" ? "/lecturer/share-requests" : "/share-requests",
        share_resubmit: userRole === "lecturer" ? "/lecturer/share-requests" : "/share-requests",
        comment: `/thesis/${notification?.thesisId?._id}`,
        // Các case mặc định điều hướng về trang cá nhân hoặc chi tiết luận văn
        default: "/my-thesis"
    };

    const path = redirectMap[notification.type] || redirectMap.default;
    if(path) navigate(path);
  };

  // --- FILTER DATA ---
  const filteredNotifications = useMemo(() => {
      if (activeTab === 'unread') {
          return notifications.filter(n => !n.isRead);
      }
      return notifications;
  }, [notifications, activeTab]);

  const paginatedData = filteredNotifications.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <DefaultLayout>
      <BreadcrumbComponent customNameMap={{ notification: "Thông báo" }} />
      
      <div style={{ maxWidth: 800, margin: "24px auto", padding: "0 16px" }}>
        <Card 
            style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
            styles={{
                body: {padding: '10px 24px' }
            }}
        >
            {/* HEADER & TABS */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                <Tabs 
                    activeKey={activeTab} 
                    onChange={setActiveTab}
                    items={[
                        { label: `Tất cả`, key: 'all' },
                        { label: `Chưa đọc (${unreadCount})`, key: 'unread' },
                    ]}
                    style={{ marginBottom: 0, flex: 1 }}
                />
                
                {unreadCount > 0 && (
                    <Button type="link" onClick={handleMarkAllAsRead}>
                        Đánh dấu tất cả đã đọc
                    </Button>
                )}
            </div>
        </Card>

        {/* LIST */}
        <div style={{ marginTop: 16 }}>
            {loading ? (
                <div style={{ textAlign: 'center', padding: 40 }}><Spin size="large" /></div>
            ) : filteredNotifications.length === 0 ? (
                <Card style={{ borderRadius: 12, textAlign: 'center', padding: 40 }}>
                    <Empty description="Bạn không có thông báo nào" />
                </Card>
            ) : (
                <List
                    dataSource={paginatedData}
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: filteredNotifications.length,
                        onChange: (page) => setCurrentPage(page),
                        align: 'center',
                        hideOnSinglePage: true
                    }}
                    renderItem={(item) => {
                        const style = getNotificationStyle(item.type);
                        const Icon = style.icon;

                        return (
                            <List.Item
                                onClick={() => handleNotificationClick(item)}
                                style={{
                                    padding: "16px 20px",
                                    marginBottom: 10,
                                    backgroundColor: item.isRead ? "#fff" : "#e6f7ff", // Nền xanh nhạt nếu chưa đọc
                                    borderRadius: 12,
                                    border: 'none',
                                    cursor: "pointer",
                                    transition: "all 0.2s",
                                    boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                                    position: 'relative'
                                }}
                                className="notification-item"
                                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.02)"; }}
                            >
                                <List.Item.Meta
                                    avatar={
                                        <Avatar 
                                            size={48} 
                                            icon={style.icon} 
                                            style={{ backgroundColor: style.bg, color: style.color, fontSize: 20 }} 
                                        />
                                    }
                                    title={
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                            <Text strong={!item.isRead} style={{ fontSize: 15, color: '#262626', marginRight: 24 }}>
                                                {item.message}
                                                {!item.isRead && <FaCircle style={{ fontSize: 8, color: '#1890ff', marginLeft: 8, verticalAlign: 'middle' }} />}
                                            </Text>
                                            
                                            {/* Nút xóa chỉ hiện khi cần hoặc luôn hiện */}
                                            <Tooltip title="Xóa thông báo">
                                                <Button 
                                                    type="text" 
                                                    shape="circle" 
                                                    icon={<FaTrashAlt />} 
                                                    size="small"
                                                    style={{ color: '#bfbfbf', minWidth: 24 }}
                                                    onClick={(e) => handleDeleteNotification(e, item._id)}
                                                    className="delete-btn"
                                                />
                                            </Tooltip>
                                        </div>
                                    }
                                    description={
                                        <div>
                                            {item.detail && (
                                                <div style={{ 
                                                    fontSize: 13, color: '#595959', margin: '4px 0', 
                                                    background: 'rgba(0,0,0,0.02)', padding: '6px 10px', borderRadius: 6 
                                                }}>
                                                    {item.detail}
                                                </div>
                                            )}
                                            {item.note && (
                                                <Text type="secondary" style={{ fontSize: 13, display: 'block', fontStyle: 'italic', marginTop: 4 }}>
                                                    " {item.note} "
                                                </Text>
                                            )}
                                            <Text type="secondary" style={{ fontSize: 12, marginTop: 6, display: 'block' }}>
                                                {dayjs(item.createdAt).fromNow()}
                                            </Text>
                                        </div>
                                    }
                                />
                            </List.Item>
                        );
                    }}
                />
            )}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default NotificationPage;