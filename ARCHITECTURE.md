# Architecture Documentation

## Overview

Labor Prep Together is a **web application** built with React and TypeScript. The app guides birth partners through structured interviews and checklists to prepare for labor.

## High-Level Architecture

```
┌─────────────────────────────────────────┐
│       User Browser (React App)          │
├─────────────────────────────────────────┤
│  App.tsx (Main Component)               │
│  ├─ Interview Section                   │
│  ├─ Interventions Section               │
│  ├─ Labor Bag Section                   │
│  ├─ Playbook Section                    │
│  └─ Review Section                      │
├─────────────────────────────────────────┤
│  React Hooks State Management           │
│  (appData, interventionsState, etc.)    │
├─────────────────────────────────────────┤
│  Browser localStorage                   │
│  (JSON persistence)                     │
├─────────────────────────────────────────┤
│  Data Files (JSON)                      │
│  ├─ birthPlanQuestions.json             │
│  ├─ interventions.json                  │
│  ├─ bagCategories.json                  │
│  └─ partnerTips.json                    │
└─────────────────────────────────────────┘
```

## Application State

### AppData Structure
```typescript
type AppData = {
  partnerName: string;
  motherName: string;
  dueDate: string;
  birthAnswers: Record<string, string>;      // bp1-bp9 answers
  currentQuestionIndex: number;              // Interview progress
  interviewStatus: 'draft' | 'submitted';    // Interview completion
  interventionsState: EditableIntervention[];
  bagState: EditableBagCategory[];
  playbookState: PlaybookCategory[];
};
```

### State Persistence
- **Storage key:** `labor-prep-web-app-v2`
- **Format:** JSON serialized to localStorage
- **Load on:** App mount
- **Save on:** Any state change (useEffect with deep dependency tracking)

## Core Sections

### 1. Interview Section
**File:** App.tsx (lines with "interview" logic)
**Data source:** `data/birthPlanQuestions.json`

**Flow:**
1. Setup questions (partner name, mother name, due date)
2. 9 birth plan questions (bp1-bp9)
3. Personalization: Mother's name replaces "she/her" throughout
4. Answers stored in `birthAnswers` object
5. Interview completion triggers intervention relationships

**Relationships (birthAnswers → Interventions):**
- bp2 (pain meds) → epidural, narcotics, nitrous oxide
- bp4 (movement) → monitoring, epidural
- bp5 (water) → water birth
- bp6 (monitoring) → continuous monitoring
- bp7-bp9 (C-section) → C-section preferences

### 2. Interventions Section
**File:** App.tsx (interventions logic)
**Data source:** `data/interventions.json`

**Structure:**
```typescript
type EditableIntervention = {
  id: string;
  name: string;
  description: string;
  preference: 'yes' | 'no' | 'unsure';  // or defaultPref
  reviewed: boolean;                     // Track if reviewed
  stage: string;                         // Labor stage (Early, Active, Delivery, etc.)
};
```

**Stages (from interventionStageMap):**
- Before Labor
- Admission
- Early Labor
- Active Labor
- Throughout Labor
- Delivery
- General

**Features:**
- Toggle preference: yes/no/unsure
- Mark as reviewed
- Filter by stage or preference
- Bulk select/deselect
- Link to related interview answers (firstRelatedAnswer function)

### 3. Labor Bag Section
**File:** App.tsx (bag logic)
**Data source:** `data/bagCategories.json`

**Structure:**
```typescript
type EditableBagItem = {
  id: string;
  name: string;
  forWhom: 'her' | 'partner' | 'baby' | 'shared';
  packed: boolean;
};

type EditableBagCategory = {
  id: string;
  name: string;
  emoji: string;
  items: EditableBagItem[];
};
```

**Features:**
- Checkbox to mark items packed
- Filter by who items are for (birthing parent, partner, baby, shared)
- Bulk import: Add multiple items via text input
- Format: `item_name | category_name | for_whom | packed`
- Search items by name
- Dynamic category creation on import

### 4. Playbook Section
**File:** App.tsx (playbook logic)
**Data source:** `data/partnerTips.json`

**Structure:**
```typescript
type PlaybookTip = {
  id: string;
  text: string;
};

type PlaybookCategory = {
  id: string;
  name: string;
  tips: PlaybookTip[];
};
```

**Features:**
- 7 categories of partner support tips
- Bulk import similar to bag
- Format: `tip_text | category_name`
- Collapse/expand categories
- Search tips

