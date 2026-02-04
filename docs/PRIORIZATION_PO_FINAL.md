# 🎯 PRIORIZAÇÃO EXECUTIVA - SYNKRA AIOS P1-P9

**Data**: 2026-02-03
**Product Owner**: Pax (Balancer)
**Base**: ANALISE_PONTOS_IDENTIFICADOS.md + ARCHITECTURE_BLUEPRINT.md
**Status**: Pronto para Sprint Planning

---

## 📊 MATRIZ DE PRIORIZAÇÃO

### Critérios de Decisão

```
┌─────────────────────────────────────────────────────────────┐
│ CRITÉRIOS PONDERADOS                                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 1. IMPACTO (40%):                                           │
│    ├─ Bloqueador de fase posterior                         │
│    ├─ Impacto direto em conversão/leads                    │
│    └─ Valor percebido pelo usuário                         │
│                                                             │
│ 2. DEPENDÊNCIAS (30%):                                      │
│    ├─ Número de features dependentes                       │
│    ├─ Ordem lógica de implementação                        │
│    └─ Riscos técnicos mitigados                            │
│                                                             │
│ 3. COMPLEXIDADE (20%):                                      │
│    ├─ Estimativa de dias-dev                               │
│    ├─ Número de componentes afetados                       │
│    └─ Risco técnico (API, integração, etc)                │
│                                                             │
│ 4. ESFORÇO (10%):                                           │
│    ├─ Tempo de desenvolvimento                             │
│    ├─ Recursos necessários                                 │
│    └─ Paralelização possível                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Score de Priorização

| Ponto | Impacto | Depend. | Compl. | Esforço | **SCORE** | **Prioridade** | **Sprint** |
|-------|---------|---------|--------|---------|-----------|----------------|-----------|
| **P1** | 10 (40%) | 9 (30%) | 7 (20%) | 7 (10%) | **8.5** | 🔴 **CRÍTICA 1** | Sprint 1 |
| **P4** | 8 (40%) | 8 (30%) | 6 (20%) | 8 (10%) | **7.6** | 🔴 **CRÍTICA 2** | Sprint 1 |
| **P2** | 8 (40%) | 6 (30%) | 8 (20%) | 6 (10%) | **7.4** | 🟠 **ALTA 1** | Sprint 2 |
| **P3** | 9 (40%) | 10 (30%) | 8 (20%) | 7 (10%) | **8.8** | 🔴 **CRÍTICA 3** | Sprint 2* |
| **P5** | 7 (40%) | 4 (30%) | 5 (20%) | 9 (10%) | **6.6** | 🟡 **MÉDIA 1** | Sprint 3 |
| **P6** | 3 (40%) | 2 (30%) | 2 (20%) | 10 (10%) | **3.2** | 🟢 **BAIXA 1** | Sprint 4 |
| **P7** | 4 (40%) | 3 (30%) | 2 (20%) | 10 (10%) | **4.0** | 🟢 **BAIXA 2** | Sprint 4 |
| **P8** | 5 (40%) | 2 (30%) | 2 (20%) | 10 (10%) | **4.6** | 🟢 **BAIXA 3** | Sprint 3 |
| **P9** | 2 (40%) | 1 (30%) | 1 (20%) | 10 (10%) | **2.4** | 🟢 **BAIXA 4** | Sprint 4 |

**Legenda**:
- 🔴 **CRÍTICA**: MVP blocker, deve estar pronto antes de release
- 🟠 **ALTA**: Importante para UX, mas não bloqueia MVP
- 🟡 **MÉDIA**: Desejável, mas pode ser pós-release
- 🟢 **BAIXA**: Polish, pode ficar para sprint futuro

*P3 depende de P1, fazer em paralelo começando em Sprint 2

---

## 🚀 EXECUÇÃO POR SPRINT

### **SPRINT 1: Fundações Críticas (5 dias)**

#### Objetivos
- ✅ Blueprint persistência implementada
- ✅ Admin access estruturado
- ✅ Base de dados estável para fases posteriores

#### Features Incluídas
1. **P1 - Blueprint Persistência + Email** (⭐⭐⭐)
2. **P4 - Admin Access + RLS** (⭐⭐)

#### Tarefas Detalhadas

```
╔════════════════════════════════════════════════════════════╗
║ P1: BLUEPRINT PERSISTÊNCIA + EMAIL AUTOMÁTICO              ║
╠════════════════════════════════════════════════════════════╣
║ Descritivo: Salvar blueprint em BD e enviar email com PDF ║
║ Status: ❌ Não implementado                                ║
║ Criticidade: 🔴 CRÍTICA                                    ║
║ Estimativa: 5 dias (3 devs)                                ║
║ Bloqueador para: P3, P5                                    ║
╠════════════════════════════════════════════════════════════╣

TAREFAS SEQUENCIAIS:

[T1.1] DATABASE SCHEMA (Day 1, 1 dev)
├─ Target: Create blueprints table + migrations
├─ Files:
│  └─ supabase/migrations/00019_create_blueprints_extended.sql
├─ Schema:
│  ├─ id (UUID PK)
│  ├─ session_id (UUID, for anon tracking)
│  ├─ user_id (UUID FK, nullable, fill post-auth)
│  ├─ email (VARCHAR)
│  ├─ name (VARCHAR)
│  ├─ phone (VARCHAR)
│  ├─ company (VARCHAR)
│  ├─ role (VARCHAR)
│  ├─ content (JSONB - full blueprint)
│  ├─ language (VARCHAR: 'en' | 'pt-BR')
│  ├─ status (VARCHAR: 'generated' | 'sent' | 'opened')
│  ├─ created_at (TIMESTAMP)
│  └─ updated_at (TIMESTAMP)
├─ RLS Policy: User sees own, admin sees all
└─ Acceptance: Schema tested, migration clean

