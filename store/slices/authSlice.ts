import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { login as loginService, loggedAccount } from '../../services/authService';
import * as SecureStore from 'expo-secure-store';
import { RootState } from '..';
import { User } from '../../context/AuthContext';

// --- Thunks ---

export const loginThunk = createAsyncThunk(
  'auth/login',
  async ({ username, password }: { username: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await loginService(username, password);
      await SecureStore.setItemAsync('auth_token', response.id_token);
      const user = await loggedAccount();
      return user;
    } catch (err) {
      return rejectWithValue('Credenziali non valide');
    }
  }
);

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  await SecureStore.deleteItemAsync('auth_token');
});

// --- Slice ---

interface AuthState {
  user: User | null;
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  status: 'idle',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.status = 'idle';
        state.user = action.payload;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.status = 'idle';
      });
  },
});

export default authSlice.reducer;

// --- Selectors ---
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsLoggedIn = (state: RootState) => state.auth.user !== null;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectAuthError = (state: RootState) => state.auth.error;