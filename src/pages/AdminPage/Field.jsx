import React, { useState, useRef, useEffect } from "react";
import { Space, Table, Input, Button, Form, Flex, Tag, Select, Popconfirm, Tooltip } from "antd"; 
import * as FieldService from "../../services/FieldService"; // ✨ Đã đổi service chính
import ButtonComponent from "../../components/ButtonComponent/ButtonComponent";
import {
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    EyeOutlined,
    EyeInvisibleOutlined,
    PlusCircleFilled,
} from "@ant-design/icons";
import { useQuery, useMutation } from "@tanstack/react-query";
import LoadingComponent from "../../components/LoadingComponent/LoadingComponent";
import ModalComponent from "../../components/ModalComponent/ModalComponent";
import DrawerComponent from "../../components/DrawerComponent/DrawerComponent";
import * as Message from "../../components/Message/Message";
import { deleteComment } from "../../services/CommentService";

// ===========================================
// ✨ HÀM TIỆN ÍCH
// ===========================================

const sortData = (a, b) => {
    if (typeof a === 'number' && typeof b === 'number') {
        return a - b;
    }
    if (typeof a === 'string' && typeof b === 'string') {
        return a.localeCompare(b);
    }
    return 0;
};

const hasName = (text, record) => {
    return record.name?.toLowerCase().includes(text.toLowerCase());
};

// ===========================================
// ✨ COMPONENT FIELD
// ===========================================

