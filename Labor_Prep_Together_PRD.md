# Labor Prep Together — Product Requirements Document

## 1. Problem Statement

Partners (husbands, birth partners) want to be actively involved in labor preparation but lack a structured way to do it. The information is scattered across spreadsheets, YouTube videos, Reddit threads, and birth class notes. The result: partners feel underprepared, wives feel unsupported, and critical decisions get made under pressure without a shared plan.

## 2. Product Vision

A **native iOS and Android mobile app** that guides the partner through a structured interview process with his wife, building a shared labor game plan. The partner is the primary user. The app treats him as the operator — someone who needs to be briefed, drilled, and equipped so he can confidently pack the bag, advocate in the delivery room, and support her through every stage.

**This is a production mobile application, not a web experience.** It will be distributed through Apple App Store and Google Play Store.

## 3. Target Users

**Primary user:** The birth partner (husband/partner). He drives the app, conducts the interviews, builds the checklists, and references the plan during labor.

**Secondary user:** The pregnant wife/mother. She provides the inputs — preferences, food likes/dislikes, affirmations, intervention boundaries. She should feel heard and supported by the process itself.

## 4. Core Principles

- **Interview-driven, not form-driven.** Every section prompts the partner with questions to ask out loud. The app is a conversation facilitator, not a data entry form.
- **Opinionated defaults, full editability.** Ship with sensible defaults (common bag items, standard interventions list, example affirmations). Everything can be customized.
- **Progressive disclosure.** Don't overwhelm. Reveal complexity only when the user drills in.
- **Offline-first.** The app must work without connectivity in the delivery room.
- **Relationship-strengthening.** The process of using the app together should itself be a bonding experience.

## 5. Information Architecture

### 5.1 Preparation Phases (temporal)

| Phase | Description | Spreadsheet Source |
|---|---|---|
| Weeks Before | Birth plan interview, bag packing, learning techniques, watching doula videos | To Dos, Doula Vlog, Qs for Provider |
| Days Before | Final bag check, route planning, gas tank, phone storage, app installs | Checklist, To Dos |
| Early Labor at Home | Contraction timing, comfort techniques, when to leave | Calm Vibes, Partner Tips |
| Car Ride | Route, vomit bags, pillow, hydration | Checklist (In Car section) |
| At the Hospital | Room setup, advocacy, BRAIN decisions, affirmations | Calm Vibes, Interventions, Affirmations, Partner Tips |
| Delivery | Pushing positions, cord clamping, skin-to-skin, video capture | Interventions, Partner Tips |
| Postpartum (Hospital) | Feeding tracking, food ordering, paperwork, recovery items | Checklist (Postpartum), Partner Tips |
| Going Home | Car seat, going-home outfit, discharge paperwork | Checklist (Baby, Admin) |

### 5.2 Content Modules (functional)

| Module | Purpose | Data Model |
|---|---|---|
| Birth Plan | Her preferences for labor and delivery | Key-value pairs: question → answer (text or single-select) |
| Interventions | Her stance on each medical intervention + BRAIN framework | List of interventions, each with: name, description, her preference (text), notes |
| Labor Bag | Categorized packing checklist | Categories → items, each with: name, packed (bool), location (string), for_whom (her/partner/baby) |
| Food & Drink | What to pack, what to avoid | Two lists: likes and dislikes, each a string array |
| Comfort & Vibes | Room setup, music, shows, affirmations, techniques | Sub-modules: affirmations (string list), music plan (stage → playlist/link), techniques (static content + practice status), room setup (checklist) |
| Partner Playbook | Tips organized by category | Static content, categorized. Could add "read/unread" tracking. |
| Questions for Provider | Questions to ask OB/midwife at appointments | Checklist of questions with space for answers |
| BRAIN Tool | Real-time decision framework for delivery room | Template: scenario → B/R/A/I/N notes. Reusable per decision. |
| Doula Video Library | Curated video links organized by phase | Phase → list of video titles + URLs |

## 6. Feature Requirements by Stage

### Stage 1 — MVP (Core Loop)

The minimum product that delivers the core value: partner interviews wife, builds the plan, packs the bag.

#### 6.1.1 Birth Plan Interview

