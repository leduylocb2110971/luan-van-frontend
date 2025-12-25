import React from "react";
import { Breadcrumb, Tooltip } from "antd";
import { Link, useLocation } from "react-router-dom";
import { HomeOutlined, RightOutlined } from "@ant-design/icons";

const BreadcrumbComponent = ({
  idNameMap = {},
  customNameMap = {},
}) => {
  const location = useLocation();
  const pathSnippets = location.pathname.split("/").filter(Boolean);

  const isObjectId = (str) => /^[a-f\d]{24}$/i.test(str);

  // LOGIC MỚI: TẠO MẢNG CÁC ĐỐI TƯỢNG CẤU HÌNH
  const breadcrumbItems = [
    // 1. Item Home
    {
      key: "home",
      title: (
        <Link to="/">
          <HomeOutlined />
        </Link>
      ),
    },
    // 2. Các Item từ đường dẫn
    ...pathSnippets.map((segment, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join("/")}`;
      const isLast = index === pathSnippets.length - 1;

      const getLabel = () => {
        if (customNameMap[segment]) return customNameMap[segment];
        if (isObjectId(segment)) return idNameMap[segment] || "Chi tiết";
        return segment.charAt(0).toUpperCase() + segment.slice(1);
      };
      const label = getLabel();

      // bọc trong Tooltip + ellipsis
      const EllipsisText = (
        <span style={{ maxWidth: "100%" }}>
          {label}
        </span>
      );

      // Xây dựng title dựa trên việc có phải là item cuối cùng hay không
      const itemTitle = isLast ? (
        <Tooltip title={label} placement="top">
          {EllipsisText}
        </Tooltip>
      ) : (
        <Tooltip title={label} placement="top">
          <Link to={url}>
            {EllipsisText}
          </Link>
        </Tooltip>
      );

      // Trả về đối tượng cấu hình
      return {
        key: url,
        title: itemTitle,
      };
    }),
  ];

  return (
    <div
      style={{
        padding: "16px 0 ",
        borderBottom: "1px solid #e5e7eb",
        backgroundColor: "#ffffff",
        marginBottom: 24,
      }}
    >
      <Breadcrumb
        // SỬ DỤNG PROP `items` THAY VÌ TRUYỀN CHILD
        items={breadcrumbItems} 
        // Vẫn giữ `separator` ở đây nếu bạn muốn dùng global separator
        separator={<RightOutlined style={{ color: "#9ca3af", fontSize: 12 }} />}
      >
      </Breadcrumb>
    </div>
  );
};

export default BreadcrumbComponent;