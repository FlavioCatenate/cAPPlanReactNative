import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchAllocations,
  selectAllocations,
  selectAllocationsStatus,
} from '../../store/slices/allocationSlice';
import { fetchEmployees, selectEmployees } from '../../store/slices/employeeSlice';
import {
  getWeeksOfMonth,
  getStatusForPeriod,
  getCalendarStatusColor,
  getMonthName,
  type WeekRange,
  type CalendarStatus,
} from '../../utils/calendarUtils';
import Colors from '../../constants/colors';

// ─── Constants ────────────────────────────────────────────────────────────────

const NAME_COL_WIDTH = 92;

// ─── Sub-types ────────────────────────────────────────────────────────────────

interface EmployeeRow {
  id: number;
  fullName: string;
}

// ─── Atomic sub-components ────────────────────────────────────────────────────

interface WeekCellProps {
  status: CalendarStatus;
  isCurrentWeek: boolean;
}

const WeekCell = memo(function WeekCell({ status, isCurrentWeek }: WeekCellProps) {
  const color = getCalendarStatusColor(status);
  return (
    <View style={[styles.weekCell, isCurrentWeek && styles.weekCellCurrent]}>
      <View
        style={[
          styles.bar,
          color
            ? { backgroundColor: color }
            : styles.barEmpty,
        ]}
      />
    </View>
  );
});

interface EmpRowProps {
  employee: EmployeeRow;
  allocations: ReturnType<typeof selectAllocations>;
  weeks: WeekRange[];
  onPress: (emp: EmployeeRow) => void;
}

const EmployeeCalendarRow = memo(function EmployeeCalendarRow({
  employee,
  allocations,
  weeks,
  onPress,
}: EmpRowProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.empRow, pressed && styles.empRowPressed]}
      onPress={() => onPress(employee)}
    >
      <View style={styles.nameCell}>
        <Text style={styles.empName}>
          {employee.fullName}
        </Text>
      </View>

      {weeks.map((week) => {
        const status = getStatusForPeriod(allocations, employee.id, week.start, week.end);
        return (
          <WeekCell
            key={week.label}
            status={status}
            isCurrentWeek={week.isCurrentWeek}
          />
        );
      })}
    </Pressable>
  );
});

// ─── Legend ───────────────────────────────────────────────────────────────────

