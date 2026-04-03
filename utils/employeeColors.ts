import Colors from '../constants/colors';
import type { Employee } from '../store/slices/employeeSlice';

/**
 * Determina il ruolo principale dell'employee per la colorazione della card.
 * Priorità: isLeader > isTutor > default
 */
export type EmployeeRole = 'leader' | 'tutor' | 'default';

export function getEmployeeRole(employee: Employee): EmployeeRole {
  if (employee.isLeader) return 'leader';
  if (employee.isTutor) return 'tutor';
  return 'default';
}

/** Versione che accetta i flag direttamente dalla relazione employee-team */
export function getEmployeeRoleFromFlags(isLeader?: boolean, isTutor?: boolean): EmployeeRole {
  if (isLeader) return 'leader';
  if (isTutor) return 'tutor';
  return 'default';
}

export function getEmployeeRoleColor(role: EmployeeRole): string {
  switch (role) {
    case 'leader':
      return Colors.primary;
    case 'tutor':
      return Colors.warningColor;
    default:
      return Colors.lightGray;
  }
}

export function getEmployeeRoleLabel(role: EmployeeRole): string {
  switch (role) {
    case 'leader':
      return 'Leader';
    case 'tutor':
      return 'Tutor';
    default:
      return '';
  }
}