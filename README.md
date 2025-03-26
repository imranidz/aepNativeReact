# AEPSampleAppNewArchEnabled

A sample React Native application demonstrating Adobe Experience Platform (AEP) SDK integration with the **New Architecture** (Fabric + TurboModules) enabled for both iOS and Android.

---

## ✨ Features

- Core, Lifecycle, and Signal support
- Identity management
- User Profile
- Messaging (Push, In-app)
- Adobe Optimize
- Edge Network integration
- Consent management (AEP Edge Consent)
- Edge Bridge
- Assurance
- Target
- Places

---

## 🛠️ Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- [Java 17 JDK](https://adoptium.net/)
- [Android Studio](https://developer.android.com/studio) (with SDK + Emulator)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- Git
- PowerShell (for Windows users)

---

## 🚀 Installation Steps

### 1. Clone the Adobe SDK mono-repo
```sh
C:\> git clone https://github.com/adobe/aepsdk-react-native.git aepsdk
```

### 2. Move New Architecture App to Root (Windows Path Fix)
```powershell
Move-Item "C:\aepsdk\apps\AEPSampleAppNewArchEnabled" "C:\AEPSampleAppNewArchEnabled"
cd C:\AEPSampleAppNewArchEnabled
```

### 3. Create Metro Config File
Create a `metro.config.js` file at the root with:
```js
const { getDefaultConfig } = require('@expo/metro-config');
const config = getDefaultConfig(__dirname);
module.exports = config;
```

### 4. Install Dependencies
```sh
npm install
```

---

## 🚄 Running the App (Android)

Open **two terminals**:

### Terminal 1: Start Metro Bundler
```sh
npx react-native start
```

### Terminal 2: Build & Install Android App
```sh
cd android
./gradlew clean
cd ..
npx react-native run-android
```

### Optional: Kill Stuck Background Processes
Run as admin:
```powershell
Stop-Process -Name "java" -Force -ErrorAction SilentlyContinue
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
Stop-Process -Name "adb" -Force -ErrorAction SilentlyContinue
Stop-Process -Name "gradle" -Force -ErrorAction SilentlyContinue
```

---

## 🌐 Project Structure

```
/app            - App screens and navigation
/components     - Shared UI components
/hooks          - Custom React hooks
/styles         - Theme and style constants
/constants      - Environment and SDK constants
/types          - TypeScript interfaces
/assets         - Static images and resources
```

---

## ⚠️ Known Issues & Fixes

### Issue: Long File Paths on Windows
**Fix**: Move the project to a shallow path (e.g., `C:\AEPSampleAppNewArchEnabled`)

---

### Issue: Metro Bundler can't resolve `@/components/...`
**Fix**: Use relative paths instead:
```ts
import { ThemedText } from '../components/ThemedText';
```

---

### Issue: Splash screen stays forever
**Fix**:
- Ensure `_layout.tsx` handles splash correctly
- Add `useEffect` to load app and call `SplashScreen.hideAsync()` after ready

---

## 🎓 Adobe SDK Integration Summary

### AdobeConfig.h (iOS) & build.gradle (Android)
- Configure environment ID: `d4b7d80f6e21/6b1086c5b3d0/launch-065f91be4881-development`
- Add lifecycle/start logic

### AdobeBridge.m (iOS)
- Init MobileCore, Edge, Target
- Register SDK extensions

---

## 🌌 GitHub Setup

```sh
git init
git remote add origin https://github.com/dloyd09/aepNativeReact.git
git config --global --add safe.directory C:/AEPSampleAppNewArchEnabled
echo node_modules/ >> .gitignore
git add .
git commit -m "Initial commit"
git push -u origin main --force
```

---

## 🔧 License

Licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0)

