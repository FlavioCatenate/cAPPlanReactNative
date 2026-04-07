import api from './api';

export interface EmployeeProject {
  id: number;
  fromDate: string;
  toDate: string;
  percentage: number;
  isActive: boolean;
  salesRate: number;
  isFixedPrice: boolean;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  type: string;
  fromDate: string;
  toDate: string;
  isActive: boolean;
  fixedPrice: number;
  projectIdKpi: string;
  employeeProjects?: EmployeeProject[];
}

/** Alias used by allocationSlice for dropdown selections */
export interface ProjectOption {
  id: number;
  name: string;
  type: string;
  isActive: boolean;
}

export async function getProjects(): Promise<Project[]> {
  const res = await api.get('/api/projects?sort=name,asc&size=500');
  return res.data;
}

export async function createProject(
  data: Omit<Project, 'id' | 'employeeProjects'>
): Promise<Project> {
  const res = await api.post('/api/projects', data);
  return res.data;
}

export async function updateProject(
  id: number,
  data: Partial<Project> & { id: number }
): Promise<Project> {
  const res = await api.put(`/api/projects/${id}`, data);
  return res.data;
}

export async function deleteProject(id: number): Promise<void> {
  await api.delete(`/api/projects/${id}`);
}