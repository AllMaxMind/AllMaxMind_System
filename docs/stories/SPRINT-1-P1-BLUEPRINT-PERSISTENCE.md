# 📖 User Story: P1 - Blueprint Persistence + Email Automation

**Story ID**: SPRINT-1-P1
**Epic**: Blueprint Lifecycle - From Generation to Delivery
**Sprint**: Sprint 1
**Priority**: 🔴 CRÍTICA 1
**Status**: 📋 Ready for Development
**Points**: 13 (5 days × 3 devs)
**Created**: 2026-02-03
**PO**: Pax (Balancer)

---

## 📝 User Story Statement

**As a** technical user who has generated a blueprint in Phase 4
**I want to** save the blueprint to my profile and automatically receive it via email
**So that** I can access, review, and share my architectural blueprint later

---

## 🎯 Acceptance Criteria

### Database Layer
- [ ] Blueprint table created with all required columns (id, session_id, user_id, email, name, phone, company, role, content, language, status, timestamps)
- [ ] Email_jobs queue table created with retry/tracking fields
- [ ] RLS policies enforced (user sees own, admin sees all)
- [ ] Indexes optimized for queries (status, created_at, blueprint_id)
- [ ] Migration applied cleanly without errors

### PDF Generation
- [ ] PDF generated from blueprint content
- [ ] PDF uploaded to Supabase Storage (/blueprints-pdf/)
- [ ] PDF URL returned and stored in email_jobs
- [ ] Fallback if PDF fails (email sent with link instead)

### Blueprint Save (Edge Function)
- [ ] Input validation (blueprint not empty, email valid, session_id exists)
- [ ] Transaction: save blueprint → generate PDF → enqueue email (atomic)
- [ ] On success: return blueprint_id + pdf_url
- [ ] On error: rollback + return error message
- [ ] Error logged to audit_logs with full stack trace
- [ ] Timeout protection (30s max)
- [ ] Retry logic for transient failures (2 retries)

### Email Queue & Delivery
- [ ] Email job enqueued immediately after save
- [ ] Queue worker processes every 5 minutes (configurable)
- [ ] Email sent via Resend API with PDF attachment
- [ ] Template: blueprint_delivery (customized for language)
- [ ] Subject: "Seu Blueprint Arquitetural - {name}"
- [ ] Email fields: recipient_email, pdf_url, blueprint_id
- [ ] Status tracking: pending → sent/failed
- [ ] Retry logic: exponential backoff (1s, 5s, 30s)
- [ ] Max retries: 3 before marking as failed
- [ ] Failed jobs logged for manual review
- [ ] Idempotency: same email_id won't send twice

### Frontend Integration (Phase 4)
- [ ] Form fields displayed: Name, Email, Phone, Company, Role
- [ ] "Salvar Blueprint" button enabled after confirmation
- [ ] POST call to /api/blueprints/save with all data
- [ ] Form validation (email format, required fields)
- [ ] Loading spinner during save operation
- [ ] Success toast: "Blueprint salvo! Email será enviado."
- [ ] Error toast with retry button on failure
- [ ] Blueprint JSON included in request
- [ ] Language parameter included (from i18n context)

### Testing & QA
- [ ] Unit tests for save function (happy + error paths)
- [ ] Unit tests for email queue (formatting, retry)
- [ ] E2E test: fill form → save → email sent
- [ ] Edge case: duplicate emails handled
- [ ] Edge case: missing optional fields (phone, company)
- [ ] Edge case: very long descriptions (> 10k chars)
- [ ] Edge case: special characters in name
- [ ] Network timeout scenario tested
- [ ] Resend API down scenario → retry works
- [ ] Storage failure → async retry works
- [ ] RLS deny access (anon user) tested
- [ ] All tests passing, coverage > 80%

### Security & Compliance
- [ ] No hardcoded API keys (use env variables)
- [ ] Email not stored in logs (PII protection)
- [ ] PDF not cached permanently (after 30 days cleanup)
- [ ] Session_id properly tracked (GDPR compliance)
- [ ] Audit trail logs all save attempts

---

## 📚 File List

### New Files Created
```
supabase/migrations/00019_create_blueprints_extended.sql
supabase/migrations/00020_create_email_jobs_queue.sql
supabase/functions/save-blueprint/index.ts
supabase/functions/process-email-queue/index.ts
supabase/functions/_shared/pdf-generator.ts (if new)
src/lib/ai/providers/emailProvider.ts (Resend adapter)
src/types/blueprint.ts (TypeScript interfaces)
src/__tests__/blueprint.test.ts
src/__tests__/emailQueue.test.ts
```

### Modified Files
```
src/components/phases/Phase4.tsx
src/lib/ai/blueprint.ts
package.json (if new dependencies: jsPDF, Resend)
.env.example (add RESEND_API_KEY)
```

---

## 🔗 Dependencies

### Blockers (Must complete first)
- None (foundation feature)

### Blocks These Stories
- ✅ P3 - Google Auth + Session (waiting for blueprints table)
- ✅ P5 - Language in IA (affects blueprint language)

### Related Stories
- N/A (Sprint 1 foundation)

---

## 💬 Task Breakdown

### Task 1.1: Database Schema (Day 1)
**Owner**: Lead Backend Dev
**Estimate**: 1 day
**Status**: [ ] Not started

- [ ] Create blueprints table migration
- [ ] Create email_jobs table migration
- [ ] Add RLS policies
- [ ] Create indexes for performance
- [ ] Test migrations locally
- [ ] Document schema changes

