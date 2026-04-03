import api from './api';
import type { Skill } from '../store/slices/skillSlice';

export async function getSkills(): Promise<Skill[]> {
  const { data } = await api.get<Skill[]>('/api/skills?sort=name,asc&size=1000');
  return data;
}

export async function createSkill(data: Omit<Skill, 'id'>): Promise<Skill> {
  const { data: created } = await api.post<Skill>('/api/skills', data);
  return created;
}

export async function updateSkill(
  id: number,
  data: Partial<Skill> & { id: number }
): Promise<Skill> {
  const { data: updated } = await api.put<Skill>(`/api/skills/${id}`, data);
  return updated;
}

export async function deleteSkill(id: number): Promise<void> {
  await api.delete(`/api/skills/${id}`);
}