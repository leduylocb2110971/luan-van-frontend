import axiosClient from '../apis/axiosClient';
export const getAllSupervisors = async (params) => {
    try{
        const {
            page = 1,
            limit = 10,
            search,
        } = params;
        let url = `/supervisor/supervisors-list/?page=${page}&limit=${limit}`;
        if (search) {
            url += `&search=${search}`;
        }
        const response = await axiosClient.get(url);
        if (response.status === 200) {
            return response.data.data; // Trả về danh sách tất cả giảng viên hướng dẫn
        }
        throw new Error('Không thể lấy danh sách giảng viên hướng dẫn');
    }
    catch (error) {
        console.error('Lỗi khi lấy danh sách giảng viên hướng dẫn:', error);
        throw error; // Ném lại lỗi để xử lý ở nơi gọi hàm
    }
};
export const getSupervisorsList = async (params) => {
    try{
        const {
            page = 1,
            limit = 10,
            search,
        } = params;
        let url = `/supervisor/supervisors?page=${page}&limit=${limit}`;
        if (search) {
            url += `&search=${search}`;
        }
        const response = await axiosClient.get(url);
        if (response.status === 200) {
            return response.data.data; // Trả về danh sách giảng viên hướng dẫn
        }
        throw new Error('Không thể lấy danh sách giảng viên hướng dẫn');
    } catch (error) {
        console.error('Lỗi khi lấy danh sách giảng viên hướng dẫn:', error);
        throw error; // Ném lại lỗi để xử lý ở nơi gọi hàm
    }
};

export const getSupervisedThesis = async (params) => {
    try{
        const {
            status,
            page = 1,
            limit = 5,
            search,
            from_date,
            to_date,
            years,
            fields,
        } = params;
        let url = `/supervisor/supervised?page=${page}&limit=${limit}`;
            if (status) {
                url += `&status=${status}`;
            }
            if (search) {
                url += `&search=${search}`;
            }
            if (from_date) {
                url += `&from_date=${from_date}`;
            }
            if (to_date) {
                url += `&to_date=${to_date}`;
            }
            if (years && years.length > 0) { 
                url += `&years=${years}`; // Bỏ .join(",")
            }
            if (fields && fields.length > 0) {
                url += `&fields=${fields}`; // Bỏ .join(",")
            }
            const response = await axiosClient.get(url);
            if (response.status === 200) {
                return response.data.data; // Trả về danh sách luận văn đã thực hiện của tôi
            }
            throw new Error('Không thể lấy danh sách luận văn đã hướng dẫn của tôi');
    } catch (error) {
        console.error('Lỗi khi lấy danh sách luận văn đã hướng dẫn của tôi:', error);
        throw error; // Ném lại lỗi để xử lý ở nơi gọi hàm
    }
};
export const getSupervisedThesisBySupervisorId = async (supervisor_id, params) => {
    try{
        const {
            status,
            page = 1,
            limit = 5,
            search,
            from_date,
            to_date,
            years,
            fields,
        } = params;
        let url = `/supervisor/supervisors/${supervisor_id}?page=${page}&limit=${limit}`;
            if (status) {
                url += `&status=${status}`;
            }
            if (search) {
                url += `&search=${search}`;
            }
            if (from_date) {
                url += `&from_date=${from_date}`;
            }
            if (to_date) {
                url += `&to_date=${to_date}`;
            }
            if (years && years.length > 0) { 
                url += `&years=${years}`; // Bỏ .join(",")
            }
            if (fields && fields.length > 0) {
                url += `&fields=${fields}`; // Bỏ .join(",")
            }
            const response = await axiosClient.get(url);
            if (response.status === 200) {
                return response.data; // Trả về danh sách luận văn đã thực hiện của giảng viên
            }
            throw new Error('Không thể lấy danh sách luận văn đã hướng dẫn của giảng viên');
    } catch (error) {
        console.error('Lỗi khi lấy danh sách luận văn đã hướng dẫn của giảng viên:', error);
        throw error; // Ném lại lỗi để xử lý ở nơi gọi hàm
    }
};
export const getSupervisedStudents = async (params) => {
    try{
        const {
            page,
            limit,
            search,
            years,
            fields,
        } = params;
        let url = `/supervisor/supervised-students?page=${page}&limit=${limit}`;
        if (search) {
            url += `&search=${search}`;
        }
        if (years && years.length > 0) {
            url += `&years=${years}`;
        }
        if (fields && fields.length > 0) {
            url += `&fields=${fields}`;
        }
        const response = await axiosClient.get(url);
        if (response.status === 200) {
            return response.data; // Trả về danh sách sinh viên đã hướng dẫn của tôi
        }
    } catch (error) {
        console.error('Lỗi khi lấy danh sách sinh viên đã hướng dẫn của tôi:', error);
        throw error; // Ném lại lỗi để xử lý ở nơi gọi hàm
    }
};

export const getThesisCountByYear = async () => {
    const response = await axiosClient.get(`/supervisor/thesis-count-by-year`);
    return response.data;
}

export const getFieldDistribution = async (year) => {
    const response = await axiosClient.get(`/supervisor/field-distribution`, { params: { year } });
    return response.data;
}

export const getPersonalDistribution = async (year) => {
    try{
        const response = await axiosClient.get(`/supervisor/personal-distribution`, { params: { year } });
        console.log("Personal Distribution Response:", response);
        return response.data;
    } catch (error) {
        throw new Error(error.response.data.message || 'Failed to fetch personal distribution');
    }
}