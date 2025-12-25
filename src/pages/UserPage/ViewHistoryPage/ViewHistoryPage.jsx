import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  List,
  Typography,
  Spin,
  Pagination,
  Button,
  Space,
  Modal,
  message,
  Empty,
} from "antd";
import {
  ClockCircleOutlined,
  DeleteOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

import DefaultLayout from "../../../components/DefaultLayout/DefaultLayout";
import BreadCrumbComponent from "../../../components/BreadcrumbComponent/BreadcrumbComponent";
import FavoriteButtonComponent from "../../../components/FavoriteButtonComponent/FavoriteButtonComponent";
import * as ViewHistoryService from "../../../services/ViewHistoryService";

import { Wrapper,

      } from "./style";

const { Title, Text } = Typography;

const ViewHistoryPage = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["view-history", page, limit],
    queryFn: () =>
      ViewHistoryService.getViewHistoryByUserId({ page, limit }),
    enabled: !!user?.id,
    onError: (err) =>
      message.error("Không thể tải lịch sử xem: " + err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: ViewHistoryService.deleteViewHistoryById,
    onSuccess: () => {
      message.success("Đã xóa khỏi lịch sử");
      refetch();
    },
  });

  const deleteAllMutation = useMutation({
    mutationFn: ViewHistoryService.deleteAllViewHistoryByUser,
    onSuccess: () => {
      message.success("Đã xóa toàn bộ lịch sử");
      setPage(1);
      refetch();
    },
  });

  const confirmDeleteAll = () => {
    Modal.confirm({
      title: "Xóa toàn bộ lịch sử xem?",
      icon: <ExclamationCircleOutlined />,
      content: "Hành động này không thể hoàn tác.",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => deleteAllMutation.mutate(),
    });
  };

  const histories = data?.data || [];
  const total = data?.total || 0;

  return (
    <DefaultLayout>
      <BreadCrumbComponent customNameMap={{ history: "Lịch sử xem" }} />

      <Wrapper>
        {/* Header */}
        <div >
          <Title level={3}>Lịch sử xem</Title>
          {total > 0 && (
            <Button
              danger
              type="text"
              icon={<DeleteOutlined />}
              onClick={confirmDeleteAll}
              loading={deleteAllMutation.isPending}
            >
              Xóa tất cả
            </Button>
          )}
        </div>

        <Spin spinning={isLoading}>
          {histories.length === 0 ? (
            <Empty
              description="Bạn chưa xem luận văn nào"
              style={{ marginTop: 80 }}
            />
          ) : (
            <List
            dataSource={histories}
            itemLayout="horizontal"
            renderItem={(item) => {
                const thesis = item.thesisId;
                if (!thesis) return null;

                return (
                <List.Item className="history-row">
                    <div className="history-left">
                    <img
                        className="thumb"
                        src={`${import.meta.env.VITE_API_URL}${thesis.thumbnail}`}
                        alt={thesis.title}
                    />

                    <div className="content">
                        <h3
                        className="title"
                        onClick={() => navigate(`/thesis/${thesis._id}`)}
                        >
                        {thesis.title}
                        </h3>

                        <div className="meta">
                        {thesis.authorName} • {thesis.year} •{" "}
                        {new Date(item.lastViewedAt).toLocaleDateString()}
                        </div>

                        <p className="abstract">
                        {thesis.tom_tat || thesis.abstract || "Không có tóm tắt"}
                        </p>
                    </div>
                    </div>

                    <div className="actions">
                    <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`/thesis/${thesis._id}`)}
                    />
                    <FavoriteButtonComponent thesisId={thesis._id} />
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => deleteMutation.mutate(item._id)}
                    >
                        Xóa
                    </Button>
                    </div>
                </List.Item>
                );
            }}
            />

          )}

          {total > limit && (
            <div className="pagination">
              <Pagination
                current={page}
                pageSize={limit}
                total={total}
                onChange={(p, s) => {
                  setPage(p);
                  setLimit(s);
                }}
                showSizeChanger
              />
            </div>
          )}
        </Spin>
      </Wrapper>
    </DefaultLayout>
  );
};

export default ViewHistoryPage;
