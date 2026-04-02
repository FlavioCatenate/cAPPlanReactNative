import { memo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Colors from "../constants/colors";
import Typography from "../constants/typography";

interface AllocationCardProps {
  title: string;
  projectName: string;
  dateStart: string;
  dateEnd: string;
  percentage: number;
  color?: string;
  isFixedPrice?: boolean;
  salesRate?: number;
  onPressDetail: () => void;
  onPressOptions: () => void;
}

function AllocationCard({
  title,
  projectName,
  dateStart,
  dateEnd,
  percentage,
  color = Colors.primary,
  isFixedPrice,
  salesRate,
  onPressDetail,
  onPressOptions,
}: AllocationCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.upperCard, { backgroundColor: color }]}>
        {/* Zona superiore */}

        <View style={styles.upperLeft}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>
        <Pressable
          onPress={onPressOptions}
          android_ripple={{ color: "rgba(0,0,0,0.1)" }}
        >
          <View style={styles.upperRight}>
            <Text style={styles.ellipsis}>⋯</Text>
          </View>
        </Pressable>
      </View>

      {/* Zona inferiore */}
      <Pressable
        style={styles.lowerCard}
        onPress={onPressDetail}
        android_ripple={{ color: "rgba(0,0,0,0.05)" }}
      >
        <View style={styles.lowerLeft}>
          <Text style={styles.description} numberOfLines={3}>
            {projectName}
          </Text>
        </View>
        <View style={styles.lowerRight}>
          <Text style={[styles.description, { textAlign: "right" }]}>
            from: <Text style={[styles.boldText]}>{dateStart}</Text>
            {"\n"}
            to: <Text style={[styles.boldText]}>{dateEnd}</Text>
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

export default memo(AllocationCard, (prev, next) => {
  return (
    prev.title === next.title &&
    prev.projectName === next.projectName &&
    prev.dateStart === next.dateStart &&
    prev.dateEnd === next.dateEnd &&
    prev.percentage === next.percentage &&
    prev.color === next.color &&
    prev.isFixedPrice === next.isFixedPrice &&
    prev.salesRate === next.salesRate
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceColor,
    borderRadius: Typography.borderRadius,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
    width: "90%",
    alignItems: "center",
    alignSelf: "center",
  },
  upperCard: {
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 20,
    paddingTop: 15,
    alignItems: "center",
    gap: 12,
  },
  lowerLeft: {
    flex: 1,
    paddingLeft: 15,
    alignItems: "center",
  },
  lowerRight: {
    flex: 1,
    paddingLeft: 20,
    alignItems: "center",
    textAlign: "right",
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
    fontWeight: "600",
    color: Colors.mainTextColor,
  },
  ellipsis: {
    fontSize: 25,
    fontWeight: "900",
    color: Colors.textColor,
  },
  percentage: {
    fontWeight: "600",
    color: Colors.mainTextColor,
    marginTop: 4,
  },
});
