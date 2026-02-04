# 📖 User Story: P5 - Language Support in AI

**Story ID**: SPRINT-3-P5
**Epic**: Multilingual Support
**Sprint**: Sprint 3
**Priority**: 🟡 MÉDIA
**Status**: 📋 Ready for Development
**Points**: 3 (2 days)
**Created**: 2026-02-03
**PO**: Pax (Balancer)

---

## 📝 User Story Statement

**As a** Portuguese user
**I want to** generate a blueprint in Portuguese
**So that** the entire blueprint (not just UI) is in my language

---

## 🎯 Acceptance Criteria

### AI Provider Integration
- [ ] Blueprint generation receives language parameter
- [ ] System prompt includes language directive
  - [ ] Gemini: "Respond in ${language === 'pt-BR' ? 'Portuguese' : 'English'}"
  - [ ] OpenAI: same language directive
- [ ] Language passed in request body (not just prompt)
- [ ] Both providers respect language selection
- [ ] Fallback (Gemini → OpenAI) maintains language

### Testing
- [ ] Select PT-BR → Blueprint generated in Portuguese
- [ ] Select EN → Blueprint generated in English
- [ ] Language change mid-flow → affects output
- [ ] All sections translated (exec summary, problem, etc)
- [ ] Terminology correct in both languages
- [ ] Email template respects language
- [ ] Audio transcription respects language (P2)

### Quality
- [ ] No English text mixed with Portuguese
- [ ] Professional terminology used
- [ ] No machine-translation artifacts
- [ ] Cultural context respected (PT-BR specific)

---

## 📚 File List

### Modified Files
```
src/lib/ai/providers/gemini.ts
src/lib/ai/providers/openai.ts
src/lib/ai/blueprint.ts
```

---

## 💬 Task Breakdown

### Task 5.1: Update Providers (Day 1)
**Owner**: Backend Dev
**Status**: [ ] Not started

- [ ] Get language from i18n context
- [ ] Add language to Gemini system prompt
- [ ] Add language to OpenAI system prompt
- [ ] Test Portuguese blueprint generation
- [ ] Test English blueprint generation

### Task 5.2: Testing (Day 2)
**Owner**: QA
**Status**: [ ] Not started

- [ ] Generate PT blueprint → all Portuguese
- [ ] Generate EN blueprint → all English
- [ ] Verify terminology
- [ ] Sign-off ✅

---

## ✅ Definition of Done

- [x] Language parameter passed to both providers
- [x] PT-BR blueprints are 100% Portuguese
- [x] EN blueprints are 100% English
- [x] All tests passing
- [x] User story closed

---

**Created by**: Pax (PO)
**Last Updated**: 2026-02-03
**Status**: ✅ Ready for Sprint 3
