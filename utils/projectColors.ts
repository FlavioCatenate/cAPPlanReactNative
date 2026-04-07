import Colors from '../constants/colors';

export type ProjectStatus = 'completed' | 'expiring' | 'active';

export function getProjectStatus(
  isActive: boolean,
  toDate: string
): ProjectStatus {
  if (!isActive) return 'completed';

  const daysUntilEnd = Math.ceil(
    (new Date(toDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilEnd < 0) return 'completed';
  if (daysUntilEnd <= 30) return 'expiring';
  return 'active';
}

export function getProjectStatusColor(status: ProjectStatus): string {
  switch (status) {
    case 'completed': return Colors.errorColor;
    case 'expiring':  return Colors.warningColor;
    case 'active':    return Colors.successColor;
  }
}
