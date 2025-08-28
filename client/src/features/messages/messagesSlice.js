import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import api from "../../api/axios"

const initialState = {
    messages: [],
    loading: false,
    error: null
}

// Async thunk to fetch messages
export const fetchMessages = createAsyncThunk(
    "messages/fetchMessages",
    async ({ token, userId }, { rejectWithValue }) => {
        try {
            const { data } = await api.post("/api/message/get",{ to_user_id: userId }, {
            
                headers: { Authorization: `Bearer ${token}` }
            });

            return data.success ? data : rejectWithValue(data.message);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);



const messagesSlice = createSlice({
    name: "messages",
    initialState,
    reducers: {
        setMessages: (state, action) => {
            state.messages = action.payload
        },
        addMessages: (state, action) => {
            state.messages = [...state.messages, action.payload]
        },
        resetMessages: (state) => {
            state.messages = []
            state.error = null
            state.loading = false
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMessages.fulfilled, (state, action) => {
                if (action.payload) {
                    state.messages = action.payload.messages
                }
            })
    }
})

export const { setMessages, addMessages, resetMessages } = messagesSlice.actions

export default messagesSlice.reducer
