import React from "react";
import { useQuery } from "@tanstack/react-query";
import * as CategoryService from "../../services/CategoryService";
import { Menu, Skeleton } from "antd";
import { Link, useParams } from "react-router-dom";
import { SidebarWrapper } from "./style";

// Import FontAwesome icons
import {
  FaBook,
  FaChartPie,
  FaUsers,
  FaDollarSign,
  FaFileAlt,
  FaFolderOpen,
} from "react-icons/fa";

const iconList = {
  "Kinh tế": "💰",
  "CNTT": "💻",
  "Bách khoa": "⚙️",
  "Xã hội": "🌍",
  "Sư phạm": "🎓",
  "Nông - Thủy sản": "🌾🐟",
  "Luật": "⚖️",
};

const iconColors = [
  "#ff4757", // đỏ cam
  "#1e90ff", // xanh dương
  "#2ed573", // xanh lá
  "#ffa502", // cam vàng
  "#3742fa", // xanh navy
  "#e84393", // hồng tím
];

const CategorySidebarComponent = () => {
  const { id } = useParams();
  const { data: response, isLoading } = useQuery({
    queryKey: ["getAllCategories"],
    queryFn: CategoryService.getCategories,
  });

  const categories = response?.data || [];

  return (
    <SidebarWrapper>
      {isLoading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
        <Menu mode="inline" selectedKeys={[id]} style={{ borderRight: 0 }}>
          {categories.map((category, index) => (
            <Menu.Item
              key={category._id}
              icon={<span style={{ fontSize: "18px" }}>{iconList[category.name] || "📁"}</span>}
              style={{
                transition: "all 0.3s",
              }}
              className="category-item"
            >
              <Link to={`/category/${category._id}`}>{category.name}</Link>
            </Menu.Item>
          ))}
        </Menu>
      )}
    </SidebarWrapper>
  );
};

export default CategorySidebarComponent;
