import axiosClient from "../apis/axiosClient";

// Toggle favorite
export const toggleFavorite = async (thesisId) => {
    try {
        const response = await axiosClient.post("/favorite/toggle", { thesisId });
        return response.data;
    } catch (error) {
        console.error('Error toggling favorite:', error);
        throw error;
    }
};
// Get user's favorite theses
export const getUserFavorites = async (userId, queryParams) => {
    try {
        const { page, limit } = queryParams;
        const url = `/favorite/${userId}?page=${page}&limit=${limit}`;
        const response = await axiosClient.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching user favorites:', error);
        throw error;
    }
};
