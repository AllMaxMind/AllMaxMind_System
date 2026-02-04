# BACKLOG ANALYSIS - Product Owner Assessment

**Author:** @po (Product Owner Agent)
**Date:** 2026-01-31
**Severity:** CRITICAL - Production Blockers Identified
**Sprint Context:** Post-Sprint 3, Pre-Production Release

---

## EXECUTIVE SUMMARY

This analysis identifies **three critical gaps** in the All Max Mind System that must be addressed before production deployment:

| Gap | Impact | Risk Level | Business Cost if Unresolved |
|-----|--------|------------|----------------------------|
| **GAP 1:** Core tables not created | ALL user data lost | P0 - CRITICAL | 100% data loss, system unusable |
| **GAP 2:** Missing RLS policies | Data exposed | P0 - CRITICAL | LGPD fines up to 2% revenue |
| **GAP 3:** LGPD compliance missing | Legal non-compliance | P1 - HIGH | Legal liability, user trust loss |

**Recommendation:** HALT production deployment until P0 items are resolved.

---

## GAP 1: CORE TABLES NOT CREATED

### Problem Statement

The following tables exist in `supabase/schema.sql` but have **NEVER** been created via numbered migrations:

| Table | Purpose | Migration Status |
|-------|---------|------------------|
| `problems` | Phase 1-3 user problem data | NOT CREATED |
| `dimensions` | Phase 2 dimension selections | NOT CREATED |
| `questions_answers` | Phase 3 Q&A responses | NOT CREATED |
| `leads` (base) | Base lead definition | NOT CREATED (only columns added) |

### Evidence

```bash
# Search for CREATE TABLE in migrations returns NO results for core tables
grep -r "CREATE TABLE.*problems" supabase/migrations/  # NO RESULTS
grep -r "CREATE TABLE.*dimensions" supabase/migrations/  # NO RESULTS
grep -r "CREATE TABLE.*questions_answers" supabase/migrations/  # NO RESULTS
```

### Current Frontend Behavior

The frontend **actively attempts** to write to these tables:

```typescript
// src/lib/supabase/problems.ts:20
const { data: problemData, error: problemError } = await supabase
  .from('problems')  // TABLE DOES NOT EXIST
  .insert([{...}])

// src/lib/supabase/dimensions.ts:44
const { error: dimensionsError } = await supabase
  .from('dimensions')  // TABLE DOES NOT EXIST
  .insert(dimensionRecords);

// src/lib/supabase/answers.ts:32
const { error: answersError } = await supabase
  .from('questions_answers')  // TABLE DOES NOT EXIST
  .insert(answerRecords);
```

### Business Impact

| Scenario | Impact |
|----------|--------|
| User completes Phase 1 | Data silently fails to save |
| User selects dimensions (Phase 2) | Selections not persisted |
| User answers questions (Phase 3) | Answers lost |
| User reaches Phase 4 | No problem context available for blueprint |
| Lead captured | Partial data, no problem history |

**Severity:** The entire funnel is broken. Users appear to progress through phases, but NO DATA is being saved.

---

## GAP 2: MISSING RLS POLICIES

### Problem Statement

Multiple tables lack proper Row Level Security, exposing sensitive user data:

| Table | RLS Status | Exposure Risk |
|-------|------------|---------------|
| `email_queue` | NO RLS | Email addresses, content exposed |
| `email_sequences` | NO RLS | Campaign data exposed |
| `lead_interactions` | NO RLS | User behavior tracking exposed |
| `visitors` / `sessions` | TOO PERMISSIVE | All records visible to any user |

### Evidence from Migrations

```sql
-- 00003_create_tracking_tables.sql (lines 54-64)
CREATE POLICY "allow_public_select_visitors" ON public.visitors
  FOR SELECT USING (true); -- ANY USER CAN SEE ALL VISITORS

CREATE POLICY "allow_public_select_sessions" ON public.sessions
  FOR SELECT USING (true); -- ANY USER CAN SEE ALL SESSIONS

-- 00013_add_email_sequences.sql - NO RLS POLICIES DEFINED
-- Tables email_queue, email_sequences have no RLS at all
```

### LGPD Compliance Risk

Under Brazil's LGPD (Lei Geral de Protecao de Dados):

| Violation | Penalty |
|-----------|---------|
| Unauthorized data access | Up to 2% of company revenue |
| Data breach notification failure | Administrative sanctions |
| User rights violation | Civil liability per affected user |

### Business Impact

- **Reputation:** Data breach would destroy user trust
- **Legal:** Potential class-action lawsuits
- **Operational:** Mandatory breach notification costs
- **Regulatory:** ANPD (Brazilian DPA) investigation

---

## GAP 3: LGPD COMPLIANCE MISSING

### Required LGPD Features Not Implemented

