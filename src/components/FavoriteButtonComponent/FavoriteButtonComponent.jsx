import React, { useState, useEffect } from "react";
import { StarOutlined, StarFilled } from "@ant-design/icons";
import { useSelector } from "react-redux";
import {Button} from "antd"
import * as FavoriteService from "../../services/FavoriteService";

const FavoriteButtonComponent = ({ thesisId }) => {
    const [isFavorite, setIsFavorite] = useState(false);
    const user = useSelector((state) => state.auth.user);
    const userId = user?.id;

    // Kiểm tra luận văn này có trong danh sách favorites không
    useEffect(() => {
        const fetchFavorites = async () => {
        if (!userId || !thesisId) return;
        try {
            const res = await FavoriteService.getUserFavorites(userId, { page: 1, limit: 1000 });
            const ids = res?.data?.favorites?.map((fav) => fav?.thesis?._id);
            setIsFavorite(ids.includes(thesisId));
        } catch (err) {
            console.error(err);
        }
        };
        fetchFavorites();
    }, [userId, thesisId]);

    const handleToggle = async () => {
        try {
            const res = await FavoriteService.toggleFavorite(thesisId)
            setIsFavorite(res.action === "added");
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Button onClick={handleToggle}>
            {isFavorite ? <StarFilled style={{ color: "#fadb14" }} /> : <StarOutlined />}
            {isFavorite ? " Đã lưu" : " Lưu"}
        </Button>
    );
};
export default FavoriteButtonComponent;