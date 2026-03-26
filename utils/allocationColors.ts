import Colors from '../constants/colors';
import type { Allocation } from '../store/slices/skillSlice';
export type AllocationStatus = 'completed' | 'expiring' | 'active';

export function getAllocationStatus(allocation: Allocation): AllocationStatus {
  if (!allocation.project.isActive) return 'completed';

  const daysUntilEnd = Math.ceil(
    (new Date(allocation.toDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilEnd < 0) return 'completed';
  if (daysUntilEnd <= 30) return 'expiring';
  return 'active';
}

export function getStatusColor(status: AllocationStatus): string {
  switch (status) {
    case 'completed': return Colors.errorColor;
    case 'expiring':  return Colors.warningColor;
    case 'active':    return Colors.successColor;
  }
}