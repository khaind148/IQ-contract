import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Contract, ContractAnalysis, ContractCategory, ContractStatus } from '../../types';

interface ContractState {
    contracts: Contract[];
    selectedContractId: string | null;
    loading: boolean;
    error: string | null;
    filters: {
        category: ContractCategory | 'all';
        status: ContractStatus | 'all';
        search: string;
    };
}

const initialState: ContractState = {
    contracts: [],
    selectedContractId: null,
    loading: false,
    error: null,
    filters: {
        category: 'all',
        status: 'all',
        search: '',
    },
};

const contractSlice = createSlice({
    name: 'contracts',
    initialState,
    reducers: {
        addContract: (state, action: PayloadAction<Contract>) => {
            state.contracts.push(action.payload);
        },
        updateContract: (state, action: PayloadAction<{ id: string; updates: Partial<Contract> }>) => {
            const index = state.contracts.findIndex(c => c.id === action.payload.id);
            if (index !== -1) {
                state.contracts[index] = { ...state.contracts[index], ...action.payload.updates };
            }
        },
        deleteContract: (state, action: PayloadAction<string>) => {
            state.contracts = state.contracts.filter(c => c.id !== action.payload);
            if (state.selectedContractId === action.payload) {
                state.selectedContractId = null;
            }
        },
        selectContract: (state, action: PayloadAction<string | null>) => {
            state.selectedContractId = action.payload;
        },
        setContractAnalysis: (state, action: PayloadAction<{ id: string; analysis: ContractAnalysis }>) => {
            const contract = state.contracts.find(c => c.id === action.payload.id);
            if (contract) {
                contract.analysis = action.payload.analysis;
            }
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        setFilters: (state, action: PayloadAction<Partial<ContractState['filters']>>) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        loadContractsFromStorage: (state, action: PayloadAction<Contract[]>) => {
            state.contracts = action.payload;
        },
    },
});

export const {
    addContract,
    updateContract,
    deleteContract,
    selectContract,
    setContractAnalysis,
    setLoading,
    setError,
    setFilters,
    loadContractsFromStorage,
} = contractSlice.actions;

export default contractSlice.reducer;
