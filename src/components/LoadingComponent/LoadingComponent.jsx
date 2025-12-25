import React from "react";
import { Spin } from "antd";
const LoadingComponent = ({ size, isLoading, delay = 200, children }) => {
    return (
        <Spin size={size} spinning={isLoading} delay={delay}>
            {children}
        </Spin>
    );
};

export default LoadingComponent;
