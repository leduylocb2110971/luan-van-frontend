import React, { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Form, Input, Button, Modal, Select, InputNumber, Upload, Row, Col } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import * as Messages from "../../components/Message/Message";
import * as ThesisService from "../../services/TheSisService";

const { Option } = Select;

// Hàm trợ giúp để lấy ID từ Object
const getObjectId = (obj) => (obj && obj._id) ? obj._id : obj;

const EditThesisComponent = ({ 
    open, 
    onClose, 
    thesis, 
    onSuccess, 
    categories, 
    majors, 
    fields // Nhận 3 mảng đầy đủ từ component cha
}) => {
  const [form] = Form.useForm();
  
  // Chỉ cần state lọc Majors (vì Major vẫn phụ thuộc Category)
  const [filteredMajors, setFilteredMajors] = useState(majors || []);

  // ----------------------------------------------------
  // 1. Cập nhật Initial Values khi thesis thay đổi
  // ----------------------------------------------------
  useEffect(() => {
    if (thesis) {
        // Lọc danh sách Majors dựa trên Category của thesis
        const initialMajors = majors?.filter(m => m.category === getObjectId(thesis.category)) || [];
        setFilteredMajors(initialMajors);
        
        form.setFieldsValue({
            ...thesis,
            category: getObjectId(thesis.category),
            major: getObjectId(thesis.major),
            field: getObjectId(thesis.field), // Field lấy trực tiếp ID, không cần lọc

            fileUrl: thesis.fileUrl
                ? [{
                    uid: "-1",
                    name: thesis.fileUrl.split("/").pop(),
                    status: "done",
                    url: thesis.fileUrl,
                }]
                : [],
        });
    } else {
        form.resetFields();
    }
  }, [thesis, form, categories, majors, fields]); // fields thay đổi cũng không ảnh hưởng logic lọc

  // ----------------------------------------------------
  // 2. Logic Mutation (Cập nhật)
  // ----------------------------------------------------
  const mutationUpdate = useMutation({
    mutationFn: ({ id, data }) => ThesisService.updateTheSis({ id, data }),
    onSuccess: () => {
        Messages.success("Cập nhật luận văn thành công");
        onSuccess && onSuccess();
        form.resetFields();
    },
    onError: (error) => {
        Messages.error(`Cập nhật luận văn thất bại: ${error.message}`);
    },
  });

  const handleUpdateTheSis = (values) => {
    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("tom_tat", values.tom_tat || "");
    formData.append("keywords", values.keywords); 
    formData.append("year", values.year);
    formData.append("category", values.category);
    formData.append("major", values.major);
    formData.append("field", values.field);
    formData.append("sharingMode", values.sharingMode || "private");

    if (
        values.fileUrl &&
        Array.isArray(values.fileUrl) &&
        values.fileUrl.length > 0 &&
        values.fileUrl[0].originFileObj
    ) {
        formData.append("fileUrl", values.fileUrl[0].originFileObj);
    }

    mutationUpdate.mutate({ id: thesis._id, data: formData });
  };

  // ----------------------------------------------------
  // 3. Logic Dependent Dropdowns (Chỉ giữ lại lọc Major theo Category)
  // ----------------------------------------------------
  const handleValuesChange = (changedValues, allValues) => {
    // Lọc Majors khi Category thay đổi
    if (changedValues.category) {
        const selectedCategoryId = changedValues.category;
        const newFilteredMajors = majors.filter(major => 
            major.category === selectedCategoryId
        );
        setFilteredMajors(newFilteredMajors);

        // Chỉ reset Major, KHÔNG reset Field
        form.setFieldsValue({ major: undefined });
    }
    
    // ĐÃ XÓA logic lọc Field khi Major thay đổi
  };

  return (
    <Modal
        title="📝 Chỉnh sửa Luận văn"
        open={open}
        onCancel={() => { form.resetFields(); onClose(); }}
        footer={null}
        width={800}
        destroyOnClose={true}
    >
        <Form
            form={form}
            layout="vertical"
            onFinish={handleUpdateTheSis}
            onValuesChange={handleValuesChange}
        >
            <Row gutter={24}>
                <Col span={12}>
                    <Form.Item label="Tiêu đề" name="title" rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}>
                        <Input />
                    </Form.Item>
                    
                    <Form.Item label="Từ khóa" name="keywords" rules={[{ required: true, message: "Vui lòng nhập từ khóa" }]}>
                        <Input placeholder="Ví dụ: AI, Machine Learning..." />
                    </Form.Item>

                    <div style={{ padding: '10px', border: '1px dashed #d9d9d9', borderRadius: '4px', marginBottom: '15px' }}>
                        <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Thông tin Tác giả (Chỉ đọc):</p>
                        {(thesis.authorName?.trim().length > 0) && (
                            <Form.Item label="Tác giả Chính" style={{ marginBottom: 0 }}>
                                <Input value={thesis.authorName} disabled />
                            </Form.Item>
                        )}
                        {thesis.coAuthorsNames && thesis.coAuthorsNames.length > 0 && (
                            <Form.Item label="Đồng tác giả" style={{ marginBottom: 0 }}>
                                <Input value={thesis.coAuthorsNames.join(", ")} disabled />
                            </Form.Item>
                        )}
                    </div>
                </Col>

                <Col span={12}>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item label="Khoa" name="category" rules={[{ required: true, message: "Vui lòng chọn Khoa" }]}>
                                <Select placeholder="Chọn khoa">
                                    {categories?.map((cat) => (
                                        <Option key={cat._id} value={cat._id}>{cat.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item label="Chuyên ngành" name="major" rules={[{ required: true, message: "Vui lòng chọn Chuyên ngành" }]}>
                                <Select placeholder="Chọn chuyên ngành" disabled={filteredMajors.length === 0}>
                                    {filteredMajors.map((maj) => (
                                        <Option key={maj._id} value={maj._id}>{maj.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item label="Chủ đề" name="field" rules={[{ required: true, message: "Vui lòng chọn Chủ đề" }]}>
                                {/* SỬA Ở ĐÂY: Dùng trực tiếp biến 'fields' từ props, không cần lọc */}
                                <Select placeholder="Chọn chủ đề" showSearch optionFilterProp="children">
                                    {fields?.map((fld) => (
                                        <Option key={fld._id} value={fld._id}>{fld.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Năm" name="year" rules={[{ required: true, message: "Vui lòng nhập năm" }]}>
                                <InputNumber style={{ width: "100%" }} min={1900} max={new Date().getFullYear()} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Tệp luận văn"
                                name="fileUrl"
                                valuePropName="fileList"
                                getValueFromEvent={(e) => (Array.isArray(e) ? e : e && e.fileList)}
                            >
                                <Upload beforeUpload={() => false} maxCount={1} showUploadList={{ showRemoveIcon: false }}>
                                    <Button icon={<UploadOutlined />} style={{ width: "100%" }}>Thay thế tệp</Button>
                                </Upload>
                            </Form.Item>
                        </Col>
                    </Row>
                </Col>
            </Row>

            <Form.Item label="Tóm tắt" name="tom_tat" rules={[{ required: true, message: "Vui lòng nhập tóm tắt" }]} style={{ marginTop: 10 }}>
                <Input.TextArea rows={6} />
            </Form.Item>

            <Form.Item style={{ textAlign: 'right', marginTop: 20, marginBottom: 0 }}>
                <Button type="default" onClick={() => { form.resetFields(); onClose(); }} style={{ marginRight: 8 }}>
                    Hủy
                </Button>
                <Button type="primary" htmlType="submit" loading={mutationUpdate.isLoading}>
                    Cập nhật
                </Button>
            </Form.Item>
        </Form>
    </Modal>
  );
};

export default EditThesisComponent;