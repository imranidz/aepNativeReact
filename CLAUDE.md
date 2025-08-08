# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **WeRetail** - a React Native e-commerce app demonstrating Adobe Experience Platform (AEP) SDK integration with Expo Router. The app serves dual purposes:
1. **Technical View**: Screens for testing and configuring Adobe SDK extensions
2. **Consumer View**: Full e-commerce experience with product catalog, shopping cart, and checkout

## Development Commands

### Core Development
- `npm start` - Start Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run web` - Run on web browser
- `npm test` - Run Jest tests with watch mode
- `npm run lint` - Run Expo linting

### Build Commands
- `npx react-native run-android` - Build and run Android app
- `cd android && ./gradlew clean` - Clean Android build

### Testing
- Uses Jest with `jest-expo` preset
- Run tests: `npm test`
- Test files located in `components/__tests__/`

## Architecture Overview

### Navigation Structure
The app uses **Expo Router** with a hybrid navigation approach:

**Root Layout** (`app/_layout.tsx`):
- Drawer navigation with Technical and Consumer views
- Adobe SDK initialization on app start
- Theme provider (light/dark mode support)
- Cart context provider

**Consumer Tabs** (`app/(consumerTabs)/`):
- Tab-based navigation for main e-commerce flow
- Home, Offers, Cart, Profile tabs
- Product browsing and checkout flow

**Technical Screens** (`app/(techScreens)/`):
- Individual screens for each Adobe SDK extension
- Development and testing interfaces

### Key Components & Context

**CartContext** (`components/CartContext.tsx`):
- Global shopping cart state management
- Cart operations: add, remove, increment, decrement
- TypeScript interfaces for cart items

**ProfileContext** (`components/ProfileContext.js`):
- User profile state management
- Profile storage utilities in `hooks/useProfileStorage.js`

### Adobe SDK Integration

**Configuration** (`src/utils/adobeConfig.ts`):
- Centralized Adobe SDK initialization logic
- App ID configuration and storage
- Extension verification and logging
- **CRITICAL**: Do not modify the initialization sequence - it prevents race conditions

**Supported Adobe Extensions**:
- Core/Lifecycle/Signal
- Edge Network & Edge Identity
- Messaging (Push notifications)
- Target, Optimize, Places
- Assurance, Consent
- User Profile

**Push Notifications** (`src/utils/pushNotifications.ts`):
- Firebase integration for Android
- iOS notification handling
- Send test notifications: `node scripts/send-push-notification.js`

### Data & Content

**Product Data**:
- Static product catalog: `app/productData/bootcamp_products.json`
- Product images: `assets/images/productImages/`
- Categories: Men's/Women's clothing, Equipment

**Routing**:
- Dynamic routes: `[category]` and `[category]/[product]`
- File-based routing with Expo Router

### Configuration Files

**TypeScript**:
- Path mapping: `@/*` points to project root
- Strict mode enabled
- Expo TypeScript base configuration

**Babel**:
- Module resolver with `@` alias
- React Native Reanimated plugin

**Metro**: Standard Expo configuration

## Development Notes

### Adobe SDK Development
- App ID must be configured before SDK functions work
- Debug logging enabled by default
- Extension versions logged on initialization
- Use technical screens for testing individual SDK features

### Platform Considerations
- Firebase setup required for Android push notifications
- iOS requires sandbox configuration for push notifications
- Google Services JSON files included for Firebase

### Known Issues
- Long file paths on Windows (move to shallow directory)
- Splash screen persistence (handled in `_layout.tsx`)
- Path resolution issues (use relative imports if `@/` fails)

### Key File Locations
- Main entry: `App.js` (legacy stack navigator)
- Expo Router entry: `app/_layout.tsx`
- Adobe config: `src/utils/adobeConfig.ts`
- Shared components: `components/`
- Styling: `styles/styles.ts`