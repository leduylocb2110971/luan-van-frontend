import React from "react";
import { Modal, Typography, Button, Spin, Empty, Select } from "antd";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import * as ThesisService from "../../services/TheSisService";
import * as Message from "../Message/Message";

const { Paragraph, Text } = Typography;
const CITATION_STYLES = [
  { value: "APA", label: "APA (American Psychological Association)" },
  { value: "MLA", label: "MLA (Modern Language Association)" },
  { value: "CHICAGO", label: "Chicago (Author-Date)" },
];

const CitationModalComponent = ({ visible, onClose, thesisDetail }) => {
  const id = thesisDetail?._id;
  const [selectedStyle, setSelectedStyle] = useState("APA");

  const mutationGenerateCitation = useMutation({
    mutationFn: ({ id, style }) => ThesisService.generateCitation(id, style),
    onSuccess: (data) => {
      if(data.status !== 'error') {
      Message.success("Tạo trích dẫn thành công");
      }
    },
    onError: (error) => {
      Message.error("Không thể tạo trích dẫn");
      console.error("Lỗi tạo trích dẫn:", error);
    },
  });

  const handleGenerateCitation = () => {
    mutationGenerateCitation.mutate({ id, style: selectedStyle });
  };

  // lấy citation từ response (tránh render object)
  const citation =
    mutationGenerateCitation.data?.data || mutationGenerateCitation.data;

  return (
    <Modal
      title="Trích dẫn tài liệu tham khảo"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button onClick={onClose}>Đóng</Button>,
          <Button
            type="primary"
            onClick={handleGenerateCitation}
            loading={mutationGenerateCitation.isLoading}
          >
            Tạo trích dẫn
          </Button>
      ]}
    >
      <div style={{ marginBottom: 20 }}>
        <Text strong>Chọn Kiểu Trích Dẫn:</Text>
        <Select
          defaultValue="APA"
          style={{ width: "100%", marginTop: 8 }}
          options={CITATION_STYLES}
          // 4. Cập nhật State khi người dùng thay đổi lựa chọn
          onChange={(value) => setSelectedStyle(value)}
        />
      </div>
      {mutationGenerateCitation.isLoading ? (
        <div>
          <Spin tip="Đang tạo trích dẫn..." />
        </div>
      ) : citation ? (
        <Paragraph
          copyable
          style={{
            background: "#fafafa",
            padding: "12px",
            borderRadius: "8px",
          }}
        >
          {citation}
        </Paragraph>
      ) : (
        <Empty
          description={
            <Text type="secondary">
              Nhấn <b>"Tạo trích dẫn"</b> để tạo trích dẫn cho luận văn này.
            </Text>
          }
        />
      )}
    </Modal>
  );
};

export default CitationModalComponent;
