import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import styled, { keyframes } from "styled-components";
import { FaUser, FaChalkboardTeacher, FaCalendarAlt, FaEye, FaDownload } from "react-icons/fa";
import { Tag, Skeleton, Empty, Button, Tooltip } from "antd"; // Sử dụng AntD components cho đẹp

import * as SearchService from "../../../services/SearchService";
import DefaultLayout from "../../../components/DefaultLayout/DefaultLayout";
import SearchComponent from "../../../components/SearchComponent/SearchComponent";
import BreadCrumbComponent from "../../../components/BreadcrumbComponent/BreadcrumbComponent";
import PaginationComponent from "../../../components/PaginationComponent/PaginationComponent";
import FiltersSidebar from "../../../components/FiltersSidebar/FiltersSidebar";

// --- STYLED COMPONENTS ---

const PageWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px 40px;
`;

const PageLayout = styled.div`
  display: grid;
  grid-template-columns: 260px 1fr; /* Sidebar rộng hơn chút */
  gap: 32px;
  margin-top: 24px;

  @media (max-width: 992px) {
    grid-template-columns: 1fr; /* Mobile: Sidebar ẩn hoặc đẩy lên trên */
  }
`;

const Sidebar = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #f0f0f0;
  height: fit-content;
  position: sticky;
  top: 20px; /* Sticky sidebar */
`;

const Content = styled.div`
  min-height: 500px;
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
  }

  span.count {
    color: #6b7280;
    font-weight: 400;
    font-size: 1rem;
    margin-left: 8px;
  }
`;

const CardGrid = styled.div`
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
`;

const ThesisCard = styled.div`
  background: #fff;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0,0,0,0.08);
    border-color: #d9d9d9;
  }
`;

const ThumbnailWrapper = styled.div`
  height: 180px;
  width: 100%;
  background: #f9fafb;
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid #f0f0f0;
`;

const Thumbnail = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover; /* Cover để đẹp, dùng contain nếu muốn xem full */
  transition: transform 0.5s ease;

  ${ThesisCard}:hover & {
    transform: scale(1.05);
  }
`;

const CardBody = styled.div`
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const ThesisTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 12px;
  line-height: 1.5;
  
  /* Cắt dòng 2 dòng */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  cursor: pointer;

  &:hover {
    color: #1890ff;
  }
`;

const MetaRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 0.9rem;
  color: #4b5563;
  margin-bottom: 8px;
  
  svg {
    margin-top: 3px;
    color: #9ca3af;
    flex-shrink: 0;
  }
  
  strong {
    font-weight: 500;
    color: #374151;
  }
`;

const CardFooter = styled.div`
  padding: 12px 16px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fafafa;
  font-size: 0.85rem;
  color: #6b7280;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

// Helper Highlight
const HighlightedText = styled.span`
  background-color: #fff700;
  padding: 0 2px;
  border-radius: 2px;
