import React, { useState, useEffect } from "react";
import { Card, Input, Select, Button, Upload, Switch, Form, notification, Spin, Row, Col, Tabs } from "antd";

import { 
    UploadOutlined,
    FilePdfOutlined
 } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";

import * as ThesisService from "../../../services/TheSisService";
import * as FieldService from "../../../services/FieldService";

// Helper function để lấy ID từ URL
const getThesisIdFromUrl = () => {
    const thesisId = window.location.pathname.split("/").pop();
    return thesisId; 
};

const ThesisEditingPage = () => {
    const navigate = useNavigate();
    const [formUpdate] = Form.useForm();
    const [fileList, setFileList] = useState([]);
    const [activeTab, setActiveTab] = useState('info'); // State quản lý tab hiện tại

    // Lấy ID và thiết lập state, đảm bảo ID có giá trị
    const initialThesisId = getThesisIdFromUrl();
    const [id, setId] = useState(initialThesisId);
    
    // Gọi API lấy thông tin luận văn theo ID 
    const { data: thesis, isLoading: isThesisLoading, isError: isThesisError } = useQuery({
        queryKey: ["thesis", id], // Thay đổi queryKey để có thể refetch khi id thay đổi nếu cần
        queryFn: () => ThesisService.getThesisById(id),
        enabled: !!id, // Chỉ fetch khi ID có giá trị
    });
    // Lấy lĩnh vực để select
    const { data: fields } = useQuery({
        queryKey: ["fields"],
        queryFn: FieldService.getAllFields,
    });
    const fieldOptions = fields?.data?.map(field => ({
        label: field.name,
        value: field._id,
    })) || [];
    
    const thesisResponse = thesis?.data || {};
    console.log(thesisResponse)

    // Set dữ liệu vào form khi data được load
    useEffect(() => {
        if (thesisResponse && Object.keys(thesisResponse).length > 0) {
            formUpdate.setFieldsValue({
                title: thesisResponse.title,
                authorName: thesisResponse.authorName,
                coAuthorsNames: thesisResponse.coAuthorsNames,
                supervisorName: thesisResponse.supervisorName,
                year: thesisResponse.year,
                category: thesisResponse.category._id,
                major: thesisResponse.major._id,
                field: thesisResponse.field._id,
                keywords: thesisResponse.keywords,
                tom_tat: thesisResponse.tom_tat,
                accessMode: thesisResponse.accessMode,
                allowDownload: thesisResponse.allowDownload,
            });
            // Nếu có fileUrl, thiết lập fileList cho mục hiển thị file hiện tại (tùy thuộc vào cách bạn quản lý file)
            if (thesisResponse.fileUrl) {
                setFileList([{
                    uid: '-1',
                    name: thesisResponse.fileUrl.split('/').pop(), // Lấy tên file
                    status: 'done',
                    url: thesisResponse.fileUrl,
                    isExisting: true, // Đánh dấu là file hiện tại
                }]);
            }
        }
    }, [thesisResponse, formUpdate]);

    // Mutation chỉnh sửa luận văn
    const updateThesisMutation = useMutation({
        mutationFn: ThesisService.updateTheSis,
        onSuccess: (data) => {
            console.log("Thesis updated successfully:", data);
            notification.success({
                message: "Thành công",
                description: "Luận văn đã được cập nhật.",
            });
            navigate(-1); // Quay lại trang trước đó
        },
        onError: (error) => {
            console.error("Error updating thesis:", error);
            notification.error({
                message: "Lỗi",
                description: `Cập nhật thất bại: ${error.message || 'Lỗi không xác định'}`,
            });
        },
    });

    const handleUpdateThesis = (values) => {
        const formData = new FormData();
        formData.append("title", values.title);
        formData.append("year", values.year);
        formData.append("category", thesisResponse.category._id); // Gửi categoryId
        formData.append("major", thesisResponse.major._id); // Gửi majorId
        formData.append("field", values.field); // Gửi fieldId
        formData.append("authorName", values.authorName);
        formData.append("coAuthorsNames", values.coAuthorsNames)
        formData.append("supervisorName", values.supervisorName);
        formData.append("keywords", values.keywords); 
        formData.append("tom_tat", values.tom_tat || "");
        formData.append("accessMode", values.accessMode);

        formData.append("allowDownload", values.allowDownload ? "true" : "false");


        console.log('check values', values)
        // ✅ Thêm file mới nếu có
        if (values.fileUrl && values.fileUrl.file instanceof File) {
            formData.append("fileUrl", values.fileUrl.file);
        }
        // ✅ Thêm thumbnail mới nếu có
        if (values.thumbnail && values.thumbnail.file instanceof File) {
            formData.append("thumbnail", values.thumbnail.file);
        }

        updateThesisMutation.mutate(
            { id: id, data: formData },
        );

    };
    
    // Xử lý Upload file
    const normFile = (e) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
    };
    
    const handleFileChange = ({ fileList: newFileList }) => {
        // Chỉ giữ file cuối cùng (file hiện tại hoặc file mới)
        if (newFileList.length > 0) {
            setFileList(newFileList.slice(-1)); 
        } else {
            setFileList([]);
        }
    };
    
    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
        notification.error({
            message: "Lỗi",
            description: "Vui lòng kiểm tra lại các trường bắt buộc.",
        });
    };

    if (isThesisLoading) {
        return (
            <div className="p-6 max-w-5xl mx-auto text-center">
                <Spin size="large" tip="Đang tải dữ liệu luận văn..." />
            </div>
        );
    }

    if (isThesisError) {
        return (
            <div className="p-6 max-w-5xl mx-auto space-y-6">
                <Card title="Lỗi tải dữ liệu">
                    <p>Không thể tải thông tin luận văn. Vui lòng kiểm tra ID và kết nối mạng.</p>
                </Card>
            </div>
        );
    }
    // --- Cấu trúc Tabs ---
    const items = [
        {
            key: 'info',
            label: 'Thông tin luận văn',
            children: (
                <div className="space-y-6 p-2">
                    {/* THÔNG TIN CƠ BẢN/METADATA */}
                    <Card title="Thông tin cơ bản" className="rounded-2xl shadow-md">
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <Form.Item label="Tiêu đề" name="title" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}>
                                    <Input placeholder="Nhập tiêu đề luận văn" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Tác giả" name="authorName" rules={[{ required: true, message: 'Vui lòng nhập tên tác giả!' }]}>
                                    <Input placeholder="Tên sinh viên thực hiện" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="GV hướng dẫn" name="supervisorName" rules={[{ required: true, message: 'Vui lòng nhập tên GV hướng dẫn!' }]}>
                                    <Input placeholder="Tên giảng viên" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Năm thực hiện" name="year" rules={[{ required: true, message: 'Vui lòng nhập năm!' }]}>
                                    <Input placeholder="2024" type="number" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Lĩnh vực" name="field" rules={[{ required: true, message: 'Vui lòng chọn lĩnh vực!' }]}>
                                    <Select
                                        className="w-full"
                                        placeholder="Chọn lĩnh vực"
                                        options = {fieldOptions}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Từ khóa" name="keywords">
                                    <Input placeholder="Ví dụ: AI, Machine Learning (Ngăn cách bằng dấu phẩy)" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>

                    {/* TÓM TẮT */}
                    <Card title="Tóm tắt" className="rounded-2xl shadow-md">
                        <Form.Item name="tom_tat" rules={[{ required: true, message: 'Vui lòng nhập tóm tắt!' }]}>
                            <Input.TextArea rows={8} placeholder="Nhập tóm tắt chi tiết về luận văn..." />
                        </Form.Item>
                    </Card>

                    {/* FILE LUẬN VĂN */}
                    <Card title="Tập tin luận văn" className="rounded-2xl shadow-md">
                        <div className="space-y-3">
                            {thesisResponse.fileUrl && (
                                <p className="flex items-center gap-2">
                                    <FilePdfOutlined className="text-xl text-red-500" />
                                    File hiện tại: 
                                    <a href={thesisResponse.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline cursor-pointer font-medium">
                                        {thesisResponse.fileUrl.split('/').pop()}
                                    </a>
                                </p>
                            )}
                            
                            <Form.Item
                                name="newFile"
                                valuePropName="fileList"
                                getValueFromEvent={normFile}
                                noStyle
                            >
                                <Upload
                                    beforeUpload={() => false}
                                    onChange={handleFileChange}
                                    fileList={fileList.filter(file => !file.isExisting)} // Chỉ hiển thị file mới
                                    maxCount={1}
                                >
                                    <Button icon={<UploadOutlined />}>Tải lên file mới (thay thế)</Button>
                                </Upload>
                            </Form.Item>
                        </div>
                    </Card>
                </div>
            ),
        },
        {
            key: 'access',
            label: 'Quyền truy cập',
            children: (
                <div className="space-y-6 p-2">
                    {/* QUYỀN TRUY CẬP */}
                    <Card title="Cấu hình hiển thị và tải xuống" className="rounded-2xl shadow-md">
                        <Row gutter={[24, 24]}>
                            <Col span={24}>
                                <Form.Item label={<span className="font-medium">Chế độ công khai</span>} name="accessMode" initialValue={formUpdate.getFieldValue('accessMode')} rules={[{ required: true, message: 'Vui lòng chọn quyền truy cập!' }]}>
                                    <Select
                                        className="w-full"
                                        placeholder="Chọn quyền"
                                        options={[
                                            { label: "Công khai toàn văn", value: "public_full" },
                                            { label: "Chỉ xem tóm tắt", value: "abstract_only" },
                                            { label: "Giới hạn trong khoa (Cần đăng nhập)", value: "department_only" },
                                            { label: "Riêng tư (Chỉ Admin/Giảng viên)", value: "private" }
                                        ]}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="allowDownload" label={<span className="font-medium">Cho phép tải xuống</span>} valuePropName="checked">
                                    <Switch checkedChildren="Có" unCheckedChildren="Không" />
                                </Form.Item>
                            </Col>
                        </Row>
                        <div className="p-3 mt-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700">
                            ⚠️ Các thay đổi về quyền truy cập có thể ảnh hưởng đến khả năng hiển thị của luận văn trên thư viện.
                        </div>
                    </Card>
                </div>
            ),
        },
    ];
    
    // Trang chỉnh sửa luận văn
    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            
            <Form
                form={formUpdate}
                layout="vertical"
                onFinish={handleUpdateThesis}
                onFinishFailed={onFinishFailed}
                initialValues={{ accessMode: 'public_full', isHidden: false, allowDownload: true }}
            >
                {/* Header và Button Lưu */}
                <div className="flex justify-between items-center bg-white p-4 sticky top-0 z-10 border-b shadow-sm rounded-lg mb-4">
                    <h1 className="text-2xl font-semibold">
                        Chỉnh sửa luận văn: <span className="text-blue-600">{thesisResponse.title || 'Đang tải...'}</span>
                    </h1>
                    <div className="flex gap-3">
                        <Button onClick={() => navigate(-1)}>Hủy</Button>
                        <Button 
                            type="primary" 
                            htmlType="submit"
                            loading={updateThesisMutation.isPending}
                            disabled={isThesisLoading}
                        >
                            Lưu thay đổi
                        </Button>
                    </div>
                </div>

                {/* Tabs Container */}
                <Card className="rounded-2xl shadow-lg">
                    <Tabs 
                        defaultActiveKey="info" 
                        items={items} 
                        size="large" 
                        onChange={setActiveTab}
                        activeKey={activeTab} // Kiểm soát active tab để chuyển khi có lỗi validation
                    />
                </Card>
                    
            </Form>
        </div>
    );
}; 

export default ThesisEditingPage;