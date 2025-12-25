import { createSlice } from "@reduxjs/toolkit";
const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
    },
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
        },
        updateUser: (state, action) => {
            const updatedUser = action.payload;
            state.user = { ...state.user, ...updatedUser };
        },
        logout: (state) => {
            state.user = null;
        },
    },
});

export const { setUser, logout,updateUser } = authSlice.actions;
export default authSlice.reducer;