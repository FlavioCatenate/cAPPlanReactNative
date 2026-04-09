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
import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  createSkillThunk,
  fetchSkills,
  selectSkills,
  selectSkillsHasBeenFetched,
} from '../../store/slices/skillSlice';
import Colors from '../../constants/colors';
import { formStyles } from '../../constants/formStyles';

export default function DuplicateSkillScreen({ route, navigation }: any) {
  const dispatch = useAppDispatch();
  const skillId: number | undefined = route?.params?.skillId;

  const skills = useAppSelector(selectSkills);
  const hasBeenFetched = useAppSelector(selectSkillsHasBeenFetched);

  const source = useMemo(
    () => skills.find((s) => s.id === skillId),
    [skills, skillId]
  );

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!hasBeenFetched) dispatch(fetchSkills());
  }, [dispatch, hasBeenFetched]);

  useEffect(() => {
    if (!source) return;
    setName(source.name ?? '');
    setDescription(source.description ?? '');
  }, [source]);

  const navigateBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('SkillList');
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'The skill name is required.');
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
          placeholder="e.g. React Native"
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
        />

        <Pressable
          style={[formStyles.submitButton, submitting && formStyles.submitDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={formStyles.submitText}>
            {submitting ? 'Saving...' : 'Create Duplicate Skill'}
          </Text>
        </Pressable>
        <Pressable onPress={navigateBack}>
          <Text style={formStyles.cancelText}>Cancel</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
