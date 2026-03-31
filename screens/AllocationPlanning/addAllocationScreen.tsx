import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useEffect, useState } from "react";
import { Picker } from "@react-native-picker/picker";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchEmployees,
  selectEmployees,
  selectEmployeesStatus,
} from "../../store/slices/employeeSlice";
import {
  fetchProjects,
  selectProjects,
  selectProjectsStatus,
} from "../../store/slices/projectSlice";
import {
  createAllocationThunk,
  fetchAllocations,
} from "../../store/slices/allocationSlice";
import DatePickerInput from "../../components/DatePickerInput";
import Colors from "../../constants/colors";
import Typography from "../../constants/typography";

export default function AddAllocationScreen({ navigation }: any) {
  const dispatch = useAppDispatch();

  const employees = useAppSelector(selectEmployees);
  const projects = useAppSelector(selectProjects);
  const employeesStatus = useAppSelector(selectEmployeesStatus);
  const projectsStatus = useAppSelector(selectProjectsStatus);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(
    null,
  );
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null,
  );
  const [percentage, setPercentage] = useState("");
  const [isFixedPrice, setIsFixedPrice] = useState(false);
  const [salesRate, setSalesRate] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigateBackToPlanning = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate("AllocationPlanning");
  };

  useEffect(() => {
    // Carica solo se la lista è vuota — evita refetch inutili
    if (employees.length === 0) dispatch(fetchEmployees());
    if (projects.length === 0) dispatch(fetchProjects());
  }, [dispatch, employees.length, projects.length]);

  const isLoading =
    employeesStatus === "loading" || projectsStatus === "loading";

  const handleSubmit = async () => {
    if (!selectedEmployeeId || !selectedProjectId) {
      Alert.alert("Errore", "Seleziona un employee e un progetto.");
      return;
    }
    const pct = parseInt(percentage, 10);
    if (isNaN(pct) || pct < 1 || pct > 100) {
      Alert.alert("Errore", "La percentuale deve essere tra 1 e 100.");
      return;
    }
    if (!fromDate || !toDate) {
      Alert.alert("Errore", "Inserisci le date di inizio e fine.");
      return;
    }

    setSubmitting(true);
    const result = await dispatch(
      createAllocationThunk({
        employee: { id: selectedEmployeeId } as any,
        project: { id: selectedProjectId } as any,
        percentage: pct,
        salesRate: salesRate ? parseFloat(salesRate) : undefined,
        isFixedPrice,
        fromDate,
        toDate,
      }),
    );

    setSubmitting(false);

    if (createAllocationThunk.fulfilled.match(result)) {
      await dispatch(fetchAllocations());
      navigateBackToPlanning();
    } else {
      Alert.alert("Errore", "Creazione fallita. Riprova.");
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.label}>Employee</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={selectedEmployeeId}
          onValueChange={(val) => setSelectedEmployeeId(val)}
        >
          <Picker.Item label="Seleziona un employee..." value={null} />
          {employees.map((e) => (
            <Picker.Item
              key={e.id}
              label={`${e.surname} ${e.name}`}
              value={e.id}
            />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Progetto</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={selectedProjectId}
          onValueChange={(val) => setSelectedProjectId(val)}
        >
          <Picker.Item label="Seleziona un progetto..." value={null} />
          {projects.map((p) => (
            <Picker.Item key={p.id} label={p.name} value={p.id} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Percentuale (%)</Text>
      <TextInput
        style={styles.input}
        value={percentage}
        onChangeText={setPercentage}
        keyboardType="numeric"
        placeholder="es. 80"
        maxLength={3}
      />

      <Text style={styles.label}>Sales Rate (€ / h)</Text>
      <TextInput
        style={styles.input}
        value={salesRate}
        onChangeText={setSalesRate}
        keyboardType="numeric"
        placeholder="es. 50"
      />
      <Text style={styles.label}>Fixed Price</Text>
      <Pressable
        style={[
          styles.fixedPriceButtonNo,
          isFixedPrice && styles.fixedPriceButtonYes,
        ]}
        onPress={() => setIsFixedPrice(!isFixedPrice)}
      >
        <Text style={styles.fixedPriceText}>{isFixedPrice ? "Yes" : "No"}</Text>
      </Pressable>

      <Text style={styles.label}>Data inizio (YYYY-MM-DD)</Text>
      <DatePickerInput
        label="Data inizio"
        value={fromDate}
        onChange={setFromDate}
      />

      <Text style={styles.label}>Data fine (YYYY-MM-DD)</Text>
      <DatePickerInput
        label="Data fine"
        value={toDate}
        onChange={setToDate}
      />
      <View>
        <Pressable
          style={[styles.submitButton, submitting && styles.submitDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.submitText}>
            {submitting ? "Salvataggio..." : "Crea Allocation"}
          </Text>
        </Pressable>
        <Pressable onPress={navigateBackToPlanning}>
          <Text
            style={{
              color: Colors.mainTextColor,
              textAlign: "center",
              paddingVertical: 18,
            }}
          >
            Annulla
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundColor,
  },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.backgroundColor,
  },
  label: {
    ...Typography.body,
    fontWeight: "600",
    color: Colors.mainTextColor,
    marginBottom: 6,
    marginTop: 16,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: Colors.backgroundColor,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: Colors.surfaceColor,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.backgroundColor,
    borderRadius: 8,
    padding: 12,
    backgroundColor: Colors.surfaceColor,
    color: Colors.mainTextColor,
    fontSize: 15,
  },
  fixedPriceButtonNo: {
    marginTop: 12,
    backgroundColor: Colors.errorColor,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  fixedPriceButtonYes: {
    backgroundColor: Colors.successColor,
  },
  fixedPriceText: {
    color: Colors.surfaceColor,
    fontWeight: "600",
    fontSize: 16,
  },
  submitButton: {
    marginTop: 22,
    backgroundColor: Colors.secondaryGray,
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  submitDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