function LegendItem({ color, label, empty }: { color?: string; label: string; empty?: boolean }) {
  return (
    <View style={styles.legItem}>
      <View
        style={[
          styles.legDot,
          color
            ? { backgroundColor: color }
            : { backgroundColor: Colors.surfaceColor, borderWidth: 0.5, borderColor: Colors.lightGray },
        ]}
      />
      <Text style={styles.legLabel}>{label}</Text>
    </View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function CalendarScreen({ navigation }: any) {
  const dispatch = useAppDispatch();

  const allocations      = useAppSelector(selectAllocations);
  const allocStatus      = useAppSelector(selectAllocationsStatus);
  const employeesInStore = useAppSelector(selectEmployees);

  const today = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  // ── Data fetching ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (allocations.length === 0) dispatch(fetchAllocations());
    if (employeesInStore.length === 0) dispatch(fetchEmployees());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived data ───────────────────────────────────────────────────────────

  const weeks = useMemo(() => getWeeksOfMonth(year, month), [year, month]);

  /**
   * Prefer the full employee list from employeeSlice.
   * If not yet loaded, fall back to unique employees extracted from allocations
   * so the calendar is never empty even before fetchEmployees resolves.
   */
  const employees = useMemo<EmployeeRow[]>(() => {
    if (employeesInStore.length > 0) {
      return employeesInStore
        .map((e) => ({
          id:       e.id,
          fullName: ` ${e.name ?? ''} ${e.surname ?? ''}`.trim(),
        }))
        .sort((a, b) => a.fullName.localeCompare(b.fullName));
    }

    const map = new Map<number, EmployeeRow>();
    allocations.forEach((a) => {
      const empId = Number(a.employee?.id);
      if (empId && !map.has(empId)) {
        map.set(empId, {
          id:       empId,
          fullName: `${a.employee?.surname ?? ''} ${a.employee?.name ?? ''}`.trim(),
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.fullName.localeCompare(b.fullName));
  }, [employeesInStore, allocations]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handlePrevMonth = useCallback(() => {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else             { setMonth((m) => m - 1); }
  }, [month]);

  const handleNextMonth = useCallback(() => {
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else              { setMonth((m) => m + 1); }
  }, [month]);

  const handleEmployeePress = useCallback(
    (emp: EmployeeRow) => {
      const params = {
        employeeId: emp.id,
        employeeName: emp.fullName,
        year,
        month,
      };

      const currentRouteNames: string[] = navigation?.getState?.()?.routeNames ?? [];

      if (currentRouteNames.includes('EmployeeMonth')) {
        navigation.navigate('EmployeeMonth', params);
        return;
      }

      navigation.navigate('AllocationStack', {
        screen: 'EmployeeMonth',
        params,
      });
    },
    [navigation, year, month],
  );

  // ── Loading / error states ──────────────────────────────────────────────────

  if (allocStatus === 'loading' && allocations.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>

      {/* ── Month navigation ── */}
      <View style={styles.monthNav}>
        <Pressable
          style={styles.navBtn}
          onPress={handlePrevMonth}
          android_ripple={{ color: 'rgba(0,0,0,0.08)', radius: 24, borderless: true }}
        >
          <Text style={styles.navArrow}>‹</Text>
        </Pressable>

        <Text style={styles.monthTitle}>
          {getMonthName(month)} {year}
        </Text>

        <Pressable
          style={styles.navBtn}
          onPress={handleNextMonth}
          android_ripple={{ color: 'rgba(0,0,0,0.08)', radius: 24, borderless: true }}
        >
          <Text style={styles.navArrow}>›</Text>
        </Pressable>
      </View>

      {/* ── Week-range header row ── */}
      <View style={styles.headerRow}>
        <View style={{ width: NAME_COL_WIDTH }} />
        {weeks.map((w) => (
          <View
            key={w.label}
            style={[styles.weekHeaderCell, w.isCurrentWeek && styles.weekHeaderCellCurrent]}
          >
            <Text style={[styles.weekHeaderText, w.isCurrentWeek && styles.weekHeaderTextCurrent]}>
              {w.label}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.divider} />

      {/* ── Employee rows ── */}
      {employees.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Nessun employee trovato</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
          {employees.map((emp) => (
            <EmployeeCalendarRow
              key={emp.id}
              employee={emp}
              allocations={allocations}
              weeks={weeks}
              onPress={handleEmployeePress}
            />
          ))}

          {/* ── Legend ── */}
          <View style={styles.legend}>
            <LegendItem color={Colors.successColor}  label="Attivo" />
            <LegendItem color={Colors.warningColor}  label="In scadenza" />
            <LegendItem color={Colors.errorColor}    label="Completato" />
            <LegendItem                              label="Libero" />
          </View>
        </ScrollView>
      )}

    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundColor,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Month navigation
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  navBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  navArrow: {
    fontSize: 26,
    color: Colors.mainTextColor,
    fontWeight: '300',
    lineHeight: 30,
  },
  monthTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.mainTextColor,
  },

  // Week header row
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  weekHeaderCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    borderRadius: 6,
  },
  weekHeaderCellCurrent: {
    backgroundColor: Colors.primary + '15',
  },
  weekHeaderText: {
    fontSize: 10,
    color: Colors.textColor,
    textAlign: 'center',
  },
  weekHeaderTextCurrent: {
    color: Colors.primary,
    fontWeight: '600',
  },

  divider: {
    height: 1,
    backgroundColor: Colors.surfaceColor,
    marginBottom: 4,
  },

  listContent: {
    paddingBottom: 32,
  },

  // Employee rows
  empRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.surfaceColor,
  },
  empRowPressed: {
    opacity: 0.6,
  },
  nameCell: {
    width: NAME_COL_WIDTH,
    paddingRight: 8,
  },
  empName: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.mainTextColor,
  },

  // Week cells
  weekCell: {
    flex: 1,
    height: 38,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  weekCellCurrent: {
    backgroundColor: Colors.primary + '08',
    borderRadius: 4,
  },
  bar: {
    height: 20,
    borderRadius: 6,
  },
  barEmpty: {
    backgroundColor: Colors.surfaceColor,
    borderWidth: 0.5,
    borderColor: Colors.lightGray,
  },

  // Legend
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 20,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: Colors.surfaceColor,
  },
  legItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legLabel: {
    fontSize: 11,
    color: Colors.textColor,
  },

  emptyText: {
    fontSize: 14,
    color: Colors.textColor,
  },
});