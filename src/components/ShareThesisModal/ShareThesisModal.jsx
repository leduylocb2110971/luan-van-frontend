// src/components/ShareThesisModal/ShareThesisModal.jsx

import React, { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Modal, Input, Radio, Checkbox, Typography, Spin, Alert, Button, Card, Tag, Space, Divider } from "antd";
import { SendOutlined, GlobalOutlined, InfoCircleOutlined, TeamOutlined, FileProtectOutlined } from '@ant-design/icons';

import * as SharingService from "../../services/SharingService"; 
import * as Messages from "../Message/Message"; 

const { Title, Text } = Typography;

const ShareThesisModal = ({
    isOpen,
    thesisToProcess,
    isResubmitMode,
    onClose,
    onSuccess,
}) => {
    // --- 1. PHÂN TÍCH TRẠNG THÁI HIỆN TẠI ---
    const currentStatus = thesisToProcess?.status;
    const currentAccessMode = thesisToProcess?.accessMode;

    // Logic: Có cho phép chọn "Nội bộ" hay không?
    // Chỉ cho phép khi:
    // 1. Chế độ truy cập riêng tư
    // 2. Hoặc bài bị từ chối hoàn toàn (rejected) - coi như làm lại từ đầu
    const showInternalOption = currentAccessMode === 'private';

    // Logic: Xác định Mode mặc định
    const getDefaultMode = () => {
        // Nếu không hiện Internal (tức là đang nâng cấp từ Internal lên), thì mặc định là Public
        if (!showInternalOption) return 'public';
        // Nếu hiện Internal (tức là mới tinh), mặc định cũng là Public (khuyên dùng) hoặc Internal tùy bạn
        return 'public';
    };

    // --- State ---
    const noteRef = useRef("");
    const [commitmentChecked, setCommitmentChecked] = useState(false);
    const [selectedSharingMode, setSelectedSharingMode] = useState('public'); 

    // Reset state khi mở modal
    useEffect(() => {
        if (isOpen && thesisToProcess) {
            noteRef.current = thesisToProcess?.sharingRequest?.note || ""; 
            setCommitmentChecked(false);
            setSelectedSharingMode(getDefaultMode());
        }
    }, [isOpen, thesisToProcess]);

    // --- Mutations ---
    const mutationRequestShare = useMutation({
        mutationFn: ({ thesisId, note, sharingMode }) =>
            SharingService.requestShareThesis(thesisId, note, sharingMode),
        onSuccess: (data) => {
            Messages.success(data.message || "Đã gửi yêu cầu thành công.");
            onSuccess();
            onClose();
        },
        onError: (error) => {
            Messages.error(error.message || "Lỗi khi gửi yêu cầu.");
        },
    });

    const mutationResubmitShare = useMutation({
        // Khi resubmit, logic backend của bạn có thể cần sharingMode nếu muốn đổi chế độ
        // Nếu hàm resubmitShareThesis của bạn không nhận sharingMode, hãy đảm bảo backend lấy từ bản ghi cũ
        // Tuy nhiên, tốt nhất là nên gửi kèm sharingMode mới để cập nhật
        mutationFn: ({ thesisId, note, sharingMode }) =>
            SharingService.requestShareThesis(thesisId, note, sharingMode), // Dùng chung hàm requestShareThesis (vì hàm này có logic Upsert) là tốt nhất
        onSuccess: (data) => {
            Messages.success(data.message || "Đã gửi lại yêu cầu thành công.");
            onSuccess();
            onClose();
        },
        onError: (error) => {
            Messages.error(error.message || "Lỗi khi gửi lại yêu cầu.");
        },
    });

    const isLoading = mutationRequestShare.isPending || mutationResubmitShare.isPending;

    // --- Handler ---
    const handleConfirmShare = () => {
        if (!thesisToProcess) return;
        const thesisId = thesisToProcess._id;
        const note = noteRef.current;

        if (!commitmentChecked) {
            Messages.warning("Vui lòng cam kết trách nhiệm trước khi gửi.");
            return;
        }

        // Logic gọi API: Dù là gửi mới hay gửi lại, ta đều cần sharingMode
        // Vì code Backend đã update logic Upsert (Tái sử dụng), nên ta gọi chung 1 logic cũng được
        // Hoặc chia ra nếu bạn muốn dùng API riêng. Ở đây tôi dùng mutationRequestShare cho cả 2 để tận dụng logic Upsert mới.
        mutationRequestShare.mutate({ thesisId, note, sharingMode: selectedSharingMode });
    };

    // --- Render ---
    if (!thesisToProcess || !isOpen) return null;

    const modalTitle = isResubmitMode ? "Gửi Lại Yêu Cầu" : "Gửi Yêu Cầu Chia Sẻ";

    return (
        <Modal
            title={<Title level={4} style={{ margin: 0, color: '#1890ff' }}><SendOutlined /> {modalTitle}</Title>}
            open={isOpen}
            onCancel={onClose}
            width={600}
            footer={[
                <Button key="back" onClick={onClose} disabled={isLoading}>Hủy</Button>,
                <Button 
                    key="submit" 
                    type="primary" 
                    loading={isLoading} 
                    onClick={handleConfirmShare}
                    disabled={!commitmentChecked}
                >
                    Xác nhận Gửi
                </Button>,
            ]}
        >
            <Spin spinning={isLoading}>
                {/* Thông tin bài viết */}
                <Card size="small" style={{ marginBottom: 16, background: '#f5f5f5', border: '1px solid #d9d9d9' }}>
                    <Text type="secondary">Đang xử lý cho luận văn:</Text>
                    <div style={{ fontWeight: 600, color: '#0050b3', fontSize: '15px' }}>{thesisToProcess.title}</div>
                </Card>

                {/* Phần chọn chế độ chia sẻ */}
                <div style={{ marginBottom: 20 }}>
                    <Title level={5}><GlobalOutlined /> Chọn phạm vi chia sẻ:</Title>
                    
                    <Radio.Group 
                        onChange={(e) => setSelectedSharingMode(e.target.value)} 
                        value={selectedSharingMode}
                        style={{ width: '100%' }}
                    >
                        <Space direction="vertical" style={{ width: '100%' }}>
                            
                            {/* OPTION 1: CÔNG KHAI (Luôn hiện) */}
                            <Card 
                                size="small" 
                                hoverable 
                                style={{ borderColor: selectedSharingMode === 'public' ? '#1890ff' : '#d9d9d9' }}
                                onClick={() => setSelectedSharingMode('public')}
                            >
                                <Radio value="public">
                                    <Text strong style={{ color: '#1890ff' }}>Công khai Toàn văn (Public)</Text>
                                </Radio>
                                <Tag color="success" style={{ float: 'right' }}>Khuyên dùng</Tag>
                                <div style={{ marginLeft: 24, color: '#595959', fontSize: '12px' }}>
                                    Chia sẻ rộng rãi cho cộng đồng. Cần giảng viên duyệt.
                                </div>
                            </Card>

                            {/* OPTION 2: CHỈ TÓM TẮT (Luôn hiện) */}
                            <Card 
                                size="small" 
                                hoverable
                                style={{ borderColor: selectedSharingMode === 'abstract_only' ? '#1890ff' : '#d9d9d9' }}
                                onClick={() => setSelectedSharingMode('abstract_only')}
                            >
                                <Radio value="abstract_only">
                                    <Text strong style={{ color: '#13c2c2' }}>Công khai Tóm tắt</Text>
                                </Radio>
                                <Tag color="processing" style={{ float: 'right' }}>Bảo mật file</Tag>
                                <div style={{ marginLeft: 24, color: '#595959', fontSize: '12px' }}>
                                    Chỉ hiện thông tin cơ bản. File PDF được ẩn. Cần duyệt.
                                </div>
                            </Card>

                            {/* OPTION 3: NỘI BỘ (Chỉ hiện khi là Nháp hoặc Bị từ chối hoàn toàn) */}
                            {showInternalOption && (
                                <Card 
                                    size="small" 
                                    hoverable
                                    style={{ borderColor: selectedSharingMode === 'internal' ? '#1890ff' : '#d9d9d9' }}
                                    onClick={() => setSelectedSharingMode('internal')}
                                >
                                    <Radio value="internal">
                                        <Text strong style={{ color: '#faad14' }}>Lưu hành Nội bộ</Text>
                                    </Radio>
                                    <Tag color="warning" style={{ float: 'right' }}>Phạm vi hẹp</Tag>
                                    <div style={{ marginLeft: 24, color: '#595959', fontSize: '12px' }}>
                                        Chỉ sinh viên và giảng viên trong trường mới xem được.
                                    </div>
                                </Card>
                            )}
                        </Space>
                    </Radio.Group>

                    {/* Thông báo nếu đang ở chế độ nâng cấp (không hiện option Nội bộ) */}
                    {!showInternalOption && (
                        <Alert 
                            style={{ marginTop: 12 }}
                            type="info" 
                            showIcon 
                            message="Nâng cấp quyền truy cập"
                            description="Luận văn này đã được xác nhận (hoặc đang chờ) ở mức Nội bộ. Bạn chỉ có thể chọn các mức chia sẻ cao hơn (Công khai/Tóm tắt)."
                        />
                    )}
                </div>

                <Divider />

                {/* Phần Ghi chú */}
                <div style={{ marginBottom: 16 }}>
                    <Text strong><InfoCircleOutlined /> Ghi chú cho người duyệt:</Text>
                    <Input.TextArea
                        rows={2}
                        placeholder="Nhập lý do hoặc ghi chú..."
                        defaultValue={noteRef.current}
                        onChange={(e) => noteRef.current = e.target.value}
                        style={{ marginTop: 8 }}
                    />
                    {isResubmitMode && thesisToProcess?.sharingRequest?.note && (
                        <div style={{ marginTop: 8, fontSize: '12px', color: '#8c8c8c' }}>
                            Ghi chú cũ: {thesisToProcess.sharingRequest.note}
                        </div>
                    )}
                </div>

                {/* Phần Cam kết */}
                <div style={{ paddboring: 12 }}>
                    <Checkbox checked={commitmentChecked} onChange={(e) => setCommitmentChecked(e.target.checked)}><Text strong style={{ color: commitmentChecked ? '#52c41a' : undefined }}>Tôi cam kết tài liệu hợp pháp và chịu trách nhiệm về nội dung.</Text></Checkbox>
                </div>
            </Spin>
        </Modal>
    );
};

export default ShareThesisModal;