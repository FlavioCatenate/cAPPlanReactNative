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
      Alert.alert('Error', 'Skill name is required.');
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
 
        <View style={formStyles.actions}>
          <Pressable
            style={[formStyles.submitButton, submitting && formStyles.submitDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Text style={formStyles.submitText}>
              {submitting ? 'Saving...' : 'Create Skill'}
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

