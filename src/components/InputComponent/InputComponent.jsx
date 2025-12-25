import React from "react";
import { InputContainer } from "./style";
const InputComponent = ({ placeholder, onSearch, ...rests }) => {
    return (
        <InputContainer
            placeholder={placeholder}
            onSearch={onSearch}
            enterButton
            {...rests}
        />
    );
};

export default InputComponent;