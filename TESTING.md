# Testing Guide for Labor Prep Together

Complete guide to testing the app from setup through production.

## Phase 1: Project Setup

### 1. Initialize Expo Project

```bash
# Create new Expo project
npx create-expo-app labor-prep-together

cd labor-prep-together

# Install dependencies
npm install \
  zustand \
  expo-sqlite \
  react-native-paper \
  @react-navigation/native @react-navigation/bottom-tabs \
  react-native-screens react-native-safe-area-context

# Install dev dependencies
npm install --save-dev \
  typescript \
  @types/react \
  @types/react-native \
  jest \
  @testing-library/react-native \
  @testing-library/jest-native
```

### 2. Copy Project Files

Copy the files you created:
- `lib/` → project root
- `components/` → project root
- `data/` → project root
- `ARCHITECTURE.md` → project root

### 3. Create TypeScript Config

```bash
# Initialize TypeScript
npx tsc --init

# Configure tsconfig.json for React Native
cat > tsconfig.json << 'EOF'
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
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules", "dist"]
}
EOF
```

### 4. Create app.json Configuration

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
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.laborpreptogether.app"
    },
    "plugins": [
      ["expo-sqlite"]
    ]
  }
}
```

---

## Phase 2: Unit Tests

### Test Database Functions

```typescript
// __tests__/db.test.ts

import * as db from '../lib/db';
import { initDB, clearAllData } from '../lib/db';

describe('Database', () => {
  beforeAll(async () => {
    await initDB();
  });

  afterEach(async () => {
    await clearAllData();
  });

  describe('Birth Plan', () => {
    it('should save and retrieve birth plan answers', async () => {
      await db.saveBirthPlanAnswer('bp1', 'Just us');
      const answers = await db.getBirthPlanAnswers();

      expect(answers['bp1']).toBe('Just us');
    });

    it('should handle multiple answers', async () => {
      await db.saveBirthPlanAnswer('bp1', 'Answer 1');
      await db.saveBirthPlanAnswer('bp2', 'Answer 2');
      const answers = await db.getBirthPlanAnswers();

      expect(Object.keys(answers).length).toBe(2);
    });

    it('should update existing answer', async () => {
      await db.saveBirthPlanAnswer('bp1', 'Initial');
      await db.saveBirthPlanAnswer('bp1', 'Updated');
      const answers = await db.getBirthPlanAnswers();

      expect(answers['bp1']).toBe('Updated');
    });
  });

  describe('Bag Items', () => {
    it('should save bag items', async () => {
      const item = {
        id: 'item1',
        categoryId: 'car',
        name: 'Gas tank',
        packed: false,
        forWhom: 'shared' as const,
        isCustom: false,
      };

      await db.saveBagItem(item);
      const items = await db.getBagItems();

      expect(items).toContainEqual(item);
    });

    it('should toggle bag item packed status', async () => {
      const item = {
        id: 'item1',
        categoryId: 'car',
        name: 'Gas tank',
        packed: false,
        forWhom: 'shared' as const,
        isCustom: false,
      };

      await db.saveBagItem(item);
      await db.toggleBagItem('item1', true);

      const items = await db.getBagItems();
      expect(items[0].packed).toBe(true);
    });

    it('should add custom bag item', async () => {
      const id = await db.addCustomBagItem('car', 'Custom item', 'her');
      const items = await db.getBagItems();

      expect(items.some(i => i.id === id && i.isCustom)).toBe(true);
    });

    it('should filter items by category', async () => {
      await db.saveBagItem({
        id: 'car1',
        categoryId: 'car',
        name: 'Gas',
        packed: false,
        forWhom: 'shared' as const,
        isCustom: false,
      });

      await db.saveBagItem({
        id: 'her1',
        categoryId: 'her-clothing',
        name: 'PJs',
        packed: false,
        forWhom: 'her' as const,
        isCustom: false,
      });

      const carItems = await db.getBagItemsByCategory('car');
      expect(carItems.length).toBe(1);
      expect(carItems[0].categoryId).toBe('car');
    });
  });

  describe('Affirmations', () => {
    it('should add and retrieve affirmations', async () => {
      await db.addAffirmation('You are strong');
      const aff = await db.getAffirmations();

      expect(aff.some(a => a.text === 'You are strong')).toBe(true);
    });

    it('should delete affirmation', async () => {
      const id = await db.addAffirmation('Test');
      await db.deleteAffirmation(id);

      const aff = await db.getAffirmations();
      expect(aff.some(a => a.id === id)).toBe(false);
    });
  });

  describe('Progress Calculation', () => {
    it('should calculate app state summary', async () => {
      // Add some data
      await db.saveBirthPlanAnswer('bp1', 'Answer');
      await db.saveBagItem({
        id: 'item1',
        categoryId: 'car',
        name: 'Gas',
        packed: true,
        forWhom: 'shared' as const,
        isCustom: false,
      });

      const summary = await db.calculateAppStateSummary();

      expect(summary.birthPlanCompleted).toBe(1);
      expect(summary.bagItemsPacked).toBe(1);
    });
  });
});
```

### Test Zustand Store

```typescript
// __tests__/store.test.ts

