# cAPPlan - Documentazione Progetto

---

## 🚀 Quick Start - Comandi per Avviare il Progetto

### Prerequisiti

1. **Node.js** (v16 o superiore)
2. **npm** o **yarn**
3. **Expo CLI**: `npm install -g expo-cli`
4. Per iOS: **Xcode** (Mac)
5. Per Android: **Android Studio**

# Installare le dipendenze

npm install

### Comandi Disponibili

# Avviare il progetto in modalità Expo (QR code)

npm start

# Avviare direttamente su Android

npm run android

# Avviare direttamente su iOS

npm run ios

---

## 📲 Come Avviare l'Applicazione

### Opzione 1: Con QR Code Expo (Consigliato per Start Rapido)

Questo è il metodo più veloce per testare l'app su un dispositivo fisico.

#### Passaggi:

1. **Avviare il server Expo:**
   npm start

   Nel terminale apparirà un QR code e un menu con opzioni.

2. **Su iOS (da iPhone/iPad):**
   - Aprire l'app **Camera** nativa
   - Inquadrare il QR code
   - Tap sul link notificato "Open with Expo Go"
   - L'app si caricherà automaticamente in Expo Go

3. **Su Android:**
   - Scaricare l'app **Expo Go** dal Play Store
   - Aprire Expo Go
   - Scansionare il QR code dal terminale
   - L'app si caricherà automaticamente

### Opzione 2: Con Xcode (iOS)

Permette di testare e debuggare su iOS con tutti gli strumenti nativi.

#### Passaggi:

1. **Assicurarsi di essere su Mac** (Xcode è solo su macOS)

2. **Avviare il build per iOS:**

   npm run ios

   Questo comando:
   - Buildà il progetto
   - Aprirà automaticamente l'iOS Simulator
   - Installerà e lancerà l'app

3. **Manualmente con Xcode:**

   npx expo run:ios

   Se desideri controllare Xcode direttamente:
   - Navigare a `ios/` (se disponibile dopo build)
   - Aprire il file `.xcworkspace`
   - Premere il pulsante Play in Xcode

### Opzione 3: Con Android Studio (Android)

Permette di testare e debuggare su Android con tutti gli strumenti nativi.

#### Passaggi:

1. **Avviare il build per Android:**

   npm run android

   Questo comando:
   - Buildà il progetto
   - Lancerà l'Android Emulator (se non è già aperto)
   - Installerà e lancerà l'app

2. **Manualmente con Android Studio:**

   npx expo run:android

   Se desideri controllare Android Studio direttamente:
   - Aprire Android Studio
   - Selezionare "Open" e navigare alla radice del progetto
   - Android Studio riconosce il progetto React Native/Expo
   - Eseguire il progetto dall'IDE

3. **Su dispositivo fisico Android collegato:**

   npm run android

   Il dispositivo deve avere il debug USB attivato:
   - Andrare in Impostazioni → Info sul telefono
   - Toccare 7 volte il numero di build
   - Tornare in Impostazioni → Opzioni sviluppatore
   - Attivare "Debug USB"

---

## 📁 Struttura delle Cartelle

```
cAPPlanReactNative/
├── assets/                    # Risorse statiche
│   └── images/               # Loghi, icone, immagini
├── components/               # Componenti React Native riutilizzabili
│   └── HomeButton.tsx       # Bottone per la home
├── constants/                # Costanti dell'applicazione
│   ├── colors.tsx           # Palette colori globale
│   └── typography.tsx       # Stili tipografici globali
├── context/                  # Context API per state management
│   └── AuthContext.tsx      # Gestione dello stato di autenticazione
├── screens/                  # Schermate principali dell'app
│   ├── LoginScreen.tsx      # Schermata di login
│   ├── HomeScreen.tsx       # Schermata principale
│   └── EditProfileScreen.tsx # Schermata edit profilo
├── services/                 # Servizi API e business logic
│   ├── api.ts              # Istanza Axios configurata
│   └── authService.ts      # Funzioni di autenticazione
├── documentation/            # Questa documentazione
├── App.tsx                  # Componente root dell'app
├── app.json                 # Configurazione Expo
├── package.json             # Dipendenze e scripts
├── tsconfig.json            # Configurazione TypeScript
└── index.ts                 # Entry point dell'app
```