- Screen-by-screen question flow. One question per screen with large text prompting partner to ask aloud.
- Input types: free text, single-select chips, multi-select chips.
- Questions derived from spreadsheet "To Dos" tab (birthing plan section) and "Qs for Provider" tab.
- Default questions pre-loaded. User can add custom questions.
- Summary view of all answers.

#### 6.1.2 Interventions Tracker

- List of all interventions from "Interventions" tab.
- Each intervention: name, plain-language description, expandable detail.
- Her preference field: pre-populated with common defaults from spreadsheet, editable.
- Visual indicator: reviewed vs. not yet discussed.
- Transition reminder card (7cm+ note from spreadsheet).

#### 6.1.3 Labor Bag Checklist

- Categories from "Checklist" tab: In Car, Room Vibes, Snacks, Comfort, Clothing, Postpartum, Baby, Partner, Admin, Nurse Gifts.
- Each item: name, packed toggle, optional location tag (e.g. "Car bag," "Suitcase - Green bag").
- Add/remove custom items per category.
- Progress bar per category + overall.
- All items from both "Checklist" and "Copy of Checklist" tabs merged and deduplicated.

#### 6.1.4 Food Preferences

- Two lists: likes and dislikes.
- Pre-populated from "To Dos" tab (Foods you Like / Foods you Dislike sections).
- Add/remove items.
- Tag system optional (e.g. "labor snack," "post-birth," "drinks").

#### 6.1.5 Affirmations

- Editable list of affirmations.
- Seeded from "Affirmations" tab.
- Large-text "flashcard" display mode for use during labor.

#### 6.1.6 BRAIN Decision Tool

- Scenario input field.
- Five sections (B-R-A-I-N) each with prompt text and notes field.
- Ability to save multiple scenarios.
- Quick-reference card showing the acronym.

### Stage 2 — Depth & Polish

#### 6.2.1 Partner Playbook

