import {
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  Text,
  Pressable,
} from 'react-native';
import { useAppDispatch } from '../../store/hooks';
import { createSkillThunk } from '../../store/slices/skillSlice';
import Colors from '../../constants/colors';
import Typography from '../../constants/typography';
import { formStyles } from '../../constants/formStyles';
import { useState } from 'react';
 
export default function AddSkillScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
 
  const navigateBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('SkillList');
  };
 
  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Errore', 'Il nome della skill è obbligatorio.');
      return;
    }
    setSubmitting(true);
    const result = await dispatch(
      createSkillThunk({
        name: name.trim(),
        description: description.trim() || undefined,
      })
    );
    setSubmitting(false);
 
    if (createSkillThunk.fulfilled.match(result)) {
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
          placeholder="es. React Native"
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
        />
 
        <View style={formStyles.actions}>
          <Pressable
            style={[formStyles.submitButton, submitting && formStyles.submitDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Text style={formStyles.submitText}>
              {submitting ? 'Salvataggio...' : 'Crea Skill'}
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

