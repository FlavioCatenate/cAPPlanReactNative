import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useMemo } from 'react';
import { useAppSelector } from '../../store/hooks';
import {
  selectEmployees,
  type Employee,
} from '../../store/slices/employeeSlice';
import { selectEmployeeSkillMap } from '../../store/slices/employeeSkillSlice';
import {
  selectEmployeeTeamMap,
  selectEmployeeRoleMap,
  selectEmployeeTeamItems,
} from '../../store/slices/employeeTeamSlice';
import {
  getEmployeeRoleFromFlags,
  getEmployeeRoleColor,
  getEmployeeRoleLabel,
} from '../../utils/employeeColors';
import SkillBadge from '../../components/SkillBadge';
import Colors from '../../constants/colors';

export default function EmployeeDetailScreen({ route, navigation }: any) {
  const employeeId: number | undefined = route?.params?.employeeId;
  const employees = useAppSelector(selectEmployees);
  const employeeSkillMap = useAppSelector(selectEmployeeSkillMap);
  const employeeTeamMap = useAppSelector(selectEmployeeTeamMap);
  const employeeRoleMap = useAppSelector(selectEmployeeRoleMap);
  const employeeTeamItems = useAppSelector(selectEmployeeTeamItems);

  const employee = useMemo<Employee | undefined>(() => {
    if (typeof employeeId !== 'number') return undefined;
    return employees.find((e) => e.id === employeeId);
  }, [employeeId, employees]);

  const teamLeaderMap = useMemo(() => {
    const map = new Map<string, string>();
    employeeTeamItems.forEach((et) => {
      if (et.isLeader && et.employee.name && et.employee.surname) {
        map.set(et.team.name, `${et.employee.name} ${et.employee.surname}`);
      }
    });
    return map;
  }, [employeeTeamItems]);

  if (!employee) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFoundText}>Employee non trovato.</Text>
      </View>
    );
  }

  const roleFlags = employeeRoleMap.get(employee.id);
  const role = getEmployeeRoleFromFlags(roleFlags?.isLeader, roleFlags?.isTutor);
  const headerColor = getEmployeeRoleColor(role);
  const roleLabel = getEmployeeRoleLabel(role);

  const teamName = employeeTeamMap.get(employee.id)?.[0]?.name;
  const isLeader = roleFlags?.isLeader ?? false;
  const leaderFullName = isLeader
    ? undefined
    : teamName ? (teamLeaderMap.get(teamName) ?? 'N/A') : 'N/A';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.card}>
        {/* ── Header ── */}
        <View style={[styles.header, { backgroundColor: headerColor }]}>
          <Text style={styles.headerName} numberOfLines={1}>
            {employee.name} {employee.surname}
          </Text>
          {roleLabel ? (
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{roleLabel}</Text>
            </View>
          ) : null}
        </View>

        {/* ── Dati ── */}
        <View style={styles.body}>
          {(() => {
            const teams = employeeTeamMap.get(employee.id) ?? [];
            return teams.length > 0 ? (
              <>
                <Text style={styles.label}>Team</Text>
                <Text style={styles.value}>{teams.map((t) => t.name).join(', ')}</Text>
              </>
            ) : null;
          })()}

          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{employee.emailAddress ?? 'N/A'}</Text>

          <Text style={styles.label}>Ruolo</Text>
          <View style={styles.roleRow}>
            <View
              style={[
                styles.roleChip,
                roleFlags?.isLeader && styles.roleChipActive,
              ]}
            >
              <Text
                style={[
                  styles.roleChipText,
                  roleFlags?.isLeader && styles.roleChipTextActive,
                ]}
              >
                Leader
              </Text>
            </View>
            <View
              style={[
                styles.roleChip,
                roleFlags?.isTutor && styles.roleChipActive,
              ]}
            >
              <Text
                style={[
                  styles.roleChipText,
                  roleFlags?.isTutor && styles.roleChipTextActive,
                ]}
              >
                Tutor
              </Text>
            </View>
          </View>

          {/* ── Tutor & Leader ── */}
          <Text style={styles.label}>Tutor</Text>
          <Text style={styles.value}>
            {employee.tutorId
              ? `${employee.tutorId.name} ${employee.tutorId.surname}`
              : 'N/A'}
          </Text>

          {!isLeader ? (
            <>
              <Text style={styles.label}>Leader</Text>
              <Text style={styles.value}>{leaderFullName}</Text>
            </>
          ) : null}

          {/* ── Extra fields ── */}
          <Text style={styles.label}>Country</Text>
          <Text style={styles.value}>{employee.country ?? 'N/A'}</Text>

          <Text style={styles.label}>Is Active</Text>
          <Text style={styles.value}>
            {employee.isActive !== undefined && employee.isActive !== null ? (employee.isActive ? 'Yes' : 'No') : 'N/A'}
          </Text>

          <Text style={styles.label}>Legal Entity</Text>
          <Text style={styles.value}>{employee.legalEntity ?? 'N/A'}</Text>

          <Text style={styles.label}>Wage Rate</Text>
          <Text style={styles.value}>
            {employee.wageRate !== undefined && employee.wageRate !== null ? String(employee.wageRate) : 'N/A'}
          </Text>

          <Text style={styles.label}>Business Unit</Text>
          <Text style={styles.value}>{employee.businessUnit ?? 'N/A'}</Text>

          <Text style={styles.label}>Start Working Date</Text>
          <Text style={styles.value}>{employee.startWorkingDate ?? 'N/A'}</Text>

          <Text style={styles.label}>Last Salary Increase Date</Text>
          <Text style={styles.value}>{employee.lastSalaryIncreaseDate ?? 'N/A'}</Text>

          <Text style={styles.label}>Is Freelancer</Text>
          <Text style={styles.value}>
            {employee.isFreelancer !== undefined ? (employee.isFreelancer ? 'Yes' : 'No') : 'N/A'}
          </Text>

          {/* ── Skills ── */}
          {(() => {
            const skills = employeeSkillMap.get(employee.id) ?? [];
            return skills.length > 0 ? (
              <>
                <Text style={[styles.label, { marginTop: 14 }]}>Skills</Text>
                <View style={styles.skillsWrap}>
                  {skills.map((s) => (
                    <SkillBadge key={s.id} name={s.name} variant="prominent" />
                  ))}
                </View>
              </>
            ) : null;
          })()}
        </View>
      </View>

      <Pressable
        onPress={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.navigate('EmployeeList');
          }
        }}
      >
        <Text style={styles.backText}>Torna indietro</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundColor,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundColor,
  },
  notFoundText: {
    color: Colors.mainTextColor,
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: Colors.surfaceColor,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  headerName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.mainTextColor,
  },
  roleBadge: {
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.mainTextColor,
  },
  body: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 4,
  },
  label: {
    fontSize: 12,
    color: Colors.textColor,
    opacity: 0.8,
    marginTop: 10,
  },
  value: {
    color: Colors.mainTextColor,
    fontWeight: '600',
    fontSize: 15,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  roleChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: Colors.backgroundColor,
    borderWidth: 1,
    borderColor: Colors.secondaryGray + '40',
  },
  roleChipActive: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
  },
  roleChipText: {
    fontSize: 13,
    color: Colors.textColor,
    fontWeight: '500',
  },
  roleChipTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  skillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  backText: {
    color: Colors.mainTextColor,
    textAlign: 'center',
    paddingVertical: 12,
  },
});