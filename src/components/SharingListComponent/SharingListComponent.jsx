import React, { useMemo } from "react";
import { Modal, Descriptions, Tag, Table, Spin } from "antd";
import { useQuery } from "@tanstack/react-query";
import * as SharingService from "../../services/SharingService";

const ShareRequestDetailModal = ({ visible, onClose, dataTable, selectedKey }) => {
  // Lấy dòng dữ liệu từ dataTable dựa trên key được chọn
  const request = useMemo(() => {
    return dataTable?.find(item => item.key === selectedKey) || null;
  }, [dataTable, selectedKey]);

  // Query lấy danh sách xác nhận
  const { data: confirmations, isLoading, error } = useQuery({
    queryKey: ["getConfirmations", request?.sharingId],
    queryFn: () => SharingService.getConfirmations(request?.sharingId),
    enabled: visible && !!request?.sharingId, // chỉ chạy khi modal mở
  });

  if (!request) return null;

  const convertStatus = (status) => {
    switch (status) {
      case "pending":
        return "Chờ duyệt";
      case "approved":
        return "Đồng ý";
      case "rejected":
        return "Từ chối";
      default:
        return status;
    }
  };

  const columns = [
    {
      title: "Người xác nhận",
      render: (_, record) => record.user?.name || record.user?.email || "N/A",
    },
    {
      title: "Vai trò",
      render: (_, record) => {
        switch (record.byRole) {
          case "admin":
            return "Quản trị viên";
          case "lecturer":
            return "Giảng viên";
          case "student":
            return "Đồng tác giả";
          default:
            return "N/A";
        }
      },
    },
    {
      title: "Trạng thái",
      render: (_, record) => {
        let color;
        switch (record.status) {
          case "approved":
            color = "green"; break;
          case "rejected":
            color = "red"; break;
          case "pending":
            color = "orange"; break;
          default:
            color = "default";
        }
        return <Tag color={color}>{convertStatus(record.status)}</Tag>;
      },
    },
    {
      title: "Ngày",
      render: (_, record) =>
        new Date(record.createdAt).toLocaleString("vi-VN"),
    },
    {
      title: "Lý do từ chối",
      render: (_, record) => record.reason || "-",
    },
  ];

  return (
    <Modal
      title="Chi tiết yêu cầu chia sẻ luận văn"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <Descriptions
        column={1}
        size="middle"
        labelStyle={{ fontWeight: 600 }}
        style={{ marginBottom: 16 }}
      >
        <Descriptions.Item label="Tiêu đề luận văn">{request?.title}</Descriptions.Item>
        <Descriptions.Item label="Sinh viên thực hiện">{request?.authorName}</Descriptions.Item>
        <Descriptions.Item label="Chuyên ngành">{request?.major}</Descriptions.Item>
        <Descriptions.Item label="Năm">{request?.year}</Descriptions.Item>
        <Descriptions.Item label="Người gửi">{request?.requester.name}</Descriptions.Item>
        <Descriptions.Item label="Ngày gửi">{new Date(request?.createdAt).toLocaleDateString("vi-VN")}</Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          <Tag color={request?.status === "approved" ? "green" : request?.status === "rejected" ? "red" : "orange"}>
            {convertStatus(request?.status)}
          </Tag>
        </Descriptions.Item>
        {request?.fileUrl && (
          <Descriptions.Item label="File luận văn">
            <a href={`${import.meta.env.VITE_API_URL}${request?.fileUrl}`} target="_blank" rel="noopener noreferrer">Tải file</a>
          </Descriptions.Item>
        )}
      </Descriptions>

      {isLoading ? (
        <Spin />
      ) : error ? (
        <p style={{ color: "red" }}>Lỗi tải dữ liệu xác nhận</p>
      ) : (
        <div style={{ maxHeight: 300, overflowY: "auto" }}>
          <Table
            rowKey="_id"
            dataSource={Array.isArray(confirmations?.data) ? confirmations.data : []}
            columns={columns}
            pagination={false}
          />
        </div>
      )}
    </Modal>
  );
};

export default ShareRequestDetailModal;
