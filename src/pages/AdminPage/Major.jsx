import React, { useState, useRef, useEffect } from "react";
// ✨ Cập nhật Import: Thêm Select
import { Space, Table, Input, Button, Form, Radio, Flex, Upload, Tag, Select, Tooltip } from "antd"; 
import * as MajorService from "../../services/MajorService";
import * as CategoryService from "../../services/CategoryService";
import ButtonComponent from "../../components/ButtonComponent/ButtonComponent";
import {
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    ExportOutlined,
    ImportOutlined,
    PlusCircleFilled,
} from "@ant-design/icons";
import { useQuery, useMutation } from "@tanstack/react-query";
import LoadingComponent from "../../components/LoadingComponent/LoadingComponent";
import ModalComponent from "../../components/ModalComponent/ModalComponent";
import DrawerComponent from "../../components/DrawerComponent/DrawerComponent";
import * as Message from "../../components/Message/Message";

// ===========================================
// ✨ HÀM TIỆN ÍCH
// ===========================================

// Hàm so sánh cho sorter (Sắp xếp theo số hoặc chuỗi)
const sortData = (a, b) => {
    if (typeof a === 'number' && typeof b === 'number') {
        return a - b;
    }
    if (typeof a === 'string' && typeof b === 'string') {
        return a.localeCompare(b);
    }
    return 0;
};

// Hàm tìm kiếm theo Tên
const hasName = (text, record) => {
    return record.name?.toLowerCase().includes(text.toLowerCase());
};

// ===========================================
// ✨ COMPONENT MAJOR
// ===========================================

