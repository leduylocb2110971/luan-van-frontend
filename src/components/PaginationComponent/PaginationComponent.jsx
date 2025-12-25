import React from "react";
import { Pagination } from "antd";
import styled from "styled-components";

const PaginationWrapper = styled.div`
  display: flex;
  margin: 24px 0;
  justify-content: center; /* căn giữa */  
`;

const PaginationComponent = ({ current, pageSize, total, onChange }) => {
  return (
    <PaginationWrapper>
      <Pagination
        current={current}
        pageSize={pageSize}
        total={total}
        showSizeChanger
        pageSizeOptions={['5', '10', '20', '50']}
        onChange={onChange}
      />
    </PaginationWrapper>
  );
};

export default PaginationComponent;
