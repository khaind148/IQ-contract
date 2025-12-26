import { combineReducers } from '@reduxjs/toolkit';
import contractReducer from './slices/contractSlice';
import chatReducer from './slices/chatSlice';
import settingsReducer from './slices/settingsSlice';
import analysisReducer from './slices/analysisSlice';

export const rootReducer = combineReducers({
    contracts: contractReducer,
    chat: chatReducer,
    settings: settingsReducer,
    analysis: analysisReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
