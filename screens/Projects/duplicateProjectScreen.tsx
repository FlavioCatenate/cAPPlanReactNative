import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  createProjectThunk,
  fetchProjects,
  selectProjects,
  selectProjectsHasBeenFetched,
  selectDistinctProjectTypes,
} from '../../store/slices/projectSlice';
import DatePickerInput from '../../components/DatePickerInput';
import { formStyles } from '../../constants/formStyles';
import Colors from '../../constants/colors';
import { StyleSheet } from 'react-native';

export default function DuplicateProjectScreen({ route, navigation }: any) {
  const dispatch = useAppDispatch();
  const projectId: number | undefined = route?.params?.projectId;

  const projects = useAppSelector(selectProjects);
  const projectsHasBeenFetched = useAppSelector(selectProjectsHasBeenFetched);
  const projectTypes = useAppSelector(selectDistinctProjectTypes);

  const source = useMemo(
    () => projects.find((p) => p.id === projectId),
    [projects, projectId]
  );

  // Safety-net: se il tipo della sorgente non è nella lista, aggiungilo
  const pickerTypes = useMemo(() => {
    const currentType = source?.type;
    if (!currentType || projectTypes.includes(currentType)) return projectTypes;
    return [currentType, ...projectTypes];
  }, [projectTypes, source?.type]);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [fixedPrice, setFixedPrice] = useState('');
  const [projectIdKpi, setProjectIdKpi] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!projectsHasBeenFetched) dispatch(fetchProjects());
  }, [dispatch, projectsHasBeenFetched]);

  useEffect(() => {
    if (!source) return;
    setName(source.name ?? '');
    setDescription(source.description ?? '');
    setType(source.type ?? '');
    setFromDate(source.fromDate ?? '');
    setToDate(source.toDate ?? '');
    setIsActive(source.isActive ?? true);
    setFixedPrice(source.fixedPrice != null ? String(source.fixedPrice) : '');
    setProjectIdKpi(source.projectIdKpi ?? '');
  }, [source]);

  const navigateBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('ProjectList');
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'The project name is required.');
      return;
    }
    if (!fromDate || !toDate) {
      Alert.alert('Error', 'Please enter the start and end dates.');
      return;
    }

    setSubmitting(true);
    const result = await dispatch(
      createProjectThunk({
        name: name.trim(),
        description: description.trim(),
        type,
        fromDate,
        toDate,
        isActive,
        fixedPrice: fixedPrice ? parseFloat(fixedPrice) : 0,
        projectIdKpi: projectIdKpi.trim(),
      })
    );
    setSubmitting(false);

    if (createProjectThunk.fulfilled.match(result)) {
      navigateBack();
    } else {
      Alert.alert('Error', 'Creation failed. Please try again.');
    }
  };

  if (!source) {
    return (
      <View style={formStyles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={formStyles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={formStyles.container}
        contentContainerStyle={formStyles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={formStyles.label}>Name *</Text>
        <TextInput
          style={formStyles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Project Alpha"
          autoCapitalize="words"
        />

        <Text style={formStyles.label}>Description</Text>
        <TextInput
          style={[formStyles.input, formStyles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Optional description..."
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={formStyles.label}>Type</Text>
        <View style={styles.pickerWrapper}>
          <Picker selectedValue={type} onValueChange={(val) => setType(val)}>
            <Picker.Item label="Select a type..." value="" />
            {pickerTypes.map((t) => (
              <Picker.Item key={t} label={t} value={t} />
            ))}
          </Picker>
        </View>

        <Text style={formStyles.label}>Start Date *</Text>
        <DatePickerInput label="Start Date" value={fromDate} onChange={setFromDate} />

        <Text style={formStyles.label}>End Date *</Text>
        <DatePickerInput label="End Date" value={toDate} onChange={setToDate} />

        <Text style={formStyles.label}>Is Active</Text>
        <Pressable
          style={[styles.toggleButtonNo, isActive && styles.toggleButtonYes]}
          onPress={() => setIsActive(!isActive)}
        >
          <Text style={styles.toggleText}>{isActive ? 'Yes' : 'No'}</Text>
        </Pressable>

        <Text style={formStyles.label}>Fixed Price (€)</Text>
        <TextInput
          style={formStyles.input}
          value={fixedPrice}
          onChangeText={setFixedPrice}
          keyboardType="decimal-pad"
          placeholder="es. 10000"
        />

        <Text style={formStyles.label}>Project ID KPI</Text>
        <TextInput
          style={formStyles.input}
          value={projectIdKpi}
          onChangeText={setProjectIdKpi}
          placeholder="es. PRJ-001"
          autoCapitalize="none"
        />

        <Pressable
          style={[styles.submitButton, submitting && formStyles.submitDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={formStyles.submitText}>
            {submitting ? 'Saving...' : 'Create Duplicate Project'}
          </Text>
        </Pressable>
        <Pressable onPress={navigateBack}>
          <Text style={formStyles.cancelText}>Cancel</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  pickerWrapper: {
    borderWidth: 1,
    borderColor: Colors.backgroundColor,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceColor,
  },
  toggleButtonNo: {
    marginTop: 12,
    backgroundColor: Colors.errorColor,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleButtonYes: {
    backgroundColor: Colors.successColor,
  },
  toggleText: {
    color: Colors.surfaceColor,
    fontWeight: '600',
    fontSize: 16,
  },
  submitButton: {
    marginTop: 22,
    backgroundColor: Colors.secondaryGray,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
});
