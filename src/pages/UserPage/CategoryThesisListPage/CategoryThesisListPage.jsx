import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import * as TheSisService from "../../../services/TheSisService";
import * as Messages from "../../../components/Message/Message";
import { useMutation } from "@tanstack/react-query";
import DefaultLayout from "../../../components/DefaultLayout/DefaultLayout";
import CategorySidebarComponent from "../../../components/CategorySidebarComponent/CategorySidebarComponent";
import FavoriteButtonComponent from "../../../components/FavoriteButtonComponent/FavoriteButtonComponent";
import EmptyState from "../../../components/EmptyState/EmptyState";
import { Row, Col, Card, Typography, Button, Space } from "antd";
import {
  DownloadOutlined,
} from "@ant-design/icons";
import { FaFileWord, FaFilePdf, FaEye, FaDownload } from "react-icons/fa";


import {
  Wrapper,
  Thumbnail,
  TitleStyled,
  SpaceWrapper,
  ViewCount,
  DownloadCount,
  FileTypeTag,
} from "./style";

const { Title, Paragraph } = Typography;

const CategoryThesisListPage = () => {
  
  const { id } = useParams();
  const navigate = useNavigate();


  const { data, isLoading } = useQuery({
    queryKey: ["getThesesByCategory", id],
    queryFn: () => TheSisService.getThesesByCategory(id),
  });
  const mutationDownload = useMutation({
    mutationFn: TheSisService.downloadTheSis,
    onSuccess: () => {
      // Handle success case
    },
    onError: () => {
      Messages.error("Không thể tải xuống luận văn");
    },
  });
  const handleDownload = (thesisId) => {
    mutationDownload.mutate(thesisId);
  };

  const theses = data?.data || [];

  if (isLoading) return <p>Đang tải dữ liệu...</p>;
  

  return (
    <DefaultLayout>
      <Wrapper>
        <Title level={2}>Danh mục luận văn</Title>
        <Row gutter={24}>
          {/* Bên trái: Sidebar */}
          <Col xs={24} sm={7} md={6} lg={5}>
            <CategorySidebarComponent />
          </Col>

          {/* Bên phải: Danh sách luận văn */}
          <Col xs={24} sm={17} md={18} lg={19}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              {theses.length === 0 ? (
                <EmptyState />
              ) : (
                theses.map((thesis) => (
                  <Card key={thesis._id}>
                    <Row gutter={16}>
                      <Col xs={24} sm={6} md={4}>
                        <Thumbnail
                          src={`${import.meta.env.VITE_API_URL}${thesis.thumbnail}`}
                          alt="thumbnail"
                        />
                      </Col>
                      <Col xs={24} sm={18} md={20}>
                        <TitleStyled
                          onClick={() => navigate(`/thesis/${thesis._id}`)}
                        >
                          {thesis.title}
                        </TitleStyled>
                        <Paragraph ellipsis={{ rows: 3 }}>{thesis.tom_tat}</Paragraph>

                        <Space size="middle" style={{ marginTop: 8 }}>
                          <ViewCount>
                            <FaEye /> {thesis.views || 0}
                          </ViewCount>
                          <DownloadCount>
                            <FaDownload /> {thesis.downloads || 0}
                          </DownloadCount>
                          <FileTypeTag>
                            {thesis.fileType === "doc" ? <FaFileWord /> : <FaFilePdf />}{" "}
                            {thesis.fileType}
                          </FileTypeTag>
                          <Button
                            type="primary"
                            onClick={() => handleDownload(thesis._id)}
                          >
                            <DownloadOutlined /> Tải xuống
                          </Button>
                          <FavoriteButtonComponent thesisId={thesis._id} />
                        </Space>
                      </Col>
                    </Row>
                  </Card>
                ))
              )}
            </Space>
          </Col>
        </Row>
      </Wrapper>
    </DefaultLayout>
  );
};
export default CategoryThesisListPage;
