import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import { useAppDispatch } from '../../store/hooks';
import { createProjectThunk } from '../../store/slices/projectSlice';
import DatePickerInput from '../../components/DatePickerInput';
import { formStyles } from '../../constants/formStyles';
import Colors from '../../constants/colors';

const PROJECT_TYPES = ['PROJECT', 'INTERNAL', 'PRESALE', 'OTHER'];

export default function AddProjectScreen({ navigation }: any) {
  const dispatch = useAppDispatch();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('PROJECT');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [fixedPrice, setFixedPrice] = useState('');
  const [projectIdKpi, setProjectIdKpi] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const navigateBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('ProjectList');
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Errore', 'Il nome del progetto è obbligatorio.');
      return;
    }
    if (!fromDate || !toDate) {
      Alert.alert('Errore', 'Inserisci le date di inizio e fine.');
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
      Alert.alert('Errore', 'Creazione fallita. Riprova.');
    }
  };

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
        <Text style={formStyles.label}>Nome *</Text>
        <TextInput
          style={formStyles.input}
          value={name}
          onChangeText={setName}
          placeholder="es. Progetto Alpha"
          autoCapitalize="words"
        />

        <Text style={formStyles.label}>Descrizione</Text>
        <TextInput
          style={[formStyles.input, formStyles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Descrizione opzionale..."
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={formStyles.label}>Type</Text>
        <View style={styles.pickerWrapper}>
          <Picker selectedValue={type} onValueChange={(val) => setType(val)}>
            {PROJECT_TYPES.map((t) => (
              <Picker.Item key={t} label={t} value={t} />
            ))}
          </Picker>
        </View>

        <Text style={formStyles.label}>Data inizio *</Text>
        <DatePickerInput label="Data inizio" value={fromDate} onChange={setFromDate} />

        <Text style={formStyles.label}>Data fine *</Text>
        <DatePickerInput label="Data fine" value={toDate} onChange={setToDate} />

        <Text style={formStyles.label}>Is Active</Text>
        <Pressable
          style={[
            styles.toggleButtonNo,
            isActive && styles.toggleButtonYes,
          ]}
          onPress={() => setIsActive(!isActive)}
        >
          <Text style={styles.toggleText}>{isActive ? 'Sì' : 'No'}</Text>
        </Pressable>

        <Text style={formStyles.label}>Fixed Price (€)</Text>
        <TextInput
          style={formStyles.input}
          value={fixedPrice}
          onChangeText={setFixedPrice}
          keyboardType="numeric"
          placeholder="es. 50000"
        />

        <Text style={formStyles.label}>Project ID KPI</Text>
        <TextInput
          style={formStyles.input}
          value={projectIdKpi}
          onChangeText={setProjectIdKpi}
          placeholder="es. KPI-001"
          autoCapitalize="characters"
        />

        <View style={formStyles.actions}>
          <Pressable
            style={[formStyles.submitButton, submitting && formStyles.submitDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Text style={formStyles.submitText}>
              {submitting ? 'Salvataggio...' : 'Crea Progetto'}
            </Text>
          </Pressable>
          <Pressable onPress={navigateBack}>
            <Text style={formStyles.cancelText}>Annulla</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = {
  pickerWrapper: {
    borderWidth: 1,
    borderColor: Colors.backgroundColor,
    borderRadius: 8,
    backgroundColor: Colors.surfaceColor,
    overflow: 'hidden' as const,
  },
  toggleButtonNo: {
    marginTop: 4,
    backgroundColor: Colors.errorColor,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center' as const,
  },
  toggleButtonYes: {
    backgroundColor: Colors.successColor,
  },
  toggleText: {
    color: Colors.surfaceColor,
    fontWeight: '600' as const,
    fontSize: 16,
  },
};
