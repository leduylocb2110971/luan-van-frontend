import React, { useState, useRef, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
    Table, Spin, Empty, Tag, Button, Input, Space, Tooltip, Tabs, Card, 
    Select, Popover, Badge, Typography, Row, Col, Avatar, Divider 
} from 'antd';
import {
    EyeOutlined,
    SearchOutlined, 
    FilterOutlined,
    ReloadOutlined,
    BookOutlined,
    TeamOutlined,
    EditOutlined,
    DeleteOutlined,
    UserOutlined,
    CalendarOutlined
} from "@ant-design/icons";

import * as CategoryService from "../../../services/CategoryService";
import * as SupervisorService from "../../../services/SupervisorService";
import * as FieldService from "../../../services/FieldService";
import * as Messages from "../../../components/Message/Message";
import EditThesisComponent from "../../../components/EditThesisComponent/EditThesisComponent";
import ActionsDropdownComponent from "../../../components/ActionsDropdownComponent/ActionsDropdownComponent";
import StatusFilterComponent from "../../../components/StatusFilterComponent/StatusFilterComponent";
import YearFilterComponent from "../../../components/YearFilterComponent/YearFilterComponent.jsx";
import FieldFilterComponent from "../../../components/FieldFilterComponent/FieldFilterComponent.jsx";
import DateRangeFilter from "../../../components/DateRangeFilter/DateRangeFilter.jsx";
import BreadCrumbComponent from "../../../components/BreadcrumbComponent/BreadcrumbComponent";

const { Title, Text } = Typography;

// --- GIỮ NGUYÊN CÁC HÀM TIỆN ÍCH ---
const getArrayFromUrl = (searchParams, key) => {
    const value = searchParams.get(key);
    return value ? value.split(",").filter(item => item) : [];
};

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
    const parts = String(text).split(regex);
    return (
        <>
            {parts.filter(String).map((part, i) => {
                const isMatch = part.toLowerCase() === highlight.toLowerCase();
                return isMatch ? (
                    <span key={i} style={{ backgroundColor: "#fffb8f", fontWeight: "bold", padding: '0 2px', borderRadius: 2 }}>
                        {part}
                    </span>
                ) : (
                    <span key={i}>{part}</span>
                );
            })}
        </>
    );
};

