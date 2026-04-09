import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import axios from 'axios';
import {
  getAllocations,
  createAllocation,
  updateAllocation,
  deleteAllocation,
} from '../../services/allocationService';
import { getAllocationStatus, getStatusColor } from '../../utils/allocationColors';
import { selectEmployeeTeamMap } from './employeeTeamSlice';
import {
  selectSelectedEmployees,
  selectSelectedStatuses,
  selectSelectedTeams,
} from './filterSlice';
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
      return rejectWithValue(err instanceof Error ? err.message : 'Unknown error');
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
      return rejectWithValue(err instanceof Error ? err.message : 'Unknown error');
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
      return rejectWithValue(err instanceof Error ? err.message : 'Unknown error');
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
      return rejectWithValue(err instanceof Error ? err.message : 'Unknown error');
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
        state.error = action.payload ?? 'Unknown error';
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

/**
 * Selector composito che applica i filtri (team + status + employee)
 * Filtra selectAllocationsWithUi in base a:
 * - selectedTeams: lista di nomi team selezionati
 * - selectedStatuses: lista di colori stato selezionati
 * - selectedEmployees: lista di employee ID selezionati
 *
 * Logica:
 * 1. Se selectedTeams non è vuoto, include solo allocazioni di employee che appartengono a un team selezionato
 * 2. Se selectedStatuses non è vuoto, include solo allocazioni il cui cardColor è in selectedStatuses
 * 3. Se selectedEmployees non è vuoto, include solo allocazioni degli employee selezionati
 * 4. Se no filtri, include tutte le allocazioni
 */
export const selectAllocationsWithUiAndFilters = createSelector(
  [
    selectAllocationsWithUi,
    selectEmployeeTeamMap,
    selectSelectedTeams,
    selectSelectedStatuses,
    selectSelectedEmployees,
  ],
  (items, employeeTeamMap, selectedTeams, selectedStatuses, selectedEmployees): AllocationListItem[] => {
    // Se no filtri attivi, ritorna tutto
    if (
      selectedTeams.length === 0 &&
      selectedStatuses.length === 0 &&
      selectedEmployees.length === 0
    ) {
      return items;
    }

    return items.filter((item) => {
      // --- TEAM FILTER ---
      if (selectedTeams.length > 0) {
        const employeeTeams = employeeTeamMap.get(item.employee.id) || [];
        const employeeTeamNames = employeeTeams.map((t) => t.name);
        const hasSelectedTeam = employeeTeamNames.some((tn) =>
          selectedTeams.includes(tn)
        );

        if (!hasSelectedTeam) {
          return false; // Employee non è in nessun team selezionato
        }
      }

      // --- STATUS FILTER ---
      if (selectedStatuses.length > 0) {
        const hasSelectedStatus = selectedStatuses.includes(item.cardColor);

        if (!hasSelectedStatus) {
          return false; // Allocation status non è selezionato
        }
      }

      // --- EMPLOYEE FILTER ---
      if (selectedEmployees.length > 0) {
        const employeeId = item.employee?.id;

        if (employeeId == null || !selectedEmployees.includes(employeeId)) {
          return false;
        }
      }

      return true;
    });
  }
);