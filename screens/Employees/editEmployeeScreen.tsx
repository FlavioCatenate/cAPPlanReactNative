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
  updateEmployeeThunk,
  fetchEmployees,
  selectEmployees,
} from '../../store/slices/employeeSlice';
import {
  fetchEmployeeTeams,
  selectEmployeeRoleMap,
  selectEmployeeTeamHasBeenFetched,
  selectEmployeeTeamMap,
  selectAllTeamNames,
  selectEmployeeTeamItems,
} from '../../store/slices/employeeTeamSlice';
import { updateEmployeeTeam, createEmployeeTeam, deleteEmployeeTeam as deleteEmployeeTeamRecord } from '../../services/employeeTeamService';
import {
  fetchEmployeeSkills,
  selectEmployeeSkillMap,
  selectEmployeeSkillHasBeenFetched,
  selectEmployeeSkillItems,
} from '../../store/slices/employeeSkillSlice';
import {
  createEmployeeSkill,
  deleteEmployeeSkill,
} from '../../services/employeeSkillService';
import {
  fetchSkills,
  selectSkills,
  selectSkillsStatus,
} from '../../store/slices/skillSlice';
import SkillBadge from '../../components/SkillBadge';
import Colors from '../../constants/colors';
import Typography from '../../constants/typography';

/** ⚠️  Sostituisci con i valori enum reali del backend */
const TEAM_OPTIONS = ['WEB', 'MULESOFT', 'TIBCO'];

