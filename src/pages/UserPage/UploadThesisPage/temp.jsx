// UploadThesisPage.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
    Form, Input, Upload, Button, message, Typography, Divider, Card,
    Row, Col, Progress, Collapse, Select, Space, Modal, Radio,
    Checkbox, Spin, Tag, Alert, Descriptions, Tooltip, Empty
} from "antd";
import {
    InboxOutlined, FileTextOutlined, TeamOutlined, ReadOutlined,
    MoreOutlined, PlusOutlined, SendOutlined, GlobalOutlined,
    InfoCircleOutlined, WarningOutlined, UserOutlined, RobotOutlined,
    SolutionOutlined, BookOutlined, CalendarOutlined, UsergroupAddOutlined,
    FilePdfOutlined, FileWordOutlined, CheckCircleOutlined, CloudUploadOutlined
} from "@ant-design/icons";

import * as TheSisService from "../../../services/TheSisService";
import * as SupervisorService from "../../../services/SupervisorService";
import * as CategoryService from "../../../services/CategoryService";
import * as MajorService from "../../../services/MajorService";
import * as FieldService from "../../../services/FieldService";
import * as SharingService from "../../../services/SharingService";
import * as Messages from "../../../components/Message/Message";
import DefaultLayout from "../../../components/DefaultLayout/DefaultLayout";
import BreadCrumbComponent from "../../../components/BreadcrumbComponent/BreadcrumbComponent";
import DuplicateCheckButtonComponent from "../../../components/DuplicateCheckButtonComponent/DuplicateCheckButtonComponent";

const { Dragger } = Upload;
const { Text, Title, Paragraph } = Typography;
const { Panel } = Collapse;
// Component phụ để xử lý văn bản dài (Xem thêm / Thu gọn)
const ExpandableText = ({ content, maxRows = 3 }) => {
    const [expanded, setExpanded] = useState(false);

    if (!content) return <Text type="secondary" italic>N/A</Text>;

    return (
        <div>
            {expanded ? (
                // TRẠNG THÁI MỞ RỘNG: Hiển thị full text + Nút thu gọn
                <div style={{ textAlign: 'justify' }}>
                    <Text style={{ color: '#595959' }}>{content}</Text>
                    <a 
                        style={{ marginLeft: 8, fontSize: 13, whiteSpace: 'nowrap' }} 
                        onClick={() => setExpanded(false)}
                    >
                        Thu gọn
                    </a>
                </div>
            ) : (
                // TRẠNG THÁI THU GỌN: Dùng Paragraph của AntD để cắt dòng
                <Paragraph 
                    ellipsis={{ 
                        rows: maxRows, 
                        expandable: true, 
                        symbol: 'xem thêm', 
                        onExpand: () => setExpanded(true) 
                    }}
                    style={{ margin: 0, textAlign: 'justify', color: '#595959' }}
                >
                    {content}
                </Paragraph>
            )}
        </div>
    );
};

const TEMP_SUP_PREFIX = "TEMP_SUP_";

