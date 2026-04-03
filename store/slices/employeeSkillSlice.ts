import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import {
  getAllEmployeeSkills,
  type EmployeeSkillItem,
} from '../../services/employeeSkillService';
import type { RootState } from '../index';

export interface SkillRef {
  id: number;
  name: string;
}

interface EmployeeSkillState {
  items: EmployeeSkillItem[];
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
  hasBeenFetched: boolean;
}

const initialState: EmployeeSkillState = {
  items: [],
  status: 'idle',
  error: null,
  hasBeenFetched: false,
};

export const fetchEmployeeSkills = createAsyncThunk<
  EmployeeSkillItem[],
  void,
  { rejectValue: string }
>('employeeSkills/fetchAll', async (_, { rejectWithValue }) => {
  try {
    return await getAllEmployeeSkills();
  } catch (err) {
    return rejectWithValue(
      err instanceof Error ? err.message : 'Errore caricamento skills'
    );
  }
});

const employeeSkillSlice = createSlice({
  name: 'employeeSkills',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployeeSkills.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchEmployeeSkills.fulfilled, (state, action) => {
        state.status = 'idle';
        state.items = action.payload;
        state.hasBeenFetched = true;
      })
      .addCase(fetchEmployeeSkills.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Errore sconosciuto';
      });
  },
});

export default employeeSkillSlice.reducer;

// ─── Selectors ───────────────────────────────────────────────────────────────

export const selectEmployeeSkillItems = (state: RootState) =>
  state.employeeSkills.items;

export const selectEmployeeSkillHasBeenFetched = (state: RootState) =>
  state.employeeSkills.hasBeenFetched;

/** Memoized map: employeeId → SkillRef[] */
export const selectEmployeeSkillMap = createSelector(
  [selectEmployeeSkillItems],
  (items): Map<number, SkillRef[]> => {
    const map = new Map<number, SkillRef[]>();
    items.forEach((es) => {
      const empId = es.employee.id;
      if (!map.has(empId)) map.set(empId, []);
      map.get(empId)!.push({ id: es.skill.id, name: es.skill.name });
    });
    return map;
  }
);
