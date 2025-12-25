import React, { useMemo, useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Space, Table, Input, Button, Tag, Tooltip, Empty, Spin, Badge, Card, Popover } from "antd";
import {
    EyeOutlined,
    FilterOutlined,
} from "@ant-design/icons";
import { useNavigate, useSearchParams } from "react-router-dom";

// Components & Services đã import của bạn (Đã thêm các component lọc mới)
import StatusFilterComponent from "../../../components/StatusFilterComponent/StatusFilterComponent";
import ThesisDefaultComponent from "../../../components/ThesisDetailComponent/ThesisDetailComponent";
import BreadcrumbComponent from "../../../components/BreadcrumbComponent/BreadcrumbComponent";
import * as ThesisService from "../../../services/TheSisService";
import * as FieldService from "../../../services/FieldService"; // Cần thiết để lấy danh sách fields
import * as CategoryService from "../../../services/CategoryService";
// Cần import các component lọc nâng cao
import YearFilterComponent from "../../../components/YearFilterComponent/YearFilterComponent.jsx";
import FieldFilterComponent from "../../../components/FieldFilterComponent/FieldFilterComponent.jsx";
import DateRangeFilter from "../../../components/DateRangeFilter/DateRangeFilter.jsx";


// Hàm tiện ích đọc mảng từ URL, tách bằng ','
const getArrayFromUrl = (searchParams, key) => {
    const value = searchParams.get(key);
    return value ? value.split(",").filter(item => item) : [];
};

// Hàm tiện ích cập nhật URL Search Params
const updateSearchParams = (searchParams, key, value) => {
    if (value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) {
        searchParams.delete(key);
    } else if (Array.isArray(value)) {
        searchParams.set(key, value.join(","));
    } else {
        searchParams.set(key, value);
    }
};

const HighlightText = ({ text, highlight }) => {
    if (!highlight || highlight.trim() === "") return <>{text}</>;
    const regex = new RegExp(`(${highlight})`, "gi");
    const parts = text.split(regex);
    return (
        <>
            {parts.filter(String).map((part, i) => {
                const isMatch = part.toLowerCase() === highlight.toLowerCase();
                return isMatch ? (
                    <span key={i} style={{ backgroundColor: "#ffe58f", fontWeight: "bold" }}>
                        {part}
                    </span>
                ) : (
                    <span key={i}>{part}</span>
                );
            })}
        </>
    );
};

