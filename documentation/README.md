# cAPPlan React Native

Applicazione mobile per Capacity Planning con autenticazione, navigazione a drawer e gestione allocation (lista, dettaglio, creazione, modifica, eliminazione).

## Stack Tecnologico

- React Native 0.81.5
- Expo SDK 54
- TypeScript 5.9
- React Navigation 7 (native stack + drawer)
- Redux Toolkit + React Redux
- Axios
- expo-secure-store
- react-native-date-picker
- @react-native-picker/picker

## Prerequisiti

1. Node.js 18+ (consigliato LTS)
2. Corepack abilitato (`corepack enable pnpm`)
3. pnpm
3. Android Studio (Android SDK + emulator)
4. Xcode (solo macOS, per iOS)
5. Expo CLI opzionale (puoi usare anche npx expo)

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

Il progetto usa `pnpm` come package manager standard.

Se `pnpm` non e' ancora disponibile nel terminale:

```bash
corepack enable pnpm
```

Su Windows PowerShell, se hai appena abilitato Corepack, puo' essere necessario chiudere e riaprire il terminale prima di eseguire `pnpm`.

## Architettura Applicazione

### Provider principali

In App.tsx l'app e' avvolta da:

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
  - `EditProfile`
  - `AllocationStack`
- `AllocationStack` include:
  - `AllocationPlanning`
  - `AddAllocation`
  - `EditAllocation`
  - `AllocationDetail`

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

- Slice: `allocations`, `employees`, `projects`, `skills`, `auth`
- Thunk principali allocation:
  - `fetchAllocations`
  - `createAllocationThunk`
  - `updateAllocationThunk`
  - `deleteAllocationThunk`

### Schermate principali allocation

- `AllocationPlanningScreen`
  - lista ottimizzata con paginazione client (`Carica altri`)
  - FAB per aggiunta allocation
  - modal opzioni per modifica/eliminazione
- `AddAllocationScreen`
  - form con employee, progetto, percentuale, sales rate, fixed price, date
- `EditAllocationScreen`
  - prefill dati allocation e update
- `AllocationDetailScreen`
  - riepilogo allocation con indicatori visuali di stato

### Date picker

Il componente `DatePickerInput` usa `react-native-date-picker` in modal e normalizza il formato data su `YYYY-MM-DD`.

## Backend e API

Client HTTP centralizzato in `services/api.ts`:

- Base URL Android emulator: `http://10.0.2.2:9074`
- Timeout: 10s
- Interceptor request: aggiunge `Authorization: Bearer <token>` se presente

Endpoint attualmente usati:

- Auth:
  - `POST /api/authenticate`
  - `GET /api/account`
- Allocation:
  - `GET /api/employee-projects?eagerload=true&sort=id,asc`
  - `POST /api/employee-projects`
  - `PUT /api/employee-projects/{id}`
  - `DELETE /api/employee-projects/{id}`
- Lookup:
  - `GET /api/employees?sort=surname,asc&size=500`
  - `GET /api/projects?sort=name,asc&size=500`
  - `GET /api/skills?sort=name,asc`

## Struttura Cartelle (Sintesi)

```text
cAPPlanReactNative/
|- App.tsx
|- index.ts
|- package.json
|- assets/
|- components/
|- constants/
|- context/
|- screens/
|  |- AllocationPlanning/
|- services/
|- store/
|  |- slices/
|- utils/
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
- Le schermate allocation sono integrate nel Drawer via stack dedicato.
- Il date picker e' stato introdotto per standardizzare inserimento date nei form allocation.