[T1.2] EMAIL_JOBS QUEUE TABLE (Day 1, 1 dev)
├─ Target: Create email queue for async delivery
├─ Files:
│  └─ supabase/migrations/00020_create_email_jobs_queue.sql
├─ Schema:
│  ├─ id (UUID PK)
│  ├─ blueprint_id (UUID FK)
│  ├─ recipient_email (VARCHAR)
│  ├─ pdf_url (VARCHAR)
│  ├─ template (VARCHAR: 'blueprint_delivery')
│  ├─ subject (VARCHAR)
│  ├─ status (VARCHAR: 'pending' | 'sent' | 'failed')
│  ├─ retry_count (INT, default 0)
│  ├─ last_error (TEXT, nullable)
│  └─ created_at (TIMESTAMP)
├─ Indexes: ON (status, created_at), ON (blueprint_id)
└─ Acceptance: Indexes optimized, query planning done

[T1.3] EDGE FUNCTION: save-blueprint (Day 2-3, 2 devs)
├─ Target: Receive blueprint data → save → enqueue email
├─ Files:
│  ├─ supabase/functions/save-blueprint/index.ts
│  └─ supabase/functions/_shared/pdf-generator.ts (if new)
├─ Logic:
│  ├─ Input validation (zod)
│  ├─ Save blueprint to DB (transaction)
│  ├─ Generate PDF + upload to Storage
│  ├─ Enqueue email job
│  └─ Return success/error
├─ Error handling:
│  ├─ DB error → rollback transaction
│  ├─ PDF error → queue retry separately
│  └─ Email enqueue error → partial success
├─ Testing: Unit tests for each step
└─ Acceptance: All happy + error paths tested

[T1.4] EDGE FUNCTION: process-email-queue (Day 3-4, 1 dev)
├─ Target: Cron worker that sends queued emails
├─ Files:
│  └─ supabase/functions/process-email-queue/index.ts
├─ Logic:
│  ├─ Fetch pending jobs (batch)
│  ├─ For each: fetch blueprint + PDF
│  ├─ Render template (Resend)
│  ├─ Send email via Resend API
│  ├─ Update status (sent/failed)
│  ├─ Retry logic (exponential backoff)
│  └─ Log results
├─ Resilience:
│  ├─ Timeout per email: 30s
│  ├─ Max retries: 3 (1s, 5s, 30s)
│  ├─ Idempotency check (email_id)
│  └─ Slack alert if > 10% failure
├─ Testing: Mock Resend API, test retries
└─ Acceptance: Zero duplicate sends, retries work

[T1.5] FRONTEND INTEGRATION: Phase 4 Save (Day 4, 1 dev)
├─ Target: Connect "Usar este Blueprint" button → backend
├─ Files:
│  └─ src/components/phases/Phase4.tsx
├─ Changes:
│  ├─ Add form fields: Name, Email, Phone, Company, Role
│  ├─ Add "Salvar Blueprint" button
│  ├─ POST /api/blueprints/save (Edge Function)
│  ├─ Show success toast + email confirmation
│  └─ Handle errors gracefully
├─ UI/UX:
│  ├─ Loading spinner during save
│  ├─ Success message: "Blueprint salvo! Email será enviado."
│  ├─ Error toast with retry button
│  └─ Form validation (email format, required fields)
├─ Testing: E2E test (fill form → save → success)
└─ Acceptance: Phase 4 fully integrated

[T1.6] TESTING & QA (Day 5, QA team)
├─ Smoke tests:
│  ├─ Save blueprint → appears in DB
│  ├─ Email queued immediately
│  ├─ PDF generated + accessible
│  └─ Email sent within 5 min
├─ Edge cases:
│  ├─ Duplicate email addresses
│  ├─ Missing optional fields
│  ├─ Very long problem descriptions
│  └─ Special characters in name
├─ Error scenarios:
│  ├─ Network timeout during save
│  ├─ Resend API down → retry
│  ├─ Storage upload failure → retry
│  └─ RLS deny (anon user trying to update)
└─ Sign-off: P1 complete ✅

ACCEPTANCE CRITERIA (P1):
✅ Blueprint saved to database with session_id
✅ PDF generated and stored in Supabase Storage
✅ Email job queued immediately
✅ Email sent within 5 minutes (Resend integration)
✅ Retry logic working (exponential backoff)
✅ RLS policies enforce access control
✅ Error handling graceful (no data loss)
✅ Frontend form working (Phase 4)
✅ All tests passing (unit + E2E)
```

```
╔════════════════════════════════════════════════════════════╗
║ P4: ADMIN ACCESS + RLS                                     ║
╠════════════════════════════════════════════════════════════╣
║ Descritivo: Controle de acesso baseado em role            ║
║ Status: ⚠️ Parcialmente implementado (sem visibilidade)    ║
║ Criticidade: 🔴 CRÍTICA                                    ║
║ Estimativa: 3 dias (1-2 devs)                              ║
║ Bloqueador para: Nenhum (independente)                     ║
╠════════════════════════════════════════════════════════════╣

TAREFAS SEQUENCIAIS:

[T4.1] DATABASE: Add Role Column (Day 1, 1 dev)
├─ Target: Add role to user_profiles table
├─ Files:
│  └─ supabase/migrations/00021_add_role_to_user_profiles.sql
├─ Schema:
│  └─ ALTER TABLE user_profiles ADD COLUMN role VARCHAR(20)
│     DEFAULT 'user'
├─ Values: 'user' | 'admin' | 'super_admin'
├─ Default: 'user'
├─ Migration: Seed existing users (check email domain)
└─ Acceptance: Migration applied, no errors

[T4.2] RLS POLICIES (Day 1-2, 1 dev)
├─ Target: Update/create RLS policies for admin access
├─ Files:
│  └─ supabase/migrations/00022_admin_rls_policies.sql
├─ Policies:
│  ├─ admin_view_all_leads (SELECT)
│  │  └─ WHERE role IN ('admin', 'super_admin')
│  ├─ admin_update_leads (UPDATE)
│  │  └─ WHERE role IN ('admin', 'super_admin')
│  ├─ user_view_own_data (SELECT)
│  │  └─ WHERE user_id = auth.uid()
│  └─ audit_trail_access (SELECT audit_logs)
│     └─ WHERE user_id = auth.uid() OR role IN ('admin', ...)
├─ Testing: Test each policy individually
└─ Acceptance: RLS enforced correctly

[T4.3] FRONTEND: ProtectedRoute Component (Day 2, 1 dev)
├─ Target: Guard for admin-only routes
├─ Files:
│  └─ src/components/auth/ProtectedRoute.tsx
├─ Logic:
│  ├─ Check: auth.uid() exists?
│  │  └─ If NO → redirect /auth/login
│  ├─ Check: user.role === 'admin'?
│  │  └─ If NO → redirect / + toast "Access Denied"
│  └─ If YES → render protected component
├─ Props: { children, requiredRole: 'admin' }
├─ Testing: Test both auth states (logged in/out, user/admin)
└─ Acceptance: Component works, redirects work

[T4.4] FRONTEND: Admin Navigation (Day 2, 1 dev)
├─ Target: Show/hide admin link based on role
├─ Files:
│  └─ src/components/layout/Navbar.tsx (update)
├─ Changes:
│  ├─ Add conditional: {user?.role === 'admin' && (
│  │   <NavLink to="/admin">Admin Dashboard</NavLink>
│  │ )}
│  ├─ No CSS-hiding (security by obscurity)
│  └─ Conditional render only
├─ Testing: Test as user/admin, verify link visibility
└─ Acceptance: Admin link only visible to admins

[T4.5] FRONTEND: Admin Route + Dashboard Visibility (Day 3, 1 dev)
├─ Target: Create /admin route, render LeadDashboard
├─ Files:
│  ├─ src/App.tsx (add route)
│  └─ src/pages/AdminPage.tsx (new)
├─ Changes:
│  ├─ <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminPage/></ProtectedRoute>} />
│  ├─ AdminPage imports LeadDashboard (already exists)
│  ├─ LeadDashboard queries leads via RLS
│  └─ Real-time subscriptions (via RLS)
├─ Testing: Navigate /admin as user → redirect, as admin → dashboard
└─ Acceptance: Admin dashboard fully accessible

[T4.6] TESTING & QA (Day 3, QA team)
├─ Smoke tests:
│  ├─ Login as admin → see Admin Dashboard link
│  ├─ Login as user → no link visible
│  ├─ Try /admin as user → redirect /
│  ├─ Admin sees all leads
│  ├─ User cannot see other users' leads
│  └─ Update lead as admin → succeeds
├─ RLS enforcement:
│  ├─ Direct API call as user → denied
│  ├─ RLS policy enforced (not frontend)
│  └─ Audit logs recorded
└─ Sign-off: P4 complete ✅

ACCEPTANCE CRITERIA (P4):
✅ Role column added to user_profiles
✅ Default role = 'user'
✅ Admin users assigned role = 'admin'
✅ RLS policies enforce admin-only access
✅ Admin link visible only to admins
✅ /admin route protected (ProtectedRoute)
✅ LeadDashboard accessible by admins
✅ User cannot see other users' data (RLS enforced)
✅ Audit logs record admin actions
✅ All tests passing
```

#### Dependências Internas Sprint 1
```
P1 (Blueprint) ─── Depende de: Database schema
P4 (Admin) ─────── Independente (pode fazer em paralelo)
```

#### Recursos Alocados
- **3 devs** (P1 lead + 1 para migrations/DB + 1 para queue)
- **1 dev** (P4 lead)
- **1 QA** (testes + validação)
- **Timeline**: 5 dias de trabalho intenso

#### Critério de Sucesso
- ✅ P1: Blueprint salvo + email enviado
- ✅ P4: Admin acesso funcional + RLS enforçado
- ✅ Zero regressions em fases existentes

---

### **SPRINT 2: Autenticação + Audio (4 dias)**

#### Objetivos
- ✅ Session continuity (anônimo → autenticado)
- ✅ Audio-to-text em Phase 2
- ✅ Foundation para Phase 5 refinement

#### Features Incluídas
1. **P3 - Google Auth + Session** (⭐⭐⭐)
   - *Começa em Sprint 2, depende de P1 pronto*
2. **P2 - Audio-to-Text** (⭐⭐)
   - *Paralelo, independente*

#### Tarefas Detalhadas

```
╔════════════════════════════════════════════════════════════╗
║ P3: GOOGLE AUTH + SESSION CONTINUITY                       ║
╠════════════════════════════════════════════════════════════╣
║ Descritivo: Vincular sessão anônima → user autenticado    ║
║ Status: ⚠️ Auth existe, linking não existe                 ║
║ Criticidade: 🔴 CRÍTICA                                    ║
║ Estimativa: 4 dias (2 devs)                                ║
║ Depende de: P1 pronto (blueprints table)                   ║
║ Bloqueador para: Phase 5 completion                        ║
╠════════════════════════════════════════════════════════════╣