const UploadThesisPage = () => {
    // --- KHAI BÁO STATE & HOOKS (GIỮ NGUYÊN) ---
    const user = useSelector((state) => state.auth.user);
    const [form] = Form.useForm();
    const [file, setFile] = useState(null);
    const [thumbnail, setThumbnail] = useState(null);

    const [extractedData, setExtractedData] = useState(null);
    const [extracted, setExtracted] = useState(false);

    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState({ percent: 0, status: "Chờ tải file..." });
    const [checkingProgress, setCheckingProgress] = useState(false);
    const [activeKey, setActiveKey] = useState(["general"]);

    const [isShareModalVisible, setIsShareModalVisible] = useState(false);
    const [sharingMode, setSharingMode] = useState("public");
    const [isCommitmentChecked, setIsCommitmentChecked] = useState(false);
    const [shareNote, setShareNote] = useState("");

    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [extractedMajorId, setExtractedMajorId] = useState(null);
    const [newFieldName, setNewFieldName] = useState('');
    const [fieldsOptions, setFieldsOptions] = useState([]);

    const [supervisorsOptions, setSupervisorsOptions] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [isConflictModalVisible, setIsConflictModalVisible] = useState(false);
    const [conflictDetails, setConflictDetails] = useState(null);

    // --- QUERIES & EFFECTS (GIỮ NGUYÊN) ---
    const getFileIcon = (fileName) => {
        if (!fileName) return <InboxOutlined style={{ fontSize: 48, color: "#bfbfbf" }} />;
        const ext = fileName.split('.').pop().toLowerCase();
        if (ext === "pdf") return <FilePdfOutlined style={{ fontSize: 48, color: "#ff4d4f" }} />;
        if (ext === "doc" || ext === "docx") return <FileWordOutlined style={{ fontSize: 48, color: "#1890ff" }} />;
        return <FileTextOutlined style={{ fontSize: 48, color: "#595959" }} />;
    };

    const queryGetAllCategories = useQuery({
        queryKey: ["getAllCategories"],
        queryFn: CategoryService.getCategories,
    });
    const { data: responseCategories, isLoading: isLoadingCategories } = queryGetAllCategories;
    const categories = responseCategories?.data || [];

    const queryGetMajors = useQuery({
        queryKey: ["getMajorsByCategoryId", selectedCategoryId],
        queryFn: () => MajorService.getMajorsByCategoryId(selectedCategoryId),
        enabled: !!selectedCategoryId,
    });
    const { data: responseMajors, isLoading: isLoadingMajors } = queryGetMajors;
    const majors = responseMajors?.data || [];

    const queryGetFields = useQuery({
        queryKey: ["getAllFields"],
        queryFn: FieldService.getAllFields,
    });
    const { data: responseFields, isLoading: isLoadingFields } = queryGetFields;
    const fields = responseFields?.data || [];

    useEffect(() => setFieldsOptions(fields), [fields]);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                if (user && mounted) {
                    setCurrentUser(user);
                    form.setFieldsValue({
                        authorName: user.name || "",
                        authorMSSV: user.mssv || ""
                    });
                }
            } catch (err) { console.warn(err); }
        })();
        return () => { mounted = false; };
    }, [form, user]);

    const handleCategoryChange = (categoryId) => {
        setSelectedCategoryId(categoryId);
        form.setFieldsValue({ major: undefined });
    };

    useEffect(() => {
        if (extractedMajorId && !isLoadingMajors) {
            const majorExists = majors.some(major => major._id === extractedMajorId);
            if (majorExists) {
                form.setFieldsValue({ major: extractedMajorId });
            } else if (majors.length > 0) {
                message.warning("Chuyên ngành trích xuất không khớp. Vui lòng chọn thủ công.");
                form.setFieldsValue({ major: undefined });
            }
            setExtractedMajorId(null);
        }
    }, [extractedMajorId, isLoadingMajors, majors, form]);

    const addNewField = () => {
        if (!newFieldName.trim()) { message.warning("Nhập tên chủ đề."); return; }
        const fieldName = newFieldName.trim();
        const tempId = `TEMP_NEW_${Date.now()}`;
        const newOption = { _id: tempId, name: fieldName, isNew: true };
        setFieldsOptions(prev => [...prev, newOption]);
        form.setFieldsValue({ field: tempId });
        message.success(`Đã thêm chủ đề tạm: "${fieldName}"`);
        setNewFieldName('');
    };

    useEffect(() => {
        let interval;
        if (checkingProgress) {
            interval = setInterval(async () => {
                try {
                    const result = await TheSisService.getProcess?.();
                    const progressData = result?.progress;
                    if (progressData) {
                        setProgress({ percent: progressData.percent || 0, status: progressData.status || "Đang xử lý..." });
                        if (progressData?.status && progressData.status.toLowerCase().includes("lỗi")) {
                            clearInterval(interval);
                            setCheckingProgress(false);
                            message.error(`Lỗi: ${progressData.status}`);
                        }
                    }
                } catch (err) { console.error(err); }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [checkingProgress]);

    const handleExtract = async () => {
        if (!file) return message.warning("Vui lòng chọn file trước");
        const formData = new FormData();
        formData.append("fileUrl", file);
        try {
            setLoading(true); setCheckingProgress(true);
            const result = await TheSisService.extractTheSisInfo(formData);
            if (!result?.data) { message.warning("Không thể trích xuất"); return; }
            const raw = result.data;
            setExtractedData(raw);

            // Logic map category/major/field giữ nguyên
            let mappedCategoryId = null;
            if (raw.category) {
                const catRes = await CategoryService.findCategoryIdByName(raw.category);
                if (catRes?.data) {
                    mappedCategoryId = catRes.data;
                    form.setFieldsValue({ category: mappedCategoryId });
                    setSelectedCategoryId(mappedCategoryId);
                } else {
                    message.warning(`Không tìm thấy khoa: ${raw.category}`);
                    form.setFieldsValue({ category: undefined });
                }
            }
            if (raw.major && mappedCategoryId) {
                const majRes = await MajorService.getMajorIdByName(raw.major);
                if (majRes?.data) setExtractedMajorId(majRes.data);
            }
            if (raw.field) {
                const fRes = await FieldService.findOrCreateField(raw.field);
                if (fRes?.data) form.setFieldsValue({ field: fRes.data });
                else {
                    const tempId = `TEMP_NEW_${Date.now()}`;
                    setFieldsOptions(prev => [...prev, { _id: tempId, name: raw.field, isNew: true }]);
                    form.setFieldsValue({ field: tempId });
                }
            }

            setExtracted(true);
            setActiveKey(["general", "authors", "organization", "advanced"]);
            message.success("Trích xuất thành công! Kiểm tra panel gợi ý.");
        } catch (err) {
            message.error("Lỗi trích xuất: " + (err.message || err));
        } finally {
            setLoading(false); setCheckingProgress(false); setProgress({ percent: 0, status: "Chờ tải file..." });
        }
    };

    const applySuggestion = ({ includeSupervisor = false } = {}) => {
        if (!extractedData) return;
        const safePayload = {
            title: extractedData.title,
            abstract: extractedData.abstract,
            tom_tat: extractedData.tom_tat,
            keywords: Array.isArray(extractedData.keywords) ? extractedData.keywords.join(", ") : extractedData.keywords,
            year: extractedData.year ? String(extractedData.year) : undefined,
            university: extractedData.university,
            thesisType: extractedData.thesisType,
            supervisorName: extractedData.supervisorName,
        };
        const filteredCoAuthorsNames = [];
        const filteredCoAuthorsMSSV = [];
        (extractedData?.coAuthorsMSSV || []).forEach((mssv, index) => {
            if (mssv !== currentUser?.mssv) {
                filteredCoAuthorsMSSV.push(mssv);
                filteredCoAuthorsNames.push(extractedData.coAuthorsNames[index] || "");
            }
        });
        safePayload.coAuthorsNames = filteredCoAuthorsNames.join(", ");
        safePayload.coAuthorsMSSV = filteredCoAuthorsMSSV.join(", ");

        form.setFieldsValue(safePayload);

        if (includeSupervisor && extractedData.supervisorName) {
            const extractedName = extractedData.supervisorName;
            const existingSup = supervisorsOptions.find(sup => sup.name === extractedName && !sup.isTemp);
            let targetSupId = null;
            if (existingSup) targetSupId = existingSup._id;
            else {
                const tempExisting = supervisorsOptions.find(sup => sup.name === extractedName && sup.isTemp);
                if (tempExisting) targetSupId = tempExisting._id;
                else {
                    const tempSupId = `${TEMP_SUP_PREFIX}${Date.now()}`;
                    setSupervisorsOptions(prev => [...prev, { _id: tempSupId, name: extractedName, isTemp: true }]);
                    targetSupId = tempSupId;
                }
            }
            if (targetSupId) form.setFieldsValue({ supervisorId: targetSupId });
        }
        message.success("Đã áp dụng thông tin gợi ý.");
    };

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const r = await SupervisorService.getSupervisorsList({});
                if (mounted && r?.data) setSupervisorsOptions(r.data);
                else setSupervisorsOptions([]);
            } catch (err) { console.warn(err); }
        })();
        return () => { mounted = false; };
    }, []);

    const uploadAndShareMutation = useMutation({
        mutationFn: async (data) => {
            setLoading(true);
            const { values, finalData } = data;
            const uploadResult = await TheSisService.uploadTheSis(finalData);
            if (!uploadResult?.data) throw new Error("Upload thất bại");
            const thesisId = uploadResult.data.data._id;
            if (values.sharingMode === "public" || values.sharingMode === "abstract_only") {
                await SharingService.requestShareThesis(thesisId, values.shareNote, values.sharingMode);
            }
        },
        onSuccess: () => {
            setLoading(false);
            message.success("Upload thành công!");
            setIsShareModalVisible(false);
            form.resetFields();
            setThumbnail(null); setFile(null); setExtracted(false); setActiveKey(["general"]); setExtractedData(null);
            setTimeout(() => window.location.href = "/", 1500);
        },
        onError: (err) => { setLoading(false); message.error("Lỗi: " + (err.message || err)); }
    });

    const handleSubmit = async () => {
        try {
            await form.validateFields();
            const currentMSSV = currentUser.mssv;
            const extractedMSSV = extractedData?.authorMSSV;

            if (currentMSSV && extractedMSSV && currentMSSV !== extractedMSSV) {
                setConflictDetails({
                    currentUserMSSV: currentMSSV,
                    extractedMSSV: extractedMSSV,
                    extractedName: extractedData.authorName
                });
                setIsConflictModalVisible(true);
                return;
            } else if (currentMSSV && extractedData?.coAuthorsMSSV && !extractedData.coAuthorsMSSV.includes(currentMSSV)) {
                setConflictDetails({
                    currentUserMSSV: currentMSSV,
                    extractedcoAuthorsMSSV: extractedData.coAuthorsMSSV,
                    extractedcoAuthorsName: extractedData.coAuthorsNames
                });
                setIsConflictModalVisible(true);
                return;
            }
            setIsShareModalVisible(true);
            setIsCommitmentChecked(false);
            setShareNote("");
        } catch { message.error("Vui lòng điền đầy đủ thông tin bắt buộc."); }
    };

    const handleConflictConfirm = (isAuthor) => {
        setIsConflictModalVisible(false);
        if (!isAuthor) {
            form.setFieldsValue({
                authorName: extractedData?.authorName || "",
                authorMSSV: extractedData?.authorMSSV || "",
                coAuthorsNames: Array.isArray(extractedData.coAuthorsNames) ? extractedData.coAuthorsNames.join(", ") : extractedData.coAuthorsNames,
                coAuthorsMSSV: Array.isArray(extractedData.coAuthorsMSSV) ? extractedData.coAuthorsMSSV.join(", ") : extractedData.coAuthorsMSSV
            });
            message.success("Đã xác nhận upload hộ.");
        } else {
            const filteredCoAuthorsMSSV = [];
            const filteredCoAuthorsNames = [];
            (extractedData?.coAuthorsMSSV || []).forEach((mssv, index) => {
                if (mssv !== currentUser?.mssv) {
                    filteredCoAuthorsMSSV.push(mssv);
                    filteredCoAuthorsNames.push(extractedData.coAuthorsNames[index] || "");
                }
            });
            form.setFieldsValue({
                authorName: currentUser?.name,
                authorMSSV: currentUser?.mssv,
                coAuthorsNames: filteredCoAuthorsNames,
                coAuthorsMSSV: filteredCoAuthorsMSSV,
            });
            message.success("Xác nhận tác giả chính thành công.");
        }
        setIsShareModalVisible(true);
        setIsCommitmentChecked(false);
        setShareNote("");
    };

    const handleConfirmUploadAndShare = () => {
        if (!isCommitmentChecked) return message.warning("Vui lòng cam kết trước khi gửi.");
        const values = form.getFieldsValue(true);
        try {
            let finalFieldId = values.field;
            if (finalFieldId && String(finalFieldId).startsWith("TEMP_NEW_")) {
                const newFieldObj = fieldsOptions.find(f => f._id === values.field);
                finalFieldId = newFieldObj ? newFieldObj.name : null;
            }
            let finalSupervisor = values.supervisorId;
            if (finalSupervisor && String(finalSupervisor).startsWith(TEMP_SUP_PREFIX)) {
                const sup = supervisorsOptions.find(s => s._id === finalSupervisor);
                finalSupervisor = sup ? sup.name : values.supervisorName || "";
            }

            const finalData = new FormData();
            if (thumbnail) finalData.append("thumbnail", thumbnail);
            finalData.append("fileUrl", file);
            // Append fields...
            Object.keys(values).forEach(key => {
                if (['coAuthorsNames', 'coAuthorsMSSV', 'keywords'].includes(key)) {
                    // Xử lý mảng/chuỗi sau
                } else if (key !== 'field' && key !== 'supervisor' && values[key]) {
                    finalData.append(key, values[key]);
                }
            });
            finalData.append("field", finalFieldId || "");
            finalData.append("supervisor", finalSupervisor || "");

            // Xử lý mảng đặc biệt
            const processArray = (val) => val ? (Array.isArray(val) ? val : String(val).split(",").map(x => x.trim()).filter(x => x)) : [];
            finalData.append("coAuthorsNames", JSON.stringify(processArray(values.coAuthorsNames)));
            finalData.append("coAuthorsMSSV", JSON.stringify(processArray(values.coAuthorsMSSV)));
            finalData.append("keywords", JSON.stringify(processArray(values.keywords)));

            uploadAndShareMutation.mutate({
                values: { ...values, sharingMode, shareNote },
                finalData
            });
        } catch (err) { message.error("Lỗi chuẩn bị dữ liệu."); }
    };

    const renderSupervisorOptions = () => (supervisorsOptions || []).map(s => (
        <Select.Option key={s._id} value={s._id}>{s.name}{s.isTemp ? ' (Gợi ý)' : ''}</Select.Option>
    ));

    // --- RENDER UI ---
    return (
        <DefaultLayout>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>
                <BreadCrumbComponent customNameMap={{ upload: "Upload Luận Văn" }} />

                <Row gutter={24}>
                    {/* CỘT TRÁI: FORM NHẬP LIỆU CHÍNH */}
                    <Col xs={24} lg={16}>
                        <Card style={{ borderRadius: 12, marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                                <Title level={2} style={{ color: '#1890ff', marginBottom: 8 }}>
                                    <CloudUploadOutlined /> Tải lên Luận Văn Mới
                                </Title>
                            </div>

                            {/* KHU VỰC UPLOAD FILE */}
                            <Dragger
                                name="fileUrl"
                                accept=".pdf,.docx"
                                beforeUpload={(f) => { setFile(f); return false; }}
                                onRemove={() => setFile(null)}
                                showUploadList={false}
                                style={{
                                    padding: '32px 0',
                                    background: '#f0f5ff',
                                    border: '2px dashed #1890ff',
                                    borderRadius: 12,
                                    marginBottom: 24
                                }}
                            >
                                <p className="ant-upload-drag-icon">
                                    {getFileIcon(file?.name)}
                                </p>
                                <p className="ant-upload-text" style={{ fontSize: 16, fontWeight: 500 }}>
                                    {file ? file.name : "Kéo thả hoặc nhấn để chọn file (PDF/DOCX)"}
                                </p>
                                <p className="ant-upload-hint">Hỗ trợ định dạng .pdf, .doc, .docx. Tối đa 50MB.</p>
                            </Dragger>

                            {/* NÚT TRÍCH XUẤT */}
                            <div style={{ textAlign: 'center', marginBottom: 32 }}>
                                <Button
                                    type="primary"
                                    size="large"
                                    shape="round"
                                    icon={<RobotOutlined />}
                                    onClick={handleExtract}
                                    disabled={!file || loading}
                                    loading={loading && !checkingProgress}
                                    style={{ height: 48, padding: '0 40px', fontSize: 16, fontWeight: 600, boxShadow: '0 4px 14px rgba(24, 144, 255, 0.3)' }}
                                >
                                    Trích xuất Thông tin Tự động
                                </Button>

                                {/* PROGRESS BAR */}
                                {checkingProgress && (
                                    <div style={{ maxWidth: 400, margin: '20px auto 0' }}>
                                        <Progress percent={progress.percent} status="active" strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }} />
                                        <Text type="secondary">{progress.status}</Text>
                                    </div>
                                )}
                            </div>

                            {/* FORM CHÍNH */}
                            <Form form={form} onFinish={handleSubmit} layout="vertical" initialValues={{ year: new Date().getFullYear().toString() }}>
                                <Collapse
                                    activeKey={activeKey}
                                    onChange={setActiveKey}
                                    ghost
                                    items={[
                                        {
                                            key: 'general',
                                            label: <Text strong style={{ fontSize: 16 }}><FileTextOutlined /> Thông tin chung</Text>,
                                            children: (
                                                <>
                                                    <Form.Item label="Tiêu đề luận văn" name="title" rules={[{ required: true, message: "Nhập tiêu đề" }]}>
                                                        <Input.TextArea autoSize={{ minRows: 2 }} placeholder="Nhập tiêu đề đầy đủ của luận văn" style={{ fontSize: 16, fontWeight: 500 }} />
                                                    </Form.Item>
                                                    <Row gutter={16}>
                                                        <Col span={12}>
                                                            <Form.Item label="Khoa/Viện" name="category" rules={[{ required: true }]}>
                                                                <Select placeholder="Chọn Khoa/Viện" onChange={handleCategoryChange} loading={isLoadingCategories}>
                                                                    {categories.map(c => <Select.Option key={c._id} value={c._id}>{c.name}</Select.Option>)}
                                                                </Select>
                                                            </Form.Item>
                                                        </Col>
                                                        <Col span={12}>
                                                            <Form.Item label="Chuyên ngành" name="major" rules={[{ required: true }]}>
                                                                <Select placeholder="Chọn Chuyên ngành" disabled={!selectedCategoryId} loading={isLoadingMajors}>
                                                                    {majors.map(m => <Select.Option key={m._id} value={m._id}>{m.name}</Select.Option>)}
                                                                </Select>
                                                            </Form.Item>
                                                        </Col>
                                                        <Col span={12}>
                                                            <Form.Item label="Chủ đề nghiên cứu" name="field" rules={[{ required: true }]}>
                                                                <Select
                                                                    showSearch
                                                                    placeholder="Chọn hoặc thêm mới"
                                                                    loading={isLoadingFields}
                                                                    filterOption={(input, option) => (option?.children?.[0] ?? '').toLowerCase().includes(input.toLowerCase())}
                                                                    popupRender={menu => (
                                                                        <>
                                                                            {menu}
                                                                            <Divider style={{ margin: '8px 0' }} />
                                                                            <Space style={{ padding: '0 8px 4px' }}>
                                                                                <Input placeholder="Chủ đề mới" value={newFieldName} onChange={e => setNewFieldName(e.target.value)} />
                                                                                <Button type="text" icon={<PlusOutlined />} onClick={addNewField} disabled={!newFieldName.trim()}>Thêm</Button>
                                                                            </Space>
                                                                        </>
                                                                    )}
                                                                >
                                                                    {fieldsOptions.map(f => <Select.Option key={f._id} value={f._id}>{f.name} {f.isNew && <Tag color="green">Mới</Tag>}</Select.Option>)}
                                                                </Select>
                                                            </Form.Item>
                                                        </Col>
                                                        <Col span={12}>
                                                            <Form.Item label="Năm hoàn thành" name="year" rules={[{ required: true }]}>
                                                                <Input type="number" />
                                                            </Form.Item>
                                                        </Col>
                                                    </Row>
                                                </>
                                            )
                                        },
                                        {
                                            key: 'authors',
                                            label: <Text strong style={{ fontSize: 16 }}><TeamOutlined /> Tác giả & Người hướng dẫn</Text>,
                                            children: (
                                                <>
                                                    <Row gutter={16}>
                                                        <Col span={12}>
                                                            <Card size="small" title="Tác giả chính" type="inner">
                                                                <Form.Item label="Họ tên" name="authorName"><Input disabled={!!currentUser} /></Form.Item>
                                                                <Form.Item label="MSSV" name="authorMSSV"><Input disabled={!!currentUser} /></Form.Item>
                                                            </Card>
                                                        </Col>
                                                        <Col span={12}>
                                                            <Card size="small" title="Người hướng dẫn" type="inner">
                                                                <Form.Item label="Giảng viên" name="supervisorId" rules={[{ required: true }]}>
                                                                    <Select placeholder="Chọn giảng viên" showSearch filterOption={(input, option) => String(option.children).toLowerCase().includes(input.toLowerCase())}>
                                                                        {renderSupervisorOptions()}
                                                                    </Select>
                                                                </Form.Item>
                                                            </Card>
                                                        </Col>
                                                    </Row>
                                                    <Divider orientation="left" plain style={{ fontSize: 14 }}>Đồng tác giả (nếu có)</Divider>
                                                    <Row gutter={16}>
                                                        <Col span={12}><Form.Item label="Tên Đồng tác giả" name="coAuthorsNames"><Input.TextArea placeholder="Nguyễn Văn A, Trần Thị B..." rows={2} /></Form.Item></Col>
                                                        <Col span={12}><Form.Item label="MSSV Đồng tác giả" name="coAuthorsMSSV"><Input.TextArea placeholder="B123456, B654321..." rows={2} /></Form.Item></Col>
                                                    </Row>
                                                </>
                                            )
                                        },
                                        {
                                            key: 'organization',
                                            label: <Text strong style={{ fontSize: 16 }}><ReadOutlined /> Thông tin đơn vị</Text>,
                                            children: (
                                                <Row gutter={16}>
                                                    <Col span={12}><Form.Item label="Trường Đại học" name="university"><Input /></Form.Item></Col>
                                                    <Col span={12}><Form.Item label="Cấp độ học thuật" name="thesisType" rules={[{ required: true }]}><Input placeholder="VD: Khóa luận tốt nghiệp" /></Form.Item></Col>
                                                </Row>
                                            )
                                        },
                                        {
                                            key: 'advanced',
                                            label: <Text strong style={{ fontSize: 16 }}><MoreOutlined /> Thông tin nâng cao</Text>,
                                            children: (
                                                <>
                                                    <Form.Item label="Tóm tắt (Tiếng Việt)" name="tom_tat"><Input.TextArea rows={4} /></Form.Item>
                                                    <Form.Item label="Abstract (Tiếng Anh)" name="abstract"><Input.TextArea rows={4} /></Form.Item>
                                                    <Form.Item label="Từ khóa (Keywords)" name="keywords"><Input placeholder="AI, Machine Learning, Web..." /></Form.Item>
                                                    <Form.Item label="Ảnh bìa (Thumbnail)">
                                                        <Upload accept="image/*" beforeUpload={(f) => { setThumbnail(f); return false; }} onRemove={() => setThumbnail(null)} showUploadList={false}>
                                                            <Button icon={<PlusOutlined />}>Chọn ảnh</Button>
                                                        </Upload>
                                                        {thumbnail && <div style={{ marginTop: 10 }}><img src={URL.createObjectURL(thumbnail)} alt="thumb" style={{ height: 100, borderRadius: 8, border: '1px solid #d9d9d9' }} /></div>}
                                                    </Form.Item>
                                                </>
                                            )
                                        }
                                    ]}
                                />

                                <Divider />
                                <div style={{ textAlign: 'center' }}>
                                    <DuplicateCheckButtonComponent form={form} />
                                    <Button type="primary" htmlType="submit" loading={loading} size="large" shape="round" style={{ minWidth: 200, height: 50, fontSize: 18, marginLeft: 16 }}>
                                        Tiếp tục & Chia sẻ
                                    </Button>
                                </div>
                            </Form>
                        </Card>
                    </Col>

                    {/* CỘT PHẢI: PANEL GỢI Ý (STICKY) */}
                    <Col xs={24} lg={8}>
                        <div style={{ position: 'sticky', top: 20 }}>
                            <Card
                                title={<span style={{ color: '#1890ff', fontSize: 16, fontWeight: 600 }}><RobotOutlined /> Gợi ý từ AI</span>}
                                size="small"
                                style={{
                                    borderRadius: 12,
                                    border: '1px solid #bae7ff',
                                    background: '#f0faff',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    height: '100%', // Để card full chiều cao của cột cha (nếu dùng flex layout) hoặc fit content
                                    maxHeight: '85vh', // Giới hạn chiều cao tối đa so với màn hình để không bị quá dài
                                }}
                                
                                styles={{
                                    body:{
                                        overflow: 'hidden', // Ẩn scrollbar của body card
                                        padding: 0, // Reset padding để custom scroll bên trong
                                        display: 'flex',
                                        flexDirection: 'column',
                                        flex: 1}
                                }}
                            >
                                {!extractedData ? (
                                    <div style={{ padding: 24, textAlign: 'center' }}>
                                        <Empty 
                                            image={Empty.PRESENTED_IMAGE_SIMPLE} 
                                            description={<Text type="secondary">Tải file và bấm <strong>Trích xuất</strong> để xem gợi ý tại đây.</Text>} 
                                        />
                                    </div>
                                ) : (
                                    <div 
                                        style={{ 
                                            overflowY: 'auto', // Scroll nội dung bên trong
                                            padding: '16px',
                                            flex: 1, // Chiếm hết không gian còn lại
                                        }}
                                        className="custom-scrollbar" // Có thể thêm class CSS tùy chỉnh scrollbar cho đẹp
                                    >
                                        <Descriptions 
                                            column={1} 
                                            size="small" 
                                            colon={true}
                                            labelStyle={{ 
                                                minWidth: '70px', // Đặt độ rộng tối thiểu cho nhãn để thẳng hàng
                                                fontWeight: 600, 
                                                color: '#595959',
                                                verticalAlign: 'top' // Căn lề trên nếu nội dung dài dòng
                                            }}
                                            contentStyle={{ marginBottom: 12 }} // display block để text dài xuống dòng đúng
                                        >
                                            {/* TIÊU ĐỀ */}
                                            <Descriptions.Item label="Tiêu đề">
                                                <Paragraph 
                                                    style={{ color: '#1890ff', fontWeight: 600, margin: 0 }} 
                                                    ellipsis={{ rows: 3, expandable: true, symbol: 'Xem thêm' }}
                                                >
                                                    {extractedData.title || <Text type="secondary" italic>[Chưa trích xuất được]</Text>}
                                                </Paragraph>
                                            </Descriptions.Item>

                                            {/* TÁC GIẢ & MSSV */}
                                            {(extractedData.authorName && extractedData.authorMSSV) && (
                                                <Descriptions.Item label="Tác giả">
                                                    <Space>
                                                        <Text strong>{extractedData.authorName }</Text>
                                                        {extractedData.authorMSSV && <Tag color="blue">{extractedData.authorMSSV}</Tag>}
                                                    </Space>
                                                </Descriptions.Item>
                                            )}
                                            {/* ĐỒNG TÁC GIẢ */}
                                            {(extractedData.coAuthorsNames?.length > 0 || extractedData.coAuthorsMSSV?.length > 0) && (
                                                <>
                                                <Descriptions.Item label="Đồng tác giả">
                                                    <Space>
                                                        {extractedData.coAuthorsNames?.map((n, i) => <Tag key={`n-${i}`}>{n}</Tag>)}
                                                    </Space>
                                                </Descriptions.Item>
                                                <Descriptions.Item label="MSSV Đồng tác giả">
                                                    <Space>
                                                        {extractedData.coAuthorsMSSV?.map((m, i) => <Tag key={`m-${i}`} color="cyan">{m}</Tag>)}
                                                    </Space>
                                                    </Descriptions.Item>
                                                </>

                                            )}

                                            {/* GVHD */}
                                            <Descriptions.Item label="GVHD">
                                                <Text>{extractedData.supervisorName || <Text type="secondary">N/A</Text>}</Text>
                                            </Descriptions.Item>

                                            z

                                            {/* TỪ KHÓA */}
                                            {extractedData.keywords?.length > 0 && (
                                                <Descriptions.Item label="Từ khóa">
                                                    <Space wrap size={[4, 4]}>
                                                        {extractedData.keywords.map((k, i) => <Tag key={i} color="purple">{k}</Tag>)}
                                                    </Space>
                                                </Descriptions.Item>
                                            )}

                                            {/* NĂM */}
                                            {extractedData.year && (
                                                <Descriptions.Item label="Năm">
                                                    <Tag color="geekblue">{extractedData.year}</Tag>
                                                </Descriptions.Item>
                                            )}

                                            {/* TÓM TẮT (Dùng component ExpandableText vừa tạo) */}
                                            <Descriptions.Item label="Tóm tắt">
                                                <ExpandableText content={extractedData.tom_tat} />
                                            </Descriptions.Item>

                                            {/* ABSTRACT */}
                                            <Descriptions.Item label="Abstract">
                                                <div style={{ fontStyle: 'italic' }}>
                                                    <ExpandableText content={extractedData.abstract} />
                                                </div>
                                            </Descriptions.Item>
                                        </Descriptions>

                                        <Divider style={{ margin: '16px 0' }} />

                                        {/* BUTTONS ACTION */}
                                        <Space direction="vertical" style={{ width: '100%' }}>
                                            <Button block type="primary" icon={<CheckCircleOutlined />} onClick={() => applySuggestion({ includeSupervisor: true })}>
                                                Áp dụng gợi ý (Kèm GVHD)
                                            </Button>
                                            <Button block onClick={() => applySuggestion({ includeSupervisor: false })}>
                                                Áp dụng (Chừa GVHD)
                                            </Button>
                                            <Button block danger type="text" size="small" onClick={() => setExtractedData(null)}>
                                                Xóa gợi ý
                                            </Button>
                                        </Space>
                                    </div>
                                )}
                            </Card>
                        </div>
                    </Col>
                </Row>

                {/* --- MODAL SHARE --- */}
                <Modal
                    title={<Title level={4} style={{ margin: 0, color: '#1890ff' }}><SendOutlined /> Xác Nhận Gửi & Chia Sẻ</Title>}
                    open={isShareModalVisible}
                    onCancel={() => setIsShareModalVisible(false)}
                    width={600}
                    footer={[
                        <Button key="back" onClick={() => { setIsShareModalVisible(false); setIsConflictModalVisible(true); }}>Quay lại</Button>,
                        <Button key="submit" type="primary" loading={uploadAndShareMutation.isPending} disabled={!isCommitmentChecked} onClick={handleConfirmUploadAndShare}>
                            Xác nhận Gửi
                        </Button>
                    ]}
                >
                    <Card type="inner" size="small" style={{ background: '#f5f5f5', marginBottom: 16 }}>
                        <Text strong>Đang gửi:</Text> <Text style={{ color: '#1890ff' }}>{form.getFieldValue('title')}</Text>
                    </Card>
                    <Title level={5}><GlobalOutlined /> Chọn chế độ chia sẻ</Title>
                    <Radio.Group onChange={(e) => setSharingMode(e.target.value)} value={sharingMode} style={{ width: '100%' }}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Card size="small" hoverable style={{ borderColor: sharingMode === 'public' ? '#1890ff' : undefined }} onClick={() => setSharingMode('public')}>
                                <Radio value="public"><Text strong>Công khai toàn văn</Text></Radio>
                                <Tag color="success" style={{ float: 'right' }}>Khuyên dùng</Tag>
                                <div style={{ marginLeft: 24, color: '#8c8c8c', fontSize: 12 }}>Chia sẻ rộng rãi cho cộng đồng. Cần kiểm duyệt.</div>
                            </Card>
                            <Card size="small" hoverable style={{ borderColor: sharingMode === 'abstract_only' ? '#1890ff' : undefined }} onClick={() => setSharingMode('abstract_only')}>
                                <Radio value="abstract_only"><Text strong>Công khai tóm tắt</Text></Radio>
                                <Tag color="processing" style={{ float: 'right' }}>An toàn</Tag>
                                <div style={{ marginLeft: 24, color: '#8c8c8c', fontSize: 12 }}>Chỉ hiện thông tin cơ bản. File PDF được bảo mật.</div>
                            </Card>
                            <Card size="small" hoverable style={{ borderColor: sharingMode === 'internal' ? '#1890ff' : undefined }} onClick={() => setSharingMode('internal')}>
                                <Radio value="internal"><Text strong>Nội bộ</Text></Radio>
                                <div style={{ marginLeft: 24, color: '#8c8c8c', fontSize: 12 }}>Chỉ lưu hành nội bộ trường.</div>
                            </Card>
                        </Space>
                    </Radio.Group>
                    <Divider />
                    <Checkbox checked={isCommitmentChecked} onChange={(e) => setIsCommitmentChecked(e.target.checked)}>
                        <Text strong style={{ color: isCommitmentChecked ? '#52c41a' : undefined }}>Tôi cam kết tài liệu hợp pháp và chịu trách nhiệm về nội dung.</Text>
                    </Checkbox>
                </Modal>

                {/* --- MODAL CONFLICT --- */}
                <Modal
                    title={<span style={{ color: '#faad14' }}><WarningOutlined /> Cảnh báo Xung đột Tác giả</span>}
                    open={isConflictModalVisible}
                    onCancel={() => setIsConflictModalVisible(false)}
                    footer={null}
                    width={500}
                >
                    <Alert
                        message="Thông tin MSSV không khớp"
                        description="Thông tin trích xuất từ file khác với tài khoản đang đăng nhập."
                        type="warning"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />
                    <Card size="small" style={{ background: '#fffbe6', border: '1px solid #ffe58f', marginBottom: 16 }}>
                        <Descriptions column={1} size="small">
                            <Descriptions.Item label="Tài khoản của bạn"><Text strong>{conflictDetails?.currentUserMSSV}</Text></Descriptions.Item>
                            <Descriptions.Item label="Trích xuất từ file"><Text type="danger" strong>{conflictDetails?.extractedMSSV || conflictDetails?.extractedcoAuthorsMSSV?.join(', ')}</Text></Descriptions.Item>
                        </Descriptions>
                    </Card>
                    <div style={{ textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => handleConflictConfirm(false)}>Upload hộ (Dùng thông tin File)</Button>
                            <Button type="primary" onClick={() => handleConflictConfirm(true)}>Tôi là tác giả (Sửa sai cho AI)</Button>
                        </Space>
                    </div>
                </Modal>

            </div>
        </DefaultLayout>
    );
};

export default UploadThesisPage;