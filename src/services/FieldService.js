import axiosClient from '../apis/axiosClient';

export const getAllFields = async () => {
    try {
        const response = await axiosClient.get('/field/get-all-fields');
        return response.data;
    } catch (error) {
        console.log('Lỗi khi lấy danh sách lĩnh vực:', error);
        throw error;
    }
};
export const addField = async (fieldData) => {
    try {
        const response = await axiosClient.post('/field/add-field', fieldData);
        return response.data;
    } catch (error) {
        console.log('Lỗi khi thêm lĩnh vực:', error);
        throw error;
    }
};
export const updateField = async (data) => {
    const { id, data: fieldData } = data;
    try {
        const response = await axiosClient.put(`/field/update-field/${id}`, fieldData);
        return response.data;
    } catch (error) {
        console.log('Lỗi khi cập nhật lĩnh vực:', error);
        throw error;
    }
};
export const deleteField = async (id) => {
    try {
        const response = await axiosClient.delete(`/field/delete-field/${id}`);
        return response.data;
    } catch (error) {
        console.log('Lỗi khi xóa lĩnh vực:', error);
        throw error;
    }
};
export const getDetailField = async (id) => {
    try {
        const response = await axiosClient.get(`/field/get-field/${id}`);
        return response.data;
    } catch (error) {
        console.log('Lỗi khi lấy chi tiết lĩnh vực:', error);
        throw error;
    }
};

export const findOrCreateField = async (name) => {
    try {
        const response = await axiosClient.post('/field/find-or-create-field', { name });
        return response.data;
    } catch (error) {
        console.log('Lỗi khi tìm hoặc tạo lĩnh vực:', error);
        throw error;
    }
};