### 5. Review Section
**File:** App.tsx (overview section)

**Displays:**
- Setup summary (names, due date)
- Interview completion status
- Number of interventions reviewed
- Labor bag packing progress
- Prep score (weighted calculation)

## Data Flow

### Loading
```
App mounts
  ↓
Check localStorage for STORAGE_KEY
  ↓
If exists: Hydrate state from JSON
If not: Initialize with defaults (createInitialInterventions, createInitialBagState, etc.)
  ↓
Render UI with loaded state
```

### Saving
```
User changes state (answer, toggle, pack item, etc.)
  ↓
Update React state hook
  ↓
useEffect catches change
  ↓
Serialize appData to JSON
  ↓
Save to localStorage
```

### Personalization
Functions that adapt text to user-provided names:
- `personalizeQuestionText(text, motherName)` — Replace "she" with name
- `personalizePlaceholder(text, motherName)` — Replace "her mom" with "{name}'s mom"
- `labelForWhom(forWhom, motherName, partnerName)` — Generate "For [Name]" labels

## Component Hierarchy

Most UI is inline in App.tsx. Key reusable components:

```
App.tsx
├── Setup Modal (setupQuestions)
├── Section Selector (5 buttons)
├── Overview Section
│   ├── Card (summary info)
│   └── Button (actions)
├── Interview Section
│   ├── QuestionCard (per question)
│   ├── Input (text answers)
│   └── Button (next/prev)
├── Interventions Section
│   ├── SelectionHeader (bulk actions)
│   ├── SelectableCard (per intervention)
│   ├── Chip (preference toggle)
│   └── BulkActionBar (actions)
├── Labor Bag Section
│   ├── Chip (filter buttons)
│   ├── Input (bulk import)
│   ├── SelectableCard (per item)
│   └── ChecklistItem (pack toggle)
└── Playbook Section
    ├── SelectableCard (per tip)
    └── BulkActionBar (actions)
```

## Key Algorithms

### Intervention Relationship Linking
```typescript
function firstRelatedAnswer(interventionId: string, answers: Record<string, string>) {
  // Find question linked to this intervention via relationshipMap
  // Return the user's answer to that question
  // Displays context when reviewing interventions
}
```

### Bulk Text Parsing
```typescript
function parseBulkBagText(text: string) {
  // Split by newlines
  // Parse pipe-delimited: name | category | forWhom | packed
  // Normalize owner tokens: "her", "mom", "partner", "dad" → enums
  // Return valid items and invalid lines (for user feedback)
}
```

### Personalization
Search-replace functions update text dynamically as user enters names:
- Interview questions show mother's name
- "For whom" labels show partner/mother names
- Placeholders guide input with personalized language

## Styling

All styles use `lib/theme.ts` tokens:
- Colors (teal primary, grays, status colors)
- Typography (sizes, weights, fonts)
- Spacing (4-32px scale)
- Shadows (soft elevation)
- Border radius (xl, full)

**Dark mode:** Automatically inverted contrast variants in theme object.

## Deployment

**Build process:**
```bash
npm run build
# Runs: npx expo export --platform web --clear
# Creates: dist/ folder
```

**Hosting:**
- Vercel (currently deployed)
- vercel.json specifies:
  - buildCommand: npx expo export --platform web --clear
  - outputDirectory: dist
- .npmrc: legacy-peer-deps=true (peer dependency fixes)

**Auto-deploy:**
- Push to GitHub main branch
- Vercel detects and builds
- Live at your-app.vercel.app

## Browser Requirements

- **JavaScript:** Required (React app)
- **localStorage:** Required (data persistence)
- **Modern browser:** ES6+ support (React 18)
- **Responsive:** Mobile-first design, works on all screen sizes

## Known Limitations

- **No backend:** Data only in browser, lost if cache cleared
- **Single user:** No multi-user or sharing (future feature)
- **No export:** Can only review in-app (export feature future)
- **Offline only:** No cloud sync (future feature: could add Supabase/Firebase)

## Future Architecture Considerations

If pivoting back to mobile (React Native + Expo):
1. **Database:** expo-sqlite instead of localStorage
2. **State:** Zustand with async persist adapters
3. **Navigation:** React Navigation bottom tabs
4. **Components:** React Native (not React Web)
5. **Offline:** All data on-device via SQLite
6. **Distribution:** App Store/Play Store via Expo EAS

The current web app serves as a working prototype for mobile architecture design.
