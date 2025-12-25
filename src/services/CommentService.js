import axiosClient from '../apis/axiosClient';

export const getAllComments = async () => {
    try {
        const response = await axiosClient.get('/comment/get-comments');
        return response.data;
    } catch (error) {
        console.error('Lỗi lấy tất cả bình luận:', error);
        throw error;
    }
};
export const getAllCommentsIncludingHidden = async () => {
    try {
        const response = await axiosClient.get('/comment/get-all-comments');
        return response.data;
    } catch (error) {
        console.error('Lỗi lấy tất cả bình luận bao gồm ẩn:', error);
        throw error;
    }
};
export const getCommentsByThesisId = async (thesisId) => {
    try {
        const response = await axiosClient.get(`/comment/get-comments/${thesisId}`);
        return response.data;
    } catch (error) {
        console.error('Lỗi lấy bình luận theo ID luận văn:', error);
        throw error;
    }
}

export const addComment = async (data) => {
    try {
        const response = await axiosClient.post('/comment/add-comment', data );
        return response.data;
    } catch (error) {
        console.error('Lỗi thêm bình luận:', error);
        throw error;
    }
}

export const updateComment = async ({ id: commentId, content, rating }) => {
    try {
        const response = await axiosClient.put(`/comment/update-comment/${commentId}`, { content, rating });
        return response.data;
    } catch (error) {
        console.error('Lỗi cập nhật bình luận:', error);
        throw error;
    }
}
export const deleteComment = async (commentId) => {
    try {
        const response = await axiosClient.delete(`/comment/delete-comment/${commentId}`);
        return response.data;
    } catch (error) {
        console.error('Lỗi xoá bình luận:', error);
        throw error;
    }
}
export const toggleCommentVisibility = async (commentId) => {
    try {
        const response = await axiosClient.put(`/comment/toggle-visibility/${commentId}`);
        return response.data;
    } catch (error) {
        console.error('Lỗi thay đổi trạng thái hiển thị bình luận:', error);
        throw error;
    }
}