TAREFAS SEQUENCIAIS:

[T3.1] SESSION ID GENERATION (Day 1, 1 dev)
├─ Target: Generate + store session_id on app mount
├─ Files:
│  ├─ src/lib/auth/sessionManager.ts (new)
│  └─ src/context/AuthContext.tsx (update)
├─ Logic:
│  ├─ On app mount: Check localStorage['session_id']
│  ├─ If not exists: Generate UUID via crypto.randomUUID()
│  ├─ Store in localStorage + auth context
│  ├─ Include in all API calls (header or param)
│  └─ Persist across page reloads
├─ Testing: Test session persistence, UUID uniqueness
└─ Acceptance: Session tracked consistently

[T3.2] POST-AUTH MIDDLEWARE: linkSessionToUser (Day 2, 1 dev)
├─ Target: Link anon session → authenticated user
├─ Files:
│  ├─ src/lib/auth/linkSessionToUser.ts (new)
│  └─ supabase/functions/link-session-to-user/index.ts (new Edge Fn)
├─ Logic:
│  ├─ Post-auth callback receives:
│  │  ├─ session_id (from localStorage)
│  │  └─ user_id (from JWT)
│  ├─ UPDATE blueprints SET user_id = auth.uid()
│  │  WHERE session_id = ?
│  ├─ INSERT user_profiles (if not exists)
│  ├─ Clear session_id from localStorage
│  └─ Return success + blueprint_id
├─ Error handling:
│  ├─ Session not found → Create new blueprint ref
│  ├─ Already linked → Idempotent (no double update)
│  └─ User already exists → Skip INSERT
├─ Testing: Test happy path + edge cases
└─ Acceptance: Linking works, no data loss

[T3.3] FRONTEND: Phase 5 Auth Flow (Day 2-3, 1 dev)
├─ Target: Implement auth options in Phase 5 Step 4
├─ Files:
│  └─ src/components/phases/Phase5/Step4Schedule.tsx (update)
├─ Changes:
│  ├─ Add auth options:
│  │  ├─ [Google Sign-In]
│  │  ├─ [Email/Password Signup]
│  │  └─ [Continue com Email]
│  ├─ Google OAuth flow (already partially done)
│  ├─ Email/pass signup flow
│  ├─ Post-auth: call linkSessionToUser()
│  └─ Redirect to next phase (Step 5)
├─ UI/UX:
│  ├─ Clear visual hierarchy (Google most prominent)
│  ├─ Loading states during auth
│  ├─ Error messages (auth failures)
│  └─ Confirmation that email will be used for blueprint
├─ Testing: E2E test each auth path
└─ Acceptance: All 3 auth paths working

[T3.4] GOOGLE AUTH VISIBILITY FIX (Day 1, 1 dev)
├─ Target: Ensure Google OAuth button always visible
├─ Files:
│  └─ src/components/phases/Phase5/Step4Schedule.tsx
├─ Debugging:
│  ├─ Check: VITE_GOOGLE_AUTH_CLIENT_ID set?
│  ├─ Check: Conditional render logic
│  ├─ Fix: Remove incorrect conditions
│  └─ Test: Button visible in all environments
├─ Testing: Test in dev + staging
└─ Acceptance: Button visible

[T3.5] BLUEPRINT RECOVERY POST-AUTH (Day 3, 1 dev)
├─ Target: Display blueprint after auth completes
├─ Files:
│  └─ src/components/phases/Phase5/Step5Summary.tsx (update)
├─ Logic:
│  ├─ After auth + linking complete
│  ├─ Query blueprints by user_id (via RLS)
│  ├─ Display latest blueprint
│  ├─ Show PDF download link
│  └─ Allow re-send email if needed
├─ Testing: Auth → linking → display blueprint
└─ Acceptance: Blueprint visible post-auth

[T3.6] TESTING & QA (Day 4, QA team)
├─ Auth journeys:
│  ├─ Anon → Google auth → blueprint recovered
│  ├─ Anon → Signup → blueprint recovered
│  ├─ Anon → Continue → skip auth
│  └─ Return user → still has blueprint
├─ Session linking:
│  ├─ Session_id tracked throughout
│  ├─ Blueprint linked to user_id post-auth
│  ├─ Email updated to auth email
│  └─ RLS allows user to view own blueprint
├─ Error scenarios:
│  ├─ Auth fails → stay in Phase 5
│  ├─ Linking fails → prompt retry
│  ├─ Blueprint not found → graceful
│  └─ Network error → retry available
└─ Sign-off: P3 complete ✅

ACCEPTANCE CRITERIA (P3):
✅ Session ID generated + persisted
✅ Session tracked in all API calls
✅ Post-auth: session linked to user
✅ Blueprint linked to user_id
✅ User can view own blueprint post-auth
✅ Email updated from Phase 4 → auth email
✅ Google auth visible + working
✅ Email/password signup working
✅ Continue anon option working
✅ RLS enforces access (user sees only own)
✅ All auth flows tested
```

```
╔════════════════════════════════════════════════════════════╗
║ P2: AUDIO-TO-TEXT (SPEECH RECOGNITION)                     ║
╠════════════════════════════════════════════════════════════╣
║ Descritivo: Transcrição de áudio em Phase 2               ║
║ Status: ❌ Não implementado                                ║
║ Criticidade: 🟠 ALTA (UX importante)                       ║
║ Estimativa: 4 dias (1-2 devs)                              ║
║ Independente: Pode fazer em paralelo                       ║
║ Bloqueador para: Nenhum                                    ║
╠════════════════════════════════════════════════════════════╣

