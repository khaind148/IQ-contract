import type { Middleware } from '@reduxjs/toolkit';
import type { RootState } from '../rootReducer';

const STORAGE_KEY = 'contractiq_state';

export const localStorageMiddleware: Middleware = (store) => (next) => (action) => {
    const result = next(action);

    // Save state to localStorage after each action
    const state = store.getState() as RootState;
    const stateToSave = {
        contracts: state.contracts,
        chat: state.chat,
        settings: state.settings,
        analysis: state.analysis,
    };

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
        console.error('Failed to save state to localStorage:', error);
    }

    return result;
};

export const loadStateFromStorage = (): Partial<RootState> | undefined => {
    try {
        const serializedState = localStorage.getItem(STORAGE_KEY);
        if (serializedState === null) {
            return undefined;
        }
        return JSON.parse(serializedState);
    } catch (error) {
        console.error('Failed to load state from localStorage:', error);
        return undefined;
    }
};
