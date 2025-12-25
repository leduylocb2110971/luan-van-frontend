import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
    Table, Input, Button, Form, Radio, Tag, Space, Avatar, 
    Typography, Card, Modal, Row, Col, Select, Badge, Tooltip 
} from "antd";
import {
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    UnlockOutlined,
    LockOutlined,
    UserOutlined,
    ReloadOutlined,
    TeamOutlined,
    SolutionOutlined,
    ManOutlined,
    IdcardOutlined,
    MailOutlined
} from "@ant-design/icons";

import * as StudentService from "../../services/StudentService";
import * as AuthService from "../../services/AuthService";
import LoadingComponent from "../../components/LoadingComponent/LoadingComponent";
import DrawerComponent from "../../components/DrawerComponent/DrawerComponent";
import ActionsDropdownComponent from "../../components/ActionsDropdownComponent/ActionsDropdownComponent";
import UserDetailModal from "../../components/UserDetailModal/UserDetailModal";
import * as Message from "../../components/Message/Message";
import DefaultAvatar from "../../assets/default-avatar.jpg";
// Component này tự xử lý logic: Nếu ảnh lỗi -> Đổi sang DefaultAvatar
const UserAvatar = ({ avatarPath, defaultAvatar }) => {
    // 1. Xác định nguồn ảnh ban đầu
    const initialSrc = avatarPath 
        ? `${import.meta.env.VITE_API_URL}${avatarPath}` 
        : defaultAvatar;

    const [imgSrc, setImgSrc] = useState(initialSrc);

    // 2. Cập nhật lại state nếu props thay đổi (khi phân trang hoặc data đổi)
    useEffect(() => {
        setImgSrc(avatarPath 
            ? `${import.meta.env.VITE_API_URL}${avatarPath}` 
            : defaultAvatar
        );
    }, [avatarPath, defaultAvatar]);

    // 3. Hàm xử lý khi ảnh bị lỗi (404, mạng lag...)
    const handleError = () => {
        setImgSrc(defaultAvatar); // Chuyển sang ảnh mặc định
        return false; // Return false để ngăn Antd tự động chuyển sang icon mặc định
    };

    return (
        <Avatar 
            src={imgSrc} 
            onError={handleError}
            size={42}
            icon={<UserOutlined />}
            style={{ border: '1px solid #f0f0f0', flexShrink: 0 }}
        />
    );
};

const { Title, Text } = Typography;

const handleError = (e) => {
    e.target.src = DefaultAvatar;
    e.target.onError = null;
};

