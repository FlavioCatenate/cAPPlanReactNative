import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import {
  getAllEmployeeTeams,
  getAllTeams,
  type EmployeeTeam,
  type Team,
} from '../../services/employeeTeamService';
import type { RootState } from '../index';

interface EmployeeTeamState {
  items: EmployeeTeam[];
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
  hasBeenFetched: boolean;
  teams: Team[];
  teamsHasBeenFetched: boolean;
}

const initialState: EmployeeTeamState = {
  items: [],
  status: 'idle',
  error: null,
  hasBeenFetched: false,
  teams: [],
  teamsHasBeenFetched: false,
};

export const fetchTeams = createAsyncThunk<
  Team[],
  void,
  { rejectValue: string }
>('employeeTeams/fetchTeams', async (_, { rejectWithValue }) => {
  try {
    return await getAllTeams();
  } catch (err) {
    return rejectWithValue(
      err instanceof Error ? err.message : 'Error loading teams'
    );
  }
});

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
      err instanceof Error ? err.message : 'Error loading employee-team relationships'
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
        state.hasBeenFetched = true;
      })
      .addCase(fetchEmployeeTeams.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Unknown error';
      })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.teams = action.payload;
        state.teamsHasBeenFetched = true;
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

export const selectEmployeeTeamHasBeenFetched = (state: RootState) =>
  state.employeeTeams.hasBeenFetched;

export const selectTeams = (state: RootState) =>
  state.employeeTeams.teams;

export const selectTeamsHasBeenFetched = (state: RootState) =>
  state.employeeTeams.teamsHasBeenFetched;

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
 * Memoized map: employeeId → { isLeader, isTutor }
 * Aggrega i flag di ruolo da tutte le relazioni employee-team
 * (un employee può essere leader in un team e tutor in un altro)
 */
export const selectEmployeeRoleMap = createSelector(
  [selectEmployeeTeamItems],
  (items): Map<number, { isLeader: boolean; isTutor: boolean }> => {
    const map = new Map<number, { isLeader: boolean; isTutor: boolean }>();
    items.forEach((et) => {
      const empId = et.employee.id;
      const existing = map.get(empId);
      map.set(empId, {
        isLeader: (existing?.isLeader ?? false) || et.isLeader,
        isTutor: (existing?.isTutor ?? false) || et.isTutor,
      });
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