### Descrizione Dettagliata Cartelle

| Cartella          | Scopo                                                                                                          |
| ----------------- | -------------------------------------------------------------------------------------------------------------- |
| **assets**        | Memorizza tutte le risorse statiche (immagini, icone, fonts). In `images/` sono presenti logo e splash screen. |
| **components**    | Componenti React riutilizzabili. Ogni componente è isolato e può essere importato in diversi schermi.          |
| **constants**     | File con costanti globali. `colors.tsx` definisce la palette colori, `typography.tsx` gli stili di testo.      |
| **context**       | Context API di React per la gestione dello stato globale, in particolare l'autenticazione.                     |
| **screens**       | Le schermate principali dell'app. Ogni screen corrisponde a una rotta di navigazione.                          |
| **services**      | Logica di comunicazione con il backend (API calls). Centralizza tutte le richieste HTTP.                       |
| **documentation** | File di documentazione e guide (questo file).                                                                  |

---

## 🔐 Flusso di Autenticazione Login

L'autenticazione è gestita attraverso un flusso ben strutturato utilizzando Context API e Secure Store.

### Architettura

```
LoginScreen
    ↓
handleLogin() (chiama authService)
    ↓
login (authService) → POST /api/authenticate
    ↓
Token salvato in SecureStore
    ↓
loggedAccount (authService) → GET /api/account
    ↓
User salvato in AuthContext
    ↓
Navigate to HomeScreen
```

### Componenti Coinvolti

#### 1. **LoginScreen.tsx** - Interfaccia Utente

- Form con campi: `username` e `password`
- Pulsante "Continue" per inviare le credenziali
- Gestisce i tentativi di login e gli errori
- Utilizza `KeyboardAwareScrollView` per gestire la tastiera su iOS/Android
- Login gradient background

```tsx
const handleLogin = async () => {
  try {
    // 1. Effettua il login
    const response = await login(username, password);

    // 2. Salva il token in memoria sicura
    await SecureStore.setItemAsync("auth_token", response.id_token);

    // 3. Recupera i dati dell'utente loggato
    const loggedAccountRes = await loggedAccount();

    // 4. Salva l'utente nel context globale
    setUser(loggedAccountRes);

    // 5. Naviga alla home
    navigation.replace("Home");
  } catch (error) {
    Alert.alert("Login Failed", "Check credentials and try again.");
  }
};
```

#### 2. **authService.ts** - Logica di Autenticazione

Contiene due funzioni principali:

- **`login(username, password)`**
  - Effettua una richiesta POST a `/api/authenticate`
  - Invia username e password
  - Ritorna un oggetto con `id_token`

- **`loggedAccount()`**
  - Effettua una richiesta GET a `/api/account`
  - Richiede autenticazione (token nel header)
  - Ritorna i dati completi dell'utente loggato

#### 3. **AuthContext.tsx** - State Management Globale

Gestisce lo stato di autenticazione dell'intera app:

- **User Data**: Memorizza i dati dell'utente corrente
- **isLoggedIn**: Boolean che indica se l'utente è autenticato
- **setUser**: Funzione per aggiornare i dati utente
- **logout**: Funzione per disconnettere l'utente

```tsx
interface User {
  id: number;
  login: string;
  email: string;
  firstName: string;
  lastName: string;
  activated: boolean;
  langKey: string;
  createdDate: string | null;
  createdBy: string;
  lastModifiedDate: string;
  lastModifiedBy: string;
  authorities: string[];
  imageUrl: string;
}
```

#### 4. **api.ts** - Configurazione HTTP

- Utilizza **Axios** per le richieste HTTP
- **Base URL**:
- **Timeout**: 10 secondi
- **Interceptore**: Aggiunge automaticamente il token di autenticazione da SecureStore a ogni richiesta

