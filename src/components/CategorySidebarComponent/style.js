// CategorySidebarComponent.styles.js
import styled from "styled-components";

export const SidebarWrapper = styled.div`
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  background-color: #fff;
    .ant-menu-item {
        font-size: 16px;    
        font-weight: 500;
        color: #333;
        &:hover {
            color: #1677ff;
        }
    }
    .ant-menu-item-selected {
        background-color: #e6f7ff;
        color: #1677ff;
    }
        
`;
