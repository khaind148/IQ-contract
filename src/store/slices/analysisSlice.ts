import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ContractComparison, RealityAnalysis, RealitySituation } from '../../types';

interface AnalysisState {
    comparisons: ContractComparison[];
    realitySituations: RealitySituation[];
    realityAnalyses: RealityAnalysis[];
    loading: boolean;
    error: string | null;
}

const initialState: AnalysisState = {
    comparisons: [],
    realitySituations: [],
    realityAnalyses: [],
    loading: false,
    error: null,
};

const analysisSlice = createSlice({
    name: 'analysis',
    initialState,
    reducers: {
        addComparison: (state, action: PayloadAction<ContractComparison>) => {
            state.comparisons.push(action.payload);
        },
        deleteComparison: (state, action: PayloadAction<string>) => {
            state.comparisons = state.comparisons.filter(c => c.id !== action.payload);
        },
        addRealitySituation: (state, action: PayloadAction<RealitySituation>) => {
            state.realitySituations.push(action.payload);
        },
        addRealityAnalysis: (state, action: PayloadAction<RealityAnalysis>) => {
            state.realityAnalyses.push(action.payload);
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        loadAnalysisFromStorage: (state, action: PayloadAction<Partial<AnalysisState>>) => {
            if (action.payload.comparisons) state.comparisons = action.payload.comparisons;
            if (action.payload.realitySituations) state.realitySituations = action.payload.realitySituations;
            if (action.payload.realityAnalyses) state.realityAnalyses = action.payload.realityAnalyses;
        },
    },
});

export const {
    addComparison,
    deleteComparison,
    addRealitySituation,
    addRealityAnalysis,
    setLoading,
    setError,
    loadAnalysisFromStorage,
} = analysisSlice.actions;

export default analysisSlice.reducer;
