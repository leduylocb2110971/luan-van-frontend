import React, { useEffect, useState } from "react";
import { List, Spin, Button, Badge } from "antd";
import {
  FaCheckCircle, 
  FaTimesCircle, 
  FaUpload, 
  FaShareAlt, 
  FaInfoCircle,
  FaRedo, FaCommentDots
} from "react-icons/fa";
import { FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import * as NotificationService from "../../services/NotificationService";
import * as Message from "../../components/Message/Message";
import AdminLayout from "../../components/AdminLayout/AdminLayout";
import BreadcrumbComponent from "../../components/BreadcrumbComponent/BreadcrumbComponent";
dayjs.extend(relativeTime);

const iconByType = {
    new_upload:          <FaUpload style={{ color: "#1890ff" }} />,      // Xanh dương: Tải lên mới
    resubmit_upload:     <FaRedo style={{ color: "#fa8c16" }} />,        // Cam: Tái nộp/Làm lại (Warning)
    approved:            <FaCheckCircle style={{ color: "#52c41a" }} />, // Xanh lá: Thành công
    rejected:            <FaTimesCircle style={{ color: "#ff4d4f" }} />,  // Đỏ: Thất bại/Từ chối
    share_request:       <FaShareAlt style={{ color: "#1890ff" }} />,    // Xanh dương: Yêu cầu chia sẻ (Chuyển sang Xanh dương để đồng nhất với 'new_upload')
    share_approved:      <FaCheckCircle style={{ color: "#52c41a" }} />, // Xanh lá: Chia sẻ được duyệt
    share_reminder:      <FaInfoCircle style={{ color: "#faad14" }} />,      // Vàng: Nhắc nhở chia sẻ
    share_rejected:      <FaTimesCircle style={{ color: "#ff4d4f" }} />,  // Đỏ: Chia sẻ bị từ chối
    share_resubmit:      <FaRedo style={{ color: "#fa8c16" }} />,        // Cam: Tái nộp yêu cầu chia sẻ
    comment:             <FaCommentDots style={{ color: "#1890ff" }} />,  // Xanh dương: Bình luận mới
};

const Notification = () => {
  const userRole = localStorage.getItem("role"); // Lấy vai trò người dùng từ localStorage
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8; // mỗi trang 10 thông báo
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await NotificationService.getNotifications();
      console.log("Fetched notifications:", data);
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

  const handleMarkAsRead = async (notificationId) => {
    try {
      await NotificationService.markAsRead(notificationId);
      const updated = notifications.map((n) =>
        n._id === notificationId ? { ...n, isRead: true } : n
      );
      setNotifications(updated);
    } catch (error) {
      Message.error("Không thể đánh dấu thông báo");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      const updated = notifications.map((n) => ({ ...n, isRead: true }));
      setNotifications(updated);
      Message.success("Đã đánh dấu tất cả là đã đọc");
    } catch (error) {
      Message.error("Không thể đánh dấu tất cả thông báo");
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) handleMarkAsRead(notification._id);
    if (notification.link) navigate(notification.link);
  };

  //Xóa thông báo
  const handleDeleteNotification = async (notificationId) => {
    try {
      console.log("Deleting notification:", notificationId);
      await NotificationService.deleteNotification(notificationId);
      const updated = notifications.filter((n) => n._id !== notificationId);
      setNotifications(updated);
      Message.success("Đã xóa thông báo");
    } catch (error) {
      Message.error("Không thể xóa thông báo");
    }
  };

  // Cắt thông báo theo trang
  const paginatedNotifications = notifications.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const redirectByType = {
  new_upload: "/admin/thesis",
  resubmit_upload: "/admin/thesis",
  approved: "/admin/thesis",
  rejected: "/admin/thesis",
  share_request: "/admin/request-share",
  share_approved: "/admin/share-request-history",
  share_rejected: "/admin/share-request-history",
  status_change: "/admin/thesis",
  comment: "/admin/comments",
};

  return (
      <div >
        <h2>Thông báo</h2>

        <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
          <Button onClick={handleMarkAllAsRead} disabled={!notifications.length}>
            Đánh dấu tất cả đã đọc
          </Button>
        </div>

        {loading ? (
          <Spin size="large" style={{ display: "block", margin: "40px auto" }} />
        ) : notifications.length > 0 ? (
          <List
    itemLayout="vertical"
    dataSource={paginatedNotifications}
    renderItem={(notification) => (
      <List.Item
        onClick={() => handleNotificationClick(notification)}
        style={{
          cursor: "pointer",
          borderRadius: 12,
          padding: "16px 20px",
          marginBottom: 12,
          background: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          transition: "all 0.25s ease",
          border: notification.isRead ? "1px solid #f0f0f0" : "1px solid #1890ff33",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.08)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)";
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
          
          {/* ICON HIỆN ĐẠI, NỀN NHẠT */}
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              background: "#f5f7fa",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
            }}
          >
            {iconByType[notification.type]}
          </div>

          {/* MESSAGE */}
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {!notification.isRead && (
                <span
                  style={{
                    width: 8,
                    height: 8,
                    background: "#ff4d4f",
                    borderRadius: "50%",
                  }}
                ></span>
              )}

              <div style={{ fontWeight: 600, fontSize: 16 }}>
                {notification.message}
              </div>
            </div>

            <div style={{ fontSize: 13, color: "#999", marginTop: 4 }}>
              {dayjs(notification.createdAt).fromNow()}
            </div>

            {/* Detail */}
            {notification.detail && (
              <div
                style={{
                  marginTop: 10,
                  padding: "10px 12px",
                  background: "#fafafa",
                  borderRadius: 8,
                  fontSize: 14,
                  color: "#555",
                }}
              >
                📄 {notification.detail}
              </div>
            )}

            {/* Note block */}
            {notification.note && (
              <div
                style={{
                  marginTop: 10,
                  padding: "10px 14px",
                  background: "#f0f5ff",
                  borderLeft: "4px solid #1890ff",
                  borderRadius: 8,
                  fontSize: 14,
                  color: "#555",
                }}
              >
                📩 <strong>Lời nhắn:</strong> {notification.note}
              </div>
            )}
          </div>

          {/* ACTIONS - nhỏ gọn */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            
            {/* Delete icon */}
            <FaTimesCircle
              style={{
                color: "#bbb",
                cursor: "pointer",
                fontSize: 18,
                transition: "0.2s",
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteNotification(notification._id);
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#ff4d4f")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#bbb")}
            />

            {/* Arrow navigation */}
            {(notification.type in redirectByType) && (
              <FaArrowRight
                style={{
                  color: "#999",
                  cursor: "pointer",
                  fontSize: 18,
                  transition: "0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#1890ff")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#999")}
                onClick={(e) => {
                  e.stopPropagation();
                  handleNotificationClick(notification);

                  const target = redirectByType[notification.type];
                  const finalUrl =
                    typeof target === "function" ? target(notification) : target;

                  navigate(finalUrl);
                }}
              />
            )}
          </div>

        </div>
      </List.Item>
    )}


            pagination={{
              current: currentPage,
              pageSize,
              total: notifications.length,
              onChange: (page) => setCurrentPage(page),
            }}
          />
        ) : (
          <p style={{ textAlign: "center", color: "#888" }}>Không có thông báo nào.</p>
        )}
      </div>
  );

};

export default Notification;
