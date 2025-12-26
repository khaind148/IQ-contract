import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ChatSession, ChatMessage } from '../../types';

interface ChatState {
    sessions: ChatSession[];
    activeChatId: string | null;
    loading: boolean;
}

const initialState: ChatState = {
    sessions: [],
    activeChatId: null,
    loading: false,
};

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        createSession: (state, action: PayloadAction<ChatSession>) => {
            state.sessions.push(action.payload);
            state.activeChatId = action.payload.id;
        },
        setActiveChat: (state, action: PayloadAction<string | null>) => {
            state.activeChatId = action.payload;
        },
        addMessage: (state, action: PayloadAction<{ sessionId: string; message: ChatMessage }>) => {
            const session = state.sessions.find(s => s.id === action.payload.sessionId);
            if (session) {
                session.messages.push(action.payload.message);
                session.updatedAt = new Date().toISOString();
            }
        },
        deleteSession: (state, action: PayloadAction<string>) => {
            state.sessions = state.sessions.filter(s => s.id !== action.payload);
            if (state.activeChatId === action.payload) {
                state.activeChatId = state.sessions[0]?.id || null;
            }
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        loadSessionsFromStorage: (state, action: PayloadAction<ChatSession[]>) => {
            state.sessions = action.payload;
        },
    },
});

export const {
    createSession,
    setActiveChat,
    addMessage,
    deleteSession,
    setLoading,
    loadSessionsFromStorage,
} = chatSlice.actions;

export default chatSlice.reducer;
