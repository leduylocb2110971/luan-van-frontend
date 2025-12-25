import React, { useEffect, useState } from "react";
import * as TheSisService from "../../services/TheSisService";
import { useNavigate } from "react-router-dom";
import { FaFileWord, FaFilePdf, FaEye, FaDownload } from "react-icons/fa";
import { Typography } from "antd"; // Import Typography để dùng Text/Title

const { Text } = Typography;

const RelatedThesisComponent = ({ thesisId }) => {
    const [related, setRelated] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Giới hạn số lượng hiển thị (Nếu API cho phép, nên thêm limit vào đây)
                const data = await TheSisService.getRelatedThesis(thesisId); 
                // Chỉ lấy tối đa 10 mục để giữ danh sách liên quan ngắn gọn
                setRelated(data.data ? data.data.slice(0, 10) : []); 
            } catch (err) {
                console.error("Lỗi khi lấy luận văn liên quan:", err);
            }
        };
        if (thesisId) fetchData();
    }, [thesisId]);

    return (
        <div>
            {/* SỬA: Thêm max-height và overflowY để có scrollbar */}
            <div 
                style={{ 
                    display: "flex", 
                    flexDirection: "column", 
                    gap: "12px",
                    maxHeight: "500px", 
                    overflowY: "auto", 
                    paddingRight: "8px", 
                }}
            >
                {related?.length > 0 ? (
                    related.map((item) => (
                        // SỬA: Thay Card bằng div đơn giản
                        <div
                            key={item._id}
                            style={{
                                display: "flex",
                                alignItems: "flex-start", // Căn đầu dòng
                                gap: "12px",
                                borderBottom: "1px solid #f0f0f0", // Dùng border để phân cách
                                paddingBottom: "12px",
                                cursor: 'pointer',
                            }}
                            onClick={() => navigate(`/thesis/${item._id}`)} // Click cả item
                        >
                            
                            {/* Icon (Cột 1) - THU NHỎ KÍCH THƯỚC ICON */}
                            <div style={{ flexShrink: 0, marginTop: '2px' }}>
                                {item.fileType === "pdf" ? (
                                    <FaFilePdf size={24} color="#E53E3E" />
                                ) : item.fileType === "docx" ? (
                                    <FaFileWord size={24} color="#2B6CB0" />
                                ) : null}
                            </div>
                            
                            {/* Thông tin (Cột 2) */}
                            <div style={{ flexGrow: 1, minWidth: 0 }}>
                                <h4
                                    style={{
                                        margin: 0,
                                        fontSize: "14px",
                                        lineHeight: "1.4",
                                        color: "#111",
                                        // Giới hạn 2 dòng tiêu đề
                                        display: "-webkit-box",
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: "vertical",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                    }}
                                >
                                    {item.title}
                                </h4>
                                
                                {/* Metadata (Views và Downloads) */}
                                <Text type="secondary" style={{ fontSize: "12px", marginTop: '4px' }}>
                                    <FaEye style={{ marginRight: '4px' }}/> {item.views} | 
                                    <FaDownload style={{ marginLeft: '8px', marginRight: '4px' }}/> {item.downloads}
                                </Text>
                            </div>
                        </div>
                    ))
                ) : (
                    <p style={{ color: "#888", fontSize: "14px", padding: '10px 0' }}>
                        Không có luận văn liên quan.
                    </p>
                )}
            </div>
        </div>
    );
};

export default RelatedThesisComponent;