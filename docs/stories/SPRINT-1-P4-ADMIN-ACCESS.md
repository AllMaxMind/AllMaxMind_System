# 📖 User Story: P4 - Admin Access + Role-Based Security

**Story ID**: SPRINT-1-P4
**Epic**: Admin Dashboard & Lead Management
**Sprint**: Sprint 1
**Priority**: 🔴 CRÍTICA 2
**Status**: 📋 Ready for Development
**Points**: 8 (3 days)
**Created**: 2026-02-03
**PO**: Pax (Balancer)

---

## 📝 User Story Statement

**As an** admin user (team member from @allmax or @maxmind)
**I want to** access the admin dashboard to view and manage all leads
**So that** I can monitor user engagement and guide the sales pipeline

---

## 🎯 Acceptance Criteria

### Database Layer
- [ ] Role column added to user_profiles (VARCHAR(20), default 'user')
- [ ] Roles defined: 'user' | 'admin' | 'super_admin'
- [ ] RLS policy: admin_view_all_leads allows admin/super_admin access
- [ ] RLS policy: admin_update_leads allows admin to modify leads
- [ ] RLS policy: user_view_own_data ensures user privacy
- [ ] Migration applied without errors
- [ ] Seed existing admin users (based on email domain)

### RLS Policies (Security)
- [ ] Policy enforces at database layer (not relying on frontend)
- [ ] Admin user can SELECT all leads
- [ ] Non-admin user can only SELECT own leads
- [ ] Admin can UPDATE lead status/notes
- [ ] Non-admin cannot UPDATE other users' data
- [ ] Audit logs record all admin actions
- [ ] Email-based check works (@allmax, @maxmind)
- [ ] Role-based explicit check also works

### Frontend - ProtectedRoute Guard
- [ ] New component: ProtectedRoute with role verification
- [ ] Check 1: User authenticated? (auth.uid() exists)
  - [ ] If NO → redirect to /auth/login
- [ ] Check 2: User has admin role? (user.role === 'admin')
  - [ ] If NO → redirect to / (homepage)
  - [ ] Show toast: "Acesso não autorizado"
- [ ] If YES → render protected component
- [ ] Component accepts props: { children, requiredRole }

### Frontend - Navigation
- [ ] Navbar checks user.role before showing admin link
- [ ] Admin link only visible if role === 'admin'
- [ ] No CSS hiding (security by conditional render)
- [ ] Link points to /admin route
- [ ] Non-admins cannot see link at all

### Frontend - Admin Route & Page
- [ ] /admin route created in App.tsx
- [ ] /admin protected by ProtectedRoute component
- [ ] Admin page imports + renders LeadDashboard
- [ ] Dashboard loads (real-time updates via RLS)
- [ ] Breadcrumb shows "Admin / Leads"

### Admin Dashboard (Already Exists - P4 makes visible)
- [ ] Kanban view of leads (by status)
- [ ] Table view with filters
- [ ] Real-time subscription to lead changes
- [ ] Update lead status/notes
- [ ] All queries go through RLS (enforced at DB)

### Testing & QA
- [ ] Login as admin → see admin link in navbar
- [ ] Login as user → no admin link visible
- [ ] Admin navigates to /admin → dashboard loads
- [ ] Non-admin tries /admin → redirected to /
- [ ] Non-admin API call (direct) → denied by RLS
- [ ] Admin updates lead → succeeds + logged
- [ ] User cannot update other user's lead → denied
- [ ] Audit logs record all admin updates
- [ ] Permission denied graceful (toast + redirect)
- [ ] Real-time updates work for admin
- [ ] All tests passing

### Security & Compliance
- [ ] No role info in JWT (fetched fresh from user_profiles)
- [ ] RLS enforced at database layer (not frontend)
- [ ] Audit trail logs all admin access
- [ ] IP/user-agent tracking for suspicious activity
- [ ] No hardcoded admin email domains
- [ ] Email domain check + explicit role flag (fail-safe)

---

## 📚 File List

### New Files Created
```
supabase/migrations/00021_add_role_to_user_profiles.sql
supabase/migrations/00022_admin_rls_policies.sql
src/components/auth/ProtectedRoute.tsx
src/pages/AdminPage.tsx
src/__tests__/admin-access.test.ts
```

### Modified Files
```
src/App.tsx (add /admin route)
src/components/layout/Navbar.tsx (conditional admin link)
src/lib/auth/types.ts (add role to User interface)
```

---

## 🔗 Dependencies

### Blockers (Must complete first)
- None (independent feature)

### Blocks These Stories
- None (admin is independent)

### Related Stories
- N/A (Sprint 1 foundation)

---

## 💬 Task Breakdown

### Task 4.1: Database - Add Role Column (Day 1)
**Owner**: Backend Dev
**Estimate**: 0.5 days
**Status**: [ ] Not started

- [ ] Create migration for user_profiles role column
- [ ] Add default value 'user'
- [ ] Add constraint for enum-like values
- [ ] Seed existing admins (email domain check)
- [ ] Test migration locally
- [ ] Document schema change

### Task 4.2: RLS Policies (Day 1-2)
**Owner**: Backend Dev + Security Review
**Estimate**: 1 day
**Status**: [ ] Not started