const Major = () => {
    // Khởi tạo các state cần thiết
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [rowSelected, setRowSelected] = useState(null); // Lưu ID của Major
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

    // Query lấy toàn bộ Ngành học 
    const queryGetAllMajors = useQuery({
        queryKey: ['getAllMajors'],
        queryFn: MajorService.getAllMajors,
    });
    
    // Query lấy toàn bộ Danh mục
    const queryGetAllCategories = useQuery({
        queryKey: ['getAllCategories'],
        queryFn: CategoryService.getCategories,
    });

    // Mutation thêm Ngành học
    const mutationAddMajor = useMutation({
        mutationFn: MajorService.addMajor,
        onSuccess: (data) => {
            Message.success(data.message || 'Thêm ngành học thành công');
            queryGetAllMajors.refetch();
            setIsOpenAdd(false);
            formCreate.resetFields();
        },
        onError: (error) => {
            Message.error(error.response?.data?.message || 'Lỗi khi thêm ngành học');
        },
    });

    // Mutation cập nhật Ngành học
    const mutationUpdateMajor = useMutation({
        mutationFn: MajorService.updateMajor,
        onSuccess: (data) => {
            Message.success(data?.message || 'Cập nhật ngành học thành công');
            queryGetAllMajors.refetch();
            setIsDrawerOpen(false);
            formUpdate.resetFields();
            setRowSelected(null);
        },
        onError: (error) => {
            Message.error(error.response?.data?.message || 'Lỗi khi cập nhật ngành học');
        },
    });

    // Mutation xoá Ngành học
    const mutationDeleteMajor = useMutation({
        mutationFn: MajorService.deleteMajor,
        onSuccess: (data) => {
            Message.success(data.message || 'Xoá ngành học thành công');
            queryGetAllMajors.refetch();
            setIsModalOpenDelete(false);
            setRowSelected(null);
            setSelectedRowKeys([]);
        },
        onError: (error) => {
            Message.error(error.response?.data?.message || 'Lỗi khi xoá ngành học');
        },
    });

    // Mutation xoá nhiều Ngành học
    const mutationDeleteManyMajors = useMutation({
        mutationFn: MajorService.deleteManyMajors,
        onSuccess: (data) => {
            Message.success(data.message || 'Xoá nhiều ngành học thành công');
            queryGetAllMajors.refetch();
            setIsModalOpenDeleteMany(false);
            setSelectedRowKeys([]);
        },
        onError: (error) => {
            Message.error(error.response?.data?.message || 'Lỗi khi xoá nhiều ngành học');
        },
    });

    // Lấy data từ query
    const { data: response, isLoading } = queryGetAllMajors;
    const majors = response?.data || [];
    const categories = queryGetAllCategories.data?.data || [];
    const isLoadingCategories = queryGetAllCategories.isLoading;


    // Lấy chi tiết Major cho Drawer
    const getDetailsMajor = async (id) => {
        try {
            // Lưu ý: Nếu tên hàm trong MajorService là getDetailsMajor, bạn nên sửa lại là getDetailsMajor
            const res = await MajorService.getDetailMajor(id); 
            if (res?.data) {
                // Điền dữ liệu vào form cập nhật
                formUpdate.setFieldsValue({
                    name: res.data.name,
                    // ✨ FIX LỖI QUAN TRỌNG: Chỉ lấy ID của Category nếu nó là một Object đã được populate
                    // Nếu res.data.category là một object: { _id: '...', name: '...' }, ta phải lấy ._id
                    // Nếu res.data.category là chuỗi ID: res.data.category, thì không cần thay đổi
                    category: res.data.category?._id || res.data.category, // <--- ĐÃ SỬA LỖI
                });
            }
        } catch (error) {
            Message.error("Lỗi khi lấy chi tiết ngành học");
        }
    };

    // Theo dõi rowSelected để mở Drawer và lấy chi tiết
    useEffect(() => {
        if (isDrawerOpen && rowSelected) {
            getDetailsMajor(rowSelected);
        }
    }, [isDrawerOpen, rowSelected]);

    // Hàm handle thêm 
    const handleAddMajor = () => {
        formCreate.validateFields()
            .then((values) => {
                const majorData = {
                    name: values.name,
                    category: values.category, // ✨ Cập nhật: Thêm category
                };
                mutationAddMajor.mutate(majorData);
            });
    };

    // Hàm handle xử lí xóa
    const handleDeleteMajor = () => {
        // rowSelected đang chứa ID của Major cần xóa
        mutationDeleteMajor.mutate(rowSelected);
    };

    // Hàm handle xử lí xóa nhiều Ngành học
    const handleDeleteManyMajors = () => {
        mutationDeleteManyMajors.mutate({ ids: selectedRowKeys }); // Giả định API cần object { ids: [...] }
    };

    const handleCloseModalDelete = () => {
        setIsModalOpenDelete(false);
        setIsModalOpenDeleteMany(false);
        setRowSelected(null);
    }

    const handleEditMajor = (record) => {
        // Record.key chính là ID của major
        setRowSelected(record.key);
        setIsDrawerOpen(true);
    };

    const handleCloseAddMajor = () => {
        setIsOpenAdd(false);
        formCreate.resetFields();
    };

    const handleUpdateMajor = (values) => {
        const updatedMajor = {
            name: values.name,
            category: values.category,
        };
        
        // rowSelected phải là chuỗi ID hợp lệ
        if (rowSelected) {
            mutationUpdateMajor.mutate({ 
                id: rowSelected, // <-- Đây là ID Major (string)
                data: updatedMajor 
            });
        } else {
            Message.error("Không tìm thấy ID Ngành học để cập nhật.");
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
        onFilter: (value, record) => record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    });

    // Hàm tìm tên Category dựa trên ID (nếu Major trả về category ID)
    const getCategoryName = (categoryIdOrObject) => {
        // Nếu API trả về object Category đã populate
        const categoryId = typeof categoryIdOrObject === 'object' && categoryIdOrObject !== null 
            ? categoryIdOrObject._id || categoryIdOrObject.id 
            : categoryIdOrObject;

        const category = categories.find(cat => cat._id === categoryId || cat.id === categoryId);
        return category ? category.name : 'N/A';
    };

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
            title: 'Tên Ngành học',
            dataIndex: 'name',
            key: 'name',
            ...getColumnSearchProps('name', 'Tên ngành'),
            onFilter: hasName,
            sorter: (a, b) => sortData(a.name, b.name),
        },
        // ✨ Cập nhật: Thêm cột Category
        {
            title: 'Thuộc nhóm ngành',
            dataIndex: 'category',
            key: 'category',
            // Render: truyền object (hoặc ID) vào hàm để lấy tên hiển thị
            render: (text) => getCategoryName(text), 
            // Sorter: có thể gây lỗi nếu so sánh object, ta sẽ so sánh theo tên category nếu cần
            // Để đơn giản, nếu Category là ID thì giữ nguyên sorter.
            sorter: (a, b) => sortData(getCategoryName(a.category), getCategoryName(b.category)),
        },
        // Thêm các cột khác nếu cần (Ví dụ: Code, Description)
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="Sửa chuyên ngành">
                        <Button
                            // Sử dụng type="text" để chỉ hiển thị icon
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => handleEditMajor(record)} // Giữ nguyên hàm xử lý Sửa
                        />
                    </Tooltip>
                    <Tooltip title="Xóa chuyên ngành">
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

    const list = Array.isArray(majors) ? majors : [];
    const dataTable = list.map((item, index) => ({
        key: item._id || item.id, // Sử dụng id hoặc _id tùy theo backend
        index: index + 1,
        name: item.name,
        category: item.category, // ✨ Giữ nguyên object/ID mà API trả về
    }));

    // Xử lý thay đổi phân trang
    const handleTableChange = (newPagination) => {
        setPagination(newPagination);
        // Nếu dùng API phân trang, cần gọi lại queryGetAllMajors với tham số page/limit ở đây
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

            {/* Bảng Ngành học */}
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
                        total: dataTable.length, // Cần thay đổi nếu dùng API phân trang
                        position: ["bottomCenter"],
                        showTotal: (total) => `Tổng ${total} ngành học`,
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
                title="Thêm mới Ngành học"
                open={isOpenAdd}
                onOk={handleAddMajor}
                onCancel={handleCloseAddMajor}
                width={600}
                style={{ borderRadius: 0 }}
                confirmLoading={mutationAddMajor.isLoading}
            >
                <LoadingComponent isLoading={isLoadingCategories}>
                    <Form
                        name="formCreate"
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 18 }}
                        style={{ maxWidth: 600, padding: "20px" }}
                        autoComplete="off"
                        form={formCreate}
                    >
                        <Form.Item
                            label="Tên Ngành học"
                            name="name"
                            rules={[{ required: true, message: "Vui lòng nhập tên ngành học!" }]}
                        >
                            <Input placeholder="Nhập tên ngành học" />
                        </Form.Item>

                        {/* THÊM TRƯỜNG CATEGORY */}
                        <Form.Item
                            label="Danh mục (Category)"
                            name="category"
                            rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
                        >
                            <Select
                                placeholder="Chọn danh mục"
                                options={categories.map(cat => ({
                                    // Giả định Category có trường _id hoặc id là giá trị
                                    value: cat._id || cat.id, 
                                    label: cat.name,
                                }))}
                            />
                        </Form.Item>
                        
                    </Form>
                </LoadingComponent>
            </ModalComponent>

            {/* Modal xóa 1 */}
            <ModalComponent
                title="Xoá Ngành học"
                open={isModalOpenDelete}
                onOk={handleDeleteMajor}
                onCancel={handleCloseModalDelete}
                confirmLoading={mutationDeleteMajor.isLoading}
            >
                <p>Bạn có chắc chắn muốn **xóa** ngành học này không?</p>
            </ModalComponent>

            {/* Modal xóa nhiều */}
            <ModalComponent
                title="Xoá Nhiều Ngành học"
                open={isModalOpenDeleteMany}
                onOk={handleDeleteManyMajors}
                onCancel={handleCloseModalDelete}
                confirmLoading={mutationDeleteManyMajors.isLoading}
            >
                <p>Bạn có chắc chắn muốn **xóa** {selectedRowKeys.length} ngành học đã chọn không?</p>
            </ModalComponent>

            {/* Drawer sửa */}
            <DrawerComponent
                title="Chi tiết Ngành học"
                placement="right"
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                width={window.innerWidth < 768 ? "100%" : 600}
            >
                <LoadingComponent isLoading={mutationUpdateMajor.isLoading || isLoadingCategories}>
                    <Form
                        name="formUpdate"
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 18 }}
                        style={{ maxWidth: 600, padding: "20px" }}
                        onFinish={handleUpdateMajor}
                        autoComplete="off"
                        form={formUpdate}
                    >
                        <Form.Item
                            label="Tên Ngành học"
                            name="name"
                            rules={[{ required: true, message: "Vui lòng nhập tên ngành học!" }]}
                        >
                            <Input />
                        </Form.Item>
                        
                        {/* THÊM TRƯỜNG CATEGORY */}
                        <Form.Item
                            label="Danh mục (Category)"
                            name="category"
                            rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
                        >
                            <Select
                                placeholder="Chọn danh mục"
                                options={categories.map(cat => ({
                                    value: cat._id || cat.id,
                                    label: cat.name,
                                }))}
                            />
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
                                    loading={mutationUpdateMajor.isLoading}
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
export default Major;