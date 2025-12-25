import axiosClient from '../apis/axiosClient';

export const registerUser = async (userData) => {
    try {
        const response = await axiosClient.post('/auth/register', userData);
        return response.data;
    } catch (error) {
        console.error('Error registering user:' + error);
        throw error;
    }
}
// Đăng kí qua google
export const registerGoogle = async (tokenId) => {
    try {
        const response = await axiosClient.post('/auth/google', { tokenId });
        return response.data;
    } catch (error) {
        console.error('Error registering user with Google:', error);
        throw error;
    }
}
export const loginUser = async (credentials) => {
    try {
        const response = await axiosClient.post('/auth/login', credentials);
        return response.data;   
    }
    catch (error) {
        console.error('Error logging in user:', error);
        throw error;
    }
}
export const logoutUser = async () => {
    try {
        const response = await axiosClient.post('/auth/logout');
        return response.data;
    } catch (error) {
        console.error('Error logging out user:', error);
        throw error;
    }
}   
export const refreshToken = async () => {
    try {
        const response = await axiosClient.post('/auth/refresh-token');
        return response.data;
    } catch (error) {
        console.error('Error refreshing token:', error);
        throw error;
    }
}
export const changePassword = async (data) => {
    try {
        const response = await axiosClient.post(`/auth/change-password`, data);
        return response.data;
    } catch (error) {
        throw error?.response?.data || error.message;
    }
}
export const getUserProfile = async () => {
    try {
        const response = await axiosClient.get('/auth/profile');
        return response.data;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
}
export const toggleUserStatus = async (id) => {
    try{
        const response = await axiosClient.put(`/auth/toggle-status/${id}`);
        if (response.status === 200) {
            return response.data; // Trả về dữ liệu cập nhật trạng thái thành công
        } else {
            throw new Error('Không thể cập nhật trạng thái người dùng');
        }
    } catch (error) {
        console.error('Error toggling user status:', error);
        throw error; // Ném lại lỗi để xử lý ở nơi gọi hàm
    }
}
export const verifyUser = async (id, action) => {
    try {
        const response = await axiosClient.put(`/auth/verify/${id}`, { action });
        if (response.status === 200) {
            return response.data; // Trả về dữ liệu xác minh thành công
        } else {
            throw new Error('Không thể xác minh người dùng');
        }
    } catch (error) {
        console.error('Error verifying user:', error);
        throw error; // Ném lại lỗi để xử lý ở nơi gọi hàm
    }
}
export const getDashboardStats = async () => {
    try {
        const response = await axiosClient.get('/auth/stats');
        if (response.status === 200) {
            return response.data;
        } else {
            throw new Error('Không thể lấy thông tin thống kê');
        }
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        throw error;
    }
}

export const getThesisStats = async () => {
    try {
        const response = await axiosClient.get('/auth/thesis-stats');
        if (response.status === 200) {
            return response.data;
        } else {
            throw new Error('Không thể lấy thông tin thống kê luận văn');
        }
    } catch (error) {
        console.error('Error fetching thesis stats:', error);
        throw error;
    }
}
export const getUserStats = async () => {
    try {
        const response = await axiosClient.get('/auth/user-stats');
        if (response.status === 200) {
            return response.data;
        } else {
            throw new Error('Không thể lấy thông tin thống kê người dùng');
        }
    } catch (error) {
        console.error('Error fetching user stats:', error);
        throw error;
    }
}

export const getUniversities = async () => {
    try {
        const response = await axiosClient.get('/auth/universities');
        return response.data;
    } catch (error) {
        console.error('Error fetching universities:', error);
        throw error;
    }
}