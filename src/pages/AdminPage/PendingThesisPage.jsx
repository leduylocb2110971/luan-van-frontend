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
import * as Message from "../../components/Message/Message";
import * as TheSisService from "../../services/TheSisService";

const PendingThesisPage = () => {
    // Quản lí phân trang
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
    });
    // Quản lí tìm kiếm
    const [searchText, setSearchText] = useState("");// Từ khoá tìm kiếm
    const [searchColumn, setSearchColumn ] = useState(""); // Cột tìm kiếm
    const searchInput = useRef(null); // Tham chiếu đến input tìm kiếm

    const queryGetPendingThesis = useQuery({
        queryKey: ["getPendingThesis"],
        queryFn: TheSisService.getPendingTheSis,
    });
    const { data: response, isLoading: isLoadingPendingThesis } = queryGetPendingThesis;
    const pendingThesisList = response?.data || [];
    console.log("pendingThesisList", pendingThesisList);

    // Phê duyệt 
    const handleChangeStatus = async (id, status) => {
        try {
            const response = await TheSisService.updateTheSisStatus(id, status);
            Message.success(response.message);
            queryGetPendingThesis.refetch();
        } catch (error) {
            Message.error(`Lỗi: ${error.message}`);
        }
    };
    // Cấu hình cột cho bảng
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
                        setSearchColumn(dataIndex);
                    }
                    }
                    style={{ width: 188, marginBottom: 8, display: "block" }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => {
                            confirm();
                            setSearchText(selectedKeys[0]);
                            setSearchColumn(dataIndex);
                        }
                        }
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Tìm kiếm
                    </Button>
                    <Button
                        onClick={() => {
                            clearFilters();
                            setSearchText("");
                            setSearchColumn("");
                        }}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Xoá
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
        ),
        onFilter: (value, record) => {
            return record[dataIndex]
                ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
                : "";
        }
        ,
        render: (text) =>
            searchColumn === dataIndex ? (
                <span style={{ color: "#1677ff" }}>{text}</span>
            ) : (
                text
            ),
    });

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
    const hasTitle = pendingThesisList?.some((item) => item.title); // Kiểm tra xem có cột "Tên" hay không


    // Cột của bảng
    const columns = [
    {
        title: "STT",
        dataIndex: "key",
        key: "key",
        width: 50,
        render: (text, record, index) =>
            index + 1 + (pagination.current - 1) * pagination.pageSize,
    },
    // {
    //     title: "Thumbnail",
    //     dataIndex: "thumbnail",
    //     key: "thumbnail",
    //     render: (text, record) => (
    //         <img
    //             src={record?.thumbnail ? `${import.meta.env.VITE_API_URL}${record.thumbnail}` : ""}
    //             alt={record?.thumbnail || "No thumbnail"}
    //             style={{ width: 50, height: 50, objectFit: "cover" }}
    //         />
    //     ),
    // },
    ...(hasTitle
        ? [
              {
                  title: "Tên luận văn",
                  dataIndex: "title",
                  key: "title",
                  ...getColumnSearchProps("title"),
                  sorter: (a, b) => a.title.localeCompare(b.title),
                  // Nếu dài quá thì để hiển thị ngắn gọn
                  render: (text) => (
                      <span style={{ maxWidth: 200, display: "inline-block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {text}
                        </span>
                    ),
              },
          ]
        : []),
    {
        title: "Tác giả",
        dataIndex: "owner",
        key: "owner",
        render: (text) => (
            <span>{text?.name || text?.email || "Chưa có tác giả"}</span>
        ),
    },
    {
        title: "Tên sinh viên thực hiện",
        dataIndex: "authorName",
        key: "authorName",
        ...getColumnSearchProps("authorName"),
        sorter: (a, b) => a.authorName.localeCompare(b.authorName),
    },
    {
        title: "Chuyên ngành",
        dataIndex: "major",
        key: "major",
        ...getColumnSearchProps("major"),
        sorter: (a, b) => (a.major?.length || 0) - (b.major?.length || 0),
    },
    {
        title: "Tên giảng viên hướng dẫn",
        dataIndex: "supervisorName",
        key: "supervisorName",
        ...getColumnSearchProps("supervisorName"),
        sorter: (a, b) => a.supervisorName.localeCompare(b.supervisorName),
    },
    // {
    //     title: "Loại luận văn",
    //     dataIndex: "category",
    //     key: "category",
    //     ...getColumnSearchProps("category"),
    //     sorter: (a, b) => a.category.localeCompare(b.category),
    // },
    {
        title: "Năm",
        dataIndex: "year",
        key: "year",
        sorter: (a, b) => a.year - b.year,
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
        title: "Phê duyệt",
            key: "approval",
            render: (_, record) => {
                if (record.status === "pending") {
                    return (
                        <Space>
                            <Button
                                size="small"
                                type="primary"
                                onClick={() =>
                                    handleChangeStatus(record.key, "approved")
                                }
                                icon={<CheckOutlined />}
                            />
                            <Button
                                size="small"
                                type="default"
                                danger
                                onClick={() =>
                                    handleChangeStatus(record.key, "rejected")
                                }
                                icon={<CloseOutlined />}
                            />
                        </Space>
                    );
                }
                return null;
            },
        },
    ].filter(Boolean); // Lọc bỏ các cột không có dữ liệu
    const dataTable = pendingThesisList?.map((item, index) => ({
        key: item?._id,
        thumbnail: item?.thumbnail,
        title: item?.title,
        owner: item?.owner,
        authorName: item?.authorName,
        coAuthorsNames: item?.coAuthorsNames,
        supervisorName: item?.supervisorName,
        category: item?.category?.name || 'Chưa có loại',
        year: item?.year,
        major: item?.major,
        fileUrl: item?.fileUrl,
        status: item?.status,
    }));
    console.log("dataTable", dataTable);
    return (
        <>
            <LoadingComponent size="large" isLoading={isLoadingPendingThesis} delay={200}>
                <Table
                    // rowSelection={rowSelection}
                    rowKey={"key"}
                    columns={columns}
                    scroll={{ x: "max-content" }} // 👈 thêm dòng này
                    dataSource={dataTable}
                    locale={{ emptyText: "Không có dữ liệu" }}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        position: ["bottomCenter"],
                        showTotal: (total, range) => `Tổng ${total} luận văn đang chờ phê duyệt`,
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
                    // onRow={(record) => ({
                    //     onClick: () => {
                    //         setRowSelected(record.key);
                    //     },
                    // })}
                />
            </LoadingComponent>
        </>
    );
};

export default PendingThesisPage;