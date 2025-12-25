import React from "react";
import { Space, Table, Input, Button, Form, Radio, Flex } from "antd";
import * as StudentService from "../../services/StudentService";
import ButtonComponent from "../../components/ButtonComponent/ButtonComponent";
import {
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    ExportOutlined,
    ImportOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useRef } from "react";
// import { useMutationHook } from "../../hooks/useMutationHook";
import LoadingComponent from "../../components/LoadingComponent/LoadingComponent";
import ModalComponent from "../../components/ModalComponent/ModalComponent";
import DrawerComponent from "../../components/DrawerComponent/DrawerComponent";
import * as Message from "../../components/Message/Message";


const Lecturers = () => {
    // Khởi tạo các state cần thiết
    const [ isModalOpenDelete, setIsModalOpenDelete ] = useState(false); // Modal xoá 1 sinh viên
    const [ isModalOpenDeleteMany, setIsModalOpenDeleteMany ] = useState(false); // Modal xoá nhiều sinh viên
    const [ isDrawerOpen, setIsDrawerOpen ] = useState(false); // Drawer chi tiết sinh viên
    const [ rowSelected, setRowSelected ] = useState(null); // Dòng được chọn
    const [ formCreate ] = Form.useForm(); // Form tạo sinh viên
    const [ formUpdate ] = Form.useForm(); // Form cập nhật thông tin sinh viên
    const [ selectedRowKeys, setSelectedRowKeys ] = useState([]); // Dòng được chọn để xoá nhiều 

    //Quản lí phân trang
    const [ pagination, setPagination ] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    //Cấu hình chọn nhiều dòng
    const rowSelection = {
        selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
            setSelectedRowKeys(selectedRowKeys);
        },
        type : "checkbox", // Chọn nhiều dòng
    };
    const getStudent = async (id) => {
        const response = await StudentService.getStudentById(id);
        console.log("response", response);
        return response;
    }
    // Hàm lấy danh sách sinh viên
    const queryGetAllStudents = useQuery({
        queryKey: ["getAllStudents"],
        queryFn: StudentService.getAllTeachers,
    });
    // Mutation thêm sửa xoá sinh viên
    const mutationDeleteStudent = useMutation({
        mutationFn: StudentService.deleteStudent,
        onSuccess: (data) => {
            Message.success(data?.message);
            queryGetAllStudents.refetch();
            setIsModalOpenDelete(false);
        },
        onError: (error) => {
            Message.error(error?.response?.data?.message || "Xoá sinh viên thất bại");
        },
    });
    const mutationDeleteManyStudents = useMutation({
        mutationFn: StudentService.deleteManyStudents,
        onSuccess: (data) => {
            Message.success(data?.message);
            setSelectedRowKeys([]);
            setIsModalOpenDeleteMany(false);
            
        },
        onError: (error) => {
            Message.error(error?.response?.data?.message || "Xoá nhiều sinh viên thất bại");
        },
    });
    // Mutation cập nhật thông tin sinh viên
    const mutationUpdateStudent = useMutation({
        mutationFn:  ({ id, data }) => StudentService.updateStudent(id, data),
        onSuccess: (data) => {
            Message.success(data?.message);
            setIsDrawerOpen(false);
            formCreate.resetFields();
        },
        onError: (error) => {
            Message.error(error?.response?.data?.message || "Cập nhật thông tin sinh viên thất bại");
        },
    })
    // Lấy thông tin từ query và mutation   
    const { data: response, isLoading } = queryGetAllStudents;
    const dataStudent = response?.data || []; // Danh sách sinh viên
    // console.log("dataStudent", dataStudent);
    const {data: dataUpdate, isPending: isPendingUpdate} = mutationUpdateStudent;
    const { data: dataDelete, isPending: isPendingDelete } = mutationDeleteStudent;
    const { data: dataDeleteMany, isPending: isPendingDeleteMany } = mutationDeleteManyStudents;

    // Handle sự kiện
    const handleOkDelete = () => {
        mutationDeleteStudent.mutate(
            { id: rowSelected },
            {
                onSettled: () => {
                    queryGetAllStudents.refetch(); // Refetch danh sách bệnh nhân
                }
            }
        );
    }
    // Đóng modal xoá 1 sinh viên
    const handleCancelDelete = () => {
        setIsModalOpenDelete(false);
    }
    // Handle sự kiện xoá nhiều sinh viên
    const handleOkDeleteMany = () => {
        mutationDeleteManyStudents.mutate(
            { ids: selectedRowKeys },
            {
                onSettled: () => {
                    queryGetAllStudents.refetch(); // Refetch danh sách bệnh nhân
                }
            }
        );
    }
    // Đóng modal xoá nhiều sinh viên
    const handleCancelDeleteMany = () => {
        setIsModalOpenDeleteMany(false);
        setSelectedRowKeys([]); // Xoá các dòng đã chọn
    }

    // Hàm mở drawer để chỉnh sửa thông tin sinh viên
    const handleEditStudent = async (id) => { 
        const res = await getStudent(id); // Lấy thông tin sinh viên
        formUpdate.setFieldsValue({
            name: res?.name,
            email: res.email,
            role: res.role,
        });
        setIsDrawerOpen(true); // Mở drawer
    };
    // Hàm cập nhật thông tin sinh viên
    const handleOnUpdateUser = (values) => {
        const data = {
            name: values.name,
            email: values.email,
            role: values.role,
        };
        mutationUpdateStudent.mutate(
            { id: rowSelected, data },
            {
                onSettled: () => {
                    queryGetAllStudents.refetch(); // Refetch danh sách sinh viên
                }
            }
        );
    };
    
    const [searchText, setSearchText] = useState("");// Từ khoá tìm kiếm
    const [searchColumn, setSearchColumn ] = useState(""); // Cột tìm kiếm
    const searchInput = useRef(null); // Tham chiếu đến input tìm kiếm
    // Hàm xử lý tìm kiếm
    const getColumnSearchProps = (dataIndex) => ({
            filterDropdown: ({
                setSelectedKeys,
                selectedKeys,
                confirm,
                clearFilters,
            }) => (
                <div style={{ padding: 8 }}>
                    <Input
                        ref={searchInput}
                        placeholder={`Tìm theo ${dataIndex}`}
                        value={selectedKeys[0]}
                        onChange={(e) =>
                            setSelectedKeys(e.target.value ? [e.target.value] : [])
                        }
                        onPressEnter={() =>
                            handleSearch(selectedKeys, confirm, dataIndex)
                        }
                        style={{ marginBottom: 8, display: "block" }}
                    />
                    <Space>
                        <ButtonComponent
                            type="primary"
                            onClick={() =>
                                handleSearch(selectedKeys, confirm, dataIndex)
                            }
                            icon={<SearchOutlined />}
                            size="small"
                            style={{ width: 90 }}
                        >
                            Tìm
                        </ButtonComponent>
                        <Button
                            onClick={() => handleReset(clearFilters)}
                            size="small"
                            style={{ width: 90 }}
                        >
                            Xóa
                        </Button>
                    </Space>
                </div>
            ),
            filterIcon: (filtered) => (
                <SearchOutlined
                    style={{ color: filtered ? "#1890ff" : undefined }}
                />
            ),
            onFilter: (value, record) =>
                record[dataIndex]
                    ?.toString()
                    .toLowerCase()
                    .includes(value.toLowerCase()),
            filterDropdownProps: {
                onOpenChange: (open) => {
                    if (open) {
                        setTimeout(() => searchInput.current?.select(), 100);
                    }
                },
            },
            render: (text) =>
                searchColumn === dataIndex ? (
                    <span style={{ backgroundColor: "#ffc069", padding: 0 }}>
                        {text}
                    </span>
                ) : (
                    text
                ),
        }
    );
    // Hàm tìm kiếm
    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchColumn(dataIndex);
    };
    // Hàm reset tìm kiếm
    const handleReset = (clearFilters) => {
        clearFilters();
        setSearchText("");
    };
    const hasName = dataStudent?.some((item) => item.name); // Kiểm tra xem có cột name không
    const hasEmail = dataStudent?.some((item) => item.email); // Kiểm tra xem có cột email không
    
    // Cấu hình các cột của bảng
    const columns = [
        {
            title: "STT",
            dataIndex: "key",
            key: "key",
            width: 50,
            render: (text, record, index) => index + 1 + (pagination.current - 1) * pagination.pageSize,
        },
        ...(hasName ? [{
        title: "Tên",
        dataIndex: "name",
        key: "name",
        ...getColumnSearchProps("name"),
        sorter: (a, b) => (a.name?.length || 0) - (b.name?.length || 0),
        render: (text) => text ? text : <em style={{ color: "#999" }}>Chưa cập nhật</em>,
    }] : []),
        ...(hasEmail ? [{
            title: "Email",
            dataIndex: "email",
            key: "email",
            ...getColumnSearchProps("email"),
        }] : []),
        {
            title: "Quyền",
            dataIndex: "role",
            key: "role",
        },
        {
            title: "Hành động",
            key: "action",
            render: (_, record) => (
                <Space size="middle">
                    <ButtonComponent
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => handleEditStudent(record.key)}
                    >
                        Sửa
                    </ButtonComponent>
                    <ButtonComponent
                        type="primary"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => {
                            setRowSelected(record.key);
                            setIsModalOpenDelete(true);
                        }}
                    >
                        Xoá
                    </ButtonComponent>
                </Space>
            ),
        },
    ].filter(Boolean); // Loại bỏ các cột không có dữ liệu;

    const convertRole = (role) => {
        switch (role) {
            case "student":
                return "Sinh viên";
            case "lecturer":
                return "Giảng viên";
            case "admin":
                return "Admin";
            default:
                return role;
        }
    }
    const dataTable = dataStudent?.map((item, index) => ({
        key: item._id,
        index: index + 1,
        name: item.name || "Chưa cập nhật",
        email: item.email || "Chưa cập nhật",
        role: convertRole(item.role) || "Chưa cập nhật",
    })) || [];
    return (
        <>
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
                        flex: "1 1 300px", // cho responsive
                        justifyContent: "flex-start",
                    }}
                >
                    <ButtonComponent
                        size="small"
                        disabled={selectedRowKeys.length == 0}
                        icon={<DeleteOutlined />}
                        onClick={() => setIsModalOpenDeleteMany(true)}
                        danger
                        style={{ minWidth: "120px" }}
                    >
                        Xoá nhiều
                    </ButtonComponent>
                </Flex>
                <Flex
                    gap="middle"
                    style={{
                        flexWrap: "wrap",
                        flex: "1 1 300px", // cho responsive
                        justifyContent: "flex-end",
                    }}
                >
                    <ButtonComponent
                        size="small"
                        type="default"
                        icon={<ExportOutlined />}
                        styleButton={{
                            minWidth: "120px",
                            backgroundColor: "#52c41a",
                            color: "#fff",
                        }}
                    >
                        Export
                    </ButtonComponent>
                    <ButtonComponent
                        size="small"
                        type="primary"
                        icon={<ImportOutlined />}
                        styleButton={{
                            minWidth: "120px",
                            backgroundColor: "#1890ff",
                            color: "#fff",
                        }}
                    >
                        Import
                    </ButtonComponent>
                </Flex>
            </Flex>
            <LoadingComponent size="large" isLoading={isLoading} delay={200}>
                <Table
                    rowSelection={rowSelection}
                    rowKey={"key"}
                    columns={columns}
                    scroll={{ x: "max-content" }} // 👈 thêm dòng này
                    dataSource={dataTable}
                    locale={{ emptyText: "Không có dữ liệu" }}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        position: ["bottomCenter"],
                        showTotal: (total, range) => `Tổng ${total} tài khoản`,
                        showSizeChanger: true, // Cho phép chọn số dòng/trang
                        pageSizeOptions: ["5", "8", "10", "20", "50"], // Tuỳ chọn số dòng
                        showQuickJumper: true, // Cho phép nhảy đến trang
                        onChange: (page, pageSize) => {
                            setPagination({
                                current: page,
                                pageSize: pageSize,
                            });
                        },
                    }}
                    onRow={(record) => ({
                        onClick: () => {
                            setRowSelected(record.key);
                        },
                    })}
                />
            </LoadingComponent>
            <ModalComponent
                title="Xoá người dùng"
                open={isModalOpenDelete}
                onOk={handleOkDelete}
                onCancel={handleCancelDelete}
                style={{ borderRadius: 0 }}
            >
                <LoadingComponent isLoading={isPendingDelete}>
                    <p>
                        Bạn có chắc chắn muốn <strong>xóa</strong> người dùng
                        này không?
                    </p>
                </LoadingComponent>
            </ModalComponent>
            <ModalComponent
                title="Xoá người dùng"
                open={isModalOpenDeleteMany}
                onOk={handleOkDeleteMany}
                onCancel={handleCancelDeleteMany}
                style={{ borderRadius: 0 }}
            >
                <LoadingComponent isLoading={isPendingDeleteMany}>
                    <p>
                        Bạn có chắc chắn muốn <strong>xóa</strong> nhiều người dùng
                        này không?
                    </p>
                </LoadingComponent>
            </ModalComponent>
            <DrawerComponent
                title="Chi tiết người dùng"
                placement="right"
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                width={window.innerWidth < 768 ? "100%" : 600}
                forceRender
            >
                <LoadingComponent isLoading={isPendingUpdate}>
                    <Form
                        name="formUpdate"
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 18 }}
                        style={{ maxWidth: 600, padding: "20px" }}
                        initialValues={{ remember: true }}
                        onFinish={handleOnUpdateUser}
                        autoComplete="off"
                        form={formUpdate}
                    >
                        <Form.Item
                            label="Name"
                            name="name"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập tên!",
                                },
                            ]}
                        >
                            <Input name="name" />
                        </Form.Item>
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập email!",
                                },
                                {
                                    type: "email",
                                    message: "Email không hợp lệ!",
                                },
                            ]}
                        >
                            <Input name="email" />
                        </Form.Item>
                        <Form.Item
                            label="Role"
                            name="role"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn quyền!",
                                },
                            ]}
                        >
                            <Radio.Group name="role">
                                <Radio value={"student"}>Sinh viên</Radio>
                                {/* <Radio value={"doctor"}>Bác sĩ</Radio> */}
                                <Radio value={"admin"}>Admin</Radio>
                            </Radio.Group>
                        </Form.Item>

                        {/* <Form.Item
              label="Avatar"
              name="avatar"
            >
              <div>
              
                <WarpperUploadFile onChange={handleOnchangeAvatarDetail} maxCount={1}>
                  <Button>Select file</Button>
                </WarpperUploadFile>
                { stateUserDetail?.avatar && 
                  <img 
                    src={stateUserDetail?.avatar} 
                    alt="avatar" 
                    style={{width:'60px',height:'60px',borderRadius:'50%',marginLeft:'10px'}}
                  />
                }
              </div>
              
            </Form.Item> */}

                        <Form.Item
                            label={null}
                            wrapperCol={{ offset: 20, span: 4 }}
                        >
                            <ButtonComponent
                                type="primary"
                                htmlType="submit"
                                size="large"
                            >
                                Cập nhật
                            </ButtonComponent>
                        </Form.Item>
                    </Form>
                </LoadingComponent>
            </DrawerComponent>
        </>
    );
}
export default Lecturers;