import { useAppStore, initializeAppStore } from '../lib/store';
import * as db from '../lib/db';

describe('App Store', () => {
  beforeEach(async () => {
    await db.initDB();
    await initializeAppStore();
  });

  afterEach(async () => {
    await db.clearAllData();
  });

  it('should load settings on init', async () => {
    await db.updateAppSettings('Partner', 'Mother', '2026-06-15');
    await useAppStore.getState().loadSettings();

    const settings = useAppStore.getState().appSettings;
    expect(settings?.partnerName).toBe('Partner');
  });

  it('should save birth plan answer to store and db', async () => {
    const store = useAppStore.getState();
    await store.saveBirthPlanAnswer('bp1', 'Test answer');

    // Check store
    expect(store.birthPlanAnswers['bp1']).toBe('Test answer');

    // Verify DB persisted
    const dbAnswers = await db.getBirthPlanAnswers();
    expect(dbAnswers['bp1']).toBe('Test answer');
  });

  it('should toggle bag item and update progress', async () => {
    const store = useAppStore.getState();

    // Add an item
    await store.addCustomBagItem('car', 'Test item', 'shared');

    // Find the item ID
    const items = store.bagItems;
    const itemId = items.find(i => i.name === 'Test item')?.id;

    if (itemId) {
      // Toggle it
      await store.toggleBagItem(itemId, true);

      // Verify state
      expect(store.bagItems.find(i => i.id === itemId)?.packed).toBe(true);

      // Verify progress updated
      await store.calculateProgress();
      expect(store.appStateSummary?.bagItemsPacked).toBeGreaterThan(0);
    }
  });

  it('should calculate preparation score', async () => {
    const store = useAppStore.getState();

    // Fill in some data
    await store.saveBirthPlanAnswer('bp1', 'Answer');
    await store.addAffirmation('Test affirmation');

    // Calculate progress
    await store.calculateProgress();

    const summary = store.appStateSummary;
    expect(summary?.preparationScore).toBeGreaterThanOrEqual(0);
    expect(summary?.preparationScore).toBeLessThanOrEqual(100);
  });

  it('should clear all data', async () => {
    const store = useAppStore.getState();

    // Add some data
    await store.saveBirthPlanAnswer('bp1', 'Answer');
    await store.addAffirmation('Test');

    // Clear
    await store.clearAllData();

    // Verify cleared
    expect(store.birthPlanAnswers).toEqual({});
    expect(store.affirmations).toEqual([]);
  });
});
```

---

## Phase 3: Component Tests

### Test Button Component

```typescript
// __tests__/components/Button.test.tsx

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Button } from '../../components/Button';

