import React, { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
    Table, Input, Button, Modal, Space, Tag, Typography, 
    Card, Tooltip, Popconfirm, Divider, Row, Col 
} from "antd";
import {
    SearchOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    EyeOutlined,
    ReloadOutlined,
    FileTextOutlined,
    UserOutlined,
    ClockCircleOutlined,
    QuestionCircleOutlined
} from "@ant-design/icons";

// COMPONENTS & SERVICES
import LoadingComponent from "../../components/LoadingComponent/LoadingComponent";
import ShareRequestDetailModal from "../../components/ShareRequestDetailModal/ShareRequestDetailModal";
import ActionsDropdownComponent from "../../components/ActionsDropdownComponent/ActionsDropdownComponent";
import * as Message from "../../components/Message/Message";
import * as SharingService from "../../services/SharingService";

const { Title, Text } = Typography;

const RequestSharePage = () => {
    // --- STATE ---
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [rejectingId, setRejectingId] = useState(null);
    const [rejectReason, setRejectReason] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedKey, setSelectedKey] = useState(null);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const [searchText, setSearchText] = useState("");

    // --- FETCH DATA ---
    const queryGetPendingConfirmations = useQuery({
        queryKey: ["getPendingConfirmations"],
        queryFn: SharingService.getPendingConfirmations,
    });
    const { data: response, isLoading: isLoadingPendingConfirmations, refetch } = queryGetPendingConfirmations;
    const pendingConfirmationsList = response?.data || [];

    // --- FILTER LOGIC (Client-side Search) ---
    const filteredData = pendingConfirmationsList.filter(item => {
        if (!searchText) return true;
        const lowerText = searchText.toLowerCase();
        return (
            item.sharing?.thesis?.title?.toLowerCase().includes(lowerText) ||
            item.sharing?.requester?.name?.toLowerCase().includes(lowerText) ||
            item.sharing?.requester?.email?.toLowerCase().includes(lowerText)
        );
    });

    // --- MUTATIONS ---
    const mutationDecision = useMutation({
        mutationFn: ({sharingId, decision, note}) => SharingService.decisionShareThesis(sharingId, decision, note),
        onSuccess: (data) => {
            Message.success(data?.message || "Xử lý thành công");
            refetch();
            setRejectModalVisible(false);
            setRejectReason("");
        },
        onError: (error) => Message.error(error?.message || "Lỗi xử lý"),
    });

    // --- HANDLERS ---
    const handleDecision = (sharingId, decision, note) => {
        mutationDecision.mutate({ sharingId, decision, note });
    };

    const handleRejectClick = (id) => {
        setRejectingId(id);
        setRejectModalVisible(true);
    };

    const handleConfirmReject = () => {
        if (!rejectReason.trim()) {
            Message.error("Vui lòng nhập lý do từ chối.");
            return;
        }
        mutationDecision.mutate({ sharingId: rejectingId, decision: "rejected", note: rejectReason });
    };

    const handleTableChange = (page, pageSize) => {
        setPagination({ current: page, pageSize });
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
            title: "Tên luận văn",
            dataIndex: "title",
            key: "title",
            width: 350,
            render: (text) => (
                <Space align="start">
                    <Tooltip title={text}>
                        <Text strong style={{ color: '#262626', fontSize: 14 }}>
                            {text?.length > 70 ? `${text.slice(0, 70)}...` : text}
                        </Text>
                    </Tooltip>
                </Space>
            ),
        },
        {
            title: "Người yêu cầu",
            dataIndex: "requester",
            key: "requester",
            width: 250,
            render: (req) => (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Text strong><UserOutlined /> {req?.name || "N/A"}</Text>
                    <Text type="secondary" style={{ fontSize: 12, marginLeft: 18 }}>{req?.email}</Text>
                </div>
            ),
        },
        {
            title: "Thời gian",
            dataIndex: "createdAt", // Giả sử dùng updated hoặc created
            key: "time",
            width: 150,
            render: (text) => (
                <span style={{ color: '#595959' }}>
                    <ClockCircleOutlined style={{ marginRight: 6 }} />
                    {text ? new Date(text).toLocaleDateString("vi-VN") : "N/A"}
                </span>
            ),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 120,
            render: (status) => {
                let color = "default";
                let label = status;
                if (status === 'pending') { color = "warning"; label = "Chờ duyệt"; }
                if (status === 'approved') { color = "success"; label = "Đã duyệt"; }
                if (status === 'rejected') { color = "error"; label = "Từ chối"; }
                return <Tag color={color}>{label}</Tag>;
            }
        },
        {
            title: "Thao tác",
            key: "action",
            width: 140,
            align: 'center',
            fixed: 'right',
            render: (_, record) => {
                // Nếu đã xử lý rồi thì không hiện nút duyệt nữa (tùy logic của bạn)
                if (record.status !== 'pending') {
                    return <Button size="small" icon={<EyeOutlined />} onClick={() => { setSelectedKey(record.key); setModalVisible(true); }}>Chi tiết</Button>;
                }

                const items = [
                    {
                        label: <><EyeOutlined /> Xem chi tiết</>,
                        key: 'view',
                        onClick: () => { setSelectedKey(record.key); setModalVisible(true); }
                    },
                    {
                        label: <span style={{ color: 'green' }}><CheckCircleOutlined /> Đồng ý</span>,
                        key: 'approve',
                        onClick: () => handleDecision(record.sharingId, "approved", "Admin đã duyệt"),
                        confirm: { title: "Xác nhận duyệt yêu cầu này?", okText: "Duyệt" }
                    },
                    {
                        label: <span style={{ color: 'red' }}><CloseCircleOutlined /> Từ chối</span>,
                        key: 'reject',
                        onClick: () => handleRejectClick(record.sharingId)
                    }
                ];

                return <ActionsDropdownComponent items={items} />;
            },
        },
    ];

    // Map Data
    const dataTable = filteredData.map((item) => ({
        key: item._id, // ID bản ghi confirm
        sharingId: item.sharing?._id, // ID bản ghi sharing gốc
        title: item.sharing?.thesis?.title,
        requester: item.sharing?.requester,
        // Dữ liệu bổ sung cho modal
        thesisId: item.sharing?.thesis?._id,
        authorName: item.sharing?.thesis?.authorName,
        coAuthorsNames: item.sharing?.thesis?.coAuthorsNames,
        supervisorName: item.sharing?.thesis?.supervisorName,
        fileUrl: item.sharing?.thesis?.fileUrl,
        status: item.status,
        createdAt: item.createdAt, // Hoặc updatedAt tùy logic
    }));

    return (
        <div >

            {/* TABLE CARD */}
            <Card style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                {/* TOOLBAR */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
                    <Space size="middle">
                        <Input.Search 
                            placeholder="Tìm tên bài, người gửi..." 
                            allowClear 
                            onChange={(e) => setSearchText(e.target.value)}
                            onSearch={() => setPagination({ ...pagination, current: 1 })}
                            style={{ width: 300 }}
                            enterButton={<SearchOutlined />}
                        />
                        <Button icon={<ReloadOutlined />} onClick={() => refetch()}>Làm mới</Button>
                    </Space>
                </div>

                {/* TABLE */}
                <LoadingComponent isLoading={isLoadingPendingConfirmations}>
                    <Table
                        columns={columns}
                        dataSource={dataTable}
                        pagination={{
                            ...pagination,
                            total: filteredData.length,
                            showTotal: (total) => `Tổng ${total} yêu cầu`,
                            showSizeChanger: true,
                            onChange: handleTableChange
                        }}
                        scroll={{ x: 1000 }}
                        size="middle"
                        rowKey="key"
                    />
                </LoadingComponent>
            </Card>

            {/* MODALS */}
            
            {/* 1. View Detail Modal */}
            <ShareRequestDetailModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                dataTable={dataTable}
                selectedKey={selectedKey}
            />

            {/* 2. Reject Modal */}
            <Modal
                title={
                    <Space>
                        <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                        <span>Từ chối yêu cầu</span>
                    </Space>
                }
                open={rejectModalVisible}
                onOk={handleConfirmReject}
                onCancel={() => { setRejectModalVisible(false); setRejectReason(""); }}
                okText="Xác nhận Từ chối"
                okButtonProps={{ danger: true, loading: mutationDecision.isPending }}
                cancelText="Hủy"
            >
                <div style={{ marginBottom: 12 }}>
                    <Text strong>Lý do từ chối:</Text>
                    <Text type="secondary" style={{ display: 'block', fontSize: 12, marginBottom: 8 }}>
                        (Thông báo này sẽ được gửi đến người yêu cầu)
                    </Text>
                </div>
                <Input.TextArea
                    rows={4}
                    placeholder="Nhập lý do chi tiết..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                />
            </Modal>
        </div>
    );
};

export default RequestSharePage;