const AllThesesPage = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedKey, setSelectedKey] = useState("");

    // --- State cho Phân trang & Lọc
    const initialPage = Number(searchParams.get("page")) || 1;
    const initialPageSize = Number(searchParams.get("limit")) || 10;
    const initialSearchTerm = searchParams.get("search") || "";
    const initialStatus = searchParams.get("status") || "";
    const initialStartDate = searchParams.get("from_date") || "";
    const initialEndDate = searchParams.get("to_date") || "";

    const [currentPage, setCurrentPage] = useState(initialPage);
    const [pageSize, setPageSize] = useState(initialPageSize);
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
    const [searchInput, setSearchInput] = useState(initialSearchTerm);
    const [filterStatus, setFilterStatus] = useState(initialStatus);

    // --- State Lọc Nâng cao (Đã thêm)
    const [yearsFilter, setYearsFilter] = useState(getArrayFromUrl(searchParams, 'years'));
    const [fieldsFilter, setFieldsFilter] = useState(getArrayFromUrl(searchParams, 'fields'));
    const [categoriesFilter, setCategoriesFilter] = useState(getArrayFromUrl(searchParams, 'categories'));
    const [startDateFilter, setStartDateFilter] = useState(initialStartDate);
    const [endDateFilter, setEndDateFilter] = useState(initialEndDate);

    // --- Lấy danh sách categoris
    const { data: categories } = useQuery({
        queryKey: ["allCategories"],
        queryFn: CategoryService.getCategories,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
    const categoriesList = categories?.data || [];
    // --- Lấy danh sách lĩnh vực (fields)
    const { data: fields } = useQuery({
        queryKey: ["allFields"],
        queryFn: FieldService.getAllFields,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
    const fieldsList = fields?.data || [];
    
    // --- Tải dữ liệu Luận văn
    const { data: allTheses, isLoading: isLoadingTheses, refetch: refetchTheses } = useQuery({
        queryKey: [
            "allThesesLecturer", 
            currentPage, 
            pageSize, 
            searchTerm, 
            filterStatus,
            Array.isArray(yearsFilter) ? yearsFilter.join(',') : '',
            Array.isArray(categoriesFilter) ? categoriesFilter.join(',') : '',
            Array.isArray(fieldsFilter) ? fieldsFilter.join(',') : '',
            startDateFilter,
            endDateFilter,
        ],
        queryFn: () => ThesisService.getAllTheSisForSupervisor({
            page: currentPage,
            limit: pageSize,
            search: searchTerm,
            status: filterStatus,
            years: Array.isArray(yearsFilter) ? yearsFilter.join(',') : '',
            categories: Array.isArray(categoriesFilter) ? categoriesFilter.join(',') : '',
            fields: Array.isArray(fieldsFilter) ? fieldsFilter.join(',') : '',
            from_date: startDateFilter,
            to_date: endDateFilter,
        }),
        refetchOnWindowFocus: false,
    });

    const thesesData = allTheses?.data.theses || [];
    console.log ("thesesData", thesesData);
    const totalItems = allTheses?.data.total || 0;

    // --- LOGIC XỬ LÝ LỌC VÀ PHÂN TRANG

    // Cập nhật URL khi state thay đổi
    useEffect(() => {
        const newSearchParams = new URLSearchParams();
        
        updateSearchParams(newSearchParams, 'search', searchTerm);
        updateSearchParams(newSearchParams, 'status', filterStatus);
        
        // Cập nhật URL cho các bộ lọc nâng cao
        updateSearchParams(newSearchParams, 'years', yearsFilter);
        updateSearchParams(newSearchParams, 'categories', categoriesFilter);
        updateSearchParams(newSearchParams, 'fields', fieldsFilter);
        updateSearchParams(newSearchParams, 'from_date', startDateFilter);
        updateSearchParams(newSearchParams, 'to_date', endDateFilter);

        updateSearchParams(newSearchParams, 'page', currentPage > 1 ? currentPage.toString() : null);
        updateSearchParams(newSearchParams, 'limit', pageSize !== 10 ? pageSize.toString() : null);

        setSearchParams(newSearchParams, { replace: true });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm, filterStatus, yearsFilter, fieldsFilter, startDateFilter, endDateFilter, currentPage, pageSize]);

    // Xử lý thay đổi trang
    const handlePageChange = (page, size) => {
        setCurrentPage(page);
        if (size !== pageSize) {
            setPageSize(size);
        }
    };
    
    // Xử lý tìm kiếm debounce
    useEffect(() => {
        const handler = setTimeout(() => {
            setSearchTerm(searchInput);
            setCurrentPage(1);
        }, 300);

        return () => clearTimeout(handler);
    }, [searchInput]);

    // Xử lý lọc trạng thái
    const handleStatusFilterChange = useCallback((newStatus) => {
        setFilterStatus(newStatus);
        setCurrentPage(1);
    }, []);

    // Xử lý thay đổi Năm + Lĩnh vực (Dùng chung hàm)
    const handleGeneralFilterChange = useCallback((key, newValues) => {
        // 1. Cập nhật State
        if (key === 'years') setYearsFilter(newValues);
        if (key === 'categories') setCategoriesFilter(newValues);
        if (key === 'fields') setFieldsFilter(newValues);
        setCurrentPage(1); 
    }, []);

    // Xử lý thay đổi Date Range
    const handleDateRangeChange = useCallback((startDate, endDate) => {
        setStartDateFilter(startDate);
        setEndDateFilter(endDate);
        setCurrentPage(1);
    }, []);

    const handleDateFilterClear = useCallback(() => {
        setStartDateFilter("");
        setEndDateFilter("");
        setCurrentPage(1);
    }, []);

    
    // Màu cho status
    const statusColors = {
        approved_public: "#008000",
        rejected_public: "#c82333",
        draft: "#343a40",
        submitted_internal: "#0056b3",
        pending_public: "#cc7a00"
    };

    // Định nghĩa Cột cho Table (Giữ nguyên)
    const columns = useMemo(() => [
        {
            title: 'Tiêu đề Luận văn',
            dataIndex: 'title',
            key: 'title',
            width: 300,
            render: (text) => <HighlightText text={text} highlight={searchTerm} />,
        },
        {
            title: 'Sinh viên',
            dataIndex: 'authorName',
            key: 'authorName',
            width: 150,
            render: (text) => <HighlightText text={text || "Chưa cập nhật"} highlight={searchTerm} />,
        },
        {
            title: 'GVHD',
            dataIndex: 'supervisorName',
            key: 'supervisorName',
            width: 150,
            render: (text) => <HighlightText text={text || "Chưa cập nhật"} highlight={searchTerm} />,
        },
        {
            title: 'Chủ đề',
            dataIndex: 'field',
            key: 'field',
            width: 150,
            render: (text, record) => (
                <HighlightText text={text || "Chưa cập nhật"} highlight={searchTerm} />
            ),
        },
        {
            title: 'Ngày nộp',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 150,
            render: (date) => date ? new Date(date).toLocaleDateString() : "Chưa cập nhật",
        },
        {
            title: 'Ngày duyệt',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            width: 150,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status) => {
                let statusText = "❓ Không rõ";

                if (status === "approved" || status === "approved_public") {
                    statusText = "Đã duyệt";
                } else if (status === "rejected" || status === "rejected_public") {
                    statusText = "Từ chối";
                } else if (status === "draft") {
                    statusText = "Nháp";
                } else if (status === "submitted_internal") {
                    statusText = "Nội bộ";
                } else if (status === "pending_public") {
                    statusText = "Chờ duyệt";
                }
                const color = statusColors[status] || "#595959";
                return <Tag color={color} style={{ fontWeight: 600 }}>{statusText}</Tag>;
            },
        },
        {
            title: 'Chế độ công khai',
            dataIndex: 'accessMode',
            key: 'accessMode',
            width:150,
                render: (mode) => {
                    const map = {
                        // Kiểm tra kỹ xem DB lưu là 'public' hay 'public_full' nhé
                        "public": { label: "Công khai", status: "success" }, 
                        "public_full": { label: "Công khai", status: "success" }, // Thêm dòng này cho chắc
                        "abstract_only": { label: "Tóm tắt", status: "warning" },
                        "department_only": { label: "Nội bộ", status: "processing" },
                        "private": { label: "Riêng tư", status: "error" },
                    };
                    
                    // Thêm fallback để lỡ mode không khớp thì không bị crash trắng trang
                    const info = map[mode] || { label: mode || "Chưa rõ", status: "default" };
                    
                    // SỬA CHỖ NÀY: info.status chứ không phải info.color
                    return <Badge status={info.status} text={info.label} />;
                }
            },
        {
        title: "Chi tiết",
        key: "action",
        width: 100,
        render: (_, record) => (
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedKey(record.key);
              setModalVisible(true);
            }}
          >
            Xem
          </Button>
        ),
      },
    ], [searchTerm]);

    const dataTable = thesesData?.map((item) => ({
        key: item?._id,
        title: item?.title,
        category: item?.category?.name || "Chưa cập nhật",
        categoryId: item?.category?._id || "",
        major: item?.major?.name || "Chưa cập nhật",
        majorId: item?.major?._id || "",
        field: item?.field?.name || "Chưa cập nhật",
        fieldId: item?.field?._id || "",
        fileUrl: item?.fileUrl,
        coAuthorsName: item?.coAuthorsName || [],
        authorName: item?.authorName || "Chưa cập nhật",
        supervisorName: item?.supervisorName || "Chưa cập nhật",
        year: item?.year,
        status: item?.status, 
        accessMode: item?.accessMode,
        createdAt: item?.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Chưa cập nhật",
        updatedAt: item?.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : "Chưa cập nhật",
    })) || [];
    console.log("dataTable", dataTable);

    // --- PHẦN NỘI DUNG CỦA POPOVER (FILTER CONTENT) ---
    const AdvancedFilterContent = () => (
        // SỬ DỤNG CSS GRID 2 CỘT VÀ THÊM GAP
        <div 
            style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: 12, // Đã thêm khoảng cách
                padding: 4, 
            }}
        >
            {/* 1. Năm (Chiếm 1 cột) */}
            <div>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: '500' }}>Khoa</label>
                <FieldFilterComponent
                    selectedFields={categoriesFilter}
                    onFilterChange={handleGeneralFilterChange}
                    filterKey="categories"
                    fieldsData={categoriesList}
                    placeholder="🏫 Chọn Khoa"
                />
                
            </div>

            {/* 2. Lĩnh vực (Chiếm 1 cột) */}
            <div>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: '500' }}>Lĩnh vực</label>
                <FieldFilterComponent
                    selectedFields={fieldsFilter}
                    onFilterChange={handleGeneralFilterChange}
                    fieldsData={fieldsList}
                />
            </div>
            <div>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: '500' }}>Năm</label>
                <YearFilterComponent
                    selectedYears={yearsFilter}
                    onFilterChange={handleGeneralFilterChange}
                    filterKey="years"
                />
            </div>

            {/* 3. Date Range (Chiếm 1 cột) */}
            <div style={{ gridColumn: 'span 2' }}> 
                <label style={{ display: 'block', marginBottom: 4, fontWeight: '500' }}>Khoảng thời gian</label>
                <DateRangeFilter
                    onFilterApply={handleDateRangeChange}
                    onFilterClear={handleDateFilterClear}
                    initialStartDate={startDateFilter}
                    initialEndDate={endDateFilter}
                />
            </div>
            {/* 4. Nút reset toàn bộ */}
            <div style={{ gridColumn: 'span 2', textAlign: 'right', paddingTop: 8 }}>
                <Button 
                    size="middle"
                    onClick={() => {
                        setYearsFilter([]);
                        setFieldsFilter([]);
                        setCategoriesFilter([]);
                        setStartDateFilter("");
                        setEndDateFilter("");
                        setCurrentPage(1);
                    }}
                    danger
                >
                    Reset
                </Button>
            </div>
        </div>
    );

    return (
        <>
            <BreadcrumbComponent customNameMap={{ 
                "all-theses": "Tất cả đề tài",
                "lecturer": "Giảng viên" }} />
            <div 
            style={{ 
                background: '#fff', 
                borderRadius: '8px', 
            }}
            > 
                {/* Thanh Bộ Lọc và Tìm kiếm */}
                <Card
                    style={{
                        marginBottom: 20,
                        borderRadius: 10,
                        padding: 0, // Bỏ padding của Card
                    }}
                >
                    <div
                        style={{
                            display: "flex", // Sử dụng Flexbox cho hàng chính
                            gap: 12,
                            alignItems: "center",
                            flexWrap: 'wrap',
                        }}
                    >
                        {/* 1. Ô Từ khóa (Search Input) */}
                        <Input.Search
                            placeholder="Tìm kiếm..."
                            enterButton
                            size="large"
                            value={searchInput}
                            allowClear
                            onChange={(e) => setSearchInput(e.target.value)}
                            onSearch={() => setCurrentPage(1)}
                            style={{ flexGrow: 1, minWidth: 250, maxWidth: 400 }}
                        />
                        
                        {/* 2. Trạng thái (Status Filter) */}
                        <StatusFilterComponent
                            selectedStatus={filterStatus}
                            onChange={handleStatusFilterChange}
                            style={{ minWidth: 150 }}
                        />
                        
                        {/* 3. Nút mở Popover Bộ lọc nâng cao */}
                        <Popover
                            placement="bottomRight"
                            title="Bộ lọc nâng cao"
                            trigger="click"
                            content={<AdvancedFilterContent />}
                        >
                            <Button size="middle" icon={<FilterOutlined />}>
                                Bộ lọc
                            </Button>
                        </Popover>
                        
                    </div>
                </Card>
                
                {/* Thông báo số lượng */}
                <div style={{ marginBottom: 10, fontSize: '14px', color: '#595959' }}>
                    Tìm thấy <strong>{totalItems}</strong> luận văn.
                </div>
                
                {/* Bảng Dữ liệu */}
                {isLoadingTheses ? (
                    <Spin tip="Đang tải dữ liệu luận văn..." style={{ width: '100%', padding: '50px 0' }} />
                ) : (
                    <Table
                        columns={columns}
                        dataSource={dataTable}
                        loading={isLoadingTheses}
                        scroll={{ x: 1000 }}
                        pagination={{
                            current: currentPage,
                            pageSize: pageSize,
                            total: totalItems,
                            onChange: handlePageChange,
                            showSizeChanger: true,
                            pageSizeOptions: ['10', '20', '50'],
                            style: { marginTop: 20, textAlign: 'right' }
                        }}
                        locale={{
                            emptyText: (
                                <Empty 
                                    image={Empty.PRESENTED_IMAGE_SIMPLE} 
                                    description="Không tìm thấy luận văn nào thỏa mãn bộ lọc."
                                />
                            )
                        }}
                    />
                )}

                {/* Modal Chi tiết Luận văn */}
                <ThesisDefaultComponent
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    dataTable={dataTable}
                    selectedKey={selectedKey}
                />
            </div>
        </>
        
    );
};

export default AllThesesPage;