import React, { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    Row, Col, Card, Button, Input, Collapse, Select, Switch, Modal,
    Typography, Tag, Space, Divider, Tooltip, Skeleton, Alert, Empty
} from "antd";
import {
    PlusOutlined, SearchOutlined, FilterOutlined, SettingOutlined,
    GlobalOutlined, LockOutlined, BankOutlined, FileTextOutlined, 
    EyeOutlined, DownloadOutlined, UserOutlined, UndoOutlined, 
    BookOutlined, EditOutlined, ShareAltOutlined, DeleteOutlined
} from "@ant-design/icons";

import * as CategoryService from "../../../services/CategoryService"; 
import * as MajorService from "../../../services/MajorService";
import * as FieldService from "../../../services/FieldService";
import * as TheSisService from "../../../services/TheSisService";
import * as SharingService from "../../../services/SharingService";
import * as Messages from "../../../components/Message/Message";

import DefaultLayout from "../../../components/DefaultLayout/DefaultLayout";
import EditThesisComponent from "../../../components/EditThesisComponent/EditThesisComponent";
import ActionsDropdownComponent from "../../../components/ActionsDropdownComponent/ActionsDropdownComponent";
import StatusTagComponent from "../../../components/StatusTagComponent/StatusTagComponent";
import StatusFilterComponent from "../../../components/StatusFilterComponent/StatusFilterComponent";
import EmptyState from "../../../components/EmptyState/EmptyState";
import PaginationComponent from "../../../components/PaginationComponent/PaginationComponent";
import BreadCrumbComponent from "../../../components/BreadcrumbComponent/BreadcrumbComponent";
import ShareThesisModal from "../../../components/ShareThesisModal/ShareThesisModal";
import ShareRequestDetailModal from "../../../components/ShareRequestDetailModal/ShareRequestDetailModal";

import {
    PageWrapper,
    ThesisList,
    ThesisCard,
    ThesisTitle,
    ThesisHeader,
    ThesisContent,
    CardLayout,
    Thumbnail,
    MetaRow,
    MetaItem,
    StatsRow,
    ButtonRow,
} from "./style";

const { Title, Text } = Typography;

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


// Hàm tiện ích đọc mảng từ URL, tách bằng ','
const getArrayFromUrl = (searchParams, key) => {
    const value = searchParams.get(key);
    return value ? value.split(",").filter(item => item) : [];
};

