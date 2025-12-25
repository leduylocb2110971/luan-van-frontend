import React from 'react';
import { CustomButton } from './style';
const ButtonComponent = ({
    size ="middle",// Kích thước mặc định 
    children, // Nội dung của nút
    styleButton, // Kiểu dáng của nút
    disabled, // Nút có bấm được hay không
    onClick, // Xử lí khi bấm nút
    ...rests // Các thuộc tính khác

})=>{
    return (
    <CustomButton
        size={size}
        onClick={onClick}
        disabled={disabled}
        style={{
            ...styleButton,
            backgroundColor: disabled
                ? "#ccc"
                : styleButton?.backgroundColor,
        }}
        {...rests}
    >
        {children}
    </CustomButton>
);
}
export default ButtonComponent;
