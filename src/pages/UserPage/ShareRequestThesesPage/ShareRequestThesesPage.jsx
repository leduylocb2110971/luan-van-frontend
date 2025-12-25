import React, { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";

// ANT DESIGN IMPORTS
import { 
    Space, Table, Input, Button, Modal, Tooltip, Form, Select, Alert, Tag, Popconfirm, Card, Typography, Row, Col 
} from "antd";
import {
    SearchOutlined, CloseCircleOutlined, CheckCircleOutlined, 
    EyeOutlined, ReloadOutlined, GlobalOutlined, ExclamationCircleOutlined, ClockCircleOutlined
} from "@ant-design/icons";

// COMPONENTS & SERVICES
import LoadingComponent from "../../../components/LoadingComponent/LoadingComponent";
import ShareRequestDetailModal from "../../../components/ShareRequestDetailModal/ShareRequestDetailModal";
import ActionsDropdownComponent from "../../../components/ActionsDropdownComponent/ActionsDropdownComponent";
import BreadcrumbComponent from "../../../components/BreadcrumbComponent/BreadcrumbComponent";
import DefaultLayout from "../../../components/DefaultLayout/DefaultLayout";
import * as Message from "../../../components/Message/Message";
import * as SharingService from "../../../services/SharingService";

const { Text, Title } = Typography;

// Định nghĩa các lý do phổ biến
const commonReasons = [
    { value: "Nội dung không phù hợp để công khai", label: "Nội dung không phù hợp để công khai" },
    { value: "Vấn đề đạo văn/tương đồng cao", label: "Vấn đề đạo văn/tương đồng cao" },
    { value: "Thiếu tóm tắt học thuật", label: "Thiếu tóm tắt học thuật" },
    { value: "Chất lượng file đính kèm kém", label: "Chất lượng file đính kèm kém (mờ, thiếu trang)" },
];

const ShareRequestThesesPage = () => {
    const [form] = Form.useForm();
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [rejectingId, setRejectingId] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedKey, setSelectedKey] = useState(null);

    // Quản lí phân trang & tìm kiếm
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const [searchText, setSearchText] = useState("");
    const [searchColumn, setSearchColumn] = useState("");
    const searchInput = useRef(null);

    // --- FETCH DATA ---
    const queryGetPendingConfirmations = useQuery({
        queryKey: ["getPendingConfirmations"],
        queryFn: SharingService.getPendingConfirmations,
    });
    const { data: response, isLoading: isLoadingPendingConfirmations } = queryGetPendingConfirmations;
    const pendingConfirmationsList = response?.data || [];

    // --- MUTATIONS ---
    const mutationApprove = useMutation({
        mutationFn: (id) => SharingService.confirmShareThesis(id),
        onSuccess: (data) => {
            Message.success(data?.message || "Đã phê duyệt yêu cầu.");
            queryGetPendingConfirmations.refetch();
        },
        onError: () => Message.error("Lỗi phê duyệt yêu cầu."),
    });
    
    const mutationReject = useMutation({
        mutationFn: ({ id, reason }) => SharingService.rejectShareThesis(id, reason),
        onSuccess: (data) => {
            Message.success(data?.message || "Đã từ chối yêu cầu.");
            queryGetPendingConfirmations.refetch();
            setRejectModalVisible(false);
            form.resetFields();
        },
        onError: () => Message.error("Lỗi từ chối yêu cầu."),
    });

    const handleRejectClick = (id) => {
        setRejectingId(id);
        setRejectModalVisible(true);
        form.resetFields();
    };

    const handleConfirmReject = () => {
        form.validateFields().then(values => {
            const reasonToSend = values?.customReason?.trim() || values.selectedReason;
            if (!reasonToSend) return Message.warning("Vui lòng cung cấp lý do từ chối!");
            mutationReject.mutate({ id: rejectingId, reason: reasonToSend });
        }).catch(info => console.log('Validate Failed:', info));
    };

    // --- TABLE COLUMNS CONFIG ---
    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
                <Input
                    ref={searchInput}
                    placeholder={`Tìm ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => { confirm(); setSearchText(selectedKeys[0]); setSearchColumn(dataIndex); }}
                    style={{ marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => { confirm(); setSearchText(selectedKeys[0]); setSearchColumn(dataIndex); }}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Tìm
                    </Button>
                    <Button
                        onClick={() => { clearFilters(); setSearchText(""); setSearchColumn(""); confirm(); }}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Xóa
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />,
        onFilter: (value, record) => record[dataIndex] ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()) : '',
        render: (text) => searchColumn === dataIndex ? <span style={{ color: '#1677ff', fontWeight: 'bold' }}>{text}</span> : text,
    });

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
            width: 250,
            ...getColumnSearchProps("title"),
            render: (text) => (
                <Tooltip title={text}>
                    <Text strong style={{ color: '#262626' }}>
                        {text?.length > 40 ? text.slice(0, 40) + "..." : text}
                    </Text>
                </Tooltip>
            ),
        },
        {
            title: "Người gửi",
            dataIndex: "requester",
            key: "requester",
            width: 150,
            render: (req) => (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Text strong>{req?.name || "N/A"}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{req?.email}</Text>
                </div>
            ),
        },
        {
            title: "Thời gian",
            dataIndex: "createdAt", // Dùng createdAt hoặc updatedAt tùy logic
            key: "createdAt",
            width: 140,
            render: (text) => text ? new Date(text).toLocaleDateString("vi-VN") : "-",
        },
        {
            title: "Chế độ",
            dataIndex: "sharingMode",
            key: "sharingMode",
            width: 140,
            render: (_,record) => {
                let color = 'default';
                let label = record.sharingMode;
                console.log('record.sharingMode', record.sharingMode);
                if (record.sharingMode === 'public') { color = 'cyan'; label = 'Công khai'; }
                else if (record.sharingMode === 'abstract_only') { color = 'green'; label = 'Tóm tắt'; }
                else if (record.sharingMode === 'internal') { color = 'processing'; label = 'Nội bộ'; }

                return (
                    <Space direction="vertical" size={2}>
                        <Tag icon={<GlobalOutlined />} color={color}>{label}</Tag>
                        
                    </Space>
                );
            },
        },
        {
            title: "Thao tác",
            key: "actions",
            width: 80,
            fixed: 'right',
            align: 'center',
            render: (_, record) => {
                const items = [
                    {
                        label: <><EyeOutlined /> Xem chi tiết</>,
                        key: 'view',
                        onClick: () => { setSelectedKey(record.key); setModalVisible(true); },
                    },
                    { type: 'divider' },
                    {
                        label: <span style={{ color: 'green' }}><CheckCircleOutlined /> Phê duyệt</span>,
                        key: 'approve',
                        onClick: () => mutationApprove.mutate(record.sharingId),
                    },
                    {
                        label: <span style={{ color: '#ff4d4f' }}><CloseCircleOutlined /> Từ chối</span>,
                        key: 'reject',
                        onClick: () => handleRejectClick(record.sharingId),
                    },
                ];
                return <ActionsDropdownComponent items={items} />;
            },
        }
    ];

    // Map data for table
    const dataTable = pendingConfirmationsList?.map((item) => ({
        key: item?._id,
        sharingId: item?.sharing?._id,
        thesisId: item?.sharing?.thesis?._id,
        title: item?.sharing?.thesis?.title,
        
        requester: item?.sharing?.requester,
        createdAt: item?.createdAt,
        // ... (các trường khác giữ nguyên để truyền vào modal)
        ...item?.sharing?.thesis, // Spread để lấy authorName, supervisorName...
        sharingMode: item?.sharing.sharingMode,
        status: item?.sharing?.status,
    }));
    console.log('dataTable', dataTable);

    return (
        <DefaultLayout>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>
                <BreadcrumbComponent customNameMap={{ "share-requests": "Yêu cầu Chia sẻ" }} />
                
                <Card 
                    style={{ borderRadius: 12, marginTop: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
                    styles={{ body: { padding: '0 24px 24px 24px' } }}
                >
                    {/* TOOLBAR */}
                    <div style={{ 
                        display: "flex", justifyContent: "space-between", alignItems: "center", 
                        padding: "20px 0", borderBottom: "1px solid #f0f0f0", marginBottom: 20 
                    }}>
                        <Space>
                            <Title level={4} style={{ margin: 0 }}>📋 Duyệt Yêu cầu Chia sẻ</Title>
                            <Tag color="blue">{pendingConfirmationsList.length} yêu cầu</Tag>
                        </Space>
                        <Space>
                            <Input placeholder="Tìm nhanh..." prefix={<SearchOutlined />} style={{ width: 200 }} />
                            <Button icon={<ReloadOutlined />} onClick={() => queryGetPendingConfirmations.refetch()}>Làm mới</Button>
                        </Space>
                    </div>

                    {/* TABLE */}
                    <LoadingComponent isLoading={isLoadingPendingConfirmations}>
                        <Table
                            columns={columns}
                            dataSource={dataTable}
                            rowKey="key"
                            pagination={{
                                ...pagination,
                                showTotal: (total) => `Tổng ${total} yêu cầu`,
                                showSizeChanger: true,
                                onChange: (page, pageSize) => setPagination({ current: page, pageSize })
                            }}
                            scroll={{ x: 800 }}
                        />
                    </LoadingComponent>
                </Card>

                {/* MODALS */}
                <ShareRequestDetailModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    dataTable={dataTable}
                    selectedKey={selectedKey}
                />

                <Modal
                    title={<span style={{ color: '#ff4d4f' }}><ExclamationCircleOutlined /> Từ chối Yêu cầu</span>}
                    open={rejectModalVisible}
                    onCancel={() => { setRejectModalVisible(false); form.resetFields(); }}
                    footer={[
                        <Button key="back" onClick={() => setRejectModalVisible(false)}>Hủy</Button>,
                        <Button key="submit" type="primary" danger onClick={handleConfirmReject} loading={mutationReject.isPending}>
                            Xác nhận Từ chối
                        </Button>,
                    ]}
                >
                    <Alert 
                        message="Lưu ý" 
                        description="Lý do từ chối sẽ được gửi thông báo đến người yêu cầu." 
                        type="warning" showIcon style={{ marginBottom: 16 }} 
                    />
                    <Form form={form} layout="vertical">
                        <Form.Item name="selectedReason" label="Lý do phổ biến">
                            <Select options={commonReasons} placeholder="Chọn lý do..." allowClear />
                        </Form.Item>
                        <Form.Item 
                            name="customReason" 
                            label="Hoặc nhập lý do chi tiết"
                            rules={[
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value && !getFieldValue('selectedReason')) {
                                            return Promise.reject(new Error('Vui lòng nhập lý do!'));
                                        }
                                        return Promise.resolve();
                                    },
                                }),
                            ]}
                        >
                            <Input.TextArea rows={4} placeholder="Nhập chi tiết..." />
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
            <div style={{ height: 40 }} />
        </DefaultLayout>
    );
};

export default ShareRequestThesesPage;