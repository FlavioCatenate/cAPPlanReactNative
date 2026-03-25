import { View, Text, StyleSheet, Pressable } from "react-native";
import Colors from "../constants/colors";
import Typography from "../constants/typography";

export default function Card({
  title,
  description,
  color = Colors.primary,
  projectName,
  dateStart,
  dateEnd,
}: {
  title: string;
  color?: string;
  description: string;
  projectName: string;
  dateStart: string;
  dateEnd: string;
}) {
  return (
    <View style={styles.card}>
      <View style={[styles.upperCard, { backgroundColor: color }]}>
        <View style={styles.upperLeft}>
            <Text style={styles.title}>{title}</Text>
        </View>
        <View style={styles.upperRight}>
            <Text style={[styles.description, styles.boldText, styles.ellipsis]}>⋯</Text>
        </View>
      </View>
      <View style={styles.lowerCard}>
        <View style={styles.lowerLeft}>
          <Text style={styles.description}>{projectName}</Text>
        </View>
        <View style={styles.lowerRight}>
          <Text style={styles.description}>
            from{" "}
            <Text style={[styles.description, styles.boldText]}>
              {dateStart}
            </Text>{" "}
            {'\n'}
            to{" "}
            <Text style={[styles.description, styles.boldText]}>{dateEnd}</Text>
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceColor,
    minWidth: "85%",
    borderRadius: Typography.borderRadius,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
    marginBottom: 20,
  },
  upperCard: {
    flex: 1,
    paddingVertical: 6,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
  },
  upperRight: {
    maxWidth: "20%",
    flex: 1,
    alignItems: "flex-end",
    paddingRight: 15,
  },
  upperLeft: {
    flex: 1,
    maxWidth: "60%",
    marginRight: 5,
    paddingLeft: 12,
  },
  lowerCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 20,
    paddingTop: 12,
    alignItems: "center",
    overflow: "hidden",
    gap: 12,
  },
  lowerLeft: {
    flex: 1,
    maxWidth: "45%",
    marginLeft: 5,
    alignSelf: "stretch",
    paddingLeft: 12,
  },
  lowerRight: {
    maxWidth: "50%",
    flex: 1,
    paddingLeft: 20,
    alignSelf: "flex-end",
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
    fontWeight: 600,
    color: Colors.mainTextColor,
  },
  ellipsis: {
    fontSize: 25,
    fontWeight: 900,
    color: Colors.textColor,
  },
});
