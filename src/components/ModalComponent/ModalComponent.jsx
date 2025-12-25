import React from "react";
import { CustomModal } from "./style";
const ModalComponent = ({ title, isOpen, children, ...rests }) => {
    return (
        <CustomModal title={title} open={isOpen} {...rests}>
            {children}
        </CustomModal>
    );
};

export default ModalComponent;