### Task 1.2: PDF Generation Module (Day 1)
**Owner**: Backend Dev
**Estimate**: 1 day
**Status**: [ ] Not started

- [ ] Create PDF generator (jsPDF)
- [ ] Handle blueprint content → PDF layout
- [ ] Upload to Supabase Storage
- [ ] Return URL for email
- [ ] Error handling (fallback)
- [ ] Unit tests

### Task 1.3: Edge Function - save-blueprint (Day 2-3)
**Owner**: Lead Backend Dev + 1 Backend Dev
**Estimate**: 2 days
**Status**: [ ] Not started

- [ ] Input validation (Zod)
- [ ] Transaction wrapper
- [ ] Insert blueprint to DB
- [ ] Call PDF generator
- [ ] Queue email job
- [ ] Error handling & rollback
- [ ] Unit tests (all paths)
- [ ] Error scenarios (5 tests)

### Task 1.4: Queue Worker - process-email-queue (Day 3-4)
**Owner**: Backend Dev
**Estimate**: 1.5 days
**Status**: [ ] Not started

- [ ] Fetch pending jobs (batch, order by created_at)
- [ ] For each job: fetch blueprint + PDF
- [ ] Render email template (Resend)
- [ ] Send via Resend API
- [ ] Update status (sent/failed)
- [ ] Retry logic (exponential backoff)
- [ ] Idempotency check
- [ ] Slack alert on failures
- [ ] Unit tests (mock Resend)

### Task 1.5: Frontend Integration - Phase 4 (Day 4)
**Owner**: Frontend Dev
**Estimate**: 1 day
**Status**: [ ] Not started

- [ ] Add form fields to Phase 4
- [ ] Form validation
- [ ] POST to /api/blueprints/save
- [ ] Loading state UI
- [ ] Success/error toasts
- [ ] E2E test

### Task 1.6: Testing & QA (Day 5)
**Owner**: QA Lead
**Estimate**: 1 day
**Status**: [ ] Not started

- [ ] Smoke tests (save → email sent)
- [ ] Edge cases (duplicates, special chars)
- [ ] Error scenarios (network, API down)
- [ ] RLS enforcement
- [ ] Performance testing
- [ ] Sign-off ✅

---

## 🧪 Test Cases

### Happy Path
```gherkin
Scenario: Save blueprint and receive email
  Given user generated blueprint in Phase 4
  And user filled: name, email, phone, company, role
  When user clicks "Salvar Blueprint"
  Then blueprint saved to database
  And PDF generated and stored
  And email job queued
  And user sees success toast
  And email arrives within 5 minutes
```

### Error Scenarios
```gherkin
Scenario: Save fails due to validation error
  Given missing required email field
  When user clicks "Salvar Blueprint"
  Then error toast displayed
  And database unchanged
  And user can retry

Scenario: PDF generation fails
  Given blueprint saved successfully
  And PDF generation fails (storage error)
  When queue worker tries email
  Then email sent with link instead
  And error logged for manual review

Scenario: Resend API times out
  Given email job queued
  And Resend API unavailable
  When queue worker runs
  Then retry scheduled (exponential backoff)
  And alert sent to ops team
```

---

## 📊 Metrics & KPIs

- **Save success rate**: Target > 99.5%
- **Email delivery rate**: Target > 98%
- **PDF generation time**: Target < 5s
- **Time to email delivery**: Target < 2 minutes
- **Retry success rate**: Target > 95%
- **Zero duplicate emails**: 100%

---

## 🚨 Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| PDF gen timeout | Medium | High | Async retry job, fallback link |
| Resend API down | Low | High | Fallback to SendGrid, retry queue |
| Session tracking loss | Low | Medium | Duplicate session_id on error |
| Email PII in logs | Low | High | Sanitize logs, audit trail |
| Storage quota exceeded | Low | Medium | Cleanup old PDFs (30d), alert |

---

## 📋 Review Checklist (before starting)

- [ ] Database schema reviewed by DBA
- [ ] RLS policies validated for security
- [ ] API keys configured (.env)
- [ ] Resend account created + API key set
- [ ] Supabase Storage bucket created (/blueprints-pdf/)
- [ ] Vite environment variables documented
- [ ] Team familiar with Edge Functions
- [ ] Email templates ready in Resend

---

## ✅ Definition of Done

- [x] All acceptance criteria met
- [x] All test cases passing (unit + E2E)
- [x] Code reviewed by tech lead
- [x] No console errors/warnings
- [x] TypeScript strict mode passing
- [x] RLS policies tested by security team
- [x] Performance tested (< 30s save time)
- [x] Documentation updated (API docs, ER diagram)
- [x] User story closed in backlog
- [x] Demo completed in Sprint 1 retro

---

## 📌 Notes & Comments

### Architecture Decisions
- Using Resend for email delivery (reliable, simple)
- Async queue worker (non-blocking UX)
- Session_id for anon tracking (GDPR safe)
- PDF stored in Supabase Storage (not in DB)

### Known Limitations
- No email template versioning yet (can add in Phase 2)
- No A/B testing for email subject (future)
- PDF cleanup manual initially (automation in Phase 2)

### Future Enhancements
- Email template customization (P5)
- Email open tracking (analytics)
- Blueprint sharing via link
- Print to PDF native support

---

**Created by**: Pax (PO)
**Last Updated**: 2026-02-03
**Status**: ✅ Ready for Sprint 1
