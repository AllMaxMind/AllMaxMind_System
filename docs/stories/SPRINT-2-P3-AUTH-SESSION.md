# 📖 User Story: P3 - Google Auth + Session Continuity

**Story ID**: SPRINT-2-P3
**Epic**: Authentication & User Journey
**Sprint**: Sprint 2
**Priority**: 🔴 CRÍTICA 3
**Status**: 📋 Ready for Development
**Points**: 13 (4 days)
**Created**: 2026-02-03
**PO**: Pax (Balancer)
**Dependencies**: SPRINT-1-P1 (must be complete first)

---

## 📝 User Story Statement

**As a** user who has generated a blueprint anonymously
**I want to** authenticate (Google OAuth or signup) while keeping my blueprint
**So that** my blueprint is linked to my account and I can access it anytime

---

## 🎯 Acceptance Criteria

### Session ID Management
- [ ] Session UUID generated on app mount (crypto.randomUUID())
- [ ] Session ID stored in localStorage['session_id']
- [ ] Session ID persisted across page reloads
- [ ] Session ID included in all API calls (header or param)
- [ ] Unique per user per browser (not globally tracked)

### Post-Auth Middleware (Edge Function)
- [ ] New Edge Function: link-session-to-user
- [ ] Receives: session_id (from localStorage) + user_id (from JWT)
- [ ] Query blueprints WHERE session_id = ?
- [ ] UPDATE blueprints SET user_id = auth.uid() WHERE session_id = ?
- [ ] INSERT user_profiles if not exists (new user)
- [ ] Clear session_id from localStorage (after linking)
- [ ] Return: { success, blueprint_id, message }
- [ ] Error handling: session not found, already linked (idempotent)
- [ ] Audit logged: all linking attempts

### Google Auth Flow
- [ ] Google OAuth button visible in Phase 5 Step 4
- [ ] Button checks VITE_GOOGLE_AUTH_CLIENT_ID configured
- [ ] User clicks → Google redirect
- [ ] User authorizes → Google callback
- [ ] Backend receives auth code
- [ ] Code exchanged for JWT + user_id
- [ ] POST /auth/callback with session_id (from localStorage)
- [ ] Middleware calls link-session-to-user
- [ ] Redirect to Phase 5 Step 5 (continuation)
- [ ] Blueprint recovered + displayed

### Email/Password Signup Flow
- [ ] Signup form in Phase 5 Step 4
- [ ] Fields: email, password, (optional) name
- [ ] Form validation (email format, password strength)
- [ ] POST /auth/signup with credentials + session_id
- [ ] Supabase creates auth.users entry
- [ ] User created with user_id
- [ ] Backend calls link-session-to-user
- [ ] Redirect to Phase 5 Step 5
- [ ] Blueprint recovered

### Continue Anonymous Option
- [ ] Button "Continue sem Autenticar" in Phase 5 Step 4
- [ ] User keeps session_id active
- [ ] Blueprint remains with session_id (no user_id yet)
- [ ] Can retry auth later (e.g., when receiving email)
- [ ] Email sent to Phase 4 email address
- [ ] User can click email link → login → blueprint recovered

### Blueprint Recovery Post-Auth
- [ ] After linking complete, query blueprints by user_id
- [ ] Display latest blueprint in Phase 5 Step 5
- [ ] Show PDF download link (from Storage)
- [ ] Show email confirmation (sent to auth email)
- [ ] Allow re-send email if needed
- [ ] Breadcrumb: "Phase 5 / Blueprint Summary"

### Email Handling
- [ ] Phase 4 email: from form input
- [ ] Post-auth email: from auth provider (priority)
- [ ] If both exist: use auth email (most recent)
- [ ] Update user_profiles.email = auth.email
- [ ] Email used for future communications

### RLS & Data Access
- [ ] User can only view/edit own blueprint (RLS enforced)
- [ ] Query: SELECT * FROM blueprints WHERE user_id = auth.uid()
- [ ] Admin can view all blueprints (separate policy)
- [ ] Session-based queries also RLS protected

### Testing & QA
- [ ] Session ID generated + persisted (across reloads)
- [ ] Session ID included in API headers
- [ ] Google OAuth flow complete (mock in tests)
- [ ] Email/password signup flow complete
- [ ] Anonymous continue flow works
- [ ] Blueprint linked post-auth (user_id populated)
- [ ] Blueprint recovered in Phase 5 Step 5
- [ ] Email updated to auth email
- [ ] RLS prevents unauthorized access
- [ ] Error handling graceful (auth failures, linking fails)
- [ ] Idempotency: linking same session twice is safe
- [ ] All tests passing (unit + E2E + integration)

### Google Auth Visibility Fix
- [ ] VITE_GOOGLE_AUTH_CLIENT_ID checked + validated
- [ ] Google OAuth button always visible (if env set)
- [ ] No conditional rendering hiding button
- [ ] Button text clear: "Continuar com Google"
- [ ] Loading state during auth

