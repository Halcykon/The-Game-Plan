# Testing Guide

## Test Strategy Overview

Labor Prep Together is a **web application** with the following test approach:

1. **Unit Tests** — Individual functions and utilities
2. **Component Tests** — React component rendering and interactions
3. **Integration Tests** — Full section workflows
4. **Manual Testing** — Browser and responsive design validation

## Running Tests

### Jest Unit & Component Tests

```bash
npm test              # Run all tests once
npm test:watch       # Watch mode (re-runs on file change)
npm test:coverage    # Generate coverage report
```

### Test Files Location
```
__tests__/
├── utils.test.ts     # Utility function tests
├── components.test.ts # Component tests
└── app.test.ts       # Integration tests
```

## Unit Tests

Test individual utility functions like:
- `personalizeQuestionText()` — Replace "she" with mother's name
- `labelForWhom()` — Generate "For [Name]" labels
- `parseBulkBagText()` — Parse pipe-delimited bag items
- `normalizePackedToken()` — Convert text to boolean

**Example:**
```typescript
describe('personalizeQuestionText', () => {
  it('replaces "she" with provided name', () => {
    const result = personalizeQuestionText('Does she want pain meds?', 'Sarah');
    expect(result).toBe('Does Sarah want pain meds?');
  });

  it('uses fallback when no name provided', () => {
    const result = personalizeQuestionText('Does she want pain meds?', '');
    expect(result).toBe('Does the birthing parent want pain meds?');
  });
});
```

## Component Tests

Test React components with `@testing-library/react`:

**Example QuestionCard test:**
```typescript
describe('QuestionCard', () => {
  it('renders question and description', () => {
    const { getByText } = render(
      <QuestionCard question="What is your preference?" description="Some info">
        <input />
      </QuestionCard>
    );
    expect(getByText('Ask her: "What is your preference?"')).toBeTruthy();
    expect(getByText('Some info')).toBeTruthy();
  });
});
```

**Example Button test:**
```typescript
describe('Button', () => {
  it('calls onClick when pressed', () => {
    const handlePress = jest.fn();
    const { getByText } = render(<Button onPress={handlePress}>Click me</Button>);
    fireEvent.press(getByText('Click me'));
    expect(handlePress).toHaveBeenCalled();
  });
});
```

## Integration Tests

Test full workflows like interview flow or bag packing:

**Example interview flow test:**
```typescript
describe('Interview Flow', () => {
  it('completes interview and saves answers', () => {
    // Setup: render app with initial state
    // Action: answer all 9 questions
    // Assert: birthAnswers contains all responses, localStorage updated
  });

  it('links interview answers to interventions', () => {
    // Setup: answer pain medication question
    // Assert: epidural, narcotics, nitrous interventions are visible/highlighted
  });
});
```

## Manual Testing

### Browser Testing

**Setup:**
```bash
npm start
# Opens http://localhost:3000
```

**Test flow:**
1. ✅ App loads without errors
2. ✅ Setup modal appears
3. ✅ Enter partner name, mother name, due date
4. ✅ Modal closes, interview section loads

### Interview Section Testing

- [ ] All 9 questions display correctly
- [ ] Mother's name appears in personalized questions
- [ ] Can answer text questions
- [ ] Answers persist when navigating sections
- [ ] Interview completion tracked

### Interventions Section Testing

- [ ] All 11 interventions load from JSON
- [ ] Can toggle preference (yes/no/unsure)
- [ ] Can mark as reviewed
- [ ] Filter by stage works
- [ ] Bulk select/deselect works
- [ ] Intervention descriptions visible

### Labor Bag Testing

- [ ] All categories and ~90 items load
- [ ] Can mark items as packed (strikethrough)
- [ ] Filter by "for whom" works (her/partner/baby/shared)
- [ ] Bulk import adds items correctly
- [ ] Can add custom items
- [ ] Packing progress updates

### Playbook Testing

- [ ] 7 tip categories load
- [ ] Tips display with personalized names (partner, mother)
- [ ] Can collapse/expand categories
- [ ] Bulk import works
- [ ] Search filters tips

### Review Section Testing

