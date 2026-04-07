import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { useMemo } from "react";
import { useAppSelector } from "../../store/hooks";
import { selectProjects, type Project } from "../../store/slices/projectSlice";
import { getProjectStatus, getProjectStatusColor } from "../../utils/projectColors";
import Colors from "../../constants/colors";

export default function ProjectDetailScreen({ route, navigation }: any) {
  const projectId: number | undefined = route?.params?.projectId;
  const projects = useAppSelector(selectProjects);

  const project = useMemo<Project | undefined>(
    () =>
      typeof projectId === "number"
        ? projects.find((p) => p.id === projectId)
        : undefined,
    [projectId, projects]
  );

  if (!project) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFoundText}>Progetto non trovato.</Text>
      </View>
    );
  }

  const headerColor = getProjectStatusColor(getProjectStatus(project.isActive, project.toDate));

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.card}>
        <View style={[styles.header, { backgroundColor: headerColor }]}>
          <Text style={styles.title} numberOfLines={2}>
            {project.name}
          </Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.label}>Descrizione</Text>
          <Text style={styles.value}>
            {project.description || "Nessuna descrizione disponibile."}
          </Text>

          <Text style={styles.label}>From Date</Text>
          <Text style={styles.value}>{project.fromDate || "N/A"}</Text>

          <Text style={styles.label}>To Date</Text>
          <Text style={styles.value}>{project.toDate || "N/A"}</Text>

          <Text style={styles.label}>Type</Text>
          <Text style={styles.value}>{project.type || "N/A"}</Text>

          <Text style={styles.label}>Is Active</Text>
          <Text style={styles.value}>{project.isActive ? "Sì" : "No"}</Text>

          <Text style={styles.label}>Fixed Price</Text>
          <Text style={styles.value}>
            {project.fixedPrice != null ? `${project.fixedPrice} €` : "N/A"}
          </Text>

          <Text style={styles.label}>Project ID KPI</Text>
          <Text style={styles.value}>
            {project.projectIdKpi || "N/A"}
          </Text>
        </View>
      </View>

      <Pressable
        onPress={() => {
          if (navigation.canGoBack()) navigation.goBack();
          else navigation.navigate("ProjectList");
        }}
      >
        <Text style={styles.backText}>Torna indietro</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundColor },
  content: { padding: 20, paddingBottom: 40 },
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
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: Colors.mainTextColor,
  },
  body: { paddingHorizontal: 16, paddingVertical: 16, gap: 4 },
  label: {
    fontSize: 12,
    color: Colors.textColor,
    opacity: 0.8,
    marginTop: 10,
  },
  value: {
    color: Colors.mainTextColor,
    fontWeight: "600",
    fontSize: 15,
  },
  backText: {
    color: Colors.mainTextColor,
    textAlign: "center",
    paddingVertical: 12,
  },
});
