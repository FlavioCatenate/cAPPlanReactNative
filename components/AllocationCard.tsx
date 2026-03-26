import { View, Text, StyleSheet, Pressable } from 'react-native';
import Colors from '../constants/colors';
import Typography from '../constants/typography';

interface AllocationCardProps {
  title: string;
  projectName: string;
  dateStart: string;
  dateEnd: string;
  percentage: number;
  color?: string;
  onPressDetail: () => void;
  onPressOptions: () => void;
}

export default function AllocationCard({
  title,
  projectName,
  dateStart,
  dateEnd,
  percentage,
  color = Colors.primary,
  onPressDetail,
  onPressOptions,
}: AllocationCardProps) {
  return (
    <View style={styles.card}>

      {/* Zona superiore */}
      <Pressable
        style={[styles.upperCard, { backgroundColor: color }]}
        onPress={onPressOptions}
        android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
      >
        <View style={styles.upperLeft}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
        </View>
        <View style={styles.upperRight}>
          <Text style={styles.ellipsis}>⋯</Text>
        </View>
      </Pressable>

      {/* Zona inferiore */}
      <Pressable
        style={styles.lowerCard}
        onPress={onPressDetail}
        android_ripple={{ color: 'rgba(0,0,0,0.05)' }}
      >
        <View style={styles.lowerLeft}>
          <Text style={styles.description} numberOfLines={2}>{projectName}</Text>
          <Text style={[styles.description, styles.percentage]}>{percentage}%</Text>
        </View>
        <View style={styles.lowerRight}>
          <Text style={styles.description}>
            from: <Text style={styles.boldText}>{dateStart}</Text>
            {'\n'}
            to: <Text style={styles.boldText}>{dateEnd}</Text>
          </Text>
        </View>
      </Pressable>

    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceColor,
    borderRadius: Typography.borderRadius,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    marginBottom: 20,
  },
  upperCard: {
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  upperLeft: {
    flex: 1,
    paddingLeft: 12,
    marginRight: 5,
  },
  upperRight: {
    paddingRight: 15,
  },
  lowerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 20,
    paddingTop: 12,
    alignItems: 'center',
    gap: 12,
  },
  lowerLeft: {
    flex: 1,
    paddingLeft: 12,
  },
  lowerRight: {
    flex: 1,
    paddingLeft: 20,
    alignItems: 'flex-end',
    paddingRight: 12,
  },
  title: {
    ...Typography.title,
    marginLeft: 5,
    paddingVertical: 4,
    letterSpacing: 0.6,
  },
  description: {
    ...Typography.body,
    color: Colors.textColor,
    lineHeight: 18,
    letterSpacing: 0.6,
  },
  boldText: {
    fontWeight: '600',          
    color: Colors.mainTextColor,
  },
  ellipsis: {
    fontSize: 25,
    fontWeight: '900',          
    color: Colors.textColor,
  },
  percentage: {
    fontWeight: '600',
    color: Colors.mainTextColor,
    marginTop: 4,
  },
});