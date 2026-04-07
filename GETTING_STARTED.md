# Getting Started

## Quick Setup (5 minutes)

### 1. Clone & Install
```bash
git clone https://github.com/Halcykon/The-Game-Plan.git
cd The-Game-Plan
npm install
```

### 2. Run Locally
```bash
npm start
```
Opens at `http://localhost:3000` (or similar) in your browser.

### 3. Test the App
1. Fill in setup (partner name, mother name, due date)
2. Go through interview questions
3. Set intervention preferences
4. Pack the labor bag
5. Review playbook tips
6. Check summary on review page

All data persists in browser localStorage automatically.

## Development

### Available Commands

```bash
npm start              # Start dev server (hot reload)
npm run build          # Build for web (creates dist/)
npm test               # Run Jest tests
npm test:watch        # Run tests in watch mode
npm run lint           # TypeScript type checking
```

### Project Structure

```
├── App.tsx                    # Main app (all 5 sections)
├── components/                # Reusable React components
├── lib/
│   ├── theme.ts               # Design tokens
│   └── types.ts               # TypeScript types
├── data/                      # JSON content files
│   ├── birthPlanQuestions.json
│   ├── interventions.json
│   ├── bagCategories.json
│   └── partnerTips.json
└── dist/                      # Built web app (generated)
```

### Editing Content

All content is in JSON files. No code rebuild needed:

**Interview Questions:** `data/birthPlanQuestions.json`
```json
{
  "id": "bp2",
  "question": "Does she want pain medication?",
  "type": "text",
  "placeholder": "...",
  "description": "..."
}
```

**Interventions:** `data/interventions.json`
```json
{
  "id": "int_epidural",
  "name": "Epidural",
  "description": "...",
  "defaultPref": "unsure"
}
```

**Labor Bag:** `data/bagCategories.json`
```json
{
  "id": "cat_car",
  "name": "In the Car",
  "emoji": "🚗",
  "items": [
    { "name": "Insurance cards", "forWhom": "her" }
  ]
}
```

**Partner Tips:** `data/partnerTips.json`
```json
{
  "category": "Advocacy",
  "tips": ["Listen to her birth preferences...", "..."]
}
```

### Making Changes

1. Edit JSON in `data/`
2. Save file
3. Browser hot-reloads automatically
4. Changes appear immediately

### Adding Components

Most UI is in `App.tsx`. Reusable components in `components/`:

1. Create file: `components/MyComponent.tsx`
2. Import theme tokens: `import { colors, spacing } from '../lib/theme'`
3. Use theme values (never hardcode colors)
4. Export from `components/index.ts`
5. Import in `App.tsx`

## Deployment

### Build for Production

```bash
npm run build
# Creates dist/ folder with static files
```

### Deploy to Vercel

**Option 1: Auto-deploy (recommended)**
```bash
git push origin main
# Vercel auto-detects and deploys
```

**Option 2: Manual deploy**
```bash
npm install -g vercel
vercel deploy
```

### Check Deployment Status

Go to [vercel.com](https://vercel.com):
1. Click your project
2. View deployments
3. Green checkmark = live
4. Check build logs if failed

## Testing

### Run Tests
```bash
npm test                # Run all tests once
npm test:watch         # Run in watch mode for development
npm test:coverage      # Generate coverage report
```

### Test Locally

1. **Desktop browser:** Full app at `http://localhost:3000`
2. **Mobile browser:** Use device or browser dev tools mobile view
   - Chrome: F12 → Toggle Device Toolbar
   - Safari: Develop → Enter Responsive Design Mode
3. **Different screen sizes:**
   - Test on phone, tablet, desktop
   - Check responsive layout

### Manual Testing Checklist

- [ ] Setup flow works (enter names, due date)
- [ ] Interview: All 9 questions display correctly
- [ ] Personalization: Mother's name appears in questions
- [ ] Interventions: Can toggle preferences, filter by stage
- [ ] Labor bag: Can mark items as packed, bulk import works
- [ ] Playbook: Tips display, categories collapse/expand
- [ ] Review: Shows summary of all sections
- [ ] Data persists: Reload page, data is still there
- [ ] Works on mobile browser (responsive)

## Troubleshooting

### npm install fails
```bash
# If peer dependency errors:
npm install --legacy-peer-deps
# Or the .npmrc file should handle it automatically
```

### Build fails on Vercel
1. Check Vercel build logs (Deployments → click deployment → Build Logs)
2. Common issues:
   - Missing .npmrc file (legacy-peer-deps)
   - TypeScript errors (run `npm run lint` locally)
   - Missing dependencies (run `npm install`)

### Data not persisting
- Check browser localStorage:
  - Open DevTools (F12)
  - Application → Local Storage
  - Look for key: `labor-prep-web-app-v2`
- Try clearing cache and reloading
- Some browsers limit localStorage in private mode

### Styles not applying
- Check `lib/theme.ts` tokens being used
- Ensure components import from `lib/theme`
- Never hardcode colors/spacing
- Restart dev server: `npm start`

## Next Steps

1. **Local development:** `npm start`
2. **Make changes:** Edit files, see hot reload
3. **Test:** Run tests, manual browser testing
4. **Commit:** `git add . && git commit -m "..."`
5. **Push:** `git push origin main`
6. **Deploy:** Vercel auto-deploys
7. **Verify:** Check app at your Vercel URL

## Need Help?

- **TypeScript errors:** Run `npm run lint`
- **Components:** Check `components/` folder for examples
- **Styling:** Reference `lib/theme.ts` for available tokens
- **Data:** Edit JSON in `data/` folder
- **Deployment:** Check CLAUDE.md for architecture details
