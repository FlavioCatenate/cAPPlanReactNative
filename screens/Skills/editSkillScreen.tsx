import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  updateSkillThunk,
  fetchSkills,
  selectSkills,
  selectSkillsStatus,
} from '../../store/slices/skillSlice';
import { formStyles } from '../../constants/formStyles';
import Colors from '../../constants/colors';
export default function EditSkillScreen({ route, navigation }: any) {
  const dispatch = useAppDispatch();
  const skillId: number | undefined = route?.params?.skillId;
 
  const skills = useAppSelector(selectSkills);
  const skill = useMemo(
    () => skills.find((s) => s.id === skillId),
    [skills, skillId]
  );
 
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
 
  useEffect(() => {
    if (!skill) return;
    setName(skill.name ?? '');
    setDescription(skill.description ?? '');
  }, [skill]);
 
  const navigateBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('SkillList');
  };
 
  const handleSubmit = async () => {
    if (!skillId) {
      Alert.alert('Errore', 'Skill non trovata.');
      return;
    }
    if (!name.trim()) {
      Alert.alert('Errore', 'Il nome della skill è obbligatorio.');
      return;
    }
 
    setSubmitting(true);
    const result = await dispatch(
      updateSkillThunk({
        id: skillId,
        data: {
          id: skillId,
          name: name.trim(),
          description: description.trim() || undefined,
        },
      })
    );
    setSubmitting(false);
 
    if (updateSkillThunk.fulfilled.match(result)) {
      navigateBack();
    } else {
      const msg =
        typeof result.payload === 'string' && result.payload.trim()
          ? result.payload
          : 'Aggiornamento fallito. Riprova.';
      Alert.alert('Errore', msg);
    }
  };
 
  if (!skill) {
    return (
      <View style={formStyles.centered}>
        <Text style={{ color: Colors.mainTextColor }}>Skill non trovata.</Text>
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
        <Text style={formStyles.label}>Nome *</Text>
        <TextInput
          style={formStyles.input}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
 
        <Text style={formStyles.label}>Descrizione</Text>
        <TextInput
          style={[formStyles.input, formStyles.textArea]}
          value={description}
          onChangeText={setDescription}
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
              {submitting ? 'Salvataggio...' : 'Salva modifiche'}
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
