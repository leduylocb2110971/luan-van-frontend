import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
    Table, Input, Button, Space, Tag, Popconfirm, Tooltip, 
    Card, Typography, Row, Col, Modal, Avatar, Badge 
} from "antd";
import {
    DeleteOutlined,
    SearchOutlined,
    EyeOutlined,
    EyeInvisibleOutlined,
    ReloadOutlined,
    UserOutlined,
    CommentOutlined,
    FileTextOutlined
} from "@ant-design/icons";

import * as CommentService from "../../services/CommentService";
import * as Message from "../../components/Message/Message";
import LoadingComponent from "../../components/LoadingComponent/LoadingComponent";

const { Title, Text, Paragraph } = Typography;

// --- UTILS ---
const HighlightText = ({ text, highlight }) => {
    if (!highlight || !text) return <>{text}</>;
    const regex = new RegExp(`(${highlight})`, "gi");
    const parts = text.toString().split(regex);
    return (
        <>
            {parts.map((part, i) => 
                part.toLowerCase() === highlight.toLowerCase() ? 
                <span key={i} style={{ backgroundColor: "#fff566", padding: '0 2px' }}>{part}</span> : part
            )}
        </>
    );
};

const Comment = () => {
    // --- STATE ---
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [rowSelected, setRowSelected] = useState(null); 
    const [isModalOpenDeleteMany, setIsModalOpenDeleteMany] = useState(false);
    const [searchText, setSearchText] = useState("");
    
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
    });

    // --- FETCH DATA ---
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['comments'], // Lấy tất cả về rồi phân trang client cho mượt với admin
        queryFn: () => CommentService.getAllCommentsIncludingHidden(),
    });
    
    const comments = data?.data || [];

    // --- FILTER LOGIC (Client-side) ---
    const filteredComments = comments.filter(item => {
        if (!searchText) return true;
        const lowerText = searchText.toLowerCase();
        return (
            item.content?.toLowerCase().includes(lowerText) ||
            item.user?.name?.toLowerCase().includes(lowerText) ||
            item.thesis?.title?.toLowerCase().includes(lowerText)
        );
    });

    // --- MUTATIONS ---
    const deleteCommentMutation = useMutation({
        mutationFn: (commentId) => CommentService.deleteComment(commentId),
        onSuccess: () => {
            Message.success("Xoá bình luận thành công");
            refetch();
        },
        onError: () => Message.error("Xoá thất bại"),
    });

    const deleteManyCommentsMutation = useMutation({
        mutationFn: (commentIds) => Promise.all(commentIds.map(id => CommentService.deleteComment(id))),
        onSuccess: () => {
            Message.success("Xoá nhiều thành công");
            setIsModalOpenDeleteMany(false);
            setSelectedRowKeys([]);
            refetch();
        },
        onError: () => Message.error("Xoá nhiều thất bại"),
    });

    const toggleCommentVisibilityMutation = useMutation({
        mutationFn: (commentId) => CommentService.toggleCommentVisibility(commentId),
        onSuccess: () => {
            Message.success("Đã thay đổi trạng thái hiển thị");
            refetch();
        },
        onError: (error) => Message.error("Lỗi: " + error.message),
    });

    // --- HANDLERS ---
    const handleToggleCommentStatus = (commentId) => {
        toggleCommentVisibilityMutation.mutate(commentId);
    };

    const handleDeleteComment = (id) => {
        deleteCommentMutation.mutate(id);
    };

    const handleDeleteManyComments = () => {
        deleteManyCommentsMutation.mutate(selectedRowKeys);
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: (keys) => setSelectedRowKeys(keys),
    };

    // --- COLUMNS ---
    const columns = [
        {
            title: 'STT',
            key: 'index',
            width: 50,
            align: 'center',
            render: (_, __, index) => index + 1 + (pagination.current - 1) * pagination.pageSize,
        },
        {
            title: 'Người bình luận',
            key: 'user',
            width: 220,
            render: (_, record) => (
                <Space align="start">
                    <Avatar icon={<UserOutlined />} style={{ backgroundColor: record.user?.role === 'lecturer' ? '#722ed1' : '#1890ff' }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Text strong style={{ fontSize: 13 }}>
                            <HighlightText text={record.user?.name || "Ẩn danh"} highlight={searchText} />
                        </Text>
                        <Space size="small">
                            <Tag style={{ margin: 0, fontSize: 10 }}>
                                {record.user?.role === 'lecturer' ? 'Giảng viên' : 'Sinh viên'}
                            </Tag>
                            <span style={{ fontSize: 11, color: '#8c8c8c' }}>
                                {record.createdAt ? new Date(record.createdAt).toLocaleDateString('vi-VN') : '-'}
                            </span>
                        </Space>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Nội dung bình luận',
            dataIndex: 'content',
            key: 'content',
            width: 350,
            render: (text) => (
                <Tooltip title={text}>
                    <Paragraph 
                        ellipsis={{ rows: 2, expandable: true, symbol: 'xem thêm' }} 
                        style={{ margin: 0, fontSize: 14 }}
                    >
                        <HighlightText text={text} highlight={searchText} />
                    </Paragraph>
                </Tooltip>
            ),
        },
        {
            title: 'Thuộc luận văn',
            dataIndex: ['thesis', 'title'],
            key: 'thesis',
            width: 250,
            render: (text) => (
                <Space align="start">
                    <FileTextOutlined style={{ color: '#faad14', marginTop: 3 }} />
                    <Text type="secondary" style={{ fontSize: 13 }}>
                        <HighlightText text={text} highlight={searchText} />
                    </Text>
                </Space>
            )
        },
        {
            title: 'Trạng thái',
            key: 'status',
            width: 100,
            align: 'center',
            render: (_, record) => (
                record.isVisible 
                ? <Tag color="success">Hiển thị</Tag> 
                : <Tag color="error">Đã ẩn</Tag>
            )
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 120,
            align: 'center',
            fixed: 'right',
            render: (_, record) => (
                <Space>
                    <Tooltip title={record.isVisible ? "Nhấn để ẩn" : "Nhấn để hiện"}>
                        <Button 
                            size="small"
                            type={record.isVisible ? "default" : "primary"}
                            danger={!record.isVisible}
                            icon={record.isVisible ? <EyeOutlined /> : <EyeInvisibleOutlined />} 
                            onClick={() => handleToggleCommentStatus(record._id)}
                        />
                    </Tooltip>
                    
                    <Popconfirm
                        title="Xóa bình luận?"
                        description="Hành động này không thể hoàn tác."
                        onConfirm={() => handleDeleteComment(record._id)}
                        okText="Xóa"
                        okButtonProps={{ danger: true }}
                        cancelText="Hủy"
                    >
                        <Button size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div >
            {/* HEADER */}
            <div >
                <Title level={2} style={{ margin: 0 }}>Quản Lý Bình Luận</Title>
            </div>

            {/* MAIN CARD */}
            <Card style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                
                {/* TOOLBAR */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
                    <Space>
                        <Input 
                            placeholder="Tìm nội dung, người gửi, bài viết..." 
                            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />} 
                            allowClear
                            onChange={(e) => setSearchText(e.target.value)}
                            style={{ width: 300 }}
                        />
                        <Button icon={<ReloadOutlined />} onClick={() => refetch()}>Làm mới</Button>
                    </Space>

                    {selectedRowKeys.length > 0 && (
                        <Button 
                            type="primary" danger 
                            icon={<DeleteOutlined />} 
                            onClick={() => setIsModalOpenDeleteMany(true)}
                        >
                            Xóa ({selectedRowKeys.length}) mục
                        </Button>
                    )}
                </div>

                {/* TABLE */}
                <LoadingComponent isLoading={isLoading}>
                    <Table
                        rowSelection={rowSelection}
                        columns={columns}
                        dataSource={filteredComments.map(item => ({ ...item, key: item._id }))}
                        rowKey="key"
                        pagination={{
                            ...pagination,
                            total: filteredComments.length,
                            showTotal: (total) => `Tổng ${total} bình luận`,
                            onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
                            showSizeChanger: true
                        }}
                        scroll={{ x: 1000 }}
                        size="middle"
                    />
                </LoadingComponent>
            </Card>

            {/* MODAL DELETE MANY */}
            <Modal
                title="Xác nhận xóa nhiều"
                open={isModalOpenDeleteMany}
                onOk={handleDeleteManyComments}
                onCancel={() => setIsModalOpenDeleteMany(false)}
                okText="Xóa tất cả"
                okButtonProps={{ danger: true, loading: deleteManyCommentsMutation.isPending }}
                cancelText="Hủy"
            >
                <p>Bạn có chắc chắn muốn xóa <strong>{selectedRowKeys.length}</strong> bình luận đã chọn?</p>
            </Modal>
        </div>
    );
};

export default Comment;