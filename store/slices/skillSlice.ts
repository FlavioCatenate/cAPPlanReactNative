import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAllocations } from '../../services/allocationService';
import type { RootState } from '..';

export interface Employee {
  id: number;
  name: string;
  surname: string;
  emailAddress: string;
}

export interface Project {
  id: number;
  name: string;
  type: string;
  fromDate: string;
  toDate: string;
  isActive: boolean;
  fixedPrice?: any;
  projectIdKpi?: any;
}

export interface Allocation {
  id: number;
  fromDate: string;
  toDate: string;
  percentage: number;
  employee: Employee;
  project: Project;
}

interface AllocationState {
  items: Allocation[];
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

const initialState: AllocationState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchAllocations = createAsyncThunk(
  'allocations/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await getAllocations();
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Errore sconosciuto');
    }
  }
);

const allocationSlice = createSlice({
  name: 'allocations',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllocations.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAllocations.fulfilled, (state, action) => {
        state.status = 'idle';
        state.items = action.payload;
      })
      .addCase(fetchAllocations.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export default allocationSlice.reducer;

// Selectors
export const selectAllocations = (state: RootState) => state.allocations.items;
export const selectAllocationsStatus = (state: RootState) => state.allocations.status;
export const selectAllocationsError = (state: RootState) => state.allocations.error;