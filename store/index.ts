import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import allocationReducer from './slices/allocationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    allocations: allocationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;