const SupervisedThesesPage = () => {
    const navigate = useNavigate();
    const [editThesis, setEditThesis] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    
    // --- GIỮ NGUYÊN TOÀN BỘ STATE & LOGIC ---
    const initialTab = searchParams.get("tab") || "theses";
    const [activeTab, setActiveTab] = useState(initialTab);
    const [filterStatus, setFilterStatus] = useState(searchParams.get("status") || "");
    const [yearsFilter, setYearsFilter] = useState(getArrayFromUrl(searchParams, 'years'));
    const [fieldsFilter, setFieldsFilter] = useState(getArrayFromUrl(searchParams, 'fields'));
    
    const initialPage = Number(searchParams.get("page")) || 1;
    const initialPageSize = Number(searchParams.get("limit")) || 10; // Chỉnh mặc định lên 10 cho đẹp bảng
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [pageSize, setPageSize] = useState(initialPageSize);

    const initialSearchTerm = searchParams.get("search") || "";
    const [searchInput, setSearchInput] = useState(initialSearchTerm);
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm);

    const initialStartDate = searchParams.get("from_date") || "";
    const initialEndDate = searchParams.get("to_date") || "";
    const [startDateFilter, setStartDateFilter] = useState(initialStartDate);
    const [endDateFilter, setEndDateFilter] = useState(initialEndDate);

    // Effect debounce search
    useEffect(() => {
        const handler = setTimeout(() => {
            const currentUrlParams = new URLSearchParams(window.location.search);
            const currentUrlSearch = currentUrlParams.get("search") || "";

            if (searchInput === currentUrlSearch) {
                setSearchTerm(searchInput);
                return;
            }

            setSearchTerm(searchInput);
            const params = new URLSearchParams(window.location.search);
            if (searchInput) params.set("search", searchInput);
            else params.delete("search");

            params.set("page", "1");
            setCurrentPage(1);
            setSearchParams(params, { replace: true });
        }, 300);
        return () => clearTimeout(handler);
    }, [searchInput, setSearchParams]);

    // Queries
    const { data: categories } = useQuery({
        queryKey: ["categories"],
        queryFn: CategoryService.getCategories,
        refetchOnWindowFocus: false,
    });
    const categoriesResponse = categories?.data || [];

    const { data: fields } = useQuery({
        queryKey: ["fields"],
        queryFn: FieldService.getAllFields,
        refetchOnWindowFocus: false,
    });
    const fieldsList = fields?.data || [];

    const { data: myThesis, isLoading: isLoadingTheses, isError: isErrorTheses, error: errorTheses, refetch: refetchTheses } = useQuery({
        queryKey: ["myThesis", filterStatus, currentPage, pageSize, searchTerm, startDateFilter, endDateFilter, Array.isArray(yearsFilter) ? yearsFilter.join(',') : '', Array.isArray(fieldsFilter) ? fieldsFilter.join(',') : ''],
        queryFn: () => SupervisorService.getSupervisedThesis({
            status: filterStatus, page: currentPage, limit: pageSize, search: searchTerm,
            from_date: startDateFilter, to_date: endDateFilter,
            years: Array.isArray(yearsFilter) ? yearsFilter.join(',') : '',
            fields: Array.isArray(fieldsFilter) ? fieldsFilter.join(',') : '',
        }),
        refetchOnWindowFocus: false,
    });
    const myThesisResponse = myThesis?.theses || [];
    console.log("myThesisResponse", myThesisResponse);
    const overallTotalTheses = myThesis?.overallTotal || 0;
    const totalItemsTheses = myThesis?.total || 0;

    const { data: supervisedStudents, isLoading: isLoadingStudents, isError: isErrorStudents, error: errorStudents } = useQuery({
        queryKey: ["supervisedStudents", currentPage, pageSize, searchTerm, Array.isArray(yearsFilter) ? yearsFilter.join(',') : '', Array.isArray(fieldsFilter) ? fieldsFilter.join(',') : ''],
        queryFn: () => SupervisorService.getSupervisedStudents({
            page: currentPage, limit: pageSize, search: searchTerm,
            years: Array.isArray(yearsFilter) ? yearsFilter.join(',') : '',
            fields: Array.isArray(fieldsFilter) ? fieldsFilter.join(',') : '',
        }),
        refetchOnWindowFocus: false,
    });
    const supervisedStudentsResponse = supervisedStudents?.data?.students || [];
    const overallTotalStudents = supervisedStudents?.data.total || 0;
    const totalItemsStudents = supervisedStudents?.data.total || 0;

    const deleteMutation = useMutation({
        mutationFn: SupervisorService.deleteSupervisedThesis,
        onSuccess: () => { Messages.success("Đã xoá luận văn thành công"); refetchTheses(); },
        onError: () => Messages.error("Không thể xoá luận văn."),
    });

    // Effect Sync URL
    useEffect(() => {
        const newSearchParams = new URLSearchParams();
        updateSearchParams(newSearchParams, 'tab', activeTab);
        if (activeTab === 'theses') {
            updateSearchParams(newSearchParams, 'status', filterStatus);
            updateSearchParams(newSearchParams, 'from_date', startDateFilter);
            updateSearchParams(newSearchParams, 'to_date', endDateFilter);
        }
        updateSearchParams(newSearchParams, 'search', searchTerm);
        updateSearchParams(newSearchParams, 'years', yearsFilter);
        updateSearchParams(newSearchParams, 'fields', fieldsFilter);
        updateSearchParams(newSearchParams, 'page', currentPage > 1 ? currentPage.toString() : null);
        updateSearchParams(newSearchParams, 'limit', pageSize !== 10 ? pageSize.toString() : null);
        setSearchParams(newSearchParams, { replace: true });
    }, [activeTab, filterStatus, searchTerm, startDateFilter, endDateFilter, yearsFilter, fieldsFilter, currentPage, pageSize, setSearchParams]);

    // Handlers
    const handleTabChange = (key) => {
        setActiveTab(key);
        setCurrentPage(1);
    };
    const handlePageChange = (page, size) => {
        setCurrentPage(page);
        if (size !== pageSize) setPageSize(size);
    };
    const handleStatusFilterChange = useCallback((newStatus) => {
        setFilterStatus(newStatus);
        setCurrentPage(1);
    }, []);
    const handleGeneralFilterChange = useCallback((key, newValues) => {
        if (key === 'years') setYearsFilter(newValues);
        if (key === 'fields') setFieldsFilter(newValues);
        setCurrentPage(1);
    }, []);
    const handleDateRangeChange = (startDate, endDate) => {
        setStartDateFilter(startDate);
        setEndDateFilter(endDate);
        setCurrentPage(1);
    };
    const handleDateFilterClear = () => {
        setStartDateFilter("");
        setEndDateFilter("");
        setCurrentPage(1);
    };
    const handleEditThesis = (thesis) => {
        setEditThesis(thesis);
        setIsEditModalOpen(true);
    };

    // --- CẤU HÌNH CỘT BẢNG (GIAO DIỆN MỚI) ---
    const statusColors = {
        approved_public: "success", rejected_public: "error", draft: "default",
        submitted_internal: "processing", pending_public: "warning"
    };
    const statusLabels = {
        approved_public: "Đã duyệt", rejected_public: "Từ chối", draft: "Nháp",
        submitted_internal: "Nội bộ", pending_public: "Chờ duyệt"
    };

    const getThesisColumns = () => [
        {
            title: 'Tên Luận văn',
            dataIndex: 'title',
            key: 'title',
            width: 350,
            render: (text, record) => (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <a onClick={() => navigate(`/thesis/${record._id}`)} style={{ fontWeight: 600, fontSize: 15, color: '#1890ff', marginBottom: 4 }}>
                        <HighlightText text={text} highlight={searchTerm} />
                    </a>
                    <Space size="small">
                        {record.year && <Tag>{record.year}</Tag>}
                        {record.field?.name && <Tag color="blue">{record.field.name}</Tag>}
                    </Space>
                </div>
            ),
        },
        {
            title: 'Sinh viên',
            dataIndex: 'authorName',
            key: 'authorName',
            width: 200,
            render: (text, record) => {
                let studentName = text && text !== "undefined" ? text : (record.coAuthorsNames?.join(", ") || "Chưa cập nhật");
                return (
                    <Space>
                        <Avatar style={{ backgroundColor: '#87d068' }} size="small" icon={<UserOutlined />} />
                        <HighlightText text={studentName} highlight={searchTerm} />
                    </Space>
                );
            }
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status) => <Tag color={statusColors[status]}>{statusLabels[status] || status}</Tag>,
        },
        {
            title: 'Ngày nộp',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 120,
            render: (date) => <span style={{ color: '#8c8c8c' }}><CalendarOutlined /> {date ? new Date(date).toLocaleDateString("vi-VN") : "N/A"}</span>,
        },
        {
            title: 'Quyền truy cập',
            dataIndex: 'accessMode',
            key: 'accessMode',
            width: 120,
            render: (mode) => {
                const map = {
                    // Kiểm tra kỹ xem DB lưu là 'public' hay 'public_full' nhé
                    "public": { label: "Công khai", status: "success" }, 
                    "public_full": { label: "Công khai", status: "success" }, // Thêm dòng này cho chắc
                    "abstract_only": { label: "Tóm tắt", status: "warning" },
                    "internal": { label: "Nội bộ", status: "processing" },
                    "private": { label: "Riêng tư", status: "error" },
                };
                
                // Thêm fallback để lỡ mode không khớp thì không bị crash trắng trang
                const info = map[mode] || { label: mode || "Chưa rõ", status: "default" };
                
                // SỬA CHỖ NÀY: info.status chứ không phải info.color
                return <Badge status={info.status} text={info.label} />;
            }
        },
        {
            title: 'Chế độ tải',
            dataIndex: 'allowDownload',
            key: 'allowDownload',
            width: 100,
            align: 'center',
            render: (allow) => allow ? <Tag color="green">Có</Tag> : <Tag color="red">Không</Tag>,
        },
        {
            title: '',
            key: 'actions',
            width: 80,
            align: 'center',
            fixed: 'right',
            render: (_, record) => (
                <ActionsDropdownComponent 
                    items={[
                        { label: "Xem chi tiết", icon: <EyeOutlined />, onClick: () => navigate(`/thesis/${record._id}`) },
                        { label: "Chỉnh sửa", icon: <EditOutlined />, onClick: () => handleEditThesis(record) },
                        { 
                            label: <span style={{ color: 'red' }}>Xoá</span>, 
                            icon: <DeleteOutlined style={{ color: 'red' }} />, 
                            onClick: () => deleteMutation.mutate(record._id),
                            confirm: { title: "Xác nhận xoá?", okText: "Xoá", danger: true }
                        }
                    ]} 
                />
            ),
        },
    ];

    const getStudentColumns = () => [
        {
            title: 'Sinh viên',
            dataIndex: 'name',
            key: 'name',
            width: 180,
            render: (text, record) => (
                <Space>
                    <Avatar size={40} style={{ backgroundColor: '#1890ff', verticalAlign: 'middle' }}>
                        {text?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <div>
                        <div style={{ fontWeight: 600 }}><HighlightText text={text} highlight={searchTerm} /></div>
                        <div style={{ fontSize: 12, color: '#8c8c8c' }}>{record.email}</div>
                    </div>
                </Space>
            ),
        },
        {
            title: 'MSSV',
            dataIndex: 'mssv',
            key: 'mssv',
            width: 50,
            render: (text) => <Tag color="geekblue">{text || 'N/A'}</Tag>
        },
        {
            title: 'Ngành',
            dataIndex: 'major',
            key: 'major',
            width: 150,
            render: (text) => text || 'Chưa cập nhật',
        },
        {
            title: 'Số luận văn',
            dataIndex: 'thesisCount',
            key: 'thesisCount',
            width: 100,
            align: 'center',
            sorter: (a, b) => a.thesisCount - b.thesisCount,
            render: (count) => <Badge count={count} showZero style={{ backgroundColor: '#52c41a' }} />
        },
        {
            title: '',
            key: 'actions',
            width: 200,
            align: 'center',
            render: (_, record) => (
                <Tooltip title="Lọc luận văn của sinh viên này">
                    <Button 
                        size="small"
                        icon={<FilterOutlined />} 
                        onClick={() => {
                            setActiveTab('theses');
                            setSearchInput(record.name);
                            setSearchTerm(record.name);
                        }}
                    />
                </Tooltip>
            ),
        },
    ];

    // --- RENDER CONTENT ---
    const currentData = activeTab === 'theses' ? myThesisResponse : supervisedStudentsResponse;
    const currentTotalItems = activeTab === 'theses' ? totalItemsTheses : totalItemsStudents;
    const currentColumns = activeTab === 'theses' ? getThesisColumns() : getStudentColumns();
    const currentIsLoading = activeTab === 'theses' ? isLoadingTheses : isLoadingStudents;
    const currentIsError = activeTab === 'theses' ? isErrorTheses : isErrorStudents;
    const currentError = activeTab === 'theses' ? errorTheses : errorStudents;

    // Advanced Filter Content (Refined UI)
    const AdvancedFilterContent = () => (
        <div style={{ width: 400, padding: 8 }}>
            <Row gutter={[16, 16]}>
                <Col span={12}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#595959', display: 'block', marginBottom: 4 }}>Năm thực hiện</label>
                    <YearFilterComponent selectedYears={yearsFilter} onFilterChange={handleGeneralFilterChange} filterKey="years" />
                </Col>
                <Col span={12}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#595959', display: 'block', marginBottom: 4 }}>Lĩnh vực</label>
                    <FieldFilterComponent selectedFields={fieldsFilter} onFilterChange={handleGeneralFilterChange} fieldsData={fieldsList} />
                </Col>
                <Col span={24}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#595959', display: 'block', marginBottom: 4 }}>Thời gian nộp</label>
                    <DateRangeFilter 
                        onFilterApply={handleDateRangeChange} 
                        onFilterClear={handleDateFilterClear}
                        initialStartDate={startDateFilter} 
                        initialEndDate={endDateFilter} 
                    />
                </Col>
            </Row>
        </div>
    );

    return (
        <>
            <BreadCrumbComponent customNameMap={{ "lecturer": "Giảng Viên", "supervised": "Quản Lý Hướng Dẫn" }} />
            
            <div style={{ margin: '0 auto' }}>
                {/* TITLE & TABS */}
                <div >
                    <Tabs 
                        type="card"
                        activeKey={activeTab} 
                        onChange={handleTabChange} 
                        items={[
                            { label: <span><BookOutlined /> Luận Văn ({overallTotalTheses})</span>, key: 'theses' },
                            { label: <span><TeamOutlined /> Sinh Viên ({overallTotalStudents})</span>, key: 'students' }
                        ]}
                    />
                </div>

                {/* TOOLBAR AREA */}
                <Card  style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                        {/* LEFT: SEARCH & STATUS */}
                        <div style={{ display: 'flex', flex: 1, minWidth: 300 }}>
                            <Input.Search
                                placeholder="Tìm kiếm theo tên đề tài, sinh viên..."
                                allowClear
                                onSearch={() => setCurrentPage(1)}
                                onChange={(e) => setSearchInput(e.target.value)}
                                value={searchInput}
                                enterButton={<SearchOutlined />}
                                style={{ maxWidth: 400 }}
                            />
                        </div>
                        {activeTab === 'theses' && (
                                <StatusFilterComponent 
                                    selectedStatus={filterStatus} 
                                    onChange={handleStatusFilterChange} 
                                    style={{ width: 180 }}
                                />
                            )}

                        {/* RIGHT: ADVANCED FILTER & REFRESH */}
                        <Space>
                            <Popover 
                                placement="bottomRight" 
                                title={<Text strong>Bộ lọc nâng cao</Text>} 
                                content={<AdvancedFilterContent />} 
                                trigger="click"
                            >
                                <Button icon={<FilterOutlined />}>Lọc thêm</Button>
                            </Popover>
                            <Tooltip title="Làm mới dữ liệu">
                                <Button icon={<ReloadOutlined />} onClick={() => activeTab === 'theses' ? refetchTheses() : null} />
                            </Tooltip>
                        </Space>
                    </div>
                </Card>

                {/* DATA TABLE AREA */}
                <Card style={{ borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    {/* INFO BAR */}
                    <div style={{ padding: '12px 16px', background: '#fafafa', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between' }}>
                        <Text type="secondary">
                            Hiển thị <strong>{currentData.length}</strong> / <strong>{currentTotalItems}</strong> kết quả
                        </Text>
                    </div>

                    <Spin spinning={currentIsLoading}>
                        {currentIsError ? (
                            <Empty description={<span style={{ color: 'red' }}>Lỗi tải dữ liệu: {currentError?.message}</span>} />
                        ) : (
                            <Table
                                columns={currentColumns}
                                dataSource={currentData.map(item => ({...item, key: item._id || item.mssv}))}
                                pagination={{
                                    current: currentPage,
                                    pageSize: pageSize,
                                    total: currentTotalItems,
                                    onChange: handlePageChange,
                                    showSizeChanger: true,
                                    showTotal: (total) => `Tổng ${total} mục`
                                }}
                                scroll={{ x: 1000 }}
                                size="middle"
                                locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không tìm thấy dữ liệu phù hợp" /> }}
                            />
                        )}
                    </Spin>
                </Card>
            </div>

            {/* EDIT MODAL */}
            {isEditModalOpen && editThesis && (
                <EditThesisComponent
                    open={isEditModalOpen}
                    onClose={() => { setIsEditModalOpen(false); setEditThesis(null); }}
                    thesis={editThesis}
                    categories={categoriesResponse}
                    onSuccess={() => { refetchTheses(); setIsEditModalOpen(false); setEditThesis(null); }}
                />
            )}
        </>
    );
};

export default SupervisedThesesPage;