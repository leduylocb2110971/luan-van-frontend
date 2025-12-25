import React from "react";
import { Select, Tag } from "antd";
import {
  EyeOutlined,
  DownloadOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

const { Option } = Select;

const SortComponent = ({ sortValue, onChange }) => {
  const options = [
    { value: "views", label: "Lượt xem", icon: <EyeOutlined />, color: "#3b82f6" },
    { value: "downloads", label: "Lượt tải", icon: <DownloadOutlined />, color: "#10b981" },
    { value: "newest", label: "Mới nhất", icon: <ClockCircleOutlined />, color: "#8b5cf6" },
    { value: "oldest", label: "Cũ nhất", icon: <CalendarOutlined />, color: "#f97316" },
  ];

  return (
    <div style={{
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center",
      gap: 8,
      flexWrap: "wrap",
    }}>
      <Select
        value={sortValue}
        onChange={onChange}
        placeholder="Sắp xếp theo"
        allowClear
        style={{ minWidth: 140 }}
        popupRenderer={menu => (
          <div style={{ padding: 8, background: "#f0f9ff", borderRadius: 8 }}>
            {menu}
          </div>
        )}
      >
        {options.map(opt => (
          <Option key={opt.value} value={opt.value}>
            <Tag
              style={{
                background: opt.color,
                color: "#fff",
                alignItems: "center",
                gap: 4,
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                transition: "transform 0.2s",
              }}
            >
              {opt.icon}
            </Tag>
            <span style={{ marginLeft: 6, fontWeight: 500 }}>{opt.label}</span>
          </Option>
        ))}
      </Select>
    </div>
  );
};

export default SortComponent;
