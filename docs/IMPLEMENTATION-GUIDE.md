# 🔨 Implementation Guide - Sprint 1-4

**Status**: Development-Ready
**Last Updated**: 2026-02-03
**Target**: 51 points (9 stories)

---

## 📋 Quick Reference

### Dependencies Added
- ✅ `resend` - Email delivery service
- ✅ `zod` - Data validation
- ✅ `jspdf` - PDF generation
- ✅ `html2canvas` - HTML to Canvas conversion

### Database Setup
```bash
# Run migrations
supabase db push
```

### Environment Variables Required
```env
# .env or .env.local
VITE_GEMINI_API_KEY=your_key
VITE_OPENAI_API_KEY=your_key
VITE_RESEND_API_KEY=your_key
VITE_GOOGLE_AUTH_CLIENT_ID=your_id
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key
```

---

## 🎯 Story Implementation Order

### SPRINT 1 (Parallel Possible)

#### P1: Blueprint Persistence + Email (Foundation)
**Status**: [ ] In Development

**Key Files to Create**:
- `supabase/migrations/00019_create_blueprints_extended.sql` ✅
- `supabase/migrations/00020_create_email_jobs_queue.sql` ✅
- `src/types/blueprint.ts` ✅
- `src/lib/pdf/blueprintGenerator.ts` ⏳
- `supabase/functions/save-blueprint/index.ts` ⏳
- `supabase/functions/process-email-queue/index.ts` ⏳
- `src/lib/ai/providers/emailProvider.ts` ⏳
- `src/components/phases/Phase4.tsx` (update) ⏳
- `src/__tests__/blueprint.test.ts` ⏳

**Task Checklist**:
- [ ] Migrations applied to Supabase
- [ ] Types defined and exported
- [ ] PDF generator module created
- [ ] Edge functions scaffold created
- [ ] Frontend form integration started
- [ ] Tests written and passing
- [ ] CodeRabbit review passed

**Entry Point for Dev**:
```bash
# 1. Apply migrations
supabase db push

# 2. Create Edge Functions
supabase functions new save-blueprint
supabase functions new process-email-queue

# 3. Implement core logic (see blueprintGenerator.ts structure)
# 4. Run tests
npm run test
```

---

#### P4: Admin Access + RLS (Can do parallel)
**Status**: [ ] In Development

**Key Files to Create**:
- `supabase/migrations/00021_add_role_to_user_profiles.sql` ⏳
- `supabase/migrations/00022_admin_rls_policies.sql` ⏳
- `src/components/auth/ProtectedRoute.tsx` ⏳
- `src/pages/AdminPage.tsx` ⏳
- `src/__tests__/admin-access.test.ts` ⏳

**Task Checklist**:
- [ ] Role column added to user_profiles
- [ ] RLS policies created and tested
- [ ] ProtectedRoute component implemented
- [ ] Admin route added to App.tsx
- [ ] Admin link conditional in Navbar
- [ ] All tests passing

---

### SPRINT 2 (Sequential/Parallel)

#### P3: Google Auth + Session (Depends on P1)
**Status**: [ ] Blocked (waiting for P1)

**Entry Point**:
```bash
# After P1 is complete:
# 1. Create session manager
npm run develop story-P3
```

**Key Modules**:
- Session ID management (localStorage)
- Post-auth middleware
- Google OAuth flow integration
- Blueprint recovery logic

---

#### P2: Audio-to-Text (Independent)
**Status**: [ ] In Development

**Key Files**:
- `src/lib/audio/audioRecorder.ts` ⏳
- `src/lib/audio/speechToText.ts` ⏳
- `src/components/audio/AudioButton.tsx` ⏳
- `src/hooks/useAudioRecorder.ts` ⏳
- `src/__tests__/audio.test.ts` ⏳

**Fallback Strategy**:
```
Gemini 2.0 Audio (5s timeout)
    ↓ (on failure)
OpenAI Whisper (30s timeout)
    ↓ (on failure)
User Manual Retry
```

---

### SPRINT 3-4 (Quick Wins)