- [ ] Shows summary of setup
- [ ] Shows interview completion status
- [ ] Shows number of interventions reviewed
- [ ] Shows packing progress
- [ ] All data is current/accurate

### Data Persistence Testing

```javascript
// In browser DevTools console:

// Check localStorage
localStorage.getItem('labor-prep-web-app-v2')
// Should show JSON with all app data

// Manually clear and verify reload works
localStorage.clear()
location.reload()
// App should reset to initial state
```

### Responsive Design Testing

**Desktop (1920x1080):**
- [ ] All sections display properly
- [ ] No horizontal scrolling
- [ ] Buttons/inputs are clickable

**Tablet (768x1024):**
- [ ] Layout stacks appropriately
- [ ] Touch targets are 44px minimum
- [ ] Form fields are properly sized

**Mobile (375x812):**
- [ ] Text is readable without zoom
- [ ] Buttons are easily tappable
- [ ] No layout shifts
- [ ] Scrolling is smooth

**Test with Chrome DevTools:**
- F12 → Toggle Device Toolbar (Ctrl+Shift+M)
- Test multiple device presets (iPhone, iPad, etc.)

### Cross-Browser Testing

- [ ] Chrome (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Testing Checklist Before Deployment

### Functionality
- [ ] App loads without console errors
- [ ] Setup flow completes
- [ ] All 5 sections (interview, interventions, bag, playbook, review) work
- [ ] Data persists across page reload
- [ ] Bulk import parses correctly
- [ ] Personalization works (names appear)

### Data
- [ ] All JSON files load correctly
- [ ] Interview questions: 9 total
- [ ] Interventions: 11 total
- [ ] Bag categories: 10+ with items
- [ ] Playbook tips: 7 categories
- [ ] No missing data or broken references

### UI/UX
- [ ] Responsive on mobile/tablet/desktop
- [ ] Touch targets ≥44px
- [ ] Text is readable
- [ ] Colors have sufficient contrast
- [ ] No layout shifts or visual bugs
- [ ] Dark mode (if applicable)

### Performance
- [ ] App loads quickly (< 3 seconds)
- [ ] No noticeable lag when typing
- [ ] localStorage save is instant
- [ ] Bulk import doesn't freeze UI

### Accessibility
- [ ] Keyboard navigation works
- [ ] Form labels are clear
- [ ] Error messages are descriptive
- [ ] Color isn't only way to distinguish content

## Common Test Patterns

### Testing State Changes
```typescript
it('updates state when user answers question', () => {
  const { getByTestId } = render(<App />);
  const input = getByTestId('bp1-answer');
  fireEvent.changeText(input, 'My answer');
  expect(appData.birthAnswers.bp1).toBe('My answer');
});
```

### Testing localStorage
```typescript
it('persists data to localStorage', () => {
  // Make changes
  // Check localStorage
  const stored = JSON.parse(localStorage.getItem('labor-prep-web-app-v2'));
  expect(stored.birthAnswers.bp1).toBeDefined();
});
```

### Testing Personalization
```typescript
it('uses mother name in questions', () => {
  const { getByText } = render(<App />);
  // Set mother name to "Sarah"
  // Verify questions show "Sarah" instead of "she"
  expect(getByText(/Sarah/)).toBeTruthy();
});
```

## Debugging Tests

```bash
# Run single test file
npm test utils.test.ts

# Run tests matching pattern
npm test --testNamePattern="personalization"

# Run with verbose output
npm test --verbose

# Update snapshots (if using snapshot testing)
npm test -u
```

## Coverage Goals

- **Statements:** 80%+
- **Branches:** 75%+
- **Functions:** 80%+
- **Lines:** 80%+

Run `npm test:coverage` to check current coverage.

## Known Testing Gaps

- Limited end-to-end tests (full workflow with real localStorage)
- No visual regression testing yet
- No load/stress testing
- No accessibility automated testing (but manual checks in checklist)

## Future Testing Improvements

- [ ] Add E2E tests (Cypress or Playwright)
- [ ] Add visual regression tests (Percy or similar)
- [ ] Add accessibility tests (axe-core)
- [ ] Add performance benchmarks
- [ ] Increase unit test coverage to 90%+
