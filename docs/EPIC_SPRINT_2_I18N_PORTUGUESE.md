# Epic: Portuguese Localization (i18n Complete)
**Sprint 2 - All Max Mind System**

**Epic ID**: SPRINT2-E2
**Status**: READY FOR SPRINT PLANNING
**Priority**: MUST HAVE
**Estimated Story Points**: 4
**Target Duration**: 2-3 days
**Owner**: @dev (Implementation), @po (Translation Review)

---

## 📋 Epic Description

Complete Portuguese (pt-BR) localization for all UI phases (Phases 2-4). Currently Phases 0-1 are translated; this epic completes the funnel for Brazilian market readiness.

---

## 🎯 Business Value

| Metric | Impact |
|--------|--------|
| Brazilian Market | Unlock native language experience |
| Lead Quality | +15% conversion (native language) |
| Geographic Reach | Enable LatAm GTM strategy |
| Brand Perception | Professional market presence |

---

## 📍 Current State

| Phase | Portuguese | English | Status |
|-------|-----------|---------|--------|
| Phase 0 (Tracking) | ✅ Complete | ✅ Complete | DONE |
| Phase 1 (Problem Intake) | ✅ Complete | ✅ Complete | DONE |
| Phase 2 (Dimensions) | ❌ Missing | ✅ Complete | **TODO** |
| Phase 3 (Questions) | ❌ Missing | ✅ Complete | **TODO** |
| Phase 4 (Blueprint/Lead) | ❌ Missing | ✅ Complete | **TODO** |
| Emails | ❌ Missing | ✅ Template | **TODO** |
| Error Messages | ⚠️ Partial | ✅ Complete | **TODO** |

---

## ✅ Acceptance Criteria

- [ ] Phase 2 dimension names translated (5 dimensions)
- [ ] Phase 2 descriptions translated (en → pt-BR)
- [ ] Phase 3 question generation en → pt-BR (Gemini prompt)
- [ ] Phase 4 blueprint template translated
- [ ] Phase 4 lead form labels translated
- [ ] Email templates translated (both templates)
- [ ] Error messages translated (50+ messages)
- [ ] Language selector working (PT-BR ↔ EN)
- [ ] i18n keys all correctly placed in JSON
- [ ] No hardcoded strings in components
- [ ] Browser locale detection working (pt-BR auto-selected)
- [ ] RTL languages prepared (future-proof)
- [ ] Linting passes (no unused i18n keys)
- [ ] Zero CRITICAL/HIGH CodeRabbit issues

---

## 📊 Translation Scope

### Phase 2: Dimensions (5 items × 4 options = 20 strings)
```
Dimension Labels:
- Technical Impact → Impacto Técnico
- Business Scope → Escopo de Negócio
- Resource Constraint → Restrição de Recursos
- Urgency → Urgência
- Complexity → Complexidade

Options (example for Technical Impact):
- Low → Baixo
- Medium → Médio
- High → Alto
- Critical → Crítico
```

### Phase 3: Questions Generation (Gemini Prompt)
```
Current (EN): "Generate 5 adaptive questions about the problem"
Translation (PT-BR): "Gere 5 perguntas adaptativas sobre o problema"

This changes the Gemini prompt language for question generation in Portuguese.
```

### Phase 4: Lead Form (8 fields)
```
- Name → Nome
- Email → Email
- Company → Empresa
- Project Size → Tamanho do Projeto
- Marketing Opt-in → Consentimento para Marketing
- Submit Button → Enviar
- Success Message → Sua inscrição foi recebida!
- Error Message → Erro ao enviar. Tente novamente.
```

### Emails (2 templates × ~50 strings)
```
Lead Confirmation Email:
- Subject → Seu Blueprint está pronto! 🚀
- Greeting → Olá
- Body content → [Full translation]
- CTA Button → Acessar Blueprint
- Footer → Desenvolvido por All Max Mind

Blueprint Delivery Email:
[Similar structure]
```

---

## 🗂️ File Structure

### Existing i18n Files
```
src/locales/
├── en/
│   ├── common.json         (Phase 0-1 complete)
│   ├── phase2.json         (NEEDS UPDATE)
│   ├── phase3.json         (NEEDS UPDATE)
│   ├── phase4.json         (NEEDS UPDATE)
│   └── email.json          (NEW)
└── pt-BR/
    ├── common.json         (Phase 0-1 complete)
    ├── phase2.json         (NEEDS CREATION)
    ├── phase3.json         (NEEDS CREATION)
    ├── phase4.json         (NEEDS CREATION)
    └── email.json          (NEW)
```

### i18n Configuration
```typescript
// src/i18n/config.ts
import i18n from 'i18next';
import ptBR from '../locales/pt-BR/common.json';
import enUS from '../locales/en/common.json';

i18n.init({
  resources: {
    'pt-BR': { translation: ptBR },
    'en-US': { translation: enUS },
  },
  lng: navigator.language.startsWith('pt') ? 'pt-BR' : 'en-US',
  fallbackLng: 'en-US',
});
```

---

## 📊 User Stories

