import React, { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";

// ANT DESIGN
import { 
    Space, Table, Input, Button, Modal, Tooltip, Form, Select, Alert, Tag, Popconfirm, Card, Typography, Row, Col, Badge 
} from "antd";
import {
    SearchOutlined, CloseCircleOutlined, CheckCircleOutlined, 
    EyeOutlined, ReloadOutlined, ExclamationCircleOutlined,
    FileTextOutlined, UserOutlined, ClockCircleOutlined,
    GlobalOutlined
} from "@ant-design/icons";

// COMPONENTS & SERVICES
import LoadingComponent from "../../../components/LoadingComponent/LoadingComponent";
import ShareRequestDetailModal from "../../../components/ShareRequestDetailModal/ShareRequestDetailModal";
import ActionsDropdownComponent from "../../../components/ActionsDropdownComponent/ActionsDropdownComponent";
import DuplicateCheckButtonComponent from "../../../components/DuplicateCheckButtonComponent/DuplicateCheckButtonComponent";
import BreadcrumbComponent from "../../../components/BreadcrumbComponent/BreadcrumbComponent";
import * as Message from "../../../components/Message/Message";
import * as SharingService from "../../../services/SharingService";

const { Text, Title } = Typography;

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

    // State quản lý
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const [searchText, setSearchText] = useState(""); 

    // --- FETCH DATA ---
    const queryGetPendingConfirmations = useQuery({
        queryKey: ["getPendingConfirmations"],
        queryFn: SharingService.getPendingConfirmations,
    });
    const { data: response, isLoading: isLoadingPendingConfirmations } = queryGetPendingConfirmations;
    const pendingConfirmationsList = response?.data || [];
    console.log("Pending Confirmations:", pendingConfirmationsList);

    // --- FILTER DATA ---
    // Lọc dữ liệu client-side đơn giản cho demo (hoặc bạn có thể gọi API search)
    const filteredData = pendingConfirmationsList.filter(item => {
        if (!searchText) return true;
        const lowerSearch = searchText.toLowerCase();
        return (
            item.sharing?.thesis?.title?.toLowerCase().includes(lowerSearch) ||
            item.sharing?.requester?.name?.toLowerCase().includes(lowerSearch) ||
            item.sharing?.requester?.email?.toLowerCase().includes(lowerSearch)
        );
    });

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
        }).catch(() => {});
    };

    // --- COLUMNS ---
    const columns = [
        {
            title: "STT",
            key: "index",
            width: 60,
            align: 'center',
            render: (_, __, index) => index + 1 + (pagination.current - 1) * pagination.pageSize,
        },
        {
            title: "Luận văn yêu cầu",
            dataIndex: "title",
            key: "title",
            width: 300,
            render: (text) => (
                <Space align="start">
                    <FileTextOutlined style={{ marginTop: 4, color: '#1890ff' }} />
                    <Tooltip title={text}>
                        <Text strong style={{ color: '#262626', fontSize: 15 }}>
                            {text?.length > 60 ? text.slice(0, 60) + "..." : text}
                        </Text>
                    </Tooltip>
                </Space>
            ),
        },
        {
            title: "Người gửi",
            dataIndex: "requester",
            key: "requester",
            width: 200,
            render: (req) => (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Text strong><UserOutlined /> {req?.name || "N/A"}</Text>
                    <Text type="secondary" style={{ fontSize: 12, marginLeft: 18 }}>{req?.email}</Text>
                </div>
            ),
        },
        {
            title: "Thời gian",
            key: "info",
            width: 150,
            render: (_, record) => {
                let color = 'default';
                let label = record.sharingMode;
                if (record.sharingMode === 'public') { color = 'cyan'; label = 'Công khai'; }
                else if (record.sharingMode === 'abstract_only') { color = 'green'; label = 'Tóm tắt'; }
                else if (record.sharingMode === 'internal') { color = 'processing'; label = 'Nội bộ'; }

                return (
                    <Space direction="vertical" size={2}>
                        <Tag icon={<GlobalOutlined />} color={color}>{label}</Tag>
                        <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                            <ClockCircleOutlined /> {record.createdAt ? new Date(record.createdAt).toLocaleDateString("vi-VN") : "-"}
                        </div>
                    </Space>
                )
            },
        },
        {
            title: "Kiểm tra",
            key: "check",
            width: 150,
            render: (_, record) => (
                <DuplicateCheckButtonComponent
                    thesisData={{
                        title: record.title,
                        tom_tat: record.tom_tat,
                        keywords: record.keywords,
                        thesisId: record.thesisId,
                    }}
                    buttonProps={{ size: 'small', type: 'default', shape: 'round' }}
                />
            )
        },
        {
            title: "",
            key: "actions",
            width: 60,
            align: 'center',
            render: (_, record) => {
                const items = [
                    {
                        label: <><EyeOutlined /> Xem chi tiết</>,
                        key: 'view',
                        onClick: () => { setSelectedKey(record.key); setModalVisible(true); },
                    },
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

    // Map data
    const dataTable = filteredData.map((item) => ({
        key: item?._id,
        
        sharingId: item?.sharing?._id,
        thesisId: item?.sharing?.thesis?._id,
        title: item?.sharing?.thesis?.title,
        tom_tat: item?.sharing?.thesis?.tom_tat,
        keywords: item?.sharing?.thesis?.keywords,
        
        requester: item?.sharing?.requester,
        createdAt: item?.createdAt,
        ...item?.sharing?.thesis,
        sharingMode: item?.sharing?.sharingMode,
        status: item?.sharing?.status,
        
    }));

    return (
        <div style={{ margin: "0 auto", padding: "0 16px" }}>
            <BreadcrumbComponent customNameMap={{ "share-requests": "Yêu cầu Chia sẻ", "lecturer": "Giảng viên" }} />
            
            <Card 
                style={{ borderRadius: 12, marginTop: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
                styles={{
                    body:{ padding: "0 24px 24px 24px"}
                }}
            >
                {/* TOOLBAR */}
                <div style={{ 
                    display: "flex", justifyContent: "space-between", alignItems: "center", 
                    padding: "20px 0", borderBottom: "1px solid #f0f0f0", marginBottom: 20 
                }}>
                    <Space>
                        <Title level={4} style={{ margin: 0 }}>📋 Duyệt Yêu cầu Chia sẻ</Title>
                        <Badge count={dataTable.length} style={{ backgroundColor: '#1890ff' }} />
                    </Space>
                    <Space>
                        <Input 
                            placeholder="Tìm theo tên bài, người gửi..." 
                            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />} 
                            style={{ width: 250, borderRadius: 6 }}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            allowClear
                        />
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
                        scroll={{ x: 900 }}
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
                title={<Space><CloseCircleOutlined style={{ color: '#ff4d4f' }} /> <span>Từ chối Yêu cầu</span></Space>}
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
    );
};

export default ShareRequestThesesPage;