# Landing Page - Bug Report & Issues Sprint 3

**Story ID:** LANDING-REDESIGN-001
**Report Date:** 2026-02-01
**Reporter:** Product Owner
**Status:** ✅ COMPLETE - Ready for QA

---

## Critical Issues (Blocking)

### 🔴 ISSUE #1: Text Input - Cannot Type After 2nd Character
**Severity:** CRITICAL
**Component:** ProblemInputPanel / Textarea
**Description:**
- User cannot type or delete text after 2nd character
- Input field becomes unresponsive after reaching character position 2
- This completely blocks the main workflow

**Expected Behavior:**
- User should be able to type freely and delete any character
- No character limit restrictions on initial input

**Steps to Reproduce:**
1. Click on problem input textarea
2. Type first character - OK
3. Type second character - OK
4. Try to type third character - FAILS / Input frozen

**Files to Check:**
- `components/LandingPage.tsx` - textarea onChange handler
- Possible controlled component state issue

---

### 🔴 ISSUE #2: Language Selector Not Working
**Severity:** CRITICAL
**Component:** LanguageSelector
**Description:**
- Clicking language selector does not change application language
- Translations not being applied across components
- i18n configuration may not be properly initialized

**Expected Behavior:**
- Clicking language option should change all text in the application
- Should persist selection in localStorage
- Should update immediately

**Current Implementation:** `src/components/LanguageSelector.tsx`
**i18n Config:** `src/i18n/config.ts`

**Root Causes to Investigate:**
- Language selector not calling proper i18n method
- useTranslation hook not re-rendering after change
- i18n initialization issue

---

### 🟠 ISSUE #3: Inconsistent Language in Questions (EN/PT-BR Mix)
**Severity:** HIGH
**Component:** QuestoesGuia / QUESTION_PROMPTS
**Description:**
- Questions appear sometimes in English, sometimes in Portuguese
- No clear pattern for when each language shows
- Inconsistent user experience

**Expected Behavior:**
- All questions should respect the selected language (pt-BR or en)
- Should use i18n translation system for QUESTION_PROMPTS

**Files to Check:**
- `components/LandingPage.tsx` - QUESTION_PROMPTS hardcoded
- Need to load from i18n instead

**Related to:** Issue #2 (Language Selector)

---

## High Priority Issues

### 🟠 ISSUE #4: Questões Guia Overlapping Navbar
**Severity:** HIGH
**Component:** QuestoesGuia Panel (Right Column)
**Description:**
- Questions panel overlaps with navbar when scrolling
- Important information in header is hidden
- Layout is breaking on certain viewport sizes

**Expected Behavior:**
- Right panel should push down below navbar
- No overlap with sticky navbar
- Proper z-index management

**Files to Check:**
- Layout grid structure in LandingPage.tsx
- z-index values for navbar vs content

---

### 🟠 ISSUE #5: "Melhorar com IA" Button - Incomplete Implementation
**Severity:** HIGH
**Component:** ProblemInputPanel / ImproveButton
**Description:**
- Button currently shows as always active/visible
- Should only enable AFTER user types 15+ characters
- Missing API integration with Gemini
- No system prompt file for problem structuring

**Current State:**
- Button exists but doesn't call AI API
- Badge "IA REFINANDO..." shows but doesn't actually process

**Expected Behavior:**
1. Button should be DISABLED by default
2. Enable when input length >= 15 characters
3. On click:
   - Show "IA REFINANDO..." badge with pulsing animation
   - Send text to Gemini API with system prompt
   - Replace textarea content with improved problem statement
   - Hide badge when complete

**Required Implementation:**
- Create `/src/lib/ai/systemPrompts/problemStructuring.ts` - System prompt for Gemini
- Add Gemini API integration in `/src/lib/ai/providers/`
- Update ProblemInputPanel component logic
- Add error handling and toast notifications

**System Prompt Objective:**
- Take fragmented user text (usually 15-50 chars)
- Convert to structured, comprehensive problem statement
- Ensure coherence with business reality
- Maintain user's original intent
- Output should be ready for AI analysis phase

---

### 🟠 ISSUE #6: Language Selector UX Redesign
**Severity:** MEDIUM
**Component:** LanguageSelector / Navbar
**Description:**
- Current selector always shows both language options
- Should be more compact/clean

**Expected Behavior:**
- Show only CURRENTLY ACTIVE language in navbar (e.g., "PT" or "EN")
- On click, expand a dropdown list below with available options:
  - Português (PT-BR)
  - English (EN)
