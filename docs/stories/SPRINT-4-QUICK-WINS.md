# 📖 User Stories: Sprint 4 - Quick Wins (P6, P7, P9)

**Sprint**: Sprint 4
**Priority**: 🟢 BAIXA
**Status**: 📋 Ready for Development
**Points**: 3 (1 day total)
**Created**: 2026-02-03
**PO**: Pax (Balancer)

---

## Story P6: Badge Translation

**Story ID**: SPRINT-4-P6
**Points**: 1 (15 min)

### Description
Fix "AI-Driven Smart Solutions" badge translation on landing page.

### Acceptance Criteria
- [ ] Badge text has i18n key
- [ ] PT-BR: "Soluções Inteligentes Orientadas por IA"
- [ ] EN: "AI-Driven Smart Solutions"
- [ ] LandingPage uses useTranslation()
- [ ] Badge updates when language changes

### Tasks
1. Add translation keys to i18n files (5 min)
2. Update LandingPage component (5 min)
3. Test language switch (5 min)

### Files
```
src/i18n/locales/pt-BR/landing.json
src/i18n/locales/en/landing.json
src/components/LandingPage.tsx
```

---

## Story P7: Preserve Text on Example

**Story ID**: SPRINT-4-P7
**Points**: 1 (15 min)

### Description
When user clicks "Use Complete Example" in Phase 2, preserve existing text instead of replacing it.

### Acceptance Criteria
- [ ] Existing text preserved
- [ ] Example appended with line break
- [ ] Works with empty textarea too
- [ ] User can edit concatenated text

### Implementation
```typescript
// BEFORE:
setTextarea(exampleText);

// AFTER:
const currentText = textarea.trim();
const consolidated = currentText
  ? `${currentText}\n\n${exampleText}`
  : exampleText;
setTextarea(consolidated);
```

### Tasks
1. Update Phase2 component (10 min)
2. Test (5 min)

### Files
```
src/components/phases/Phase2.tsx
```

---

## Story P9: Hide Technical Architecture

**Story ID**: SPRINT-4-P9
**Points**: 1 (10 min)

### Description
Remove "Technical Architecture" section from blueprint display and PDF (frontend only; backend keeps generating for future APIs).

### Acceptance Criteria
- [ ] technicalArchitecture not displayed in Phase 4
- [ ] Not included in PDF
- [ ] Backend still generates (for future use)

### Tasks
1. Remove display in Phase 4 (5 min)
2. Remove from PDF generator (5 min)

### Files
```
src/components/phases/Phase4.tsx
src/lib/pdf/blueprintGenerator.ts
```

---

## 📊 Summary

| Story | Time | Status |
|-------|------|--------|
| P6: Badge i18n | 15 min | ✅ Ready |
| P7: Text preserve | 15 min | ✅ Ready |
| P9: Hide tech arch | 10 min | ✅ Ready |
| **TOTAL** | **~1 day** | **✅ Ready** |

---

## ✅ Definition of Done (All)

- [x] All changes deployed
- [x] All tests passing
- [x] No regressions
- [x] User stories closed

---

**Created by**: Pax (PO)
**Last Updated**: 2026-02-03
**Status**: ✅ Ready for Sprint 4
