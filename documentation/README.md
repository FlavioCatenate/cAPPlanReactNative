# cAPPlan React Native

Applicazione mobile per Capacity Planning con autenticazione, navigazione a drawer e gestione di allocation, employees, skills e calendario.

## Stack Tecnologico

- React 19.1.0
- React Native 0.81.5
- Expo SDK 54
- TypeScript 5.9
- React Navigation 7 (native stack + drawer)
- Redux Toolkit + React Redux
- Axios
- expo-secure-store
- expo-linear-gradient
- react-native-date-picker
- react-native-reanimated 4
- react-native-gesture-handler
- react-native-keyboard-aware-scroll-view
- @react-native-picker/picker
- @expo/vector-icons (Ionicons)

## Prerequisiti

1. Node.js 18+ (consigliato LTS)
2. Corepack abilitato (`corepack enable pnpm`)
3. pnpm
4. Android Studio (Android SDK + emulator)
5. Xcode (solo macOS, per iOS)
6. Expo CLI opzionale (puoi usare anche npx expo)

## Avvio Progetto

### 1) Installazione dipendenze

```bash
pnpm install
```

### 2) Avvio Metro / Expo

```bash
pnpm dev
```

Alternativa equivalente:

```bash
pnpm start
```

### 3) Build nativa Android

```bash
pnpm android
```

Equivalente:

```bash
npx expo run:android
```

### 4) Build nativa iOS (solo macOS)

```bash
pnpm ios
```

## Scripts Disponibili

Da package.json:

- `pnpm dev` -> `expo start`
- `pnpm start` -> `expo start`
- `pnpm android` -> `expo run:android`
- `pnpm ios` -> `expo run:ios`
- `pnpm web` -> `expo start --web`

## Uso con pnpm

Il progetto usa `pnpm` come package manager standard (pnpm@10.18.3).

Se `pnpm` non e' ancora disponibile nel terminale:

```bash
corepack enable pnpm
```

Su Windows PowerShell, se hai appena abilitato Corepack, puo' essere necessario chiudere e riaprire il terminale prima di eseguire `pnpm`.

## Architettura Applicazione

### Provider principali

In `App.tsx` l'app e' avvolta da:

1. Redux `Provider`
2. `AuthProvider` (context autenticazione)
3. `SafeAreaProvider`
4. `NavigationContainer`

### Navigazione

- Root stack:
  - `Login` (utente non autenticato)
  - `MainApp` (utente autenticato)
- `MainApp` usa un Drawer con:
  - `Home`
  - `AllocationStack`
  - `Calendar`
  - `EmployeeStack`
  - `SkillStack`
- `AllocationStack` include:
  - `AllocationPlanning`
  - `AddAllocation`
  - `EditAllocation`
  - `AllocationDetail`
  - `EmployeeMonth`
  - `Calendar`
- `EmployeeStack` include:
  - `EmployeeList`
  - `EmployeeDetail`
  - `AddEmployee`
  - `EditEmployee`
- `SkillStack` include:
  - `SkillList`
  - `SkillDetail`
  - `AddSkill`
  - `EditSkill`

L'header del Drawer include un pulsante calendario (Ionicons) che naviga direttamente a `Calendar`.

## Flusso di Autenticazione

### Login

La login usa un thunk Redux (`loginThunk`) che:

1. Chiama `POST /api/authenticate`
2. Salva `id_token` in Secure Store (`auth_token`)
3. Recupera il profilo utente con `GET /api/account`
4. Aggiorna lo stato auth

### Persistenza sessione

Al bootstrap, `AuthProvider` controlla il token salvato e prova a caricare l'account.
Se il token non e' valido, viene rimosso automaticamente.

### Logout

Logout elimina il token da Secure Store e resetta l'utente in memoria.

## Modulo Allocation Planning

La gestione allocation e' basata su Redux Toolkit:

- Slice: `allocations`
- Thunk principali:
  - `fetchAllocations`
  - `createAllocationThunk`
  - `updateAllocationThunk`
  - `deleteAllocationThunk`

### Schermate

- `AllocationPlanningScreen` — lista con paginazione client, FAB per aggiunta, modal opzioni per modifica/eliminazione
- `AddAllocationScreen` — form con employee, progetto, percentuale, sales rate, fixed price, date
- `EditAllocationScreen` — prefill dati allocation e update
- `AllocationDetailScreen` — riepilogo allocation con indicatori visuali di stato

## Modulo Employees

La gestione dipendenti e' basata su Redux Toolkit:

- Slice: `employees`
- Thunk principali:
  - `fetchEmployees`
  - `createEmployeeThunk`
  - `updateEmployeeThunk`
  - `deleteEmployeeThunk`

### Schermate

- `EmployeeListScreen` — lista con ricerca e filtro
- `EmployeeDetailScreen` — riepilogo dipendente con skill e team associati
- `AddEmployeeScreen` — form creazione dipendente
- `EditEmployeeScreen` — modifica dipendente

Le skill associate a un dipendente sono gestite tramite `employeeSkills` slice e `employee-skills` API.  
I team associati a un dipendente sono gestiti tramite `employeeTeams` slice e `employee-teams` API.

## Modulo Skills

La gestione skill e' basata su Redux Toolkit:

- Slice: `skills`
- Thunk principali:
  - `fetchSkills`
  - `createSkillThunk`
  - `updateSkillThunk`
  - `deleteSkillThunk`

### Schermate

