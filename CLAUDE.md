# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Labor Prep Together** is a **web application** that guides birth partners through structured interview flows to build a comprehensive labor preparation plan.

**Current Status:** Web prototype fully functional with all core features (interview, interventions, labor bag, playbook). Deployed to Vercel.

**Key Documents:**
- `Labor_Prep_Together_PRD.md` — Complete product requirements
- `stitch Design files/serene_shore/DESIGN.md` — "Serene Navigator" design system with teal (#2d6e6e), premium editorial aesthetic
- `ARCHITECTURE.md` — Technical documentation of current web app architecture
- `TESTING.md` — Testing strategy
- `GETTING_STARTED.md` — Setup guide

## Technology Stack

**Web App (Current Implementation):**
- **Runtime:** React (web) + TypeScript
- **State management:** React hooks + localStorage
- **Data persistence:** Browser localStorage (JSON serialization)
- **Styling:** React Native Web components + custom theme system
- **No external backend:** All data stays local in user's browser
- **Hosting:** Vercel (static export from Expo)
- **Build:** `npm run build` → `npx expo export --platform web`

**Key build scripts:**
```
npm start              # Start dev server
npm build              # Build for web (creates dist/)
npm test               # Run Jest tests
npm test:watch        # Watch mode
npm run lint           # TypeScript checking
```

## App Architecture

### Navigation & Sections
Five main sections (not tab-based, section-based navigation):
1. **Review** — Overall summary of preparation
2. **Interview** — Birth plan questions (9 questions from `data/birthPlanQuestions.json`)
3. **Interventions** — Medical intervention preferences (11 interventions from `data/interventions.json`)
4. **Labor Bag** — Packing checklist (10 categories, ~90 items from `data/bagCategories.json`)
5. **Playbook** — Partner tips & support strategies (40+ tips from `data/partnerTips.json`)

### State Management (App.tsx)
Single React component with hooks-based state:
- `appData` — Core app state (names, due date, interview answers, status)
- `interventionsState` — Medical preferences with staging and review status
- `bagState` — Categorized packing list with packed status
- `playbookState` — Partner tips organized by category
- localStorage persistence with key `labor-prep-web-app-v2`

**Data initialization:**
```typescript
const interviewData = birthPlanQuestions as BirthPlanQuestion[];
const setupQuestions = [
  { id: 'setup_partner', label: 'Partner name' },
  { id: 'setup_birthing_parent', label: 'Birthing Parent name' },
  { id: 'setup_due_date', label: 'Due date' },
];
```

### Key Features Implemented
- **Interview flow:** Answer 9 birth plan questions with personalization (uses mother's name throughout)
- **Intervention linking:** Birth plan answers automatically link to related interventions
- **Bulk import:** Add multiple items via text parsing (pipe-delimited format)
- **Filtering & search:** Filter interventions by stage/preference, search bag items
- **Selection UI:** Bulk selection actions for interventions, bag items, playbook tips
- **Personalization:** All text uses mother's/partner's names provided at setup
- **Mobile-responsive:** Works on phone/tablet browsers

### Data Files (JSON-based)
Located in `data/` directory:

**`birthPlanQuestions.json`** — 9 interview questions
- bp1: Who present in delivery room
- bp2: Pain medication preferences (with description)
- bp3: Natural birth preference
- bp4: Movement freedom
- bp5: Hydrotherapy/water birth
- bp6: Baby monitoring
- bp7: Delayed cord clamping
- bp8: Immediate skin-to-skin
- bp9: C-section requests

**`interventions.json`** — 11 medical interventions
- Cervix checks, water breaking, IV, monitoring, epidural, narcotics, laughing gas, induction, pitocin, assisted delivery, C-section
- Each with id, name, description, defaultPref
- Mapped to labor stages in `interventionStageMap`

**`bagCategories.json`** — 10 categories with ~90 items
- Categories: In the Car, Her Clothing, Room Vibes, Comfort Items, Documents, etc.
- Items tagged with forWhom: her/partner/baby/shared

**`partnerTips.json`** — 40+ tips organized by category
- 7 categories: Advocacy, Take Initiative, Don't Take It Personally, Comfort Techniques, Food Rules, Capture Moments, Self-Care

### Components
Reusable components (not all are separate files yet — many are inline in App.tsx):
- **QuestionCard** — Interview question display with description support
- **Button** — Primary, secondary, tertiary variants
- **Card** — Container with accent/warning props
- **Input** — Text input with labels
- **Chip** — Choice button for selections
- **ChecklistItem** — Checkbox with label
- **BulkActionBar** — Bulk action selection UI
- **SelectionHeader** — Selection mode header with action buttons

### Design System (`lib/theme.ts`)
Complete "Serene Navigator" token library:
- **Colors:** Primary teal (#2d6e6e), secondaries, surfaces, status colors
- **Dark mode:** Automatically generated high-contrast variants
- **Typography:** Fraunces (display), Source Sans 3 (body)
- **Spacing scale:** 4, 8, 12, 16, 20, 24, 32px
- **Shadows/Elevation:** Soft shadows for premium feel
- **Border radius:** xl (1.5rem), full (9999px) — no borders, color shifts instead

All components import from `lib/theme` for consistency.

## Development Workflow

### To Run Locally
```bash
npm install
npm start
# Opens at http://localhost:3000 (or similar)
```

### To Build for Web Deployment
```bash
npm run build
# Creates dist/ folder with static files
```

### To Deploy to Vercel
1. Push to GitHub
2. Vercel auto-detects and deploys
3. Or manually: `vercel deploy`

### When Updating Content
- Edit JSON files in `data/`
- Changes reflect immediately in dev server (hot reload)
- No code rebuild needed

### To Add a Feature
1. Add state to App.tsx component state
2. Add handlers to process/update state
3. Create UI to render and interact with state
4. Test on desktop and mobile browsers
5. Commit and push — Vercel auto-deploys

## Important Notes

- **All data is local.** No backend, no cloud sync in current version. Data only persists in browser localStorage.
- **Mobile-first responsive.** Works on phone browsers but also desktop.
- **Interview-driven approach.** Shows questions one-at-a-time where possible, not form-like.
- **Personalization:** App uses provided names (mother, partner) throughout all text.
- **JSON data architecture:** Content is decoupled from code for easy updates without rebuilding.

## Project Structure

```
labor-prep-app/
├── App.tsx                    # Main app component (all sections)
├── app.json                   # Expo config
├── package.json               # Dependencies and build scripts
├── tsconfig.json              # TypeScript config
│
├── components/                # Reusable React components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── QuestionCard.tsx
│   ├── Chip.tsx
│   ├── ChecklistItem.tsx
│   ├── SectionTitle.tsx
│   ├── ProgressBar.tsx
│   ├── BulkSelection.tsx      # Bulk action UI
│   └── index.ts
│
├── lib/
│   ├── theme.ts               # Design tokens
│   └── types.ts               # TypeScript interfaces
│
├── data/                      # JSON content
│   ├── birthPlanQuestions.json
│   ├── interventions.json
│   ├── bagCategories.json
│   ├── partnerTips.json
│   └── ...
│
├── dist/                      # Built web app (generated)
│
└── stitch Design files/serene_shore/DESIGN.md  # Design reference
```

## Deployment

**Current deployment:** Vercel
- URL: Live at your Vercel project
- Auto-deploys on git push to main
- Built via `npm run build` (uses `.npmrc` for legacy peer deps)
- Outputs to `dist/` folder
- `.npmrc`: `legacy-peer-deps=true` to allow dependency mismatches
- `vercel.json`: Specifies build command and output directory

**To redeploy:**
```bash
git push origin main  # Vercel auto-triggers
# Or manually: vercel deploy
```

## Future Considerations

If moving back to mobile (React Native + Expo):
- Database layer: Would use expo-sqlite instead of localStorage
- State management: Would use Zustand + async loaders
- Navigation: Would use React Navigation bottom tabs
- Components: Would be React Native, not React Web
- Offline-first: All data on-device via SQLite
- App Store distribution: Via Expo EAS builds

Current web version can serve as prototype/reference for mobile architecture.
