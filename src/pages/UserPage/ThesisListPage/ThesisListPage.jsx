import React, { useState, useMemo, useEffect, useCallback } from "react";
// 🔥 CẬP NHẬT: Thay thế useParams bằng useSearchParams
import { useSearchParams, Link, useNavigate } from "react-router-dom"; 
import { useQuery, useMutation } from "@tanstack/react-query";
import * as TheSisService from "../../../services/TheSisService";
import * as Message from "../../../components/Message/Message";
import DefaultLayout from "../../../components/DefaultLayout/DefaultLayout";
import SortComponent from "../../../components/SortComponent/SortComponent";
import LoadingComponent from "../../../components/LoadingComponent/LoadingComponent";
import PaginationComponent from "../../../components/PaginationComponent/PaginationComponent";
import BreadcrumbComponent from "../../../components/BreadcrumbComponent/BreadcrumbComponent";
import FavoriteButtonComponent from "../../../components/FavoriteButtonComponent/FavoriteButtonComponent";
import FiltersSidebar from "../../../components/FiltersSidebar/FiltersSidebar";
import { Row, Col, Card, Typography, Button, Space, Input, Select, Tag } from "antd";
import { FaFileWord, FaFilePdf, FaEye, FaDownload, FaChalkboardTeacher, 
    FaUserGraduate, FaCalendarAlt} from "react-icons/fa";
import { GlobalOutlined, LockOutlined, BankOutlined, FileProtectOutlined } from "@ant-design/icons";

import {
    Thumbnail,
    TitleStyled,
    FileTypeTag,
    CardModern,
    InfoText,
    StatsRow,
    Stat,
} from "./style";

const { Title, Paragraph } = Typography;
const { Option } = Select;

// Giá trị mặc định (sẽ được ghi đè bởi URL nếu có)
const initialFilterState = {
    years: [],
    status: ['approved_public'],
    categories: [],
    majors: [],
    fields: [],
    supervisors: [],
    keywords: [],
    accessMode: [],
};