TAREFAS SEQUENCIAIS:

[T2.1] AUDIO CAPTURE MODULE (Day 1, 1 dev)
├─ Target: Capture audio from microphone
├─ Files:
│  ├─ src/lib/audio/audioRecorder.ts (new)
│  └─ src/hooks/useAudioRecorder.ts (new)
├─ Features:
│  ├─ Start/stop recording via button
│  ├─ Browser permission request
│  ├─ Auto-stop on silence (configurable)
│  ├─ Max 120 seconds
│  ├─ Audio format: WAV/MP3 (configurable)
│  └─ Blob conversion for upload
├─ Error handling:
│  ├─ Permission denied
│  ├─ Recording failed
│  ├─ Browser not supported (show fallback)
│  └─ User feedback (toast)
├─ Testing: Test recording in different environments
└─ Acceptance: Audio captured successfully

[T2.2] SPEECH-TO-TEXT MODULE (Day 1-2, 1 dev)
├─ Target: Transcribe audio via Gemini + Whisper
├─ Files:
│  └─ src/lib/audio/speechToText.ts (new)
├─ Logic:
│  ├─ TRY (5s timeout):
│  │  ├─ Call Gemini 2.0 Audio API
│  │  ├─ Pass audio blob + language
│  │  └─ Return transcription
│  ├─ ON FAIL:
│  │  ├─ FALLBACK (30s timeout):
│  │  ├─ Call OpenAI Whisper API
│  │  ├─ Pass audio file + language
│  │  └─ Return transcription
│  ├─ ON FAIL:
│  │  ├─ Throw error
│  │  └─ Let UI handle retry
│  └─ Logging: Log provider used, latency
├─ Timeouts:
│  ├─ Gemini: 5s (should be fast)
│  ├─ Whisper: 30s (can be slow)
│  └─ Total: 45s max
├─ Error handling:
│  ├─ API error (401, 429, 500)
│  ├─ Timeout
│  ├─ Audio too short/long
│  └─ Incoherent audio (empty text)
├─ Testing: Mock APIs, test fallback, test errors
└─ Acceptance: Fallback strategy works

[T2.3] FRONTEND INTEGRATION: Phase 2 UI (Day 2-3, 1 dev)
├─ Target: Add 🎤 button to textarea (Phase 2)
├─ Files:
│  └─ src/components/phases/Phase2.tsx (update)
├─ UI Components:
│  ├─ [Input textarea]
│  ├─ [🎤 Record button]
│  └─ Recording status indicator
├─ States:
│  ├─ Idle: 🎤 (clickable)
│  ├─ Recording: 🔴 Recording... (clickable to stop)
│  ├─ Transcribing: ⏳ Processing... (disabled)
│  ├─ Success: ✅ (text inserted)
│  └─ Error: ❌ Retry available
├─ Interaction:
│  ├─ Click 🎤 → start recording
│  ├─ Browser asks permission
│  ├─ User speaks problem
│  ├─ Click 🎤 again → stop + transcribe
│  ├─ Toast: "Transcrevendo..."
│  ├─ Text appears in textarea
│  └─ Resume normal flow
├─ Testing: E2E test from click to text insertion
└─ Acceptance: UI/UX smooth + intuitive

[T2.4] ERROR HANDLING + RETRY (Day 3, 1 dev)
├─ Target: Graceful failure + user-initiated retry
├─ Files:
│  └─ src/components/phases/Phase2.tsx (update)
├─ Error messages:
│  ├─ "Permissão de microfone negada"
│  ├─ "Áudio muito curto (min 1s)"
│  ├─ "Transcrição falhou. Tentar novamente?"
│  ├─ "Ambos os provedores falharam"
│  └─ "Seu navegador não suporta gravação"
├─ Retry options:
│  ├─ "Tentar Novamente" button (retry same audio)
│  ├─ "Gravar Novamente" button (new recording)
│  └─ "Digitar Manualmente" (fallback)
├─ Logging:
│  ├─ Error details → Sentry
│  ├─ Provider tried → Analytics
│  └─ User action (retry/skip) → Analytics
├─ Testing: Test each error path
└─ Acceptance: All error paths graceful

[T2.5] LANGUAGE PARAMETER SUPPORT (Day 3, 1 dev)
├─ Target: Pass selected language to transcription APIs
├─ Files:
│  └─ src/lib/audio/speechToText.ts (update)
├─ Logic:
│  ├─ Get selected language from context (i18n)
│  ├─ Gemini: Include in prompt ("Transcreva em Português")
│  ├─ Whisper: Pass language parameter (pt/en)
│  └─ Improve accuracy via explicit language
├─ Testing: Test PT-BR + EN transcriptions
└─ Acceptance: Language parameter passed + improves accuracy

