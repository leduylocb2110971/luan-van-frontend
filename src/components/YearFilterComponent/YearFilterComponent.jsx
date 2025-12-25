// components/YearFilterComponent/YearFilterComponent.jsx
import React from 'react';
import { Select } from "antd"; // Import Select

const YearFilterComponent = ({ selectedYears = [], onFilterChange, style }) => {
    
    // Giả sử bạn fetch được danh sách các năm có luận văn (ví dụ: 2025, 2024, 2023)
    // Lưu ý: Dữ liệu năm nên là số (number) để đồng bộ với query/filter, nhưng Select có thể xử lý string/number.
    const availableYears = ["2025", "2024", "2023", "2022", "2021"]; 
    
    // Tạo Options cho Select
    const options = availableYears.map(year => ({ 
        label: year, 
        value: year 
    }));

    return (
        <Select
            mode="multiple" // Cho phép chọn nhiều năm
            allowClear
            style={{ minWidth: 150, ...style }} // Giữ width tối thiểu
            placeholder="📅 Chọn Năm"
            value={selectedYears}
            onChange={(checkedValues) => onFilterChange("years", checkedValues)}
            options={options}
            maxTagCount="responsive" // Giúp các tag bị ẩn khi không đủ chỗ
        />
    );
};

export default YearFilterComponent;