| Requirement | Status | LGPD Article |
|-------------|--------|--------------|
| Consent tracking (timestamp, version) | MISSING | Art. 7, 8 |
| Data retention policies | MISSING | Art. 15, 16 |
| User data export (portability) | MISSING | Art. 18 |
| Soft-delete for deletion requests | MISSING | Art. 18 |
| Consent revocation mechanism | MISSING | Art. 8 |

### Current State

The `leads` table has `accept_marketing` but:
- No timestamp of when consent was given
- No version tracking for consent form changes
- No mechanism to export user data
- No soft-delete (hard delete loses audit trail)

### Business Impact

- Cannot prove consent was obtained (legal liability)
- Cannot comply with data subject access requests (30-day deadline)
- Cannot demonstrate data minimization principle
- Audit trail incomplete for regulatory review

---

## PRIORITIZED BACKLOG

### Priority Definitions

| Priority | Definition | SLA |
|----------|------------|-----|
| **P0** | System broken, data loss occurring | FIX NOW - Block all other work |
| **P1** | Legal/compliance risk | This sprint |
| **P2** | Important but not blocking | Next sprint |

---

## USER STORIES

### STORY DB-001: Create Core Data Tables [P0 - CRITICAL] ✅ DONE

**As a** system
**I want to** persist user data in properly created database tables
**So that** the funnel captures and retains all user interactions

#### Acceptance Criteria

- [x] Migration `00014_create_core_tables.sql` creates `problems` table
- [x] Migration creates `dimensions` table with FK to problems
- [x] Migration creates `questions_answers` table with FK to problems
- [x] Migration creates or validates `leads` base table structure
- [x] All tables have proper indexes for performance
- [x] All tables have `created_at` and `updated_at` timestamps
- [x] Migration is idempotent (safe to run multiple times)
- [x] Existing migrations 00010-00013 remain compatible

#### Technical Notes

```sql
-- Reference: supabase/schema.sql lines 6-62
-- Must match existing schema.sql definitions exactly
-- Add proper indexes from performance migration 00008
```

#### Story Points: 3
**Assigned:** @dev
**Sprint:** 3.5 (EMERGENCY)

---

### STORY DB-002: Implement Proper RLS Policies [P0 - CRITICAL] ✅ DONE

**As a** user
**I want to** have my data protected by row-level security
**So that** other users cannot see my personal information

#### Acceptance Criteria

- [x] Migration `00015_rls_security_hardening.sql` adds RLS to `email_queue`
- [x] Migration adds RLS to `email_sequences`
- [x] Migration adds RLS to `lead_interactions`
- [x] Update `visitors` policy (service_role + anon access for tracking)
- [x] Update `sessions` policy (service_role + anon access for tracking)
- [x] Service role maintains full access for backend operations
- [x] All policies tested with different user contexts
- [x] No regression in existing functionality

**Note:** visitors/sessions remain permissive for anonymous tracking. True isolation requires RPC functions (Sprint 5 LGPD)

#### Technical Notes

```sql
-- Visitors: Filter by request.headers->>'x-visitor-id'
-- Sessions: Cascades from visitors via FK
-- Email tables: Filter by lead_id -> leads.user_id relationship
-- Lead interactions: Filter by lead ownership
```

#### Story Points: 5
**Assigned:** @dev
**Sprint:** 3.5 (EMERGENCY)

---

### STORY LGPD-001: Implement Consent Tracking [P1 - HIGH]

**As a** user
**I want to** have my consent properly recorded
**So that** the company can demonstrate legal compliance

#### Acceptance Criteria

- [ ] Add `consent_given_at` timestamp to leads table
- [ ] Add `consent_version` string to leads table
- [ ] Add `consent_ip` for audit trail
- [ ] Add `consent_user_agent` for audit trail
- [ ] Frontend captures consent timestamp at form submission
- [ ] Consent version matches current privacy policy version
- [ ] Admin can query consent history per user

#### Technical Notes

```sql
ALTER TABLE leads
  ADD COLUMN consent_given_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN consent_version VARCHAR(20),
  ADD COLUMN consent_ip INET,
  ADD COLUMN consent_user_agent TEXT;
```

#### Story Points: 3
**Assigned:** @dev
**Sprint:** 4

---

### STORY LGPD-002: Implement Data Export Functionality [P1 - HIGH]

**As a** user
**I want to** request and receive all data the system has about me
**So that** I can exercise my data portability rights under LGPD

#### Acceptance Criteria

- [ ] New Supabase Edge Function `export-user-data`
- [ ] Function gathers data from: leads, problems, dimensions, questions_answers, lead_interactions
- [ ] Output format: JSON (machine-readable)
- [ ] Response includes all user-related records
- [ ] Response delivered within 24 hours (LGPD requires 15 days, we exceed)
- [ ] Audit log records export request
- [ ] Rate limiting prevents abuse (1 request per 24 hours)

#### Technical Notes

