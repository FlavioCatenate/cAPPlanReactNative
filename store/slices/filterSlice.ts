import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';

interface FilterState {
  selectedTeams: string[]; // nomi dei team selezionati
  selectedStatuses: string[]; // colori dello stato selezionati
  selectedEmployees: number[]; // ID degli employee selezionati
}

const initialState: FilterState = {
  selectedTeams: [],
  selectedStatuses: [],
  selectedEmployees: [],
};

const filterSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    /**
     * Toggle un team nella lista selezionati
     * Se già selezionato, lo rimuove; altrimenti lo aggiunge
     */
    toggleTeamFilter: (state, action: PayloadAction<string>) => {
      const teamName = action.payload;
      const index = state.selectedTeams.indexOf(teamName);

      if (index > -1) {
        // È selezionato, rimuovilo
        state.selectedTeams.splice(index, 1);
      } else {
        // Non è selezionato, aggiungilo
        state.selectedTeams.push(teamName);
      }
    },

    /**
     * Toggle uno status nella lista selezionati
     */
    toggleStatusFilter: (state, action: PayloadAction<string>) => {
      const status = action.payload;
      const index = state.selectedStatuses.indexOf(status);

      if (index > -1) {
        state.selectedStatuses.splice(index, 1);
      } else {
        state.selectedStatuses.push(status);
      }
    },

    toggleEmployeeFilter: (state, action: PayloadAction<number>) => {
      const employeeId = action.payload;
      const index = state.selectedEmployees.indexOf(employeeId);

      if (index > -1) {
        state.selectedEmployees.splice(index, 1);
      } else {
        state.selectedEmployees.push(employeeId);
      }
    },

    /**
     * Resetta tutti i filtri
     */
    clearAllFilters: (state) => {
      state.selectedTeams = [];
      state.selectedStatuses = [];
      state.selectedEmployees = [];
    },
  },
});

export const { toggleTeamFilter, toggleStatusFilter, toggleEmployeeFilter, clearAllFilters } =
  filterSlice.actions;

export default filterSlice.reducer;

// ============= SELECTORS =============

export const selectSelectedTeams = (state: RootState) =>
  state.filters.selectedTeams;

export const selectSelectedStatuses = (state: RootState) =>
  state.filters.selectedStatuses;

export const selectSelectedEmployees = (state: RootState) =>
  state.filters.selectedEmployees;

export const selectHasActiveFilters = (state: RootState) => {
  const teams = state.filters.selectedTeams.length > 0;
  const statuses = state.filters.selectedStatuses.length > 0;
  const employees = state.filters.selectedEmployees.length > 0;
  return teams || statuses || employees;
};

export const selectActiveFilterCount = (state: RootState) => {
  return (
    state.filters.selectedTeams.length +
    state.filters.selectedStatuses.length +
    state.filters.selectedEmployees.length
  );
};