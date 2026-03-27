import api from './api';

export interface EmployeeOption {
  id: number;
  name: string;
  surname: string;
}

export async function getEmployees(): Promise<EmployeeOption[]> {
  const res = await api.get('/api/employees?sort=surname,asc');
  return res.data;
}