import api from './api';
import type { Allocation } from '../store/slices/skillSlice';

export async function getAllocations(): Promise<Allocation[]> {
  const res = await api.get('/api/employee-projects?eagerload=true&sort=id,asc');
  return res.data;
}

export async function createAllocation(data: Omit<Allocation, 'id'>): Promise<Allocation> {
  const res = await api.post('/api/employee-projects', data);
  return res.data;
}

export async function updateAllocation(id: number, data: Partial<Allocation>): Promise<Allocation> {
  const res = await api.put(`/api/employee-projects/${id}`, data);
  return res.data;
}

export async function deleteAllocation(id: number): Promise<void> {
  await api.delete(`/api/employee-projects/${id}`);
}
