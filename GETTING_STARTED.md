# Getting Started — Setup & Testing Guide

Complete walkthrough from zero to testing the app.

## Step 1: Create Expo Project (5 minutes)

```bash
# Create new Expo project
npx create-expo-app labor-prep-together
cd labor-prep-together

# Initialize git
git init
git add .
git commit -m "Initial Expo setup"
```

## Step 2: Install Dependencies (3 minutes)

```bash
npm install \
  zustand \
  expo-sqlite \
  react-native-paper \
  @react-navigation/native \
  @react-navigation/bottom-tabs \
  react-native-screens \
  react-native-safe-area-context

npm install --save-dev \
  typescript \
  @types/react \
  @types/react-native \
  jest \
  @testing-library/react-native \
  @testing-library/jest-native \
  babel-jest \
  @babel/preset-typescript
```

## Step 3: Copy Project Files (2 minutes)

From your Labor App v3 project directory:

```bash
# Copy architecture files to your Expo project
cp -r lib/ /path/to/labor-prep-together/
cp -r components/ /path/to/labor-prep-together/
cp -r data/ /path/to/labor-prep-together/
cp ARCHITECTURE.md /path/to/labor-prep-together/
cp TESTING.md /path/to/labor-prep-together/
```

## Step 4: Create Config Files (2 minutes)

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020"],
    "jsx": "react",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### jest.config.js
```javascript
module.exports = {
  preset: 'react-native',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
};
```

### babel.config.js
```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
```

### app.json
```json
{
  "expo": {
    "name": "Labor Prep Together",
    "slug": "labor-prep-together",
    "version": "1.0.0",
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTabletMode": true,
      "bundleIdentifier": "com.laborpreptogether.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png"
      },
      "package": "com.laborpreptogether.app"
    },
    "plugins": ["expo-sqlite"]
  }
}
```

## Step 5: Create Root Component (3 minutes)

### App.tsx
```typescript
import React, { useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet } from 'react-native';
import { initDB } from './lib/db';
import { initializeAppStore } from './lib/store';
import { colors } from './lib/theme';
import { Button } from './components';

export default function App() {
  const [initialized, setInitialized] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    const startup = async () => {
      try {
        await initDB();
        await initializeAppStore();
        setInitialized(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    startup();
  }, []);

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.error}>Error: {error}</Text>
      </SafeAreaView>
    );
  }

  if (!initialized) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loading}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Labor Prep Together</Text>
        <Text style={styles.subtitle}>
          Architecture & components ready to build
        </Text>
        <Button
          label="Open ARCHITECTURE.md to get started"
          onPress={() => console.log('See ARCHITECTURE.md for building screens')}
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    marginTop: 20,
  },
  loading: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  error: {
    fontSize: 16,
    color: colors.error,
    margin: 20,
  },
});
```

## Step 6: Test on Simulators (5 minutes)

### iOS Simulator
```bash
# Start dev server
npm start

# Press 'i' to open iOS simulator
# Or manually: Xcode > Open Developer Tool > Simulator
```

### Android Emulator
```bash
# Start dev server
npm start

# Press 'a' to open Android emulator
# Or: Android Studio > AVD Manager > launch emulator
```

### Test Checklist
- [ ] App loads without errors
- [ ] Title displays correctly
- [ ] Button is clickable
- [ ] Dark mode works (device settings)
- [ ] Safe area respected

## Step 7: Run Unit Tests (3 minutes)

```bash
# Create test directory
mkdir -p __tests__

# Copy test files from TESTING.md

# Run tests
npm test

# You should see:
# PASS  __tests__/db.test.ts
# PASS  __tests__/store.test.ts
# PASS  __tests__/components/Button.test.tsx
```

## Next: Build Your First Screen

Once everything is set up and tests are passing:

1. **Read ARCHITECTURE.md** — Understand data flow and patterns
2. **Pick a screen** — Birth Plan Interview is simplest
3. **Create screen component**:
   ```typescript
   // screens/BirthPlanScreen.tsx
   import React from 'react';
   import { ScrollView } from 'react-native';
   import { SectionTitle, QuestionCard, Input, Chip, Button } from '../components';
   import { useAppStore } from '../lib/store';
   import birthPlanQuestions from '../data/birthPlanQuestions.json';

   export function BirthPlanScreen() {
     const { birthPlanAnswers, saveBirthPlanAnswer } = useAppStore();

     return (
       <ScrollView>
         <SectionTitle
           icon="📋"
           title="Birth Plan Interview"
           subtitle="Sit with her and ask these questions..."
         />
         {/* Render questions using QuestionCard component */}
       </ScrollView>
     );
   }
   ```

4. **Add routing** — Use React Navigation
5. **Test manually** — Use app on simulator
6. **Write unit tests** — Test components and data flow
7. **Add to app** — Integrate into main navigation

## Troubleshooting

### "Module not found" errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm start -- --clear
```

### "Cannot read property 'initDB'"
```bash
# Make sure expo-sqlite is installed
npm install expo-sqlite
# Update app.json plugins: ["expo-sqlite"]
```

### Tests failing
```bash
# Clear Jest cache
npm test -- --clearCache

# Run specific test file
npm test -- db.test.ts
```

### Slow on Android emulator
```bash
# Use hardware acceleration
# Android Studio > Settings > Emulator > Enable GPU
# Or use physical device via `adb`
```

---

## Project Structure After Setup

```
labor-prep-together/
├── app.json                    # Expo config
├── App.tsx                     # Root component
├── package.json
├── tsconfig.json
├── jest.config.js
├── babel.config.js
├── lib/
│   ├── types.ts               # TypeScript interfaces
│   ├── db.ts                  # SQLite queries
│   ├── store.ts               # Zustand state
│   └── theme.ts               # Design tokens
├── components/
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── QuestionCard.tsx
│   ├── ChecklistItem.tsx
│   ├── Chip.tsx
│   ├── SectionTitle.tsx
│   ├── ProgressBar.tsx
│   └── index.ts
├── data/
│   ├── birthPlanQuestions.json
│   ├── interventions.json
│   ├── bagCategories.json
│   └── partnerTips.json
├── __tests__/
│   ├── db.test.ts
│   ├── store.test.ts
│   ├── integration/
│   │   ├── birthPlan.test.ts
│   │   └── bagPacking.test.ts
│   └── components/
│       ├── Button.test.tsx
│       └── ChecklistItem.test.tsx
├── ARCHITECTURE.md             # Full architecture guide
└── TESTING.md                  # Complete testing guide
```

---

## Timeline

| Phase | Task | Duration |
|-------|------|----------|
| 1 | Create Expo project | 5 min |
| 2 | Install dependencies | 3 min |
| 3 | Copy project files | 2 min |
| 4 | Create config files | 2 min |
| 5 | Create root App.tsx | 3 min |
| 6 | Test on simulators | 5 min |
| 7 | Run unit tests | 3 min |
| **Total** | **Complete setup** | **~25 min** |

After setup, you're ready to build screens using the architecture and component library!

---

## Resources

- **ARCHITECTURE.md** — Detailed architecture explanation
- **TESTING.md** — Complete testing guide with examples
- **CLAUDE.md** — AI assistant guidelines
- **components/index.ts** — Component exports for easy imports

Read ARCHITECTURE.md next to understand how to build screens using the patterns described.
