import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { Space, Table, Input, Button, Form, Radio, Flex, Upload, Tag, Select} from "antd";
import {
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    ExportOutlined,
    ImportOutlined,
    UploadOutlined,
    CheckOutlined,
    CloseOutlined,
} from "@ant-design/icons";

import ButtonComponent from "../../components/ButtonComponent/ButtonComponent";
import LoadingComponent from "../../components/LoadingComponent/LoadingComponent";
import ModalComponent from "../../components/ModalComponent/ModalComponent";
import DrawerComponent from "../../components/DrawerComponent/DrawerComponent";
import * as Message from "../../components/Message/Message";
import * as TheSisService from "../../services/TheSisService";
import * as CategoryService from "../../services/CategoryService";

const ApprovedThesisPage = () => {
    // Khởi tạo các state cần thiết
        const [ isModalOpenDelete, setIsModalOpenDelete ] = useState(false); // Modal lưu trạng thái nút xoá
        const [ isModalOpenDeleteMany, setIsModalOpenDeleteMany ] = useState(false); // Modal lưu trạng thái nút xoá nhiều
        const [ isDrawerOpen, setIsDrawerOpen ] = useState(false); // Drawer lưu trạng thái nút cập nhật
        const [ rowSelected, setRowSelected ] = useState(null); // Dòng được chọn
        const [ formCreate ] = Form.useForm(); // Form tạo sinh viên
        const [ formUpdate ] = Form.useForm(); // Form cập nhật thông tin sinh viên
        const [ selectedRowKeys, setSelectedRowKeys ] = useState([]); // Dòng được chọn để xoá nhiều 

    // Quản lí phân trang 
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
    // Sử dụng useQuery để lấy dữ liệu
    const queryGetAllTheSis = useQuery({
        queryKey: ['getAllTheSis'],
        queryFn: TheSisService.getApprovedTheSis,
    });
    // Lấy toàn bộ danh mục luận văn
    const queryGetAllCategories = useQuery({
        queryKey: ['getAllCategories'],
        queryFn: CategoryService.getCategories,
    });
    //Mutation để xoá 1 luận văn
    const mutationDeleteTheSis = useMutation({
        mutationFn: TheSisService.deleteTheSis,
        onSuccess: (data) => {
            Message.success(data?.message);
            queryGetAllTheSis.refetch();
            setIsModalOpenDelete(false);
        },
        onError: (error) => {
            Message.error(`Lỗi: ${error.message}`);
        },
    });
    // Mutation để xoá nhiều luận văn
    const mutationDeleteManyTheSis = useMutation({
        mutationFn: TheSisService.deleteManyTheSis,
        onSuccess: (data) => {
            Message.success(data?.message);
            queryGetAllTheSis.refetch();
            setIsModalOpenDeleteMany(false);
            setSelectedRowKeys([]);
        },
        onError: (error) => {
            Message.error(`Lỗi: ${error.message}`);
        },
    });
    // Mutation để cập nhật luận văn
    const mutationUpdateTheSis = useMutation({
        mutationFn: TheSisService.updateTheSis,
        onSuccess: (data) => {
            Message.success(data?.message);
            queryGetAllTheSis.refetch();
            setIsDrawerOpen(false);
            formUpdate.resetFields();
        },
        onError: (error) => {
            Message.error(error.response?.data?.message || "Cập nhật thất bại");
        },
    });
    // Hàm convert status sang màu tag đẹp
    const statusColors = {
        pending: 'orange',
        approved: 'green',
        rejected: 'red',
    };

    // Lấy thông tin từ query   
    const { data: responseThesis, isLoading: isLoadingGetAllTheSis } = queryGetAllTheSis;
    const theSisData = responseThesis?.data || []; // Danh sách luận văn
    const { data: responseCategories } = queryGetAllCategories;
    const categoriesData = responseCategories?.data || []; // Danh sách danh mục luận văn
    // Lấy thông tin từ mutation
    const { mutate: deleteTheSis, isPending: isPendingDelete } = mutationDeleteTheSis;
    const { mutate: deleteManyTheSis, isPending: isPendingDeleteMany } = mutationDeleteManyTheSis;
    const { mutate: updateTheSis, isPending: isPendingUpdate } = mutationUpdateTheSis;

    // Hàm handle xử lí xóa và refetch dữ liệu sau khi xóa
    const handleOkDelete = () => {
        mutationDeleteTheSis.mutate(rowSelected, // Truyền ID của luận văn cần xoá chứ không phải đối tượng
            {
                onSettled: () => {
                    queryGetAllTheSis.refetch();
                }
            }
        )
    }
    // Đóng modal xoá 1 luận văn
    const handleCancelDelete = () => {
        setIsModalOpenDelete(false);
        setRowSelected(null);
    }
    // Hàm handle xử lí xóa nhiều luận văn và refetch dữ liệu sau khi xóa
    const handleOkDeleteMany = () => {
        mutationDeleteManyTheSis.mutate(
            { ids: selectedRowKeys },
            {
                onSettled: () => {
                    queryGetAllTheSis.refetch();
                }
            }
        )
    }
    // Đóng modal xoá nhiều luận văn
    const handleCancelDeleteMany = () => {
        setIsModalOpenDeleteMany(false);
        setSelectedRowKeys([]);
    }   
    const handleEditTheSis = (id) => {
        const selectedTheSis = theSisData.find((item) => item._id === id);
        if (selectedTheSis) {
            setRowSelected(selectedTheSis);
            formUpdate.setFieldsValue({
                title: selectedTheSis?.title,
                category: selectedTheSis?.category?._id || "", // Lấy ID của danh mục
                year: selectedTheSis?.year, 
                major: selectedTheSis?.major,
                authorName: selectedTheSis?.authorName,
                supervisorName: selectedTheSis?.supervisorName,
                fileUrl: selectedTheSis?.fileUrl,
                thumbnail: selectedTheSis?.thumbnail,
                sharingMode: selectedTheSis?.sharingMode,
                owner: selectedTheSis?.owner?.name, // Nếu không có owner thì để chuỗi rỗng
                status: selectedTheSis?.status,
            });
            console.log("selectedTheSis", selectedTheSis);
            setIsDrawerOpen(true);
        } else {
            Message.error("Luận văn không tồn tại");
        }
    }
    const handleUpdateTheSis = (values) => {
        const formData = new FormData();
        formData.append("title", values.title);
        formData.append("year", values.year);
        formData.append("major", values.major);
        formData.append("authorName", values.authorName);
        formData.append("supervisorName", values.supervisorName);
        formData.append("sharingMode", values.sharingMode);
        formData.append("status", values.status);
        formData.append("category", values.category); // Thêm category vào formData

        // ✅ Thêm file mới nếu có
        if (values.fileUrl && values.fileUrl.file instanceof File) {
            formData.append("fileUrl", values.fileUrl.file);
        }
        // ✅ Thêm thumbnail mới nếu có
        if (values.thumbnail && values.thumbnail.file instanceof File) {
            formData.append("thumbnail", values.thumbnail.file);
        }

        mutationUpdateTheSis.mutate(
            { id: rowSelected, data: formData },
            {
            onSettled: () => {
                console.log('Gửi file:', values.fileUrl?.file);
                console.log('Gửi thumbnail:', values.thumbnail?.file);
                queryGetAllTheSis.refetch();
            }
            }
        );

        setIsDrawerOpen(false);
    };


    const [searchText, setSearchText] = useState("");// Từ khoá tìm kiếm
    const [searchColumn, setSearchColumn ] = useState(""); // Cột tìm kiếm
    const searchInput = useRef(null); // Tham chiếu đến input tìm kiếm
    // Cấu hình cột của bảng
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
    // Hàm xử lí tìm kiếm
    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchColumn(dataIndex);
    };
    // Hàm xử lí reset tìm kiếm
    const handleReset = (clearFilters) => {
        clearFilters();
        setSearchText("");
    };
    const hasTitle = theSisData?.some((item) => item.title); // Kiểm tra xem có cột "Tên" hay không
    
    // Cấu hình các cột của bảng
    const columns = [
    {
        title: "STT",
        dataIndex: "key",
        key: "key",
        width: 50,
        render: (text, record, index) =>
            index + 1 + (pagination.current - 1) * pagination.pageSize,
    },
    ...(hasTitle
        ? [
              {
                  title: "Tên luận văn",
                  dataIndex: "title",
                  key: "title",
                  ...getColumnSearchProps("title"),
                  sorter: (a, b) => a.title.localeCompare(b.title),
              },
          ]
        : []),
    // Cột thumbnail
    {
        title: "Thumbnail",
        dataIndex: "thumbnail",
        key: "thumbnail",
        render: (text, record) => (
            <img
                src={record?.thumbnail ? `${import.meta.env.VITE_API_URL}${record.thumbnail}` : ""}
                alt={record?.thumbnail || "No thumbnail"}
                style={{ width: 50, height: 50, objectFit: "cover" }}
            />
        ),
    },
    {
        title: "Loại luận văn",
        dataIndex: "category",
        key: "category",
        ...getColumnSearchProps("category"),
        sorter: (a, b) => a.category.localeCompare(b.category),
    },
    {
        title: "Năm",
        dataIndex: "year",
        key: "year",
        sorter: (a, b) => a.year - b.year,
    },
    {
        title: "Chuyên ngành",
        dataIndex: "major",
        key: "major",
        ...getColumnSearchProps("major"),
        sorter: (a, b) => (a.major?.length || 0) - (b.major?.length || 0),
    },
    {
        title: "Sinh viên thực hiện",
        dataIndex: "authorName",
        key: "authorName",
        render: (authorName) => authorName || "Chưa cập nhật",
        ...getColumnSearchProps("authorName"),
    },
    // Thêm cột Người hướng dẫn
    {
        title: "Người hướng dẫn",
        dataIndex: "supervisorName",
        key: "supervisorName",
        render: (supervisorName) => supervisorName || "Chưa cập nhật",
        ...getColumnSearchProps("supervisorName"),
    },
    // Xem chi tiết luận văn
    {
        title: "Xem chi tiết",
        key: "view",
        render: (_, record) => (
            <Button
                size="small"
                type="primary"
                onClick={() => {
                    window.open(
                        `/thesis/${record.key}`,
                        "_blank"
                    );
                }}
                icon={<EditOutlined />}
            >
                Xem
            </Button>
        )
    },
    {
        title: "File luận văn",
        dataIndex: "fileUrl",
        key: "fileUrl",
        render: (text) =>
            !text ? (
                <span>Chưa có file</span>
            ) : (
                <a
                    href={`${import.meta.env.VITE_API_URL}${text}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Tải xuống
                </a>
            ),
    },
    {
        title: "Tác giả",
        dataIndex: "owner",
        key: "owner",
        render: (text) => (
            <span>{text?.name || text?.email || "Chưa có tác giả"}</span>
        ),
    },
    {
        title: "Chế độ chia sẻ",
        dataIndex: "sharingMode",
        key: "sharingMode",
        filters: [
            { text: "Công khai", value: "public" },
            { text: "Riêng tư", value: "private" },
        ],
        onFilter: (value, record) => record.sharingMode.includes(value),
        render: (text) => (
            <Radio.Group value={text} disabled>
                <Radio value="public">Công khai</Radio>
                <Radio value="private">Riêng tư</Radio>
            </Radio.Group>
        ),
    },
    {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        render: (statusValue, record) => {
            const keyStatus = record.statusKey; // pending | approved | rejected
            return (
                <Tag color={statusColors[keyStatus] || "default"}>
                    {convertStatus(keyStatus)}
                </Tag>
            );
        },
    },
    {
        title: "Hành động",
        key: "action",
        render: (_, record) => (
            <Space size="middle">
                <ButtonComponent
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => handleEditTheSis(record.key)}
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
].filter(Boolean);

    const convertStatus = (status) => {
        switch (status) {
            case "pending":
                return "Chờ duyệt";
            case "approved":
                return "Đã duyệt";
            case "rejected":
                return "Bị từ chối";
            default:
                return "Không xác định";
        }   
    };
    const dataTable = theSisData?.map((item, index) => ({
        key: item?._id,
        title: item?.title,
        thumbnail: item?.thumbnail || "Chưa cập nhật",
        category: item?.category?.name || "Chưa cập nhật",
        authorName: item?.authorName || "Chưa cập nhật",
        coAuthorsNames: item?.coAuthorsNames || [],
        supervisorName: item?.supervisorName || "Chưa cập nhật",
        year: item?.year,
        major: item?.major,
        fileUrl: item?.fileUrl,
        owner: item?.owner,
        sharingMode: item?.sharingMode,
        statusKey: item?.status, // Trạng thái gốc để sử dụng trong render
        status: convertStatus(item?.status),
    })) || [];
    console.log("dataTable", dataTable);
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
            <LoadingComponent size="large" isLoading={isLoadingGetAllTheSis} delay={200}>
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
                        showTotal: (total, range) => `Tổng ${total} luận văn`,
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
                title="Xoá luận văn"
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
                        Bạn có chắc chắn muốn <strong>xóa</strong> nhiều luận văn
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
                        onFinish={handleUpdateTheSis}
                        autoComplete="off"
                        form={formUpdate}
                    >
                        <Form.Item
                            label="Tên luận văn"
                            name="title"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập tên luận văn",
                                },
                            ]}
                        >
                            <Input placeholder="Nhập tên luận văn" />
                        </Form.Item>
                        <Form.Item
                            label="Danh mục"
                            name="category"
                            rules={[
                                {
                                    message: "Vui lòng chọn danh mục",
                                },
                            ]}
                        >
                            <Select placeholder="Chọn danh mục">
                                {categoriesData.map((category) => (
                                    <Select.Option key={category._id} value={category._id}>
                                        {category.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            label="Tên tác giả"
                            name="authorName"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập tên tác giả",
                                },
                            ]}
                        >
                            <Input placeholder="Nhập tên tác giả" />
                        </Form.Item>
                        <Form.Item
                            label="Tên người hướng dẫn"
                            name="supervisorName"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập tên người hướng dẫn",
                                },
                            ]}
                        >
                            <Input placeholder="Nhập tên người hướng dẫn" />
                        </Form.Item>
                        <Form.Item
                            label="Năm"
                            name="year"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập năm",
                                },
                            ]}
                        >
                            <Input placeholder="Nhập năm" />
                        </Form.Item>
                        <Form.Item
                            label="Chuyên ngành"
                            name="major"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập chuyên ngành",
                                },
                            ]}
                        >
                            <Input placeholder="Nhập chuyên ngành" />
                        </Form.Item>
                        <Form.Item
                            label="File luận văn"
                            name="fileUrl"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng tải lên file luận văn",
                                },
                            ]}
                        >
                            <Upload
                                name="fileUrl"
                                accept=".pdf,.doc,.docx"
                                beforeUpload={() => false} // Ngăn chặn tự động tải lên
                                maxCount={1} // Giới hạn số lượng file tải lên
                                onChange={(info) => {
                                    if (info.file.status === "done") {
                                        Message.success(`${info.file.name} tải lên thành công`);
                                    }
                                    if (info.file.status === "error") {
                                        Message.error(`${info.file.name} tải lên thất bại`);
                                    }
                                }}
                            >   
                                <ButtonComponent
                                    icon={<UploadOutlined />}
                                    style={{ width: "100%" }}
                                >
                                    Tải lên file luận văn
                                </ButtonComponent>
                            </Upload>
                        </Form.Item>
                        {/* thay đổi thumbnail của luận văn */}
                        <Form.Item
                            label="Thumbnail"
                            name="thumbnail"
                            rules={[
                                {
                                    required: false,
                                    message: "Vui lòng tải lên thumbnail",
                                },
                            ]}
                        >
                            <Upload
                                name="thumbnail"
                                accept=".jpg,.jpeg,.png"
                                beforeUpload={() => false} // Ngăn chặn tự động tải lên
                                maxCount={1} // Giới hạn số lượng file tải lên
                                onChange={(info) => {
                                    if (info.file.status === "done") {
                                        Message.success(`${info.file.name} tải lên thành công`);
                                    }
                                    if (info.file.status === "error") {
                                        Message.error(`${info.file.name} tải lên thất bại`);
                                    }
                                }}
                            >
                                <ButtonComponent
                                    icon={<UploadOutlined />}
                                    style={{ width: "100%" }}
                                >
                                    Tải lên thumbnail
                                </ButtonComponent>
                            </Upload>
                        </Form.Item>
                        <Form.Item
                            label="Chế độ chia sẻ"
                            name="sharingMode"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn chế độ chia sẻ",
                                },
                            ]}
                        >
                            <Radio.Group>
                                <Radio value="public">Công khai</Radio>
                                <Radio value="private">Riêng tư</Radio>
                            </Radio.Group>
                        </Form.Item>
                        {/* <Form.Item
                            label="Tác giả"
                            name="owner"
                            rules={[
                                {
                                    required: false, 
                                    message: "Vui lòng nhập tên tác giả",
                                },
                            ]}
                        >
                            <Input placeholder="Nhập tên tác giả" />
                        </Form.Item> */}
                        <Form.Item
                            label="Trạng thái"
                            name="status"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn trạng thái",
                                },
                            ]}
                        >
                            <Radio.Group>
                                <Radio value="pending">Chờ duyệt</Radio>
                                <Radio value="approved">Đã duyệt</Radio>
                                <Radio value="rejected">Bị từ chối</Radio>
                            </Radio.Group>
                        </Form.Item>
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
export default ApprovedThesisPage;