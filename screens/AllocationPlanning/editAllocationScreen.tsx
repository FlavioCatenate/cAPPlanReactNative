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
import { useEffect, useMemo, useState } from "react";
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
  fetchAllocations,
  selectAllocations,
  updateAllocationThunk,
} from "../../store/slices/allocationSlice";
import DatePickerInput from "../../components/DatePickerInput";
import Colors from "../../constants/colors";
import Typography from "../../constants/typography";

export default function EditAllocationScreen({ route, navigation }: any) {
  const dispatch = useAppDispatch();

  const allocationId: number | undefined = route?.params?.allocationId;

  const allocations = useAppSelector(selectAllocations);
  const employees = useAppSelector(selectEmployees);
  const projects = useAppSelector(selectProjects);
  const employeesStatus = useAppSelector(selectEmployeesStatus);
  const projectsStatus = useAppSelector(selectProjectsStatus);

  const allocation = useMemo(
    () => allocations.find((a) => a.id === allocationId),
    [allocations, allocationId],
  );

  // Safety-net: se l'employee/project dell'allocation non è nella lista (es. paginazione),
  // lo aggiungiamo manualmente così il picker mostra sempre il valore corrente.
  const pickerEmployees = useMemo(() => {
    const emp = allocation?.employee;
    if (!emp?.id || employees.some((e) => e.id === Number(emp.id)))
      return employees;
    return [
      { id: Number(emp.id), name: emp.name ?? "", surname: emp.surname ?? "" },
      ...employees,
    ];
  }, [employees, allocation?.employee]);

  const pickerProjects = useMemo(() => {
    const proj = allocation?.project;
    if (!proj?.id || projects.some((p) => p.id === Number(proj.id)))
      return projects;
    return [
      { id: Number(proj.id), name: proj.name ?? "", type: "", isActive: true },
      ...projects,
    ];
  }, [projects, allocation?.project]);

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

  const navigateBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate("AllocationPlanning");
  };

  useEffect(() => {
    if (employees.length === 0) dispatch(fetchEmployees());
    if (projects.length === 0) dispatch(fetchProjects());
  }, [dispatch, employees.length, projects.length]);

  // Pre-fill form once allocation and lists are available
  useEffect(() => {
    if (!allocation) return;
    setSelectedEmployeeId(
      allocation.employee?.id != null ? Number(allocation.employee.id) : null,
    );
    setSelectedProjectId(
      allocation.project?.id != null ? Number(allocation.project.id) : null,
    );
    setPercentage(String(allocation.percentage));
    setIsFixedPrice(allocation.isFixedPrice ?? false);
    setSalesRate(
      allocation.salesRate != null ? String(allocation.salesRate) : "",
    );
    setFromDate(allocation.fromDate ?? "");
    setToDate(allocation.toDate ?? "");
  }, [allocation]);

  const isLoading =
    employeesStatus === "loading" || projectsStatus === "loading";

  const handleSubmit = async () => {
    if (!allocationId) {
      Alert.alert("Error", "Allocation not found.");
      return;
    }
    if (!selectedEmployeeId || !selectedProjectId) {
      Alert.alert("Error", "Please select an employee and a project.");
      return;
    }
    const pct = parseInt(percentage, 10);
    if (isNaN(pct) || pct < 1 || pct > 100) {
      Alert.alert("Error", "The percentage must be between 1 and 100.");
      return;
    }
    if (!fromDate || !toDate) {
      Alert.alert("Error", "Please enter the start and end dates.");
      return;
    }

    setSubmitting(true);
    const result = await dispatch(
      updateAllocationThunk({
        id: allocationId,
        data: {
          id: allocationId,
          employee: { id: selectedEmployeeId } as any,
          project: { id: selectedProjectId } as any,
          percentage: pct,
          salesRate: salesRate ? parseFloat(salesRate) : undefined,
          isFixedPrice,
          fromDate,
          toDate,
        },
      }),
    );

    setSubmitting(false);

    if (updateAllocationThunk.fulfilled.match(result)) {
      await dispatch(fetchAllocations());
      navigateBack();
    } else {
      const errorMessage =
        typeof result.payload === "string" && result.payload.trim().length > 0
          ? result.payload
          : "Update failed. Please try again.";
      Alert.alert("Error", errorMessage);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!allocation) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: Colors.mainTextColor }}>
          Allocation not found.
        </Text>
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
          <Picker.Item label="Select an employee..." value={null} />
          {pickerEmployees.map((e) => (
            <Picker.Item
              key={e.id}
              label={`${e.surname} ${e.name}`}
              value={e.id}
            />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Project</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={selectedProjectId}
          onValueChange={(val) => setSelectedProjectId(val)}
        >
          <Picker.Item label="Select a project..." value={null} />
          {pickerProjects.map((p) => (
            <Picker.Item key={p.id} label={p.name} value={p.id} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Percentage (%)</Text>
      <TextInput
        style={styles.input}
        value={percentage}
        onChangeText={setPercentage}
        keyboardType="numeric"
        placeholder="e.g. 80"
        maxLength={3}
      />

      <Text style={styles.label}>Sales Rate (€ / h)</Text>
      <TextInput
        style={styles.input}
        value={salesRate}
        onChangeText={setSalesRate}
        keyboardType="numeric"
        placeholder="e.g. 50"
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

      <Text style={styles.label}>Start Date (YYYY-MM-DD)</Text>
      <DatePickerInput
        label="Start Date"
        value={fromDate}
        onChange={setFromDate}
      />

      <Text style={styles.label}>End Date (YYYY-MM-DD)</Text>
      <DatePickerInput
        label="End Date"
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
            {submitting ? "Saving..." : "Save Changes"}
          </Text>
        </Pressable>
        <Pressable onPress={navigateBack}>
          <Text
            style={{
              color: Colors.mainTextColor,
              textAlign: "center",
              paddingVertical: 18,
            }}
          >
            Cancel
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
