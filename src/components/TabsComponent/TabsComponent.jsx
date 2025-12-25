import React from "react";
import { CustomTabs } from "./style";
const TabsComponent = ({ items, onChange, ...rests }) => {
    return <CustomTabs items={items} onChange={onChange} centered {...rests} />;
};

export default TabsComponent;