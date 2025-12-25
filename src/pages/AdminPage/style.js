import styled from "styled-components";
import { Flex } from "antd";

export const Toolbar = styled(Flex)`
  margin-bottom: 20px;
  padding: 10px 16px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
`;

export const LeftActions = styled(Flex)`
  gap: 12px;
  flex-wrap: wrap;
  flex: 1 1 300px;
  justify-content: flex-start;
`;

export const RightActions = styled(Flex)`
  gap: 12px;
  flex-wrap: wrap;
  flex: 1 1 300px;
  justify-content: flex-end;
`;

export const StyledTable = styled.div`
  .ant-table {
    border-radius: 8px;
    overflow: hidden;
  }
  .ant-table-thead > tr > th {
    background: #f3f4f6;
    font-weight: 600;
  }
  .ant-pagination {
    margin: 16px 0;
  }
`;

export const ModalBody = styled.div`
  padding: 20px;
`;

export const DrawerBody = styled.div`
  padding: 20px;
`;
