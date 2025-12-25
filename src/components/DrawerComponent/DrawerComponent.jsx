import React from "react";
import { Drawer } from "antd";
const DrawerComponent = ({
    title = "Drawer",
    placement = "right",
    children,
    isOpen = false,
    ...rests
}) => {
    return (
        <Drawer title={title} open={isOpen} placement={placement} {...rests}>
            {children}
        </Drawer>
    );
};

export default DrawerComponent;