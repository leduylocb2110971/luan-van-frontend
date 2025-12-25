import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { ViewerContainer } from "./style";
import * as ThesisService from "../../services/TheSisService";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

// Giới hạn xem
const PAGE_LIMIT = 7; // xem tối đa 7 trang đầu tiên

const ThesisViewer = ({ fileUrl, thesisId, accessMode }) => {
  const user = useSelector((state) => state.auth.user);
  // Gọi useQuery để kiểm tra mối quan hệ người dùng với luận văn
  const { data: relationData } = useQuery({
    queryKey: ["userThesisRelation", thesisId],
    queryFn: () => ThesisService.checkUserRelatedToThesis(thesisId),
    // Chỉ chạy khi thesisId và userId tồn tại
    enabled: !!thesisId && !!user,

    refetchOnWindowFocus: false,
  });
  // console.log("Dữ liệu quan hệ:", relationData);
  // Kết quả trả về là boolean
  const hasAccess = relationData?.isRelated;
  console.log("có máu mủ ruột rà không:", hasAccess);
  console.log('accessMode:', accessMode);
  let canViewFull = false;
  if (accessMode === "public_full") {
      canViewFull = true;
  }
  if (accessMode === "abstract_only") {
      canViewFull = false;
  }
  if (accessMode === "department_only") {
      if (!user) {
        canViewFull = false;         // chưa đăng nhập → không xem full
    } else {
        canViewFull = hasAccess;     // liên quan → full, không liên quan → bị giới hạn
    }
  }
  if (hasAccess === true) {
      canViewFull = true;            // có máu mủ ruột rà → full
  }
  // Plugin mặc định
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  // Plugin tùy chỉnh thanh công cụ để ẩn nút Download và Print
  const secureLayoutPluginInstance = defaultLayoutPlugin({
    renderToolbar: (Toolbar) => (
      <Toolbar>
        {(slots) => {
          const {            
            // các nút khác bạn muốn giữ
            GoToFirstPage,
            GoToLastPage,
            GoToNextPage,
            CurrentPageLabel,
            NumberOfPages,
            ZoomIn,
            ZoomOut,
          } = slots;
          return (
            <>
              <div
                style={{
                  alignItems: "center",
                  display: "flex",
                }}
              >
                <GoToFirstPage />
                <GoToNextPage />
                <GoToLastPage />
                <ZoomOut />
                <ZoomIn />
                <CurrentPageLabel /> / <NumberOfPages />
              </div>
            </>
          );
        }}
      </Toolbar>
    ),
  });
  const [tempPdfUrl, setTempPdfUrl] = useState(null);
  const [loadingTempPdf, setLoadingTempPdf] = useState(false);

  const isPdf = fileUrl.toLowerCase().endsWith(".pdf");
  const isDocx = fileUrl.toLowerCase().endsWith(".docx");

  const fullFileUrl = fileUrl.startsWith("http")
    ? fileUrl
    : `${import.meta.env.VITE_API_URL}${fileUrl}`;

  useEffect(() => {
    const fetchTempPdf = async () => {
      if (isDocx && thesisId) {
        setLoadingTempPdf(true);
        try {
          const res = await ThesisService.createTempPdf(thesisId);
          if (res?.status === "success") {
            const pdfUrl = res.data.startsWith("http")
              ? res.data
              : `${import.meta.env.VITE_API_URL}${res.data}`;
            setTempPdfUrl(pdfUrl);
          }
        } catch (error) {
          console.error("Lỗi tạo PDF tạm:", error);
        } finally {
          setLoadingTempPdf(false);
        }
      }
    };
    fetchTempPdf();
  }, [fileUrl, thesisId, isDocx]);

  // === Plugin giới hạn trang ===
  const usePageLimitPlugin = (limit) => {
    return {
      renderPageLayer: (props) => {
        const { pageIndex } = props;
        // Hiển thị overlay khi vượt quá limit
        if (pageIndex >= limit) {
          return (
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: "rgba(255,255,255,0.95)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                color: "#666",
                fontWeight: 500,
              }}
            >
              <div style={{ textAlign: "center", padding: "20px", maxWidth: "420px" }}>
                
                {/* Tiêu đề */}
                <p
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#333",
                    marginBottom: "10px",
                  }}
                >
                  Nội dung còn lại đã bị khóa 🔒
                </p>

                {/* Mô tả theo đúng ngữ cảnh */}
                <p style={{ fontSize: "16px", color: "#666", marginBottom: "20px" }}>
                  Để xem tiếp từ trang thứ {limit + 1} trở đi, bạn cần có quyền truy cập
                  theo thiết lập của tác giả hoặc khoa quản lý.
                </p>

                {/* CTA gửi yêu cầu chia sẻ */}
                
              </div>
            </div>
          );
        }
        return null; // không overlay cho trang hợp lệ
      },
    };
  };

  const pageLimitPlugin = usePageLimitPlugin(PAGE_LIMIT);
  // Plugin sẽ sử dụng
  const pluginsToUse = canViewFull
    ? [defaultLayoutPluginInstance] // Nếu được xem full, dùng plugin mặc định
    : [secureLayoutPluginInstance, pageLimitPlugin]; // Nếu không, dùng plugin bị ẩn nút và giới hạn trang

  return (
    <ViewerContainer>
      {/* --- PDF --- */}
      {isPdf && (
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <Viewer
            fileUrl={fullFileUrl}
            plugins={pluginsToUse}
          />
        </Worker>
      )}

      {/* --- DOCX (convert tạm) --- */}
      {isDocx &&
        (loadingTempPdf ? (
          <div>Đang tạo PDF tạm...</div>
        ) : (
          tempPdfUrl && (
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
              <Viewer
                fileUrl={tempPdfUrl}
                plugins={pluginsToUse}
              />
            </Worker>
          )
        ))}
    </ViewerContainer>
  );
};

export default ThesisViewer;