[T2.6] TESTING & QA (Day 4, QA team)
├─ Happy path:
│  ├─ Record → Gemini transcribes → text inserted
│  ├─ Record → Gemini fails → Whisper succeeds
│  ├─ Record → Both fail → error message + retry
│  └─ Retry → succeeds
├─ Edge cases:
│  ├─ Silent audio
│  ├─ Background noise
│  ├─ Non-native speaker
│  ├─ Long recording (> 120s, auto-stop)
│  └─ Special characters in text
├─ Language testing:
│  ├─ PT-BR audio → PT-BR transcript
│  ├─ EN audio → EN transcript
│  └─ Bilingual audio → handled gracefully
├─ Browser compatibility:
│  ├─ Chrome/Edge (Web Audio API)
│  ├─ Firefox (Web Audio API)
│  └─ Safari (if supported, otherwise fallback message)
└─ Sign-off: P2 complete ✅

ACCEPTANCE CRITERIA (P2):
✅ Audio captured via microphone (Web Audio API)
✅ Gemini 2.0 Audio transcription integrated
✅ OpenAI Whisper fallback integrated
✅ Timeout + retry logic working
✅ Language parameter passed to APIs
✅ Text inserted into textarea (preserves existing)
✅ Error handling graceful (user can retry)
✅ UI feedback clear (recording/transcribing/done)
✅ E2E tests passing
✅ Analytics logged (provider, latency, success)
```

#### Dependências Internas Sprint 2
```
P3 (Auth) ─────── Depende de: P1 (blueprints table)
P2 (Audio) ────── Independente (paralelo)
```

#### Recursos Alocados
- **2 devs** (P3 lead + 1 for session/linking)
- **1-2 devs** (P2, audio capture + transcription)
- **1 QA** (auth journeys + audio testing)
- **Timeline**: 4 dias (Sprint 2)

#### Critério de Sucesso
- ✅ P3: Session → user linking funcional
- ✅ P2: Audio transcription funcional (ambos providers)
- ✅ Zero regressions em P1 + P4

---

### **SPRINT 3: UX Polish + Language Support (2 dias)**

#### Objetivos
- ✅ Language suport em IA (blueprints em PT-BR)
- ✅ Navbar overlap fix
- ✅ Polish geral UX

#### Features Incluídas
1. **P5 - Language em IA** (⭐)
2. **P8 - Navbar Z-Index Fix** (⭐)

#### Tarefas Detalhadas

```
╔════════════════════════════════════════════════════════════╗
║ P5: IDIOMA EM IA (LANGUAGE SUPPORT)                        ║
╠════════════════════════════════════════════════════════════╣
║ Descritivo: Blueprint gerado em idioma selecionado        ║
║ Status: ⚠️ Frontend traduzido, IA ignora idioma            ║
║ Criticidade: 🟡 MÉDIA                                      ║
║ Estimativa: 2 dias (1 dev)                                 ║
║ Independente: Pode fazer anytime                          ║
║ Impacto: Alto (UX em PT-BR)                                ║
╠════════════════════════════════════════════════════════════╣

TAREFAS:

[T5.1] UPDATE AI PROVIDERS (Day 1, 1 dev)
├─ Target: Pass language to Gemini + OpenAI
├─ Files:
│  ├─ src/lib/ai/providers/gemini.ts (update)
│  ├─ src/lib/ai/providers/openai.ts (update)
│  └─ src/lib/ai/blueprint.ts (update)
├─ Changes:
│  ├─ Get language from i18n context (useTranslation)
│  ├─ Gemini system prompt:
│  │  └─ "Respond in ${language === 'pt-BR' ? 'Portuguese' : 'English'}"
│  ├─ OpenAI system prompt: same
│  ├─ Pass language in request body
│  └─ Verify both providers respect language
├─ Testing: Generate blueprint in PT + EN
└─ Acceptance: Blueprint generated in correct language

[T5.2] TESTING & QA (Day 2, QA team)
├─ Language testing:
│  ├─ Select PT-BR → Generate blueprint → All PT
│  ├─ Select EN → Generate blueprint → All EN
│  ├─ Change language mid-flow → affects output
│  └─ Email template respects language
├─ Provider testing:
│  ├─ Gemini outputs correct language
│  ├─ OpenAI outputs correct language
│  ├─ Fallback (Gemini → OpenAI) maintains language
│  └─ Terminology correct in both languages
└─ Sign-off: P5 complete ✅

ACCEPTANCE CRITERIA (P5):
✅ Language parameter passed to Gemini
✅ Language parameter passed to OpenAI
✅ Blueprint generated in selected language (PT/EN)
✅ All sections translated (exec summary, problem, etc)
✅ Email template respects language
✅ Fallback provider maintains language
✅ Testing: PT blueprint is 100% Portuguese
```

```
╔════════════════════════════════════════════════════════════╗
║ P8: NAVBAR OVERLAP FIX                                     ║
╠════════════════════════════════════════════════════════════╣
║ Descritivo: Navbar sobrepondo conteúdo (Phase 4/5)        ║
║ Status: ✅ Confirmado em imagens (UI bug)                 ║
║ Criticidade: 🟡 MÉDIA (UX)                                ║
║ Estimativa: 30 min (1 dev)                                 ║
║ Simples: CSS fix                                           ║
╠════════════════════════════════════════════════════════════╣

TAREFAS:

[T8.1] CSS FIX (30 min, 1 dev)
├─ Target: Adjust navbar z-index or content margin
├─ Files:
│  ├─ src/components/layout/Navbar.tsx (if styles)
│  ├─ src/App.tsx (global styles)
│  └─ src/styles/main.css (if exists)
├─ Options:
│  ├─ Option A: Increase margin-top on Phase4/5
│  │  └─ content: margin-top: navbar-height + padding
│  ├─ Option B: Adjust z-index
│  │  └─ navbar: z-index: 40, content: z-index: 10
│  └─ Option C: Fixed vs absolute positioning
├─ Verification:
│  ├─ Phase 4 content visible under navbar
│  ├─ Phase 5 progress bar not overlapped
│  └─ Mobile responsive tested
├─ Testing: Visual inspection in browser
└─ Sign-off: Overlap fixed ✅

