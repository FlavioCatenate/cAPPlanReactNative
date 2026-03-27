import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getEmployees, type EmployeeOption } from '../../services/employeeService';
import type { RootState } from '../index';

interface EmployeeState {
  items: EmployeeOption[];
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

const initialState: EmployeeState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchEmployees = createAsyncThunk(
  'employees/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await getEmployees();
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Errore');
    }
  }
);

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
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export default employeeSlice.reducer;

export const selectEmployees = (state: RootState) => state.employees.items;
export const selectEmployeesStatus = (state: RootState) => state.employees.status;