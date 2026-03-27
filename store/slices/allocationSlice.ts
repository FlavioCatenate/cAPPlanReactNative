import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import {
  getAllocations,
  createAllocation,
  updateAllocation,
  deleteAllocation,
} from '../../services/allocationService';
import { getAllocationStatus, getStatusColor } from '../../utils/allocationColors';
import type { RootState } from '../index';

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
  salesRate?: number;
  isFixedPrice?: boolean;
}

export interface AllocationListItem extends Allocation {
  employeeFullName: string;
  cardColor: string;
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

// --- Thunks ---

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

export const createAllocationThunk = createAsyncThunk(
  'allocations/create',
  async (data: Omit<Allocation, 'id'>, { rejectWithValue }) => {
    try {
      return await createAllocation(data);
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Errore');
    }
  }
);

export const updateAllocationThunk = createAsyncThunk(
  'allocations/update',
  async ({ id, data }: { id: number; data: Partial<Allocation> }, { rejectWithValue }) => {
    try {
      return await updateAllocation(id, data);
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Errore');
    }
  }
);

export const deleteAllocationThunk = createAsyncThunk(
  'allocations/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await deleteAllocation(id);
      return id;
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Errore');
    }
  }
);

// --- Slice ---

const allocationSlice = createSlice({
  name: 'allocations',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetch
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
      })
      // create
      .addCase(createAllocationThunk.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      // update
      .addCase(updateAllocationThunk.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      })
      // delete
      .addCase(deleteAllocationThunk.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      });
  },
});

export default allocationSlice.reducer;

// --- Selectors ---
export const selectAllocations = (state: RootState) => state.allocations.items;
export const selectAllocationsStatus = (state: RootState) => state.allocations.status;
export const selectAllocationsError = (state: RootState) => state.allocations.error;

export const selectAllocationsWithUi = createSelector(
  [selectAllocations],
  (items): AllocationListItem[] => {
    return items.map((item) => {
      const status = getAllocationStatus(item);

      return {
        ...item,
        employeeFullName: `${item.employee.name} ${item.employee.surname}`,
        cardColor: getStatusColor(status),
      };
    });
  }
);