ACCEPTANCE CRITERIA (P8):
✅ Navbar not overlapping Phase 4 content
✅ Navbar not overlapping Phase 5 progress bar
✅ Mobile responsive (navbar still functional)
✅ No layout shift when toggling navbar
```

#### Recursos Alocados
- **1 dev** (P5 language support)
- **1 dev** (P8 CSS fix)
- **0.5 QA** (verification)
- **Timeline**: 2 dias

#### Critério de Sucesso
- ✅ P5: Blueprint em PT-BR quando selecionado
- ✅ P8: Navbar não sobrepõe conteúdo

---

### **SPRINT 4: Polish Final (2 dias)**

#### Objetivos
- ✅ Quick wins (P6, P7, P9)
- ✅ Final testing
- ✅ Deploy readiness

#### Features Incluídas
1. **P6 - Badge Tradução**
2. **P7 - Exemplo Completo**
3. **P9 - Remover Tech Arch**

#### Tarefas Detalhadas

```
╔════════════════════════════════════════════════════════════╗
║ P6: BADGE "AI-DRIVEN" TRADUÇÃO                             ║
╠════════════════════════════════════════════════════════════╣
║ Descritivo: Badge não traduz em landing page              ║
║ Status: ✅ Simples fix de i18n                             ║
║ Criticidade: 🟢 BAIXA (cosmético)                          ║
║ Estimativa: 15 min (1 dev)                                 ║
╠════════════════════════════════════════════════════════════╣

TAREFAS:

[T6.1] I18N KEYS (15 min, 1 dev)
├─ Target: Add translation keys for badge
├─ Files:
│  ├─ src/i18n/locales/pt-BR/landing.json (add)
│  ├─ src/i18n/locales/en/landing.json (add)
│  └─ src/components/LandingPage.tsx (update)
├─ Changes:
│  ├─ PT: "badge_ai_driven": "Soluções Inteligentes Orientadas por IA"
│  ├─ EN: "badge_ai_driven": "AI-Driven Smart Solutions"
│  ├─ LandingPage: const { t } = useTranslation('landing')
│  └─ Render: <span>{t('badge_ai_driven')}</span>
├─ Testing: Switch language, verify badge translates
└─ Sign-off: Badge translates ✅

ACCEPTANCE CRITERIA (P6):
✅ Badge translation key in both languages
✅ LandingPage uses useTranslation()
✅ Badge text updates when language changes
```

```
╔════════════════════════════════════════════════════════════╗
║ P7: BOTÃO "USAR EXEMPLO" - PRESERVAR TEXTO                ║
╠════════════════════════════════════════════════════════════╣
║ Descritivo: Ao clicar exemplo, apaga texto original       ║
║ Status: ❌ Não implementado                                ║
║ Criticidade: 🟢 BAIXA (UX melhoria)                        ║
║ Estimativa: 15 min (1 dev)                                 ║
╠════════════════════════════════════════════════════════════╣

TAREFAS:

[T7.1] TEXTAREA CONCATENATION (15 min, 1 dev)
├─ Target: Preserve text when using example
├─ Files:
│  └─ src/components/phases/Phase2.tsx (update)
├─ Logic:
│  ├─ Current: setTextarea(exampleText)
│  ├─ Updated:
│  │  const currentText = textarea.trim()
│  │  const consolidated = currentText
│  │    ? `${currentText}\n\n${exampleText}`
│  │    : exampleText
│  │  setTextarea(consolidated)
├─ Interaction:
│  ├─ User has: "Meu problema..."
│  ├─ User clicks: "Usar exemplo"
│  ├─ Result: "Meu problema...\n\n[Exemplo consolidado]"
├─ Testing: Test with/without existing text
└─ Sign-off: Text preserved ✅

ACCEPTANCE CRITERIA (P7):
✅ Existing text preserved when using example
✅ Example appended with line break
✅ Works with empty textarea too
```

```
╔════════════════════════════════════════════════════════════╗
║ P9: REMOVER CAMPO "ARQUITETURA TÉCNICA"                    ║
╠════════════════════════════════════════════════════════════╣
║ Descritivo: Não exibir technicalArchitecture no blueprint ║
║ Status: ✅ Simples filtro de display                       ║
║ Criticidade: 🟢 BAIXA (pode ficar pós-release)             ║
║ Estimativa: 10 min (1 dev)                                 ║
╠════════════════════════════════════════════════════════════╣

TAREFAS:

[T9.1] REMOVE DISPLAY (10 min, 1 dev)
├─ Target: Hide technicalArchitecture field
├─ Files:
│  ├─ src/components/phases/Phase4.tsx (update)
│  ├─ src/lib/pdf/blueprintGenerator.ts (update)
│  └─ Keep backend generation (for future APIs)
├─ Changes:
│  ├─ Phase4: Remove render block for technicalArchitecture
│  ├─ PDF: Remove section from PDF output
│  ├─ Commented (not deleted) for future use
│  └─ Backend: Keep generation in AI provider
├─ Testing: Verify Phase4 blueprint doesn't show field
└─ Sign-off: Field hidden ✅

