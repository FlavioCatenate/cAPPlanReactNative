import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import axios from 'axios';
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
  name?: string;
  surname?: string;
  emailAddress?: string;
}

export interface Project {
  id: number;
  name?: string;
  type?: string;
  fromDate?: string;
  toDate?: string;
  isActive?: boolean;
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
  projectName: string;
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

function hasHydratedRelations(allocation: Allocation) {
  return Boolean(allocation.employee && allocation.project);
}

export const fetchAllocations = createAsyncThunk<Allocation[], void, { rejectValue: string }>(
  'allocations/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await getAllocations();
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Errore sconosciuto');
    }
  }
);

export const createAllocationThunk = createAsyncThunk<
  Allocation,
  Omit<Allocation, 'id'>,
  { rejectValue: string }
>(
  'allocations/create',
  async (data, { rejectWithValue }) => {
    try {
      return await createAllocation(data);
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Errore');
    }
  }
);

export const updateAllocationThunk = createAsyncThunk<
  Allocation,
  { id: number; data: Partial<Allocation> & { id?: number } },
  { rejectValue: string }
>(
  'allocations/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await updateAllocation(id, data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const backendMessage =
          err.response?.data?.detail ||
          err.response?.data?.message ||
          err.response?.data?.title ||
          err.message;

        console.error('Error updating allocation:', backendMessage);
        return rejectWithValue(String(backendMessage));
      }

      console.error('Error updating allocation:', err instanceof Error ? err.message : err);
      return rejectWithValue(err instanceof Error ? err.message : 'Errore');
    }
  }
);

export const deleteAllocationThunk = createAsyncThunk<number, number, { rejectValue: string }>(
  'allocations/delete',
  async (id, { rejectWithValue }) => {
    try {
      await deleteAllocation(id);
      return id;
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Errore');
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
        state.error = action.payload ?? 'Errore sconosciuto';
      })
      .addCase(createAllocationThunk.fulfilled, (state, action) => {
        if (hasHydratedRelations(action.payload)) {
          state.items.push(action.payload);
        }
      })
      .addCase(updateAllocationThunk.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);

        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteAllocationThunk.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export default allocationSlice.reducer;

export const selectAllocations = (state: RootState) => state.allocations.items;
export const selectAllocationsStatus = (state: RootState) => state.allocations.status;
export const selectAllocationsError = (state: RootState) => state.allocations.error;

export const selectAllocationsWithUi = createSelector(
  [selectAllocations],
  (items): AllocationListItem[] => {
    return items.map((item) => {
      const status = getAllocationStatus(item);
      const employeeFullName = [item.employee?.name, item.employee?.surname]
        .filter(Boolean)
        .join(' ')
        .trim();

      return {
        ...item,
        employeeFullName: employeeFullName || `Employee #${item.employee?.id ?? item.id}`,
        cardColor: getStatusColor(status),
        projectName: item.project?.name || `Project #${item.project?.id ?? item.id}`,
      };
    });
  }
);