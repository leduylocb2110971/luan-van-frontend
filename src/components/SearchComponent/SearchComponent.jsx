import React, { useEffect, useState } from "react";
import { Form, Select, Button, AutoComplete } from "antd";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { SearchWrapper } from "./style";
import * as SearchService from "../../services/SearchService";

const { Option } = Select;

const SearchComponent = ({ initialKeyword = "", initialYear, initialStatus, onSearch }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [options, setOptions] = useState([]); // gợi ý autocomplete
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    form.setFieldsValue({
      searchTerm: initialKeyword || undefined,
      year: initialYear || undefined,
      status: initialStatus || undefined,
    });
  }, [initialKeyword, initialYear, initialStatus, form]);

  // Gọi API để lấy gợi ý
  const fetchSuggestions = async (value) => {
  if (!value) {
    setOptions([]);
    return;
  }
  try {
    setLoading(true);
    const res = await SearchService.suggestKeywords(value); // res là {titles, keywords, authors, coauthors}

    // Lọc trùng lặp trực tiếp
    const keywords = Array.from(new Set(res.keywords || []));
    const titles = Array.from(new Set(res.titles || []));
    const allAuthors = Array.from(new Set([...(res.authors || []), ...(res.coauthors || [])]));

    const newOptions = [
      { label: "Từ khóa", options: keywords.map(k => ({ value: k, label: k })) },
      { label: "Tiêu đề", options: titles.map(t => ({ value: t, label: t })) },
      { label: "Tác giả", options: allAuthors.map(a => ({ value: a, label: a })) },
    ].filter(group => group.options.length > 0);

    setOptions(newOptions);
  } catch (err) {
    console.error("Error fetching suggestions:", err);
  } finally {
    setLoading(false);
  }
};



  const handleSearch = (values) => {
    const params = new URLSearchParams();

    if (values.searchTerm) params.append("keyword", values.searchTerm.trim());
    else params.append("keyword", "");

    if (values.year) params.append("year", values.year);
    if (values.status) params.append("status", values.status);

    navigate(`/search?${params.toString()}`);

    if (onSearch) onSearch(values);
  };

  return (
    <SearchWrapper>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Form form={form} layout="inline" onFinish={handleSearch}>
          <Form.Item name="searchTerm" >
            <AutoComplete
              placeholder="🔍 Tìm kiếm..."
              allowClear
              options={options}
              // Gọi API gợi ý khi người dùng nhập nhiều hơn 3 ký tự
              onSearch={(value) => {
                if (value.length >= 3) {
                  fetchSuggestions(value);
                } else {
                  setOptions([]);
                }
              }}
              onSelect={(value) => {
                // Gọi luôn handleSearch với dữ liệu chuẩn
                handleSearch({
                  searchTerm: value,                // lấy trực tiếp value vừa chọn
                  year: form.getFieldValue("year"), // chỉ lấy mấy field khác
                  status: form.getFieldValue("status"),
                });
              }}
              style={{ width: 250 }}
              notFoundContent={loading ? "Đang tải..." : null}
            />
          </Form.Item>
          <Form.Item shouldUpdate style={{ marginBottom: 0 }}>
            {() => {
              const hasValue = Object.values(form.getFieldsValue()).some((value) => value);
              return (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button type="primary" htmlType="submit" disabled={!hasValue}>
                    Tìm kiếm
                  </Button>
                </motion.div>
              );
            }}
          </Form.Item>
        </Form>
      </motion.div>
    </SearchWrapper>
  );
};

export default SearchComponent;
