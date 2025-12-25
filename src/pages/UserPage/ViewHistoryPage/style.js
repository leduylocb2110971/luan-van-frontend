import styled from "styled-components";
export const Wrapper = styled.div`
  max-width: 1100px;
  margin: 0 auto;

  .history-row {
    padding: 20px 0;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    &:hover .actions {
      opacity: 1;
    }
  }

  .history-left {
    display: flex;
    gap: 20px;
    max-width: 900px;
  }

  .thumb {
    width: 80px;
    height: 110px;
    object-fit: cover;
    border-radius: 6px;
    border: 1px solid #eee;
    background: #fafafa;
  }

  .content {
    flex: 1;
  }

  .title {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 6px;
    cursor: pointer;

    &:hover {
      color: #1677ff;
    }
  }

  .meta {
    font-size: 13px;
    color: #888;
    margin-bottom: 6px;
  }

  .abstract {
    font-size: 14px;
    color: #444;
    line-height: 1.5;
    max-width: 700px;

    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .actions {
    display: flex;
    gap: 8px;
    opacity: 0;
    transition: opacity 0.2s;
  }
`;
