import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
    Form, Input, Upload, Button, message, Typography, Divider, Card,
    Row, Col, Progress, Collapse, Select, Space, Modal, Radio,
    Checkbox, Tag, Alert, Descriptions, Empty
} from "antd";
import {
    InboxOutlined, FileTextOutlined, TeamOutlined, MoreOutlined, 
    PlusOutlined, SendOutlined, GlobalOutlined, WarningOutlined, 
    RobotOutlined, FilePdfOutlined, FileWordOutlined, CheckCircleOutlined, 
    DeleteOutlined,CloudUploadOutlined, LoadingOutlined, SyncOutlined
} from "@ant-design/icons";

import * as TheSisService from "../../../services/TheSisService";
import * as SupervisorService from "../../../services/SupervisorService";
import * as CategoryService from "../../../services/CategoryService";
import * as MajorService from "../../../services/MajorService";
import * as FieldService from "../../../services/FieldService";
import * as SharingService from "../../../services/SharingService";
import DefaultLayout from "../../../components/DefaultLayout/DefaultLayout";
import BreadCrumbComponent from "../../../components/BreadcrumbComponent/BreadcrumbComponent";
import DuplicateCheckButtonComponent from "../../../components/DuplicateCheckButtonComponent/DuplicateCheckButtonComponent";

const { Dragger } = Upload;
const { Text, Title, Paragraph } = Typography;

// Component phụ: ExpandableText
const ExpandableText = ({ content, maxRows = 3 }) => {
    const [expanded, setExpanded] = useState(false);
    if (!content) return <Text type="secondary" italic>N/A</Text>;
    return (
        <div>
            {expanded ? (
                <div style={{ textAlign: 'justify' }}>
                    <Text style={{ color: '#595959' }}>{content}</Text>
                    <a style={{ marginLeft: 8, fontSize: 13, whiteSpace: 'nowrap' }} onClick={() => setExpanded(false)}>Thu gọn</a>
                </div>
            ) : (
                <Paragraph ellipsis={{ rows: maxRows, expandable: true, symbol: 'xem thêm', onExpand: () => setExpanded(true) }} style={{ margin: 0, textAlign: 'justify', color: '#595959' }}>
                    {content}
                </Paragraph>
            )}
        </div>
    );
};

