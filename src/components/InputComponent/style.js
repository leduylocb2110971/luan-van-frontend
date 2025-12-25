import styled from "styled-components";
import { Input } from "antd";

const { Search } = Input;

export const InputContainer = styled(Search)`
    width: 100%;
    max-width: 700px;
    margin: 0 auto;

    .ant-input {
        height: 40px;
        border-radius: 25px 0 0 25px;
        font-size: 16px;
    }

    .ant-input-search-button {
        height: 40px;
        border-radius: 0 25px 25px 0;
        background-color: blue;
        border-color:rgb(24, 255, 143);
        font-weight: bold;
        background-color:rgb(196, 26, 94);

        &:hover {
            background-color:rgb(16, 68, 19);
            border-color:rgb(24, 109, 37);
        }
    }

    .ant-input-group-addon {
        overflow: hidden; /* tránh cắt tròn bị xấu */
    }
`;