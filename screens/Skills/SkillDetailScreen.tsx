import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { useMemo } from "react";
import { useAppSelector } from "../../store/hooks";
import { selectSkills, type Skill } from "../../store/slices/skillSlice";
import Colors from "../../constants/colors";

export default function SkillDetailScreen({ route, navigation }: any) {
  const skillId: number | undefined = route?.params?.skillId;
  const skills = useAppSelector(selectSkills);

  const skill = useMemo<Skill | undefined>(
    () =>
      typeof skillId === "number"
        ? skills.find((s) => s.id === skillId)
        : undefined,
    [skillId, skills],
  );

  if (!skill) {
    return (
      <View style={detailStyles.centered}>
        <Text style={detailStyles.notFoundText}>Skill non trovata.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={detailStyles.container}
      contentContainerStyle={detailStyles.content}
    >
      <View style={detailStyles.card}>
        <View style={detailStyles.header}>
          <Text style={detailStyles.title} numberOfLines={1}>
            {skill.name}
          </Text>
        </View>

        <View style={detailStyles.body}>
          {skill.description ? (
            <>
              <Text style={detailStyles.label}>Descrizione</Text>
              <Text style={detailStyles.value}>{skill.description}</Text>
            </>
          ) : (
            <Text style={detailStyles.empty}>
              Nessuna descrizione disponibile.
            </Text>
          )}
        </View>
      </View>

      <Pressable
        onPress={() => {
          if (navigation.canGoBack()) navigation.goBack();
          else navigation.navigate("SkillList");
        }}
      >
        <Text style={detailStyles.backText}>Go Back</Text>
      </Pressable>
    </ScrollView>
  );
}

const detailStyles = StyleSheet.create({
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
    backgroundColor: Colors.lightGray,
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
  label: { fontSize: 12, color: Colors.textColor, opacity: 0.8, marginTop: 10 },
  value: {
    color: Colors.mainTextColor,
    fontWeight: "500",
    fontSize: 15,
    lineHeight: 22,
  },
  empty: { color: Colors.textColor, opacity: 0.6, fontSize: 14 },
  backText: {
    color: Colors.mainTextColor,
    textAlign: "center",
    paddingVertical: 12,
  },
});
