import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getSkills, type SkillOption } from '../../services/skillService';
import type { RootState } from '..';

interface SkillState {
  items: SkillOption[];
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

const initialState: SkillState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchSkills = createAsyncThunk(
  'skills/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await getSkills();
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Errore');
    }
  }
);

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
      })
      .addCase(fetchSkills.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export default skillSlice.reducer;

export const selectSkills = (state: RootState) => state.skills.items;
export const selectSkillsStatus = (state: RootState) => state.skills.status;
export const selectSkillsError = (state: RootState) => state.skills.error;