import React, { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
    Table, Input, Button, Tag, Space, Card, Typography, Tooltip, Row, Col, Badge 
} from "antd";
import {
    SearchOutlined,
    EyeOutlined,
    ReloadOutlined,
    UserOutlined,
    FileTextOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    SyncOutlined
} from "@ant-design/icons";

// COMPONENTS & SERVICES
import LoadingComponent from "../../components/LoadingComponent/LoadingComponent";
import ShareRequestDetailModal from "../../components/ShareRequestDetailModal/ShareRequestDetailModal";
import * as Message from "../../components/Message/Message";
import * as SharingService from "../../services/SharingService";

const { Title, Text } = Typography;

const ShareRequestHistoryPage = () => {
    // --- STATE & LOGIC GIỮ NGUYÊN ---
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedKey, setSelectedKey] = useState(null);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const [searchText, setSearchText] = useState("");
    
    // Fetch Data
    const queryAllShareRequests = useQuery({
        queryKey: ["getAllShareRequests"],
        queryFn: SharingService.getAllShareRequest,
    });
    const { data: response, isLoading: isLoadingAllShareRequests, refetch } = queryAllShareRequests;
    const allShareRequestsList = response?.data || [];

    // Filter Logic (Client-side Search)
    const filteredData = allShareRequestsList.filter(item => {
        if (!searchText) return true;
        const lowerText = searchText.toLowerCase();
        return (
            item.thesis?.title?.toLowerCase().includes(lowerText) ||
            item.requester?.name?.toLowerCase().includes(lowerText) ||
            item.requester?.email?.toLowerCase().includes(lowerText)
        );
    });

    // Pagination Handler
    const handleTableChange = (page, pageSize) => {
        setPagination({ current: page, pageSize });
    };

    // --- CẤU HÌNH CỘT (ADMIN STYLE) ---
    const columns = [
        {
            title: "STT",
            key: "index",
            width: 60,
            align: 'center',
            render: (_, __, index) => index + 1 + (pagination.current - 1) * pagination.pageSize,
        },
        {
            title: "Tên luận văn",
            dataIndex: "title",
            key: "title",
            width: 350,
            render: (text) => (
                <Space align="start">
                    <Tooltip title={text}>
                        <Text strong style={{ color: '#262626', fontSize: 14 }}>
                            {text?.length > 60 ? `${text.slice(0, 60)}...` : text || "Chưa cập nhật"}
                        </Text>
                    </Tooltip>
                </Space>
            ),
        },
        {
            title: "Người gửi yêu cầu",
            dataIndex: "requester",
            key: "requester",
            width: 250,
            render: (req) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ 
                        width: 32, height: 32, borderRadius: '50%', 
                        background: '#f0f5ff', color: '#1890ff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center' 
                    }}>
                        <UserOutlined />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Text strong>{req?.name || "Người dùng ẩn"}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>{req?.email || "No Email"}</Text>
                    </div>
                </div>
            ),
        },
        {
            title: "Thời gian gửi",
            dataIndex: "createdAt",
            key: "createdAt",
            width: 160,
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
            render: (text) => (
                <span style={{ color: '#595959' }}>
                    <ClockCircleOutlined style={{ marginRight: 6 }} />
                    {text ? new Date(text).toLocaleString("vi-VN", {
                        day: "2-digit", month: "2-digit", year: "numeric", 
                        hour: "2-digit", minute: "2-digit"
                    }) : "N/A"}
                </span>
            ),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 140,
            filters: [
                { text: 'Đã duyệt', value: 'approved' },
                { text: 'Từ chối', value: 'rejected' },
                { text: 'Chờ duyệt', value: 'pending' },
            ],
            onFilter: (value, record) => record.status === value,
            render: (status) => {
                const map = {
                    approved: { color: "success", text: "Đã phê duyệt", icon: <CheckCircleOutlined /> },
                    rejected: { color: "error", text: "Đã từ chối", icon: <CloseCircleOutlined /> },
                    pending: { color: "warning", text: "Đang chờ xử lý", icon: <SyncOutlined spin /> },
                };
                const info = map[status] || { color: "default", text: status, icon: null };
                return <Tag icon={info.icon} color={info.color}>{info.text}</Tag>;
            }
        },
        {
            title: "Ngày xử lý",
            dataIndex: "updatedAt",
            key: "updatedAt",
            width: 140,
            render: (text, record) => {
                if (record.status === "pending") return <Text type="secondary" italic>--</Text>;
                return text ? new Date(text).toLocaleDateString("vi-VN") : "--";
            }
        },
        {
            title: "Thao tác",
            key: "action",
            width: 100,
            align: 'center',
            fixed: 'right',
            render: (_, record) => (
                <Button
                    size="small"
                    type="default"
                    onClick={() => {
                        setSelectedKey(record.key);
                        setModalVisible(true);
                    }}
                    icon={<EyeOutlined />}
                >
                    Chi tiết
                </Button>
            )
        },
    ];

    // Map Data
    const dataTable = filteredData.map((item) => ({
        key: item?._id,
        sharingId: item?._id,
        title: item?.thesis?.title,
        requester: item?.requester,
        createdAt: item?.createdAt,
        updatedAt: item?.updatedAt,
        status: item?.status,
        // Dữ liệu cho modal detail
        ...item, 
        authorName: item?.thesis?.authorName,
        coAuthorsNames: item?.thesis?.coAuthorsNames,
        supervisorName: item?.thesis?.supervisorName,
        fileUrl: item?.thesis?.fileUrl,
        thesisId: item?.thesis?._id
    }));

    return (
        <div>
            {/* --- TABLE CONTAINER --- */}
            <Card style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                {/* TOOLBAR */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
                    <Space size="middle">
                        <Input.Search 
                            placeholder="Tìm tên luận văn, người gửi..." 
                            allowClear 
                            onChange={(e) => setSearchText(e.target.value)}
                            onSearch={() => setPagination({ ...pagination, current: 1 })}
                            style={{ width: 300 }}
                            enterButton={<SearchOutlined />}
                        />
                        <Button icon={<ReloadOutlined />} onClick={() => refetch()}>Làm mới</Button>
                    </Space>
                    
                    <Badge count={dataTable.length} overflowCount={999} showZero color="#1890ff">
                        <Tag style={{ fontSize: 14, padding: '4px 10px', margin: 0 }}>
                            Tổng số yêu cầu
                        </Tag>
                    </Badge>
                </div>

                {/* TABLE */}
                <LoadingComponent isLoading={isLoadingAllShareRequests}>
                    <Table
                        columns={columns}
                        dataSource={dataTable}
                        pagination={{
                            ...pagination,
                            total: filteredData.length,
                            showTotal: (total) => `Tổng ${total} bản ghi`,
                            showSizeChanger: true,
                            onChange: handleTableChange
                        }}
                        scroll={{ x: 1200 }}
                        size="middle"
                        rowKey="key"
                    />
                </LoadingComponent>
            </Card>

            {/* --- MODAL DETAIL --- */}
            <ShareRequestDetailModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                dataTable={dataTable}
                selectedKey={selectedKey}
            />
        </div>
    );
};

export default ShareRequestHistoryPage;