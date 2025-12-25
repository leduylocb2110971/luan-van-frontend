import axiosClient from '../apis/axiosClient';

// Hàm getAllStudents để lấy danh sách sinh viên
export const getAllStudent = async (params) => {
    try {
        // 1. Nếu bạn đang sử dụng Axios để tự động thêm params vào URL (cách khuyến nghị):
        const response = await axiosClient.get('/user/get-all-users', { 
            params: params // Truyền đối tượng params vào cấu hình của Axios
        });
        return response.data; 
    } catch (error) {
        console.error('Error fetching students:', error);
        // Quan trọng: Ném lại lỗi để useQuery/component có thể bắt được
        throw error; 
    }
}
// Lấy tác giả
export const getAllAuthors = async () => {
    try{
        const response = await axiosClient.get('/user/get-authors');
        return response.data; // Trả về danh sách tác giả
    } catch (error) {
        console.error('Error fetching authors:', error);
        throw error; // Ném lại lỗi để xử lý ở nơi gọi hàm
    }
}
// Hàm getAllTeachers để lấy danh sách giáo viên
export const getAllTeachers = async () => {
    try {
        const response = await axiosClient.get('/user/get-teachers');
        return response.data; // Trả về danh sách giáo viên
    } catch (error) {
        console.error('Error fetching teachers:', error);
        throw error; // Ném lại lỗi để xử lý ở nơi gọi hàm
    }
}
// Hàm getStudentById để lấy thông tin sinh viên theo ID
export const getStudentById = async (id) => {
    try {
        const response = await axiosClient.get(`/user/get-user/${id}`);
        if (response.status === 200) {
            return response.data.data; // Trả về thông tin sinh viên
        } else {
            throw new Error('Không thể lấy thông tin sinh viên');
        }
    } catch (error) {
        console.error('Error fetching student by ID:', error);
        throw error; // Ném lại lỗi để xử lý ở nơi gọi hàm
    }
}
// Hàm updateStudent để cập nhật thông tin sinh viên
export const updateStudent = async (id, data) => {
    try {
        const response = await axiosClient.put(`/user/update-user/${id}`, data);
        if (response.status === 200) {
            return response.data; // Trả về dữ liệu cập nhật thành công
        } else {
            throw new Error('Không thể cập nhật thông tin sinh viên');
        }
    } catch (error) {
        console.error('Error updating student:', error);
        throw error; // Ném lại lỗi để xử lý ở nơi gọi hàm
    }
}
// Hàm cập nhật avatar 
export const updateAvatar = async (id, formData) => {
    try {
        const response = await axiosClient.put(`/user/update-avatar/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        if (response.status === 200) {
            return response.data; // Trả về dữ liệu cập nhật avatar thành công
        } else {
            throw new Error('Không thể cập nhật avatar');
        }
    } catch (error) {
        console.error('Error updating avatar:', error);
        throw error; // Ném lại lỗi để xử lý ở nơi gọi hàm
    }
}
// Hàm deleteStudent để xóa sinh viên theo ID
export const deleteStudent = async (id) => {
    try {
        const response = await axiosClient.delete(`/user/delete-user/${id}`);
        if (response.status === 200) {
            return response.data; // Trả về dữ liệu xóa sinh viên thành công
        } else {
            throw new Error('Không thể xóa sinh viên');
        }
    } catch (error) {
        console.error('Error deleting student:', error);
        throw error; // Ném lại lỗi để xử lý ở nơi gọi hàm
    }
}
// Hàm xóa many sinh viên
export const deleteManyStudents = async (ids) => {
    try {
        const response = await axiosClient.delete('/user/delete-many-users', {
            data: { ids } // Gửi danh sách ID sinh viên cần xóa
        });
        if (response.status === 200) {
            return response.data; // Trả về dữ liệu xóa nhiều sinh viên thành công
        } else {
            throw new Error('Không thể xóa nhiều sinh viên');
        }
    } catch (error) {
        console.error('Error deleting many students:', error);
        throw error; // Ném lại lỗi để xử lý ở nơi gọi hàm
    }
}


