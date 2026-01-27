# ALL MAX MIND - DevOps Operational Checklist

**Document Version:** 1.0
**Last Updated:** 2026-01-27
**Audience:** DevOps Team
**Status:** Ready for Implementation

---

## PRE-DEPLOYMENT VERIFICATION

### Code Quality & Testing

- [ ] **TypeScript Type Checking**
  ```bash
  npm run typecheck
  # Expected: No errors
  ```

- [ ] **ESLint Code Quality**
  ```bash
  npm run lint
  # Expected: No errors (warnings acceptable)
  ```

- [ ] **Unit Tests Passing**
  ```bash
  npm test
  # Expected: All tests pass (coverage > 80%)
  # Report: Coverage report in terminal
  ```

- [ ] **Production Build**
  ```bash
  npm run build
  # Expected: Build succeeds, dist/ folder created
  # Size check: dist/ < 1 MB total
  ```

- [ ] **Build Artifact Verification**
  - [ ] `dist/index.html` exists
  - [ ] `dist/assets/` contains bundled JS/CSS
  - [ ] No source maps in production build
  - [ ] Vercel config is valid: `cat vercel.json` returns valid JSON

- [ ] **Security Audit**
  ```bash
  npm audit --audit-level=high
  # Expected: No high/critical vulnerabilities
  # If found: npm update or npm audit fix
  ```

- [ ] **Dependency Check**
  ```bash
  npm outdated
  # Review for deprecated packages
  # Update non-breaking updates: npm update
  ```

### Environment Variables

- [ ] **All Required Secrets Identified**
  - [ ] `VITE_GEMINI_API_KEY` - Google Gemini API
  - [ ] `VITE_SUPABASE_URL` - Supabase project URL
  - [ ] `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
  - [ ] `SENTRY_DSN` - Error tracking
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` - Backend only (not exposed)

- [ ] **Secrets Not in Git**
  ```bash
  git status | grep -E '\.env|\.env\.local'
  # Expected: These files should NOT appear
  ```

- [ ] **Environment Template Updated**
  - [ ] `.env.example` contains all required variables
  - [ ] Comments explain each variable
  - [ ] No actual values in template

- [ ] **Local Environment Tested**
  ```bash
  cp .env.example .env.local
  # Fill with development values
  npm run dev
  # Expected: App runs on localhost:3000
  ```

### Database Preparation

- [ ] **Supabase Project Created**
  - [ ] Project URL: `https://[project-id].supabase.co`
  - [ ] Project configured in correct region
  - [ ] API keys generated

- [ ] **Database Schema Applied**
  ```sql
  -- Connect to Supabase
  psql -h db.[region].supabase.co -U postgres -d postgres

  -- Run schema file
  \i supabase/schema.sql
  ```

- [ ] **Schema Verification**
  ```sql
  -- Verify tables exist
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public';

  -- Expected tables:
  -- problems, dimensions, questions_answers, leads
  ```

- [ ] **RLS Policies Configured**
  ```sql
  -- Check RLS is enabled
  SELECT schemaname, tablename, rowsecurity
  FROM pg_tables
  WHERE tablename IN ('problems', 'dimensions', 'questions_answers', 'leads');

  -- Expected: rowsecurity = true
  ```

- [ ] **Indexes Created**
  ```sql
  -- Verify indexes exist
  \di public.*

  -- Expected:
  -- idx_problems_visitor_id
  -- idx_problems_session_id
  -- idx_dimensions_problem_id
  -- etc.
  ```

- [ ] **Test Data Inserted** (Optional)
  ```sql
  INSERT INTO problems (visitor_id, session_id, raw_text, domain)
  VALUES ('test-user-1', uuid_generate_v4(), 'Test problem statement', 'technical');

  SELECT COUNT(*) FROM problems; -- Should return > 0
  ```

- [ ] **Database Connection Tested**
  ```bash
  curl -H "Authorization: Bearer [SUPABASE_ANON_KEY]" \
       https://[project-id].supabase.co/rest/v1/problems?limit=1

  # Expected: 200 response with JSON data
  ```

### Git Repository Setup

- [ ] **Repository Initialized**
  ```bash
  git status
  # Expected: Repository initialized
  ```

- [ ] **Protected Main Branch Configured**
  - [ ] Require pull request reviews before merge
  - [ ] Require status checks to pass
  - [ ] Require branches to be up to date

- [ ] **Branch Naming Convention Documented**
  - [ ] Format: `feature/description`, `fix/description`, `hotfix/description`
  - [ ] Protected main branch: `main` (or `master`)

