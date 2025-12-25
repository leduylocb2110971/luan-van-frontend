import React from "react";
import { Dropdown, Button, Popconfirm } from "antd";
import { EllipsisOutlined } from "@ant-design/icons";

const ActionsDropdownComponent = ({ items = [] }) => {
  // Chuyển items sang định dạng mà Dropdown mới yêu cầu
  const menuItems = items.map((item, idx) => ({
    key: idx,
    label: item.label,
    disabled: item.disabled,
    onClick: item.onClick,
  }));

  return (
    <Dropdown
      menu={{ items: menuItems }}
      trigger={["hover"]}
      placement="bottomRight"
      mouseEnterDelay={0.1}
      mouseLeaveDelay={0.3}
    >
      <Button shape="circle" icon={<EllipsisOutlined />} />
    </Dropdown>
  );
};

export default ActionsDropdownComponent;