const Students = () => {
    // --- STATE ---
    const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
    const [isModalOpenDeleteMany, setIsModalOpenDeleteMany] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [rowSelected, setRowSelected] = useState(null);
    const [formUpdate] = Form.useForm();
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [isModalOpenDetail, setIsModalOpenDetail] = useState(false);
    const [selectedRole, setSelectedRole] = useState('all');
    
    // Pagination & Search
    const [pagination, setPagination] = useState({ current: 1, pageSize: 20 }); // Admin nên xem 20 dòng
    const [searchText, setSearchText] = useState("");

    // --- FETCH DATA ---
    const fetchStudents = async () => {
        const roleParam = selectedRole === 'all' ? undefined : selectedRole;
        return StudentService.getAllStudent({
            role: roleParam,
            page: pagination.current,
            limit: pagination.pageSize,
        });
    };

    const queryGetAllStudents = useQuery({
        queryKey: ["getAllStudents", selectedRole, pagination.current, pagination.pageSize],
        queryFn: fetchStudents,
    });

    const { data: responseStudents, isLoading } = queryGetAllStudents;
    const dataStudent = responseStudents?.data || [];

    // Filter Client-side (Optional: nếu API chưa hỗ trợ search text)
    const filteredData = dataStudent.filter(item => {
        if (!searchText) return true;
        return (
            item.name?.toLowerCase().includes(searchText.toLowerCase()) ||
            item.email?.toLowerCase().includes(searchText.toLowerCase()) ||
            item.mssv?.toLowerCase().includes(searchText.toLowerCase()) ||
            item.staffId?.toLowerCase().includes(searchText.toLowerCase())
        );
    });

    // --- MUTATIONS ---
    const mutationDeleteStudent = useMutation({
        mutationFn: (id) => StudentService.deleteStudent(id),
        onSuccess: (data) => {
            Message.success(data?.message || "Xóa thành công");
            queryGetAllStudents.refetch();
            setIsModalOpenDelete(false);
        },
        onError: (error) => Message.error(error?.response?.data?.message || "Xóa thất bại"),
    });

    const mutationDeleteManyStudents = useMutation({
        mutationFn: StudentService.deleteManyStudents,
        onSuccess: (data) => {
            Message.success(data?.message || "Xóa nhiều thành công");
            setSelectedRowKeys([]);
            setIsModalOpenDeleteMany(false);
            queryGetAllStudents.refetch();
        },
        onError: (error) => Message.error(error?.response?.data?.message || "Xóa nhiều thất bại"),
    });

    const mutationUpdateStudent = useMutation({
        mutationFn: ({ id, data }) => StudentService.updateStudent(id, data),
        onSuccess: (data) => {
            Message.success(data?.message || "Cập nhật thành công");
            setIsDrawerOpen(false);
            queryGetAllStudents.refetch();
        },
        onError: (error) => Message.error(error?.response?.data?.message || "Cập nhật thất bại"),
    });

    const mutationToggleUserStatus = useMutation({
        mutationFn: AuthService.toggleUserStatus,
        onSuccess: (data) => {
            Message.success(data?.message || "Cập nhật trạng thái thành công");
            queryGetAllStudents.refetch();
        },
        onError: (error) => Message.error(error?.response?.data?.message || "Lỗi cập nhật trạng thái"),
    });

    // --- HANDLERS ---
    const handleRoleChange = (e) => {
        setSelectedRole(e.target.value);
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    const handleEditStudent = async (id) => {
        const res = await StudentService.getStudentById(id);
        formUpdate.setFieldsValue({
            name: res.name,
            email: res.email,
            mssv: res.mssv,
            staffId: res.staffId,
            role: res.role,
        });
        setRowSelected(id);
        setIsDrawerOpen(true);
    };

    const handleOnUpdateUser = (values) => {
        mutationUpdateStudent.mutate({ id: rowSelected, data: values });
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
            title: "Thông tin người dùng",
            key: "user",
            width: 300,
            render: (_, record) => (
                <Space align="start">
                    {/* 🔥 SỬ DỤNG COMPONENT MỚI TẠI ĐÂY */}
                    <UserAvatar 
                        avatarPath={record.avatar} 
                        defaultAvatar={DefaultAvatar} 
                    />

                    <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 8 }}>
                        <Text strong style={{ fontSize: 14 }}>
                            {record.name || "Chưa cập nhật"}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            <MailOutlined style={{ marginRight: 4 }} /> 
                            {record.email}
                        </Text>
                    </div>
                </Space>
            ),
        },
        {
            title: "Vai trò",
            dataIndex: "role",
            key: "role",
            width: 120,
            render: (role) => {
                const map = {
                    student: { color: 'geekblue', icon: <TeamOutlined />, text: "Sinh viên" },
                    lecturer: { color: 'purple', icon: <SolutionOutlined />, text: "Giảng viên" },
                    admin: { color: 'red', icon: <LockOutlined />, text: "Admin" }
                };
                const info = map[role] || { color: 'default', text: role };
                return <Tag icon={info.icon} color={info.color}>{info.text}</Tag>;
            }
        },
        {
            title: "Mã định danh",
            key: "code",
            width: 150,
            render: (_, record) => {
                if (record.role === 'student') return <span><IdcardOutlined /> {record.mssv || <Text type="secondary" italic>Trống</Text>}</span>;
                if (record.role === 'lecturer') return <span><IdcardOutlined /> {record.staffId || <Text type="secondary" italic>Trống</Text>}</span>;
                return "-";
            }
        },
        {
            title: "Trạng thái",
            dataIndex: "isActive",
            key: "isActive",
            width: 120,
            render: (isActive) => (
                <Badge 
                    status={isActive ? "success" : "error"} 
                    text={isActive ? "Hoạt động" : "Đã khóa"} 
                />
            )
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
                        { label: "Chi tiết", icon: <UserOutlined />, onClick: () => { setRowSelected(record._id); setIsModalOpenDetail(true); } },
                        { label: "Sửa thông tin", icon: <EditOutlined />, onClick: () => handleEditStudent(record._id) },
                        { 
                            label: record.isActive ? <span style={{color: '#faad14'}}>Khóa tài khoản</span> : <span style={{color: '#52c41a'}}>Mở khóa</span>, 
                            icon: record.isActive ? <LockOutlined style={{color: '#faad14'}}/> : <UnlockOutlined style={{color: '#52c41a'}}/>, 
                            onClick: () => mutationToggleUserStatus.mutate(record._id) 
                        },
                        { 
                            label: <span style={{ color: 'red' }}>Xóa vĩnh viễn</span>, 
                            icon: <DeleteOutlined style={{ color: 'red' }} />, 
                            onClick: () => { setRowSelected(record._id); setIsModalOpenDelete(true); }
                        }
                    ]} 
                />
            ),
        },
    ];

    const rowSelection = {
        selectedRowKeys,
        onChange: (keys) => setSelectedRowKeys(keys),
    };

    return (
        <div>
            {/* HEADER */}
            <div>
                <Title level={2} style={{ margin: 0 }}>Quản Lý Tài Khoản</Title>
            </div>

            <Card variant={false} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                {/* TOOLBAR */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
                    <Space size="middle">
                        <Input.Search 
                            placeholder="Tìm tên, email, mssv..." 
                            allowClear 
                            onSearch={() => setPagination({ ...pagination, current: 1 })} // Trigger reload if API supported
                            onChange={(e) => setSearchText(e.target.value)}
                            style={{ width: 300 }}
                            enterButton={<SearchOutlined />}
                        />
                        <Radio.Group onChange={handleRoleChange} value={selectedRole} buttonStyle="solid">
                            <Radio.Button value="all">Tất cả</Radio.Button>
                            <Radio.Button value="student">Sinh viên</Radio.Button>
                            <Radio.Button value="lecturer">Giảng viên</Radio.Button>
                        </Radio.Group>
                        <Tooltip title="Làm mới dữ liệu">
                            <Button icon={<ReloadOutlined />} onClick={() => queryGetAllStudents.refetch()} />
                        </Tooltip>
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
                        dataSource={filteredData.map(item => ({ ...item, key: item._id }))}
                        bordered
                        size="small" // Mật độ hiển thị cao cho Admin
                        pagination={{
                            ...pagination,
                            total: responseStudents?.total || 0,
                            showTotal: (total) => `Tổng ${total} tài khoản`,
                            onChange: (page, pageSize) => setPagination({ ...pagination, current: page, pageSize }),
                            showSizeChanger: true,
                            pageSizeOptions: ['20', '50', '100']
                        }}
                        scroll={{ x: 1000, y: 'calc(100vh - 300px)' }}
                    />
                </LoadingComponent>
            </Card>

            {/* --- MODALS --- */}
            <UserDetailModal
                isOpen={isModalOpenDetail}
                onClose={() => setIsModalOpenDetail(false)}
                userData={dataStudent.find(user => user._id === rowSelected)}
                isLoading={isLoading}
            />

            <Modal
                title="Cảnh báo xóa dữ liệu"
                open={isModalOpenDelete}
                onOk={() => mutationDeleteStudent.mutate(rowSelected)}
                onCancel={() => setIsModalOpenDelete(false)}
                okText="Xóa"
                okButtonProps={{ danger: true, loading: mutationDeleteStudent.isPending }}
            >
                <p>Bạn có chắc chắn muốn xóa tài khoản này không? Hành động này không thể hoàn tác.</p>
            </Modal>

            <Modal
                title={`Xóa ${selectedRowKeys.length} tài khoản?`}
                open={isModalOpenDeleteMany}
                onOk={() => mutationDeleteManyStudents.mutate({ ids: selectedRowKeys })}
                onCancel={() => setIsModalOpenDeleteMany(false)}
                okText="Xóa tất cả"
                okButtonProps={{ danger: true, loading: mutationDeleteManyStudents.isPending }}
            >
                <p>Hành động này sẽ xóa vĩnh viễn các tài khoản đã chọn.</p>
            </Modal>

            {/* --- DRAWER UPDATE --- */}
            <DrawerComponent
                title="Cập nhật thông tin người dùng"
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                width={600}
            >
                <Form form={formUpdate} layout="vertical" onFinish={handleOnUpdateUser}>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item name="name" label="Họ và tên" rules={[{ required: true }]}>
                                <Input prefix={<UserOutlined />} />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                                <Input prefix={<MailOutlined />} />
                            </Form.Item>
                        </Col>
                        
                        <Col span={12}>
                            <Form.Item name="role" label="Vai trò" rules={[{ required: true }]}>
                                <Select options={[
                                    { label: 'Sinh viên', value: 'student' },
                                    { label: 'Giảng viên', value: 'lecturer' },
                                    { label: 'Admin', value: 'admin' },
                                ]} />
                            </Form.Item>
                        </Col>

                        {/* Dynamic Field rendering */}
                        <Form.Item noStyle shouldUpdate={(prev, curr) => prev.role !== curr.role}>
                            {({ getFieldValue }) => {
                                const role = getFieldValue('role');
                                if (role === 'student') {
                                    return (
                                        <Col span={12}>
                                            <Form.Item name="mssv" label="Mã số sinh viên" rules={[{ required: true }]}>
                                                <Input prefix={<IdcardOutlined />} />
                                            </Form.Item>
                                        </Col>
                                    );
                                }
                                if (role === 'lecturer') {
                                    return (
                                        <Col span={12}>
                                            <Form.Item name="staffId" label="Mã giảng viên" rules={[{ required: true }]}>
                                                <Input prefix={<IdcardOutlined />} />
                                            </Form.Item>
                                        </Col>
                                    );
                                }
                                return null;
                            }}
                        </Form.Item>
                    </Row>
                    
                    <div style={{ marginTop: 24, textAlign: 'right' }}>
                        <Button onClick={() => setIsDrawerOpen(false)} style={{ marginRight: 8 }}>Hủy</Button>
                        <Button type="primary" htmlType="submit" loading={mutationUpdateStudent.isPending}>Lưu thay đổi</Button>
                    </div>
                </Form>
            </DrawerComponent>
        </div>
    );
};

export default Students;