import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  createEmployeeThunk,
  fetchEmployees,
  selectEmployees,
  selectEmployeesHasBeenFetched,
} from '../../store/slices/employeeSlice';
import {
  fetchEmployeeTeams,
  fetchTeams,
  selectEmployeeRoleMap,
  selectEmployeeTeamHasBeenFetched,
  selectEmployeeTeamMap,
  selectTeams,
  selectTeamsHasBeenFetched,
} from '../../store/slices/employeeTeamSlice';
import { createEmployeeTeam } from '../../services/employeeTeamService';
import {
  fetchEmployeeSkills,
  selectEmployeeSkillHasBeenFetched,
  selectEmployeeSkillMap,
} from '../../store/slices/employeeSkillSlice';
import { createEmployeeSkill } from '../../services/employeeSkillService';
import {
  fetchSkills,
  selectSkills,
  selectSkillsStatus,
} from '../../store/slices/skillSlice';
import SkillBadge from '../../components/SkillBadge';
import DatePickerInput from '../../components/DatePickerInput';
import Colors from '../../constants/colors';
import Typography from '../../constants/typography';

export default function DuplicateEmployeeScreen({ route, navigation }: any) {
  const dispatch = useAppDispatch();
  const employeeId: number | undefined = route?.params?.employeeId;

  const allEmployees = useAppSelector(selectEmployees);
  const employeesHasBeenFetched = useAppSelector(selectEmployeesHasBeenFetched);
  const skills = useAppSelector(selectSkills);
  const skillsStatus = useAppSelector(selectSkillsStatus);
  const employeeRoleMap = useAppSelector(selectEmployeeRoleMap);
  const employeeTeamMap = useAppSelector(selectEmployeeTeamMap);
  const teamsHasBeenFetched = useAppSelector(selectEmployeeTeamHasBeenFetched);
  const teams = useAppSelector(selectTeams);
  const teamsListHasBeenFetched = useAppSelector(selectTeamsHasBeenFetched);
  const employeeSkillMap = useAppSelector(selectEmployeeSkillMap);
  const skillsHasBeenFetched = useAppSelector(selectEmployeeSkillHasBeenFetched);

  const source = useMemo(
    () => allEmployees.find((e) => e.id === employeeId),
    [allEmployees, employeeId]
  );

  const tutorEmployees = useMemo(
    () => allEmployees.filter((e) => employeeRoleMap.get(e.id)?.isTutor && e.id !== employeeId),
    [allEmployees, employeeRoleMap, employeeId]
  );

  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [team, setTeam] = useState<string | null>(null);
  const [isLeader, setIsLeader] = useState(false);
  const [isTutor, setIsTutor] = useState(false);
  const [selectedSkillIds, setSelectedSkillIds] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [country, setCountry] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [legalEntity, setLegalEntity] = useState('');
  const [wageRate, setWageRate] = useState('');
  const [businessUnit, setBusinessUnit] = useState('');
  const [startWorkingDate, setStartWorkingDate] = useState('');
  const [lastSalaryIncreaseDate, setLastSalaryIncreaseDate] = useState('');
  const [isFreelancer, setIsFreelancer] = useState(false);
  const [selectedTutorId, setSelectedTutorId] = useState<number | null>(null);

  useEffect(() => {
    if (skills.length === 0) dispatch(fetchSkills());
  }, [dispatch, skills.length]);

  useEffect(() => {
    if (!employeesHasBeenFetched) dispatch(fetchEmployees());
  }, [dispatch, employeesHasBeenFetched]);

  useEffect(() => {
    if (!teamsHasBeenFetched) dispatch(fetchEmployeeTeams());
  }, [dispatch, teamsHasBeenFetched]);

  useEffect(() => {
    if (!teamsListHasBeenFetched) dispatch(fetchTeams());
  }, [dispatch, teamsListHasBeenFetched]);

  useEffect(() => {
    if (!skillsHasBeenFetched) dispatch(fetchEmployeeSkills());
  }, [dispatch, skillsHasBeenFetched]);

  // Pre-fill da employee sorgente
  useEffect(() => {
    if (!source) return;
    setName(source.name ?? '');
    setSurname(source.surname ?? '');
    setEmailAddress(source.emailAddress ?? '');
    const assignedTeam = employeeTeamMap.get(source.id)?.[0]?.name ?? source.team ?? null;
    setTeam(assignedTeam);
    const role = employeeRoleMap.get(source.id);
    setIsLeader(role?.isLeader ?? source.isLeader ?? false);
    setIsTutor(role?.isTutor ?? source.isTutor ?? false);
    const assignedSkillIds =
      employeeSkillMap.get(source.id)?.map((s) => s.id) ??
      source.skills?.map((s) => s.id) ?? [];
    setSelectedSkillIds(assignedSkillIds);
    setCountry(source.country ?? '');
    setIsActive(source.isActive ?? true);
    setLegalEntity(source.legalEntity ?? '');
    setWageRate(source.wageRate !== undefined ? String(source.wageRate) : '');
    setBusinessUnit(source.businessUnit ?? '');
    setStartWorkingDate(source.startWorkingDate ?? '');
    setLastSalaryIncreaseDate(source.lastSalaryIncreaseDate ?? '');
    setIsFreelancer(source.isFreelancer ?? false);
    setSelectedTutorId(source.tutorId?.id ?? null);
  }, [source, employeeTeamMap, employeeSkillMap, employeeRoleMap]);

  const navigateBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('EmployeeList');
  };

  const toggleSkill = (skillId: number) => {
    setSelectedSkillIds((prev) =>
      prev.includes(skillId)
        ? prev.filter((id) => id !== skillId)
        : [...prev, skillId]
    );
  };

  const handleSubmit = async () => {
    if (!name.trim() || !surname.trim()) {
      Alert.alert('Error', 'Name and surname are required.');
      return;
    }

    setSubmitting(true);
    const result = await dispatch(
      createEmployeeThunk({
        name: name.trim(),
        surname: surname.trim(),
        emailAddress: emailAddress.trim() || undefined,
        team: team ?? undefined,
        isLeader,
        isTutor,
        skills: selectedSkillIds.map((id) => ({ id, name: '' })),
        country: country.trim() || undefined,
        isActive,
        legalEntity: legalEntity.trim() || undefined,
        wageRate: wageRate.trim() ? parseFloat(wageRate.trim()) : undefined,
        businessUnit: businessUnit.trim() || undefined,
        startWorkingDate: startWorkingDate.trim() || undefined,
        lastSalaryIncreaseDate: lastSalaryIncreaseDate.trim() || undefined,
        isFreelancer,
        tutorId: selectedTutorId !== null
          ? { id: selectedTutorId, name: '', surname: '' }
          : undefined,
      })
    );
    setSubmitting(false);

    if (createEmployeeThunk.fulfilled.match(result)) {
      const newEmployeeId = result.payload.id;
      if (selectedSkillIds.length > 0) {
        await Promise.all(
          selectedSkillIds.map((sid) => createEmployeeSkill(newEmployeeId, sid))
        );
        await dispatch(fetchEmployeeSkills());
      }
      if (team) {
        const teamObj = teams.find((t) => t.name === team);
        if (teamObj) {
          await createEmployeeTeam(newEmployeeId, teamObj.id, isLeader, isTutor);
          await dispatch(fetchEmployeeTeams());
        }
      }
      await dispatch(fetchEmployees());
      navigateBack();
    } else {
      Alert.alert('Error', 'Creation failed. Please try again.');
    }
  };

  if (skillsStatus === 'loading' && !source) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!source) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: Colors.mainTextColor }}>Employee not found</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.label}>Name *</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="e.g. Mario"
        autoCapitalize="words"
      />

      <Text style={styles.label}>Surname *</Text>
      <TextInput
        style={styles.input}
        value={surname}
        onChangeText={setSurname}
        placeholder="e.g. Rossi"
        autoCapitalize="words"
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={emailAddress}
        onChangeText={setEmailAddress}
        placeholder="e.g. mario.rossi@azienda.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Team</Text>
      <View style={styles.pickerWrapper}>
        <Picker selectedValue={team} onValueChange={(val) => setTeam(val)}>
          <Picker.Item label="Select a team..." value={null} />
          {teams.map((t) => (
            <Picker.Item key={t.id} label={t.name} value={t.name} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Role</Text>
      <View style={styles.toggleRow}>
        <Pressable
          style={[styles.toggleButton, isLeader && styles.toggleActive]}
          onPress={() => setIsLeader((v) => !v)}
        >
          <Text style={[styles.toggleText, isLeader && styles.toggleTextActive]}>
            Leader
          </Text>
        </Pressable>
        <Pressable
          style={[styles.toggleButton, isTutor && styles.toggleActive]}
          onPress={() => setIsTutor((v) => !v)}
        >
          <Text style={[styles.toggleText, isTutor && styles.toggleTextActive]}>
            Tutor
          </Text>
        </Pressable>
      </View>

      <Text style={styles.label}>Tutor</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={selectedTutorId}
          onValueChange={(val) => setSelectedTutorId(val)}
        >
          <Picker.Item label="No tutor assigned" value={null} />
          {tutorEmployees.map((e) => (
            <Picker.Item
              key={e.id}
              label={`${e.surname} ${e.name}`}
              value={e.id}
            />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Country</Text>
      <TextInput
        style={styles.input}
        value={country}
        onChangeText={setCountry}
        placeholder="e.g. Italy"
      />

      <Text style={styles.label}>Legal Entity</Text>
      <TextInput
        style={styles.input}
        value={legalEntity}
        onChangeText={setLegalEntity}
        placeholder="e.g. Acme S.r.l."
      />

      <Text style={styles.label}>Business Unit</Text>
      <TextInput
        style={styles.input}
        value={businessUnit}
        onChangeText={setBusinessUnit}
        placeholder="e.g. Engineering"
      />

      <Text style={styles.label}>Wage Rate</Text>
      <TextInput
        style={styles.input}
        value={wageRate}
        onChangeText={setWageRate}
        placeholder="e.g. 350.00"
        keyboardType="decimal-pad"
      />

      <Text style={styles.label}>Start Working Date</Text>
      <DatePickerInput
        value={startWorkingDate}
        onChange={setStartWorkingDate}
        label="Start Working Date"
      />

      <Text style={styles.label}>Last Salary Increase Date</Text>
      <DatePickerInput
        value={lastSalaryIncreaseDate}
        onChange={setLastSalaryIncreaseDate}
        label="Last Salary Increase Date"
      />

      <Text style={styles.label}>Is Active</Text>
      <View style={styles.toggleRow}>
        <Pressable
          style={[styles.toggleButton, isActive && styles.toggleActive]}
          onPress={() => setIsActive(true)}
        >
          <Text style={[styles.toggleText, isActive && styles.toggleTextActive]}>Yes</Text>
        </Pressable>
        <Pressable
          style={[styles.toggleButton, !isActive && styles.toggleActive]}
          onPress={() => setIsActive(false)}
        >
          <Text style={[styles.toggleText, !isActive && styles.toggleTextActive]}>No</Text>
        </Pressable>
      </View>

      <Text style={styles.label}>Is Freelancer</Text>
      <View style={styles.toggleRow}>
        <Pressable
          style={[styles.toggleButton, isFreelancer && styles.toggleActive]}
          onPress={() => setIsFreelancer(true)}
        >
          <Text style={[styles.toggleText, isFreelancer && styles.toggleTextActive]}>Yes</Text>
        </Pressable>
        <Pressable
          style={[styles.toggleButton, !isFreelancer && styles.toggleActive]}
          onPress={() => setIsFreelancer(false)}
        >
          <Text style={[styles.toggleText, !isFreelancer && styles.toggleTextActive]}>No</Text>
        </Pressable>
      </View>

      {skills.length > 0 && (
        <>
          <Text style={styles.label}>Skills</Text>
          <View style={styles.skillsWrap}>
            {skills.map((s) => {
              const active = selectedSkillIds.includes(s.id);
              return (
                <Pressable key={s.id} onPress={() => toggleSkill(s.id)}>
                  <SkillBadge
                    name={s.name}
                    variant={active ? 'prominent' : 'default'}
                  />
                </Pressable>
              );
            })}
          </View>
        </>
      )}

      <View style={styles.actions}>
        <Pressable
          style={[styles.submitButton, submitting && styles.submitDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.submitText}>
            {submitting ? 'Saving...' : 'Crea Employee Duplicato'}
          </Text>
        </Pressable>
        <Pressable onPress={navigateBack}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundColor },
  content: { padding: 20, paddingBottom: 60 },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundColor,
  },
  label: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.mainTextColor,
    marginBottom: 6,
    marginTop: 16,
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
  pickerWrapper: {
    borderWidth: 1,
    borderColor: Colors.backgroundColor,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceColor,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: Colors.surfaceColor,
    borderWidth: 1,
    borderColor: Colors.secondaryGray + '50',
  },
  toggleActive: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.mainTextColor,
  },
  toggleTextActive: {
    color: Colors.primary,
  },
  skillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  actions: { marginTop: 24 },
  submitButton: {
    backgroundColor: Colors.secondaryGray,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  cancelText: {
    color: Colors.mainTextColor,
    textAlign: 'center',
    paddingVertical: 18,
  },
});
