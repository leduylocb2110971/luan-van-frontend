import axiosClient from '../apis/axiosClient';

// Thêm danh mục 
export const addCategory = async (data) => {
    try {
        const response = await axiosClient.post('/category/add-category', data);
        return response.data;
    } catch (error) {
        console.error('Error adding category:', error);
        throw error;
    }
}
// Cập nhật danh mục
export const updateCategory = async ({ id, data }) => {
    try {
        const response = await axiosClient.put(`/category/update-category/${id}`, data);
        return response.data;
    } catch (error) {
        console.error('Error updating category:', error);
        throw error;
    }
}
// Xoá danh mục
export const deleteCategory = async (id) => {
    try {
        const response = await axiosClient.delete(`/category/delete-category/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting category:', error);
        throw error;
    }
}
// Xoá nhiều danh mục
export const deleteManyCategories = async ({ ids }) => {
    try {
        const response = await axiosClient.post('/category/delete-many-categories', { ids });
        return response.data;
    } catch (error) {
        console.error('Error deleting many categories:', error);
        throw error;
    }
}
// Lấy danh sách danh mục
export const getCategories = async () => {  
    try {
        const response = await axiosClient.get('/category/get-all-categories');
        return response.data;
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
}
// Lấy danh mục theo ID
export const getCategoryById = async (id) => {
    try {
        const response = await axiosClient.get(`/category/get-category/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching category by ID:', error);
        throw error;
    }
}
export const findCategoryIdByName = async (name) => {
    try {
        const response = await axiosClient.post('/category/find-category-by-name', { name });
        return response.data;
    } catch (error) {
        console.error('Error finding category ID by name:', error);
        throw error;
    }
};

