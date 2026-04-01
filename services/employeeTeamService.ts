import api from './api';

export interface Team {
  id: number;
  name: string;
}

export interface EmployeeTeam {
  id: number;
  isTutor: boolean;
  isLeader: boolean;
  employee: {
    id: number;
    name?: string;
    surname?: string;
    emailAddress?: string;
  };
  team: Team;
}

/**
 * Fetch all employee-team relationships
 * GET /api/employee-teams
 */
export async function getAllEmployeeTeams(): Promise<EmployeeTeam[]> {
  const response = await api.get<EmployeeTeam[]>(
    '/api/employee-teams?sort=id,asc&size=1000'
  );
  return response.data;
}

/**
 * Fetch teams for a specific employee
 * GET /api/employee-teams/{employeeId}
 */
export async function getEmployeeTeamsById(
  employeeId: number
): Promise<EmployeeTeam[]> {
  const response = await api.get<EmployeeTeam[]>(
    `/api/employee-teams/${employeeId}`
  );
  // Endpoint ritorna singolo object, lo wrappamo in array per consistenza
  return Array.isArray(response.data) ? response.data : [response.data];
}