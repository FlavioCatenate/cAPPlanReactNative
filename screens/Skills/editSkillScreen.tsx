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
      Alert.alert('Error', 'Skill not found.');
      return;
    }
    if (!name.trim()) {
      Alert.alert('Error', 'Skill name is required.');
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
          : 'Update failed. Please try again.';
      Alert.alert('Error', msg);
    }
  };
 
  if (!skill) {
    return (
      <View style={formStyles.centered}>
        <Text style={{ color: Colors.mainTextColor }}>Skill not found.</Text>
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
          autoCapitalize="words"
        />
 
        <Text style={formStyles.label}>Description</Text>
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
              {submitting ? 'Saving...' : 'Save Changes'}
            </Text>
          </Pressable>
          <Pressable onPress={navigateBack}>
            <Text style={formStyles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
