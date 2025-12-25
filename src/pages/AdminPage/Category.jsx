import React from "react";
import { Space, Table, Input, Button, Form, Radio, Flex, Upload, Tag, Tooltip} from "antd";
import * as CategoryService from "../../services/CategoryService";
import ButtonComponent from "../../components/ButtonComponent/ButtonComponent";
import {
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    ExportOutlined,
    ImportOutlined,
    UploadOutlined,
    CheckOutlined,
    CloseOutlined,
    PlusCircleFilled,
} from "@ant-design/icons";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useRef } from "react";
// import { useMutationHook } from "../../hooks/useMutationHook";
import LoadingComponent from "../../components/LoadingComponent/LoadingComponent";
import ModalComponent from "../../components/ModalComponent/ModalComponent";
import DrawerComponent from "../../components/DrawerComponent/DrawerComponent";
import * as Message from "../../components/Message/Message";

const Category = () => {
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
    const [ pagination, setPagination ] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    // Query lấy toàn bộ danh mục 
    const queryGetAllCategories = useQuery({
        queryKey: ['getAllCategories'],
        queryFn: CategoryService.getCategories,
    });
    // Mutation thêm danh mục
    const mutationAddCategory = useMutation({
        mutationFn: CategoryService.addCategory,
        onSuccess: (data) => {
            Message.success(data.message || 'Thêm danh mục thành công');
            setIsOpenAdd(false);
            formCreate.resetFields();
            
        },
        onError: (error) => {
            Message.error(error.message || 'Lỗi khi thêm danh mục');
            console.error(error);
        },
    });
    // Mutation cập nhật danh mục
    const mutationUpdateCategory = useMutation({
        mutationFn: CategoryService.updateCategory,
        onSuccess: (data) => {
            Message.success(data?.message || 'Cập nhật danh mục thành công');
            queryGetAllCategories.refetch(); // Refetch data after updating
            setIsDrawerOpen(false);
            formUpdate.resetFields();
        },
        onError: (error) => {
            Message.error(error.message || 'Lỗi khi cập nhật danh mục');
        },
    });
    // Mutation xoá danh mục
    const mutationDeleteCategory = useMutation({
        mutationFn: CategoryService.deleteCategory,
        onSuccess: (data) => {
            Message.success(data.message || 'Xoá danh mục thành công');
            queryGetAllCategories.refetch(); // Refetch data after deleting
            setIsModalOpenDelete(false);
            
        },
        onError: (error) => {
            Message.error(error.message || 'Lỗi khi xoá danh mục');
            console.error(error);
        },
    });
    // Mutation xoá nhiều danh mục
    const mutationDeleteManyCategories = useMutation({
        mutationFn: CategoryService.deleteManyCategories,
        onSuccess: (data) => {
            Message.success(data.message || 'Xoá nhiều danh mục thành công');
            queryGetAllCategories.refetch(); // Refetch data after deleting
            setIsModalOpenDeleteMany(false);
            setSelectedRowKeys([]);
            
        },
        onError: (error) => {
            Message.error(error.message || 'Lỗi khi xoá nhiều danh mục');
            console.error(error);
        },
    });
    
    // Lấy data từ query
    const { data: response, isLoading } = queryGetAllCategories;
    // console.log('Categories data:', response);
    const categories = response?.data || [];

    // Hàm handle thêm 
    const handleAddCategory = () => {
        formCreate.validateFields()
            .then((values) => {
                const categoryData = {
                    name: values.name,
                    description: values.description,
                };
                mutationAddCategory.mutate(categoryData,
                    {
                        onSettled: () => {
                            
                            queryGetAllCategories.refetch(); // Refetch data after adding
                            setIsOpenAdd(false);
                            formCreate.resetFields(); // Reset form fields after adding
                        }
                    }
                );
            })
    };
    // Hàm handle xử lí xóa và refetch dữ liệu sau khi xóa
    const handleDeleteCategory = () => {
        mutationDeleteCategory.mutate(rowSelected,
            {
                onSettled: () => {
                    queryGetAllCategories.refetch(); // Refetch data after deleting
                }
            }
        );
    };
    // Hàm handle xử lí xóa nhiều danh mục
    const handleDeleteManyCategories = () => {
        mutationDeleteManyCategories.mutate({ ids: selectedRowKeys },
            {
                onSettled: () => {
                    setIsModalOpenDeleteMany(false);
                    formCreate.resetFields();
                    queryGetAllCategories.refetch(); // Refetch data after deleting
                }
            }
        );
        setSelectedRowKeys([]);
    };
    const handleCloseModalDelete = () => {
        setIsModalOpenDelete(false);
        setIsModalOpenDeleteMany(false);
    }
    const handleEditCategory = (record) => {
        const selectedCategory = categories.find((item) => item._id === record.key);
        if (selectedCategory) {
            formUpdate.setFieldsValue({
                name: selectedCategory.name,
                description: selectedCategory.description,
            });
            setRowSelected(selectedCategory);
            setIsDrawerOpen(true);
        }
    };
    const handleCloseAddCategory = () => {
        setIsOpenAdd(false);
        formCreate.resetFields();
    };
    const handleUpdateCategory = (values) => {
        const updatedCategory = {
            name: values.name,
            description: values.description,
        };
        mutationUpdateCategory.mutate({ id: rowSelected, data: updatedCategory },
            {
                onSettled: () => {
                    queryGetAllCategories.refetch(); // Refetch data after updating
                }
            }
        );
        console.log('Cập nhật danh mục:', rowSelected, updatedCategory);
    }

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={searchInput}
                    placeholder={`Tìm kiếm ${dataIndex}`}
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
    });
    // Hàm tìm kiếm
    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchColumn(dataIndex);
    };
    // Hàm reset tìm kiếm
    const handleReset = (clearFilters) => {
        clearFilters();
        setSearchText('');
    };
    const hasName = (text, record) => {
        return record.name.toLowerCase().includes(text.toLowerCase());
    }
    const hasDescription = (text, record) => {
        return record.description.toLowerCase().includes(text.toLowerCase());
    };

    // Cấu hình cột bảng
    const columns = [
        {
            title: 'STT',
            dataIndex: 'key',
            key: 'key',
            sorter: (a, b) => a.key - b.key,
            render: (text, record, index) => index + 1 + (pagination.current - 1) * pagination.pageSize,
        },
        {
            title: 'Tên khoa/viện',
            dataIndex: 'name',
            key: 'name',
            ...getColumnSearchProps('name'),
            filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />,
            onFilter: hasName,
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            ...getColumnSearchProps('description'),
            filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />,
            onFilter: hasDescription,
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="Sửa Khoa/Viện">
                        <Button
                            // Sử dụng type="text" để chỉ hiển thị icon
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => handleEditCategory(record)} // Giữ nguyên hàm xử lý Sửa
                        />
                    </Tooltip>
                    <Tooltip title="Xóa Khoa/Viện">
                        <Button 
                            type="default"
                            icon={<DeleteOutlined />}
                            danger
                            onClick={() => {
                                setRowSelected(record.key);
                                setIsModalOpenDelete(true);
                            }}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];
    const list = Array.isArray(categories) ? categories : [];
    const dataTable = list.map((item, index) => ({
    key: item._id,
    index: index + 1,
    name: item.name,
    description: item.description,
    }));
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
                    flex: "1 1 300px",
                    justifyContent: "flex-start",
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
                    Xoá tất cả
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

            <Flex
                gap="middle"
                style={{
                    flexWrap: "wrap",
                    flex: "1 1 300px",
                    justifyContent: "flex-end",
                }}
            >
            </Flex>
        </Flex>

        {/* Bảng danh mục */}
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
                    total: categories?.total || 0,
                    position: ["bottomCenter"],
                    showTotal: (total) => `Tổng ${total} khoa/viện`,
                    showSizeChanger: true,
                    pageSizeOptions: ["5", "8", "10", "20", "50"],
                    showQuickJumper: true,
                    onChange: (page, pageSize) => {
                        setPagination({ current: page, pageSize });
                    },
                }}
                onRow={(record) => ({
                    onClick: () => setRowSelected(record.key),
                })}
            />
        </LoadingComponent>

        {/* Modal thêm mới */}
        <ModalComponent
            title="Thêm mới danh mục"
            open={isOpenAdd}
            onOk={handleAddCategory}
            onCancel={handleCloseAddCategory}
            width={600}
            style={{ borderRadius: 0 }}
            confirmLoading={mutationAddCategory.isLoading} // Spinner khi nhấn OK
        >
            <Form
                name="formCreate"
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 18 }}
                style={{ maxWidth: 600, padding: "20px" }}
                autoComplete="off"
                form={formCreate}
            >
                <Form.Item
                    label="Tên "
                    name="name"
                    rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
                >
                    <Input placeholder="Nhập tên khoa/viện" />
                </Form.Item>
                <Form.Item label="Mô tả" name="description">
                    <Input.TextArea rows={4} placeholder="Nhập mô tả..." />
                </Form.Item>
            </Form>
        </ModalComponent>

        {/* Modal xóa 1 */}
        <ModalComponent
            title="Xoá khoa/viện"
            open={isModalOpenDelete}
            onOk={handleDeleteCategory}
            onCancel={handleCloseModalDelete}
            confirmLoading={mutationDeleteCategory.isLoading} // Spinner khi xoá
        >
            <p>Bạn có chắc chắn muốn <strong>xóa</strong> khoa/viện này không?</p>
        </ModalComponent>

        {/* Modal xóa nhiều */}
        <ModalComponent
            title="Xoá khoa/viện"
            open={isModalOpenDeleteMany}
            onOk={handleDeleteManyCategories}
            onCancel={handleCloseModalDelete}
            confirmLoading={mutationDeleteManyCategories.isLoading}
        >
            <p>Bạn có chắc chắn muốn <strong>xóa</strong> nhiều khoa/viện này không?</p>
        </ModalComponent>

        {/* Drawer sửa */}
        <DrawerComponent
            title="Chi tiết khoa/viện"
            placement="right"
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            width={window.innerWidth < 768 ? "100%" : 600}
        >
            <Form
                name="formUpdate"
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 18 }}
                style={{ maxWidth: 600, padding: "20px" }}
                onFinish={handleUpdateCategory}
                autoComplete="off"
                form={formUpdate}
            >
                <Form.Item
                    label="Tên khoa/viện"
                    name="name"
                    rules={[{ required: true, message: "Vui lòng nhập tên khoa/viện!" }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item label="Mô tả" name="description">
                    <Input.TextArea rows={4} placeholder="Nhập mô tả..." />
                </Form.Item>

                <Form.Item label={null} wrapperCol={{ offset: 20, span: 4 }}>
                    <Flex gap="middle">
                        <ButtonComponent
                            type="default"
                            onClick={() => setIsDrawerOpen(false)}
                        >
                            Huỷ
                        </ButtonComponent>
                        <ButtonComponent
                            type="primary"
                            htmlType="submit"
                            loading={mutationUpdateCategory.isLoading} // Spinner khi Lưu
                        >
                            Lưu
                        </ButtonComponent>
                    </Flex>
                </Form.Item>
            </Form>
        </DrawerComponent>
    </>
);

};
export default Category;
