import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import {
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
} from '../../services/skillService';
import type { RootState } from '../index';

// ─── Interfacce ─────────────────────────────────────────────────────────────

export interface Skill {
  id: number;
  name: string;
  description?: string;
}

// ─── State ──────────────────────────────────────────────────────────────────

interface SkillState {
  items: Skill[];
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
  hasBeenFetched: boolean;
}

const initialState: SkillState = {
  items: [],
  status: 'idle',
  error: null,
  hasBeenFetched: false,
};

// ─── Thunk ──────────────────────────────────────────────────────────────────

export const fetchSkills = createAsyncThunk<
  Skill[],
  void,
  { rejectValue: string }
>('skills/fetchAll', async (_, { rejectWithValue }) => {
  try {
    return await getSkills();
  } catch (err) {
    return rejectWithValue(
      err instanceof Error ? err.message : 'Unknown error'
    );
  }
});

export const createSkillThunk = createAsyncThunk<
  Skill,
  Omit<Skill, 'id'>,
  { rejectValue: string }
>('skills/create', async (data, { rejectWithValue }) => {
  try {
    return await createSkill(data);
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : 'Unknown error');
  }
});

export const updateSkillThunk = createAsyncThunk<
  Skill,
  { id: number; data: Partial<Skill> & { id: number } },
  { rejectValue: string }
>('skills/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    return await updateSkill(id, data);
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

export const deleteSkillThunk = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>('skills/delete', async (id, { rejectWithValue }) => {
  try {
    await deleteSkill(id);
    return id;
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : 'Unknown error');
  }
});

// ─── Slice ──────────────────────────────────────────────────────────────────

const skillSlice = createSlice({
  name: 'skills',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSkills.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchSkills.fulfilled, (state, action) => {
        state.status = 'idle';
        state.items = action.payload;
        state.hasBeenFetched = true;
      })
      .addCase(fetchSkills.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Unknown error';
      })
      .addCase(createSkillThunk.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateSkillThunk.fulfilled, (state, action) => {
        const index = state.items.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(deleteSkillThunk.fulfilled, (state, action) => {
        state.items = state.items.filter((s) => s.id !== action.payload);
      });
  },
});

export default skillSlice.reducer;

// ─── Selectors ───────────────────────────────────────────────────────────────

export const selectSkills = (state: RootState) => state.skills.items;
export const selectSkillsStatus = (state: RootState) => state.skills.status;
export const selectSkillsError = (state: RootState) => state.skills.error;
export const selectSkillsHasBeenFetched = (state: RootState) =>
  state.skills.hasBeenFetched;