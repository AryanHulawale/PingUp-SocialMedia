import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import api from "../../api/axios"
import {toast} from "react-hot-toast"

const initialState = {
    connections: [],
    pendingConnections: [],
    followers: [],
    following: [],
}

export const fetchConnections = createAsyncThunk("connections/fetchConnections", async (token) => {
    const { data } = await api.get("/api/user/connections", {
        headers: { Authorization: `Bearer ${token}` }
    })

    if (!data.success) {
        return rejectWithValue(data.message); // ❌ will go into .rejected
    }

    return data;
})

const connectionSlice = createSlice({
    name: "connections",
    initialState,
    reducers: {

    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchConnections.fulfilled, (state, action) => {
                state.connections = action.payload.connections;
                state.pendingConnections = action.payload.pendingConnections;
                state.followers = action.payload.followers;
                state.following = action.payload.following;
                // toast.success("Connections updated ✅");
            })
            .addCase(fetchConnections.rejected, (state, action) => {
                toast.error(action.payload || "Failed to fetch connections ❌");
            });
    }
})

export default connectionSlice.reducer