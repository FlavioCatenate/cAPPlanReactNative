import { memo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Colors from "../constants/colors";
import Typography from "../constants/typography";
import { getProjectStatus, getProjectStatusColor } from "../utils/projectColors";

interface ProjectCardProps {
  name: string;
  description: string;
  type?: string;
  fromDate: string;
  toDate: string;
  isActive: boolean;
  onPressDetail: () => void;
  onPressOptions: () => void;
}

function ProjectCard({
  name,
  description,
  type,
  fromDate,
  toDate,
  isActive,
  onPressDetail,
  onPressOptions,
}: ProjectCardProps) {
  const color = getProjectStatusColor(getProjectStatus(isActive, toDate));
  return (
    <View style={styles.card}>
      {/* Zona superiore */}
      <View style={[styles.upperCard, { backgroundColor: color }]}>
        <View style={styles.upperLeft}>
          <Text style={styles.title} numberOfLines={1}>
            {name}
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
          {type ? (
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{type}</Text>
            </View>
          ) : null}
          <Text style={styles.description} numberOfLines={3}>
            {description || "No description provided."}
          </Text>
        </View>
        <View style={styles.lowerRight}>
          <Text style={[styles.description, { textAlign: "right" }]}>
            from: <Text style={styles.boldText}>{fromDate}</Text>
            {"\n"}
            to: <Text style={styles.boldText}>{toDate}</Text>
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

export default memo(ProjectCard, (prev, next) => {
  return (
    prev.name === next.name &&
    prev.description === next.description &&
    prev.type === next.type &&
    prev.fromDate === next.fromDate &&
    prev.toDate === next.toDate &&
    prev.isActive === next.isActive
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
    width: "100%",
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
    width: "100%",
  },
  lowerLeft: {
    flex: 1,
    paddingLeft: 15,
    gap: 6,
  },
  lowerRight: {
    flex: 1,
    paddingLeft: 20,
    alignItems: "center",
    textAlign: "right" as const,
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
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.backgroundColor,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  typeBadgeText: {
    fontSize: 12,
    color: Colors.mainTextColor,
    fontWeight: '600',
  },
  ellipsis: {
    fontSize: 20,
    color: Colors.mainTextColor,
    fontWeight: "bold",
  },
});