### Story 1: Translate Phase 2 & 3 UI
**Points**: 1.5
**Scope**:
- Dimension labels (5)
- Dimension descriptions (5)
- Question category labels (5: context, process, pain, technical, scale)
- UI buttons ("PRÓXIMO", "VOLTAR")

**Acceptance**:
- [ ] All strings in `pt-BR/phase2.json`
- [ ] All strings in `pt-BR/phase3.json`
- [ ] i18next properly loading translations
- [ ] No hardcoded strings remaining

### Story 2: Translate Phase 4 & Emails
**Points**: 1.5
**Scope**:
- Lead form labels (8)
- Blueprint template content (20+ strings)
- Email templates (50+ strings)
- Success/error messages (15)

**Acceptance**:
- [ ] All strings in `pt-BR/phase4.json`
- [ ] All strings in `pt-BR/email.json`
- [ ] Email template tested with real email
- [ ] Form validation messages translated

### Story 3: Gemini Prompt Localization
**Points**: 1
**Scope**:
- Update `generate-questions` Edge Function to accept language param
- Translate prompt injection for Portuguese
- Test question generation in Portuguese

**Acceptance**:
- [ ] Edge Function accepts `language` parameter
- [ ] Portuguese prompts generate Portuguese questions
- [ ] Questions are culturally appropriate
- [ ] QA validates sample questions

### Story 4: Language Detection & Testing
**Points**: 1
**Scope**:
- Implement browser locale detection
- Add language selector UI
- Full regression testing in Portuguese
- Linting for unused keys

**Acceptance**:
- [ ] `pt-BR` auto-selected for Brazilian browsers
- [ ] Language switcher visible + working
- [ ] All 5 phases tested end-to-end in Portuguese
- [ ] No console errors or warnings
- [ ] `npm run lint` passes (no unused i18n keys)

---

## 🧪 Testing Strategy

### Translation Quality
- [ ] All strings reviewed by native Portuguese speaker
- [ ] No machine-translated phrases
- [ ] Context-appropriate terminology
- [ ] Consistent tone (formal but friendly)

### Functionality Testing
- [ ] Language selector persists across sessions
- [ ] Locale change updates all visible text
- [ ] Email content displays correct language
- [ ] Forms accept Portuguese input
- [ ] Gemini generates Portuguese questions

### Regression Testing
- [ ] English phase still works (no regression)
- [ ] Phase 0-1 Portuguese untouched
- [ ] GA4 language tracking updated
- [ ] Mobile responsive in Portuguese

---

## 🚀 Deployment Plan

### Staging
1. Complete all translations
2. Deploy to staging env
3. Tester accesses with `?lang=pt-BR`
4. Verify all phases in Portuguese
5. QA sign-off

### Production
1. Deploy to production
2. Monitor Portuguese user traffic
3. Track conversion rate (should match or exceed English)
4. Monitor Sentry for locale-specific errors

---

## 📝 Translation Checklist

### Strings to Translate (~200 total)
- [ ] Dimension names + descriptions (20)
- [ ] Phase 3 UI labels (15)
- [ ] Phase 4 form + labels (20)
- [ ] Lead confirmation email (40)
- [ ] Blueprint delivery email (40)
- [ ] Error messages (20)
- [ ] Success messages (10)
- [ ] Buttons + CTAs (15)

### Quality Gates
- [ ] Native speaker review
- [ ] Consistent terminology (glossary)
- [ ] Gender-neutral language where appropriate
- [ ] Proper Portuguese (pt-BR, not pt-PT)
- [ ] No hardcoded strings in code

---

## ⚠️ Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Translation quality poor | Low | High | Hire native Portuguese reviewer |
| Gemini Portuguese prompts fail | Low | Medium | Pre-test with sample problems |
| Character encoding issues | Low | Low | UTF-8 encoding validated |
| RTL languages future | Low | Low | Prepare i18n structure now |

---

## 📞 Dependencies

- [ ] All Phase 2-4 features finalized (not changed)
- [ ] Native Portuguese speaker for review
- [ ] Gemini Portuguese language support (already available)
- [ ] i18next properly configured (@dev prep)

---

## 🎓 Glossary (PT-BR)

| EN | PT-BR | Context |
|----|-------|---------|
| Problem | Problema | Business problem |
| Dimension | Dimensão | Planning dimension |
| Intent Score | Pontuação de Intenção | 0-100 urgency metric |
| Embedding | Embedding | Vector representation |
| Blueprint | Blueprint | Solution proposal |
| Lead | Prospect/Lead | Sales lead |
| Lead Score | Pontuação de Lead | Qualification metric |

---

## ✨ Definition of Done

- [ ] All 4 user stories completed
- [ ] Native Portuguese speaker review completed
- [ ] CodeRabbit: 0 CRITICAL, 0 HIGH issues
- [ ] 100% of UI tested in Portuguese
- [ ] English regression tested
- [ ] i18n linting passes (no unused keys)
- [ ] Documentation updated
- [ ] QA sign-off received
- [ ] Commit references SPRINT2-E2

---

**Epic Owner**: Morgan (@pm)
**Translation Lead**: (Native speaker)
**Dev Assignee**: Dex (@dev)
**QA Assignee**: Quinn (@qa)

---

*Created: 2026-01-28*
*Status: Ready for Sprint Planning*
