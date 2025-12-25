import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { Card, Tag, List, Typography, Skeleton } from "antd";
import { FaFire, FaTags, FaCommentDots, FaArrowRight } from "react-icons/fa";
import * as TheSisService from "../../services/TheSisService";

const { Text } = Typography;
const PRIMARY = "#2563eb";
const LIGHT_BG = "#f8fafc";
const HOVER_BG = "#f1f5f9";
const BORDER = "#e2e8f0";
const tagColors = ["processing", "default"];
const cardStyle = {
        marginBottom: 20,
        borderRadius: 12,
        boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
        overflow: "hidden",
        border: `1px solid ${BORDER}`,
    };
const TrendingOverview = () => {
    const navigate = useNavigate();

    const { data: responseTrendingThesis, isLoading } = useQuery({
        queryKey: ["getTrendingThesis"],
        queryFn: () => TheSisService.getTrendingOverview(),
    });

    const {
        topFields = [],
        topKeywords = [],
        topCommentedTheses = [],
    } = responseTrendingThesis?.data || {};
    console.log ("Trending Overview Data:", responseTrendingThesis);

    /* ---------- CARD STYLE (glass + shadow + spacing) ---------- */
    const modernCard = {
        marginBottom: 22,
        borderRadius: 18,
        padding: 0,
        background: "rgba(255,255,255,0.75)",
        backdropFilter: "blur(14px)",
        boxShadow: "0 12px 35px rgba(0,0,0,0.12)",
        border: "1px solid rgba(255,255,255,0.5)",
    };

    /* ---------- HEAD STYLE (gradient aura) ---------- */
    const headerStyle = (start, end) => ({
        padding: "14px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.5)",
        background: `linear-gradient(135deg, ${start}, ${end})`,
        color: "#fff",
        borderRadius: "18px 18px 0 0",
        fontWeight: 700,
    });

    /* ---------- Section Title Component ---------- */
    const sectionTitle = (icon, text) => (
        <div style={{ display: "flex", alignItems: "center", color: "white" }}>
            {icon}
            <span style={{ marginLeft: 10, fontSize: 16, fontWeight: 700 }}>
                {text}
            </span>
        </div>
    );

    const handleKeywordClick = (keyword) => {
        navigate(`/thesis?keywords=${encodeURIComponent(keyword)}`);
    };

    if (isLoading) {
        return (
            <div style={{ minWidth: 280 }}>
                <Card style={modernCard}><Skeleton active /></Card>
                <Card style={modernCard}><Skeleton active /></Card>
                <Card style={modernCard}><Skeleton active /></Card>
            </div>
        );
    }

    return (
        <div style={{ position: "sticky", top: 20, minWidth: 280 }}>
            {/* --------------------------------------- */}
            {/*            TOP FIELDS (TRENDING)        */}
            {/* --------------------------------------- */}
            <Card
                style={modernCard}
                title={sectionTitle(
                    <FaFire size={20} color="white" />,
                    "Xu hướng chủ đề"
                )}
                //Gọi hàm headerStyle với màu gradient mong muốn
                styles={{
                    header: headerStyle("#f65415ff", "#f67b7dff")
                }}
                size="small"
            >
                <List
                    size="small"
                    dataSource={topFields}
                    renderItem={(item, index) => (
                        <List.Item
                            onClick={() => navigate(`/thesis?fields=${item._id}`)}
                            style={{
                                cursor: "pointer",
                                padding: "12px 2px",
                                transition: "0.25s",
                                borderBottom:
                                    index < topFields.length - 1
                                        ? "1px dashed #eee"
                                        : "none",
                            }}
                            onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                    "rgba(255,245,240,0.8)")
                            }
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                    "transparent")
                            }
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    width: "100%",
                                }}
                            >
                                {/* Ranking */}
                                <div
                                    style={{
                                        minWidth: 24,
                                        textAlign: "center",
                                        fontWeight: 800,
                                        fontSize: 17,
                                        color:
                                            index === 0
                                                ? "#ffcf00"
                                                : index === 1
                                                ? "#c0c0c0"
                                                : index === 2
                                                ? "#cd7f32"
                                                : "#94a3b8",
                                    }}
                                >
                                    {index + 1}
                                </div>

                                <Text strong ellipsis style={{ flex: 1 }}>
                                    {item.name}
                                </Text>

                                <Tag
                                    style={{
                                        borderRadius: 8,
                                        fontWeight: 600,
                                        padding: "2px 8px",
                                        background: "#ffead5",
                                        border: "none",
                                        color: "#d35400",
                                    }}
                                >
                                    {item.count} LV
                                </Tag>
                            </div>
                        </List.Item>
                    )}
                />
            </Card>

            {/* --------------------------------------- */}
            {/*                KEYWORDS                  */}
            {/* --------------------------------------- */}
            <Card
                style={modernCard}
                title={sectionTitle(
                    <FaTags size={20} color="white" />,
                    "Từ khóa nổi bật"
                )}
                styles={{
                    header:headerStyle("#0d86f0ff", "#0bb5bdff")
                }}
                size="small"
            >
                <div style={{ lineHeight: 2.6, padding: "4px 0" }}>
                    {topKeywords.map((item, index) => (
                        <Tag
                            key={item._id}
                            color={tagColors[index % tagColors.length]}
                            style={{
                                margin: 4,
                                padding: "6px 12px",
                                fontSize: 14,
                                borderRadius: 8,
                                cursor: "pointer",
                                fontWeight: 500,
                                transition: "opacity 0.2s",
                            }}
                            onClick={() => handleKeywordClick(item._id)}
                            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
                            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                        >
                            #{item._id}
                        </Tag>
                    ))}
                </div>
            </Card>

            {/* --------------------------------------- */}
            {/*          MOST DISCUSSED (COMMENTS)       */}
            {/* --------------------------------------- */}
            {/* MOST DISCUSSED */}
            <Card
                title={sectionTitle(
                    <FaCommentDots size={18} color="white"/>,
                    "Được thảo luận nhiều"
                )}
                size="small"
                style={cardStyle}
                styles={{
                    header: headerStyle("#a33ba7ff", "#4568dc")
                }}
            >
                <List
                    size="small"
                    dataSource={topCommentedTheses}
                    renderItem={(item) => (
                        <List.Item
                            onClick={() => navigate(`/thesis/${item._id}`)}
                            style={{
                                cursor: "pointer",
                                padding: "10px 0",
                                transition: "background 0.2s",
                            }}
                            onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor = HOVER_BG)
                            }
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor = "transparent")
                            }
                        >
                            <div style={{ flex: 1, marginRight: 10 }}>
                                <Text strong ellipsis style={{ fontSize: 14 }}>
                                    {item.title}
                                </Text>

                                <div style={{ marginTop: 4 }}>
                                    <Text
                                        type="secondary"
                                        style={{
                                            fontSize: 13,
                                            display: "flex",
                                            alignItems: "center",
                                        }}
                                    >
                                        <FaCommentDots
                                            size={13}
                                            style={{
                                                marginRight: 6,
                                                color: "#000000ff"
                                            }}
                                        />
                                        <span
                                            style={{
                                                fontWeight: 600,
                                                
                                            }}
                                        >
                                            {item.commentCount || 0}
                                        </span>
                                        <span style={{ marginLeft: 4 }}>bình luận</span>
                                    </Text>
                                </div>
                            </div>

                            <FaArrowRight size={14} style={{ color: PRIMARY }} />
                        </List.Item>
                    )}
                />
            </Card>
        </div>
    );
};

export default TrendingOverview;
