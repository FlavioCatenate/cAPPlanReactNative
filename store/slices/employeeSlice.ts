import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import axios from 'axios';
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../../services/employeeService';
import type { RootState } from '../index';

// ─── Interfacce ─────────────────────────────────────────────────────────────

export interface EmployeeSkillRef {
  id: number;
  name: string;
}

export interface EmployeePersonRef {
  id: number;
  name: string;
  surname: string;
}

export interface Employee {
  id: number;
  name: string;
  surname: string;
  emailAddress?: string;
  /** Enum backend — es. "WEB", "MULESOFT", "TIBCO". Adatta ai valori reali. */
  team?: string;
  isLeader?: boolean;
  isTutor?: boolean;
  tutorId?: EmployeePersonRef | null;
  skills?: EmployeeSkillRef[];
  country?: string;
  isActive?: boolean;
  legalEntity?: string;
  wageRate?: number;
  businessUnit?: string;
  startWorkingDate?: string;
  lastSalaryIncreaseDate?: string;
  isFreelancer?: boolean;
}

// ─── Tipi filtro (usati nelle schermate) ────────────────────────────────────

export type EmployeeRoleFilter = 'all' | 'leader' | 'tutor';

// ─── State ──────────────────────────────────────────────────────────────────

interface EmployeeState {
  items: Employee[];
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
  hasBeenFetched: boolean;
}

const initialState: EmployeeState = {
  items: [],
  status: 'idle',
  error: null,
  hasBeenFetched: false,
};

// ─── Thunk ──────────────────────────────────────────────────────────────────

export const fetchEmployees = createAsyncThunk<
  Employee[],
  void,
  { rejectValue: string }
>('employees/fetchAll', async (_, { rejectWithValue }) => {
  try {
    return await getEmployees();
  } catch (err) {
    return rejectWithValue(
      err instanceof Error ? err.message : 'Unknown error'
    );
  }
});

export const createEmployeeThunk = createAsyncThunk<
  Employee,
  Omit<Employee, 'id'>,
  { rejectValue: string }
>('employees/create', async (data, { rejectWithValue }) => {
  try {
    return await createEmployee(data);
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : 'Unknown error');
  }
});

export const updateEmployeeThunk = createAsyncThunk<
  Employee,
  { id: number; data: Partial<Employee> & { id: number } },
  { rejectValue: string }
>('employees/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    return await updateEmployee(id, data);
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.response?.data?.title ||
        err.message;
      return rejectWithValue(String(msg));
    }
    return rejectWithValue(err instanceof Error ? err.message : 'Unknown error');
  }
});

export const deleteEmployeeThunk = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>('employees/delete', async (id, { rejectWithValue }) => {
  try {
    await deleteEmployee(id);
    return id;
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : 'Unknown error');
  }
});

// ─── Slice ──────────────────────────────────────────────────────────────────

const employeeSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.status = 'idle';
        state.items = action.payload;
        state.hasBeenFetched = true;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Unknown error';
      })
      .addCase(createEmployeeThunk.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateEmployeeThunk.fulfilled, (state, action) => {
        const index = state.items.findIndex((e) => e.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(deleteEmployeeThunk.fulfilled, (state, action) => {
        state.items = state.items.filter((e) => e.id !== action.payload);
      });
  },
});

export default employeeSlice.reducer;

// ─── Selectors base ─────────────────────────────────────────────────────────

export const selectEmployees = (state: RootState) => state.employees.items;
export const selectEmployeesStatus = (state: RootState) =>
  state.employees.status;
export const selectEmployeesError = (state: RootState) =>
  state.employees.error;
export const selectEmployeesHasBeenFetched = (state: RootState) =>
  state.employees.hasBeenFetched;

// ─── Selectors derivati ─────────────────────────────────────────────────────

/** Lista team unici, ordinati alfabeticamente, estratti dai dati live */
export const selectUniqueTeams = createSelector(
  [selectEmployees],
  (items): string[] => {
    const teams = items
      .map((e) => e.team)
      .filter((t): t is string => Boolean(t));
    return [...new Set(teams)].sort();
  }
);

export const selectEmployeesFiltered = createSelector(
  [
    selectEmployees,
    (_: RootState, roleFilter: EmployeeRoleFilter) => roleFilter,
    (_: RootState, __: EmployeeRoleFilter, teamFilter: string | null) =>
      teamFilter,
  ],
  (items, roleFilter, teamFilter): Employee[] => {
    return items.filter((e) => {
      const roleMatch =
        roleFilter === 'all' ||
        (roleFilter === 'leader' && e.isLeader) ||
        (roleFilter === 'tutor' && e.isTutor);
      const teamMatch = !teamFilter || e.team === teamFilter;
      return roleMatch && teamMatch;
    });
  }
);