```tsx
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("auth_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

#### 5. **App.tsx** - Stack di Navigazione

- **AuthProvider** avvolge tutta l'app (wrapping)
- **Stack.Navigator** gestisce tre schermi:
  - `Login` (iniziale, nessun header)
  - `Home` (header con titolo)
  - `EditProfile` (header con titolo)

### Flusso Dettagliato Step-by-Step

1. **App Start**
   - App.tsx renderizza il LoginScreen per default
   - AuthProvider fornisce il context globale

2. **Utente Inserisce Credenziali**
   - username e password sono salvati nello state locale di LoginScreen

3. **Utente Clicca "Continue"**
   - Viene chiamato `handleLogin()`

4. **Richiesta Authentication**
   - `login()` invia POST a `/api/authenticate`
   - Backend verifica le credenziali

5. **Token Salvato**
   - Se credenziali corrette, ritorna `id_token`
   - Token salvato in **SecureStore** (memoria crittografata del dispositivo)

6. **Recupero Dati Utente**
   - `loggedAccount()` invia GET a `/api/account`
   - L'interceptor Axios aggiunge automaticamente il token
   - Backend ritorna i dati dell'utente

7. **Aggiornamento Context**
   - `setUser()` aggiorna lo stato globale in AuthContext
   - `isLoggedIn` diventa `true`

8. **Navigazione**
   - `navigation.replace("Home")` naviga alla HomeScreen
   - `replace` (non `navigate`) rimuove LoginScreen dallo stack di navigazione

9. **Persistenza**
   - Token rimane in SecureStore tra i riavvii
   - (Futura implementazione: check token al riavvio per skip LOGIN se ancora valido)

### Logout

```tsx
const logout = () => {
  SecureStore.deleteItemAsync("auth_token");
  setUser(null);
};
```

---

## 🛠️ Tecnologie Utilizzate

| Tecnologia               | Versione | Scopo                    |
| ------------------------ | -------- | ------------------------ |
| **React Native**         | 0.81.5   | Framework per app mobile |
| **Expo**                 | ~54.0.33 | Piattaforma di sviluppo  |
| **React**                | 19.1.0   | Libreria UI              |
| **TypeScript**           | ~5.9.2   | Type safety              |
| **React Navigation**     | ^7.1.28  | Navigazione tra schermi  |
| **Axios**                | ^1.13.5  | Client HTTP              |
| **expo-secure-store**    | ~15.0.8  | Storage crittografato    |
| **expo-linear-gradient** | ~15.0.8  | Sfondi gradient          |

---

## 🔧 Configurazione Base

### API Backend

L'app comunica con un backend su:

- **URL**:
- **Endpoint Login**: POST `/api/authenticate`
- **Endpoint Account**: GET `/api/account`

### Safe Area

L'app utilizza `react-native-safe-area-context` per gestire notch, barre di stato e altri elementi non-sicuri del layout.

### Keyboard Handling

- Utilizza `KeyboardAwareScrollView` per gestire automaticamente lo scroll quando la tastiera appare
- `KeyboardAvoidingView` per iOS specialmente

---

## 📝 Suggerimenti di Sviluppo

1. **Per aggiungere una nuova schermata:**
   - Creare un nuovo file in `screens/`
   - Aggiungere la rotta in `App.tsx` nella `Stack.Navigator`
   - Navigare usando `navigation.navigate("NomeSchermata")`

2. **Per aggiungere componenti riutilizzabili:**
   - Creare il file in `components/`
   - Importarlo negli schermi dove serve
   - Mantenere i componenti il più "dumb" possibile

3. **Per aggiungere costanti:**
   - Aggiungerle in `constants/colors.tsx` o `constants/typography.tsx`
   - Importare e usare in tutta l'app

4. **Per aggiungere servizi API:**
   - Aggiungere funzioni in `services/authService.ts` o creare un nuovo service file
   - Utilizzare l'istanza `api` di Axios per consistenza

---

## 🐛 Troubleshooting

### App non si avvia

```bash
# Pulire cache
rm -rf node_modules
npm install

# Pulire cache Expo
npm start -- --clear
```

### Token non persiste

Verificare che:

- `expo-secure-store` sia installato: `npm install expo-secure-store`
- Il plugin sia abilitato in `app.json`

### Problemi di connessione API

Verificare:

- Backend è in esecuzione su
- IP è raggiungibile dalla rete locale
- Dispositivo test è sulla stessa rete del backend

---

## 📞 Supporto

Per domande o problemi, consultare:

- [Documentazione Expo](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
