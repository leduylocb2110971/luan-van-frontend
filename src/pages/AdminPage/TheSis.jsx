import React, { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { 
    Table, Input, Button, Form, Radio, Upload, Select, 
    Typography, Row, Col, Modal, Space, Tag, Image, Divider, Tooltip
} from "antd";
import {
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    UploadOutlined,
    EyeOutlined,
    ReloadOutlined,
    PaperClipOutlined,
    RestOutlined,
} from "@ant-design/icons";

// COMPONENTS & SERVICES
import LoadingComponent from "../../components/LoadingComponent/LoadingComponent";
import DrawerComponent from "../../components/DrawerComponent/DrawerComponent";
import ActionsDropdownComponent from "../../components/ActionsDropdownComponent/ActionsDropdownComponent";
import ThesisDefaultComponent from "../../components/ThesisDetailComponent/ThesisDetailComponent";
import * as Message from "../../components/Message/Message";
import * as TheSisService from "../../services/TheSisService";
import * as CategoryService from "../../services/CategoryService";
import * as MajorService from "../../services/MajorService";
import * as FieldService from "../../services/FieldService";

const { Text, Link } = Typography;

const TheSis = () => {
    const navigate = useNavigate();
    const [formUpdate] = Form.useForm();
    
    // STATE
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedKey, setSelectedKey] = useState(null);
    const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
    const [isModalOpenDeleteMany, setIsModalOpenDeleteMany] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [rowSelected, setRowSelected] = useState(null);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [currentDetail, setCurrentDetail] = useState(null); // Lưu thông tin chi tiết để hiển thị trong Drawer

    // PAGINATION
    const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });

    // --- FETCH DATA ---
    const queryGetAllTheSis = useQuery({
        queryKey: ['getAllTheSis'],
        queryFn: TheSisService.getAllThesisAdmin,
    });
    const { data: responseThesis, isLoading: isLoadingGetAllTheSis, refetch } = queryGetAllTheSis;
    const theSisData = responseThesis?.data || [];

    // --- MASTER DATA ---
    const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: CategoryService.getCategories });
    const { data: majors } = useQuery({ queryKey: ['majors'], queryFn: MajorService.getAllMajors });
    const { data: fields } = useQuery({ queryKey: ['fields'], queryFn: FieldService.getAllFields });

    const categoriesData = categories?.data || [];
    const majorsData = majors?.data || [];
    const fieldsData = fields?.data || [];

    // --- FILTER LOGIC (Client-side Search Text Only - Column filters handled by Table) ---
    const filteredThesis = theSisData.filter((thesis) => {
        return searchText 
            ? (thesis.title?.toLowerCase().includes(searchText.toLowerCase()) || 
               thesis.authorName?.toLowerCase().includes(searchText.toLowerCase()))
            : true;
    });

    // --- MUTATIONS ---
    const mutationDeleteTheSis = useMutation({
        // Xóa mềm
        mutationFn: TheSisService.softDeleteTheSis,
        onSuccess: () => {
            Message.success("Xóa thành công");
            refetch();
            setIsModalOpenDelete(false);
            setRowSelected(null);
        },
        onError: () => Message.error("Xóa thất bại"),
    });

    const mutationDeleteManyTheSis = useMutation({
        mutationFn: TheSisService.deleteManyTheSis,
        onSuccess: () => {
            Message.success("Xóa nhiều thành công");
            refetch();
            setIsModalOpenDeleteMany(false);
            setSelectedRowKeys([]);
        },
        onError: () => Message.error("Xóa nhiều thất bại"),
    });

    const mutationUpdateTheSis = useMutation({
        mutationFn: TheSisService.updateTheSis,
        onSuccess: () => {
            Message.success("Cập nhật thành công");
            refetch();
            setIsDrawerOpen(false);
            formUpdate.resetFields();
            setCurrentDetail(null);
        },
        onError: () => Message.error("Cập nhật thất bại"),
    });

    // --- HANDLERS ---
    const handleEditTheSis = (record) => {
        setRowSelected(record._id);
        setCurrentDetail(record); // Lưu record hiện tại để hiển thị file/ảnh cũ
        formUpdate.setFieldsValue({
            title: record.title,
            category: record.category?._id,
            year: record.year,
            major: record.major?._id,
            field: record.field?._id,
            authorName: record.authorName,
            supervisorName: record.supervisorName,
            status: record.status,
            accessMode: record.accessMode,
        });
        setIsDrawerOpen(true);
    };

    const handleUpdateTheSis = (values) => {
        const formData = new FormData();
        Object.keys(values).forEach(key => {
            if (key === 'fileUrl' && values.fileUrl?.file) formData.append("fileUrl", values.fileUrl.file);
            else if (key === 'thumbnail' && values.thumbnail?.file) formData.append("thumbnail", values.thumbnail.file);
            else if (values[key] !== undefined && values[key] !== null) formData.append(key, values[key]);
        });
        mutationUpdateTheSis.mutate({ id: rowSelected, data: formData });
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: (keys) => setSelectedRowKeys(keys),
    };

    // --- COLUMNS CONFIG ---
    const columns = [
        {
            title: "STT",
            key: "index",
            width: 50,
            align: 'center',
            render: (_, __, index) => index + 1 + (pagination.current - 1) * pagination.pageSize,
        },
        {
            title: "Thông tin Luận văn",
            dataIndex: "title",
            key: "title",
            width: 350,
            render: (text, record) => (
                <div>
                    <a onClick={() => { setSelectedKey(record._id); setModalVisible(true); }} style={{ fontWeight: 600, color: '#1677ff', display: 'block', marginBottom: 4 }}>
                        {text}
                    </a>
                    <Space size="small" style={{ fontSize: 12, color: '#666' }}>
                        <Tag style={{margin:0}}>{record.year}</Tag>
                    </Space>
                </div>
            ),
            sorter: (a, b) => a.title?.localeCompare(b.title),
        },
        {
            title: "Nhân sự",
            key: "personnel",
            width: 220,
            render: (_, record) => (
                <div style={{ fontSize: 13 }}>
                    <div>SV: <strong>{record.authorName}</strong></div>
                    <div style={{ color: '#888' }}>GV: {record.supervisorName}</div>
                </div>
            )
        },
        {
            title: "Khoa / Viện",
            dataIndex: ["category", "name"],
            key: "category",
            width: 180,
            // 🚀 CẢI TIẾN: Filter trực tiếp trên cột
            filters: categoriesData.map(c => ({ text: c.name, value: c.name })),
            onFilter: (value, record) => record.category?.name === value,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 130,
            filters: [
                { text: 'Chờ duyệt', value: 'pending_public' },
                { text: 'Đã duyệt', value: 'approved_public' },
                { text: 'Từ chối', value: 'rejected_public' },
                { text: 'Nháp', value: 'draft' },
            ],
            onFilter: (value, record) => record.status === value,
            render: (status) => {
                const map = {
                    approved_public: { color: "success", text: "Đã duyệt" },
                    rejected_public: { color: "error", text: "Từ chối" },
                    pending_public: { color: "warning", text: "Chờ duyệt" },
                    draft: { color: "default", text: "Nháp" },
                    submitted_internal: { color: "processing", text: "Nội bộ" },
                };
                return <Tag color={map[status]?.color} style={{ minWidth: 80, textAlign: 'center' }}>{map[status]?.text || status}</Tag>;
            }
        },
        {
            title: "Thao tác",
            key: "action",
            width: 80,
            align: 'center',
            fixed: 'right',
            render: (_, record) => (
                <ActionsDropdownComponent 
                    items={[
                        { label: "Xem chi tiết", icon: <EyeOutlined />, onClick: () => { setSelectedKey(record._id); setModalVisible(true); } },
                        { label: "Chỉnh sửa", icon: <EditOutlined />, onClick: () => handleEditTheSis(record) },
                        { label: <span style={{color: 'red'}}>Xóa</span>, icon: <DeleteOutlined style={{color: 'red'}}/>, onClick: () => { setRowSelected(record._id); setIsModalOpenDelete(true); } }
                    ]} 
                />
            ),
        },
    ];

    return (
        <div style={{ padding: '20px' }}>
            {/* TOOLBAR */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Space>
                    <Input 
                        placeholder="Tìm theo tên bài, sinh viên..." 
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />} 
                        onChange={e => setSearchText(e.target.value)}
                        style={{ width: 300 }}
                        allowClear
                    />
                    <Button icon={<ReloadOutlined />} onClick={() => refetch()}>Tải lại</Button>
                </Space>

                <Space size="middle"> {/* Tăng khoảng cách giữa các nút một chút */}
                    
                    {/* Nút Thùng rác NÂNG CẤP */}
                    <Tooltip title="Thùng rác / Khôi phục">
                        {/* Badge: Hiển thị chấm đỏ (count) nếu bạn muốn xịn hơn */}
                        {/* Nếu chưa có biến countDeleted thì bỏ Badge đi, dùng Button thôi */}
                        <Button 
                            onClick={() => navigate('/admin/recyclebin')} 
                            icon={<RestOutlined style={{ fontSize: '20px' }} />} // Icon to hơn xíu cho dễ bấm
                            style={{ 
                                border: '1px dashed #d9d9d9', // Viền nét đứt tạo cảm giác "khu vực chứa"
                                color: '#666' 
                            }}
                        >
                            Thùng rác
                        </Button>
                    </Tooltip>

                    {selectedRowKeys.length > 0 && (
                        <Button 
                            type="primary" 
                            danger 
                            icon={<DeleteOutlined />} 
                            onClick={() => setIsModalOpenDeleteMany(true)}
                            style={{ boxShadow: '0 2px 0 rgba(255, 77, 79, 0.2)' }} // Đổ bóng nhẹ cho nút xóa
                        >
                            Xóa đã chọn ({selectedRowKeys.length})
                        </Button>
                    )}
                </Space>
            </div>

            {/* TABLE */}
            <LoadingComponent isLoading={isLoadingGetAllTheSis}>
                <Table
                    rowSelection={rowSelection}
                    columns={columns}
                    dataSource={filteredThesis.map(item => ({ ...item, key: item._id }))}
                    bordered
                    size="small"
                    scroll={{ x: 1100, y: 'calc(100vh - 250px)' }} // Tự động co giãn theo chiều cao màn hình
                    pagination={{
                        ...pagination,
                        total: filteredThesis.length,
                        showTotal: (total) => <b>Tổng: {total}</b>,
                        showSizeChanger: true,
                        pageSizeOptions: ['20', '50', '100'],
                        onChange: (page, pageSize) => setPagination({ current: page, pageSize })
                    }}
                />
            </LoadingComponent>

            {/* MODALS */}
            <ThesisDefaultComponent visible={modalVisible} onClose={() => setModalVisible(false)} selectedKey={selectedKey} />

            <Modal
                title="Cảnh báo xóa"
                open={isModalOpenDelete}
                onOk={() => mutationDeleteTheSis.mutate(rowSelected)}
                onCancel={() => setIsModalOpenDelete(false)}
                okText="Xóa"
                okButtonProps={{ danger: true, loading: mutationDeleteTheSis.isPending }}
            >
                Bạn có chắc chắn muốn xóa luận văn này không?
            </Modal>

            <Modal
                title={`Xóa ${selectedRowKeys.length} luận văn?`}
                open={isModalOpenDeleteMany}
                onOk={() => mutationDeleteManyTheSis.mutate({ ids: selectedRowKeys })}
                onCancel={() => setIsModalOpenDeleteMany(false)}
                okText="Xóa tất cả"
                okButtonProps={{ danger: true, loading: mutationDeleteManyTheSis.isPending }}
            >
                Hành động này không thể hoàn tác.
            </Modal>

            {/* DRAWER UPDATE (CẢI TIẾN HIỂN THỊ FILE CŨ) */}
            <DrawerComponent
                title="Cập nhật Luận văn"
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                width={720}
            >
                <Form form={formUpdate} layout="vertical" onFinish={handleUpdateTheSis}>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item name="title" label="Tiêu đề" rules={[{ required: true }]}>
                                <Input.TextArea rows={2} />
                            </Form.Item>
                        </Col>
                        <Col span={8}><Form.Item name="authorName" label="Sinh viên"><Input /></Form.Item></Col>
                        <Col span={8}><Form.Item name="supervisorName" label="GVHD"><Input /></Form.Item></Col>
                        <Col span={8}><Form.Item name="year" label="Năm"><Input type="number" /></Form.Item></Col>
                        
                        
                        <Col span={8}>
                            <Form.Item name="category" label="Khoa">
                                <Select options={categoriesData.map(c => ({ label: c.name, value: c._id }))} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="major" label="Ngành">
                                <Select options={majorsData.map(m => ({ label: m.name, value: m._id }))} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="field" label="Chủ đề">
                                <Select options={fieldsData.map(f => ({ label: f.name, value: f._id }))} />
                            </Form.Item>
                            
                        </Col>

                        <Col span={12}>
                            <Form.Item name="status" label="Trạng thái">
                                <Select options={[
                                    { label: 'Chờ duyệt', value: 'pending_public' },
                                    { label: 'Đã duyệt', value: 'approved_public' },
                                    { label: 'Từ chối', value: 'rejected_public' },
                                    { label: 'Nháp', value: 'draft' },
                                ]} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="accessMode" label="Quyền truy cập">
                                <Select options={[
                                    { label: 'Công khai', value: 'public_full' },
                                    { label: 'Tóm tắt', value: 'abstract_only' },
                                    { label: 'Nội bộ', value: 'department_only' },
                                    { label: 'Riêng tư', value: 'private' },
                                ]} />
                            </Form.Item>
                        </Col>

                        <Divider style={{ margin: '12px 0' }} />

                        {/* 🚀 CẢI TIẾN: HIỂN THỊ FILE & ẢNH HIỆN TẠI */}
                        <Col span={12}>
                            <div style={{ marginBottom: 8 }}>
                                <Text strong>File tài liệu hiện tại:</Text><br/>
                                {currentDetail?.fileUrl ? (
                                    <a href={`${import.meta.env.VITE_API_URL}${currentDetail.fileUrl}`} target="_blank" rel="noopener noreferrer">
                                        <PaperClipOutlined /> Xem tài liệu cũ
                                    </a>
                                ) : <Text type="secondary" italic>Chưa có file</Text>}
                            </div>
                            <Form.Item name="fileUrl" label="Thay đổi File (nếu cần)">
                                <Upload beforeUpload={() => false} maxCount={1}>
                                    <Button icon={<UploadOutlined />}>Chọn file mới</Button>
                                </Upload>
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <div style={{ marginBottom: 8 }}>
                                <Text strong>Ảnh bìa hiện tại:</Text><br/>
                                {currentDetail?.thumbnail ? (
                                    <Image src={`${import.meta.env.VITE_API_URL}${currentDetail.thumbnail}`} width={80} />
                                ) : <Text type="secondary" italic>Chưa có ảnh</Text>}
                            </div>
                            <Form.Item name="thumbnail" label="Thay đổi Ảnh bìa">
                                <Upload beforeUpload={() => false} maxCount={1} listType="picture">
                                    <Button icon={<UploadOutlined />}>Chọn ảnh mới</Button>
                                </Upload>
                            </Form.Item>
                        </Col>
                    </Row>
                    <div style={{ textAlign: 'right', marginTop: 16 }}>
                        <Button onClick={() => setIsDrawerOpen(false)} style={{ marginRight: 8 }}>Hủy</Button>
                        <Button type="primary" htmlType="submit" loading={mutationUpdateTheSis.isPending}>Lưu</Button>
                    </div>
                </Form>
            </DrawerComponent>
        </div>
    );
};

export default TheSis;