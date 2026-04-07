# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Labor Prep Together** is a **native iOS and Android mobile app** that guides birth partners through structured interview flows to build a comprehensive labor preparation plan. The app will be distributed through Apple App Store and Google Play Store.

**Status:** Production implementation in progress (Stage 1 MVP). The `labor-prep-partner.jsx` prototype validated UX/information architecture only — production codebase is built on React Native + Expo.

**Key Documents:**
- `Labor_Prep_Together_PRD.md` — Complete product requirements
- `stitch Design files/serene_shore/DESIGN.md` — "Serene Navigator" design system with teal (#2d6e6e), premium editorial aesthetic
- `ARCHITECTURE.md` — Detailed technical documentation of all layers and design patterns
- `TESTING.md` — Testing strategy, unit/integration test examples, device testing checklist
- `GETTING_STARTED.md` — 7-step setup guide

## Technology Stack

**React Native + Expo** compiles a single TypeScript codebase to iOS and Android binaries:
- **Runtime:** React Native with Expo
- **State management:** Zustand (with SQLite persistence)
- **Database:** SQLite (expo-sqlite) — all data stays on-device in Stage 1
- **Navigation:** React Navigation (bottom tabs for main flow)
- **UI Components:** Custom component library respecting "Serene Navigator" design system
- **Type safety:** TypeScript strict mode throughout
- **Testing:** Jest + @testing-library/react-native

**Key build scripts:**
```
npm start          # Start Expo dev server (choose ios/android/web)
npm run ios        # Build and run on iOS simulator
npm run android    # Build and run on Android emulator
npm test           # Run Jest tests
npm test:watch     # Run tests in watch mode
npm run lint       # TypeScript type checking
```

## Architecture Overview

### Navigation Layer
- **React Navigation** with `createBottomTabNavigator()` for main app flow
- 7 tab screens: Welcome, Birth Plan, Interventions, Comfort & Vibes, Food & Drinks, Labor Bag, Game Plan Review
- Each screen corresponds to a data collection stage from PRD Section 7
- See `App.tsx` for complete navigation setup

### State Management Layer (`lib/store.ts`)
- **Zustand** store with single `useAppStore()` hook
- Data flow: SQLite ↔ Zustand ↔ React Components
- Async loader functions: `loadBirthPlan()`, `loadInterventions()`, `loadBagItems()`, `loadAffirmations()`, `loadFoodPreferences()`
- Mutation functions sync writes back to SQLite
- `calculateProgress()` updates preparation score (weighted: 30% birth plan + 40% bag + 30% interventions)
- `initializeAppStore()` called at app startup after database init

### Database Layer (`lib/db.ts`)
SQLite schema with 11 tables mirrors PRD Section 7 data model:
- `app_settings` — app state (due date, partner name, etc.)
- `birth_plan_answers` — questions and responses
- `intervention_prefs` — intervention preferences (yes/no/unsure)
- `bag_items` — packing checklist with `packed` boolean status
- `food_preferences` — likes and dislikes (text entries)
- `affirmations` — custom affirmations (text entries)
- `comfort_techniques`, `brain_scenarios`, `partner_tips`, `provider_questions`, `videos` — reference content

**Key patterns:**
- All queries are async (return Promises)
- Indices on frequently-queried columns
- Foreign key constraints enabled
- WAL mode for concurrent read access
- Use `toggleBagItem()`, `addCustomBagItem()`, `addFoodPreference()` for mutations

### Design System Implementation (`lib/theme.ts`)
Complete token library matching "Serene Navigator":
- **Colors:** primary teal (#2d6e6e), secondary blues, surface grays, status colors
- **Dark mode:** Automatically generated high-contrast variants for labor room use
- **Typography:** Fraunces (display), Source Sans 3 (body), specific sizes/weights per hierarchy level
- **Spacing scale:** 4, 8, 12, 16, 20, 24, 32 pixels
- **Shadows/Elevation:** Soft shadows (32px blur, 6% opacity) for premium feel
- **Border radius:** xl (1.5rem) and full (9999px) — no borders, use color shifts instead
- All components import from `theme` for consistent styling

## Content Files (JSON-based, not hardcoded)

All content is in `data/` directory for easy updates without rebuilding app:

**`data/birthPlanQuestions.json`**
- 9 interview questions with id, question text, type (text/single-choice), and options array
- Questions: who present, pain meds, natural birth, movement freedom, hydrotherapy, monitoring, cord clamping, skin-to-skin, C-section plans
- Screens load this at startup; changes propagate without rebuild

**`data/interventions.json`**
- 11 medical interventions: cervix checks, water breaking, IV, monitoring, epidural, narcotics, laughing gas, induction, pitocin, assisted delivery, C-section
- Each has id, name, description, and defaultPref (yes/no/unsure)

**`data/bagCategories.json`**
- 10 categories with emoji, ~90 total items
- Items tagged with forWhom: her/partner/baby/shared
- Examples: "In the Car", "Her Clothing", "Room Vibes", "Comfort Items", "Documents", "Baby Clothes"

**`data/partnerTips.json`**
- 7 categories: Advocacy, Take Initiative, Don't Take It Personally, Comfort Techniques, Food Rules, Capture Moments, Self-Care
- ~40 actionable tips total

**To extend content:**
1. Edit the JSON file directly
2. Import into screen components (e.g., `import birthPlanQuestions from '../data/birthPlanQuestions.json'`)
3. No code rebuild needed for content-only changes
4. Types defined in `lib/types.ts` ensure TypeScript validation

## Component Library (`components/`)

All components use theme tokens from `lib/theme.ts` for consistency. No magic colors — everything is theme-based.

**Core Components:**
- **`Button.tsx`** — Variants: primary (gradient bg), secondary (surface), tertiary (text-only). Sizes: sm/md/lg. Min 44px touch target.
- **`Card.tsx`** — No borders, soft shadows. `accent` prop adds teal left border; `warning` prop for alerts.
- **`Input.tsx`** — Single-line and multiline modes. Label positioning 8px above field. Min 44px height.
- **`QuestionCard.tsx`** — Interview prompts with "Ask her: " prefix. Subtitle support. Large mode for labor room visibility.
- **`Chip.tsx`** — Choice buttons for single/multi-select. Full border radius. Disabled state support.
- **`ChecklistItem.tsx`** — Checkbox + label + optional detail. Strikethrough when packed.
- **`SectionTitle.tsx`** — Screen headers with emoji icon, title, optional subtitle. Uses Fraunces font.
- **`ProgressBar.tsx`** — Thin progress indicator with optional percentage label.

**Accessibility:**
- All interactive elements: minimum 44×44px touch target
- Color contrast: 4.5:1 for text/background
- Dark mode support: automatically applied throughout
- Spacing over dividers: 1.5rem vertical whitespace preferred

**To add a new component:**
1. Create file in `components/NewComponent.tsx`
2. Use theme tokens: `colors.primary`, `spacing.lg`, `typography.bodyLarge`, etc.
3. Support dark mode (theme automatically provides it)
4. Ensure 44px minimum touch targets
5. Export from `components/index.ts`

## Common Development Tasks

### Implement a New Screen
1. Create file in `screens/NewScreen.tsx` with React component
2. Import at top of `App.tsx`
3. Add Tab.Screen entry in `AppNavigator()` with emoji icon, label, and name
4. In the component:
   - Load data: `const { birthPlan } = useAppStore()`
   - Import content JSON: `import data from '../data/something.json'`
   - Query SQLite on mount if persisted state
   - Use components from `components/index`
   - Style with theme tokens only
5. Test on both iOS and Android simulators: `npm run ios` / `npm run android`

**Example flow:** Component → useAppStore hook → Zustand store → SQLite queries

### Update Content (No Code Changes)
1. Edit JSON file: `data/birthPlanQuestions.json` (or interventions, bag, tips, etc.)
2. Import in screen: `import questions from '../data/birthPlanQuestions.json'`
3. Loop over array and render components
4. Changes live immediately in dev server (Expo hot reload)

### Add a New Component
1. Create `components/MyComponent.tsx`
2. Import theme tokens: `import { colors, spacing, typography } from '../lib/theme'`
3. Build StyleSheet with theme values (never hardcode colors)
4. Support dark mode (automatic from theme)
5. Minimum 44×44px touch targets
6. Export from `components/index.ts`

### Database Operations
All async. Pattern: `useEffect` on mount, query SQLite, update Zustand:
```typescript
useEffect(() => {
  const load = async () => {
    const data = await getBirthPlanAnswers();
    setBirthPlan(data);
  };
  load();
}, []);
```

### Test Locally
```bash
npm test                    # Run Jest tests
npm test:watch             # Watch mode
npm test:coverage          # Coverage report
npm run lint               # TypeScript check
```

### Test on Device
**iOS:** `npm run ios` (opens simulator automatically)
**Android:** `npm run android` (requires Android emulator running)
- Always test both light and dark mode (Settings > Appearance)
- Test offline (disable WiFi in Settings)
- Test all 7 screens across both platforms

### Prepare for App Store
1. Update version in `app.json` (e.g., "1.0.0")
2. Screenshots: 5+ per platform showing key flows
3. Privacy policy: **Must state** all data stays on-device, zero cloud transmission in Stage 1
4. Build with Expo EAS: `npm install -g eas-cli && eas build`
5. Submit to App Store Review (Apple) and Google Play Console

## Project Structure

```
labor-prep-app/
├── app.json                    # Expo config: app name, iOS/Android settings, plugins
├── babel.config.js             # Babel with babel-preset-expo
├── tsconfig.json               # TypeScript strict mode, React Native JSX
├── jest.config.js              # Jest config with react-native preset
├── package.json                # Dependencies and scripts
│
├── App.tsx                     # Root: NavigationContainer + AppNavigator
├── screens/                    # Tab screens
│   ├── WelcomeScreen.tsx       # Introduction
│   ├── BirthPlanScreen.tsx     # (implement next)
│   ├── InterventionsScreen.tsx
│   ├── ComfortScreen.tsx       # Affirmations + techniques
│   ├── FoodScreen.tsx          # Likes/dislikes
│   ├── BagScreen.tsx           # Categorized checklist
│   └── ReviewScreen.tsx        # Summary + prep score
│
├── lib/
│   ├── types.ts                # 12 TypeScript interfaces + DBSchema
│   ├── db.ts                   # SQLite schema, 30+ query functions
│   ├── store.ts                # Zustand store + async loaders
│   └── theme.ts                # Complete color/typography/spacing tokens
│
├── components/
│   ├── Button.tsx              # 3 variants, 3 sizes, gradient primary
│   ├── Card.tsx                # No-border surfaces, accent/warning props
│   ├── Input.tsx               # Single/multiline, labeled, accessible
│   ├── QuestionCard.tsx        # Interview prompts, large mode
│   ├── Chip.tsx                # Choice buttons, multi-select support
│   ├── ChecklistItem.tsx       # Checkbox with strikethrough packed state
│   ├── SectionTitle.tsx        # Screen headers with emoji
│   ├── ProgressBar.tsx         # Thin progress indicator
│   └── index.ts                # Centralized exports
│
├── data/                       # JSON content files
│   ├── birthPlanQuestions.json # 9 questions (text/choice)
│   ├── interventions.json      # 11 interventions
│   ├── bagCategories.json      # 10 categories, ~90 items
│   ├── partnerTips.json        # 40+ actionable tips
│   ├── videos.json             # (reference content for Stage 2+)
│   └── ...
│
├── __tests__/                  # Jest test files
│   ├── db.test.ts
│   ├── store.test.ts
│   └── components.test.ts
│
└── stitch Design files/serene_shore/DESIGN.md  # Design system reference
```

**Screens ready:** WelcomeScreen
**Screens to implement:** BirthPlanScreen, InterventionsScreen, ComfortScreen, FoodScreen, BagScreen, ReviewScreen

## SQLite Database (`lib/db.ts`)

11 tables, all created on first app launch:

**Core Tables:**
- `app_settings` — app state (id, dueDate, partnerName, prepScore, createdAt)
- `birth_plan_answers` — user responses (id, questionId, answer, createdAt)
- `intervention_prefs` — intervention choices (id, interventionId, preference: yes/no/unsure)
- `bag_items` — packing list (id, categoryId, name, packed: boolean, custom: boolean)
- `food_preferences` — likes and dislikes (id, type: like/dislike, text, createdAt)
- `affirmations` — custom affirmations (id, text, createdAt)

**Reference Tables (read-only in Stage 1):**
- `comfort_techniques`, `brain_scenarios`, `partner_tips`, `provider_questions`, `videos` — seed data

**Key functions in `lib/db.ts`:**
- `getBirthPlanAnswers()` / `saveBirthPlanAnswer()`
- `getInterventionPrefs()` / `setInterventionPref()`
- `toggleBagItem()` / `addCustomBagItem()`
- `addFoodPreference()` / `removeFoodPreference()`
- `addAffirmation()` / `removeAffirmation()`
- `calculateAppStateSummary()` — returns prep score (weighted: 30% birth + 40% bag + 30% interventions)
- `clearAllData()` — reset for testing

**Pattern:** All queries are async. Call from Zustand store, which updates UI. Store is source of truth between database calls.

## Key Design System Files

**`stitch Design files/serene_shore/DESIGN.md`** — Complete "Serene Navigator" design reference:
- Color palette: primary teal #2d6e6e, secondaries, surfaces, status colors
- Typography: Fraunces (display), Source Sans 3 (body), specific sizes/weights
- Surface hierarchy: base → content → interactive (light to white)
- Glass & gradients for CTAs (135° from primary to primary_dim)
- No-line rule: structure through color shifts, never borders
- Dark mode considerations for labor room (low-light environments)

**`lib/theme.ts`** — Implements design system as code:
- Import and use: `import { colors, spacing, typography } from '../lib/theme'`
- Never hardcode colors or spacing
- Theme object structure: `{ light: {...}, dark: {...} }`
- All components automatically respect dark mode

## Documentation Files

- **`ARCHITECTURE.md`** — 4000+ line deep dive into layers, data flow, Stage-based roadmap
- **`TESTING.md`** — Unit/integration test examples, device testing checklists, Jest setup
- **`GETTING_STARTED.md`** — 7-step setup guide to bootstrap a new developer

## Development Workflow

### When Adding a Screen
1. Sketch user flow on paper (interview-driven, not form-driven per PRD Section 4)
2. Create file: `screens/YourScreen.tsx`
3. Add Tab.Screen entry in App.tsx with emoji and label
4. Load content from `data/*.json` (not hardcoded)
5. Use Zustand: `const { yourData } = useAppStore()`
6. Query SQLite on mount if persisted
7. Test on iOS + Android: `npm run ios` / `npm run android`

### When Updating Content
- Only edit JSON files in `data/`
- No code recompilation needed
- Expo hot reload picks up changes instantly in dev server

### Type Safety
- All data accessed through Zustand is TypeScript-typed
- Database queries return typed interfaces from `lib/types.ts`
- Strict mode enabled in `tsconfig.json`
- Run `npm run lint` to check types before committing

## Stage-Based Roadmap (From PRD)

**Stage 1 (MVP, 3-4 weeks):** Birth Plan, Interventions, Labor Bag, Comfort Techniques, Food Preferences, Affirmations, Partner Tips, Game Plan Review. SQLite persistence. iOS/Android builds.

**Stage 2 (Depth, 2-3 weeks):** Cloud sync (Supabase/Firebase), BRAIN Scenarios, Provider Questions, Shared link generation, Import/export.

**Stage 3 (Experience, 2-3 weeks):** Labor Mode (large text, darkmode), Contraction timer, Push notifications, Video tutorials, Playbook deep dives.

**Post-Stage 3:** Partner app, Doula/provider integrations, Analytics, A/B testing.

## Important Notes

- **All data on-device in Stage 1.** No cloud transmission, no analytics tracking. Privacy first.
- **Dark mode is essential.** Labor partners will use this app during labor with low lighting. Dark mode isn't optional.
- **Interview-driven, not form-driven.** Present one question or section at a time. Large, readable text. Conversational tone.
- **Accessibility from day one.** 44px minimum touch targets. 4.5:1 contrast ratio. Screen reader compatibility. Test on actual devices.
- **Platform differences matter.** iOS bottom sheet vs Android full-screen. iOS gesture back vs Android hardware back. Test both.
- **Content updates shouldn't require app rebuild.** JSON files can be remotely updated in Stage 2. Design content architecture with this in mind.
