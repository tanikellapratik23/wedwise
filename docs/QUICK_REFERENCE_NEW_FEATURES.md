# Quick Reference - New Features Usage

## 1. Number Formatting
### Import the utility
```typescript
import { formatNumberWithCommas, formatCurrency, formatPercentage } from '../../utils/formatting';
```

### Use in components
```typescript
// Format a number with commas
<p>{formatNumberWithCommas(130000)}</p>  // Output: 130,000

// Format currency
<p>{formatCurrency(130000)}</p>  // Output: $130,000

// Format without decimals
<p>{formatCurrency(130000, false)}</p>  // Output: $130,000

// Format percentage
<p>{formatPercentage(45.5)}</p>  // Output: 45.5%
```

---

## 2. AI Assistant Widget Features

### The widget is now:

#### ✅ Movable
- Click the **header with grip icon** and drag to any position on screen
- Position saves automatically to localStorage

#### ✅ Resizable  
- Drag the **bottom-right corner** (gradient handle) to resize
- Minimum size: 300x300px
- Size saves automatically to localStorage

#### ✅ Navigable
Just ask the AI to take you somewhere:
```
"Take me to the budget page"
"Go to guest list"
"Show me my vendors"
"Take me to the overview"
"Navigate to settings"
```

#### ✅ Smart Suggestions
The override icon (⟲) in the AI Optimization box on Overview refreshes suggestions with new AI analysis

---

## 3. Files You Can Remove (if not needed in future)

```typescript
// These are hidden but code is retained:
- client/src/components/dashboard/OutfitPlanner.tsx (code kept, feature hidden)
- client/src/components/dashboard/PostWeddingStory.tsx (code kept, feature hidden)
```

---

## 4. AI Navigation Patterns Recognized

```typescript
// The AI looks for these keywords:
'budget', 'expenses'         → /dashboard/budget
'guest', 'guests'            → /dashboard/guests  
'vendor', 'vendors'          → /dashboard/vendors
'todo', 'task', 'tasks'      → /dashboard/todos
'overview', 'dashboard', 'home' → /dashboard/overview
'split', 'vivaha split'      → /dashboard/vivaha-split
'registry'                    → /dashboard/registry
'seating'                     → /dashboard/seating
```

---

## 5. localStorage Keys Used for AI Widget

```typescript
// AI Assistant state is stored here
localStorage.getItem('aiAssistantState')

// Returns: { position: {x, y}, size: {width, height} }
// This persists across sessions
```

---

## 6. Event System for AI Navigation

The AI widget dispatches a custom event when navigating:

```typescript
// Event name: 'aiNavigate'
// Event detail: { path: '/dashboard/budget' }

// Listen for it in components if needed:
window.addEventListener('aiNavigate', (event) => {
  const targetPath = (event as CustomEvent).detail.path;
  navigate(targetPath);
});
```

---

## 7. Budget Update via AI (Ready for Implementation)

The user mentioned wanting to say "add 40000 to vendor budget" and have it update automatically. This is partially implemented:

Current status:
- AI receives the message
- Would need backend API to update budget category
- Would dispatch `budgetChanged` custom event
- BudgetTracker listens for this event

To complete:
```typescript
// In AIAssistant.tsx, after AI response:
if (input.toLowerCase().includes('add') && input.toLowerCase().includes('budget')) {
  // Parse amount and category
  // Call API to update budget
  // Dispatch event to update UI
}
```

---

## 8. Recent Component Changes Summary

### AIAssistant.tsx
- Added Position, Size, isDragging, isResizing state
- Added mouse event handlers for drag/resize
- Added navigation pattern matching
- Widget now uses absolute positioning with saved state

### Overview.tsx
- Added refresh button to AI Optimization box
- Button calls `generateSuggestions()` on click
- Shows loading spinner while fetching

### BudgetTracker.tsx
- All currency values formatted with commas
- Summary cards use formatCurrency()
- Category table amounts formatted

### VendorManagement.tsx
- Stats formatted with commas
- Total Budget and Spent display properly formatted

### Dashboard.tsx
- "More Features" button only shows if features exist
- Outfit Planner and Story Builder hidden

---

## 9. Testing Checklist

Before deploying, verify:

- [ ] AI widget can be dragged by the header
- [ ] AI widget can be resized from the corner
- [ ] Position/size persists after page reload
- [ ] AI responds to navigation commands
- [ ] Numbers display with commas everywhere
- [ ] "More Features" button is hidden
- [ ] Refresh button works on Overview page
- [ ] No console errors in browser DevTools

---

## 10. Remaining Tasks for Future

1. **Vendor Link Input** - Add modal when clicking "Add Vendor"
2. **Registry Shopping Hub** - Complete full redesign
3. **AI Budget Update** - Parse and apply budget changes via AI
4. **Server Performance** - Investigate slow login responses
5. **Registry Likes/Hearts** - Persist liked items to backend

