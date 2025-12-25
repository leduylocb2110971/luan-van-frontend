import axiosClient from '../apis/axiosClient';

// Nhận thông báo của tài khoản đang đăng nhập
export const getNotifications = async () => {
    try {
        const response = await axiosClient.get('/notification');
        if (response.status === 200) {
            return response.data; // Trả về danh sách thông báo
        } else {
            throw new Error('Không thể lấy thông báo');
        }
    } catch (error) {
        console.error('Error fetching notifications:', error);
        throw error; // Ném lại lỗi để xử lý ở nơi gọi hàm
    }
}
//
export const getLatestNotifications = async () => {
    try {
        const response = await axiosClient.get('/notification/latest');
        if (response.status === 200) {
            return response.data; // Trả về danh sách thông báo mới nhất
        } else {
            throw new Error('Không thể lấy thông báo mới nhất');
        }
    } catch (error) {
        console.error('Error fetching latest notifications:', error);
        throw error; // Ném lại lỗi để xử lý ở nơi gọi hàm
    }
}
// Đánh dấu thông báo là đã đọc
export const markAsRead = async (notificationId) => {
    try {
        const response = await axiosClient.put(`/notification/${notificationId}/read`);
        if (response.status === 200) {
            return response.data; // Trả về kết quả thành công
        } else {
            throw new Error('Không thể đánh dấu thông báo là đã đọc');
        }
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error; // Ném lại lỗi để xử lý ở nơi gọi hàm
    }
}
// Đánh dấu tất cả thông báo là đã đọc
export const markAllAsRead = async () => {
    try {
        const response = await axiosClient.put('/notification/read-all');
        if (response.status === 200) {
            return response.data; // Trả về kết quả thành công
        } else {
            throw new Error('Không thể đánh dấu tất cả thông báo là đã đọc');
        }
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        throw error; // Ném lại lỗi để xử lý ở nơi gọi hàm
    }
}
// Xóa thông báo
export const deleteNotification = async (notificationId) => {
    try {
        const response = await axiosClient.delete(`/notification/${notificationId}/delete`);
        if (response.status === 200) {
            return response.data; // Trả về kết quả thành công
        } else {
            throw new Error('Không thể xóa thông báo');
        }
    } catch (error) {
        console.error('Error deleting notification:', error);
        throw error; // Ném lại lỗi để xử lý ở nơi gọi hàm
    }
}