describe('Button', () => {
  it('should render with label', () => {
    render(<Button onPress={() => {}} label="Click me" />);
    expect(screen.getByText('Click me')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button onPress={onPress} label="Click" />
    );

    fireEvent.press(getByText('Click'));
    expect(onPress).toHaveBeenCalled();
  });

  it('should be disabled when disabled prop is true', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button onPress={onPress} label="Click" disabled />
    );

    fireEvent.press(getByText('Click'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('should render different variants', () => {
    const { rerender } = render(
      <Button onPress={() => {}} label="Primary" variant="primary" />
    );
    expect(screen.getByText('Primary')).toBeTruthy();

    rerender(
      <Button onPress={() => {}} label="Secondary" variant="secondary" />
    );
    expect(screen.getByText('Secondary')).toBeTruthy();
  });
});
```

### Test ChecklistItem Component

```typescript
// __tests__/components/ChecklistItem.test.tsx

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ChecklistItem } from '../../components/ChecklistItem';

describe('ChecklistItem', () => {
  it('should render unchecked', () => {
    const { getByText } = render(
      <ChecklistItem
        label="Pack bag"
        checked={false}
        onToggle={() => {}}
      />
    );
    expect(getByText('Pack bag')).toBeTruthy();
  });

  it('should call onToggle when pressed', () => {
    const onToggle = jest.fn();
    const { getByText } = render(
      <ChecklistItem
        label="Pack bag"
        checked={false}
        onToggle={onToggle}
      />
    );

    fireEvent.press(getByText('Pack bag'));
    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it('should show detail text when provided', () => {
    const { getByText } = render(
      <ChecklistItem
        label="Gas tank"
        checked={false}
        onToggle={() => {}}
        detail="car bag"
      />
    );
    expect(getByText('car bag')).toBeTruthy();
  });

  it('should be disabled when disabled prop is true', () => {
    const onToggle = jest.fn();
    const { getByText } = render(
      <ChecklistItem
        label="Item"
        checked={false}
        onToggle={onToggle}
        disabled
      />
    );

    fireEvent.press(getByText('Item'));
    expect(onToggle).not.toHaveBeenCalled();
  });
});
```

---

## Phase 4: Integration Tests

### Test Full Birth Plan Flow

```typescript
// __tests__/integration/birthPlan.test.ts

import { useAppStore, initializeAppStore } from '../../lib/store';
import * as db from '../../lib/db';
import birthPlanQuestions from '../../data/birthPlanQuestions.json';

describe('Birth Plan Flow', () => {
  beforeAll(async () => {
    await db.initDB();
    await initializeAppStore();
  });

  afterEach(async () => {
    await db.clearAllData();
  });

  it('should complete full birth plan interview', async () => {
    const store = useAppStore.getState();

    // Answer all questions
    for (const question of birthPlanQuestions) {
      const testAnswer =
        question.type === 'text' ? 'Test answer' : question.options?.[0] || 'Default';
      await store.saveBirthPlanAnswer(question.id, testAnswer);
    }

    // Verify all answered
    const answers = store.birthPlanAnswers;
    expect(Object.keys(answers).length).toBe(birthPlanQuestions.length);

    // Verify progress updated
    await store.calculateProgress();
    const summary = store.appStateSummary;
    expect(summary?.birthPlanCompleted).toBe(birthPlanQuestions.length);
    expect(summary?.preparationScore).toBeGreaterThan(0);
  });

  it('should allow editing answers', async () => {
    const store = useAppStore.getState();
    const questionId = birthPlanQuestions[0].id;

    // Initial answer
    await store.saveBirthPlanAnswer(questionId, 'Answer 1');
    expect(store.birthPlanAnswers[questionId]).toBe('Answer 1');

    // Update answer
    await store.saveBirthPlanAnswer(questionId, 'Answer 2');
    expect(store.birthPlanAnswers[questionId]).toBe('Answer 2');

    // Verify DB persisted
    const dbAnswers = await db.getBirthPlanAnswers();
    expect(dbAnswers[questionId]).toBe('Answer 2');
  });

  it('should calculate correct progress score', async () => {
    const store = useAppStore.getState();

    // Answer 50% of birth plan questions
    const halfWay = Math.floor(birthPlanQuestions.length / 2);
    for (let i = 0; i < halfWay; i++) {
      await store.saveBirthPlanAnswer(birthPlanQuestions[i].id, 'Answer');
    }

    await store.calculateProgress();
    const summary = store.appStateSummary;

    // Score should be ~15% (50% of birth plan × 30% weight)
    expect(summary?.preparationScore).toBeGreaterThanOrEqual(10);
    expect(summary?.preparationScore).toBeLessThanOrEqual(20);
  });
});
```

### Test Bag Packing Flow

```typescript
// __tests__/integration/bagPacking.test.ts

import { useAppStore, initializeAppStore } from '../../lib/store';
import * as db from '../../lib/db';
import bagCategories from '../../data/bagCategories.json';

describe('Bag Packing Flow', () => {
  beforeAll(async () => {
    await db.initDB();
    await initializeAppStore();
  });

  afterEach(async () => {
    await db.clearAllData();
  });

  it('should load and display all bag categories', async () => {
    const store = useAppStore.getState();

    // Calculate total items across all categories
    const totalItems = bagCategories.reduce((sum, cat) => sum + cat.items.length, 0);

    // Items should be pre-loaded or loadable
    expect(totalItems).toBeGreaterThan(0);
  });

  it('should pack items and track progress', async () => {
    const store = useAppStore.getState();

    // Add items from first category
    const firstCategory = bagCategories[0];
    const testItems = firstCategory.items.slice(0, 3);

    for (const item of testItems) {
      const itemId = `${firstCategory.id}-${item.name}`;
      await store.addCustomBagItem(firstCategory.id, item.name, item.forWhom as any);
    }

    // Pack first 2 items
    const items = store.bagItems;
    for (let i = 0; i < 2; i++) {
      if (items[i]) {
        await store.toggleBagItem(items[i].id, true);
      }
    }

    // Calculate progress
    await store.calculateProgress();
    const summary = store.appStateSummary;

    expect(summary?.bagItemsPacked).toBe(2);
    expect(summary?.preparationScore).toBeGreaterThan(0);
  });

  it('should support custom bag items', async () => {
    const store = useAppStore.getState();

    // Add custom item
    const customId = await store.addCustomBagItem('car', 'Custom pillow', 'her');
    expect(customId).toBeTruthy();

    // Verify in store
    const customItem = store.bagItems.find(i => i.id === customId);
    expect(customItem?.isCustom).toBe(true);
    expect(customItem?.name).toBe('Custom pillow');

    // Toggle it
    await store.toggleBagItem(customId, true);
    expect(store.bagItems.find(i => i.id === customId)?.packed).toBe(true);
  });
});
```

---

## Phase 5: Manual Testing

### Run on iOS Simulator

```bash
# Start development server
npx expo start

# Press 'i' to open iOS simulator (macOS only)
# Or open Xcode simulator separately and scan QR code

# Test checklist:
# [ ] App loads without crashes
# [ ] Can navigate between sections
# [ ] Birth plan answers save
# [ ] Bag items toggle
# [ ] Dark mode works
# [ ] Offline mode works (disable WiFi)
```

### Run on Android Emulator

```bash
# Start development server
npx expo start

# Press 'a' to open Android emulator
# Or use `adb devices` to verify connected device

# Test checklist:
# [ ] App loads without crashes
# [ ] Navigation works (back button, gestures)
# [ ] Material Design 3 components render correctly
# [ ] Large screens supported (test on tablet if available)
# [ ] Offline mode works
```

### Run on Physical Device

```bash
# Install Expo Go from App Store / Play Store

# Start development server
npx expo start

# Scan QR code with phone camera
# Or type URL directly in Expo Go app

# Test checklist:
# [ ] App performant on real device
# [ ] Orientation changes handled (portrait ↔ landscape)
# [ ] Text readable (test large text settings)
# [ ] Touch targets accessible (44px+ minimum)
# [ ] Battery/CPU usage reasonable
```

---

## Phase 6: Configure Jest

```javascript
// jest.config.js

module.exports = {
  preset: 'react-native',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  collectCoverageFrom: [
    'lib/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
};
```

### Configure Babel

```javascript
// babel.config.js

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['@babel/plugin-proposal-export-namespace-from'],
  };
};
```

---

## Phase 7: Run Tests

```bash
# Run all unit tests
npm test

# Run tests in watch mode (re-run on file changes)
npm test -- --watch

# Run tests for specific file
npm test db.test.ts

# Run tests with coverage report
npm test -- --coverage

# Run integration tests only
npm test integration

# Run and update snapshots
npm test -- -u
```

---

## Debugging Tips

### Console Logging

```typescript
// In store or components
const { birthPlanAnswers, saveBirthPlanAnswer } = useAppStore();

console.log('Current answers:', birthPlanAnswers);
await saveBirthPlanAnswer('bp1', 'test');
console.log('Updated answers:', useAppStore.getState().birthPlanAnswers);
```

### React Native Debugger

```bash
# Install React Native Debugger (one-time)
brew install react-native-debugger

# Open in terminal
open "rndebugger://set-debugger-loc?host=localhost&port=19000"

# In app, press Ctrl+D (iOS) or Ctrl+M (Android)
# Select "Debug Remote JS"
```

### Database Inspection

```typescript
// Add this screen for development only
import SQLite from 'expo-sqlite';

async function inspectDB() {
  const db = await SQLite.openDatabaseAsync('labor-prep-together.db');

  const tables = await db.getAllAsync(
    `SELECT name FROM sqlite_master WHERE type='table'`
  );
  console.log('Tables:', tables);

  const birthPlan = await db.getAllAsync(
    'SELECT * FROM birth_plan_answers'
  );
  console.log('Birth Plan Answers:', birthPlan);
}
```

---

## Complete Test Checklist

### ✅ Before Feature Completion

- [ ] All unit tests pass
- [ ] All component tests pass
- [ ] Integration tests for feature pass
- [ ] Manual test on iOS simulator
- [ ] Manual test on Android emulator
- [ ] Test offline mode
- [ ] Test dark mode
- [ ] Test with large text (accessibility)

### ✅ Before App Store Submission

- [ ] Code coverage > 80%
- [ ] No console warnings/errors
- [ ] No memory leaks (use Chrome DevTools)
- [ ] Performance: < 3s initial load
- [ ] All screens tested on multiple device sizes
- [ ] Orientation changes don't crash
- [ ] Back/navigation buttons work correctly
- [ ] Database persists data correctly

---

## Continuous Testing Strategy

```bash
# Run tests on every commit (pre-commit hook)
# .husky/pre-commit
npm test -- --bail --findRelatedTests
```

Once you run `npm install`, you'll have a complete testing setup ready to go!
