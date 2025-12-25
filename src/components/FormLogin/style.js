import styled from "styled-components";

export const FormContainer = styled.div`
    background-color: #fff;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    width: 450px;

    & label {
        font-size: 16px;
        font-weight: 500;
        color: #333;
    }
    & .ant-input-outlined,
    .ant-input-password {
        font-size: 16px;
        padding: 4px;
        :hover {
            border-color: #1890ff;
        }
    }
`;