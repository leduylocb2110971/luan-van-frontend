import React, { useState, useRef } from "react";
import { AvatarWrapper, AvatarImage, Button, ButtonGroup } from "./style";

const AvatarUpload = ({ avatarUrl, onUpdateAvatar }) => {
  const [previewAvatar, setPreviewAvatar] = useState(null); // Lưu ảnh đại diện xem trước
  const [selectedAvatar, setSelectedAvatar] = useState(null); // Lưu ảnh đại diện đã chọn
  const fileInputRef = useRef();

  // Khi người dùng chọn ảnh thì lưu ảnh đã chọn và tạo ảnh xem trước
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedAvatar(file); // Lưu ảnh đại diện đã chọn
      const reader = new FileReader();
      reader.onloadend = () => setPreviewAvatar(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Xác nhận thay đổi ảnh đại diện
  const confirmAvatarChange = () => {
    if (selectedAvatar && onUpdateAvatar) {
      onUpdateAvatar(selectedAvatar); // Gọi api ở page
      setPreviewAvatar(null);
      setSelectedAvatar(null);
    }
  };

  // Hủy bỏ thay đổi ảnh đại diện
  const cancelAvatarChange = () => {
    setPreviewAvatar(null);
    setSelectedAvatar(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  return (
    <AvatarWrapper>
      {/* Nếu có chọn ảnh mới thì hiển thị ảnh xem trước, chưa có thì hiển thị ảnh cũ */}
      {previewAvatar ? (
        <AvatarImage src={previewAvatar} alt="avatar preview" />
      ) : (
        <AvatarImage src={avatarUrl} alt="avatar" />
      )}

      <input
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        ref={fileInputRef}
        onChange={handleAvatarChange}
      />
      {/* Tạo nút thay đổi ảnh đẹp hơn thay vì nút input */}
      {!previewAvatar && (
        <Button onClick={() => fileInputRef.current.click()}>Thay đổi</Button>
      )}

      {/* Hiển thị nút xác nhận và hủy bỏ khi có ảnh xem trước */}
      {previewAvatar && (
        <ButtonGroup>
          <Button primary onClick={confirmAvatarChange}>
            Xác nhận
          </Button>
          <Button danger onClick={cancelAvatarChange}>
            Hủy
          </Button>
        </ButtonGroup>
      )}
    </AvatarWrapper>
  );
};

export default AvatarUpload;
