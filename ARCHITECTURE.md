# Labor Prep Together — App Architecture

This document describes the production app architecture for the mobile application (React Native + Expo).

## Overview

The app is structured in clean layers:
- **lib/** — Core business logic (database, state management, types, theme)
- **components/** — Reusable UI components
- **data/** — Content as JSON files (not hardcoded)
- **screens/** — (Will be created) Screen/page implementations

## Core Architecture

### 1. Types (`lib/types.ts`)

Defines all TypeScript interfaces based on the PRD data model:
- `AppSettings` — User/partner info and due date
- `BirthPlanAnswer`, `InterventionPref`, `BagItem`, etc. — Feature-specific data
- `DBSchema` — Reflects SQLite table structure

All state management and database queries are typed against these interfaces.

### 2. Database (`lib/db.ts`)

SQLite-based local-first persistence:
- **Schema**: 11 tables matching the data model (app_settings, birth_plan_answers, interventions, etc.)
- **Queries**: Functions for CRUD operations (loadData, saveBirthPlanAnswer, toggleBagItem, etc.)
- **Indices**: Optimized for common queries
- **Helper**: `calculateAppStateSummary()` computes preparation progress

**Key design decisions:**
- All data is stored locally; zero cloud transmission in Stage 1
- Expo SQLite (`expo-sqlite`) handles database on both iOS and Android
- Foreign keys are enabled for data integrity
- WAL mode for concurrent reads

### 3. State Management (`lib/store.ts`)

Zustand-based global state:
- **Store structure**: One `useAppStore` hook containing all app state
- **Data loading**: `loadBirthPlan()`, `loadInterventions()`, etc.
- **Mutations**: `saveBirthPlanAnswer()`, `toggleBagItem()`, etc.
- **Progress**: `calculateProgress()` updates preparation score when data changes

**Design pattern:**
```typescript
// Screens use the store like this:
const { birthPlanAnswers, saveBirthPlanAnswer } = useAppStore();
await saveBirthPlanAnswer(questionId, answer);
```

The store dispatches database queries on mutations and always keeps in-memory state in sync with SQLite.

### 4. Design System (`lib/theme.ts`)

"Serene Navigator" visual design system:
- **Colors**: Primary teal (#2d6e6e), cream surfaces, earth tones
- **Typography**: Fraunces (display), Source Sans 3 (body)
- **Spacing**: Consistent scale (4, 8, 12, 16, 20, 24, 32)
- **Border radius**: Large (12, 16) for safety perception
- **Shadows**: Subtle, never harsh
- **Component presets**: Button styles, card styles, input styles

Dark mode colors are included for labor room use (low-light compatibility).

## Component Library

### Core Components (`components/`)

These are reusable building blocks for screens:

| Component | Purpose | Props |
|-----------|---------|-------|
| `Button` | Action buttons | label, variant (primary/secondary/tertiary), size, disabled |
| `Card` | Content wrapper | children, accent, warning |
| `Input` | Text input/textarea | label, multiline, error, placeholder |
| `QuestionCard` | Interview-style prompt | question, subtitle, large |
| `Chip` | Choice button | label, selected, disabled |
| `ChecklistItem` | Checkbox + label | label, checked, detail |
| `SectionTitle` | Screen header | icon, title, subtitle |
| `ProgressBar` | Progress indicator | current, total, showLabel |

All components:
- Use theme tokens (colors, spacing, typography)
- Support dark mode (colors come from theme, not hardcoded)
- Have 44+px touch targets (accessible)
- Render correctly on all screen sizes

### Component Example

```typescript
// Birth Plan Screen (pseudocode)
function BirthPlanScreen() {
  const { birthPlanAnswers, saveBirthPlanAnswer } = useAppStore();
  const question = BIRTH_PLAN_QUESTIONS[0];

  return (
    <ScrollView>
      <SectionTitle icon="📋" title="Birth Plan" />
      <QuestionCard question={question.question}>
        {question.type === 'text' ? (
          <Input
            multiline
            value={birthPlanAnswers[question.id] || ''}
            onChangeText={(text) => saveBirthPlanAnswer(question.id, text)}
          />
        ) : (
          question.options.map(opt => (
            <Chip
              key={opt}
              label={opt}
              selected={birthPlanAnswers[question.id] === opt}
              onPress={() => saveBirthPlanAnswer(question.id, opt)}
            />
          ))
        )}
      </QuestionCard>
    </ScrollView>
  );
}
```

## Content as Data

### Advantages

Content is stored in JSON files, not hardcoded:
- Easy to update without touching code (CSV → JSON conversion)
- Trivial to support content management later
- Single source of truth for questions, interventions, bag items
- Content changes don't require app rebuild

### Content Files (`data/`)

| File | Purpose | Records |
|------|---------|---------|
| `birthPlanQuestions.json` | Interview flow | 9 questions (text + choice) |
| `interventions.json` | Medical interventions | 11 interventions with defaults |
| `bagCategories.json` | Packing checklist | 10 categories, ~90 items |
| `partnerTips.json` | Contextual tips | 7 categories, 40+ tips |

All JSON is typed: `BirthPlanQuestion[]`, `Intervention[]`, etc.

### Loading Content at Runtime

```typescript
// In useEffect or screen initialization:
import birthPlanQuestions from '../data/birthPlanQuestions.json';

birthPlanQuestions.forEach(q => {
  // Render question, load/save answers from store
});
```

## Data Flow

### User Input → Database → UI

```
User fills birth plan question
         ↓
Button calls: saveBirthPlanAnswer(questionId, answer)
         ↓
Zustand action calls: db.saveBirthPlanAnswer()
         ↓
SQLite stores: INSERT INTO birth_plan_answers
         ↓
Zustand updates in-memory state: birthPlanAnswers[questionId] = answer
         ↓
React re-renders screen with new answer
```

### Reading Data on App Startup

```
App mounts
    ↓
initializeAppStore() called
    ↓
Sequential loading:
  - loadSettings()
  - loadBirthPlan()
  - loadInterventions()
  - loadBagItems()
  - ... etc
    ↓
calculateProgress()
    ↓
setInitialized(true)
    ↓
Screens can now render data
```

## Stage-Based Implementation

### Stage 1 MVP (Core Loop)

**Screens to build:**
1. Welcome
2. Birth Plan Interview
3. Interventions
4. Comfort & Vibes (affirmations)
5. Food Preferences
6. Labor Bag
7. Game Plan Review

**Feature flags:** None needed yet (no advanced features)

### Stage 2 Depth & Polish

**Screens to add:**
- Partner Playbook
- Comfort Techniques + videos
- Music Planner
- Questions for Provider

**Storage changes:** None (same SQLite schema)

### Stage 3 Experience & Sharing

**Screens to add:**
- Labor Mode (simplified UI for active use)
- Dashboard (timeline, progress)
- Contraction Timer

**Storage changes:** Add `firebase_sync` table for Stage 3+ cloud sync

## Platform-Specific Considerations

### iOS
- Safe areas and notch handling (React Navigation handles this)
- Dark mode support (theme provides both light and dark colors)
- Gesture-based back navigation (React Navigation)
- App Store submission via Expo EAS

### Android
- Hardware back button handling (React Navigation)
- Material Design 3 components (React Native Paper)
- Large screen support (flexible layouts)
- Google Play submission via Expo EAS

## Testing Strategy

### Unit Tests
- Data transformations (bag items filtering, progress calculation)
- Store mutations (state updates)
- Content loading (JSON parsing)

### Integration Tests
- Full flow: load data → update → verify database
- Multiple screens: navigate, modify data, return

### Manual Testing
- iOS simulator + Android emulator
- Light + dark mode
- Offline mode (disconnect WiFi)
- Different screen sizes (phone, tablet)

## Future Extensibility

### Cloud Sync (Stage 2+)

Adding cloud sync requires:
1. User authentication (Firebase Auth or Supabase)
2. Cloud database (Firestore or Supabase Postgres)
3. Conflict resolution (last-write-wins or vector clocks)

Zustand store can dispatch cloud queries alongside SQLite:
```typescript
// Example: save data locally AND sync to cloud
await db.saveBirthPlanAnswer(...);
if (hasCloudSync) await cloud.saveBirthPlanAnswer(...);
```

### New Features

Adding a new section (e.g., "Video Library Tracker"):
1. Add `Videos` interface to `lib/types.ts`
2. Add SQLite table in `lib/db.ts`
3. Add store actions in `lib/store.ts`
4. Create JSON content file in `data/videos.json`
5. Build screen component
6. Add navigation routing
7. Done!

No code duplication; patterns are consistent across all features.

## Common Workflows

### Add a Birth Plan Question

1. Edit `data/birthPlanQuestions.json` — add new object
2. Screen automatically displays new question (reads from file)
3. User's answer is saved via `saveBirthPlanAnswer()`
4. Done!

### Update Intervention Default Preference

1. Edit `data/interventions.json` — update `defaultPref` field
2. No code changes needed
3. Next user sees new default when app loads

### Add a Bag Item

1. Edit `data/bagCategories.json` — add item to category
2. Re-open bag section — new item appears
3. User toggles `packed` via `toggleBagItem()`

All without touching TypeScript code!

---

**Next steps:** Implement screens using these components and the patterns described above. Start with Welcome and Birth Plan screens (Stage 1a/1c in PRD).
