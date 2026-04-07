import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  type Project,
} from '../../services/projectService';
import type { RootState } from '../index';

export type { Project };

// ─── State ──────────────────────────────────────────────────────────────────

interface ProjectState {
  items: Project[];
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
  hasBeenFetched: boolean;
}

const initialState: ProjectState = {
  items: [],
  status: 'idle',
  error: null,
  hasBeenFetched: false,
};

// ─── Thunks ─────────────────────────────────────────────────────────────────

export const fetchProjects = createAsyncThunk<
  Project[],
  void,
  { rejectValue: string }
>('projects/fetchAll', async (_, { rejectWithValue }) => {
  try {
    return await getProjects();
  } catch (err) {
    return rejectWithValue(
      err instanceof Error ? err.message : 'Errore sconosciuto'
    );
  }
});

export const createProjectThunk = createAsyncThunk<
  Project,
  Omit<Project, 'id' | 'employeeProjects'>,
  { rejectValue: string }
>('projects/create', async (data, { rejectWithValue }) => {
  try {
    return await createProject(data);
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : 'Errore');
  }
});

export const updateProjectThunk = createAsyncThunk<
  Project,
  { id: number; data: Partial<Project> & { id: number } },
  { rejectValue: string }
>('projects/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    return await updateProject(id, data);
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.response?.data?.title ||
        err.message;
      return rejectWithValue(String(msg));
    }
    return rejectWithValue(err instanceof Error ? err.message : 'Errore');
  }
});

export const deleteProjectThunk = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>('projects/delete', async (id, { rejectWithValue }) => {
  try {
    await deleteProject(id);
    return id;
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : 'Errore');
  }
});

// ─── Slice ──────────────────────────────────────────────────────────────────

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
        state.hasBeenFetched = true;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Errore sconosciuto';
      })
      .addCase(createProjectThunk.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateProjectThunk.fulfilled, (state, action) => {
        const index = state.items.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(deleteProjectThunk.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p.id !== action.payload);
      });
  },
});

export default projectSlice.reducer;

// ─── Selectors ───────────────────────────────────────────────────────────────

export const selectProjects = (state: RootState) => state.projects.items;
export const selectProjectsStatus = (state: RootState) => state.projects.status;
export const selectProjectsError = (state: RootState) => state.projects.error;
export const selectProjectsHasBeenFetched = (state: RootState) =>
  state.projects.hasBeenFetched;
