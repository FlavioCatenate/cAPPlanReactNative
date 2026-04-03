import api from './api';

export interface EmployeeSkillItem {
  id: number;
  employee: {
    id: number;
    name?: string;
    surname?: string;
    emailAddress?: string;
  };
  skill: {
    id: number;
    name: string;
    category?: string;
    description?: string;
  };
}

export async function getAllEmployeeSkills(): Promise<EmployeeSkillItem[]> {
  const { data } = await api.get<EmployeeSkillItem[]>(
    '/api/employee-skills?eagerload=true&sort=id,asc&size=1000'
  );
  return data;
}

export async function createEmployeeSkill(
  employeeId: number,
  skillId: number
): Promise<EmployeeSkillItem> {
  const { data } = await api.post<EmployeeSkillItem>('/api/employee-skills', {
    employee: { id: employeeId },
    skill: { id: skillId },
  });
  return data;
}

export async function deleteEmployeeSkill(id: number): Promise<void> {
  await api.delete(`/api/employee-skills/${id}`);
}
