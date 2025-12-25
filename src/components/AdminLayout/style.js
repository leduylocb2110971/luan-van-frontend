import styled from "styled-components";
export const PopupItem = styled.p`
    margin: 0;
    padding: 8px 16px;
    cursor: pointer;
    border-radius: 4px;
    &:not(:last-child) {
        border-bottom: 1px solid #f0f0f0;
    }
    &:hover {
        background-color: #f0f0f0;
        color: #1890ff;
    }
`;