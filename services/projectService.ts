import api from './api';

export interface ProjectOption {
  id: number;
  name: string;
  type: string;
  isActive: boolean;
}

export async function getProjects(): Promise<ProjectOption[]> {
  const res = await api.get('/api/projects?sort=name,asc&size=500');
  return res.data;
}