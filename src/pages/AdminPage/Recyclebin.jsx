import React, { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
    Table, Input, Button, Row, Col, Modal, Space, Tag, Divider,
    Card, Tooltip, Empty, Typography, Breadcrumb
} from "antd";
import {
    DeleteOutlined,
    SearchOutlined,
    ReloadOutlined,
    ArrowLeftOutlined,
    CheckCircleOutlined,
    SyncOutlined,
    CloseCircleOutlined,
    FileTextOutlined,
    ClockCircleOutlined,
    RestOutlined
} from "@ant-design/icons";

// COMPONENTS & SERVICES
import LoadingComponent from "../../components/LoadingComponent/LoadingComponent";
import * as Message from "../../components/Message/Message";
import * as TheSisService from "../../services/TheSisService";

const { Title, Text } = Typography;

const Recyclebin = () => {
    const navigate = useNavigate();

    // --- 1. STATE & QUERY ---
    const [searchText, setSearchText] = useState("");

    const queryGetAllDeleted = useQuery({
        queryKey: ['getDeletedTheSis'],
        queryFn: TheSisService.getDeletedTheSis,
    });
    const { data: responseThesis, isLoading: isLoadingGetAllTheSis, refetch } = queryGetAllDeleted;

    const theSisData = responseThesis?.data || [];

    // --- 2. MUTATIONS ---
    const mutationRestoreTheSis = useMutation({
        mutationFn: (id) => TheSisService.restoreTheSis(id),
        onSuccess: () => {
            Message.success("Đã khôi phục luận văn thành công!");
            refetch();
        },
        onError: () => Message.error("Khôi phục thất bại!")
    });

    const mutationDeleteTheSis = useMutation({
        mutationFn: (id) => TheSisService.deleteTheSis(id),
        onSuccess: () => {
            Message.success("Đã xóa vĩnh viễn luận văn!");
            refetch();
        },
        onError: () => Message.error("Xóa thất bại!")
    });

    // --- 3. HANDLERS ---
    const handleRestore = (id) => mutationRestoreTheSis.mutate(id);

    const handleForceDelete = (id) => {
        Modal.confirm({
            title: 'Cảnh báo xóa vĩnh viễn',
            icon: <DeleteOutlined style={{ color: 'red' }} />,
            content: 'Bạn có chắc chắn muốn xóa vĩnh viễn luận văn này? Hành động này KHÔNG THỂ hoàn tác.',
            okText: 'Xóa ngay',
            okType: 'danger',
            cancelText: 'Hủy',
            centered: true, // Modal hiện giữa màn hình cho đẹp
            onOk: () => mutationDeleteTheSis.mutate(id)
        });
    };

    const filteredData = useMemo(() => {
        if (!searchText) return theSisData;
        return theSisData.filter((item) =>
            item.title?.toLowerCase().includes(searchText.toLowerCase()) ||
            item.owner?.name?.toLowerCase().includes(searchText.toLowerCase())
        );
    }, [theSisData, searchText]);

    // --- 4. TABLE COLUMNS (Đã làm đẹp) ---
    const columns = [
        {
            title: 'Tên luận văn',
            dataIndex: 'title',
            key: 'title',
            width: '35%',
            render: (text) => (
                <Space>
                    <FileTextOutlined style={{ color: '#1890ff' }} />
                    <span style={{ fontWeight: 600, color: '#333' }}>{text}</span>
                </Space>
            ),
            sorter: (a, b) => a.title.length - b.title.length,
        },
        {
            title: 'Người nộp',
            dataIndex: 'owner',
            key: 'owner',
            render: (owner) => <Text strong>{owner?.name || "N/A"}</Text>,
        },
        {
            title: 'Ngày xóa',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            render: (date) => (
                <Space>
                    <ClockCircleOutlined style={{ color: '#999' }} />
                    <span style={{ color: '#666' }}>
                        {date ? new Date(date).toLocaleString('vi-VN') : "N/A"}
                    </span>
                </Space>
            ),
            sorter: (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt),
        },
        {
            title: 'Trạng thái trước khi xóa',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            render: (status) => {
                let color = 'default';
                let icon = null;
                let text = 'N/A';
                switch (status) {
                    case 'approved_public': 
                        color = 'success'; icon = <CheckCircleOutlined />; text = 'Công khai'; break;
                    case 'submitted_internal': 
                        color = 'processing'; icon = <CheckCircleOutlined />; text = 'Nội bộ'; break;
                    case 'pending_public': 
                        color = 'warning'; icon = <SyncOutlined spin />; text = 'Chờ duyệt'; break;
                    case 'rejected_public': 
                        color = 'error'; icon = <CloseCircleOutlined />; text = 'Từ chối'; break;
                    case 'draft': 
                        color = 'purple'; icon = <FileTextOutlined />; text = 'Nháp'; break;
                    default: text = status;
                }
                return <Tag icon={icon} color={color} style={{ minWidth: 100, textAlign: 'center' }}>{text}</Tag>;
            }
        },
        {
            title: 'Hành động',
            key: 'action',
            align: 'center',
            width: 150,
            render: (_, record) => (
                <Space size="small">
                    {/* Nút Phục hồi gọn gàng */}
                    <Tooltip title="Khôi phục lại danh sách">
                        <Button
                            type="primary"
                            shape="circle"
                            icon={<ReloadOutlined />}
                            onClick={() => handleRestore(record._id)}
                            loading={mutationRestoreTheSis.isPending}
                            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                        />
                    </Tooltip>

                    {/* Nút Xóa vĩnh viễn gọn gàng */}
                    <Tooltip title="Xóa vĩnh viễn (Không thể hoàn tác)">
                        <Button
                            type="primary"
                            danger
                            shape="circle"
                            icon={<DeleteOutlined />}
                            onClick={() => handleForceDelete(record._id)}
                            loading={mutationDeleteTheSis.isPending}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    // --- 5. RENDER UI (Layout Card) ---
    return (
        <div  >
            <Card
                
                style={{
                    borderRadius: 12,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)', // Đổ bóng nhẹ
                    minHeight: 500
                }}
            >
                <LoadingComponent isLoading={isLoadingGetAllTheSis}>
                    {/* Header Section */}
                    <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                        <Col>
                            <Space align="center">
                                <Button 
                                    icon={<ArrowLeftOutlined />} 
                                    onClick={() => navigate('/admin/thesis')} 
                                    type="text"
                                    style={{ fontSize: '18px' }}
                                />
                                <div>
                                    <Title level={3} style={{ margin: 0, color: '#262626' }}>
                                        Thùng rác
                                    </Title>
                                    <Text type="secondary" style={{ fontSize: 13 }}>
                                        {filteredData.length > 0 
                                            ? `Đang có ${filteredData.length} luận văn trong thùng rác` 
                                            : "Thùng rác trống rỗng"
                                        }
                                    </Text>
                                </div>
                            </Space>
                        </Col>
                        
                        <Col>
                            <Input
                                placeholder="Tìm kiếm luận văn đã xóa..."
                                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                                allowClear
                                onChange={(e) => setSearchText(e.target.value)}
                                style={{ width: 300, borderRadius: 6 }}
                                size="large"
                            />
                        </Col>
                    </Row>

                    {/* Table Section */}
                    {filteredData.length > 0 ? (
                        <Table
                            columns={columns}
                            dataSource={filteredData}
                            rowKey="_id"
                            pagination={{ 
                                pageSize: 8, 
                                showTotal: (total) => `Tổng ${total} mục`,
                                position: ['bottomCenter']
                            }}
                            rowClassName="editable-row"
                        />
                    ) : (
                        // Empty State đẹp mắt
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                                <span style={{ color: '#999' }}>
                                    Không có luận văn nào trong thùng rác
                                </span>
                            }
                            style={{ margin: '50px 0' }}
                        >
                            <Button type="primary" onClick={() => navigate('/admin/thesis')}>
                                Quay về danh sách chính
                            </Button>
                        </Empty>
                    )}
                </LoadingComponent>
            </Card>
        </div>
    );
};

export default Recyclebin;
