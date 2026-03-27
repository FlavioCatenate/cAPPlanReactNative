import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getProjects, type ProjectOption } from '../../services/projectService';
import type { RootState } from '../index';

interface ProjectState {
  items: ProjectOption[];
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

const initialState: ProjectState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchProjects = createAsyncThunk(
  'projects/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await getProjects();
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Errore');
    }
  }
);

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.status = 'idle';
        state.items = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export default projectSlice.reducer;

export const selectProjects = (state: RootState) => state.projects.items;
export const selectProjectsStatus = (state: RootState) => state.projects.status;