### Security & Compliance
- [ ] Session ID unique (no collisions)
- [ ] Session ID cleared after linking (prevent reuse)
- [ ] No session_id in logs (audit trail sanitized)
- [ ] GDPR compliance: anon data tracked by session_id
- [ ] Token refresh works (JWT expiry + refresh_token)
- [ ] No user_id leaked in responses
- [ ] HTTPS enforced (no plaintext session_id)

---

## 📚 File List

### New Files Created
```
src/lib/auth/sessionManager.ts
src/lib/auth/linkSessionToUser.ts
supabase/functions/link-session-to-user/index.ts
src/types/auth.ts (session interface)
src/__tests__/auth-session.test.ts
src/__tests__/auth-integration.test.ts
```

### Modified Files
```
src/context/AuthContext.tsx (add session_id)
src/components/phases/Phase5/Step4Schedule.tsx
src/components/phases/Phase5/Step5Summary.tsx (blueprint display)
src/App.tsx (if routes change)
.env.example (add Google OAuth vars)
```

---

## 🔗 Dependencies

### Blockers (Must complete first)
- ✅ SPRINT-1-P1 (blueprints table must exist)

### Blocks These Stories
- None (enables Phase 5 completion)

### Related Stories
- SPRINT-1-P1 (Blueprint persistence)
- SPRINT-1-P4 (Admin role assignment)

---

## 💬 Task Breakdown

### Task 3.1: Session ID Generation (Day 1)
**Owner**: Frontend Dev
**Estimate**: 0.5 days
**Status**: [ ] Not started

- [ ] Create sessionManager.ts module
- [ ] Generate UUID on app mount
- [ ] Store in localStorage
- [ ] Provide getter (useSession hook)
- [ ] Persist across reloads
- [ ] Include in API calls (interceptor)
- [ ] Unit tests

### Task 3.2: Post-Auth Middleware (Day 1-2)
**Owner**: Backend Dev + Frontend Dev
**Estimate**: 1.5 days
**Status**: [ ] Not started

- [ ] Create Edge Function: link-session-to-user
- [ ] Fetch session_id from request
- [ ] Fetch user_id from JWT
- [ ] Query blueprints by session_id
- [ ] UPDATE blueprints SET user_id = auth.uid()
- [ ] INSERT user_profiles if not exists
- [ ] Clear session_id (frontend will do)
- [ ] Return success/error
- [ ] Error handling (session not found, idempotent)
- [ ] Audit logging
- [ ] Unit tests (happy + error paths)
- [ ] Integration test with auth flow

### Task 3.3: Google Auth Flow (Day 2)
**Owner**: Frontend Dev
**Estimate**: 1 day
**Status**: [ ] Not started

- [ ] Check VITE_GOOGLE_AUTH_CLIENT_ID configured
- [ ] Implement Google OAuth button (already partially done)
- [ ] User clicks → Google redirect (Supabase handles)
- [ ] Google callback → POST /auth/callback
- [ ] Backend receives code + session_id
- [ ] Exchange code for JWT (Supabase)
- [ ] Call link-session-to-user middleware
- [ ] Redirect to Phase 5 Step 5
- [ ] Toast: "Autenticado com sucesso!"
- [ ] Handle auth errors (show toast, allow retry)
- [ ] Unit tests
- [ ] Integration test

### Task 3.4: Email/Password Signup (Day 2-3)
**Owner**: Frontend Dev
**Estimate**: 1 day
**Status**: [ ] Not started

- [ ] Signup form in Phase 5 Step 4
- [ ] Fields: email, password, (optional) name
- [ ] Form validation (email format, password strength)
- [ ] POST /auth/signup with credentials + session_id
- [ ] Backend creates Supabase user
- [ ] Call link-session-to-user
- [ ] Redirect to Phase 5 Step 5
- [ ] Handle signup errors (email exists, weak password)
- [ ] Toast notifications
- [ ] Unit tests
- [ ] Integration test

### Task 3.5: Continue Anonymous Option (Day 2)
**Owner**: Frontend Dev
**Estimate**: 0.5 days
**Status**: [ ] Not started

- [ ] "Continue sem Autenticar" button in Phase 5 Step 4
- [ ] User skips auth, keeps session_id active
- [ ] Redirect to Phase 5 Step 5 without linking
- [ ] Blueprint remains with session_id
- [ ] Can auth later (email link option)
- [ ] Unit test

### Task 3.6: Blueprint Recovery (Day 3)
**Owner**: Frontend Dev
**Estimate**: 0.5 days
**Status**: [ ] Not started

- [ ] Phase 5 Step 5 queries blueprints by user_id
- [ ] Display latest blueprint (title, summary, etc)
- [ ] Show PDF download link
- [ ] Show email confirmation message
- [ ] Option to re-send email
- [ ] Fallback message if blueprint not found
- [ ] RLS query uses auth context
- [ ] Unit tests

