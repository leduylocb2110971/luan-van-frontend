// src/components/CategoriesComponent/CategoriesComponent.jsx
import React, { useMemo } from "react";
import { Dropdown, Button } from "antd";
import { DownOutlined } from "@ant-design/icons";
import styled from "styled-components";
import * as CategoryService from "../../services/CategoryService";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const StyledDropdown = styled(Dropdown)`
  .ant-dropdown-menu {
    background: #ffffff;
    border-radius: 12px;
    padding: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    min-width: 280px;
    transition: all 0.3s ease;
  }
`;

const CategoryList = styled.div`
  display: flex;
  flex-direction: column;
`;

const CategoryItem = styled.div`
  padding: 12px 16px;
  font-size: 14px;
  color: #374151;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;

  &:hover {
    background: #2563eb; // match accent color header
    color: #ffffff;
  }
`;

const CategoriesComponent = () => {
  const navigate = useNavigate();

  const { data: categoriesResponse } = useQuery({
    queryKey: ["categories"],
    queryFn: CategoryService.getCategories,
  });

  const categoriesData = categoriesResponse?.data || [];

  const menu = useMemo(
    () => ({
      items: [
        {
          key: "categories",
          label: (
            <CategoryList>
              {categoriesData.map((category) => (
                <CategoryItem
                  key={category._id}
                  onClick={() => navigate(`/thesis?categories=${category._id}&open=categories`)}
                >
                  {category.name}
                </CategoryItem>
              ))}
            </CategoryList>
          ),
        },
      ],
    }),
    [categoriesData, navigate]
  );

  return (
    <StyledDropdown menu={menu} placement="bottomLeft" trigger={["hover"]}>
      <Button
        type="text"
        style={{
          marginLeft: 16,
          fontSize: 16,
          fontWeight: 500,
          color: "#111827", // đồng bộ màu chữ header
          display: "flex",
          alignItems: "center",
          padding: "0 8px",
          border:"solid 1px #1750a4ff",
          borderRadius: "8px",
          height: "36px",
        }}
      >
        Danh mục <DownOutlined style={{ fontSize: 12 }} />
      </Button>
    </StyledDropdown>
  );
};

export default CategoriesComponent;