- `SkillListScreen` — lista skill
- `SkillDetailScreen` — dettaglio skill (nome, descrizione)
- `AddSkillScreen` — form creazione skill
- `EditSkillScreen` — modifica skill

## Modulo Calendar

- `CalendarScreen` — vista calendario allocazioni per tutti gli employee
- `EmployeeMonthScreen` — vista mensile allocazioni di un singolo dipendente

## Componenti Condivisi

| Componente | Descrizione |
|---|---|
| `AllocationCard` | Card riassuntiva di una allocation |
| `DatePickerInput` | Input data con modal `react-native-date-picker`, normalizza su `YYYY-MM-DD` |
| `EmployeeCard` | Card riassuntiva di un dipendente |
| `EmployeeFilterModal` | Modal filtro dipendenti |
| `FilterChips` | Chips per filtri attivi |
| `FilterModal` | Modal filtro generico |
| `HomeButton` | Pulsante navigazione home |
| `SkillBadge` | Badge visivo per una skill |

## Redux Store

Slice configurati in `store/index.ts`:

| Slice | Descrizione |
|---|---|
| `auth` | Stato autenticazione e profilo utente |
| `allocations` | Lista e stato CRUD allocation |
| `employees` | Lista e stato CRUD dipendenti |
| `projects` | Lista progetti (lookup) |
| `skills` | Lista e stato CRUD skill |
| `employeeTeams` | Associazioni dipendente-team |
| `employeeSkills` | Associazioni dipendente-skill |
| `filters` | Stato filtri attivi nell'UI |

## Backend e API

Client HTTP centralizzato in `services/api.ts`:

- Base URL Android emulator: `http://10.0.2.2:9074`
- Timeout: 10s
- Interceptor request: aggiunge `Authorization: Bearer <token>` se presente

Endpoint attualmente usati:

- **Auth**
  - `POST /api/authenticate`
  - `GET /api/account`
- **Allocation** (`services/allocationService.ts`)
  - `GET /api/employee-projects?eagerload=true&sort=id,asc`
  - `POST /api/employee-projects`
  - `PUT /api/employee-projects/{id}`
  - `DELETE /api/employee-projects/{id}`
- **Employees** (`services/employeeService.ts`)
  - `GET /api/employees?eagerload=true&sort=surname,asc&size=500`
  - `POST /api/employees`
  - `PUT /api/employees/{id}`
  - `DELETE /api/employees/{id}`
- **Skills** (`services/skillService.ts`)
  - `GET /api/skills?sort=name,asc&size=1000`
  - `POST /api/skills`
  - `PUT /api/skills/{id}`
  - `DELETE /api/skills/{id}`
- **Employee Skills** (`services/employeeSkillService.ts`)
  - `GET /api/employee-skills?eagerload=true&sort=id,asc&size=1000`
  - `POST /api/employee-skills`
  - `DELETE /api/employee-skills/{id}`
- **Employee Teams** (`services/employeeTeamService.ts`)
  - `GET /api/employee-teams?sort=id,asc&size=1000`
  - `PUT /api/employee-teams/{id}`
- **Projects** (`services/projectService.ts`)
  - `GET /api/projects?sort=name,asc&size=500`

## Struttura Cartelle

```text
cAPPlanReactNative/
|- App.tsx
|- index.ts
|- package.json
|- assets/
|  |- images/
|- components/
|  |- AllocationCard.tsx
|  |- DatePickerInput.tsx
|  |- EmployeeCard.tsx
|  |- EmployeeFilterModal.tsx
|  |- FilterChips.tsx
|  |- FilterModal.tsx
|  |- HomeButton.tsx
|  |- SkillBadge.tsx
|- constants/
|  |- colors.tsx
|  |- formStyles.tsx
|  |- typography.tsx
|- context/
|  |- AuthContext.tsx
|- screens/
|  |- HomeScreen.tsx
|  |- LoginScreen.tsx
|  |- SplashScreen.tsx
|  |- EditProfileScreen.tsx
|  |- AllocationPlanning/
|  |- Calendar/
|  |- Employees/
|  |- Skills/
|- services/
|  |- api.ts
|  |- allocationService.ts
|  |- authService.ts
|  |- employeeService.ts
|  |- employeeSkillService.ts
|  |- employeeTeamService.ts
|  |- projectService.ts
|  |- skillService.ts
|- store/
|  |- index.ts
|  |- hooks.ts
|  |- slices/
|- utils/
|  |- allocationColors.ts
|  |- calendarUtils.ts
|  |- employeeColors.ts
|- documentation/
```

## Troubleshooting Rapido

### L'app non parte o build instabile

```bash
# Da root progetto
rm -rf node_modules
pnpm install
pnpm start -- --clear
```

Su Windows PowerShell:

```powershell
Remove-Item -Recurse -Force node_modules
pnpm install
pnpm start -- --clear
```

### API non raggiungibile su Android emulator

Verifica che:

1. Il backend sia in ascolto su porta 9074
2. L'URL resti `http://10.0.2.2:9074` (non localhost)
3. Firewall/antivirus non blocchino la porta

### Login fallisce

Controllare:

1. Credenziali corrette
2. Endpoint `/api/authenticate` attivo
3. Endpoint `/api/account` accessibile con token

## Note di Evoluzione

- Coesistono Auth Context e auth slice Redux (migrazione graduale).
- I moduli Employees e Skills seguono lo stesso pattern Redux del modulo Allocation.
- Il slice `filters` gestisce lo stato dei filtri UI in modo centralizzato.
- Il date picker e' condiviso tra i form allocation tramite il componente `DatePickerInput`.
