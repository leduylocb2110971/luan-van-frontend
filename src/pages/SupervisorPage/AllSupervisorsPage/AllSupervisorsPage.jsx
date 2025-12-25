import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";

// ANT DESIGN IMPORTS
import { 
    Table, Input, Button, Tag, Tooltip, Empty, Spin, Divider, 
    Avatar, Typography, Card, Space, Badge 
} from "antd";
import {
    SearchOutlined, EyeOutlined, CloseOutlined, 
    UserOutlined, BookOutlined, MailOutlined, BankOutlined,
    ReloadOutlined
} from "@ant-design/icons";

// COMPONENTS & SERVICES
import BreadcrumbComponent from "../../../components/BreadcrumbComponent/BreadcrumbComponent";
import * as SupervisorService from "../../../services/SupervisorService";

const { Text, Title, Paragraph } = Typography;

const AllSupervisorsPage = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    
    // --- STATE ---
    const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page")) || 1);
    const [pageSize, setPageSize] = useState(parseInt(searchParams.get("limit")) || 10);
    const [expandedRowKeys, setExpandedRowKeys] = useState([]);
    const [innerPagination, setInnerPagination] = useState({}); 

    // --- FETCH DATA ---
    const fetchSupervisors = async ({ queryKey }) => {
        const [_, search, page, limit] = queryKey;
        const res = await SupervisorService.getSupervisorsList({ search, page, limit });
        return res; 
    };

    const { 
        data: supervisorsResult = { data: [], totalItems: 0, page: 1, limit: 10 }, 
        isLoading, 
        isError, 
        error,
        refetch
    } = useQuery({
        queryKey: ["supervisorsList", searchInput, currentPage, pageSize],
        queryFn: fetchSupervisors,
        staleTime: 60000,
        placeholderData: (previousData) => previousData,
        keepPreviousData: true,
    });
    
    const supervisorsData = supervisorsResult.data; 
    const totalItems = supervisorsResult.totalItems; 

    // --- HANDLE EXPAND ---
    const handleExpand = (expanded, record) => {
        const key = record.key;
        if (expanded) {
            setExpandedRowKeys([key]);
            setInnerPagination(prev => ({ ...prev, [key]: { page: 1, limit: 5 } }));
        } else {
            setExpandedRowKeys([]);
        }
    };

    const handleTableChange = (pagination) => {
        const newPage = pagination.current;
        const newLimit = pagination.pageSize;
        setCurrentPage(newPage);
        setPageSize(newLimit);
        const params = { page: newPage, limit: newLimit };
        if (searchInput) params.search = searchInput;
        setSearchParams(params);
    };

    // --- INNER TABLE RENDER ---
    const expandedRowRender = (record) => {
        const supervisorId = record.key;
        const allTheses = record.supervisedTheses || []; 
        const total = allTheses.length;
        const { page: currentPageInner, limit: pageSizeInner } = innerPagination[supervisorId] || { page: 1, limit: 5 };
        
        const startIndex = (currentPageInner - 1) * pageSizeInner;
        const endIndex = startIndex + pageSizeInner;
        const displayedTheses = allTheses.slice(startIndex, endIndex);

        const handleInnerTableChange = (pagination) => {
            setInnerPagination(prev => ({ 
                ...prev, 
                [supervisorId]: { page: pagination.current, limit: pagination.pageSize } 
            }));
        };
        
        if (total === 0) return <Empty description="Chưa có đề tài nào." style={{ padding: 20 }}/>;

        const innerColumns = [
            { 
                title: 'Tên đề tài', 
                dataIndex: 'title', 
                key: 'title', 
                render: (text) => (
                    <Tooltip title={text}>
                        <Text strong style={{ color: '#1890ff', cursor: 'pointer' }} onClick={() => navigate(`/thesis/${record._id}`)}>
                            {text.length > 80 ? text.slice(0, 80) + '...' : text}
                        </Text>
                    </Tooltip>
                ),
            },
            {
                title: 'Sinh viên', 
                dataIndex: 'author', 
                key: 'authorName', 
                width: 200,
                render: (_, r) => {
                    const coAuthors = r.coAuthorsNames;
                    const author = r.authorName;
                    if (Array.isArray(coAuthors) && coAuthors.length > 0) {
                        return <Tooltip title={coAuthors.join(', ')}>{coAuthors.slice(0, 2).join(', ') + (coAuthors.length > 2 ? '...' : '')}</Tooltip>;
                    }
                    return author || 'N/A';
                },
            },
            { title: 'Năm', dataIndex: 'year', key: 'year', width: 80, align: 'center', render: (y) => <Tag>{y}</Tag> },
            //accessMode
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
                title: 'Chi tiết', 
                key: 'action', 
                width: 100, 
                align: 'center',
                render: (_, r) => <Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/thesis/${r._id}`)} />
            },
        ];

        return (
            <Card 
                size="small" 
                title={<span style={{fontSize: 14, color: '#1890ff'}}><BookOutlined /> Danh sách đề tài hướng dẫn ({total})</span>}
                style={{ margin: '10px 0', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                styles={{
                body:{ padding:0}
            }}
            >
                <Table
                    columns={innerColumns}
                    dataSource={displayedTheses.map((t) => ({...t, key: t._id || t.code}))}
                    size="small"
                    pagination={{
                        current: currentPageInner,
                        pageSize: pageSizeInner,
                        total: total,
                        showSizeChanger: true,
                        pageSizeOptions: ['5', '10', '20'],
                        size: "small"
                    }}
                    onChange={handleInnerTableChange}
                />
            </Card>
        );
    };

    // --- MAIN COLUMNS ---
    const columns = useMemo(() => [
        {
            title: "Giảng viên",
            dataIndex: "name",
            key: "name",
            width: 300,
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (text, record) => (
                <Space align="start">
                    <Avatar 
                        src={record.avatar ? `${import.meta.env.VITE_API_URL}${record.avatar}` : null} 
                        icon={<UserOutlined />} 
                        size={48} 
                        style={{ backgroundColor: '#1890ff', marginTop: 4 }}
                    />
                    <div>
                        <Text strong style={{ fontSize: 16 }}>{text}</Text>
                        <div style={{ fontSize: 13, color: '#8c8c8c' }}>
                            <MailOutlined /> {record.email}
                        </div>
                    </div>
                </Space>
            ),
        },
        {
            title: "Đơn vị công tác",
            dataIndex: "department",
            key: "department",
            width: 250,
            render: (dept) => (
                <Space>
                    <BankOutlined style={{ color: '#595959' }} />
                    <Text>{dept?.name || "Chưa cập nhật"}</Text>
                </Space>
            ),
        },
        {
            title: "Số lượng HD",
            dataIndex: "supervisedThesisCount",
            key: "supervisedThesisCount",
            width: 120,
            align: 'center',
            sorter: (a, b) => a.supervisedThesisCount - b.supervisedThesisCount,
            render: (count) => (
                <Badge count={count} showZero overflowCount={999} style={{ backgroundColor: count > 0 ? '#52c41a' : '#d9d9d9' }} />
            ),
        },
        // Nút mở rộng nằm ở cột cuối (Antd tự xử lý, hoặc mình tự thêm cột Action nếu cần)
    ], [supervisorsResult.page, supervisorsResult.limit]);

    const dataTable = useMemo(() => {
        return supervisorsData.map((item) => ({ ...item, key: item._id }));
    }, [supervisorsData]);

    return (
        <div style={{ margin: "0 auto", padding: "0 16px" }}>
            <BreadcrumbComponent customNameMap={{ "all-supervisors": "Danh sách Giảng viên" }} />

            <Card 
                style={{ borderRadius: 12, marginTop: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
                styles={{
                body:{ padding: 24}
            }}
            >
                {/* TOOLBAR */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <Title level={4} style={{ margin: 0 }}>👨‍🏫 Danh Sách Giảng Viên</Title>
                        <Text type="secondary">Tìm kiếm giảng viên và xem các đề tài họ đang hướng dẫn.</Text>
                    </div>
                    
                    <Space size="middle">
                        <Input.Search
                            placeholder="Tìm tên hoặc email..."
                            enterButton={<SearchOutlined />}
                            size="large"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onSearch={() => {
                                setCurrentPage(1); 
                                setSearchParams({ search: searchInput, page: 1, limit: pageSize });
                            }} 
                            style={{ width: 300 }}
                            allowClear
                        />
                        <Button icon={<ReloadOutlined />} onClick={() => { setSearchInput(""); refetch(); }}>
                            Làm mới
                        </Button>
                    </Space>
                </div>

                {/* TABLE */}
                <Spin spinning={isLoading} tip="Đang tải dữ liệu...">
                    {isError ? (
                        <Empty description={<span style={{ color: 'red' }}>Lỗi tải dữ liệu: {error.message}</span>} />
                    ) : (
                        <Table
                            columns={columns}
                            dataSource={dataTable}
                            // Cấu hình Expandable
                            expandable={{
                                expandedRowRender,
                                expandedRowKeys,
                                onExpand: handleExpand,
                                rowExpandable: (record) => record.supervisedThesisCount > 0,
                                expandRowByClick: true, // Click vào dòng để mở rộng luôn cho tiện
                            }}
                            pagination={{
                                current: currentPage,
                                pageSize: pageSize,
                                total: totalItems,
                                showSizeChanger: true,
                                pageSizeOptions: ['5', '10', '20', '50'],
                                showTotal: (total) => `Tổng ${total} giảng viên`
                            }}
                            onChange={handleTableChange}
                            scroll={{ x: 800 }}
                        />
                    )}
                </Spin>
            </Card>
            
            <div style={{ height: 40 }} />
        </div>
    );
};

export default AllSupervisorsPage;