const ThesisListPage = () => {

    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams(); 

    // Đọc Page, Limit từ URL để tránh reset khi thay đổi URL thủ công
    const initialPage = Number(searchParams.get('page')) || 1;
    const initialPageSize = Number(searchParams.get('limit')) || 5;

    const [sortValue, setSortValue] = useState(searchParams.get('sort') || undefined); 
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [pageSize, setPageSize] = useState(initialPageSize);
    
    // a) inputSearchTerm: Dùng cho ô Input (Cập nhật tức thời, gõ mượt)
    const [inputSearchTerm, setInputSearchTerm] = useState(searchParams.get('search') || "");
    // b) searchTerm: Dùng cho API/URL (Chỉ cập nhật sau khi Debounce)
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || ""); 
    
    const [filterValues, setFilterValues] = useState(initialFilterState);
    const [presetValue, setPresetValue] = useState(searchParams.get('preset') || undefined);

    // --- LOGIC XỬ LÝ URL ---

    // Hàm tiện ích để đọc giá trị mảng (tách bằng dấu phẩy) từ URL
    const getArrayFromUrl = (key) => {
        const value = searchParams.get(key); 
        if (!value) {
            return [];
        }
        return value?.split(',')
                    ?.map(item => item.trim())
                    ?.filter(item => item.length > 0);
    };
    const [activeKeys, setActiveKeys] = useState(getArrayFromUrl('open'));
    

    // 🔥 ĐỒNG BỘ HÓA STATE KHI URL THAY ĐỔI - Kích hoạt khi searchParams thay đổi
    useEffect(() => {
        // Đồng bộ hóa Bộ lọc mảng
        const urlYears = getArrayFromUrl('years');
        const urlStatus = getArrayFromUrl('status');
        const urlCategories = getArrayFromUrl('categories');
        const urlMajors = getArrayFromUrl('majors'); 
        const urlFields = getArrayFromUrl('fields');
        const urlSupervisors = getArrayFromUrl('supervisors');
        const urlKeywords = getArrayFromUrl('keywords');
        const urlAccessModes = getArrayFromUrl('accessMode');
        // Đồng bộ activeKey
        const urlActiveKeys = getArrayFromUrl('open');
        setActiveKeys(urlActiveKeys);

        setFilterValues({
            years: urlYears,
            status: urlStatus.length > 0 ? urlStatus : initialFilterState.status, // Giữ mặc định nếu URL không có
            categories: urlCategories,
            majors: urlMajors,
            fields: urlFields,
            supervisors: urlSupervisors,
            keywords: urlKeywords,
            accessMode: urlAccessModes,
        });

        // Đồng bộ hóa các state tìm kiếm
        const urlSearch = searchParams.get('search') || "";
        setSearchTerm(urlSearch);       // Cập nhật state tìm kiếm cho API
        setInputSearchTerm(urlSearch);  // Cập nhật state input cho ô gõ
        
        // Đồng bộ hóa các state đơn lẻ
        setSortValue(searchParams.get('sort') || undefined);
        setCurrentPage(Number(searchParams.get('page')) || 1);
        setPageSize(Number(searchParams.get('limit')) || 5);
        setPresetValue(searchParams.get('preset') || undefined);

    }, [searchParams]); 

    // Hàm tiện ích để cập nhật URL khi bộ lọc/thứ tự tìm kiếm thay đổi
    const updateUrlParams = useCallback((newFilters, newSearch, newSort, page, limit, newPreset, newActiveKeys) => {
        const newParams = new URLSearchParams();

        // 1. Thêm các giá trị lọc mảng
        Object.keys(newFilters).forEach(key => {
            const arr = newFilters[key];
            // Chỉ thêm vào URL nếu khác giá trị mặc định (cho status) hoặc mảng có phần tử
            if (arr.length > 0 && (key !== 'status' || arr.join(',') !== initialFilterState.status.join(','))) {
                newParams.set(key, arr.join(',')); 
            }
        });

        // 2. Thêm Search Term
        if (newSearch) {
            newParams.set('search', newSearch);
        }
        // 3. Thêm Sort Value
        if (newSort) {
            newParams.set('sort', newSort);
        }
        // 4. Thêm Page & Limit (Nếu khác mặc định)
        if (page > 1) {
             newParams.set('page', page.toString());
        }
        if (limit !== 5) { 
             newParams.set('limit', limit.toString());
        }
        // 5. Thêm Date Range Preset
        if (newPreset) {
            newParams.set('preset', newPreset);
        }
        // 6. Thêm trạng thái avtive Key bên sidebar 
        if (newActiveKeys) {
            newParams.set('open', newActiveKeys.join(','));
        } else {
            newParams.delete('open');
        }

        // Ghi lại URL
        setSearchParams(newParams);
    }, [setSearchParams]);
    

    // --- HÀM XỬ LÝ SỰ KIỆN ---
    const handleActiveKeysChange = useCallback((keys) => {
    setActiveKeys(keys); // Cập nhật state nội bộ
    
    // Cập nhật URL để lưu trạng thái
    updateUrlParams(filterValues, searchTerm, sortValue, currentPage, pageSize, presetValue, keys);
}, [filterValues, searchTerm, sortValue, currentPage, pageSize, presetValue, updateUrlParams]);

    const handleSortChange = (value) => {
        setSortValue(value);
        // Dùng searchTerm (giá trị đã debounce) để không làm ảnh hưởng việc gõ
        updateUrlParams(filterValues, searchTerm, value, 1, pageSize, presetValue, activeKeys); 
        setCurrentPage(1);
    };


