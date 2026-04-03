import { View, Text, StyleSheet } from 'react-native';
import { memo } from 'react';
import Colors from '../constants/colors';

interface SkillBadgeProps {
  name: string;
  /** Variante visiva — 'default' per liste, 'prominent' per dettaglio */
  variant?: 'default' | 'prominent';
}

const SkillBadge = memo(function SkillBadge({
  name,
  variant = 'default',
}: SkillBadgeProps) {
  return (
    <View style={[styles.badge, variant === 'prominent' && styles.badgeProminent]}>
      <Text
        style={[
          styles.text,
          variant === 'prominent' && styles.textProminent,
        ]}
        numberOfLines={1}
      >
        {name}
      </Text>
    </View>
  );
});

export default SkillBadge;

const styles = StyleSheet.create({
  badge: {
    backgroundColor: Colors.backgroundColor,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.secondaryGray + '40',
  },
  badgeProminent: {
    backgroundColor: Colors.primary + '18',
    borderColor: Colors.primary + '50',
  },
  text: {
    fontSize: 12,
    color: Colors.mainTextColor,
    fontWeight: '500',
  },
  textProminent: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
});