const TEMP_SUP_PREFIX = "TEMP_SUP_";
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const UploadThesisPage = () => {
    // --- STATE ---
    const user = useSelector((state) => state.auth.user);
    const [form] = Form.useForm();
    const [file, setFile] = useState(null);
    const [thumbnail, setThumbnail] = useState(null);

    const [extractedData, setExtractedData] = useState(null);
    const [extracted, setExtracted] = useState(false);
    const [isCheckModalOpen, setIsCheckModalOpen] = useState(false); // Modal kết quả check trùng
    const [checkResult, setCheckResult] = useState(null); // Kết quả check trùng
    
    // 🔥 State xử lý tiến trình
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState({ percent: 0, status: "Chờ tải file..." });
    const [checkingProgress, setCheckingProgress] = useState(false);
    
    // Refs
    const abortControllerRef = useRef(null);
    const debounceTimerRef = useRef(null);

    // UI States khác
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

    // --- LOGIC MAP DỮ LIỆU ---
    const applyExtractedDataToUI = async (raw) => {
        // 1. Lưu dữ liệu thô vào state (để dùng cho mục đích khác nếu cần)
        setExtractedData(raw);

        // 2. Xử lý Lĩnh vực (Field)
        if (raw.field) {
            if (raw.isNewField) {
                // --- TRƯỜNG HỢP MỚI (TEXT) ---
                const tempId = `TEMP_NEW_${Date.now()}`; // Tạo ID giả
                const newOption = { _id: tempId, name: raw.field, isNew: true };

                setFieldsOptions(prev => {
                    // Kiểm tra xem trong list đã có cái tên này chưa để tránh add trùng
                    const isExist = prev.find(item => item.name.toLowerCase() === raw.field.toLowerCase());
                    if (isExist) {
                        // Nếu có rồi thì dùng ID của cái đó luôn
                        form.setFieldsValue({ field: isExist._id });
                        return prev;
                    }
                    // Nếu chưa có thì thêm mới
                    return [...prev, newOption];
                });

                // Set giá trị cho form (dùng tempId)
                // Lưu ý: Nếu logic check trùng bên trên chạy vào if(isExist) thì dòng này sẽ bị ghi đè, không sao cả.
                form.setFieldsValue({ field: tempId });

            } else {
                // --- TRƯỜNG HỢP CŨ (ID) --- (Bạn đang thiếu cái này)
                // Backend trả về ID thật (ví dụ: "65d8a...")
                form.setFieldsValue({ field: raw.field });
            }
        }
        // 3. Xử lý Khoa & Ngành (Logic Cascader)
        if(raw.category){
            // Backend trả về id, set luôn
            form.setFieldsValue({ category: raw.category });
            setSelectedCategoryId(raw.category);
            
            if (raw.major){
                form.setFieldsValue({ major: raw.major });
                setExtractedMajorId(raw.major);
            }
        }

        setExtracted(true);
        setActiveKey(["general", "authors", "organization", "advanced"]);
    };

    // --- MAIN LOGIC: EXTRACT & CANCEL ---

    // Hàm Hủy bỏ (Cancel)
    const handleAbort = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort(); // Ngắt API ngay lập tức
            abortControllerRef.current = null;
        }
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        
        setLoading(false);
        setProgress({ percent: 0, status: "Đã hủy thao tác." });
        message.warning("Đã hủy trích xuất thông tin.");
    };

    // Hàm Trích xuất (Extract)
    const handleExtract = async (directFile = null, isAutoTrigger = false) => {
        // Clear timer cũ nếu có
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        
        // Kiểm tra file có không
        const targetFile = directFile || file;
        if (!targetFile) return message.warning("Vui lòng chọn file trước");

        // --- BẮT ĐẦU ---
        setLoading(true); setCheckingProgress(true);
        
        // Tạo Controller mới để có thể hủy
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setProgress({ percent: 5, status: "Đang gửi file đến Server..." });

        try {
            const formData = new FormData();
            formData.append("fileUrl", targetFile);

            // 3. Gọi API (Không cần vòng lặp while nếu không có logic retry phức tạp)
            const result = await TheSisService.extractTheSisInfo(formData, { 
                signal: controller.signal 
            });
            const data = result?.data;
            console.log("Extract result data:", data);

            // 4. Kiểm tra dữ liệu trả về
            if (!data || data.status === 'error') {
                console.log("Extract error data:", data);
                throw new Error(data?.message || "Không có dữ liệu trả về từ Server");
            }

            // 5. Thành công
            await applyExtractedDataToUI(data);
            // --- ĐOẠN LOGIC MỚI: CHECK TRÙNG LẶP ---
        console.log("Đang kiểm tra trùng lặp ngầm...");
        
        // Gọi API check trùng
        const checkRes = await TheSisService.checkDuplicateThesis(
            data.title,
            data.tom_tat || "",
            data.keywords
        );

        const results = checkRes?.data || [];
        
        // 3. LOGIC QUYẾT ĐỊNH MỞ MODAL HAY KHÔNG
        if (results.length > 0) {
            // Sắp xếp kết quả
            results.sort((a, b) => (b.similarity || 0) - (a.similarity || 0));
            const maxScore = Math.round((results[0].similarity || 0) * 100);

            // CHỈ MỞ KHI CÓ ĐỘ TRÙNG ĐÁNG KỂ (Ví dụ > 80%)
            // Nếu bạn muốn hễ có trùng là hiện thì bỏ điều kiện maxScore
            if (maxScore >= 80) { 
                setCheckResult(results); // Cập nhật dữ liệu cho nút con
                setIsCheckModalOpen(true); // <--- CHỈ MỞ MODAL TẠI ĐÂY
            } else {
                 setCheckResult(results); 
            }
        } else {
            // KHÔNG TRÙNG -> Không làm gì cả, hoặc báo thành công
            setCheckResult([]); // Clear kết quả cũ
        }
        // ----------------------------------------
            // Force progress lên 100% để giao diện đẹp
            setProgress({ percent: 100, status: "Hoàn tất!" }); 
            message.success("Trích xuất thành công!");

        } catch (err) {
            // 6. Xử lý lỗi
            if (err.name === 'AbortError' || err.message === 'CanceledByUser' || err.message === 'canceled') return; // Bỏ qua nếu là hủy

            const msg = err.response?.data?.message || err.message || "Đã xảy ra lỗi.";
            message.error(msg);

            setProgress({ percent: 0, status: "Lỗi xử lý." });
        } finally {
            // 7. Dọn dẹp
            setLoading(false);
            setCheckingProgress(false); // Dừng Polling
            if (abortControllerRef.current === controller) {
                abortControllerRef.current = null;
            }
        }
    };

    useEffect(() => {
        let interval;
        if (checkingProgress) {
            interval = setInterval(async () => {
                try {
                    const result = await TheSisService.getProcess?.();
                    console.log("Progress check:", result);
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


    // --- QUERIES & UI LOGIC KHÁC (GIỮ NGUYÊN) ---
    const getFileIcon = (fileName) => {
        if (!fileName) return <InboxOutlined style={{ fontSize: 48, color: "#bfbfbf" }} />;
        const ext = fileName.split('.').pop().toLowerCase();
        if (ext === "pdf") return <FilePdfOutlined style={{ fontSize: 48, color: "#ff4d4f" }} />;
        if (ext === "doc" || ext === "docx") return <FileWordOutlined style={{ fontSize: 48, color: "#1890ff" }} />;
        return <FileTextOutlined style={{ fontSize: 48, color: "#595959" }} />;
    };

    const { data: responseCategories, isLoading: isLoadingCategories } = useQuery({
        queryKey: ["getAllCategories"],
        queryFn: CategoryService.getCategories,
    });
    const categories = responseCategories?.data || [];

    const { data: responseMajors, isLoading: isLoadingMajors } = useQuery({
        queryKey: ["getMajorsByCategoryId", selectedCategoryId],
        queryFn: () => MajorService.getMajorsByCategoryId(selectedCategoryId),
        enabled: !!selectedCategoryId,
    });
    const majors = responseMajors?.data || [];

    const { data: responseFields, isLoading: isLoadingFields } = useQuery({
        queryKey: ["getAllFields"],
        queryFn: FieldService.getAllFields,
    });
    const fields = responseFields?.data || [];
    
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (loading || extractedData) { 
                e.preventDefault();
                e.returnValue = ''; 
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [loading, extractedData]);

    useEffect(() => setFieldsOptions(fields), [fields]);

    useEffect(() => {
        if (user) {
            setCurrentUser(user);
            form.setFieldsValue({ authorName: user.name || "", authorMSSV: user.mssv || "" });
        }
    }, [form, user]);

    const handleCategoryChange = (categoryId) => {
        setSelectedCategoryId(categoryId);
        form.setFieldsValue({ major: undefined });
    };

    useEffect(() => {
        if (extractedMajorId && !isLoadingMajors) {
            const majorExists = majors.some(major => major._id === extractedMajorId);
            if (majorExists) form.setFieldsValue({ major: extractedMajorId });
            else if (majors.length > 0) {
                message.warning("Chuyên ngành không khớp, vui lòng chọn tay.");
                form.setFieldsValue({ major: undefined });
            }
            setExtractedMajorId(null);
        }
    }, [extractedMajorId, isLoadingMajors, majors, form]);

    const addNewField = () => {
        if (!newFieldName.trim()) return message.warning("Nhập tên chủ đề.");
        const tempId = `TEMP_NEW_${Date.now()}`;
        setFieldsOptions(prev => [...prev, { _id: tempId, name: newFieldName.trim(), isNew: true }]);
        form.setFieldsValue({ field: tempId });
        setNewFieldName('');
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
            let targetSupId = existingSup?._id;
            if (!targetSupId) {
                const tempExisting = supervisorsOptions.find(sup => sup.name === extractedName && sup.isTemp);
                targetSupId = tempExisting?._id;
                if (!targetSupId) {
                    const tempSupId = `${TEMP_SUP_PREFIX}${Date.now()}`;
                    setSupervisorsOptions(prev => [...prev, { _id: tempSupId, name: extractedName, isTemp: true }]);
                    targetSupId = tempSupId;
                }
            }
            if (targetSupId) form.setFieldsValue({ supervisorId: targetSupId });
        }
        message.success("Đã áp dụng gợi ý.");
    };

    useEffect(() => {
        const fetchSup = async () => {
            try {
                const r = await SupervisorService.getSupervisorsList({});
                if (r?.data) setSupervisorsOptions(r.data);
            } catch (e) { console.warn(e); }
        };
        fetchSup();
    }, []);

    const uploadAndShareMutation = useMutation({
        mutationFn: async (data) => {
            setLoading(true);
            const { values, finalData } = data;
            const uploadResult = await TheSisService.uploadTheSis(finalData);
            if (!uploadResult?.data) throw new Error("Upload thất bại");
            const thesisId = uploadResult.data.data._id;
            if (["public","abstract_only","internal", "private"].includes(values.sharingMode) ) {
                await SharingService.requestShareThesis(thesisId, values.shareNote, values.sharingMode);
            }
        },
        onSuccess: () => {
            setLoading(false);
            
            // 1. Reset Form & State ngay lập tức
            setIsShareModalVisible(false);
            form.resetFields();
            setThumbnail(null); setFile(null); setExtracted(false); setActiveKey(["general"]); setExtractedData(null);

            // 2. Tạo logic đếm ngược
            let secondsToGo = 3;
            
            const modal = Modal.success({
                title: 'Upload thành công!',
                content: `Bạn sẽ được chuyển đến trang luận văn của tôi sau ${secondsToGo} giây...`,
                okText: 'Chuyển ngay',
                keyboard: false,
                maskClosable: false,
                onOk: () => {
                    // Nếu người dùng bấm nút thì chuyển luôn
                    clearInterval(timer);
                    window.location.href = "/my-thesis";
                }
            });

            // 3. Cập nhật Modal mỗi giây
            const timer = setInterval(() => {
                secondsToGo -= 1;
                
                // Update nội dung modal
                modal.update({
                    content: `Bạn sẽ chuyển về trang luận văn của tôi sau ${secondsToGo} giây...`,
                });

                // Khi đếm về 0
                if (secondsToGo === 0) {
                    clearInterval(timer);
                    modal.destroy(); // Tắt modal
                    window.location.href = "/my-thesis"; // Chuyển trang
                }
            }, 1000);
        },
        onError: (err) => { setLoading(false); message.error("Lỗi: " + (err.message || err)); }
    });

    const handleSubmit = async () => {
        try {
            await form.validateFields();
            const currentMSSV = currentUser.mssv;
            const extractedMSSV = extractedData?.authorMSSV;

            if (currentMSSV && extractedMSSV && currentMSSV !== extractedMSSV) {
                setConflictDetails({ currentUserMSSV: currentMSSV, extractedMSSV: extractedMSSV, extractedName: extractedData.authorName });
                setIsConflictModalVisible(true);
                return;
            } else if (currentMSSV && extractedData?.coAuthorsMSSV && !extractedData.coAuthorsMSSV.includes(currentMSSV)) {
                setConflictDetails({ currentUserMSSV: currentMSSV, extractedcoAuthorsMSSV: extractedData.coAuthorsMSSV, extractedcoAuthorsName: extractedData.coAuthorsNames });
                setIsConflictModalVisible(true);
                return;
            }
            setIsShareModalVisible(true);
            setIsCommitmentChecked(false);
            setShareNote("");
        } catch { message.error("Vui lòng điền đủ thông tin."); }
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
                authorName: currentUser?.name, authorMSSV: currentUser?.mssv,
                coAuthorsNames: filteredCoAuthorsNames, coAuthorsMSSV: filteredCoAuthorsMSSV,
            });
            message.success("Xác nhận tác giả chính.");
        }
        setIsShareModalVisible(true);
        setIsCommitmentChecked(false);
        setShareNote("");
    };

    const handleConfirmUploadAndShare = () => {
        if (!file) return message.error("Không tìm thấy file upload.");
        if (!isCommitmentChecked) return message.warning("Vui lòng cam kết.");
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
            Object.keys(values).forEach(key => {
                if (['coAuthorsNames', 'coAuthorsMSSV', 'keywords'].includes(key)) return;
                if (key !== 'field' && key !== 'supervisor' && values[key]) finalData.append(key, values[key]);
            });
            finalData.append("field", finalFieldId || "");
            finalData.append("supervisor", finalSupervisor || "");

            const processArray = (val) => val ? (Array.isArray(val) ? val : String(val).split(",").map(x => x.trim()).filter(x => x)) : [];
            finalData.append("coAuthorsNames", JSON.stringify(processArray(values.coAuthorsNames)));
            finalData.append("coAuthorsMSSV", JSON.stringify(processArray(values.coAuthorsMSSV)));
            finalData.append("keywords", JSON.stringify(processArray(values.keywords)));

            uploadAndShareMutation.mutate({ values: { ...values, sharingMode, shareNote }, finalData });
        } catch (err) { message.error("Lỗi chuẩn bị dữ liệu."); }
    };

    const renderSupervisorOptions = () => (supervisorsOptions || []).map(s => (
        <Select.Option key={s._id} value={s._id}>{s.name}{s.isTemp ? ' (Gợi ý)' : ''}</Select.Option>
    ));

    return (
        <DefaultLayout>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>
                <BreadCrumbComponent customNameMap={{ upload: "Upload Luận Văn" }} />
                <Row gutter={24}>
                    {/* CỘT TRÁI: FORM */}
                    <Col xs={24} lg={16}>
                        <Card style={{ borderRadius: 12, marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                                <Title level={2} style={{ color: '#1890ff', marginBottom: 8 }}><CloudUploadOutlined /> Tải lên Luận Văn Mới</Title>
                            </div>

                            {/* DRAGGER: AUTO START */}
                            {!file ? (
                                // 1. CHƯA CÓ FILE: Hiện khung Dragger to để dễ kéo thả
                                <Dragger
                                    name="fileUrl" accept=".pdf,.docx"
                                    beforeUpload={(f) => { setFile(f); handleExtract(f, true); return false; }}
                                    onRemove={() => { setFile(null); handleAbort(); }}
                                    showUploadList={false}
                                    disabled={loading}
                                    style={{ padding: '32px 0', background: '#f0f5ff', border: '2px dashed #1890ff', borderRadius: 12, marginBottom: 24, cursor: loading ? 'not-allowed' : 'pointer' }}
                                >
                                    <p>{getFileIcon(file?.name)}</p>
                                    <p className="ant-upload-text" style={{ fontSize: 16, fontWeight: 500 }}>{file ? file.name : "Kéo thả hoặc nhấn để chọn file (PDF/DOCX)"}</p>
                                    <p className="ant-upload-hint">Hỗ trợ định dạng .pdf, .doc, .docx. Tối đa 50MB.</p>
                                </Dragger>
                            ) : (// 2. ĐÃ CÓ FILE: Hiện thẻ nhỏ gọn
                                <Card size="small" style={{ marginBottom: 24, border: '1px solid #1890ff', background: '#f0faff' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            {getFileIcon(file.name)} {/* Icon nhỏ lại chút, khoảng fontSize: 24 */}
                                            <div style={{ marginLeft: 12 }}>
                                                <Text strong>{file.name}</Text>
                                                <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Nút bấm nằm ngay bên phải file, tiết kiệm chiều dọc */}
                                        <Space>
                                            {!loading && (
                                                <Button type="text" danger icon={<DeleteOutlined />} onClick={() => { setFile(null); }} />
                                            )}
                                            {loading ? (
                                                <Button type="primary" danger shape="round" onClick={handleAbort}>Hủy bỏ</Button>
                                            ) : (
                                                <Button type="primary" shape="round" icon={<RobotOutlined />} onClick={() => handleExtract()}>Trích xuất</Button>
                                            )}
                                        </Space>
                                    </div>
                                    
                                    {/* Thanh Progress nằm gọn trong card */}
                                    {loading && (
                                        <div style={{ marginTop: 16, background: '#f9f9f9', padding: 12, borderRadius: 6, border: '1px solid #eee' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                                <span style={{ fontSize: 13, fontWeight: 500, color: '#2c7beaff' }}>
                                                    {/* Icon xoay nhẹ tạo cảm giác đang làm việc */}
                                                    <SyncOutlined spin style={{ marginRight: 8, color: '#1890ff' }} />
                                                    {progress.status || "Đang trích xuất dữ liệu..."}
                                                </span>
                                                <span style={{ fontWeight: 600, color: '#1890ff' }}>{progress.percent}%</span>
                                            </div>
                                            
                                            <Progress 
                                                percent={progress.percent} 
                                                status="active" // Hiệu ứng vệt sáng chạy nhẹ nhàng
                                                strokeColor={{
                                                    '0%': '#003a8c',  // Xanh đậm (Navy)
                                                    '100%': '#13c2c2', // Xanh cổ vịt (Teal)
                                                }}
                                                strokeWidth={8} // Độ dày vừa phải, thanh lịch
                                                showInfo={false}
                                                strokeLinecap="round" // Bo tròn đầu
                                            />
                                        </div>
                                    )}
                                </Card>
                            )}
                            {/* FORM */}
                            <Form form={form} onFinish={handleSubmit} layout="vertical" initialValues={{ year: new Date().getFullYear().toString() }}>
                                <Collapse activeKey={activeKey} onChange={setActiveKey} ghost items={[
                                    {
                                        key: 'general', label: <Text strong style={{ fontSize: 16 }}><FileTextOutlined /> Thông tin chung</Text>,
                                        children: (
                                            <>
                                                <Form.Item label="Tiêu đề luận văn" name="title" rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}>
                                                    <Input.TextArea autoSize={{ minRows: 2 }} placeholder="Nhập tiêu đề đầy đủ của luận văn" style={{ fontSize: 16, fontWeight: 500 }} />
                                                </Form.Item>
                                                <Row gutter={16}>
                                                    <Col span={12}>
                                                        <Form.Item label="Khoa/Viện" name="category" rules={[{ required: true, message: "Vui lòng chọn Khoa/Viện" }]}>
                                                            <Select placeholder="Chọn Khoa/Viện" onChange={handleCategoryChange} loading={isLoadingCategories}>
                                                                {categories.map(c => <Select.Option key={c._id} value={c._id}>{c.name}</Select.Option>)}
                                                            </Select>
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={12}>
                                                        <Form.Item label="Chuyên ngành" name="major" rules={[{ required: true, message: "Vui lòng chọn chuyên ngành" }]}>
                                                            <Select placeholder="Chọn Chuyên ngành" disabled={!selectedCategoryId} loading={isLoadingMajors}>
                                                                {majors.map(m => <Select.Option key={m._id} value={m._id}>{m.name}</Select.Option>)}
                                                            </Select>
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={12}>
                                                        <Form.Item label="Chủ đề nghiên cứu" name="field" rules={[{ required: true, message: "Vui lòng chọn chủ đề nghiên cứu" }]}>
                                                            <Select showSearch placeholder="Chọn hoặc thêm mới" loading={isLoadingFields} filterOption={(input, option) => (option?.children?.[0] ?? '').toLowerCase().includes(input.toLowerCase())}
                                                                popupRender={menu => (
                                                                    <>
                                                                        {menu}<Divider style={{ margin: '8px 0' }} />
                                                                        <Space style={{ padding: '0 8px 4px' }}><Input placeholder="Chủ đề mới" value={newFieldName} onChange={e => setNewFieldName(e.target.value)} /><Button type="text" icon={<PlusOutlined />} onClick={addNewField} disabled={!newFieldName.trim()}>Thêm</Button></Space>
                                                                    </>
                                                                )}>
                                                                {fieldsOptions.map(f => <Select.Option key={f._id} value={f._id}>{f.name} {f.isNew && <Tag color="green">Mới</Tag>}</Select.Option>)}
                                                            </Select>
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={12}><Form.Item label="Năm hoàn thành" name="year" rules={[{ required: true, message: "Vui lòng nhập năm hoàn thành" }]}><Input type="number" /></Form.Item></Col>
                                                </Row>
                                            </>
                                        )
                                    },
                                    {
                                        key: 'authors', label: <Text strong style={{ fontSize: 16 }}><TeamOutlined /> Tác giả & Người hướng dẫn</Text>,
                                        children: (
                                            <>
                                                <Row gutter={16}>
                                                    <Col span={12}><Card size="small" title="Tác giả chính" type="inner"><Form.Item label="Họ tên" name="authorName"><Input disabled={!!currentUser} /></Form.Item><Form.Item label="MSSV" name="authorMSSV"><Input disabled={!!currentUser} /></Form.Item></Card></Col>
                                                    <Col span={12}><Card size="small" title="Người hướng dẫn" type="inner"><Form.Item label="Giảng viên" name="supervisorId" rules={[{ required: true, message: "Vui lòng chọn giảng viên" }]}><Select placeholder="Chọn giảng viên" allowClear showSearch filterOption={(input, option) => String(option.children).toLowerCase().includes(input.toLowerCase())}>{renderSupervisorOptions()}</Select></Form.Item></Card></Col>
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
                                        key: 'advanced', label: <Text strong style={{ fontSize: 16 }}><MoreOutlined /> Thông tin nâng cao</Text>,
                                        children: (
                                            <>
                                                <Form.Item label="Từ khóa (Keywords)" name="keywords"><Input placeholder="AI, Machine Learning, Web..." /></Form.Item>                                              
                                                <Form.Item label="Tóm tắt (Tiếng Việt)" name="tom_tat"><Input.TextArea rows={4} /></Form.Item>
                                                <Form.Item label="Abstract (Tiếng Anh)" name="abstract"><Input.TextArea rows={4} /></Form.Item>
                                                <Form.Item label="Ảnh bìa (Thumbnail)">
                                                    <Upload accept="image/*" beforeUpload={(f) => { setThumbnail(f); return false; }} onRemove={() => setThumbnail(null)} showUploadList={false}><Button icon={<PlusOutlined />}>Chọn ảnh</Button></Upload>
                                                    {thumbnail && <div style={{ marginTop: 10 }}><img src={URL.createObjectURL(thumbnail)} alt="thumb" style={{ height: 100, borderRadius: 8, border: '1px solid #d9d9d9' }} /></div>}
                                                </Form.Item>
                                            </>
                                        )
                                    }
                                ]} />
                                <Divider />
                                <div style={{ textAlign: 'center' }}>
                                    <DuplicateCheckButtonComponent 
                                        thesisData={extractedData}
                                        externalResult={checkResult} // Nhận kết quả từ cha
                                        externalOpen={isCheckModalOpen} // Nhận lệnh mở từ cha (chỉ true khi trùng nặng)
                                        onClose={() => setIsCheckModalOpen(false)}
                                    />
                                    <Button type="primary" htmlType="submit" loading={loading} size="large" shape="round" style={{ minWidth: 200, height: 50, fontSize: 18, marginLeft: 16 }}>Tiếp tục & Chia sẻ</Button>
                                </div>
                            </Form>
                        </Card>
                    </Col>
                    {/* CỘT PHẢI: GỢI Ý */}
                    <Col xs={24} lg={8}>
                        <div style={{ position: 'sticky', top: 20 }}>
                            <Card title={<span style={{ color: '#1890ff', fontSize: 16, fontWeight: 600 }}><RobotOutlined /> Gợi ý từ AI</span>} size="small" style={{ borderRadius: 12, border: '1px solid #bae7ff', background: '#f0faff', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '85vh' }} styles={{ body: { overflow: 'hidden', padding: 0, display: 'flex', flexDirection: 'column', flex: 1 } }}>
                                {!extractedData ? (
                                    <div style={{ padding: 24, textAlign: 'center' }}><Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<Text type="secondary">Tải file và bấm <strong>Trích xuất</strong> để xem gợi ý tại đây.</Text>} /></div>
                                ) : (
                                    <div style={{ overflowY: 'auto', padding: '16px', flex: 1 }} className="custom-scrollbar">
                                        <Descriptions column={1} size="small" colon={true} labelStyle={{ minWidth: '70px', fontWeight: 600, color: '#595959', verticalAlign: 'top' }} contentStyle={{ marginBottom: 12 }}>
                                            <Descriptions.Item label="Tiêu đề"><Paragraph style={{ color: '#1890ff', fontWeight: 600, margin: 0 }} ellipsis={{ rows: 3, expandable: true, symbol: 'Xem thêm' }}>{extractedData.title || <Text type="secondary" italic>[Chưa trích xuất được]</Text>}</Paragraph></Descriptions.Item>
                                            {(extractedData.authorName || extractedData.authorMSSV) && <Descriptions.Item label="Tác giả"><Space><Text strong>{extractedData.authorName}</Text>{extractedData.authorMSSV && <Tag color="blue">{extractedData.authorMSSV}</Tag>}</Space></Descriptions.Item>}
                                            {(extractedData.coAuthorsNames?.length > 0 || extractedData.coAuthorsMSSV?.length > 0) && <><Descriptions.Item label="Đồng tác giả"><Space>{extractedData.coAuthorsNames?.map((n, i) => <Tag key={`n-${i}`}>{n}</Tag>)}</Space></Descriptions.Item><Descriptions.Item label="MSSV Đồng tác giả"><Space>{extractedData.coAuthorsMSSV?.map((m, i) => <Tag key={`m-${i}`} color="cyan">{m}</Tag>)}</Space></Descriptions.Item></>}
                                            <Descriptions.Item label="GVHD"><Text>{extractedData.supervisorName || <Text type="secondary">N/A</Text>}</Text></Descriptions.Item>
                                            {extractedData.keywords?.length > 0 && <Descriptions.Item label="Từ khóa"><Space wrap size={[4, 4]}>{extractedData.keywords.map((k, i) => <Tag key={i} color="purple">{k}</Tag>)}</Space></Descriptions.Item>}
                                            {extractedData.year && <Descriptions.Item label="Năm"><Tag color="geekblue">{extractedData.year}</Tag></Descriptions.Item>}
                                            <Descriptions.Item label="Tóm tắt"><ExpandableText content={extractedData.tom_tat} /></Descriptions.Item>
                                            <Descriptions.Item label="Abstract"><div style={{ fontStyle: 'italic' }}><ExpandableText content={extractedData.abstract} /></div></Descriptions.Item>
                                        </Descriptions>
                                        <Divider style={{ margin: '16px 0' }} />
                                        <Space direction="vertical" style={{ width: '100%' }}>
                                            <Button block type="primary" icon={<CheckCircleOutlined />} onClick={() => applySuggestion({ includeSupervisor: true })}>Áp dụng gợi ý</Button>
                                            {/* <Button block onClick={() => applySuggestion({ includeSupervisor: false })}>Áp dụng (Chừa GVHD)</Button>
                                            <Button block danger type="text" size="small" onClick={() => setExtractedData(null)}>Xóa gợi ý</Button> */}
                                        </Space>
                                    </div>
                                )}
                            </Card>
                        </div>
                    </Col>
                </Row>
                {/* MODALS */}
                <Modal title={<Title level={4} style={{ margin: 0, color: '#1890ff' }}><SendOutlined /> Xác Nhận Gửi & Chia Sẻ</Title>} open={isShareModalVisible} onCancel={() => setIsShareModalVisible(false)} width={600} footer={[<Button key="back" onClick={() => { setIsShareModalVisible(false); setIsConflictModalVisible(true); }}>Quay lại</Button>, <Button key="submit" type="primary" loading={uploadAndShareMutation.isPending} disabled={!isCommitmentChecked} onClick={handleConfirmUploadAndShare}>Xác nhận Gửi</Button>]}>
                    <Card type="inner" size="small" style={{ background: '#f5f5f5', marginBottom: 16 }}><Text strong>Đang gửi:</Text> <Text style={{ color: '#1890ff' }}>{form.getFieldValue('title')}</Text></Card>
                    <Title level={5}><GlobalOutlined /> Chọn chế độ chia sẻ</Title>
                    <Radio.Group onChange={(e) => setSharingMode(e.target.value)} value={sharingMode} style={{ width: '100%' }}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Card size="small" hoverable style={{ borderColor: sharingMode === 'public' ? '#1890ff' : undefined }} onClick={() => setSharingMode('public')}><Radio value="public"><Text strong>Công khai toàn văn</Text></Radio><Tag color="cyan" style={{ float: 'right' }}>Khuyên dùng</Tag><div style={{ marginLeft: 24, color: '#8c8c8c', fontSize: 12 }}>Chia sẻ rộng rãi cho cộng đồng. Cần kiểm duyệt.</div></Card>
                            <Card size="small" hoverable style={{ borderColor: sharingMode === 'abstract_only' ? '#1890ff' : undefined }} onClick={() => setSharingMode('abstract_only')}><Radio value="abstract_only"><Text strong>Công khai tóm tắt</Text></Radio><Tag color="success" style={{ float: 'right' }}>Bảo mật file</Tag><div style={{ marginLeft: 24, color: '#8c8c8c', fontSize: 12 }}>Chỉ hiện thông tin cơ bản. File PDF được bảo mật.</div></Card>
                            <Card size="small" hoverable style={{ borderColor: sharingMode === 'internal' ? '#1890ff' : undefined }} onClick={() => setSharingMode('internal')}><Radio value="internal"><Text strong>Nội bộ</Text></Radio><Tag color="processing" style={{ float: 'right' }}>Phạm vi hẹp</Tag><div style={{ marginLeft: 24, color: '#8c8c8c', fontSize: 12 }}>Chỉ lưu hành nội bộ trường.</div></Card>
                            <Card size="small" hoverable style={{ borderColor: sharingMode === 'private' ? '#1890ff' : undefined }} onClick={() => setSharingMode('private')}><Radio value="private"><Text strong>Riêng tư</Text></Radio><Tag color="default" style={{ float: 'right' }}>Chỉ mình tôi</Tag><div style={{ marginLeft: 24, color: '#8c8c8c', fontSize: 12 }}>Chỉ có bản thân xem được.</div></Card>
                        </Space>
                    </Radio.Group>
                    <Divider />
                    <Checkbox checked={isCommitmentChecked} onChange={(e) => setIsCommitmentChecked(e.target.checked)}><Text strong style={{ color: isCommitmentChecked ? '#52c41a' : undefined }}>Tôi cam kết tài liệu hợp pháp và chịu trách nhiệm về nội dung.</Text></Checkbox>
                </Modal>
                <Modal title={<span style={{ color: '#faad14' }}><WarningOutlined /> Cảnh báo Xung đột Tác giả</span>} open={isConflictModalVisible} onCancel={() => setIsConflictModalVisible(false)} footer={null} width={500}>
                    <Alert message="Thông tin MSSV không khớp" description="Thông tin trích xuất từ file khác với tài khoản đang đăng nhập." type="warning" showIcon style={{ marginBottom: 16 }} />
                    <Card size="small" style={{ background: '#fffbe6', border: '1px solid #ffe58f', marginBottom: 16 }}><Descriptions column={1} size="small"><Descriptions.Item label="Tài khoản của bạn"><Text strong>{conflictDetails?.currentUserMSSV}</Text></Descriptions.Item><Descriptions.Item label="Trích xuất từ file"><Text type="danger" strong>{conflictDetails?.extractedMSSV || conflictDetails?.extractedcoAuthorsMSSV?.join(', ')}</Text></Descriptions.Item></Descriptions></Card>
                    <div style={{ textAlign: 'right' }}><Space><Button onClick={() => handleConflictConfirm(false)}>Upload hộ (Dùng thông tin File)</Button><Button type="primary" onClick={() => handleConflictConfirm(true)}>Tôi là tác giả (Sửa sai cho AI)</Button></Space></div>
                </Modal>
            </div>
        </DefaultLayout>
    );
};
export default UploadThesisPage;