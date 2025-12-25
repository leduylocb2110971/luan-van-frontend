import axiosClient from '../apis/axiosClient';

export const suggestKeywords = async (query) => {
    try {
        const response = await axiosClient.get('/search/suggest', { params: { query } });
        if (response.status === 200) {
            return response.data; // Trả về danh sách từ khóa gợi ý
        } else {
            throw new Error('Không thể lấy từ khóa gợi ý');
        }
    } catch (error) {
        console.error('Error fetching suggested keywords:', error);
        throw error; // Ném lại lỗi để xử lý ở nơi gọi hàm
    }
}
export const elasticSearch = async (params) => {
    try {
        // Nhận obj là params để truyền các tham số lọc
        const {
            page, limit, sort, search, years, categories, majors, fields, preset, supervisors, keywords
        } = params;
        let url = `/search/elasticsearch-thesis?page=${page}&limit=${limit}`;
        if (sort) {
            url += `&sort=${sort}`;
        }
        if (search) {
            url += `&search=${search}`;
        }
        if (years && years.length > 0) { 
            url += `&years=${years}`; // Bỏ .join(",")
        }
        if (categories && categories.length > 0) {
            url += `&categories=${categories}`; // Bỏ .join(",")
        }
        if (majors && majors.length > 0){
            url += `&majors=${majors}`;
        }
        if (fields && fields.length > 0) {
            url += `&fields=${fields}`; // Bỏ .join(",")
        }
        if (supervisors && supervisors.length > 0) {
            url += `&supervisors=${supervisors}`; // Bỏ .join(",")
        }
        if (keywords && keywords.length > 0) {
            url += `&keywords=${keywords}`; // Bỏ .join(",")
        }
        if (preset) {
            url += `&preset=${preset}`;
        }
        const response = await axiosClient.get(url);
        if (response.status === 200) {
            return response.data; // Trả về danh sách luận văn
        }
    } catch (error) {
        console.error('Lỗi khi lấy danh sách luận văn:', error);
        throw error; // Ném lại lỗi để xử lý ở nơi gọi hàm
    }
} 
