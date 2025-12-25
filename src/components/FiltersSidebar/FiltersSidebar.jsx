import React, { useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Card, Button, Divider, Typography, Select, Collapse, Space } from "antd"; 
import { FilterOutlined, SyncOutlined } from '@ant-design/icons';
import * as CategoryService from "../../services/CategoryService";
import * as MajorService from "../../services/MajorService";
import * as FieldService from "../../services/FieldService";
import * as SupervisorService from "../../services/SupervisorService";
import * as ThesisService from "../../services/TheSisService";


const { Paragraph, Title, Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse; 

// Helper để lấy ID, xử lý trường hợp ID đã là chuỗi/số hoặc nằm trong đối tượng
const getObjectId = (obj) => (obj && obj._id) ? obj._id : obj;

const filterSelectOption = (input, option) => {
    // Sử dụng option.label cho mục đích tìm kiếm (đã được thêm vào Option bên dưới)
    const textToFilter = option.label || (typeof option.items === 'string' ? option.items : '');
    if (!textToFilter) return false;
    return textToFilter.toLowerCase().includes(input.toLowerCase());
};

const FilterSidebar = ({ filterValues, onFilterChange, onReset, activeKeys, onActiveKeysChange }) => {
    
    // Giờ đây, chúng ta chỉ làm việc với props.
    const selectedCategories = filterValues.categories || []; 
    const selectedMajors = filterValues.majors || [];
    const selectedYears = filterValues.years || [];
    const selectedFields = filterValues.fields || [];
    const selectedSupervisors = filterValues.supervisors || [];
    const selectedKeywords = filterValues.keywords || [];
    const selectedAccessModes = filterValues.accessMode || [];

    
    // --- QUERY DỮ LIỆU TỪ BACKEND (Giữ nguyên) ---
    const { data: categoriesData } = useQuery({ queryKey: ['categories'], queryFn: CategoryService.getCategories });
    const allCategories = categoriesData?.data || [];
    
    const { data: majorsData} = useQuery({ queryKey: ['majors'], queryFn: MajorService.getAllMajors });
    const allMajors = majorsData?.data || [];
    
    const { data: fieldsData} = useQuery({ queryKey: ['fields'], queryFn: FieldService.getAllFields }); 
    const allFields = fieldsData?.data || [];
    
    const { data: supervisorsData } = useQuery({ queryKey: ['supervisors'], queryFn: SupervisorService.getSupervisorsList });
    const allSupervisors = supervisorsData?.data|| [];

    const { data: keywordsData } = useQuery({ queryKey: ['thesisKeywords'], queryFn: ThesisService.getPopularKeywords });
    const allKeywords = keywordsData?.data || [];

    const { data: yearsData } = useQuery({ queryKey: ['thesisYears'], queryFn: ThesisService.getThesisYears });
    const allYears = yearsData?.data || [];

    // Tạo mảng access modes (Giữ nguyên)
    const allAccessModes = [
        { label: "Công khai (toàn văn)", value: "public_full" },
        { label: "Công khai (tóm tắt)", value: "abstract_only" },
        { label: "Nội bộ", value: "department_only" },
    ];


    // --- LOGIC LỌC TẠI FRONTEND ---

    // 1. Lọc danh sách Majors hiển thị (Phụ thuộc vào selectedCategories)
    const visibleMajors = useMemo(() => {
        if (selectedCategories.length === 0) return allMajors; 
        
        return allMajors.filter(major =>
            selectedCategories.some(catId => getObjectId(major.category) === catId)
        );
    }, [allMajors, selectedCategories]);

    // 2. Lọc danh sách Fields hiển thị (Độc lập, luôn trả về tất cả fields)
    const visibleFields = allFields; 


    // --- HÀM XỬ LÝ SỰ KIỆN (EVENTS - GIỮ NGUYÊN LOGIC) ---

    const handleChainedFilterChange = (filterKey, newSelectedArray) => {
        
        let newFilters = { ...filterValues };
        
        // 1. Cập nhật cấp hiện tại
        newFilters[filterKey] = newSelectedArray;

        // 2. Xử lý logic phân cấp (Cleanup Majors nếu Categories thay đổi)
        if (filterKey === 'categories') {
            // Khi Category thay đổi, reset cấp dưới (Major) nếu cần
            
            const validMajorIds = visibleMajors.map(m => getObjectId(m));
            
            // Lọc ra các Majors hiện tại vẫn hợp lệ dựa trên Categories mới
            const cleanedMajors = (filterValues.majors || []).filter(majorId => 
                validMajorIds.includes(majorId)
            );
            
            // Nếu có Major bị loại bỏ hoặc không có Category nào được chọn
            if (newSelectedArray.length === 0 || cleanedMajors.length !== (filterValues.majors || []).length) {
                newFilters.majors = []; 
            }
            // Logic cleanup Fields đã bị loại bỏ như yêu cầu
        } else if (filterKey === 'majors') {
            // Khi Major thay đổi, KHÔNG reset Fields
        }
        
        // 3. Gửi toàn bộ object filterValues đã cập nhật lên component cha
        onFilterChange(newFilters); 
    };
    
    // Hàm xử lý thay đổi cho Years (đã sửa đổi để hỗ trợ multiple-select như các bộ lọc khác)
    const handleYearToggle = (yearStr) => {
        const currentYears = filterValues.years || [];
        let newYears;
        if (currentYears.includes(yearStr)) {
            // Bỏ chọn
            newYears = currentYears.filter(y => y !== yearStr);
        } else {
            // Chọn
            newYears = [...currentYears, yearStr];
        }
        onFilterChange({ years: newYears }); 
    }
    // Hàm checkbox cho Keywords (Tương tự như Years nhưng sẽ gửi đi tên keyword khi chọn)
    const handleKeywordToggle = (keyword) => {
        const currentKeywords = filterValues.keywords || [];
        let newKeywords;
        if (currentKeywords.includes(keyword)) {
            // Bỏ chọn
            newKeywords = currentKeywords.filter(k => k !== keyword);
        } else {
            // Chọn
            newKeywords = [...currentKeywords, keyword];
        }
        onFilterChange({ keywords: newKeywords }); 
    }
    // Hàm checkbox cho Access Modes (Tương tự như Years)
    const handleAccessModeToggle = (mode) => {
        const currentModes = filterValues.accessMode || [];
        let newModes;
        if (currentModes.includes(mode)) {
            // Bỏ chọn
            newModes = currentModes.filter(m => m !== mode);
        } else {
            // Chọn
            newModes = [...currentModes, mode];
        }
        onFilterChange({ accessMode: newModes }); 
    }
    const handleCollapseChange = (keys) => {
        // keys là một mảng chứa tất cả các keys của Panel đang mở
        onActiveKeysChange(keys); // GỌI LÊN COMPONENT CHA
    };

    // ... (Icon mapping) ...
    const iconList = {
        "Kinh tế": "💰",
        "CNTT và Truyền thông": "💻",
        "Bách khoa": "⚙️",
        "Xã hội Nhân văn": "🌍",
        "Sư phạm": "🎓",
        "Nông nghiệp": "🌾",
        "Thủy sản": "🐟",
        "Luật": "⚖️",
        "Viện công nghệ sinh học và thực phẩm": "🔬",
        "Khoa học tự nhiên": "🔭",
        "Môi trường": "🌳",
    };
    

    return (
        <div 
            style={{ 
                border: '1px solid #f0f0f0', 
                borderRadius: 8, 
                overflow: 'hidden',
                backgroundColor: 'white',
                position: "sticky", 
                top: 74 
            }}
        >
            {/* Header */}
            <div style={{ padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0' }}>
                <Title level={5} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FilterOutlined /> Bộ lọc
                </Title>
                <Button onClick={onReset} type="link" size="small" icon={<SyncOutlined />}>
                    Reset
                </Button>
            </div>

            {/* Collapse chứa các bộ lọc */}
            <Collapse
                bordered={false}
                // Mở mặc định tất cả các panel
                defaultActiveKey={['supervisors', 'keywords', 'years']} 
                activeKey={activeKeys} // ✅ Dùng activeKey (Controlled Component)
                onChange={handleCollapseChange} // ✅ Dùng hàm truyền lên cha
                expandIconPosition="end"
                style={{ background: 'white' }}
            >
                {/* 1. LỌC KHOA (CATEGORIES) */}
                <Panel header={<span style={{ fontWeight: 'bold' }}>Khoa/Viện</span>} key="categories">
                    <Select
                        mode="multiple"
                        placeholder="Chọn Khoa..."
                        value={selectedCategories}
                        onChange={(newValues) => handleChainedFilterChange("categories", newValues)}
                        style={{ width: '100%' }}
                        allowClear
                        showSearch
                        filterOption={filterSelectOption}
                    >
                        {allCategories?.map(category => (
                            <Option key={category._id} value={category._id} label={category.name}>
                                {iconList[category.name] || "📁"} {category.name}
                            </Option>
                        ))}
                    </Select>
                </Panel>
                
                {/* 2. LỌC NGÀNH (MAJORS - Phụ thuộc vào Categories) */}
                <Panel 
                    header={<span style={{ fontWeight: 'bold' }}>Ngành</span>} 
                    key="majors"
                    // Chỉ hiển thị Ngành nếu có Khoa được chọn
                    style={{ display: selectedCategories.length > 0 ? 'block' : 'none' }} 
                >
                    <Select
                        mode="multiple"
                        placeholder="Chọn Ngành..."
                        value={selectedMajors}
                        onChange={(newValues) => handleChainedFilterChange("majors", newValues)}
                        style={{ width: '100%' }}
                        allowClear
                        disabled={visibleMajors.length === 0}
                        showSearch
                        filterOption={filterSelectOption}
                    >
                        {visibleMajors?.map(major => (
                            <Option key={major._id} value={major._id} label={major.name}>
                                {major.name}
                            </Option>
                        ))}
                    </Select>
                    {visibleMajors.length === 0 && selectedCategories.length > 0 && (
                        <span style={{ color: '#aaa', fontStyle: 'italic', display: 'block', marginTop: 8 }}>Không có ngành nào phù hợp.</span>
                    )}
                </Panel>
                {/* 3. LỌC CHỦ ĐỀ NGHIÊN CỨU (FIELDS - Độc lập) */}
                <Panel header={<span style={{ fontWeight: 'bold' }}>Chủ đề nghiên cứu</span>} key="fields">
                    <Select
                        mode="multiple"
                        placeholder="Chọn chủ đề..."
                        value={selectedFields}
                        onChange={(newValues) => handleChainedFilterChange("fields", newValues)}
                        style={{ width: '100%' }}
                        allowClear
                        showSearch
                        filterOption={filterSelectOption}
                        disabled={visibleFields.length === 0 && allFields.length > 0} 
                    >
                        {visibleFields?.map(field => (
                            <Option key={field._id} value={field._id} label={field.name}>
                                {field.name}
                            </Option>
                        ))}
                    </Select>
                </Panel>
                {/* 5. LỌC NĂM (YEARS - Độc lập) */}
                <Panel header={<span style={{ fontWeight: 'bold' }}>Năm</span>} key="years">
                    <Space direction="vertical" style={{ width: "100%" }}>
                        {allYears?.map(item => {
                            // 🔥 FIX: Ép kiểu dữ liệu về String để so sánh chính xác với URL
                            const yearStr = String(item); 
                            const isChecked = selectedYears?.includes(yearStr);

                            return (
                                <label
                                    key={yearStr}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                        padding: '0px 8px',
                                        borderRadius: 6,
                                        cursor: "pointer",
                                        // Sử dụng biến isChecked đã so sánh đúng kiểu
                                        backgroundColor: isChecked ? "#e6f7ff" : "transparent",
                                        transition: "background-color 0.2s"
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isChecked} // Sử dụng biến isChecked
                                        // Truyền chuỗi yearStr vào hàm toggle để đảm bảo đồng nhất
                                        onChange={() => handleYearToggle(yearStr)} 
                                    />
                                    <span style={{ fontWeight: 500 }}>{yearStr}</span>
                                </label>
                            );
                        })}
                    </Space>
                </Panel>
                {/* 4. LỌC GIẢNG VIÊN HƯỚNG DẪN (SUPERVISOR - Độc lập) */}
                <Panel header={<span style={{ fontWeight: 'bold' }}>Giảng viên hướng dẫn</span>} key="supervisors">
                    {/* Sử dụng Kiểu select */}
                    <Select
                        mode="multiple"
                        placeholder="Chọn giảng viên hướng dẫn..."
                        value={selectedSupervisors}
                        onChange={(newValues) => handleChainedFilterChange("supervisors", newValues)}
                        style={{ width: '100%' }}
                        allowClear
                        showSearch
                        filterOption={filterSelectOption}
                        disabled={allSupervisors.length === 0 && allSupervisors.length > 0} 
                    >
                        {allSupervisors?.map(supervisor => (
                            <Option key={supervisor._id} value={supervisor._id} label={supervisor.name}>
                                {supervisor.name}
                            </Option>
                        ))}
                    </Select>

                </Panel>
                {/* 5. CHECKBOX HÌNH THỨC TRUY CẬP (ACCESS MODES - Độc lập) */}
                <Panel header={<span style={{ fontWeight: 'bold' }}>Hình thức truy cập</span>} key="accessMode">
                    <Space direction="vertical" style={{ width: "100%" }}>
                        {allAccessModes?.map(mode => (
                            <label
                                key={mode.value}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    padding: '0px 8px',
                                    borderRadius: 6,
                                    cursor: "pointer",
                                    backgroundColor: selectedAccessModes?.includes(mode.value) ? "#e6f7ff" : "transparent",
                                    transition: "background-color 0.2s"
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedAccessModes?.includes(mode.value)}
                                    onChange={() => handleAccessModeToggle(mode.value)} 
                                />
                                <span style={{ fontWeight: 500 }}>{mode.label}</span>
                            </label>
                        ))}
                    </Space>
                </Panel>
                {/* 6. LỌC TỪ KHÓA (KEYWORDS - Độc lập) */}
                <Panel header={<span style={{ fontWeight: 'bold' }}>Từ khóa phổ biến</span>} key="keywords">
                    {/* Sử dụng Ant Design Text để thống nhất style */}
                    <Space direction="vertical" style={{ width: "100%" }}>
                        {allKeywords?.map(keyword => (
                            // 🔥 keyword hiện là một object { _id: 'tên', count: số }
                            <label
                                key={keyword._id} // SỬA: Dùng keyword._id làm key
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between", // Căn count sang phải
                                    padding: '0px 8px',
                                    borderRadius: 6,
                                    cursor: "pointer",
                                    // SỬA: So sánh mảng selectedKeywords với keyword._id
                                    backgroundColor: selectedKeywords?.includes(keyword._id) ? "#e6f7ff" : "transparent",
                                    transition: "background-color 0.2s"
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedKeywords?.includes(keyword._id)} // SỬA: Dùng keyword._id
                                        // SỬA: Truyền keyword._id (chuỗi) vào hàm toggle
                                        onChange={() => handleKeywordToggle(keyword._id)} 
                                    />
                                    <span style={{ fontWeight: 500 }}>{keyword._id}</span>
                                </div>
                                
                                {/* HIỂN THỊ SỐ LƯỢNG */}
                                <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>
                                    ({keyword.count})
                                </span>
                            </label>
                        ))}
                    </Space>
                </Panel>

            </Collapse>
        </div>
    );
};

export default FilterSidebar;