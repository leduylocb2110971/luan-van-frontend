import React, { useState, useEffect } from "react";
import { Button, Input, Tooltip } from "antd";
import { 
    FilterOutlined,
    CloseCircleOutlined
} from "@ant-design/icons";

// --- HÀM HỖ TRỢ XỬ LÝ DATE (QUAN TRỌNG) ---

// 1. Chuyển đổi chuỗi nhập liệu (DD/MM/YYYY hoặc DD-MM-YYYY) thành YYYY-MM-DD (cho API)
const parseDateToAPIFormat = (dateString) => {
    if (!dateString) return null;
    
    // Tìm các phần tử ngày/tháng/năm
    const parts = dateString.split(/[-/]/);
    
    if (parts.length === 3) {
        // Giả định định dạng nhập là DD/MM/YYYY hoặc DD-MM-YYYY
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);
        
        // Kiểm tra tính hợp lệ cơ bản
        if (isNaN(day) || isNaN(month) || isNaN(year) || month < 1 || month > 12 || day < 1 || day > 31) {
            return null;
        }

        // Trả về định dạng YYYY-MM-DD chuẩn cho API
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
    
    // Nếu không khớp DD/MM/YYYY, thử dùng Date() gốc.
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return null;
    }
    return date.toISOString().split('T')[0];
};

// 2. Chuyển đổi YYYY-MM-DD (từ API/initial props) thành DD/MM/YYYY (để hiển thị)
const formatDateToDisplay = (apiDateString) => {
    if (!apiDateString) return "";
    
    // apiDateString có format YYYY-MM-DD
    const parts = apiDateString.split('-');
    if (parts.length === 3) {
        // parts[0]=YYYY, parts[1]=MM, parts[2]=DD
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return apiDateString; // Trả lại chuỗi gốc nếu không đúng format
};


const DateRangeFilter = ({ onFilterApply, onFilterClear, initialStartDate, initialEndDate }) => {
    // Lưu trữ giá trị để hiển thị (format DD/MM/YYYY)
    // Chuyển đổi giá trị initial props (YYYY-MM-DD) sang DD/MM/YYYY
    const [startDateInput, setStartDateInput] = useState(formatDateToDisplay(initialStartDate));
    const [endDateInput, setEndDateInput] = useState(formatDateToDisplay(initialEndDate));
    const [error, setError] = useState("");
    
    // Đồng bộ hóa khi props thay đổi
    useEffect(() => {
        // Khi props thay đổi, đảm bảo input hiển thị format DD/MM/YYYY
        setStartDateInput(formatDateToDisplay(initialStartDate));
        setEndDateInput(formatDateToDisplay(initialEndDate));
        setError("");
    }, [initialStartDate, initialEndDate]);

    // isFiltered dựa trên props gốc (dữ liệu đang được áp dụng)
    const isFiltered = initialStartDate || initialEndDate;

    const handleApply = () => {
        setError("");

        // 1. Kiểm tra trường rỗng
        if (!startDateInput && !endDateInput) {
            handleClear();
            return;
        }
        if ((startDateInput && !endDateInput) || (!startDateInput && endDateInput)) {
            setError("Vui lòng nhập đầy đủ Ngày Bắt đầu và Ngày Kết thúc.");
            return;
        }

        // 2. Chuyển đổi chuỗi nhập liệu (DD/MM/YYYY) sang format chuẩn API (YYYY-MM-DD)
        const parsedStart = parseDateToAPIFormat(startDateInput);
        const parsedEnd = parseDateToAPIFormat(endDateInput);

        // 3. Kiểm tra tính hợp lệ và định dạng
        if (!parsedStart || !parsedEnd) {
             setError("Định dạng ngày không hợp lệ. Vui lòng dùng DD/MM/YYYY.");
             return;
        }

        // 4. Kiểm tra logic ngày
        if (new Date(parsedStart) > new Date(parsedEnd)) {
            setError("Ngày Bắt đầu không được sau Ngày Kết thúc.");
            return;
        }

        // 5. Áp dụng bộ lọc với format chuẩn API
        onFilterApply(parsedStart, parsedEnd);
        // LƯU Ý: Không cần update state input ở đây, vì việc áp dụng thành công
        // sẽ kích hoạt fetch dữ liệu mới, và useEffect sẽ tự động update input
        // bằng initialStartDate/initialEndDate mới nhận được từ props.
    };

    const handleClear = () => {
        setStartDateInput("");
        setEndDateInput("");
        setError("");
        onFilterClear();
    };

    const isInputFilled = startDateInput || endDateInput;
    
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 10px",
                backgroundColor: isFiltered ? "#e6f7ff" : (error ? "#fff1f0" : "#fff"), 
                borderRadius: "6px",
                border: error ? "1px solid #ff4d4f" : "1px solid #d9d9d9",
                transition: "all 0.3s"
            }}
        >
            <Input
                type="text"
                value={startDateInput}
                onChange={(e) => setStartDateInput(e.target.value)}
                style={{ width: "100px" }}
                placeholder="DD/MM/YYYY"
                size="small"
                status={error ? 'error' : undefined}
                onPressEnter={handleApply} 
            />
            <span style={{ fontSize: "16px", color: "#888" }}>→</span>  

            <Input
                type="text"
                value={endDateInput}
                onChange={(e) => setEndDateInput(e.target.value)}
                style={{ width: "100px" }}
                placeholder="DD/MM/YYYY"
                size="small"
                status={error ? 'error' : undefined}
                onPressEnter={handleApply}
            />

            {/* Nút Áp dụng */}
            <Tooltip title="Áp dụng lọc">
                <Button
                    type="primary"
                    icon={<FilterOutlined />}
                    size="small"
                    onClick={handleApply}
                    disabled={!isInputFilled}
                />
            </Tooltip>

            {/* Nút Xóa (Chỉ hiện khi có lọc đang áp dụng) */}
            {isFiltered && (
                <Tooltip title="Xóa lọc">
                    <Button
                        danger
                        icon={<CloseCircleOutlined />}
                        size="small"
                        onClick={handleClear}
                    />
                </Tooltip>
            )}

            {error && (
                <p style={{ color: "#ff4d4f", fontSize: "12px", margin: 0, marginLeft: '8px', flexShrink: 0 }}>
                    {error}
                </p>
            )}
        </div>
    );
};

export default DateRangeFilter;