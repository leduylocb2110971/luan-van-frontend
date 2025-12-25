// components/FieldFilterComponent/FieldFilterComponent.jsx
import React from 'react';
import { Select } from "antd"; // Import Select

// Giả sử component này nhận danh sách Chủ đề từ prop
const FieldFilterComponent = ({ 
    selectedFields = [], 
    onFilterChange,
    filterKey = "fields",  // ⭐ mặc định là 'fields' 
    fieldsData = [], 
    placeholder = "📚 Chọn Chủ đề",
    style 
}) => {
    
    // Tạo Options cho Select: label là tên chủ đề, value là ID (theo cấu trúc bạn cung cấp)
    const options = fieldsData.map(field => ({ 
        label: field.name, 
        value: field._id 
    }));

    return (
        <Select
            mode="multiple" // Cho phép chọn nhiều chủ đề
            allowClear
            style={{ minWidth: 200, ...style }} // Cần width lớn hơn Năm vì tên Chủ đề thường dài
            placeholder={placeholder}
            value={selectedFields}
            onChange={(checkedValues) => onFilterChange(filterKey, checkedValues)}
            options={options}
            maxTagCount="responsive" // Giúp các tag bị ẩn khi không đủ chỗ
        />
    );
};

export default FieldFilterComponent;