```typescript
// supabase/functions/export-user-data/index.ts
// Authenticated endpoint only
// Returns ZIP file with JSON data
```

#### Story Points: 5
**Assigned:** @dev
**Sprint:** 4

---

### STORY LGPD-003: Implement Soft Delete [P1 - HIGH]

**As a** user
**I want to** request deletion of my data while maintaining audit compliance
**So that** my right to erasure is respected while legal obligations are met

#### Acceptance Criteria

- [ ] Add `deleted_at` timestamp to leads, problems, dimensions, questions_answers
- [ ] Add `deletion_requested_at` to track request date
- [ ] Add `deletion_reason` enum (user_request, expired, admin)
- [ ] Views/queries automatically filter deleted records
- [ ] Deleted data retained for legal hold period (5 years Brazil)
- [ ] Automated purge after retention period expires
- [ ] Deletion request endpoint for users

#### Technical Notes

```sql
-- Add to each table
ALTER TABLE leads ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE leads ADD COLUMN deletion_requested_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE leads ADD COLUMN deletion_reason VARCHAR(20);

-- Create view that filters deleted records
CREATE VIEW active_leads AS
  SELECT * FROM leads WHERE deleted_at IS NULL;
```

#### Story Points: 5
**Assigned:** @dev
**Sprint:** 4

---

### STORY LGPD-004: Implement Data Retention Policy [P2 - MEDIUM]

**As a** system administrator
**I want to** automatically manage data lifecycle
**So that** we comply with data minimization principles

#### Acceptance Criteria

- [ ] Define retention periods per data type:
  - Visitor/session data: 90 days
  - Lead data (unconverted): 2 years
  - Lead data (converted): 5 years
  - Email logs: 1 year
- [ ] Scheduled function runs daily to identify expired data
- [ ] Expired data moved to archive or deleted based on policy
- [ ] Audit log records all retention actions
- [ ] Admin dashboard shows retention metrics

#### Story Points: 8
**Assigned:** @dev
**Sprint:** 5

---

## SPRINT ALLOCATION

### Sprint 3.5 (EMERGENCY - 1 Week) ✅ COMPLETO

| Story | Points | Priority | Status |
|-------|--------|----------|--------|
| DB-001 | 3 | P0 | ✅ Done (2026-02-01) |
| DB-002 | 5 | P0 | ✅ Done (2026-02-01) |
| **Total** | **8** | | **100%** |

**Goal:** Fix data persistence and security. ✅ ACHIEVED

### Sprint 4 (2 Weeks)

| Story | Points | Priority | Status |
|-------|--------|----------|--------|
| LGPD-001 | 3 | P1 | Backlog |
| LGPD-002 | 5 | P1 | Backlog |
| LGPD-003 | 5 | P1 | Backlog |
| **Total** | **13** | | |

**Goal:** LGPD core compliance. User rights implementation.

### Sprint 5 (2 Weeks)

| Story | Points | Priority | Status |
|-------|--------|----------|--------|
| LGPD-004 | 8 | P2 | Backlog |
| Additional LGPD refinements | 5 | P2 | Backlog |
| **Total** | **13** | | |

**Goal:** Data lifecycle management. Full compliance certification readiness.

---

## DEPENDENCIES

### DB-001 & DB-002 Prerequisites
- None (can start immediately)

### LGPD Stories Prerequisites
- DB-001 and DB-002 must be complete
- Privacy policy version defined by legal team
- Data retention periods approved by legal

---

## RISK ASSESSMENT

### If P0 Items Not Fixed Before Production

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Data loss complaints | HIGH | SEVERE | Block deploy until fixed |
| LGPD investigation | MEDIUM | SEVERE | Implement RLS immediately |
| User data exposure | HIGH | SEVERE | RLS policies mandatory |
| Reputation damage | HIGH | HIGH | Fix before any marketing push |

### Recommended Actions

1. **IMMEDIATE:** Create emergency Sprint 3.5 for P0 items
2. **48 HOURS:** DB-001 migration deployed and tested
3. **72 HOURS:** DB-002 migration deployed and tested
4. **1 WEEK:** Production readiness review
5. **SPRINT 4:** Begin LGPD compliance implementation

---

## APPENDIX: FILES TO CREATE

### New Migrations

```
supabase/migrations/
  00014_create_core_tables.sql        # Story DB-001
  00015_rls_policies.sql               # Story DB-002
  00016_lgpd_consent_fields.sql        # Story LGPD-001
  00017_soft_delete_fields.sql         # Story LGPD-003
```

### New Edge Functions

```
supabase/functions/
  export-user-data/index.ts            # Story LGPD-002
  request-deletion/index.ts            # Story LGPD-003
  cleanup-retention/index.ts           # Story LGPD-004
```

---

*Analysis prepared by @po (Product Owner Agent)*
*Review requested from: @architect, @dev, @devops*
*Approval required from: Product Owner, Tech Lead*