const MyThesisPage = () => {
    const navigate = useNavigate();
    const currentUserId = useSelector((state) => state.auth.user.id);
    const [searchParams, setSearchParams] = useSearchParams();

    const [editThesis, setEditThesis] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // --- STATE LỌC CŨ
    const [filterStatus, setFilterStatus] = useState(searchParams.get("status") || "");

    // --- STATE LỌC MỚI (Năm và Chủ đề)
    const [yearsFilter, setYearsFilter] = useState(getArrayFromUrl(searchParams, 'years'));
    const [fieldsFilter, setFieldsFilter] = useState(getArrayFromUrl(searchParams, 'fields'));

    // --- Phân trang
    const initialPage = Number(searchParams.get("page")) || 1;
    const initialPageSize = Number(searchParams.get("limit")) || 5;
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [pageSize, setPageSize] = useState(initialPageSize);

    // --- Modal/share state (CẬP NHẬT CHO RESUBMIT)
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [thesisToProcess, setThesisToProcess] = useState(null); // 🔥 LƯU TOÀN BỘ OBJECT THAY VÌ CHỈ ID
    const [isResubmitMode, setIsResubmitMode] = useState(false); // 🔥 STATE MỚI: Chế độ Gửi lại
    

    // --- Search term
    const initialSearchTerm = searchParams.get("search") || "";
    const [searchInput, setSearchInput] = useState(initialSearchTerm);
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm);

    // --- Date filters
    const initialStartDate = searchParams.get("from_date") || "";
    const initialEndDate = searchParams.get("to_date") || "";
    const [startDateFilter, setStartDateFilter] = useState(initialStartDate);
    const [endDateFilter, setEndDateFilter] = useState(initialEndDate);

    // --- Modal preview chi tiết Yêu cầu chia sẻ
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedKey, setSelectedKey] = useState(null);

    // --- ĐỒNG BỘ URL VÀ STATE SAU KHI MOUNT/URL THAY ĐỔI LẦN ĐẦU
    useEffect(() => {
        setFilterStatus(searchParams.get("status") || "");
        setYearsFilter(getArrayFromUrl(searchParams, 'years'));
        setFieldsFilter(getArrayFromUrl(searchParams, 'fields'));
    }, [searchParams]);

    // --- HANDLER CHUNG cho LỌC NĂM và Chủ đề ---
    const handleGeneralFilterChange = useCallback((key, newValues) => {
        if (key === 'years') setYearsFilter(newValues);
        if (key === 'fields') setFieldsFilter(newValues);

        const params = new URLSearchParams(window.location.search);

        if (newValues && newValues.length > 0) {
            params.set(key, newValues.join(","));
        } else {
            params.delete(key);
        }

        params.set("page", "1");
        setCurrentPage(1);
        setSearchParams(params, { replace: true });
    }, [setSearchParams]);

    // --- HANDLER cho LỌC TRẠNG THÁI ---
    const handleStatusFilterChange = useCallback((newStatus) => {
        setFilterStatus(newStatus);
        setCurrentPage(1);

        const params = new URLSearchParams(window.location.search);
        if (newStatus) {
            params.set("status", newStatus);
        } else {
            params.delete("status");
        }
        params.set("page", "1");
        setSearchParams(params, { replace: true });
    }, [setSearchParams]);


    // --- useEffect đồng bộ Page/Limit
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlPage = Number(params.get("page")) || 1;
        const urlLimit = Number(params.get("limit")) || 5;

        if (urlPage !== currentPage || urlLimit !== pageSize) {
            params.set("page", String(currentPage));
            params.set("limit", String(pageSize));
            setSearchParams(params, { replace: true });
        }
    }, [currentPage, pageSize, setSearchParams]);

    // --- Debounce cho searchInput
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
    // --- Query Khoa (Category)
    const { data: categoriesData } = useQuery({
        queryKey: ["categories"],
        queryFn: CategoryService.getCategories,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
    const categoriesResponse = categoriesData?.data || [];

    // --- Query Ngành (Majors)
    const { data: majorsData } = useQuery({
        queryKey: ["majors"],
        queryFn: MajorService.getAllMajors,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
    const majorsResponse = majorsData?.data || [];

    // --- Query Chủ đề (Fields)
    const { data: fieldsData } = useQuery({
        queryKey: ["fields"],
        queryFn: FieldService.getAllFields,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
    const fieldsResponse = fieldsData?.data || [];
    // Lấy các confirm
    const queryAllShareRequests = useQuery({
        queryKey: ["getAllShareRequests"],
        queryFn: SharingService.getAllShareRequest,
    });
    const { data: response, isLoading: isLoadingAllShareRequests } = queryAllShareRequests;
    const allShareRequestsList = response?.data || [];
    console.log("allShareRequestsList", allShareRequestsList);
    const findSharingRequest = (thesisId) => {
    // Giả sử bạn muốn xem yêu cầu chia sẻ gần nhất/cuối cùng cho luận văn này
    const requests = allShareRequestsList
        .filter(request => request.thesis?._id === thesisId)
        // Sắp xếp nếu cần, nhưng tạm thời lấy cái đầu tiên tìm thấy
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); 
    
    return requests.length > 0 ? requests[0] : null; // Trả về object yêu cầu chia sẻ
};


    // --- Main query (theses)
    const { data: thesisData, isLoading, isError, error, refetch } = useQuery({
    queryKey: [
        "myUploadedThesis",
        filterStatus,
        currentPage,
        pageSize,
        searchTerm,
        startDateFilter,
        endDateFilter,
        yearsFilter.join(','),
        fieldsFilter.join(','),
    ],
    queryFn: () =>
        TheSisService.getMyUploadedTheses({
            status: filterStatus,
            page: currentPage,
            limit: pageSize,
            search: searchTerm,
            from_date: startDateFilter,
            to_date: endDateFilter,
            years: yearsFilter.join(','),
            fields: fieldsFilter.join(','),
        }),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
});


    const displayThesis = thesisData?.theses || [];
    console.log("Thesis Data:", thesisData);
    const totalThesisCount = thesisData?.total || 0;

    // --- Mutations
    const deleteMutation = useMutation({
        mutationFn: TheSisService.softDeleteTheSis,
        onSuccess: () => {
            Messages.success("Đã xoá luận văn thành công");
            refetch();
        },
        onError: (error) => {
            Messages.error("Không thể xoá luận văn." + (error?.response?.data?.message || ""));
        },
    });
    // Mutation thu hồi yêu cầu chia sẻ
    const recallMutation = useMutation({
        mutationFn: (thesisId) => SharingService.recallShareRequest(thesisId),
        onSuccess: () => {
            Messages.success("Đã thu hồi yêu cầu chia sẻ thành công");
            refetch(); // Reload lại list để cập nhật UI
        },
        onError: (error) => {
            Messages.error("Lỗi khi thu hồi yêu cầu chia sẻ." + (error?.response?.data?.message || ""));
        },
    });
    // 🔥 MỚI: Mutation cập nhật nhanh AccessMode và Download
    const updateSettingsMutation = useMutation({
        mutationFn: ({ id, data }) => TheSisService.updateThesisAccess(id, data),
        onSuccess: () => {
            Messages.success("Cập nhật thiết lập thành công");
            refetch(); // Reload lại list để cập nhật UI
        },
        onError: (error) => {
            Messages.error("Lỗi khi cập nhật thiết lập." + (error?.response?.data?.message || ""));
        },
    });
    // Handle xóa
    const handleDeleteThesis = (thesisId) => {
        Modal.confirm({
            title: 'Xác nhận xoá luận văn',
            content: 'Bạn có chắc chắn muốn xoá luận văn này không? Hành động này có thể được hoàn tác từ thùng rác.',
            okText: 'Xoá luận văn',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: () => deleteMutation.mutate(thesisId)
        });
    };
    // Handle recall
    const handleRecall = (thesisId) => {
        Modal.confirm({
        title: 'Xác nhận thu hồi',
        content: 'Bạn có chắc chắn muốn rút lại yêu cầu này? Bài viết sẽ chuyển về trạng thái NHÁP để bạn có thể chỉnh sửa.',
        okText: 'Thu hồi ngay',
        okType: 'danger',
        cancelText: 'Hủy',
        onOk: () => recallMutation.mutate(thesisId)
    });

    };

    // 🔥 Handler thay đổi Access Mode
    const handleChangeAccessMode = (thesisId, value) => {
        updateSettingsMutation.mutate({ id: thesisId, data: { accessMode: value } });
    };

    // 🔥 Handler thay đổi isDownloadable
    const handleChangeDownload = (thesisId, checked) => {
        updateSettingsMutation.mutate({ id: thesisId, data: { allowDownload: checked } });
    };


    // 🔥 HANDLER ĐÓNG MODAL CHUNG
    const handleCloseModal = () => {
        setIsShareModalOpen(false);
        setThesisToProcess(null);
        setIsResubmitMode(false);
    };

    // 🔥 HANDLER MỞ MODAL YÊU CẦU (draft)
    const handleOpenShareModal = (thesis) => {
        setThesisToProcess(thesis);
        setIsResubmitMode(false);
        setIsShareModalOpen(true);
    };

    // 🔥 HANDLER MỞ MODAL GỬI LẠI (rejected_public)
    const handleOpenResubmitModal = (thesis) => {
        setThesisToProcess(thesis);
        setIsResubmitMode(true); // 🔥 Chế độ Gửi lại
        setIsShareModalOpen(true);
    };


    const handleEditThesis = (thesis) => {
        if (!thesis) return;
        setEditThesis(thesis);
        setIsEditModalOpen(true);
    };

    // --- HÀM RESET TẤT CẢ BỘ LỌC
    const handleResetFilters = () => {
        setFilterStatus("");
        setYearsFilter([]);
        setFieldsFilter([]);
        setStartDateFilter("");
        setEndDateFilter("");
        setCurrentPage(1);

        const params = new URLSearchParams(window.location.search);
        params.delete("status");
        params.delete("years");
        params.delete("fields");
        params.delete("from_date");
        params.delete("to_date");
        params.set("page", "1");
        setSearchParams(params, { replace: true });
    };
    const dataTable = allShareRequestsList?.map((item, index) => ({
        key: item?._id, // Này là id của trường confirm
        sharingId: item?._id, // Id của trường sharing
        thesisId: item?.thesis?._id,
        title: item?.thesis?.title,
        requester: item?.requester,
        createdAt: item?.createdAt,
        updatedAt: item?.updatedAt,
        authorName: item?.thesis?.authorName,
        coAuthorsNames: item?.thesis?.coAuthorsNames,
        supervisorName: item?.thesis?.supervisorName,
        fileUrl: item?.thesis?.fileUrl,
        status: item?.status,
    }));
    console.log("dataTable", dataTable);
    const renderAccessModeTag = (mode) => {
            switch (mode) {
                case 'public_full':
                    return <Tag color="cyan">🌎Toàn văn</Tag>;
                case 'abstract_only':
                    return <Tag color="green">📃Chỉ tóm tắt</Tag>;
                case 'department_only':
                    return <Tag color="geekblue">🎓Lưu hành nội bộ</Tag>;
                case 'private':
                    return <Tag color="default">🔒 Riêng tư</Tag>;
                default:
                    return <Tag>{mode}</Tag>;
            }
        };

    return (
        <DefaultLayout>
            <BreadCrumbComponent customNameMap={{ "my-thesis": "Quản lý luận văn" }} />
            <PageWrapper>
                {/* SỬ DỤNG GRID SYSTEM CỦA ANTD ĐỂ CHIA LAYOUT */}
                <Row gutter={[24, 24]}>
                    
                    {/* ================= CỘT SIDEBAR (BỘ LỌC) ================= */}
                    <Col xs={24} lg={6} xl={6}>
                        <div style={{ background: '#fff', borderRadius: 8, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                <Title level={5} style={{ margin: 0 }}><FilterOutlined /> Bộ lọc</Title>
                                <Button onClick={handleResetFilters} type="link" size="small" danger>
                                    Xóa tất cả
                                </Button>
                            </div>

                            <Collapse ghost defaultActiveKey={['year', 'field']} expandIconPosition="end">
                                {/* 1. LỌC NĂM */}
                                <Collapse.Panel header={<strong>Năm Xuất bản</strong>} key="year">
                                    <Select
                                        mode="multiple"
                                        allowClear
                                        style={{ width: '100%' }}
                                        placeholder="Chọn năm"
                                        value={yearsFilter}
                                        onChange={(value) => handleGeneralFilterChange("years", value)}
                                    >
                                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                            <Select.Option key={year} value={year.toString()}>{year}</Select.Option>
                                        ))}
                                    </Select>
                                </Collapse.Panel>

                                {/* 2. LỌC CHỦ ĐỀ */}
                                <Collapse.Panel header={<strong>Chủ đề</strong>} key="field">
                                    <Select
                                        mode="multiple"
                                        allowClear
                                        style={{ width: '100%' }}
                                        placeholder="Chọn chủ đề"
                                        value={fieldsFilter}
                                        onChange={(value) => handleGeneralFilterChange("fields", value)}
                                        loading={!fieldsResponse}
                                    >
                                        {fieldsResponse?.map((field) => (
                                            <Select.Option key={field._id} value={field._id}>{field.name}</Select.Option>
                                        ))}
                                    </Select>
                                </Collapse.Panel>
                            </Collapse>
                        </div>
                    </Col>

                    {/* ================= CỘT NỘI DUNG CHÍNH ================= */}
                    <Col xs={24} lg={18} xl={18}>
                        
                        {/* 1. TOOLBAR (TÌM KIẾM + NÚT ADD) */}
                        <div style={{ background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 20 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: 'wrap', gap: 10 }}>
                                <Input.Search
                                    placeholder="Tìm kiếm (tiêu đề, tác giả, GVHD...)"
                                    allowClear
                                    enterButton={<Button icon={<SearchOutlined />}>Tìm kiếm</Button>}
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    style={{ width: '100%', maxWidth: 450 }}
                                    size="large"
                                />
                                <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => navigate("/upload")}>
                                    Tải lên luận văn
                                </Button>
                            </div>
                        </div>

                        {/* 2. TAB TRẠNG THÁI */}
                        <div style={{ marginBottom: 20 }}>
                            <StatusFilterComponent selectedStatus={filterStatus} onChange={handleStatusFilterChange} />
                        </div>

                        {/* 3. DANH SÁCH LUẬN VĂN */}
                        {isLoading && (
                            <div style={{ background: '#fff', padding: 20, borderRadius: 8 }}><Skeleton active avatar paragraph={{ rows: 3 }} /></div>
                        )}

                        {!isLoading && isError && (
                            <Alert message="Lỗi tải dữ liệu" description={error?.message} type="error" showIcon />
                        )}

                        {!isLoading && !isError && displayThesis.length === 0 ? (
                            <div style={{ background: '#fff', padding: 40, borderRadius: 8, textAlign: 'center' }}>
                                <Empty description="Không tìm thấy luận văn nào phù hợp" />
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {displayThesis.map((thesis) => (
                                    <Card 
                                        key={thesis._id}
                                        hoverable
                                        styles ={{ body: { padding: 0 } }}
                                        style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #f0f0f0' }}
                                    >
                                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'stretch' }}>
                                            {/* --- THUMBNAIL (BÊN TRÁI) --- */}
                                            <div style={{ 
                                                width: 150, 
                                                minWidth: 150, 
                                                position: 'relative',
                                                background: '#f5f5f5',
                                                borderRight: '1px solid #f0f0f0'
                                            }}>
                                                <img 
                                                    src={`${import.meta.env.VITE_API_URL}${thesis.thumbnail}`} 
                                                    alt="Thumbnail" 
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                                />
                                            </div>

                                            {/* --- NỘI DUNG (BÊN PHẢI) --- */}
                                            <div style={{ flex: 1, padding: '16px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                                
                                                {/* HEADER: Title & Status */}
                                                <div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                                        <Space size={[0, 8]} wrap>
                                                            <StatusTagComponent status={thesis.status} />
                                                            {renderAccessModeTag(thesis.accessMode)}
                                                        </Space>
                                                    </div>

                                                    <h3 style={{ fontSize: 18, fontWeight: 700, margin: '8px 0', lineHeight: 1.4 }}>
                                                        <a 
                                                            onClick={() => navigate(`/thesis/${thesis._id}`)}
                                                            style={{ color: '#262626', transition: 'color 0.3s' }}
                                                            onMouseEnter={(e) => e.target.style.color = '#1890ff'}
                                                            onMouseLeave={(e) => e.target.style.color = '#262626'}
                                                        >
                                                            <HighlightText text={thesis.title} highlight={searchTerm} />
                                                        </a>
                                                    </h3>

                                                    {/* META INFO */}
                                                    <Space split={<Divider type="vertical" />} style={{ color: '#8c8c8c', fontSize: 13, flexWrap: 'wrap' }}>
                                                        <span><UserOutlined /> {thesis.authorName}</span>
                                                        <span><BookOutlined /> {thesis?.field?.name || "Chưa phân loại"}</span>
                                                        <span>
                                                            <strong>Vai trò:</strong> {thesis.owner?._id === thesis.author?._id ? "Tác giả" : "Người upload"}
                                                        </span>
                                                    </Space>
                                                </div>
                                                {/* 🔥 BẮT ĐẦU PHẦN THÊM MỚI: CẤU HÌNH QUYỀN (CHỈ HIỆN KHI APPROVED) */}
                                                {thesis.status === 'approved_public' && (
                                                    <div style={{ marginTop: 8, padding: '8px 12px', background: '#e6e9e8ff', borderRadius: 6, border: '1px solid #8c8c8c' }}>
                                                        <Space size={16} style={{ width: '100%', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                                                            <Space>
                                                                <SettingOutlined  />
                                                                <span style={{ fontSize: 13, fontWeight: 500 }}>Quyền truy cập:</span>
                                                                <Select
                                                                    size="small"
                                                                    value={thesis.accessMode}
                                                                    style={{ width: 160 }}
                                                                    onChange={(val) => handleChangeAccessMode(thesis._id, val)}
                                                                    options={[
                                                                        { value: 'public_full', label: 'Công khai toàn văn' },
                                                                        { value: 'abstract_only', label: 'Công khai tóm tắt' },
                                                                        // { value: 'department_only', label: 'Nội bộ Khoa' },
                                                                        // { value: 'private', label: 'Riêng tư' },
                                                                    ]}
                                                                />
                                                            </Space>
                                                            
                                                            <Space>
                                                                <span style={{ fontSize: 13 }}>Cho phép tải:</span>
                                                                <Switch 
                                                                    size="small"
                                                                    checkedChildren="Bật"
                                                                    unCheckedChildren="Tắt"
                                                                    checked={thesis.allowDownload} 
                                                                    onChange={(checked) => handleChangeDownload(thesis._id, checked)}
                                                                />
                                                            </Space>
                                                        </Space>
                                                    </div>
                                                )}
                                                {/* 🔥 KẾT THÚC PHẦN THÊM MỚI */}

                                                {/* FOOTER: Stats & Actions */}
                                                {/* --- 🔥 PHẦN FOOTER: CHỨA CÁC NÚT THAO TÁC (ĐÃ SỬA) --- */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 12, borderTop: '1px solid #f9f9f9' }}>
                                                
                                                {/* Thống kê */}
                                                <Space size={16} style={{ color: '#8c8c8c' }}>
                                                    <Tooltip title="Lượt xem"><Space><EyeOutlined /> {thesis.views || 0}</Space></Tooltip>
                                                    <Tooltip title="Lượt tải"><Space><DownloadOutlined /> {thesis.downloads || 0}</Space></Tooltip>
                                                </Space>

                                                {/* Nút hành động */}
                                                <Space>
                                                    {/* 1. Nút Xem chi tiết (Luôn hiện) */}
                                                    <Button size="small" onClick={() => navigate(`/thesis/${thesis._id}`)}>Chi tiết</Button>

                                                    {/* 2. Nút Chia sẻ */}
                                                    {["submitted_internal", 'draft'].includes(thesis.status) && (
                                                        <Button size="small" icon={<ShareAltOutlined />} onClick={() => handleOpenShareModal(thesis)}>
                                                            Chia sẻ
                                                        </Button>
                                                    )}

                                                    {/* 3. Nút Gửi lại (Chỉ hiện khi Bị từ chối) */}
                                                    {["rejected_public", "rejected"].includes(thesis.status) && (
                                                        <Button size="small" type="primary" danger ghost icon={<ShareAltOutlined />} onClick={() => handleOpenResubmitModal(thesis)}>
                                                            Gửi lại
                                                        </Button>
                                                    )}

                                                    {/* 4. Nút Xem tiến độ (Hiện khi Đã gửi yêu cầu) */}
                                                    {["approved_public", "rejected_public", "pending_public", "submitted_internal"].includes(thesis.status) && (
                                                        <Button size="small" onClick={() => {
                                                            const request = findSharingRequest(thesis._id); // Hàm tìm request ID của bạn
                                                            if (request) {
                                                                setSelectedKey(request._id);
                                                                setModalVisible(true);
                                                            }
                                                        }}>
                                                            Tiến độ
                                                        </Button>
                                                    )}

                                                    {/* 🔥 5. NÚT THU HỒI (MỚI) 
                                                        Logic: Chỉ hiện khi đang CHỜ DUYỆT
                                                    */}
                                                    {["pending_public"].includes(thesis.status) && (
                                                        <Tooltip title="Rút lại yêu cầu để chỉnh sửa">
                                                            <Button 
                                                                size="small" 
                                                                danger 
                                                                icon={<UndoOutlined />} 
                                                                loading={recallMutation.isPending}
                                                                onClick={() => handleRecall(thesis._id)}
                                                            >
                                                                Thu hồi
                                                            </Button>
                                                        </Tooltip>
                                                    )}

                                                    {/* 🔥 6. EDIT/DELETE DROPDOWN (ĐÃ CẬP NHẬT LOGIC)
                                                        Logic cũ: Hiện cả khi pending_public -> SAI.
                                                        Logic mới: Chỉ hiện khi là NHÁP hoặc BỊ TỪ CHỐI. 
                                                        (Nếu đang chờ duyệt thì phải Thu hồi trước mới được Sửa/Xóa)
                                                    */}
                                                    {["draft", "rejected_public", "rejected"].includes(thesis.status) && (
                                                        <ActionsDropdownComponent
                                                            items={[
                                                                { label: "Chỉnh sửa", icon: <EditOutlined />, onClick: () => handleEditThesis(thesis) },
                                                                { label: "Xoá", icon: <DeleteOutlined />, danger: true, onClick: () => handleDeleteThesis(thesis._id) },
                                                            ]}
                                                        />
                                                    )}
                                                </Space>
                                            </div>
                                            {/* --- HẾT PHẦN FOOTER --- */}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {/* 4. PHÂN TRANG */}
                        {totalThesisCount > 0 && (
                            <div style={{ marginTop: 24, textAlign: 'center' }}>
                                <PaginationComponent
                                    current={currentPage}
                                    pageSize={pageSize}
                                    total={totalThesisCount}
                                    onChange={(page, size) => {
                                        setCurrentPage(page);
                                        setPageSize(size);
                                    }}
                                />
                            </div>
                        )}
                    </Col>
                </Row>

                {/* ================= CÁC MODAL (GIỮ NGUYÊN) ================= */}
                {isEditModalOpen && editThesis && (
                    <EditThesisComponent
                        open={isEditModalOpen}
                        onClose={() => { setIsEditModalOpen(false); setEditThesis(null); }}
                        thesis={editThesis}
                        onSuccess={() => { refetch(); setIsEditModalOpen(false); setEditThesis(null); }}
                        categories={categoriesResponse}
                        majors={majorsResponse}
                        fields={fieldsResponse}
                    />
                )}

                {isShareModalOpen && (
                    <ShareThesisModal
                        isOpen={isShareModalOpen}
                        onClose={handleCloseModal}
                        thesisToProcess={thesisToProcess}
                        isResubmitMode={isResubmitMode}
                        onSuccess={refetch}
                    />
                )}
                
                <ShareRequestDetailModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    dataTable={dataTable}
                    selectedKey={selectedKey}
                />
            </PageWrapper>
        </DefaultLayout>
    );
};

export default MyThesisPage;