export default function EditEmployeeScreen({ route, navigation }: any) {
  const dispatch = useAppDispatch();
  const employeeId: number | undefined = route?.params?.employeeId;

  const employees = useAppSelector(selectEmployees);
  const employeeRoleMap = useAppSelector(selectEmployeeRoleMap);
  const employeeTeamMap = useAppSelector(selectEmployeeTeamMap);
  const allTeamNames = useAppSelector(selectAllTeamNames);
  const employeeSkillMap = useAppSelector(selectEmployeeSkillMap);
  const employeeSkillItems = useAppSelector(selectEmployeeSkillItems);
  const employeeTeamItems = useAppSelector(selectEmployeeTeamItems);
  const teamsHasBeenFetched = useAppSelector(selectEmployeeTeamHasBeenFetched);
  const skillsHasBeenFetched = useAppSelector(selectEmployeeSkillHasBeenFetched);
  const skills = useAppSelector(selectSkills);
  const skillsStatus = useAppSelector(selectSkillsStatus);

  const employee = useMemo(
    () => employees.find((e) => e.id === employeeId),
    [employees, employeeId]
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

  const tutorEmployees = useMemo(
    () => employees.filter((e) => employeeRoleMap.get(e.id)?.isTutor && e.id !== employeeId),
    [employees, employeeRoleMap, employeeId]
  );

  // Safety-net picker: se il team corrente non è nella lista, aggiungilo
  const pickerTeams = useMemo(() => {
    const assignedTeam = employeeTeamMap.get(employeeId ?? -1)?.[0]?.name;
    if (!assignedTeam || allTeamNames.includes(assignedTeam)) return allTeamNames;
    return [assignedTeam, ...allTeamNames];
  }, [allTeamNames, employeeTeamMap, employeeId]);

  useEffect(() => {
    if (skills.length === 0) dispatch(fetchSkills());
  }, [dispatch, skills.length]);

  useEffect(() => {
    if (!teamsHasBeenFetched) dispatch(fetchEmployeeTeams());
  }, [dispatch, teamsHasBeenFetched]);

  useEffect(() => {
    if (!skillsHasBeenFetched) dispatch(fetchEmployeeSkills());
  }, [dispatch, skillsHasBeenFetched]);

  // Pre-fill form quando l'employee è disponibile
  useEffect(() => {
    if (!employee) return;
    setName(employee.name ?? '');
    setSurname(employee.surname ?? '');
    setEmailAddress(employee.emailAddress ?? '');
    // Usa la mappa relazione per il team (più affidabile di employee.team)
    const assignedTeam = employeeTeamMap.get(employee.id)?.[0]?.name ?? employee.team ?? null;
    setTeam(assignedTeam);
    const roleMapEntry = employeeRoleMap.get(employee.id);
    setIsLeader(roleMapEntry?.isLeader ?? employee.isLeader ?? false);
    setIsTutor(roleMapEntry?.isTutor ?? employee.isTutor ?? false);
    // Usa la mappa relazione per le skills
    const assignedSkillIds = employeeSkillMap.get(employee.id)?.map((s) => s.id)
      ?? employee.skills?.map((s) => s.id)
      ?? [];
    setSelectedSkillIds(assignedSkillIds);
    setCountry(employee.country ?? '');
    setIsActive(employee.isActive ?? true);
    setLegalEntity(employee.legalEntity ?? '');
    setWageRate(employee.wageRate !== undefined ? String(employee.wageRate) : '');
    setBusinessUnit(employee.businessUnit ?? '');
    setStartWorkingDate(employee.startWorkingDate ?? '');
    setLastSalaryIncreaseDate(employee.lastSalaryIncreaseDate ?? '');
    setIsFreelancer(employee.isFreelancer ?? false);
    setSelectedTutorId(employee.tutorId?.id ?? null);
  }, [employee, employeeTeamMap, employeeSkillMap, employeeRoleMap]);

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
    if (!employeeId) {
      Alert.alert('Errore', 'Employee non trovato.');
      return;
    }
    if (!name.trim() || !surname.trim()) {
      Alert.alert('Errore', 'Nome e cognome sono obbligatori.');
      return;
    }

    setSubmitting(true);
    const result = await dispatch(
      updateEmployeeThunk({
        id: employeeId,
        data: {
          id: employeeId,
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
        },
      })
    );
    setSubmitting(false);

    if (updateEmployeeThunk.fulfilled.match(result)) {
      // Sync skills via join table (diff-based)
      const currentSkillItems = employeeSkillItems.filter(
        (es) => es.employee.id === employeeId
      );
      const toAdd = selectedSkillIds.filter(
        (sid) => !currentSkillItems.some((es) => es.skill.id === sid)
      );
      const toDelete = currentSkillItems.filter(
        (es) => !selectedSkillIds.includes(es.skill.id)
      );
      await Promise.all(toAdd.map((sid) => createEmployeeSkill(employeeId, sid)));
      await Promise.all(toDelete.map((es) => deleteEmployeeSkill(es.id)));
      // Sync team assignment via join table (diff-based)
      const currentTeamItems = employeeTeamItems.filter(
        (et) => et.employee.id === employeeId
      );
      if (team) {
        const teamObj = employeeTeamItems.find((et) => et.team.name === team)?.team;
        if (!teamObj) {
          Alert.alert('Errore', `Team "${team}" non trovato. Riprova.`);
          return;
        }
        const existingRecord = currentTeamItems[0];
        if (!existingRecord) {
          // Nessun team assegnato → crea
          await createEmployeeTeam(employeeId, teamObj.id, isLeader, isTutor);
        } else if (existingRecord.team.id !== teamObj.id) {
          // Team cambiato → elimina vecchio, crea nuovo
          await deleteEmployeeTeamRecord(existingRecord.id);
          await createEmployeeTeam(employeeId, teamObj.id, isLeader, isTutor);
        } else {
          // Stesso team → aggiorna solo i flag
          await updateEmployeeTeam(existingRecord, isLeader, isTutor);
        }
        // Elimina eventuali record duplicati (team extra)
        await Promise.all(
          currentTeamItems.slice(1).map((et) => deleteEmployeeTeamRecord(et.id))
        );
      } else {
        // Nessun team selezionato → elimina tutti i record esistenti
        await Promise.all(currentTeamItems.map((et) => deleteEmployeeTeamRecord(et.id)));
      }
      await dispatch(fetchEmployees());
      await dispatch(fetchEmployeeSkills());
      await dispatch(fetchEmployeeTeams());
      navigateBack();
    } else {
      const msg =
        typeof result.payload === 'string' && result.payload.trim()
          ? result.payload
          : 'Aggiornamento fallito. Riprova.';
      Alert.alert('Errore', msg);
    }
  };

  if (skillsStatus === 'loading' && skills.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!employee) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: Colors.mainTextColor }}>
          Employee non trovato.
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
      <Text style={styles.label}>Nome *</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />

      <Text style={styles.label}>Cognome *</Text>
      <TextInput
        style={styles.input}
        value={surname}
        onChangeText={setSurname}
        autoCapitalize="words"
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={emailAddress}
        onChangeText={setEmailAddress}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Team</Text>
      <View style={styles.pickerWrapper}>
        <Picker selectedValue={team} onValueChange={(val) => setTeam(val)}>
          <Picker.Item label="Seleziona un team..." value={null} />
          {pickerTeams.map((t) => (
            <Picker.Item key={t} label={t} value={t} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Ruolo</Text>
      {employeeId && (() => {
        const role = employeeRoleMap.get(employeeId);
        const parts: string[] = [];
        if (role?.isLeader) parts.push('Leader');
        if (role?.isTutor) parts.push('Tutor');
        return parts.length > 0 ? (
          <Text style={styles.roleHint}>
            Stato attuale: {parts.join(', ')}
          </Text>
        ) : null;
      })()}
      <View style={styles.toggleRow}>
        <Pressable
          style={[styles.toggleButton, isLeader && styles.toggleActive]}
          onPress={() => setIsLeader((v) => !v)}
        >
          <Text
            style={[styles.toggleText, isLeader && styles.toggleTextActive]}
          >
            Leader
          </Text>
        </Pressable>
        <Pressable
          style={[styles.toggleButton, isTutor && styles.toggleActive]}
          onPress={() => setIsTutor((v) => !v)}
        >
          <Text
            style={[styles.toggleText, isTutor && styles.toggleTextActive]}
          >
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
          <Picker.Item label="Nessun tutor" value={null} />
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
        placeholder="es. Italy"
      />

      <Text style={styles.label}>Legal Entity</Text>
      <TextInput
        style={styles.input}
        value={legalEntity}
        onChangeText={setLegalEntity}
        placeholder="es. Acme S.r.l."
      />

      <Text style={styles.label}>Business Unit</Text>
      <TextInput
        style={styles.input}
        value={businessUnit}
        onChangeText={setBusinessUnit}
        placeholder="es. Engineering"
      />

      <Text style={styles.label}>Wage Rate</Text>
      <TextInput
        style={styles.input}
        value={wageRate}
        onChangeText={setWageRate}
        placeholder="es. 350.00"
        keyboardType="decimal-pad"
      />

      <Text style={styles.label}>Start Working Date</Text>
      <TextInput
        style={styles.input}
        value={startWorkingDate}
        onChangeText={setStartWorkingDate}
        placeholder="YYYY-MM-DD"
      />

      <Text style={styles.label}>Last Salary Increase Date</Text>
      <TextInput
        style={styles.input}
        value={lastSalaryIncreaseDate}
        onChangeText={setLastSalaryIncreaseDate}
        placeholder="YYYY-MM-DD"
      />

      <Text style={styles.label}>Is Active</Text>
      <View style={styles.toggleRow}>
        <Pressable
          style={[styles.toggleButton, isActive && styles.toggleActive]}
          onPress={() => setIsActive(true)}
        >
          <Text style={[styles.toggleText, isActive && styles.toggleTextActive]}>Sì</Text>
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
          <Text style={[styles.toggleText, isFreelancer && styles.toggleTextActive]}>Sì</Text>
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
            {submitting ? 'Salvataggio...' : 'Salva modifiche'}
          </Text>
        </Pressable>
        <Pressable onPress={navigateBack}>
          <Text style={styles.cancelText}>Annulla</Text>
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
  roleHint: {
    fontSize: 12,
    color: Colors.primary,
    marginBottom: 6,
    marginTop: 2,
  },
  toggleRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
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
  toggleText: { fontSize: 15, fontWeight: '600', color: Colors.mainTextColor },
  toggleTextActive: { color: Colors.primary },
  skillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
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