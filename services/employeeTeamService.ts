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

/**
 * Update isLeader/isTutor flags on a single employee-team record
 * PUT /api/employee-teams/{id}  (JHipster requires full entity body)
 */
export async function updateEmployeeTeam(
  record: EmployeeTeam,
  isLeader: boolean,
  isTutor: boolean
): Promise<EmployeeTeam> {
  const { data } = await api.put<EmployeeTeam>(`/api/employee-teams/${record.id}`, {
    ...record,
    isLeader,
    isTutor,
  });
  return data;
}

/**
 * Create a new employee-team relationship
 * POST /api/employee-teams
 */
export async function createEmployeeTeam(
  employeeId: number,
  teamId: number,
  isLeader: boolean,
  isTutor: boolean
): Promise<EmployeeTeam> {
  const { data } = await api.post<EmployeeTeam>('/api/employee-teams', {
    employee: { id: employeeId },
    team: { id: teamId },
    isLeader,
    isTutor,
  });
  return data;
}

/**
 * Delete an employee-team relationship
 * DELETE /api/employee-teams/{id}
 */
export async function deleteEmployeeTeam(id: number): Promise<void> {
  await api.delete(`/api/employee-teams/${id}`);
}