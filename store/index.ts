import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import allocationReducer from './slices/allocationSlice';
import employeeReducer from './slices/employeeSlice';
import projectReducer from './slices/projectSlice';
import skillReducer from './slices/skillSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    allocations: allocationReducer,
    employees: employeeReducer,
    projects: projectReducer,
    skills: skillReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Large allocation payloads can be expensive to traverse in development.
        warnAfter: 128,
        ignoredPaths: ['allocations.items'],
        ignoredActionPaths: ['payload', 'meta.arg'],
      },
      immutableCheck: {
        warnAfter: 128,
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;