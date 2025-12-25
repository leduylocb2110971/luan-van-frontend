import axiosClient from '../apis/axiosClient';

export const getAllMajors = async () => {
    try {
        const response = await axiosClient.get('/major/get-all-majors');
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy danh sách ngành học:', error);
        throw error;
    }
};
export const addMajor = async (majorData) => {
    try {
        const response = await axiosClient.post('/major/add-major', majorData);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi thêm ngành học:', error);
        throw error;
    }
};
export const updateMajor = async (data) => {
    // Destructure object duy nhất nhận được từ mutation.mutate()
    const { id, data: majorData } = data; 
    
    try {
        // Gửi request với ID vào URL và majorData vào body
        const response = await axiosClient.put(`/major/update-major/${id}`, majorData);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi cập nhật ngành học:', error);
        throw error;
    }
};
export const deleteMajor = async (id) => {
    try {
        const response = await axiosClient.delete(`/major/delete-major/${id}`);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi xóa ngành học:', error);
        throw error;
    }
};
export const getMajorsByCategoryId = async (categoryId) => {
    try {
        const response = await axiosClient.get(`/major/get-majors-by-category/${categoryId}`);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy ngành học theo danh mục:', error);
        throw error;
    }
};
export const getDetailMajor = async (id) => {
    try {
        const response = await axiosClient.get(`/major/get-major/${id}`);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy chi tiết ngành học:', error);
        throw error;
    }
};

export const getMajorIdByName = async (name) => {
    try {
        const response = await axiosClient.post('/major/get-major-by-name', { name });
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy ID ngành học theo tên:', error);
        throw error;
    }
};