- All tips from "Partner Tips" tab, organized by category (General, Take Initiative, Don't Take It Personally, Sleep, Food, Comfort, Video Recording, Misc, Apps).
- Read/unread tracking.
- Searchable.

#### 6.2.2 Comfort Techniques

- Counter pressure (with video links from "Calm Vibes" tab).
- Breathing techniques (hypnobirthing 4-in, 7-8-out).
- Acupressure points.
- Labor positions (with video links from "Doula Vlog" tab).
- Practice status tracking per technique.

#### 6.2.3 Music & Vibes Planner

- Stage-based music plan (early labor → active → transition → recovery).
- Spotify playlist links from "Calm Vibes" tab.
- Calming video links (jellyfish aquariums, screensavers from spreadsheet).
- Funny content links for recovery.
- Room setup checklist (projector, speaker, fairy lights, sound machine, extension cord).

#### 6.2.4 Questions for Provider

- Pre-loaded questions from "Qs for Provider" tab.
- Space to record answers at appointments.
- Add custom questions.

#### 6.2.5 Doula Video Library

- Organized by phase from "Doula Vlog" tab (Prep, Pre Labor, Car Ride, Labor, Postpartum, Inducing Labor).
- Mark watched/unwatched.
- Priority indicators.

### Stage 3 — Experience & Sharing

#### 6.3.1 Timeline/Dashboard View

- Visual timeline showing preparation status across all modules.
- "Days until due date" countdown.
- Smart reminders (e.g. "You haven't reviewed interventions yet," "Time to do a bag check").

#### 6.3.2 Labor Mode

- Simplified UI for active use during labor.
- Quick access to: affirmations (large text flashcards), BRAIN tool, contraction timer, intervention preferences, comfort techniques.
- High contrast, minimal chrome, large tap targets.
- Screen stays on.

#### 6.3.3 Sharing & Export

- Export birth plan as PDF for hospital.
- Share bag checklist with wife (view-only or collaborative).
- Print-friendly summary of the full game plan.

#### 6.3.4 Contraction Timer

- Start/stop timer for contractions.
- Tracks duration and frequency.
- Visual indicator for "time to go to hospital" thresholds (e.g. 5-1-1 rule).

## 7. Data Model

```
User
├── BirthPlan
│   └── questions: [{ id, question, answer, type }]
├── Interventions
│   └── items: [{ id, name, description, defaultPref, herPref, reviewed }]
├── BagCategories
│   └── categories: [{ id, name, emoji, items: [{ name, packed, location }] }]
├── FoodPreferences
│   ├── likes: [string]
│   └── dislikes: [string]
├── Affirmations
│   └── items: [string]
├── BrainScenarios
│   └── scenarios: [{ id, scenario, b, r, a, i, n, timestamp }]
├── PartnerTips
│   └── categories: [{ name, tips: [{ text, read }] }]
├── ComfortTechniques
│   └── techniques: [{ name, description, videoUrl, practiced }]
├── MusicPlan
│   └── stages: [{ stage, playlists: [{ name, url }] }]
├── ProviderQuestions
│   └── questions: [{ id, question, answer }]
├── Videos
│   └── items: [{ phase, title, url, watched }]
└── Settings
    ├── dueDate: date
    ├── partnerName: string
    └── motherName: string
```

## 8. Technical Architecture

### 8.1 Platform Target

**Primary platforms: iOS 14+ and Android 11+ (minimum 90% of market)**

The app must be distributed through **Apple App Store** and **Google Play Store**. A web-based prototype (like the current labor-prep-partner.jsx) was used to validate the concept and UX flow, but the production app will be a **native or native-quality cross-platform mobile application**.

### 8.2 Framework Decision

**Two recommended paths:**

**Path A: React Native + Expo (Recommended for rapid deployment)**
- Single codebase compiles to iOS and Android
- Faster to market if developer has JavaScript/React experience
- Excellent offline support via SQLite
- Can publish to App Store / Google Play with Expo EAS Build
- Visual design system (from stitch design files) easily implemented

**Path B: Flutter (Alternative if seeking more polished native feel)**
- Compile to true native iOS/Android with one codebase
- Superior performance and native look-and-feel out of the box
- Strong material design and iOS design systems support
- Slightly steeper learning curve if team is JavaScript-focused

**Decision:** Recommend **React Native + Expo** for Stage 1 (familiar ecosystem, fast iteration), with option to migrate to Flutter if performance or app store review issues arise.

### 8.3 Storage & Data

- **Stage 1:** SQLite (on-device only). All data stored locally. Zero backend. This guarantees offline functionality in delivery rooms and eliminates privacy concerns.
- **Stage 2:** Optional cloud sync (Firebase Realtime DB or Supabase) for optionally sharing between partner's and wife's devices.
- **Stage 3:** User accounts, cloud backup, PDF export.

### 8.4 Tech Stack (React Native + Expo path)

| Layer | Choice | Rationale |
|---|---|---|
| Framework | React Native (Expo) | Single codebase → iOS + Android, managed build service, App Store ready |
| Storage | SQLite (expo-sqlite) | Offline-first, fast, structured local database |
| State | Zustand or Redux | Lightweight state, persist middleware for SQLite |
| Styling | Tamagui or React Native Paper | Cross-platform component library matching design system |
| Navigation | React Navigation | Standard React Native navigation, handles platform differences |
| PDF Export | react-native-pdf-lib or native modules | Birth plan PDF generation for hospital |
| Hosting (Backend) | Firebase or Supabase | Only needed in Stage 2+ for optional sync |
| Build & Distribution | Expo EAS | One-click iOS/Android app store submission |

### 8.5 Platform-Specific Requirements

#### iOS
- **Minimum version:** iOS 14+
- **Permissions:** Calendar (optional, for due date), File access (for PDF sharing)
- **Design guidelines:** Follow Apple Human Interface Guidelines (HIG). Use safe areas, native-style navigation.
- **App Store submission:** Build time ~30 min, review 1-3 days
- **Must support:** Landscape + portrait, notch/home indicator safe areas

#### Android
- **Minimum version:** Android 11+ (API 30+)
- **Permissions:** SCHEDULE_EXACT_ALARM (for contraction reminders), FILE_READ (PDF sharing)
- **Design guidelines:** Follow Material Design 3. Ensure proper back button handling.
- **Google Play submission:** Build time ~15 min, review 1-5 days
- **Must support:** System dark mode, landscape + portrait, large screens

### 8.6 Visual Design & Aesthetic

The visual design follows the **"Serene Navigator"** design system (see `stitch Design files/serene_shore/DESIGN.md`):
- Premium editorial aesthetic with sophisticated teal accents and cream surfaces
- Generous whitespace and asymmetric layouts
- Custom fonts: Fraunces (display), Source Sans 3 (body)
- High-end wellness aesthetic (not medical utility, not infantile)
- Large tap targets and high contrast for stress-free use
- Dark mode support for labor room use (low light environments)

## 9. Prototype vs. Production Architecture

**The current labor-prep-partner.jsx is a functional prototype** used to validate UX flow and interview-driven interaction patterns. It is intentionally **not** the foundation for the production app. This prototype:
- Uses inline styles and CSS variables (not a scalable design system)
- Uses in-memory state instead of persistent storage
- Targets web browsers, not native mobile platforms
- Has no offline capability, permissions handling, or app store integration

**The production app will:**
- Use React Native + Expo to target iOS and Android natively
- Implement SQLite for robust local-first persistence
- Follow the "Serene Navigator" design system with platform-specific components
- Handle app store guidelines, permissions, and platform-specific UX patterns
- Support offline functionality and native features (camera, notifications, calendar integration)

The prototype's value is in validating the **information architecture and interaction patterns**, not the implementation. These patterns will be faithfully recreated in the native app.

## 10. Minimizing Tech Debt — Principles

1. **No backend in Stage 1.** All data is local (SQLite). This eliminates auth, APIs, hosting costs, and data privacy concerns. Add a backend only when sharing/sync becomes a real need.
2. **Shared data model.** Define the TypeScript types upfront (Section 7). All stages build on the same schema — no migrations between stages.
3. **Content as data, not code.** All checklist items, questions, tips, and intervention defaults live in JSON config files, not hardcoded in components. This makes it trivial to update content without touching UI code.
4. **Component library from day one.** Card, Button, Input, Checklist, QuestionCard — build these as reusable primitives in Stage 1. Every subsequent stage composes from them.
5. **Feature flags over branches.** Gate Stage 2/3 features behind flags so they can be built incrementally without breaking the core loop.
6. **No premature abstraction.** Don't build a "generic checklist engine." Build the bag checklist. If you later need a video watchlist and provider question list, refactor then — the patterns will be obvious.
7. **Test the data, not the UI.** Unit test the data transformations (merging checklists, computing progress, BRAIN scenario CRUD). UI tests add friction at this stage.
8. **Respect platform conventions.** iOS uses bottom navigation and gestures. Android uses back buttons and drawer menus. Don't force one metaphor on both platforms — let React Navigation and platform-specific components handle this.

## 11. Stage Breakdown & Sequencing

**Note:** These estimates assume production React Native + Expo development. Includes platform-specific testing and build/submission time.

| Stage | Scope | Effort Estimate | Dependencies |
|---|---|---|---|
| **0** | Project setup: React Native + Expo, design system components, SQLite schema, TypeScript config | 2-3 days | None |
| **1a** | Data model + JSON content files from spreadsheet | 1-2 days | Finalize spreadsheet |
| **1b** | Core UI shell: React Navigation, progress bar, section routing (iOS + Android) | 2-3 days | 0, 1a |
| **1c** | Birth Plan Interview flow + platform-specific testing | 2-3 days | 1a, 1b |
| **1d** | Interventions Tracker + BRAIN Tool | 2-3 days | 1a, 1b |
| **1e** | Labor Bag Checklist | 2-3 days | 1a, 1b |
| **1f** | Food Preferences + Affirmations | 1-2 days | 1a, 1b |
| **1g** | SQLite persistence + offline support (both platforms) | 2 days | 1a, 1b |
| **1h** | iOS app store build + submission | 2-3 days | All 1x complete |
| **1i** | Android Google Play build + submission | 2-3 days | All 1x complete |
| **2a** | Partner Playbook + Comfort Techniques | 2-3 days | 1b |
| **2b** | Music & Vibes Planner + Video Library | 2-3 days | 1b |
| **2c** | Questions for Provider | 1 day | 1b |
| **2d** | Polish pass: animations, empty states, onboarding, dark mode | 3-4 days | All Stage 1 |
| **3a** | Labor Mode (simplified active-labor UI with high contrast) | 3-5 days | Stage 1 complete |
| **3b** | PDF export of birth plan (platform-native) | 2-3 days | 1c |
| **3c** | Contraction Timer + notification handling | 2-3 days | None |
| **3d** | Cloud sync + sharing (Supabase) | 3-5 days | Stage 1 complete |

**Total Stage 1 (through app store launch):** ~3-4 weeks for an experienced React Native developer.
**Total through Stage 2:** ~5-7 weeks.
**Total through Stage 3:** ~8-12 weeks.

## 12. App Store Guidelines & Platform Compliance

### Apple App Store (iOS)
- **Category:** Health & Fitness (or Medical)
- **Required disclosures:** No medical claims; this is a planning/support tool, not medical advice
- **Privacy:** All data is stored on-device. Privacy Policy must state zero cloud transmission in Stage 1.
- **Content rating:** Should be rated 4+ (no objectionable content)
- **Guideline notes:**
  - Cannot claim to replace medical advice or diagnose
  - Can reference medical conditions (labor, interventions) in educational context
  - Cannot use Apple Health integration without proper medical disclaimers
  - Must support iOS Dark Mode for accessibility

### Google Play Store (Android)
- **Category:** Health & Fitness
- **Required disclosures:** Same as iOS — this is a planning tool, not medical advice
- **Privacy:** Same — on-device storage only in Stage 1, privacy policy reflects this
- **Content rating:** PEGI 3 or equivalent
- **Guideline notes:**
  - Must handle back button properly
  - Must work on tablets (landscape + portrait)
  - System dark mode support required
  - No ads without explicit user consent (recommend no ads for Stage 1)

### Shared Requirements
- **Accessibility:** WCAG 2.1 AA minimum (large text, high contrast, screen reader support)
- **Permissions disclosure:** Only request permissions needed (calendar for due date reminders, camera for any future video recording)
- **Data privacy:** Clear privacy policy stating no data is sent to servers in Stage 1
- **No medical claims:** Use language like "planning tool," "preparation app," not "medical advice" or "diagnosis"

## 13. Content Inventory from Spreadsheet

| Tab | Content Type | Record Count | Maps To |
|---|---|---|---|
| Checklist / Copy of Checklist | Bag items with categories and locations | ~118 items across 10 categories | Labor Bag module |
| To Dos | Birth plan questions, food preferences, action items | 9 birth plan Qs, 23 food likes, 5 dislikes | Birth Plan, Food Preferences |
| Partner Tips | Categorized advice for partners | ~40 tips across 9 categories | Partner Playbook |
| Interventions | Medical interventions with preferences | 13 interventions + transition note | Interventions Tracker |
| Qs for Provider | Questions to ask OB/midwife | 11 questions | Questions for Provider |
| Calm Vibes | Music playlists, calming videos, techniques, BRAIN | ~30 links + techniques | Music & Vibes, Comfort Techniques, BRAIN Tool |
| Affirmations | Affirmations for labor | 3 core + meditation links | Affirmations |
| Doula Vlog | Curated video links by phase | 24 videos across 8 phases | Video Library |
| LLM Prompts | Prompt templates for researching interventions | 1 template | Could integrate as AI research feature (Stage 3+) |

## 14. Success Metrics

- **Completion rate:** % of users who finish all Stage 1 sections.
- **Bag packing rate:** % of items checked off before labor.
- **Return visits:** Does the partner come back to review/update?
- **Labor Mode usage:** Was the app opened during actual labor?
- **App store ratings:** Target 4.5+ stars on both iOS and Android
- **Qualitative:** Post-birth survey — "Did you feel prepared?" "Did your partner feel supported?"
- **Platform metrics:** Monitor crash rates, performance, and platform-specific issues

## 15. Open Questions

1. **Shared access model.** Should the wife have her own login to view/edit, or is this intentionally partner-only with verbal collaboration? The "interview" framing suggests the latter for Stage 1.
2. **Personalization.** Should the app ask about birth setting (hospital vs. birth center vs. home) and filter content accordingly?
3. **Notifications/reminders.** Worth building push notifications for "X weeks out, have you done Y?" or is that scope creep for MVP?
4. **Monetization.** Free with premium features? One-time purchase? Free forever? Affects tech decisions (accounts, payments).
5. **Content updates.** Who maintains the tip database and checklist defaults? Is this a living product or a one-and-done tool?
