import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { login as loginService, loggedAccount } from '../../services/authService';
import * as SecureStore from 'expo-secure-store';
import { RootState } from '..';
import User from '../../constants/user';

// --- Thunks ---

export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_) => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (!token) return null;
      const user = await loggedAccount();
      return user;
    } catch (err: unknown) {
      console.error('Failed to initialize authentication state', err);
      await SecureStore.deleteItemAsync('auth_token');
      return null;
    }
  }
)

export const loginThunk = createAsyncThunk(
  'auth/login',
  async ({ username, password }: { username: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await loginService(username, password);
      await SecureStore.setItemAsync('auth_token', response.id_token);
      const user = await loggedAccount();
      return user;
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message === 'INVALID_CREDENTIALS') {
          return rejectWithValue('Credenziali non valide');
        }
        if (err.message === 'LOGIN_TIMEOUT' || err.message === 'LOGIN_NETWORK') {
          return rejectWithValue('Backend non raggiungibile. Controlla URL/API e rete.');
        }
      }

      return rejectWithValue('Errore durante il login');
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
  isInitializing: boolean;
}

const initialState: AuthState = {
  user: null,
  status: 'idle',
  error: null,
  isInitializing: true,
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
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isInitializing = false;
      })
      .addCase(initializeAuth.pending, (state) => {
        state.isInitializing = true;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isInitializing = false;
      })
  },
});

export default authSlice.reducer;

// --- Selectors ---
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsLoggedIn = (state: RootState) => state.auth.user !== null;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectIsInitializing = (state: RootState) => state.auth.isInitializing;