const handleFilterChange = useCallback((nameOrNewObject, value) => {
    let newFilterValues = {};

    if (typeof nameOrNewObject === 'string') {
        // Trường hợp 1: Cập nhật một bộ lọc đơn lẻ (ví dụ: 'majors', ['Kinh tế'])
        
        newFilterValues = {
            ...filterValues, // 🔥 Dùng Spread Operator để giữ lại tất cả các bộ lọc cũ
            [nameOrNewObject]: value // Chỉ ghi đè lên bộ lọc đang thay đổi
        };
    } else {
        // Trường hợp 2: Cập nhật nhiều bộ lọc cùng lúc (ví dụ: từ component con)
        newFilterValues = {
            ...filterValues, 
            ...nameOrNewObject
        }
    }
    setFilterValues(newFilterValues);
    
    // GỌI HÀM CẬP NHẬT URL (Cần đảm bảo hàm này được gọi với newFilterValues)
    updateUrlParams(newFilterValues, searchTerm, sortValue, 1, pageSize, presetValue, activeKeys); 
    setCurrentPage(1);

    return newFilterValues;

}, [filterValues, searchTerm, sortValue, pageSize, presetValue, updateUrlParams, activeKeys]); 
    // Hàm xử lí khi bấm enter
    const handleSearchSubmit = (value) =>{
        // 1. Cập nhật searchTerm (state dùng cho API/URL) bằng giá trị hiện tại của input
        const finalSearchTerm = value || inputSearchTerm; // Lấy từ onSearch hoặc từ input state
        setSearchTerm(finalSearchTerm);
        // 2. Cập nhật url
        updateUrlParams(filterValues, finalSearchTerm, sortValue, 1, pageSize, presetValue, activeKeys); 
        setCurrentPage(1);
    }

    // HÀM CẬP NHẬT GÕ: Chỉ cập nhật input state, KHÔNG GỌI API/URL
    const handleSearchChange = (value) => {
        // Nếu xóa hết input, tự động submit để xóa filter tìm kiếm
        // if (value === "") {
        //     handleSearchSubmit("");
        //     updateUrlParams(filterValues, "", sortValue, 1, pageSize, presetValue, activeKeys);
        // }
        setInputSearchTerm(value); 
    }
    
    // HÀM XỬ LÝ PRESET (Dùng searchTerm đã debounce)
    const handlePresetChange = (value) => {
        const newPreset = value === 'all' ? undefined : value;
        setPresetValue(newPreset);
        // Cập nhật URL và reset page
        updateUrlParams(filterValues, searchTerm, sortValue, 1, pageSize, newPreset, activeKeys); 
        setCurrentPage(1);
    }

    const handleReset = () => {
        // 1: Lấy từ URLSearchParams
        const currentSearchValue = searchParams.get('search') || ''; 
        
        // 2. Thiết lập lại các bộ lọc (filter) và phân trang về trạng thái ban đầu
        setFilterValues(initialFilterState);
        setSortValue(undefined);
        setCurrentPage(1);
        setPageSize(5); 
        setPresetValue(undefined);
        
        // 3. Tạo một đối tượng URLSearchParams mới và chỉ thêm giá trị tìm kiếm
        const newSearchParams = new URLSearchParams();
        
        if (currentSearchValue) {
            newSearchParams.set('search', currentSearchValue);
        }
        
        // 4. Cập nhật URL
        setSearchParams(newSearchParams); 
    }
    
    // Tạo đối tượng lọc cho backend 
    const currentFilters = useMemo (() => 
        ({
            page: currentPage,
            limit: pageSize,
            sort: sortValue,
            search: searchTerm, 
            // Backend sẽ xử lý việc các trường này rỗng hoặc có giá trị mặc định
            years: filterValues?.years?.join(','), 
            categories: filterValues?.categories?.join(','), 
            majors: filterValues?.majors?.join(','),
            fields: filterValues?.fields?.join(','), 
            status: filterValues?.status?.join(','),
            supervisors: filterValues?.supervisors?.join(','),
            keywords: filterValues?.keywords?.join(','),
            accessMode: filterValues?.accessMode?.join(','),
            preset: presetValue, 
        })
    , [currentPage, pageSize, sortValue, searchTerm, filterValues, presetValue]);

    // Cần thay đổi queryKey để kích hoạt lại fetch dữ liệu khi searchTerm thay đổi
    const queryGetAllTheses = useQuery({
        queryKey: ["getAllTheses", currentFilters], 
        queryFn: () => TheSisService.getAllTheSis(currentFilters),
    });

    const { data: response, isLoading } = queryGetAllTheses;
    console.log("Kết quả tìm kiếm:", response);

    const theses = response?.data?.theses || [];
    const totalTheses = response?.data?.total || 0;
    const paginatedThesis = theses; 
    

    const highlightText = (text, keyword) => {
        if (!keyword) return text;
        const regex = new RegExp(`(${keyword})`, "gi");
        const parts = text?.split(regex);

        return parts?.map((part, index) =>
            part.toLowerCase() === keyword.toLowerCase() ? (
                <span key={index} style={{ backgroundColor: "yellow" }}>{part}</span>
            ) : (
                part
            )
        );
    };

    if (isLoading) {
        return <LoadingComponent />;
    }
    const renderAccessModeTag = (mode) => {
    switch (mode) {
        case 'public_full':
            return <Tag icon={<GlobalOutlined />} color="success">Công khai (Toàn văn)</Tag>;
        case 'abstract_only':
            return <Tag icon={<FileProtectOutlined />} color="cyan">Công khai (Chỉ tóm tắt)</Tag>;
        case 'department_only':
            return <Tag icon={<BankOutlined />} color="geekblue">Lưu hành Nội bộ</Tag>;
        default:
            return <Tag icon={<LockOutlined />}>Riêng tư</Tag>;
    }
};

    return (
        <DefaultLayout>
            <BreadcrumbComponent customNameMap={{ thesis: "Luận văn" }} />
            <Row gutter={24}>
                {/* Sidebar bộ lọc */}
                <Col xs={24} sm={8} md={6} lg={5}>
                    <FiltersSidebar 
                        filterValues={filterValues} 
                        onFilterChange={handleFilterChange}
                        onReset={handleReset}
                        activeKeys={activeKeys}
                        onActiveKeysChange={handleActiveKeysChange}
                    />
                </Col>

                {/* Nội dung */}
                <Col xs={24} sm={16} md={18} lg={19}>
                    <Space direction="vertical" style={{ width: "100%" }}>
                        
                        {/* 🔎 Search input và Sort */}
                        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                            <Input.Search
                                placeholder="🔎Tìm kiếm luận văn..."
                                allowClear
                                // 🔥 SỬ DỤNG inputSearchTerm để hiển thị gõ tức thời
                                value={inputSearchTerm} 
                                // Gọi hàm chỉ cập nhật input state
                                onChange={(e) => handleSearchChange(e.target.value)}
                                onSearch={handleSearchSubmit} // <- THAY ĐỔI QUAN TRỌNG

                                style={{ maxWidth: 400 }}
                            />
                            
                            
                            {/* PRESET SELECT */}
                             <Select
                                placeholder="Lọc thời gian tạo"
                                style={{ width: 150 }}
                                allowClear
                                value={presetValue}
                                onChange={handlePresetChange}
                            >
                                <Option value="24h">24 giờ qua</Option>
                                <Option value="7d">7 ngày qua</Option>
                                <Option value="30d">30 ngày qua</Option>
                                <Option value="this_year">Năm nay</Option>
                            </Select>
                            
                            {/* Sắp xếp */}
                            <SortComponent sortValue={sortValue} onChange={handleSortChange} />
                        </div>
                        {/* Hiển thị số kết quả */}
                        <Title level= {5} style={{ color: "#111827" }}>
                            💡 Kết quả tìm thấy: <span style={{ color: "#2563eb", fontWeight: 'bold' }}></span>
                            <span style={{  color: '#6b7280', marginLeft: '10px' }}>({totalTheses} kết quả)</span> 
                        </Title>
                        
                        {/* 5. SỬ DỤNG DỮ LIỆU ĐÃ LỌC/PHÂN TRANG TỪ BACKEND */}
                        {paginatedThesis?.map((thesis) => (
                            <Card key={thesis._id} style={CardModern}>
                                <Row gutter={16} align="middle">
                                    <Col xs={24} sm={6} md={5} lg={4}>
                                        <Thumbnail
                                            src={`${import.meta.env.VITE_API_URL}${thesis.thumbnail}`}
                                            alt="thumbnail"
                                        />
                                    </Col>

                                    <Col xs={24} sm={18} md={19} lg={20}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                            <TitleStyled onClick={() => navigate(`/thesis/${thesis._id}`)} style={{ margin: 0, flex: 1, marginRight: 10 }}>
                                                {highlightText(thesis.title, searchTerm)}
                                            </TitleStyled>
                                            
                                            {/* 🔥 BỔ SUNG: Hiển thị quyền truy cập ngay góc */}
                                            <div style={{ flexShrink: 0 }}>
                                                {renderAccessModeTag(thesis.accessMode)}
                                            </div>
                                        </div>
                                        

                                        <Paragraph ellipsis={{ rows: 3 }} style={{ color: "#475569" }}>
                                            {highlightText(thesis.tom_tat, searchTerm)}
                                        </Paragraph>

                                        <div style={{ marginBottom: 10 }}>
                                            <InfoText>
                                                <div style={{ marginBottom: 4 }}><FaUserGraduate /> {thesis.authorName || "N/A"}</div>
                                                <div><FaChalkboardTeacher /> <b>GVHD:</b> {thesis.supervisorName || "N/A"}</div>
                                            </InfoText>
                                            <InfoText>
                                                <FaCalendarAlt /> Năm: {thesis.year || "N/A"}
                                            </InfoText>
                                        </div>

                                        <StatsRow>
                                            <Stat><FaEye /> {thesis.views || 0}</Stat>
                                            <Stat><FaDownload /> {thesis.downloads || 0}</Stat>
                                            <FileTypeTag>
                                                {thesis.fileType === "docx" ? <FaFileWord /> : <FaFilePdf />}{" "}
                                                {thesis.fileType}
                                            </FileTypeTag>

                                            <Button type="default" onClick={() => navigate(`/thesis/${thesis._id}`)}>
                                                Xem chi tiết
                                            </Button>

                                            <FavoriteButtonComponent thesisId={thesis._id} />
                                        </StatsRow>
                                    </Col>
                                </Row>

                            </Card>
                        ))}

                        {totalTheses === 0 && (
                            <Title level={4} style={{ textAlign: "center", marginTop: 32 }}>
                                Không tìm thấy luận văn phù hợp.
                            </Title>
                        )}
                        {/* Phân trang */}
                        {totalTheses > 0 && (
                            <PaginationComponent
                                current={currentPage}
                                pageSize={pageSize}
                                total={totalTheses}
                                onChange={(page, size) => {
                                    setCurrentPage(page);
                                    setPageSize(size);
                                    
                                    // CẬP NHẬT URL KHI THAY ĐỔI PAGE/SIZE
                                    updateUrlParams(filterValues, searchTerm, sortValue, page, size, presetValue, activeKeys);
                                }}
                            />
                        )}
                    </Space>
                </Col>
            </Row>
        </DefaultLayout>
    );
};

export default ThesisListPage;