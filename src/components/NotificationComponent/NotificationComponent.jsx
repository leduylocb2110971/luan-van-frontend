import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Badge, Popover, Spin, Avatar, List, Empty, Typography, Button, Tooltip } from "antd";
import { 
  FaBell, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaUpload, 
  FaShareAlt, 
  FaInfoCircle, 
  FaRedo, 
  FaCommentDots,
  FaCheckDouble
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi"; // Import tiếng Việt

import * as NotificationService from "../../services/NotificationService";
import * as Message from "../Message/Message";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const { Text } = Typography;

// Style cấu hình cho từng loại thông báo
const getNotificationStyle = (type) => {
    switch (type) {
        case 'new_upload': 
        case 'share_request':
        case 'comment':
            return { icon: <FaUpload />, color: '#1890ff', bg: '#e6f7ff' };
        case 'approved':
        case 'share_approved':
            return { icon: <FaCheckCircle />, color: '#52c41a', bg: '#f6ffed' };
        case 'rejected':
        case 'share_rejected':
            return { icon: <FaTimesCircle />, color: '#ff4d4f', bg: '#fff1f0' };
        case 'resubmit_upload':
        case 'share_resubmit':
        case 'share_reminder':
            return { icon: <FaInfoCircle />, color: '#faad14', bg: '#fffbe6' };
        default:
            return { icon: <FaInfoCircle />, color: '#8c8c8c', bg: '#f5f5f5' };
    }
};

const NotificationComponent = ({
  count = 0,
  notifications = [],
  setNotifications,
  setNotificationCount,
}) => {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(count);
  const [isOpen, setIsOpen] = useState(false);

  // Đồng bộ count từ props
  useEffect(() => {
    setUnreadCount(count);
  }, [count]);

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.isRead) {
          // Gọi API mark read (nếu cần xử lý ngay lập tức)
          await NotificationService.markAsRead(notification._id);
          
          // Cập nhật UI local ngay lập tức để phản hồi nhanh
          const updatedNotifications = notifications.map(n => 
              n._id === notification._id ? { ...n, isRead: true } : n
          );
          setNotifications && setNotifications(updatedNotifications);
          setNotificationCount && setNotificationCount(prev => Math.max(0, prev - 1));
      }

      setIsOpen(false); // Đóng popover

      // Điều hướng
      const redirectMap = {
        share_request: user?.role === "lecturer" ? "/lecturer/share-requests" : "/share-requests",
        share_resubmit: user?.role === "lecturer" ? "/lecturer/share-requests" : "/share-requests",
        comment: `/thesis/${notification?.thesisId?._id}`,
        // Admin
        new_upload: user?.role === "admin" ? "/admin/thesis" : "/my-thesis",
        // Default
        default: user?.role === "admin" ? "/admin/notification" : "/notification"
      };

      const path = redirectMap[notification.type] || redirectMap.default;
      navigate(path);

    } catch (error) {
      console.error("Error clicking notification:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      const updated = notifications.map((n) => ({ ...n, isRead: true }));
      setNotifications && setNotifications(updated);
      setNotificationCount && setNotificationCount(0);
      Message.success("Đã đánh dấu tất cả là đã đọc");
    } catch (error) {
      Message.error("Lỗi khi xử lý");
    }
  };

  const goToAllNotifications = () => {
    setIsOpen(false);
    navigate(user?.role === "admin" ? "/admin/notification" : "/notification");
  };

  // Content của Popover
  const popoverContent = (
    <div style={{ width: 360 }}>
      {/* Header */}
      <div style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          padding: '12px 16px', borderBottom: '1px solid #f0f0f0' 
      }}>
        <Text strong style={{ fontSize: 16 }}>Thông báo</Text>
        {unreadCount > 0 && (
            <Tooltip title="Đánh dấu tất cả là đã đọc">
                <FaCheckDouble 
                    style={{ cursor: 'pointer', color: '#1890ff' }} 
                    onClick={handleMarkAllAsRead}
                />
            </Tooltip>
        )}
      </div>

      {/* List */}
      <div style={{ maxHeight: 400, overflowY: 'auto' }}>
        {notifications.length > 0 ? (
            <List
                dataSource={notifications.slice(0, 5)} // Chỉ hiện 5 cái mới nhất
                renderItem={(item) => {
                    const style = getNotificationStyle(item.type);
                    return (
                        <List.Item 
                            onClick={() => handleNotificationClick(item)}
                            style={{ 
                                padding: '12px 16px', 
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                backgroundColor: item.isRead ? '#fff' : '#f0f5ff', // Nền xanh nhạt nếu chưa đọc
                                borderBottom: '1px solid #f0f0f0'
                            }}
                            className="notification-item-hover" // Bạn có thể thêm CSS hover trong file css toàn cục
                        >
                            <List.Item.Meta
                                avatar={
                                    <Avatar 
                                        style={{ backgroundColor: style.bg, color: style.color }} 
                                        icon={style.icon} 
                                    />
                                }
                                title={
                                    <Text 
                                        style={{ 
                                            fontSize: 14, 
                                            fontWeight: item.isRead ? 400 : 600,
                                            color: '#262626'
                                        }}
                                        ellipsis={{ tooltip: item.message }}
                                    >
                                        {item.message}
                                    </Text>
                                }
                                description={
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        {dayjs(item.createdAt).fromNow()}
                                    </Text>
                                }
                            />
                            {!item.isRead && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1890ff', marginLeft: 8 }} />}
                        </List.Item>
                    );
                }}
            />
        ) : (
            <div style={{ padding: '32px 0' }}>
                <Empty description="Không có thông báo nào" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ 
          padding: '12px', borderTop: '1px solid #f0f0f0', textAlign: 'center',
          backgroundColor: '#fafafa', borderBottomLeftRadius: 8, borderBottomRightRadius: 8
      }}>
        <Button type="link" onClick={goToAllNotifications} style={{ width: '100%' }}>
            Xem tất cả thông báo
        </Button>
      </div>
    </div>
  );

  return (
    <Popover 
        content={popoverContent} 
        trigger="click" 
        placement="bottomRight"
        open={isOpen}
        onOpenChange={setIsOpen}
        styles={{ 
          body: { padding: 0, borderRadius: 8 } 
        }} // Remove padding mặc định của Popover nội dung
    >
      <Badge count={unreadCount} overflowCount={99} offset={[-2, 2]}>
        <div 
            style={{ 
                width: 40, height: 40, borderRadius: '50%', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.3s',
                backgroundColor: isOpen ? 'rgba(0,0,0,0.05)' : 'transparent'
            }}
            className="header-icon-hover"
        >
            <FaBell style={{ fontSize: 20, color: '#595959' }} />
        </div>
      </Badge>
    </Popover>
  );
};

export default NotificationComponent;