#### P5: Language Support
- ✅ Migrations: Done
- ⏳ Provider integration: Update Gemini/OpenAI prompts

#### P8: Navbar Fix
- ⏳ CSS adjustment (margin-top/z-index)

#### P6, P7, P9: Quick Wins
- ⏳ i18n keys for badge
- ⏳ Textarea concatenation logic
- ⏳ Remove tech architecture field display

---

## 🧪 Testing Strategy

### Run All Tests
```bash
npm run test
```

### Run Specific Test Suite
```bash
npm run test blueprint
npm run test admin
npm run test audio
```

### Check Coverage
```bash
npm run test -- --coverage
```

### Pre-Commit Check
```bash
npm run lint
npm run type-check
npm run test
```

---

## 📊 Progress Tracking

| Story | Status | Priority | Est. Days | Assigned |
|-------|--------|----------|-----------|----------|
| P1 | 🟡 In Dev | 🔴 CRÍTICA | 5 | - |
| P4 | ⏳ Todo | 🔴 CRÍTICA | 3 | - |
| P3 | ⏳ Blocked | 🔴 CRÍTICA | 4 | - |
| P2 | ⏳ Todo | 🟠 ALTA | 4 | - |
| P5 | ⏳ Todo | 🟡 MEDIA | 2 | - |
| P8 | ⏳ Todo | 🟡 MEDIA | 0.5 | - |
| P6 | ⏳ Todo | 🟢 BAIXA | 0.25 | - |
| P7 | ⏳ Todo | 🟢 BAIXA | 0.25 | - |
| P9 | ⏳ Todo | 🟢 BAIXA | 0.25 | - |

---

## 🛠️ Developer Workflow

### Start a Story
```bash
# Read story requirements
cd docs/stories/
cat SPRINT-1-P1-BLUEPRINT-PERSISTENCE.md

# Copy recommended task order
# Create feature branch (if using Git)
git checkout -b feat/p1-blueprint-persistence

# Implement tasks sequentially
npm run develop story-P1
```

### Update Story Progress
Edit the story file and:
- [ ] Mark tasks as complete with [x]
- [ ] Update File List section
- [ ] Add notes in Dev Agent Record
- [ ] Run CodeRabbit review before marking "Ready for Review"

### Commit Pattern
```bash
git add .
git commit -m "feat: implement P1 blueprint persistence [Story P1]"
```

---

## 📚 Key Architecture Decisions

### P1: Blueprint Persistence
- **PDF Storage**: Supabase Storage (not in DB)
- **Email Queue**: Async worker (non-blocking UX)
- **Session Tracking**: UUID-based (GDPR safe)
- **Retry Logic**: Exponential backoff (1s, 5s, 30s)

### P3: Auth + Session
- **Session ID**: Crypto.randomUUID() per browser
- **Linking**: Middleware on POST /auth/callback
- **RLS Context**: User can only see own blueprints

### P2: Audio
- **Fallback Strategy**: Gemini → Whisper → Error
- **No Storage**: Audio discarded after transcription
- **Language Param**: Passed to both providers

---

## ⚠️ Known Issues & Workarounds

### Issue: ESLint errors on new files
**Workaround**: Run `npm run lint:fix` after creating files

### Issue: TypeScript strict mode issues
**Workaround**: Check `tsconfig.json` and use proper typing

### Issue: Supabase RLS blocking queries
**Workaround**: Ensure user is authenticated or using service_role

---

## 🚀 Deployment Checklist

Before deploying to production:
- [ ] All tests passing
- [ ] No console errors/warnings
- [ ] CodeRabbit review completed
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Edge functions deployed
- [ ] Supabase Storage configured
- [ ] Email templates ready (Resend)

---

## 📞 Support Resources

- **Architecture**: See `docs/ARCHITECTURE_BLUEPRINT.md`
- **Prioritization**: See `docs/PRIORIZATION_PO_FINAL.md`
- **Story Details**: See `docs/stories/SPRINT-*.md`

---

**Last Updated**: 2026-02-03
**Next Update**: After Sprint 1 completion
