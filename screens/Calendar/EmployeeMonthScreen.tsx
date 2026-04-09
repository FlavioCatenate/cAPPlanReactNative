import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useMemo } from 'react';
import { useAppSelector } from '../../store/hooks';
import { selectAllocations } from '../../store/slices/allocationSlice';
import {
  getDaysInMonth,
  getFirstDayOfWeekIndex,
  getStatusForPeriod,
  getCalendarStatusColor,
  getMonthName,
  type CalendarStatus,
} from '../../utils/calendarUtils';
import Colors from '../../constants/colors';

// ─── Constants ────────────────────────────────────────────────────────────────

const DAY_NAMES = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];

// ─── Types ────────────────────────────────────────────────────────────────────

type EmptyCell = { type: 'empty' };
type DayCell   = { type: 'day'; date: Date; status: CalendarStatus };
type Cell      = EmptyCell | DayCell;

// ─── Legend ───────────────────────────────────────────────────────────────────

function LegendItem({ color, label }: { color?: string; label: string }) {
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

export default function EmployeeMonthScreen({ route, navigation }: any) {
  const params = route?.params as {
    employeeId:   number;
    employeeName: string;
    year:         number;
    month:        number;
  } | undefined;

  // Guard: should never happen, but avoids a crash if params are missing
  if (!params) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFoundText}>Parametri mancanti.</Text>
      </View>
    );
  }

  const { employeeId, employeeName, year, month } = params;

  const allocations = useAppSelector(selectAllocations);

  // ── Derived calendar data ──────────────────────────────────────────────────

  const days           = useMemo(() => getDaysInMonth(year, month), [year, month]);
  const firstDayOffset = useMemo(() => getFirstDayOfWeekIndex(year, month), [year, month]);

  /**
   * Build the flat list of calendar cells:
   *   [ empty × offset ] + [ day cells ] + [ empty × trailing pad ]
   * Padded to a multiple of 7 so the grid always forms complete rows.
   */
  const cells = useMemo<Cell[]>(() => {
    const result: Cell[] = [];

    // Leading empty cells
    for (let i = 0; i < firstDayOffset; i++) result.push({ type: 'empty' });

    // Day cells
    days.forEach((d) => {
      const status = getStatusForPeriod(allocations, employeeId, d, d);
      result.push({ type: 'day', date: d, status });
    });

    // Trailing empty cells to complete the last row
    while (result.length % 7 !== 0) result.push({ type: 'empty' });

    return result;
  }, [days, firstDayOffset, allocations, employeeId]);

  /** Group cells into rows of 7 */
  const rows = useMemo<Cell[][]>(() => {
    const r: Cell[][] = [];
    for (let i = 0; i < cells.length; i += 7) r.push(cells.slice(i, i + 7));
    return r;
  }, [cells]);

  // ── Helper ─────────────────────────────────────────────────────────────────

  const todayFlat = (() => {
    const t = new Date();
    return `${t.getFullYear()}-${t.getMonth()}-${t.getDate()}`;
  })();

  const isToday = (date: Date) =>
    `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}` === todayFlat;

  // ── Initials for avatar ────────────────────────────────────────────────────

  const initials = employeeName
    .split(' ')
    .map((w) => w[0] ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>

      {/* ── Employee header card ── */}
      <View style={styles.employeeCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View>
          <Text style={styles.employeeName}>{employeeName}</Text>
          <Text style={styles.monthSubtitle}>
            {getMonthName(month)} {year}
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* ── Day-of-week header ── */}
        <View style={styles.dowRow}>
          {DAY_NAMES.map((d, i) => (
            <View key={i} style={styles.dowCell}>
              <Text style={styles.dowText}>{d}</Text>
            </View>
          ))}
        </View>

        {/* ── Calendar grid ── */}
        {rows.map((row, ri) => (
          <View key={ri} style={styles.calRow}>
            {row.map((cell, ci) => {
              if (cell.type === 'empty') {
                return <View key={ci} style={styles.dayCell} />;
              }

              const color     = getCalendarStatusColor(cell.status);
              const todayCell = isToday(cell.date);

              return (
                <View
                  key={ci}
                  style={[
                    styles.dayCell,
                    color && !todayCell && { backgroundColor: color + '18' },
                  ]}
                >
                  <View
                    style={[
                      styles.dayCircle,
                      todayCell && styles.dayCircleToday,
                      color && !todayCell && { backgroundColor: color },
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        (color && !todayCell) || todayCell
                          ? styles.dayTextOnColor
                          : null,
                      ]}
                    >
                      {cell.date.getDate()}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        ))}

        {/* ── Legend ── */}
        <View style={styles.legend}>
          <LegendItem color={Colors.successColor} label="Active" />
          <LegendItem color={Colors.warningColor} label="Expiring" />
          <LegendItem color={Colors.errorColor}   label="Completed" />
          <LegendItem                             label="Free" />
        </View>

      </ScrollView>

    
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
  notFoundText: {
    color: Colors.mainTextColor,
    fontSize: 16,
  },

  // Employee header card
  employeeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.surfaceColor,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary + '22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.mainTextColor,
  },
  monthSubtitle: {
    fontSize: 13,
    color: Colors.textColor,
    marginTop: 2,
  },

  scrollContent: {
    paddingBottom: 16,
  },

  // Day-of-week header
  dowRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  dowCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  dowText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textColor,
  },

  // Calendar grid
  calRow: {
    flexDirection: 'row',
  },
  dayCell: {
    flex: 1,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  dayCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleToday: {
    backgroundColor: Colors.primary,
  },
  dayText: {
    fontSize: 13,
    color: Colors.mainTextColor,
    fontWeight: '400',
  },
  dayTextOnColor: {
    color: '#fff',
    fontWeight: '600',
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

  // Back
  backText: {
    color: Colors.mainTextColor,
    textAlign: 'center',
    paddingVertical: 14,
    fontSize: 14,
  },
});