- [ ] **Commit History Clean**
  ```bash
  git log --oneline -10
  # Expected: Clear, meaningful commit messages
  ```

---

## VERCEL SETUP & CONFIGURATION

### Project Creation

- [ ] **Vercel Project Created**
  - [ ] Project name: `all-max-mind`
  - [ ] Framework: Other (for Vite)
  - [ ] Root directory: ./
  - [ ] Region: São Paulo (Brazil - gru1)

- [ ] **Git Integration Connected**
  - [ ] GitHub repository connected
  - [ ] Deploy on push enabled for main branch
  - [ ] Preview deployments for PRs enabled

- [ ] **Build Settings Configured**
  ```
  Framework Preset:     Other
  Build Command:        npm run build
  Output Directory:     dist
  Install Command:      npm ci
  Node.js Version:      18.x
  ```

- [ ] **Environment Variables Added to Vercel**
  - [ ] `VITE_GEMINI_API_KEY`
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
  - [ ] `SENTRY_DSN`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` (backend functions only)

### Deployment Configuration

- [ ] **vercel.json Configured Correctly**
  ```bash
  cat vercel.json | jq .
  # Verify:
  # - buildCommand is correct
  # - outputDirectory is "dist"
  # - headers are present
  # - rewrites are correct
  ```

- [ ] **Security Headers Added**
  ```
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Content-Security-Policy: default-src 'self'
  ```

- [ ] **Cache Configuration Set**
  ```
  /assets/* → 1 year cache
  /index.html → no cache
  /api/* → configurable cache
  ```

- [ ] **Custom Domain Connected** (if applicable)
  - [ ] Domain added to Vercel
  - [ ] DNS records updated
  - [ ] SSL certificate auto-provisioned
  - [ ] Wait for DNS propagation (24-48 hours)

### Test Deployment

- [ ] **Preview Deployment Successful**
  ```bash
  git push origin feature/test
  # Expected: Vercel deploys preview automatically
  # Check URL: https://all-max-mind-[hash].vercel.app
  ```

- [ ] **Preview Build Artifact Checked**
  - [ ] Bundle size < 500 KB gzipped
  - [ ] No source maps exposed
  - [ ] Assets properly versioned (content hashes)

---

## EXTERNAL SERVICES INTEGRATION

### Google Gemini API Setup

- [ ] **Google Cloud Project Created**
  - [ ] Project name: "All Max Mind"
  - [ ] Billing enabled
  - [ ] Billing alert set at $100/month

- [ ] **Gemini API Enabled**
  ```
  APIs & Services → Enable APIs and Services
  Search: "Generative Language API"
  Click Enable
  ```

- [ ] **API Key Created**
  ```
  Credentials → Create Credentials → API Key
  Copy: VITE_GEMINI_API_KEY
  ```

- [ ] **API Quota Configured**
  - [ ] Quota limit: 20 requests/minute
  - [ ] Alert at: 80% usage
  - [ ] Daily limit: Based on expected usage

- [ ] **API Key Restrictions Set**
  - [ ] Application restrictions: None (for development)
  - [ ] API restrictions: Generative Language API only
  - [ ] HTTP referrer restrictions: Your domain(s)

- [ ] **Test API Call Successful**
  ```bash
  curl -X POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=YOUR_KEY \
    -H "Content-Type: application/json" \
    -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'

  # Expected: 200 response with generated text
  ```

### Supabase Configuration

- [ ] **Supabase Project Settings Reviewed**
  - [ ] Project region: South America (São Paulo recommended)
  - [ ] Database size: Starter → scales to Pro/Business
  - [ ] Backups: Enabled (daily automatic)

- [ ] **Authentication (Optional)**
  - [ ] If using future auth: Google, GitHub providers configured
  - [ ] JWT secret strong (auto-generated)
  - [ ] Email configuration set up

- [ ] **Row Level Security (RLS) Enabled**
  ```sql
  ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
  ALTER TABLE dimensions ENABLE ROW LEVEL SECURITY;
  ALTER TABLE questions_answers ENABLE ROW LEVEL SECURITY;
  ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
  ```

- [ ] **Connection Pooling Configured**
  - [ ] Pool mode: Transaction (for Vercel)
  - [ ] Pool size: Default (Supabase manages)

- [ ] **Backups Configured**
  - [ ] Automated backups: Daily
  - [ ] Point-in-time recovery: Enabled
  - [ ] Backup storage region: Same as database

### Sentry Configuration

- [ ] **Sentry Organization Created**
  - [ ] Org name: "All Max Mind"
  - [ ] Owner email: DevOps contact

- [ ] **Sentry Project Created**
  - [ ] Platform: React
  - [ ] Copy: SENTRY_DSN

- [ ] **Sentry Settings Configured**
  - [ ] Release tracking enabled
  - [ ] Distributed tracing enabled
  - [ ] Session replay enabled
  - [ ] Error sample rate: 100%
  - [ ] Transaction sample rate: 10%

- [ ] **Alert Rules Created**
  ```
  Trigger: When error rate > 5%
  Action: Notify Slack channel #alerts

  Trigger: New issue created
  Action: Notify team via email
  ```

- [ ] **Test Error Capture**
  ```bash
  curl https://your-app.vercel.app/api/trigger-test-error
  # Expected: Error appears in Sentry dashboard within 1 minute
  ```

---

## MONITORING & OBSERVABILITY SETUP

### Health Check Monitoring

- [ ] **Uptime Monitoring Service Configured**
  - [ ] Service: Pingdom, Datadog, or similar
  - [ ] Endpoint: `https://your-domain.vercel.app/api/health`
  - [ ] Frequency: Every 5 minutes
  - [ ] Alert threshold: 3 consecutive failures

- [ ] **Health Check Response Verified**
  ```bash
  curl https://your-domain.vercel.app/api/health -s | jq .

  # Expected response:
  # {
  #   "status": "ok",
  #   "timestamp": "2026-01-27T...",
  #   "services": {
  #     "api": "ok",
  #     "database": "ok",
  #     "cache": "ok",
  #     "memory": "ok"
  #   },
  #   "uptime": 123456,
  #   "version": "1.0.0"
  # }
  ```

### Performance Monitoring

- [ ] **Core Web Vitals Baseline Established**
  - [ ] Largest Contentful Paint (LCP): < 2.5s
  - [ ] Cumulative Layout Shift (CLS): < 0.1
  - [ ] First Input Delay (FID): < 100ms
  - [ ] Tools: Sentry RUM, Google PageSpeed Insights

- [ ] **Sentry Performance Monitoring Active**
  - [ ] Transactions being recorded
  - [ ] Slowest transactions identified
  - [ ] Performance budget set: P95 < 3s

- [ ] **Bundle Size Monitoring**
  - [ ] Current size: Record baseline
  - [ ] Alert threshold: 10% increase
  - [ ] Tool: Bundle Analyzer (webpack-bundle-analyzer or similar)

### Logging & Alerting

- [ ] **Error Alerts Configured**
  - [ ] Slack webhook integrated
  - [ ] Alert on: Error spike (2x hourly average)
  - [ ] Alert on: 500 server errors
  - [ ] Alert on: Rate limiting triggered

- [ ] **Performance Alerts Configured**
  - [ ] Alert on: P95 latency > 2x baseline
  - [ ] Alert on: API response time > 1 second
  - [ ] Alert on: Database query time > 200ms

- [ ] **Infrastructure Alerts Configured**
  - [ ] Alert on: Memory usage > 80%
  - [ ] Alert on: CPU usage > 75%
  - [ ] Alert on: Deployment failure

---

## PRODUCTION DEPLOYMENT

### Pre-Production Checklist

- [ ] **Staging Environment Tested**
  - [ ] Full user journey tested (all 4 phases)
  - [ ] API endpoints tested
  - [ ] Database operations tested
  - [ ] Error scenarios tested

- [ ] **Load Testing Completed** (Optional)
  ```bash
  k6 run --vus 100 --duration 10m loadtest.js
  # Expected:
  # - Success rate > 95%
  # - P95 latency < 2s
  # - Error rate < 5%
  ```

- [ ] **Security Scan Passed**
  - [ ] OWASP top 10 reviewed
  - [ ] No hardcoded secrets
  - [ ] API endpoints secured
  - [ ] Database access controlled

- [ ] **Documentation Complete**
  - [ ] README updated with deployment info
  - [ ] API documentation available
  - [ ] Runbook created for operations
  - [ ] Incident response procedures defined

### Production Deployment Steps

1. **Code Merge to Main**
   ```bash
   git checkout main
   git pull origin main
   git merge --no-ff origin/feature/branch -m "Deploy [feature]"
   git push origin main
   # Expected: Vercel automatically deploys
   ```

2. **Deployment Verification**
   ```bash
   # Check deployment status
   vercel list --prod

   # Expected: Latest deployment shows "READY"
   ```

3. **Health Check Verification**
   ```bash
   # Test API health endpoint
   curl https://maxmind.com/api/health

   # Expected: 200 response, all services "ok"
   ```

4. **Smoke Tests**
   ```bash
   # Test landing page
   curl -I https://maxmind.com/
   # Expected: 200 OK

   # Test API health
   curl -s https://maxmind.com/api/health | jq .status
   # Expected: "ok"

   # Check Sentry is receiving events
   # → Dashboard should show events from production
   ```

5. **Database Verification**
   ```sql
   -- Connect to production database
   psql -h db.supabase.co -U postgres -d postgres

   -- Verify schema
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public' ORDER BY table_name;

   -- Expected: All tables present
   ```

6. **Monitor Initial Deployments**
   - [ ] Watch Sentry errors for first 30 minutes
   - [ ] Check performance metrics
   - [ ] Monitor API response times
   - [ ] Verify database connections

- [ ] **Production Deployment Successful**
  - [ ] No critical errors in Sentry
  - [ ] Health check returns 200
  - [ ] All phases load successfully
  - [ ] Database operations working

### Post-Deployment Monitoring (First 24 Hours)

- [ ] **Continuous Monitoring**
  - [ ] Check every 30 minutes:
    - Sentry error rate
    - API response times
    - Database performance
    - Memory usage
  - [ ] Alert threshold: More than 1% errors

- [ ] **User Feedback Review**
  - [ ] Monitor support channels
  - [ ] Check for user-reported issues
  - [ ] Review analytics for anomalies

- [ ] **Performance Baseline**
  - [ ] Record current metrics
  - [ ] Compare to pre-deployment baseline
  - [ ] Investigate any degradation

- [ ] **First Incident Protocol**
  - [ ] If critical error: Page on-call DevOps
  - [ ] If > 5% error rate: Consider rollback
  - [ ] Document incident in runbook

---

## ROLLBACK PROCEDURE

If deployment encounters critical issues:

### Immediate Rollback (< 5 minutes)

```bash
# Option 1: Vercel Dashboard
# 1. Go to https://vercel.com/dashboard
# 2. Select project: all-max-mind
# 3. Go to Deployments tab
# 4. Find previous stable deployment
# 5. Click three dots → Rollback

# Option 2: Vercel CLI
vercel rollback --prod

# Option 3: Git Rollback
git revert HEAD --no-edit
git push origin main
# (Vercel auto-deploys the revert)
```

### Verify Rollback Success

```bash
# Check deployment status
curl https://maxmind.com/api/health
# Expected: 200 OK

# Monitor Sentry
# Expected: Error rate returns to baseline

# Check performance metrics
# Expected: Latency returns to normal
```

### Post-Rollback Analysis

- [ ] **Root Cause Analysis**
  - [ ] What caused the failure?
  - [ ] Why wasn't it caught in testing?
  - [ ] What tests were missing?

- [ ] **Process Improvements**
  - [ ] Add regression test
  - [ ] Enhance staging environment
  - [ ] Update checklist if needed

- [ ] **Re-deployment Plan**
  - [ ] Fix identified issues
  - [ ] Add tests for failure scenario
  - [ ] Re-test in staging
  - [ ] Schedule new deployment

---

## ONGOING OPERATIONS

### Weekly Tasks

- [ ] **Dependency Updates**
  ```bash
  npm outdated
  npm update
  npm audit
  ```

- [ ] **Performance Review**
  - [ ] Check Core Web Vitals trends
  - [ ] Review slowest transactions
  - [ ] Identify optimization opportunities

- [ ] **Security Review**
  - [ ] Check for security advisories
  - [ ] Review Sentry for security-related errors
  - [ ] Audit API access logs

### Monthly Tasks

- [ ] **Cost Review**
  - [ ] Check Google Cloud billing
  - [ ] Review Supabase usage
  - [ ] Check Vercel metering
  - [ ] Optimize costs if needed

- [ ] **Database Maintenance**
  ```sql
  -- Analyze query performance
  ANALYZE;

  -- Reindex tables if needed
  REINDEX DATABASE postgres;

  -- Check table sizes
  SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
  FROM pg_tables
  WHERE schemaname='public'
  ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
  ```

- [ ] **Documentation Update**
  - [ ] Update runbooks with new learnings
  - [ ] Document any architecture changes
  - [ ] Update contact information if needed

### Quarterly Tasks

- [ ] **API Key Rotation**
  - [ ] Rotate Gemini API key
  - [ ] Rotate Supabase keys
  - [ ] Update in Vercel secrets

- [ ] **Disaster Recovery Testing**
  - [ ] Test database restore procedure
  - [ ] Test rollback procedure
  - [ ] Verify backup integrity

- [ ] **Security Audit**
  - [ ] Review RLS policies
  - [ ] Check for vulnerability in dependencies
  - [ ] Review cloud IAM permissions

- [ ] **Performance Optimization Review**
  - [ ] Analyze slowest queries
  - [ ] Review bundle size trends
  - [ ] Implement optimization if needed

---

## INCIDENT RESPONSE

### Incident Severity Matrix

| Severity | Description | Response Time | Action |
|----------|-------------|---|--------|
| **P1 - Critical** | Service down > 10 min | Immediate (5 min) | Page on-call, start war room |
| **P2 - High** | Degradation, > 5% errors | 15 minutes | Notify team, investigate |
| **P3 - Medium** | Performance issue, < 5% errors | 1 hour | Track, prioritize fix |
| **P4 - Low** | Minor issue, user workaround available | 24 hours | Document, schedule fix |

### Incident Response Checklist

1. **Initial Detection**
   - [ ] Verify incident (false alarm check)
   - [ ] Note time of discovery
   - [ ] Check Sentry for error context
   - [ ] Page on-call if P1/P2

2. **Investigation**
   - [ ] Check Vercel deployment status
   - [ ] Check Supabase status
   - [ ] Check Google Cloud status
   - [ ] Review recent code changes
   - [ ] Check error logs in Sentry

3. **Communication**
   - [ ] Post to #incidents channel
   - [ ] Update status page (if available)
   - [ ] Notify stakeholders
   - [ ] Provide ETA for resolution

4. **Resolution**
   - [ ] Try quick fixes first (clear cache, restart, etc)
   - [ ] If unable to fix → Rollback
   - [ ] If successful → Monitor closely

5. **Post-Incident**
   - [ ] Document what happened
   - [ ] Identify root cause
   - [ ] Create action items for prevention
   - [ ] Schedule postmortem (24-48 hours)

### Escalation Contacts

```
Level 1 (DevOps):      [Primary on-call contact]
Level 2 (Architecture): [Architect contact]
Level 3 (Management):   [CTO/VP Engineering]
```

---

## RUNBOOK QUICK REFERENCE

### Common Issues & Quick Fixes

**Issue: High Error Rate in Production**
```
1. Check Sentry for error patterns
2. Identify affected component
3. Check if recent deployment
4. If deployment related: Rollback
5. If not: Check database, API status
6. Investigate root cause
7. Deploy fix or workaround
```

**Issue: Slow API Response Times**
```
1. Check database query performance
2. Verify indexes exist
3. Check API logs for slow requests
4. Identify bottleneck (query, network, compute)
5. Implement fix (index, caching, optimization)
6. Monitor after fix
```

**Issue: Database Connection Failed**
```
1. Check Supabase status page
2. Verify connection string is correct
3. Check RLS policies aren't blocking
4. Verify IP whitelisting if applicable
5. Check connection pool isn't exhausted
6. Restart connection if possible
```

**Issue: Gemini API Rate Limiting**
```
1. Check API quota in Google Cloud
2. Implement exponential backoff retry
3. Reduce request frequency if possible
4. Batch similar requests
5. Consider upgrading plan if persistent
```

---

## SIGN-OFF

- [ ] **DevOps Lead Sign-Off**
  - [ ] Name: _________________
  - [ ] Date: _________________
  - [ ] Contact: _________________

- [ ] **Architecture Review Sign-Off**
  - [ ] Name: _________________
  - [ ] Date: _________________
  - [ ] Contact: _________________

- [ ] **Security Review Sign-Off**
  - [ ] Name: _________________
  - [ ] Date: _________________
  - [ ] Contact: _________________

---

**Document Version:** 1.0
**Last Updated:** 2026-01-27
**Next Review:** 2026-03-27
**Owner:** DevOps Team

---

## APPENDIX: Useful Commands

```bash
# Deployment
npm run build                    # Build for production
vercel --prod                   # Deploy to production
vercel list --prod              # List production deployments
vercel logs                      # Stream production logs
vercel rollback                  # Rollback to previous deployment

# Environment & Secrets
vercel env list                 # List environment variables
vercel env add VAR_NAME "value" # Add environment variable
vercel secrets list             # List secrets

# Database (Supabase CLI)
supabase db list                # List databases
supabase db backup              # Create manual backup
supabase db restore BACKUP_ID   # Restore from backup
supabase pg-upgrade             # Upgrade PostgreSQL version

# Monitoring
curl https://domain.com/api/health  # Health check
npm run test                    # Run tests
npm run lint                    # Run linter
npm audit                       # Security audit

# Git Operations
git status                      # Check status
git log --oneline -10           # View recent commits
git revert HEAD --no-edit       # Revert latest commit
git push origin main            # Push to main
```

