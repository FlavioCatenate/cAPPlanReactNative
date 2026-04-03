import api from './api';
import type { Employee } from '../store/slices/employeeSlice';

// Verifica con il backend i parametri esatti di questi endpoint
export async function getEmployees(): Promise<Employee[]> {
  const { data } = await api.get<Employee[]>(
    '/api/employees?eagerload=true&sort=surname,asc&size=500'
  );
  return data;
}

export async function createEmployee(
  data: Omit<Employee, 'id'>
): Promise<Employee> {
  const { data: created } = await api.post<Employee>('/api/employees', data);
  return created;
}

export async function updateEmployee(
  id: number,
  data: Partial<Employee> & { id: number }
): Promise<Employee> {
  const { data: updated } = await api.put<Employee>(`/api/employees/${id}`, data);
  return updated;
}

export async function deleteEmployee(id: number): Promise<void> {
  await api.delete(`/api/employees/${id}`);
}