- Click to select, dropdown closes

**Files to Modify:**
- `src/components/LanguageSelector.tsx` - Complete redesign

---

## Medium Priority Issues

### 🟡 ISSUE #7: Add Footer to Landing Page
**Severity:** MEDIUM
**Component:** New Footer Component
**Description:**
- Landing page currently has no footer
- Should include standard footer links

**Expected Behavior:**
- Add footer section at bottom of landing page
- Include standard links (Privacy, Terms, Contact, etc.)
- Consistent styling with page design

**Required Changes:**
- Create `components/layout/Footer.tsx`
- Add to `components/LandingPage.tsx`
- Add translations in i18n files
- Ensure responsive design

---

### 🟡 ISSUE #8: Complexity Classification - Mock Data
**Severity:** MEDIUM
**Component:** Phase 4 / Scoring System
**Description:**
- Complexity classification always shows "Médio"
- Should be calculated based on:
  1. Score from dimension selections (Phase 2)
  2. Recalculated based on custom questions (Phase 4)

**Current Flow:**
1. User describes problem (Landing Page)
2. User selects dimensions (Phase 2) → generates initial score
3. User answers custom questions (Phase 4) → recalculates score
4. Complexity badge should update accordingly

**Expected Behavior:**
- Low: Score 0-33%
- Medium: Score 34-66%
- High: Score 67-100%

**Files to Review:**
- `src/lib/leads/scorer.ts` - Check scoring algorithm
- `src/lib/leads/phase5Manager.ts` - Check complexity calculation
- Ensure score persists through phases
- Ensure Phase 4 questions update the score

**Root Cause:** Likely mock/hardcoded value in complexity display component

---

## Summary Table

| # | Issue | Severity | Component | Status |
|---|-------|----------|-----------|--------|
| 1 | Cannot type after 2nd char | CRITICAL | Textarea | ✅ DONE |
| 2 | Language selector broken | CRITICAL | i18n | ✅ DONE |
| 3 | Mixed EN/PT languages | HIGH | Prompts | ✅ DONE |
| 4 | Panel overlaps navbar | HIGH | Layout | ✅ DONE |
| 5 | Melhorar com IA incomplete | HIGH | AI Integration | ✅ DONE |
| 6 | Language selector UX | MEDIUM | Component | ✅ DONE |
| 7 | Missing footer | MEDIUM | Layout | ✅ DONE |
| 8 | Mock complexity data | MEDIUM | Scoring | ✅ DONE |

---

## Implementation Order (Recommended)

### Phase 1: Block Resolvers (Critical)
1. **Fix #1** - Text input restrictions (quick fix)
2. **Fix #2** - Language selector (i18n setup)
3. **Fix #3** - Language consistency in prompts

### Phase 2: Core Features
4. **Fix #5** - "Melhorar com IA" with Gemini API
5. **Fix #4** - Layout overlap issues

### Phase 3: Polish & Enhancement
6. **Fix #6** - Language selector UX improvement
7. **Fix #7** - Add footer
8. **Fix #8** - Complexity scoring algorithm

---

## Tasks Created (Sprint 3)

| Task ID | Issue | Phase | Status |
|---------|-------|-------|--------|
| #1 | FIX #1: Text Input Frozen | Phase 1 | ✅ Complete |
| #2 | FIX #2: Language Selector | Phase 1 | ✅ Complete |
| #3 | FIX #3: Language Consistency | Phase 1 | ✅ Complete |
| #4 | FIX #5: Gemini AI Feature | Phase 2 | ✅ Complete |
| #5 | FIX #4: Navbar Overlap | Phase 2 | ✅ Complete |
| #6 | FIX #6: Language Selector UX | Phase 3 | ✅ Complete |
| #7 | FIX #7: Add Footer | Phase 3 | ✅ Complete |
| #8 | FIX #8: Complexity Scoring | Phase 3 | ✅ Complete |

---

## Next Steps

1. ✅ **PO (@po)** - Prioritize issues and create tasks
2. 🏗️ **Architect (@architect)** - Design solutions for Issues #5 & #8 (when ready)
3. 👨‍💻 **Dev (@dev)** - Implement fixes starting with Phase 1 tomorrow
4. 🧪 **QA (@qa)** - Test and validate each fix
5. 📋 **Update story** - Mark checkboxes as complete

---

**Created by:** Claude Code (with PO prioritization)
**Last Updated:** 2026-02-01
**Status:** READY FOR DEVELOPMENT (Phase 1 tasks pending)
