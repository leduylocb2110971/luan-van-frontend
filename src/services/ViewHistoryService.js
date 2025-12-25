import axiosClient from '../apis/axiosClient';

export const getViewHistoryByUserId = async (queryParams) => {
    try {
        const {
            page,
            limit,
        } = queryParams;
        const url = `history/get-view-history?page=${page}&limit=${limit}`;
        const response = await axiosClient.get(url);
        return response.data;
    } catch (error) {
        console.log('Lỗi khi lấy lịch sử xem của người dùng:', error);
        throw error;
    }
};

export const deleteViewHistoryById = async (id) => {
    try {
        const response = await axiosClient.delete(`history/delete-view-history/${id}`);
        return response.data;
    }
    catch (error) {
        console.log('Lỗi khi xóa mục lịch sử xem:', error);
        throw error;
    }
};

export const deleteAllViewHistoryByUser = async () => {
    try {
        const response = await axiosClient.delete('history/delete-all-view-history');
        return response.data;
    } catch (error) {
        console.log('Lỗi khi xóa tất cả lịch sử xem của người dùng:', error);
        throw error;
    }
};
export const suggestThesisFromViewHistory = async () => {
    try {
        const response = await axiosClient.get('history/suggest-thesis-from-view-history');
        return response.data;
    } catch (error) {
        console.log('Lỗi khi gợi ý luận văn từ lịch sử xem:', error);
        throw error;
    }
};