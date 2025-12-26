import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Settings } from '../../types';

const initialState: Settings = {
    apiProvider: 'gemini',
    apiKey: '',
    theme: 'dark',
    language: 'vi',
};

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        setApiProvider: (state, action: PayloadAction<'openai' | 'gemini'>) => {
            state.apiProvider = action.payload;
        },
        setApiKey: (state, action: PayloadAction<string>) => {
            state.apiKey = action.payload;
        },
        setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
            state.theme = action.payload;
        },
        setLanguage: (state, action: PayloadAction<'vi' | 'en'>) => {
            state.language = action.payload;
        },
        loadSettingsFromStorage: (state, action: PayloadAction<Settings>) => {
            return { ...state, ...action.payload };
        },
    },
});

export const {
    setApiProvider,
    setApiKey,
    setTheme,
    setLanguage,
    loadSettingsFromStorage,
} = settingsSlice.actions;

export default settingsSlice.reducer;