`;

function highlightText(text = "", keyword = "") {
  if (!text) return "";
  if (!keyword) return text;
  const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, "gi");
  return text.split(regex).map((part, i) => 
    regex.test(part) ? <HighlightedText key={i}>{part}</HighlightedText> : part
  );
}

// Constants
const ARRAY_SEPARATOR = ",";
const initialFilterState = {
    years: [],
    status: ['approved_public'],
    categories: [],
    majors: [],
    fields: [],
};

const SearchResultPage = () => {
  const navigate = useNavigate();
  const { search, pathname } = useLocation();
  const query = new URLSearchParams(search);

  // --- STATE ---
  const searchTerm = query.get("keyword") || "";
  const urlPage = parseInt(query.get("page")) || 1;
  const urlLimit = parseInt(query.get("limit")) || 6;

  const [filterValues, setFilterValues] = useState(() => ({
      years: query.get("years")?.split(ARRAY_SEPARATOR).filter(Boolean) || [],
      status: query.get("status")?.split(ARRAY_SEPARATOR).filter(Boolean) || ['approved_public'],
      categories: query.get("categories")?.split(ARRAY_SEPARATOR).filter(Boolean) || [],
      majors: query.get("majors")?.split(ARRAY_SEPARATOR).filter(Boolean) || [],
      fields: query.get("fields")?.split(ARRAY_SEPARATOR).filter(Boolean) || [],
  }));

  // --- HANDLERS ---
  const updateUrlParams = useCallback((newFilters, newKeyword, newPage, newLimit) => {
    const newQuery = new URLSearchParams();
    
    if (newKeyword) newQuery.set('keyword', newKeyword);
    newQuery.set('page', String(newPage));
    newQuery.set('limit', String(newLimit));

    Object.entries(newFilters).forEach(([key, val]) => {
      if (Array.isArray(val) && val.length > 0) {
        newQuery.set(key, val.join(ARRAY_SEPARATOR));
      }
    });

    navigate({ pathname, search: newQuery.toString() }, { replace: true });
  }, [navigate, pathname]);

  // Sync URL to State (Back/Forward browser)
  useEffect(() => {
    setFilterValues({
        years: query.get("years")?.split(ARRAY_SEPARATOR).filter(Boolean) || [],
        status: query.get("status")?.split(ARRAY_SEPARATOR).filter(Boolean) || ['approved_public'],
        categories: query.get("categories")?.split(ARRAY_SEPARATOR).filter(Boolean) || [],
        majors: query.get("majors")?.split(ARRAY_SEPARATOR).filter(Boolean) || [],
        fields: query.get("fields")?.split(ARRAY_SEPARATOR).filter(Boolean) || [],
    });
  }, [search]);

  // Filter Change
  const handleFilterChange = useCallback((nameOrObj, value) => {
    setFilterValues(prev => {
      let nextFilters;
      if (typeof nameOrObj === 'object') {
        nextFilters = nameOrObj; // Replace all (e.g. from Sidebar reset)
      } else {
        const current = prev[nameOrObj] || [];
        const nextArray = current.includes(value) 
          ? current.filter(v => v !== value) 
          : [...current, value];
        nextFilters = { ...prev, [nameOrObj]: nextArray };
      }
      updateUrlParams(nextFilters, searchTerm, 1, urlLimit);
      return nextFilters;
    });
  }, [searchTerm, urlLimit, updateUrlParams]);

  // Search Submit
  const handleSearchSubmit = useCallback((val) => {
    updateUrlParams(filterValues, val, 1, urlLimit);
  }, [filterValues, urlLimit, updateUrlParams]);

  // Reset
  const handleResetFilter = useCallback(() => {
    setFilterValues(initialFilterState);
    updateUrlParams(initialFilterState, searchTerm, 1, urlLimit);
  }, [searchTerm, urlLimit, updateUrlParams]);

  // --- QUERY ---
  const { data: response, isLoading, isError } = useQuery({
    queryKey: ['elasticSearchResults', searchTerm, urlPage, urlLimit, filterValues],
    queryFn: () => SearchService.elasticSearch({
      search: searchTerm,
      page: urlPage,
      limit: urlLimit,
      years: filterValues.years.join(ARRAY_SEPARATOR),
      status: filterValues.status.join(ARRAY_SEPARATOR),
      categories: filterValues.categories.join(ARRAY_SEPARATOR),
      majors: filterValues.majors.join(ARRAY_SEPARATOR),
      fields: filterValues.fields.join(ARRAY_SEPARATOR),
    }),
    keepPreviousData: true,
  });

  const list = response?.data?.theses || [];
  const totalResults = response?.data?.total || 0;

  return (
    <DefaultLayout>
      <BreadCrumbComponent customNameMap={{ search: "Tìm kiếm" }} />
      
      <PageWrapper>
        {/* Search Bar Area */}
        <div style={{ maxWidth: 800, margin: '20px auto 40px' }}>
          <SearchComponent initialKeyword={searchTerm} onSearch={handleSearchSubmit} />
        </div>

        <PageLayout>
          {/* Sidebar */}
          <Sidebar>
            <FiltersSidebar
              filterValues={filterValues}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilter}
            />
          </Sidebar>

          {/* Content */}
          <Content>
            <ResultsHeader>
              <h2>
                {searchTerm ? (
                  <>Kết quả cho: <span style={{ color: '#1890ff' }}>"{searchTerm}"</span></>
                ) : "Tất cả tài liệu"}
                <span className="count">({totalResults} kết quả)</span>
              </h2>
            </ResultsHeader>

            {isLoading ? (
              <CardGrid>
                {[...Array(6)].map((_, i) => (
                  <div key={i} style={{ background: '#fff', borderRadius: 12, padding: 16, border: '1px solid #eee' }}>
                    <Skeleton.Image active style={{ width: '100%', height: 180, marginBottom: 16 }} />
                    <Skeleton active paragraph={{ rows: 3 }} />
                  </div>
                ))}
              </CardGrid>
            ) : isError ? (
                <Empty description="Đã có lỗi xảy ra, vui lòng thử lại sau." />
            ) : list.length === 0 ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không tìm thấy kết quả nào phù hợp." />
            ) : (
              <>
                <CardGrid>
                  {list.map((item) => (
                    <ThesisCard key={item._id} onClick={() => navigate(`/thesis/${item._id}`)}>
                      <ThumbnailWrapper>
                        <Thumbnail
                          src={`${import.meta.env.VITE_API_URL}${item.thumbnail}`}
                          onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/300x200?text=No+Image"; }}
                          alt={item.title}
                        />
                        {/* Overlay Tag năm ở góc ảnh */}
                        {item.year && (
                            <Tag color="blue" style={{ position: 'absolute', top: 10, right: 10, margin: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                {item.year}
                            </Tag>
                        )}
                      </ThumbnailWrapper>

                      <CardBody>
                        <Tooltip title={item.title}>
                            <ThesisTitle>{highlightText(item.title, searchTerm)}</ThesisTitle>
                        </Tooltip>
                        
                        <MetaRow>
                          <FaUser />
                          <span>
                            {item.authorName ? highlightText(item.authorName, searchTerm) : "Tác giả ẩn danh"}
                          </span>
                        </MetaRow>
                        
                        <MetaRow>
                          <FaChalkboardTeacher />
                          <span>GVHD: <strong>{item.supervisorName || "N/A"}</strong></span>
                        </MetaRow>

                        <div style={{ marginTop: 'auto', paddingTop: 12 }}>
                            {item.status === 'approved_public' 
                                ? <Tag color="success">Công khai</Tag> 
                                : <Tag color="warning">Nội bộ</Tag>
                            }
                        </div>
                      </CardBody>

                      <CardFooter>
                        <StatItem><FaEye /> {item.views || 0}</StatItem>
                        <StatItem><FaDownload /> {item.downloads || 0}</StatItem>
                        <StatItem><FaCalendarAlt /> {new Date(item.createdAt).toLocaleDateString('vi-VN')}</StatItem>
                      </CardFooter>
                    </ThesisCard>
                  ))}
                </CardGrid>

                {/* Pagination */}
                {totalResults > urlLimit && (
                  <div style={{ marginTop: 40, display: 'flex', justifyContent: 'center' }}>
                    <PaginationComponent
                      current={urlPage}
                      pageSize={urlLimit}
                      total={totalResults}
                      onChange={(page, pageSize) => updateUrlParams(filterValues, searchTerm, page, pageSize)}
                    />
                  </div>
                )}
              </>
            )}
          </Content>
        </PageLayout>
      </PageWrapper>
    </DefaultLayout>
  );
};

export default SearchResultPage;