import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
// Đã loại bỏ Rate khỏi import
import { List, Avatar, Form, Button, Input, Popconfirm, Tooltip, Divider, Space, Typography } from "antd"; 
import moment from "moment";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as CommentService from "../../services/CommentService";
import * as Message from "../Message/Message";

const { TextArea } = Input;
const { Text } = Typography;

const CommentSectionComponent = ({ thesisId, commentsData }) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const currentUser = useSelector((state) => state.auth.user);
    const isAuthenticated = !!currentUser;

    // State cho việc thêm bình luận mới
    const [newComment, setNewComment] = useState("");
    // Đã loại bỏ: const [rating, setRating] = useState(0); 

    // State quản lý mục nào đang được Sửa (chứa ID của bình luận)
    const [editingCommentId, setEditingCommentId] = useState(null); 
    // Đã loại bỏ: const [editingRating, setEditingRating] = useState(0);
    const [editingText, setEditingText] = useState("");


    // --- 1. THÊM BÌNH LUẬN (CREATE) ---
    const mutationAdd = useMutation({
        mutationFn: CommentService.addComment,
        onSuccess: () => {
            Message.success("Thêm bình luận thành công!");
            setNewComment("");
            // Đã loại bỏ: setRating(0);
            queryClient.invalidateQueries(["comments", thesisId]);
        },
        onError: (error) => {
            Message.error(error?.response?.data?.message || "Không thể thêm bình luận.");
        },
    });

    const handleSubmit = () => {
        if (!isAuthenticated) {
            Message.warning("Vui lòng đăng nhập để bình luận.");
            return;
        }
        if (!newComment.trim()) {
            Message.warning("Vui lòng nhập nội dung bình luận.");
            return;
        }
        
        mutationAdd.mutate({
            thesis: thesisId,
            content: newComment,
            // Đã loại bỏ rating: rating > 0 ? rating : 5, 
            user: currentUser.id, 
        });
    };
    
    // --- 2. CẬP NHẬT BÌNH LUẬN (UPDATE) ---
    const mutationUpdate = useMutation({
        mutationFn: CommentService.updateComment,
        onSuccess: () => {
            Message.success("Cập nhật bình luận thành công!");
            setEditingCommentId(null); // Tắt chế độ sửa
            queryClient.invalidateQueries(["comments", thesisId]);
        },
        onError: () => {
            Message.error("Không thể cập nhật bình luận.");
        },
    });
    
    // Cập nhật hàm handleUpdate
    const handleUpdate = (commentId) => {
        if (editingText.trim()) {
            mutationUpdate.mutate({
                id: commentId,
                content: editingText,
                // Đã loại bỏ rating: editingRating,
            });
        }
    };

    // --- 3. XÓA BÌNH LUẬN (DELETE) ---
    const mutationDelete = useMutation({
        mutationFn: CommentService.deleteComment,
        onSuccess: () => {
            Message.success("Xóa bình luận thành công!");
            queryClient.invalidateQueries(["comments", thesisId]);
        },
        onError: () => {
            Message.error("Không thể xóa bình luận.");
        },
    });

    const handleDelete = (commentId) => {
        mutationDelete.mutate(commentId);
    };
    // --- State cho Load More ---
    const commentsPerLoad = 5; // Số lượng bình luận tải thêm mỗi lần
    const [displayCount, setDisplayCount] = useState(commentsPerLoad); 

    // 1. Cắt mảng bình luận để hiển thị
    const displayedComments = commentsData.slice(0, displayCount);
    
    // 2. Kiểm tra xem còn bình luận để tải không
    const hasMoreComments = commentsData.length > displayCount;

    // 3. Hàm xử lý Load More
    const handleLoadMore = () => {
        setDisplayCount(prevCount => prevCount + commentsPerLoad);
    };

    // --- Hàm Render cho từng Item Bình luận (READ) ---
    const renderCommentItem = (comment) => {
        const hasPermission = currentUser?.id === comment.user?._id || currentUser?.role === 'Admin';
        const isEditing = editingCommentId === comment._id;
        
        const userName = comment.user?.name || "Người dùng ẩn danh";
        const userAvatar = comment.user?.avatar;


        const actionButtons = [];
        
        if (hasPermission) {
            actionButtons.push(
                <span 
                    key="edit" 
                    onClick={() => {
                        setEditingCommentId(comment._id); // Bật chế độ sửa
                        setEditingText(comment.content); // Đặt nội dung hiện tại vào ô sửa
                        // Đã loại bỏ: setEditingRating(comment.rating); // Loại bỏ đánh giá
                    }}
                    style={{ cursor: 'pointer', marginRight: 16 }}
                >
                    Sửa
                </span>,
                <Popconfirm
                    title="Xóa bình luận này?"
                    onConfirm={() => handleDelete(comment._id)}
                    okText="Xóa"
                    cancelText="Hủy"
                    key="delete"
                >
                    <span style={{ color: 'red', cursor: 'pointer' }}>Xóa</span>
                </Popconfirm>
            );
        }

        const content = isEditing ? (
            <>
                {/* Đã loại bỏ: Phần chỉnh sửa đánh giá (Rate) */}
                <TextArea 
                    rows={2} 
                    value={editingText} 
                    onChange={(e) => setEditingText(e.target.value)} 
                />
                <Space style={{ marginTop: 8 }}>
                    <Button onClick={() => handleUpdate(comment._id)} type="primary" size="small" loading={mutationUpdate.isLoading}>Lưu</Button> {/* Loại bỏ tham số comment.rating */}
                    <Button onClick={() => setEditingCommentId(null)} size="small">Hủy</Button>
                </Space>
            </>
        ) : (
            <p style={{ marginTop: 8 }}>{comment.content}</p>
        );

        return (
            <div className="comment-item" style={{ display: 'flex', marginBottom: 16 }}>
                {/* 1. Phần Avatar */}
                <Avatar src={`${import.meta.env.VITE_API_URL}${userAvatar}`} alt={userName} style={{ marginRight: 16 }} />
                
                {/* 2. Phần Nội dung */}
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {/* Tên người dùng */}
                        <Text strong style={{ marginRight: 16 }}>{userName}</Text>
                        
                        {/* Đã loại bỏ: <Rate disabled value={comment.rating} style={{ fontSize: 14 }} /> */}
                    </div>

                    {/* Nội dung và Form Sửa */}
                    {content} 

                    {/* Actions và Thời gian */}
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: 12, color: '#999' }}>
                        {/* Thời gian */}
                        <Tooltip title={moment(comment.createdAt).format('YYYY-MM-DD HH:mm:ss')}>
                            <span style={{ marginRight: 16 }}>{moment(comment.createdAt).fromNow()}</span>
                        </Tooltip>
                        
                        {/* Nút Sửa/Xóa */}
                        <Space size="middle">
                            {actionButtons}
                        </Space>
                    </div>
                </div>
            </div>
        );
    };


    // --- Giao diện tổng thể ---
    return (
        <div className="comment-section">
            <h3>Bình luận ({commentsData.length})</h3> {/* Đã đổi tiêu đề */}
            
            {/* Form Thêm mới */}
            <div className="comment-form-section mb-6">
                <Form layout="vertical">
                    {isAuthenticated ? (
                        // HIỂN THỊ FORM BÌNH LUẬN KHI ĐÃ ĐĂNG NHẬP
                        <Form.Item>
                            <TextArea
                                rows={4}
                                onChange={(e) => setNewComment(e.target.value)}
                                value={newComment}
                                placeholder="Viết bình luận của bạn ở đây..."
                            />
                            <Form.Item>
                                <Button
                                    htmlType="submit"
                                    loading={mutationAdd.isLoading}
                                    onClick={handleSubmit}
                                    type="primary"
                                    disabled={!isAuthenticated || !newComment.trim()} 
                                >
                                    Gửi bình luận
                                </Button>
                            </Form.Item>
                        </Form.Item>
                    ) : (
                        // HIỂN THỊ THÔNG BÁO YÊU CẦU ĐĂNG NHẬP KHI CHƯA ĐĂNG NHẬP
                        <div style={{ 
                            padding: '20px', 
                            textAlign: 'center', 
                            border: '1px solid #d9d9d9', 
                            borderRadius: '6px' 
                        }}>
                            <p>Vui lòng đăng nhập để có thể bình luận về tài liệu này.</p>
                            <Button 
                                type="primary" 
                                onClick={() => navigate(`/login?redirect=${location.pathname}`)}
                            >
                                Đăng nhập
                            </Button>
                        </div>
                    )}
                </Form>
            </div>

            <Divider orientation="left">Danh sách Bình luận</Divider>

            {/* Danh sách Bình luận */}
            <List
                className="comment-list"
                itemLayout="horizontal"
                dataSource={displayedComments} 
                renderItem={renderCommentItem}
                
                // THÊM NÚT LOAD MORE
                loadMore={
                    hasMoreComments ? (
                        <div
                            style={{
                                textAlign: 'center',
                                marginTop: 12,
                                height: 32,
                                lineHeight: '32px',
                            }}
                        >
                            <Button onClick={handleLoadMore} loading={false}>
                                Tải thêm ({commentsData.length - displayCount} bình luận)
                            </Button>
                        </div>
                    ) : null
                }
            />
        </div>
    );
};

export default CommentSectionComponent;