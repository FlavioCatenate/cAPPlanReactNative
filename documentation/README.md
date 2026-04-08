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
2. `SafeAreaProvider`
3. `NavigationContainer`

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
- `ProjectStack` include:
  - `ProjectList`
  - `ProjectDetail`
  - `AddProject`
  - `EditProject`
- `CalendarStack` (navigator separato):
  - `Calendar`
  - `EmployeeMonth`

L'header del Drawer include un pulsante calendario (Ionicons) che naviga direttamente a `Calendar`.

## Flusso di Autenticazione

### Login

`loginThunk` (RTK async thunk):

1. Chiama `POST /api/authenticate` con username e password
2. Salva `id_token` in Secure Store sotto la chiave `auth_token`
3. Chiama `GET /api/account` per recuperare il profilo utente
4. Aggiorna lo stato Redux con `user`; `status` torna a `idle`

Gestione degli errori:

- HTTP 401 → `rejectWithValue('Credenziali non valide')`
- Timeout o rete irraggiungibile → `rejectWithValue('Backend non raggiungibile...')`
- Altri errori → `rejectWithValue('Errore durante il login')`

### Persistenza sessione

Al bootstrap, `RootNavigator` dispatcha `initializeAuth` (RTK async thunk):

1. Legge `auth_token` da Secure Store
2. Se presente, chiama `GET /api/account` per validare il token e caricare l'utente
3. Se il token e' scaduto o non valido, lo elimina da Secure Store e imposta `user = null`
4. Al termine (fulfilled o rejected), imposta `isInitializing = false`

Finche' `isInitializing` e' `true`, viene mostrata la `SplashScreen`. Quando diventa `false`, il root navigator mostra `Login` o `MainApp` in base allo stato `isLoggedIn`.

### Logout

`logoutThunk` (RTK async thunk):

1. Elimina `auth_token` da Secure Store
2. Imposta `user = null` nello stato Redux

### Stato Redux (`authSlice`)

```ts
interface AuthState {
  user: User | null;
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
  isInitializing: boolean;
}
```

Selectors esportati: `selectUser`, `selectIsLoggedIn`, `selectAuthStatus`, `selectAuthError`, `selectIsInitializing`.

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

## Modulo Projects

La gestione progetti e' basata su Redux Toolkit:

- Slice: `projects`
- Thunk principali:
  - `fetchProjects`
  - `createProjectThunk`
  - `updateProjectThunk`
  - `deleteProjectThunk`

### Schermate

- `ProjectListScreen` — lista con paginazione client (10/pagina), filtro per stato attivo/inattivo e date
- `ProjectDetailScreen` — dettaglio progetto (nome, descrizione, date, tipo, stato attivo)
- `AddProjectScreen` — form creazione progetto con date, descrizione e stato
- `EditProjectScreen` — modifica dati progetto

## Modulo Calendar

- `CalendarScreen` — vista mensile allocazioni per tutti gli employee con status visivo per settimana
- `EmployeeMonthScreen` — vista giornaliera allocazioni di un singolo dipendente

## Componenti Condivisi

| Componente | Descrizione |
|---|---|
| `AllocationCard` | Card riassuntiva di una allocation |
| `DatePickerInput` | Input data con modal `react-native-date-picker`, normalizza su `YYYY-MM-DD` |
| `EmployeeCard` | Card riassuntiva di un dipendente |
| `EmployeeFilterModal` | Modal filtro dipendenti per ruolo (leader/tutor) e team |
| `FilterChips` | Chips per filtri attivi |
| `FilterModal` | Modal filtro allocazioni per team, stato e dipendente |
| `HomeButton` | Pulsante con varianti di stile (default, danger) |
| `ProjectCard` | Card riassuntiva di un progetto con stato attivo e date |
| `ProjectFilterModal` | Modal filtro progetti per stato attivo/inattivo |
| `SkillBadge` | Badge visivo per una skill |

## Redux Store

Slice configurati in `store/index.ts`:

| Slice | Descrizione |
|---|---|
| `auth` | Stato autenticazione e profilo utente |
| `allocations` | Lista e stato CRUD allocation |
| `employees` | Lista e stato CRUD dipendenti |
| `projects` | Lista e stato CRUD progetti |
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
  - `POST /api/projects`
  - `PUT /api/projects/{id}`
  - `DELETE /api/projects/{id}`

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
|  |- ProjectCard.tsx
|  |- ProjectFilterModal.tsx
|  |- SkillBadge.tsx
|- constants/
|  |- colors.tsx
|  |- formStyles.tsx
|  |- typography.tsx
|  |- user.tsx
|- screens/
|  |- HomeScreen.tsx
|  |- LoginScreen.tsx
|  |- SplashScreen.tsx
|  |- EditProfileScreen.tsx
|  |- AllocationPlanning/
|  |- Calendar/
|  |- Employees/
|  |- Projects/
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
|  |- projectColors.ts
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

- L'autenticazione e' gestita interamente da `authSlice` RTK. 
- I moduli Employees, Skills e Projects seguono lo stesso pattern Redux del modulo Allocation.
- Il slice `filters` gestisce lo stato dei filtri UI in modo centralizzato.
- Il date picker e' condiviso tra i form allocation tramite il componente `DatePickerInput`.
- I filtri per Employees e Projects usano modal dedicati (`EmployeeFilterModal`, `ProjectFilterModal`) analoghi a `FilterModal`.
