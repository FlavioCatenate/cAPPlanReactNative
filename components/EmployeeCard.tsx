import { View, Text, StyleSheet, Pressable } from 'react-native';
import { memo } from 'react';
import Colors from '../constants/colors';
import type { EmployeeRole } from '../utils/employeeColors';

interface EmployeeCardProps {
  fullName: string;
  email?: string;
  team?: string;
  role: EmployeeRole;
  roleColor: string;
  skillCount?: number;
  tutorFullName?: string; 
  leaderFullName?: string; 
  onPressDetail: () => void;
  onPressOptions: () => void;
}

const EmployeeCard = memo(function EmployeeCard({
  fullName,
  email,
  team,
  role,
  roleColor,
  skillCount,
  tutorFullName,
  leaderFullName,
  onPressDetail,
  onPressOptions,
}: EmployeeCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.header, { backgroundColor: roleColor }]}>
        <Text style={styles.headerName} numberOfLines={1}>
          {fullName}
        </Text>
        <View style={styles.headerRight}>
          {role !== 'default' && (
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>
                {role === 'leader' ? 'Leader' : 'Tutor'}
              </Text>
            </View>
          )}
          <Pressable
            onPress={onPressOptions}
            android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: true }}
            hitSlop={8}
          >
            <Text style={styles.optionsHint}>···</Text>
          </Pressable>
        </View>
      </View>

      {/* ── Body: tap → schermata dettaglio ── */}
      <Pressable
        style={styles.body}
        onPress={onPressDetail}
        android_ripple={{ color: 'rgba(0,0,0,0.05)' }}
      >
        <View style={styles.bodyLeft}>
          {team ? (
            <View style={styles.teamRow}>
              <View style={styles.teamBadge}>
                <Text style={styles.teamBadgeText} numberOfLines={1}>
                  {team}
                </Text>
              </View>
            </View>
          ) : null}

          {skillCount !== undefined && skillCount > 0 ? (
            <Text style={styles.skillCount}>
              {skillCount} skill{skillCount !== 1 ? 's' : ''}
            </Text>
          ) : null}
        </View>

        {tutorFullName || leaderFullName ? (
          <View style={styles.bodyRight}>
            {tutorFullName ? (
              <Text style={styles.tutor} numberOfLines={1}>
                <Text style={{ fontWeight: '700' }}>Tutor:</Text> {tutorFullName}
              </Text>
            ) : null}

            {leaderFullName ? (
              <Text style={styles.leader} numberOfLines={1}>
                <Text style={{ fontWeight: '700' }}>Leader:</Text> {leaderFullName}
              </Text>
            ) : null}
          </View>
        ) : null}
      </Pressable>
    </View>
  );
});

export default EmployeeCard;

const styles = StyleSheet.create({
  card: {
    width: '90%',
    alignSelf: 'center',
    backgroundColor: Colors.surfaceColor,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  headerName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.mainTextColor,
    marginRight: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleBadge: {
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.mainTextColor,
    letterSpacing: 0.3,
  },
  optionsHint: {
    fontSize: 18,
    color: Colors.mainTextColor,
    opacity: 0.6,
    fontWeight: '900',
    lineHeight: 18,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  bodyLeft: {
    flex: 1,
    gap: 6,
  },
  bodyRight: {
    flexShrink: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 4,
    maxWidth: '60%',
  },
  teamRow: {
    flexDirection: 'row',
  },
  teamBadge: {
    backgroundColor: Colors.backgroundColor,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  teamBadgeText: {
    fontSize: 12,
    color: Colors.mainTextColor,
    fontWeight: '600',
  },
  email: {
    fontSize: 13,
    color: Colors.textColor,
    opacity: 0.8,
  },
  skillCount: {
    fontSize: 12,
    color: Colors.textColor,
    opacity: 0.7,
  },
  tutor: {
    fontSize: 12,
    color: Colors.textColor,
    opacity: 0.8,
    textAlign: 'right',
  },
  leader: {
    fontSize: 12,
    color: Colors.textColor,
    opacity: 0.8,
    textAlign: 'right',
  },

});