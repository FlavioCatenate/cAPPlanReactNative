import { View, Text, StyleSheet, Pressable } from "react-native";
import { useMemo } from "react";
import { useAppSelector } from "../../store/hooks";
import {
  selectAllocations,
  type Allocation,
} from "../../store/slices/allocationSlice";
import { getAllocationStatus, getStatusColor } from "../../utils/allocationColors";
import Colors from "../../constants/colors";

export default function AllocationDetailScreen({ route, navigation }: any) {
  const allocationId: number | undefined = route?.params?.allocationId;
  const allocations = useAppSelector(selectAllocations);

  const allocation = useMemo<Allocation | undefined>(() => {
    if (typeof allocationId !== "number") return undefined;
    return allocations.find((item) => item.id === allocationId);
  }, [allocationId, allocations]);

  if (!allocation) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFoundText}>Allocation non trovata.</Text>
      </View>
    );
  }

  const headerColor = getStatusColor(getAllocationStatus(allocation));

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={[styles.upperCard, { backgroundColor: headerColor }]}>
          <Text style={styles.title} numberOfLines={1}>
            {allocation.employee?.name} {allocation.employee?.surname}
          </Text>
        </View>

        <View style={styles.lowerCard}>
          <Text style={styles.label}>Project</Text>
          <Text style={styles.fieldValue}>{allocation.project?.name ?? "N/A"}</Text>

          <Text style={styles.label}>Period</Text>
          <Text style={styles.fieldValue}>
            {allocation.fromDate} - {allocation.toDate}
          </Text>

          <Text style={styles.label}>Percentage</Text>
          <Text style={styles.fieldValue}>{allocation.percentage}%</Text>

          <Text style={styles.label}>Sales Rate</Text>
          <Text style={styles.fieldValue}>
            {allocation.salesRate ? `${allocation.salesRate} €/h` : "N/A"}
          </Text>

          <Text style={styles.label}>Fixed Price</Text>
          <Text style={[styles.fieldValue, { marginBottom: 10 }]}>
            {allocation.isFixedPrice ? "Yes" : "No"}
          </Text>
        </View>
      </View>
      <Pressable
        onPress={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
            return;
          }

          navigation.navigate("AllocationPlanning");
        }}
      >
        <Text
          style={{
            color: Colors.mainTextColor,
            textAlign: "center",
            paddingVertical: 12,
          }}
        >
          Go Back
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundColor,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.backgroundColor,
  },
  notFoundText: {
    color: Colors.mainTextColor,
    fontSize: 16,
    fontWeight: "600",
  },
  card: {
    backgroundColor: Colors.surfaceColor,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  upperCard: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.mainTextColor,
  },
  lowerCard: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 6,
  },
  label: {
    fontSize: 12,
    color: Colors.textColor,
    opacity: 0.8,
    marginTop: 6,
  },
  fieldValue: {
    color: Colors.mainTextColor,
    fontWeight: "600",
    fontSize: 15,
  },
});
