import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import {
  getAllEmployeeTeams,
  type EmployeeTeam,
  type Team,
} from '../../services/employeeTeamService';
import type { RootState } from '../index';

interface EmployeeTeamState {
  items: EmployeeTeam[];
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

const initialState: EmployeeTeamState = {
  items: [],
  status: 'idle',
  error: null,
};

/**
 * Fetch all employee-team relationships (lazy)
 * Called only when user opens filter modal
 */
export const fetchEmployeeTeams = createAsyncThunk<
  EmployeeTeam[],
  void,
  { rejectValue: string }
>('employeeTeams/fetchAll', async (_, { rejectWithValue }) => {
  try {
    return await getAllEmployeeTeams();
  } catch (err) {
    return rejectWithValue(
      err instanceof Error ? err.message : 'Errore caricamento team'
    );
  }
});

const employeeTeamSlice = createSlice({
  name: 'employeeTeams',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployeeTeams.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchEmployeeTeams.fulfilled, (state, action) => {
        state.status = 'idle';
        state.items = action.payload;
      })
      .addCase(fetchEmployeeTeams.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Errore sconosciuto';
      });
  },
});

export default employeeTeamSlice.reducer;

// ============= SELECTORS =============

export const selectEmployeeTeamItems = (state: RootState) =>
  state.employeeTeams.items;

export const selectEmployeeTeamStatus = (state: RootState) =>
  state.employeeTeams.status;

export const selectEmployeeTeamError = (state: RootState) =>
  state.employeeTeams.error;

/**
 * Memoized map: employeeId → [Team, Team, ...]
 * Usato per lookup veloce dei team di un employee
 */
export const selectEmployeeTeamMap = createSelector(
  [selectEmployeeTeamItems],
  (items): Map<number, Team[]> => {
    const map = new Map<number, Team[]>();

    items.forEach((et) => {
      const empId = et.employee.id;
      if (!map.has(empId)) {
        map.set(empId, []);
      }
      map.get(empId)!.push(et.team);
    });

    return map;
  }
);

/**
 * Extract unique team names from all employee-team relationships
 * Usato per popolare i checkbox del FilterModal
 */
export const selectAllTeamNames = createSelector(
  [selectEmployeeTeamItems],
  (items): string[] => {
    const teamNames = new Set<string>();
    items.forEach((et) => {
      teamNames.add(et.team.name);
    });
    return Array.from(teamNames).sort();
  }
);