const Field = () => {
    // Khởi tạo các state cần thiết
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [rowSelected, setRowSelected] = useState(null); 
    const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
    const [isModalOpenDeleteMany, setIsModalOpenDeleteMany] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isOpenAdd, setIsOpenAdd] = useState(false);
    const [formCreate] = Form.useForm();
    const [formUpdate] = Form.useForm();
    const [searchText, setSearchText] = useState("");
    const [searchedColumn, setSearchedColumn] = useState("");
    const searchInput = useRef(null);

    // Cấu hình chọn nhiều dòng
    const rowSelection = {
        selectedRowKeys,
        onChange: (selectedKeys, selectedRows) => {
            setSelectedRowKeys(selectedKeys);
        },
        type: "checkbox",
    };

    // Quản lí phân trang 
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    // Query lấy toàn bộ chủ đề (Field) 
    const queryGetAllFields = useQuery({
        queryKey: ['getAllFields'],
        queryFn: FieldService.getAllFields,
    });

    // Mutation thêm chủ đề
    const mutationAddField = useMutation({
        mutationFn: FieldService.addField,
        onSuccess: (data) => {
            Message.success(data.message || 'Thêm chủ đề thành công');
            queryGetAllFields.refetch();
            setIsOpenAdd(false);
            formCreate.resetFields();
        },
        onError: (error) => {
            Message.error(error.response?.data?.message || 'Lỗi khi thêm chủ đề');
        },
    });

    // Mutation cập nhật chủ đề
    const mutationUpdateField = useMutation({
        mutationFn: FieldService.updateField,
        onSuccess: (data) => {
            Message.success(data?.message || 'Cập nhật chủ đề thành công');
            queryGetAllFields.refetch();
            setIsDrawerOpen(false);
            formUpdate.resetFields();
            setRowSelected(null);
        },
        onError: (error) => {
            Message.error(error.response?.data?.message || 'Lỗi khi cập nhật chủ đề');
        },
    });

    // Mutation xoá chủ đề
    const mutationDeleteField = useMutation({
        mutationFn: FieldService.deleteField,
        onSuccess: (data) => {
            Message.success(data.message || 'Xoá chủ đề thành công');
            queryGetAllFields.refetch();
            setIsModalOpenDelete(false);
            setRowSelected(null);
            setSelectedRowKeys([]);
        },
        onError: (error) => {
            Message.error(error.response?.data?.message || 'Lỗi khi xoá chủ đề');
        },
    });

    // Mutation xoá nhiều chủ đề (Giả định có hàm deleteManyFields trong FieldService)
    const mutationDeleteManyFields = useMutation({
        mutationFn: FieldService.deleteManyFields, 
        onSuccess: (data) => {
            Message.success(data.message || 'Xoá nhiều chủ đề thành công');
            queryGetAllFields.refetch();
            setIsModalOpenDeleteMany(false);
            setSelectedRowKeys([]);
        },
        onError: (error) => {
            Message.error(error.response?.data?.message || 'Lỗi khi xoá nhiều chủ đề');
        },
    });

    // Lấy data từ query
    const { data: response, isLoading } = queryGetAllFields;
    const fields = response?.data || [];


    // Lấy chi tiết Field cho Drawer
    const getDetailsField = async (id) => {
        try {
            const res = await FieldService.getDetailField(id); 
            if (res?.data) {
                // Điền dữ liệu vào form cập nhật
                formUpdate.setFieldsValue({
                    name: res.data.name,
                });
            }
        } catch (error) {
            Message.error("Lỗi khi lấy chi tiết chủ đề");
        }
    };

    // Theo dõi rowSelected để mở Drawer và lấy chi tiết
    useEffect(() => {
        if (isDrawerOpen && rowSelected) {
            getDetailsField(rowSelected);
        }
    }, [isDrawerOpen, rowSelected]);

    // Hàm handle thêm 
    const handleAddField = () => {
        formCreate.validateFields()
            .then((values) => {
                const fieldData = {
                    name: values.name,
                };
                mutationAddField.mutate(fieldData);
            });
    };

    // Hàm handle xử lí xóa
    const handleDeleteField = () => {
        mutationDeleteField.mutate(rowSelected);
    };

    // Hàm handle xử lí xóa nhiều chủ đề
    const handleDeleteManyFields = () => {
        mutationDeleteManyFields.mutate({ ids: selectedRowKeys }); 
    };

    const handleCloseModalDelete = () => {
        setIsModalOpenDelete(false);
        setIsModalOpenDeleteMany(false);
        setRowSelected(null);
    }

    const handleEditField = (record) => {
        setRowSelected(record.key);
        setIsDrawerOpen(true);
    };

    const handleCloseAddField = () => {
        setIsOpenAdd(false);
        formCreate.resetFields();
    };

    const handleUpdateField = (values) => {
        const updatedField = {
            name: values.name,
        };
        
        if (rowSelected) {
            // Dùng cấu trúc { id, data } cho updateMutation
            mutationUpdateField.mutate({ 
                id: rowSelected, 
                data: updatedField 
            });
        } else {
            Message.error("Không tìm thấy ID chủ đề để cập nhật.");
        }
    };

    const getColumnSearchProps = (dataIndex, placeholderText) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={searchInput}
                    placeholder={`Tìm kiếm ${placeholderText}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => {
                        confirm();
                        setSearchText(selectedKeys[0]);
                    }}
                    style={{ marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        icon={<SearchOutlined />}
                        size="small"
                        onClick={() => {
                            confirm();
                            setSearchText(selectedKeys[0]);
                        }}
                        style={{ width: 90 }}
                    >
                        Tìm
                    </Button>
                    <Button
                        onClick={() => {
                            clearFilters();
                            setSearchText('');
                        }}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Xoá
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />,
        onFilter: (value, record) => record[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase()),
    });

    // Cấu hình cột bảng
    const columns = [
        {
            title: 'STT',
            dataIndex: 'index',
            key: 'index',
            width: 80,
            render: (text, record, index) => index + 1 + (pagination.current - 1) * pagination.pageSize,
        },
        {
            title: 'Tên chủ đề',
            dataIndex: 'name',
            key: 'name',
            ...getColumnSearchProps('name', 'Tên chủ đề'),
            onFilter: hasName,
            sorter: (a, b) => sortData(a.name, b.name),
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            render: (text) => text || '---',
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    
                    {/* 1. Nút Sửa (Edit) */}
                    <Tooltip title="Sửa chủ đề">
                        <Button
                            // Sử dụng type="text" để chỉ hiển thị icon
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => handleEditField(record)} // Giữ nguyên hàm xử lý Sửa
                        />
                    </Tooltip>

                    {/* 2. Nút Xóa (Delete) - Dùng Popconfirm */}
                    <Popconfirm
                        title="Xóa chủ đề"
                        description="Bạn có chắc chắn muốn xóa chủ đề này?"
                        onConfirm={() => {
                            // Xóa trực tiếp khi người dùng xác nhận
                            setRowSelected(record.key);
                            mutationDeleteField.mutate(record.key);
                        }}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Tooltip title="Xóa chủ đề">
                            <Button 
                                type="default" 
                                danger // Hiển thị màu đỏ
                                icon={<DeleteOutlined />}
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const list = Array.isArray(fields) ? fields : [];
    const dataTable = list.map((item, index) => ({
        key: item._id || item.id,
        index: index + 1,
        name: item.name,
        description: item.description || '---',
    }));

    // Xử lý thay đổi phân trang
    const handleTableChange = (newPagination) => {
        setPagination(newPagination);
    };

    return (
        <>
            {/* Thanh công cụ */}
            <Flex
                gap="middle"
                align="center"
                justify="space-between"
                style={{ marginBottom: "20px", flexWrap: "wrap" }}
            >
                <Flex
                    gap="middle"
                    style={{
                        flexWrap: "wrap",
                        justifyContent: "flex-end",
                    }}
                >
                    <ButtonComponent
                        size="small"
                        disabled={selectedRowKeys.length === 0}
                        icon={<DeleteOutlined />}
                        onClick={() => setIsModalOpenDeleteMany(true)}
                        danger
                        style={{ minWidth: "120px" }}
                    >
                        Xoá tất cả ({selectedRowKeys.length})
                    </ButtonComponent>
                    <ButtonComponent
                        size="small"
                        icon={<PlusCircleFilled />}
                        type="primary"
                        onClick={() => setIsOpenAdd(true)}
                        style={{ minWidth: "120px" }}
                    >
                        Thêm mới
                    </ButtonComponent>
                </Flex>
            </Flex>

            {/* Bảng chủ đề */}
            <LoadingComponent isLoading={isLoading}>
                <Table
                    rowSelection={rowSelection}
                    rowKey="key"
                    columns={columns}
                    scroll={{ x: "max-content" }}
                    dataSource={dataTable}
                    locale={{ emptyText: "Không có dữ liệu" }}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: dataTable.length,
                        position: ["bottomCenter"],
                        showTotal: (total) => `Tổng ${total} chủ đề`,
                        showSizeChanger: true,
                        pageSizeOptions: ["5", "8", "10", "20", "50"],
                        showQuickJumper: true,
                        onChange: handleTableChange,
                    }}
                    onRow={(record) => ({
                        onClick: () => setRowSelected(record.key),
                    })}
                />
            </LoadingComponent>

            {/* Modal thêm mới */}
            <ModalComponent
                title="Thêm mới chủ đề"
                open={isOpenAdd}
                onOk={handleAddField}
                onCancel={handleCloseAddField}
                width={600}
                confirmLoading={mutationAddField.isLoading}
            >
                <LoadingComponent isLoading={isLoading}>
                    <Form
                        name="formCreate"
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 18 }}
                        style={{ maxWidth: 600, padding: "20px" }}
                        autoComplete="off"
                        form={formCreate}
                    >
                        <Form.Item
                            label="Tên chủ đề"
                            name="name"
                            rules={[{ required: true, message: "Vui lòng nhập tên chủ đề!" }]}
                        >
                            <Input placeholder="Nhập tên chủ đề" />
                        </Form.Item>
                    </Form>
                </LoadingComponent>
            </ModalComponent>

            {/* Modal xóa 1 (Dùng Popconfirm ở Table) */}
            <ModalComponent
                title="Xoá chủ đề"
                open={isModalOpenDelete}
                onOk={handleDeleteField}
                onCancel={handleCloseModalDelete}
                confirmLoading={mutationDeleteField.isLoading}
            >
                <p>Bạn có chắc chắn muốn **xóa** chủ đề này không?</p>
            </ModalComponent>

            {/* Modal xóa nhiều */}
            <ModalComponent
                title="Xoá Nhiều chủ đề"
                open={isModalOpenDeleteMany}
                onOk={handleDeleteManyFields}
                onCancel={handleCloseModalDelete}
                confirmLoading={mutationDeleteManyFields.isLoading}
            >
                <p>Bạn có chắc chắn muốn **xóa** {selectedRowKeys.length} chủ đề đã chọn không?</p>
            </ModalComponent>

            {/* Drawer sửa */}
            <DrawerComponent
                title="Chi tiết chủ đề"
                placement="right"
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                width={window.innerWidth < 768 ? "100%" : 600}
            >
                <LoadingComponent isLoading={mutationUpdateField.isLoading || isLoading}>
                    <Form
                        name="formUpdate"
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 18 }}
                        style={{ maxWidth: 600, padding: "20px" }}
                        onFinish={handleUpdateField}
                        autoComplete="off"
                        form={formUpdate}
                    >
                        <Form.Item
                            label="Tên chủ đề"
                            name="name"
                            rules={[{ required: true, message: "Vui lòng nhập tên chủ đề!" }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item label={null} wrapperCol={{ offset: 20, span: 4 }}>
                            <Flex gap="middle" justify="flex-end">
                                <ButtonComponent
                                    type="default"
                                    onClick={() => setIsDrawerOpen(false)}
                                >
                                    Huỷ
                                </ButtonComponent>
                                <ButtonComponent
                                    type="primary"
                                    htmlType="submit"
                                    loading={mutationUpdateField.isLoading}
                                >
                                    Lưu
                                </ButtonComponent>
                            </Flex>
                        </Form.Item>
                    </Form>
                </LoadingComponent>
            </DrawerComponent>
        </>
    );
};
export default Field;