ACCEPTANCE CRITERIA (P9):
✅ technicalArchitecture not displayed in Phase 4
✅ Not included in PDF download
✅ Backend still generates (for future APIs)
```

#### Recursos Alocados
- **1 dev** (P6 + P7 + P9, todas rápidas)
- **0.5 QA** (quick verification)
- **Timeline**: 1 dia (todas quick wins)

#### Critério de Sucesso
- ✅ P6: Badge traduz
- ✅ P7: Texto preservado
- ✅ P9: Campo removido

---

## 📋 RESUMO DE EXECUÇÃO

### Timeline Total
- **Sprint 1**: 5 dias (P1 + P4)
- **Sprint 2**: 4 dias (P3 + P2)
- **Sprint 3**: 2 dias (P5 + P8)
- **Sprint 4**: 1 dia (P6 + P7 + P9)
- **TOTAL**: ~2 semanas de trabalho intenso

### Alocação de Recursos
```
Sprint 1 (5 dias):
  P1: 3 devs (lead + DB + queue)
  P4: 1-2 devs (role + RLS + routes)
  QA: 1 QA

Sprint 2 (4 dias):
  P3: 2 devs (session + linking)
  P2: 1-2 devs (audio capture + transcription)
  QA: 1 QA

Sprint 3 (2 dias):
  P5: 1 dev (language param)
  P8: 1 dev (CSS fix)
  QA: 0.5 QA

Sprint 4 (1 dia):
  P6/P7/P9: 1 dev (quick wins)
  QA: 0.5 QA

TOTAL TEAM SIZE: 4-5 devs + 1 QA lead
```

### Riscos & Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| P1: Email queue falha | Média | Alto | Retry strategy + backup manual send |
| P2: API timeout | Média | Médio | Fallback provider + user retry |
| P3: Session linking falha | Baixa | Alto | Idempotent operation + audit logs |
| P4: RLS misconfigured | Baixa | Crítico | Thorough testing + security review |
| API keys not configured | Alta | Alto | Environment checklist em Sprint 1 |
| Parallel Sprint overflow | Média | Médio | Sprint master monitoring + buffer time |

### Métricas de Sucesso

```
Sprint 1 (P1 + P4):
✅ Blueprint save success rate > 99%
✅ Email delivery rate > 98%
✅ Admin RLS enforced 100%
✅ Zero unauthorized access logs

Sprint 2 (P3 + P2):
✅ Session → user linking > 99%
✅ Audio transcription success > 95%
✅ Provider fallback < 5%
✅ Auth completion rate > 80%

Sprint 3 (P5 + P8):
✅ PT-BR blueprint language 100%
✅ Navbar overlap resolved
✅ No layout shift on mobile

Sprint 4 (P6/P7/P9):
✅ Badge translates correctly
✅ Text concatenation works
✅ Tech arch field hidden

Overall:
✅ Zero regressions
✅ E2E tests passing
✅ User acceptance testing positive
✅ Performance < 3s per phase
```

---

## 🎯 PRÓXIMAS AÇÕES (PO)

### Imediatas
1. **Validar estimativas** com tech lead
   - Confirmar 5 devs + 1 QA disponíveis
   - Validar Sprint 1 pré-requisitos

2. **Environment setup** (antes Sprint 1)
   - VITE_GEMINI_API_KEY configurada?
   - VITE_OPENAI_API_KEY configurada?
   - RESEND_API_KEY configurada?
   - VITE_GOOGLE_AUTH_CLIENT_ID configurada?

3. **Database review**
   - Todos migrations preparadas
   - RLS policies validadas
   - Backup strategy definida

4. **Create user stories no backlog**
   - P1: Blueprint Persistência (Epic)
   - P4: Admin Access (Epic)
   - P3: Auth Session (Epic)
   - P2: Audio Transcription (Epic)
   - P5: Language Support
   - P6/P7/P8/P9: Quick wins

### Pré-Sprint 1
- [ ] Kick-off meeting (tech lead + devs + QA)
- [ ] Criar user stories detalhadas
- [ ] Estimativas do time confirmadas
- [ ] Environment variables checklist
- [ ] Database migrations reviewed
- [ ] CI/CD pipeline ready

### During Sprints
- [ ] Daily standup (15 min)
- [ ] Risk monitoring (blockers)
- [ ] Demo day (fim de cada sprint)
- [ ] Retrospective (aprender & improve)

---

## 📊 DASHBOARD DE PRIORIZAÇÃO FINAL

```
ROADMAP VISUAL (4 Sprints):

Sprint 1 ████████████████ (5 dias)
  P1 ███████████ (Blueprint)
  P4 █████ (Admin)
  QA ██████████ (testing)

Sprint 2 ███████████ (4 dias)
  P3 ████████ (Auth)
  P2 ████████ (Audio)
  QA ████████ (testing)

Sprint 3 ██████ (2 dias)
  P5 ███ (Language)
  P8 ██ (CSS)
  QA ██ (verification)

Sprint 4 ███ (1 dia)
  P6/P7/P9 ███ (Quick wins)

DEPENDENCIES:
P1 ──────┐
         ├──→ P3
         │
P2 (paralelo)
         │
P4 (paralelo)

P5 (depois de P1, não blocker)
P6/P7/P8/P9 (anytime)

RELEASE GATE:
Sprint 1 complete? ✅ RELEASE P1 + P4
Sprint 2 complete? ✅ RELEASE P2 + P3
Sprint 3-4? ✅ POLISH + MINOR FEATURES
```

---

**Priorização Finalizada por**: Pax (Product Owner)
**Data**: 2026-02-03
**Status**: Pronto para Sprint Planning ✅
**Próxima etapa**: Criar user stories + confirmar timeline com @dev + @sm