- [ ] Create admin_view_all_leads policy
- [ ] Create admin_update_leads policy
- [ ] Create user_view_own_leads policy
- [ ] Create audit_logs access policy
- [ ] Test policies (SELECT, UPDATE, DELETE)
- [ ] Test policy violations (denied access)
- [ ] Security team review

### Task 4.3: Frontend - ProtectedRoute Component (Day 2)
**Owner**: Frontend Dev
**Estimate**: 0.5 days
**Status**: [ ] Not started

- [ ] Create ProtectedRoute.tsx component
- [ ] Check auth.uid() exists
- [ ] Check user.role === requiredRole
- [ ] Redirect logic (to /auth/login or /)
- [ ] Toast notification on denied access
- [ ] Pass through props to children
- [ ] Unit tests (auth/non-auth, user/admin)

### Task 4.4: Frontend - Admin Navigation (Day 2)
**Owner**: Frontend Dev
**Estimate**: 0.5 days
**Status**: [ ] Not started

- [ ] Update Navbar.tsx
- [ ] Add conditional render: {user?.role === 'admin' && ...}
- [ ] NavLink to /admin
- [ ] Test visibility (user/admin)
- [ ] Mobile responsive

### Task 4.5: Frontend - Admin Route + Page (Day 2-3)
**Owner**: Frontend Dev
**Estimate**: 1 day
**Status**: [ ] Not started

- [ ] Add /admin route to App.tsx
- [ ] Wrap with ProtectedRoute
- [ ] Create AdminPage.tsx
- [ ] Import LeadDashboard component
- [ ] Test navigation to /admin
- [ ] Test unauthorized redirect
- [ ] E2E test (login → admin link → dashboard)

### Task 4.6: Testing & QA (Day 3)
**Owner**: QA Lead
**Estimate**: 1 day
**Status**: [ ] Not started

- [ ] Permission matrix testing
- [ ] RLS enforcement testing
- [ ] Navigation flow testing
- [ ] Role-based visibility testing
- [ ] Audit trail verification
- [ ] Security audit (unauthorized access)
- [ ] Sign-off ✅

---

## 🧪 Test Cases

### Happy Path
```gherkin
Scenario: Admin sees dashboard
  Given user is admin (role='admin')
  When user logs in
  Then "Admin Dashboard" link appears in navbar
  And user clicks link
  And /admin route loads
  And LeadDashboard displays

Scenario: Admin updates lead
  Given admin in dashboard
  And lead visible in Kanban
  When admin clicks lead → edits status
  Then lead updated in database
  And RLS allows update
  And audit log records action
  And real-time update visible
```

### Error Scenarios
```gherkin
Scenario: Non-admin tries accessing /admin
  Given user is regular user (role='user')
  When user navigates to /admin
  Then redirected to /
  And toast: "Acesso não autorizado"

Scenario: Non-admin API call denied
  Given user is regular user
  When user makes direct API call to leads
  Then RLS policy denies (403)
  And no data returned
  And error logged

Scenario: Unauthenticated user tries /admin
  Given user not logged in
  When user navigates to /admin
  Then redirected to /auth/login
```

---

## 📊 Metrics & KPIs

- **Admin access success rate**: 100%
- **RLS policy enforcement**: 100%
- **Unauthorized access attempts**: 0% (all denied)
- **Audit trail completeness**: 100%
- **Permission denied handling**: Graceful (all cases)

---

## 🚨 Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| RLS misconfigured | Low | Critical | Thorough testing + security review |
| Admin link visible to user | Low | Medium | Conditional render (not CSS hide) |
| Role fetch fails | Low | High | Fallback to email domain check |
| Performance on large datasets | Low | Medium | Indexes on user_id, status |

---

## 📋 Review Checklist (before starting)

- [ ] Security team reviews RLS policies
- [ ] DBA reviews schema changes
- [ ] Team understands Row-Level Security concept
- [ ] Admin users identified + role assigned
- [ ] LeadDashboard component working
- [ ] Test environment ready

---

## ✅ Definition of Done

- [x] All acceptance criteria met
- [x] All test cases passing
- [x] Code reviewed (security focus)
- [x] RLS tested by security team
- [x] No console errors
- [x] TypeScript strict mode passing
- [x] Audit logs working
- [x] Documentation updated
- [x] User story closed in backlog
- [x] Demo completed in Sprint 1 retro

---

## 📌 Notes & Comments

### Architecture Decisions
- Role stored in user_profiles (not JWT) for auditability
- Email domain check + explicit role (fail-safe)
- Conditional render for admin link (not CSS hiding)
- ProtectedRoute wraps admin routes

### Known Limitations
- No granular permissions yet (all admins equal)
- No role management UI (manual DB updates)
- Email domain hardcoded (@allmax, @maxmind)

### Future Enhancements
- Granular permissions (view-only, edit, delete)
- Role management dashboard
- Audit log viewer for admins
- Super-admin role (no restrictions)

---

**Created by**: Pax (PO)
**Last Updated**: 2026-02-03
**Status**: ✅ Ready for Sprint 1