### Task 3.7: Testing & QA (Day 4)
**Owner**: QA Lead
**Estimate**: 1 day
**Status**: [ ] Not started

- [ ] Session tracking throughout flow
- [ ] Google OAuth path (anon → auth → blueprint recovered)
- [ ] Signup path (anon → auth → blueprint recovered)
- [ ] Continue anon path (blueprint stays with session_id)
- [ ] Email update (Phase 4 → auth email)
- [ ] RLS enforcement (user sees only own)
- [ ] Error scenarios (auth fails, linking fails)
- [ ] Idempotency (linking same session twice)
- [ ] Blueprint recovery (correct data displayed)
- [ ] Sign-off ✅

---

## 🧪 Test Cases

### Happy Path - Google OAuth
```gherkin
Scenario: Anon user authenticates with Google
  Given user in Phase 4 (blueprint generated)
  And session_id in localStorage
  When user navigates to Phase 5 Step 4
  And clicks "Continuar com Google"
  Then redirected to Google consent screen
  And user authorizes
  And callback → link-session-to-user
  Then session_id linked to user_id
  And blueprints.user_id populated
  And redirected to Phase 5 Step 5
  And blueprint displayed (PDF, email confirmation)
  And toast: "Autenticado com sucesso!"
```

### Happy Path - Email Signup
```gherkin
Scenario: Anon user signs up with email/password
  Given user in Phase 5 Step 4
  When user fills email + password
  And clicks "Criar Conta"
  Then Supabase user created
  And user_id assigned
  And link-session-to-user called
  And blueprint linked to user_id
  And redirected to Phase 5 Step 5
  And blueprint displayed
```

### Anon Continue
```gherkin
Scenario: User continues without authenticating
  Given user in Phase 5 Step 4
  When user clicks "Continue sem Autenticar"
  Then session_id remains active
  And redirected to Phase 5 Step 5
  And blueprint accessible (via session_id)
  And can authenticate later via email
```

### Error Scenarios
```gherkin
Scenario: Google auth fails
  Given user clicks "Continuar com Google"
  And auth denied by user
  Then stay in Phase 5 Step 4
  And show error toast
  And allow retry

Scenario: Session not found during linking
  Given auth succeeds
  And link-session-to-user called
  And session_id not found in DB
  Then idempotent (create new linking)
  And user can still continue
  And no error to user
```

---

## 📊 Metrics & KPIs

- **Session generation success**: 100%
- **Session persistence**: 100% (across reloads)
- **Google OAuth completion**: Target > 80%
- **Email signup completion**: Target > 70%
- **Blueprint recovery rate**: Target > 99%
- **Linking success rate**: Target > 99%

---

## 🚨 Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Session linking fails | Low | High | Idempotent, manual recovery script |
| Google OAuth config missing | Medium | High | Pre-flight check, clear error message |
| Blueprint not found post-auth | Low | High | Graceful fallback, audit logs |
| Session_id collision | Very low | Critical | UUID v4 (2^122 space) |
| Auth token expiry | Low | Medium | Refresh token flow, re-auth prompt |

---

## 📋 Review Checklist (before starting)

- [ ] SPRINT-1-P1 complete (blueprints table exists)
- [ ] Google OAuth Client ID obtained
- [ ] Supabase Auth configured
- [ ] Post-auth callback URL configured
- [ ] RLS policies in place (from P1/P4)
- [ ] Team familiar with JWT + refresh tokens
- [ ] Error handling strategy discussed

---

## ✅ Definition of Done

- [x] All acceptance criteria met
- [x] All test cases passing (unit + E2E + integration)
- [x] Code reviewed (security + auth focus)
- [x] Google OAuth tested end-to-end
- [x] Email signup tested end-to-end
- [x] Blueprint recovery tested
- [x] RLS enforced (tested by security)
- [x] No console errors/warnings
- [x] TypeScript strict mode passing
- [x] Documentation updated (auth flow, API docs)
- [x] User story closed in backlog
- [x] Demo completed in Sprint 2 retro

---

## 📌 Notes & Comments

### Architecture Decisions
- Session ID per browser (not global)
- Post-auth middleware for clean separation
- Email priority: auth > Phase 4
- Idempotent linking (safe to call multiple times)

### Known Limitations
- No session expiry cleanup yet (can add in Phase 2)
- No login link recovery (email based, can add later)
- No "Sign in with..." options (only Google, Email)

### Future Enhancements
- Session expiry + cleanup (30 days)
- Magic link signup (email-only)
- Social auth expansion (GitHub, Microsoft)
- Multi-device session management

---

**Created by**: Pax (PO)
**Last Updated**: 2026-02-03
**Status**: ✅ Ready for Sprint 2 (after P1 complete)
