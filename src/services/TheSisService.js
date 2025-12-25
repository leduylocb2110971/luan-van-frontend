import axiosClient from '../apis/axiosClient';

export const uploadTheSis = async (formData) => {
  try {
    const response = await axiosClient.post('/thesis/upload-thesis', formData);
    return response;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};
// Upload lại nếu bị từ chối
export const reuploadTheSis = async (id) => {
  try {
    const response = await axiosClient.put(`/thesis/reupload-thesis/${id}`);
    return response.data;
  } catch (error) {
    console.error("Reupload error:", error);
    throw error;
  }
};
// Thay đổi chế độ luận văn (công khai/riêng tư)
export const changeModeTheSis = async (id, mode) => {
    try {
        const response = await axiosClient.put(`/thesis/change-mode-thesis/${id}`, { mode });
        if (response.status === 200) {
            return response.data; // Trả về dữ liệu thay đổi chế độ luận văn thành công
        } else {
            throw new Error('Không thể thay đổi chế độ luận văn');
        }
    } catch (error) {
        console.error('Lỗi khi thay đổi chế độ luận văn:', error);
        throw error; // Ném lại lỗi để xử lý ở nơi gọi hàm
    }
}
// Trích xuất thông tin luận văn từ file
export const extractTheSisInfo = async (file, options = {}) => {
    try {
        const response = await axiosClient.post('/thesis/extract-info', file, {
            headers: {
                'Content-Type': 'multipart/form-data' 
            },
            // 2. Thêm dòng này để Axios nhận được cái signal từ bên ngoài
            ...options 
        });
        if (response.status === 200) {
            return response.data; // Trả về dữ liệu trích xuất thông tin luận văn
        }
        throw new Error('Không thể trích xuất thông tin từ file');
    } catch (error) {
        console.error('Lỗi khi trích xuất thông tin luận văn:',error);
        throw error; // Ném lại lỗi để xử lý ở nơi gọi hàm
    }
}
export const getProcess = async () => {
    try {
        const response = await axiosClient.get('/thesis/progress');
        if (response.status === 200) {
            return response.data; // Trả về dữ liệu tiến trình xử lý
        }
        throw new Error('Không thể lấy tiến trình xử lý');
    } catch (error) {
        console.error('Lỗi khi lấy tiến trình xử lý:', error);
        throw error; // Ném lại lỗi để xử lý ở nơi gọi hàm
    }
}
// Lấy luận văn theo ID
export const getThesisById = async (id) => {
    try {
        const response = await axiosClient.get(`/thesis/get-thesis/${id}`);
        if (response.status === 200) {
            return response.data; // Trả về dữ liệu luận văn theo ID
        } else {
            throw new Error('Không thể lấy luận văn theo ID');
        }
    } catch (error) {
        console.error('Lỗi khi lấy luận văn theo ID:', error);
        throw error; // Ném lại lỗi để xử lý ở nơi gọi hàm
    }
}
// Tải luận văn
export const downloadTheSis = async (id) => {
  try {
    const response = await axiosClient.get(`/thesis/download-thesis/${id}`, {
      responseType: 'blob', // nhận file dạng blob
    });
    console.log("Download response:", response);

    // Lấy tên file từ header Content-Disposition nếu có, hoặc đặt tên mặc định
    const disposition = response.headers['content-disposition'];
    let fileName = 'downloaded_file';
    if (disposition) {
        const fileNameRegex = /filename[^;=\n]*=(['"]?)([^'";\n]+)\1/;
        const matches = fileNameRegex.exec(disposition);
        if (matches && matches[2]) {
            fileName = matches[2];
    }
    }
    console.log('File name được dùng:', fileName);

    // Tạo URL blob từ dữ liệu nhận được
    const url = window.URL.createObjectURL(new Blob([response.data]));

    // Tạo thẻ <a> ẩn để click tải file
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName); // tên file tải về
    document.body.appendChild(link);
    link.click();

    // Dọn dẹp
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { status: 'success', message: 'Tải file thành công' };

  } catch (error) {
    console.error('Lỗi khi tải luận văn:', error);
    throw error;
  }
};

// Thay đổi trạng thái luận văn: duyệt hoặc từ chối
export const updateTheSisStatus = async (id, status) => {
    try {
        const response = await axiosClient.put(`/thesis/change-status-thesis/${id}`, { status });
        if (response.status === 200) {
            return response.data; // Trả về dữ liệu cập nhật trạng thái luận văn thành công
        } else {
            throw new Error('Không thể cập nhật trạng thái luận văn');
        }
    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái luận văn:', error);
        throw error; // Ném lại lỗi để xử lý ở nơi gọi hàm
    }   
}
// Lấy toàn bộ danh sách luận văn đã upload
export const getAllTheSis = async (params) => {
    try {
        // Nhận obj là params để truyền các tham số lọc
        const {
            page, limit, sort, search, years, categories, majors, fields, preset, supervisors, keywords, accessMode
        } = params;
        let url = `/thesis/get-all-thesis?page=${page}&limit=${limit}`;
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
        if (accessMode && accessMode.length > 0) {
            url += `&accessMode=${accessMode}`; // Bỏ .join(",")
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
export const getAllTheSisForSupervisor = async(params ) => {
try {
        // Nhận obj là params để truyền các tham số lọc
        const {
            page, limit, sort, search, years, categories, majors, fields, preset, supervisors, keywords, status
        } = params;
        let url = `/thesis/get-all-thesis-supervisor?page=${page}&limit=${limit}`;
        if (sort) {
            url += `&sort=${sort}`;
        }
        if (search) {
            url += `&search=${search}`;
        }
        if (years && years.length > 0) { 
            url += `&years=${years}`; // Bỏ .join(",")
        }
        if (status && status.length > 0) {
            url += `&status=${status}`; // Bỏ .join(",")
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

// Lấy danh sách luận văn công khai
export const getAllThesisAdmin = async () => {
    try{
        const response = await axiosClient.get('/thesis/get-all-thesis-admin');
        if (response.status === 200) {
            return response.data; // Trả về danh sách luận văn cho admin
        } else {
            throw new Error('Không thể lấy danh sách luận văn cho admin');
        }
    } catch (error) {
        console.error('Lỗi khi lấy danh sách luận văn cho admin:', error);
        throw error; // Ném lại lỗi để xử lý ở nơi gọi hàm
    }
}

// Lấy danh sách luận văn theo id người dùng
export const getTheSisByUserId = async (id) => {
    try {
        const response = await axiosClient.get(`/thesis/get-thesis-by-user/${id}`);
        if (response.status === 200) {
            return response.data; // Trả về danh sách luận văn theo id người dùng
        } else {
            throw new Error('Không thể lấy danh sách luận văn theo id người dùng');
        }
    } catch (error) {
        console.error('Lỗi khi lấy danh sách luận văn theo id người dùng:', error);
        throw error; // Ném lại lỗi để xử lý ở nơi gọi hàm
    }
}

// Lấy danh sách luận văn của tôi 
export const getMyTheSis = async () => {
    try {
        const response = await axiosClient.get('/thesis/get-my-thesis');
        if (response.status === 200) {
            return response.data; // Trả về danh sách luận văn đã upload
        } else {
            throw new Error('Không thể lấy danh sách luận văn');
        }
    } catch (error) {
        console.error('Lỗi khi lấy danh sách luận văn:', error);
        throw error; // Ném lại lỗi để xử lý ở nơi gọi hàm
    }
}
// Lấy danh sách luận văn đang chờ duyệt
export const getPendingTheSis = async () => {
    try {
        const response = await axiosClient.get('/thesis/get-pending-thesis');
        if (response.status === 200) {
            return response.data; // Trả về danh sách luận văn đang chờ duyệt
        } else {
            throw new Error('Không thể lấy danh sách luận văn đang chờ duyệt');
        }
    } catch (error) {
        console.error('Lỗi khi lấy danh sách luận văn đang chờ duyệt:', error);
        throw error; // Ném lại lỗi để xử lý ở nơi gọi hàm
    }
}
// Lấy danh sách luận văn đã duyệt
export const getApprovedTheSis = async () => {
    try {
        const response = await axiosClient.get('/thesis/get-approved-thesis');
        if (response.status === 200) {
            return response.data; // Trả về danh sách luận văn đã duyệt
        } else {
            throw new Error('Không thể lấy danh sách luận văn đã duyệt');
        }
    } catch (error) {
        console.error('Lỗi khi lấy danh sách luận văn đã duyệt:', error);
        throw error; // Ném lại lỗi để xử lý ở nơi gọi hàm
    }
}
// Cập nhật luận văn
export const updateTheSis = async ({ id, data }) => {
    try {
        const response = await axiosClient.put(`/thesis/update-thesis/${id}`, data);
        console.log('Response từ server sau khi cập nhật luận văn:', response);
        if (response.status === 200) return response.data;
        throw new Error('Không thể cập nhật luận văn');
    } catch (error) {
        console.error('Lỗi khi cập nhật luận văn:', error);
        throw error;
    }
};
// updateThesisAccess
export const updateThesisAccess = async (id, accessData) => {
    console.log('Dữ liệu cập nhật quyền truy cập luận văn:', id);
    try {
        const response = await axiosClient.put(`/thesis/update-thesis-access/${id}`, accessData);
        if (response.status === 200) {
            return response.data; // Trả về dữ liệu cập nhật quyền truy cập luận văn thành công
        } else {
            throw new Error('Không thể cập nhật quyền truy cập luận văn');
        }
    } catch (error) {
        console.error('Lỗi khi cập nhật quyền truy cập luận văn:', error);
        throw error; // Ném lại lỗi để xử lý ở nơi gọi hàm
    }
}
// Xóa luận văn
export const deleteTheSis = async (id) => {
    try {
        const response = await axiosClient.delete(`/thesis/delete-thesis/${id}`);
        if (response.status === 200) {
            return response.data; // Trả về dữ liệu xóa luận văn thành công
        } else {
            throw new Error('Không thể xóa luận văn');
        }
    } catch (error) {
        console.error('Lỗi khi xóa luận văn:', error);
        throw error; // Ném lại lỗi để xử lý ở nơi gọi hàm
    }
}
// Xóa mềm luận văn
export const softDeleteTheSis = async (id) => {
    try {
        const response = await axiosClient.put(`/thesis/soft-delete-thesis/${id}`);
        if (response.status === 200) {
            return response.data; // Trả về dữ liệu xóa mềm luận văn thành công
        } else {
            throw new Error('Không thể xóa mềm luận văn');
        }
    } catch (error) {
        console.error('Lỗi khi xóa mềm luận văn:', error);
        throw error; // Ném lại lỗi để xử lý ở nơi gọi hàm
    }
}
// Lấy danh sách luận văn đã xóa mềm
export const getDeletedTheSis = async () => {
    try {
        const response = await axiosClient.get('/thesis/deleted-theses');
        if (response.status === 200) {
            return response.data; // Trả về danh sách luận văn đã xóa mềm
        } else {
            throw new Error('Không thể lấy danh sách luận văn đã xóa mềm');
        }
    } catch (error) {
        console.error('Lỗi khi lấy danh sách luận văn đã xóa mềm:', error);
        throw error; // Ném lại lỗi để xử lý ở nơi gọi hàm
    }
}
// Phục hồi luận văn đã xóa mềm
export const restoreTheSis = async (id) => {
    try {
        const response = await axiosClient.put(`/thesis/restore-thesis/${id}`);
        if (response.status === 200) {
            return response.data; // Trả về dữ liệu phục hồi luận văn thành công
        } else {
            throw new Error('Không thể phục hồi luận văn');
        }
    } catch (error) {
        console.error('Lỗi khi phục hồi luận văn:', error);
        throw error; // Ném lại lỗi để xử lý ở nơi gọi hàm
    }
}
// Tìm kiếm luận văn theo từ khóa 
export const searchTheSis = async (queryParams) => {
    try {
        const { searchTerm, years, status, categories, majors, fields, page, limit } = queryParams;
        let url = `/thesis/search-thesis?keyword=${encodeURIComponent(searchTerm)}&page=${page}&limit=${limit}`;
        if (years && years.length > 0) { 
            url += `&years=${years}`; // Bỏ .join(",")
        }
        if (status && status.length > 0) {
            url += `&status=${status}`; // Bỏ .join(",")
        }
        if (categories && categories.length > 0) {
            url += `&categories=${categories}`; // Bỏ .join(",")
        }
        if (majors && majors.length > 0) {
            url += `&majors=${majors}`; // Bỏ .join(",")
        }
        if (fields && fields.length > 0) {
            url += `&fields=${fields}`; // Bỏ .join(",")
        }
        const response = await axiosClient.get(url);
        if (response.status === 200) {
            return response.data; // Trả về kết quả tìm kiếm luận văn
        }
    } catch (error) {
        console.error('Lỗi khi tìm kiếm luận văn:', error);
        throw error; // Ném lại lỗi để xử lý ở nơi gọi hàm
    }
}
// Xóa nhiều luận văn
export const deleteManyTheSis = async (ids) => {
    try {
        const response = await axiosClient.delete('/thesis/delete-many-thesis', {
            data: ids  // Gửi danh sách ID luận văn cần xóa
        });
        if (response.status === 200) {
            return response.data; // Trả về dữ liệu xóa nhiều luận văn thành công
        } else {
            throw new Error('Không thể xóa nhiều luận văn');
        }
    } catch (error) {
        console.error('Lỗi khi xóa nhiều luận văn:', error);
        throw error; // Ném lại lỗi để xử lý ở nơi gọi hàm
    }
}


// Yêu cầu xác nhận nếu chọn chia sẻ luận văn công khai
export const requestShareTheSis = async (id) => {
    try {
        const response = await axiosClient.post(`/thesis/request-share-thesis/${id}`);
        if (response.status === 200) {
            return response.data; // Trả về dữ liệu yêu cầu chia sẻ luận văn thành công
        } else {
            throw new Error('Không thể yêu cầu chia sẻ luận văn');
        }
    } catch (error) {
        console.error('Lỗi khi yêu cầu chia sẻ luận văn:', error);
        throw error; // Ném lại lỗi để xử lý ở nơi gọi hàm
    }
}
// Tạo bản sao file pdf tạm thời(nếu là file docx)
export const createTempPdf = async (id) => {
    try {
        const response = await axiosClient.post(`/thesis/create-temp-pdf/${id}`);
        if (response.status === 200) {
            return response.data; // Trả về dữ liệu tạo bản sao pdf tạm thời thành công
        }
        throw new Error('Không thể tạo bản sao pdf tạm thời');
    }
    catch (error) {
        console.error('Lỗi khi tạo bản sao pdf tạm thời:', error);
        throw error; // Ném lại lỗi để xử lý ở nơi gọi hàm
    }
}
export const getThesesByCategory = async (categoryId) => {
    try {
        const response = await axiosClient.get(`/thesis/get-thesis-by-category/${categoryId}`);
        if (response.status === 200) {
            return response.data; // Trả về danh sách luận văn theo danh mục
        }
        throw new Error('Không thể lấy danh sách luận văn theo danh mục');
    }
    catch (error) {
        console.error('Lỗi khi lấy danh sách luận văn theo danh mục:', error);
        throw error; // Ném lại lỗi để xử lý ở nơi gọi hàm
    }
};
// Lấy các luận văn liên quan
export const getRelatedThesis = async (thesisId) => {
    try {
        const response = await axiosClient.get(`/thesis/get-related-thesis/${thesisId}`);
        if (response.status === 200) {
            return response.data; // Trả về danh sách luận văn liên quan
        }
        throw new Error('Không thể lấy danh sách luận văn liên quan');
    }
    catch (error) {
        console.error('Lỗi khi lấy danh sách luận văn liên quan:', error);
        throw error; // Ném lại lỗi để xử lý ở nơi gọi hàm
    }
}
// 
export const checkDuplicateThesis = async (title, tom_tat, keywords, thesisId) => {
    try {
        const response = await axiosClient.post('/thesis/check-duplicate-thesis', { title, tom_tat, keywords, thesisId });
        if (response.status === 200) {
            return response.data; // Trả về kết quả kiểm tra trùng lặp
        }
        throw new Error('Không thể kiểm tra trùng lặp luận văn');
    }
    catch (error) {
        console.error('Lỗi khi kiểm tra trùng lặp luận văn:', error);
        throw error; // Ném lại lỗi để xử lý ở nơi gọi hàm
    }
}

export const generateCitation = async (thesisId, style) => {
    try {
        const response = await axiosClient.post('/thesis/generate-citation', { thesisId, style });
        if (response.status === 200) {
            console.log('Dữ liệu tạo trích dẫn nhận được:', response.data);
            return response.data.data; // Trả về dữ liệu tạo trích dẫn thành công
        }
        throw new Error('Không thể tạo trích dẫn');
    }
    catch (error) {
        console.error('Lỗi khi tạo trích dẫn:', error);
        throw error; // Ném lại lỗi để xử lý ở nơi gọi hàm
    }
}

export const checkUserRelatedToThesis = async (thesisId, userId) => {
    try {
        const response = await axiosClient.get(`/thesis/check-related/${thesisId}`, { userId });
        if (response.status === 200) {
            return response.data; // Trả về kết quả kiểm tra
        }
        throw new Error('Không thể kiểm tra mối quan hệ người dùng với luận văn');
    }
    catch (error) {
        console.error('Lỗi khi kiểm tra mối quan hệ người dùng với luận văn:', error);
        throw error; // Ném lại lỗi để xử lý ở nơi gọi hàm
    }
}
export const getMyUploadedTheses = async (params) => {
    try {
        // Nhận obj là params để truyền các tham số lọc
        const {
            status,
            page,
            limit,
            search,
            from_date,
            to_date,
            years,
            fields,
        } = params;
        let url = `/thesis/my-theses/uploaded?page=${page}&limit=${limit}`;
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
            return response.data.data; // Trả về danh sách luận văn đã upload của tôi
        }
        throw new Error('Không thể lấy danh sách luận văn đã upload của tôi');
    }
    catch (error) {
        console.error('Lỗi khi lấy danh sách luận văn đã upload của tôi:', error);
        throw error; // Ném lại lỗi để xử lý ở nơi gọi hàm
    }
}
export const getTrendingOverview = async () => {
    try {
        const response = await axiosClient.get('/thesis/trending-overview');
        if (response.status === 200) {
            return response.data; // Trả về dữ liệu tổng quan xu hướng luận văn
        }
        throw new Error('Không thể lấy dữ liệu tổng quan xu hướng luận văn');
    }
    catch (error) {
        console.error('Lỗi khi lấy dữ liệu tổng quan xu hướng luận văn:', error);
        throw error; // Ném lại lỗi để xử lý ở nơi gọi hàm
    }
}
export const getPopularKeywords = async () => {
    try {
        const response = await axiosClient.get('/thesis/popular-keywords');
        if (response.status === 200) {
            return response.data; // Trả về danh sách từ khóa phổ biến
        }
        throw new Error('Không thể lấy danh sách từ khóa phổ biến');
    }
    catch (error) {
        console.error('Lỗi khi lấy danh sách từ khóa phổ biến:', error);
        throw error; // Ném lại lỗi để xử lý ở nơi gọi hàm
    }
}
export const getThesisYears = async () => {
    try {
        const response = await axiosClient.get('/thesis/thesis-years');
        if (response.status === 200) {
            return response.data; // Trả về danh sách năm của luận văn
        }
        throw new Error('Không thể lấy danh sách năm của luận văn');
    }
    catch (error) {
        console.error('Lỗi khi lấy danh sách năm của luận văn:', error);
        throw error; // Ném lại lỗi để xử lý ở nơi gọi hàm
    }
}
