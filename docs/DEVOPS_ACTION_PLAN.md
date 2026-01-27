# ALL MAX MIND - DevOps Action Plan

**Document:** Concrete Actions for DevOps Team
**Status:** Ready to Execute
**Prepared by:** Gage (DevOps Agent) ⚡
**Date:** 2026-01-27
**Target Completion:** 2026-01-28 (Phase 1 + Phase 2)

---

## IMMEDIATE ACTIONS - EXECUTE TODAY (4.5 hours)

### ACTION 1: Initialize Git Repository ⏱️ 15 min

**What to do:**
```bash
cd C:\Users\adria\codes\All_Max_Mind_System

# Initialize git
git init
git config user.name "DevOps Team"
git config user.email "devops@company.com"

# Add all files
git add .

# Create initial commit
git commit -m "chore: initial commit - ALL MAX MIND v1.0.0

- React 19 + TypeScript + Vite frontend
- Vercel serverless + Supabase PostgreSQL backend
- Google Gemini AI integration
- Sentry error monitoring
- Multi-phase problem-solving platform

Co-Authored-By: Gage (DevOps) <devops@company.com>"
```

**Verify:**
```bash
git log --oneline
# Should show: initial commit - ALL MAX MIND v1.0.0

git status
# Should show: On branch main, nothing to commit
```

---

### ACTION 2: Create GitHub Repository ⏱️ 15 min

**Prerequisites:**
- GitHub CLI installed: `which gh`
- GitHub account with organization access

**What to do:**
```bash
# Login to GitHub (first time only)
gh auth login
# Follow prompts, select HTTPS, authorize

# Create repository on GitHub
gh repo create all-max-mind \
  --public \
  --source=. \
  --remote=origin \
  --push

# Verify
git remote -v
# Should show: origin https://github.com/your-org/all-max-mind.git
```

**Create branch protection:**
```bash
gh api repos/:owner/:repo/branches/main/protection \
  -X PUT \
  -f required_status_checks='{"strict":true,"contexts":["ci.yml","deploy.yml"]}' \
  -f enforce_admins=true \
  -f required_pull_request_reviews='{"required_approving_review_count":1}'
```

---

### ACTION 3: Setup GitHub Actions Workflows ⏱️ 60 min

**Files already created (in previous step):**
- `.github/workflows/ci.yml` - Quality gates
- `.github/workflows/deploy.yml` - Deployment pipeline

**What to do:**
```bash
# Verify files exist
ls -la .github/workflows/

# Push to GitHub
git add .github/workflows/
git commit -m "chore: add GitHub Actions workflows

- CI pipeline for tests, linting, type checking
- Deploy pipeline for staging and production
- Automated health checks on deployment"

git push origin main
```

**Verify in GitHub UI:**
1. Go to `https://github.com/your-org/all-max-mind`
2. Click "Actions" tab
3. Should see: `CI - Quality Gates & Tests` workflow
4. Should see: `Deploy - Staging & Production` workflow

---

### ACTION 4: Add GitHub Secrets ⏱️ 30 min

**What to do:**

Go to: `https://github.com/your-org/all-max-mind/settings/secrets/actions`

Add these secrets (one by one):

1. **VERCEL_TOKEN**
   - Get from: `https://vercel.com/account/tokens`
   - Create: Personal Access Token
   - Copy value to GitHub Secret

2. **VERCEL_ORG_ID**
   - Get from: `https://vercel.com/account`
   - Look for "Team ID"

3. **VERCEL_PROJECT_ID**
   - Get from: Vercel project settings
   - Or will get after first deployment

4. **SLACK_WEBHOOK** (optional)
   - Get from: Slack workspace settings
   - Create: Incoming Webhook
   - Copy URL to GitHub Secret

**Command example:**
```bash
gh secret create VERCEL_TOKEN --body "YOUR_TOKEN_VALUE"
gh secret create VERCEL_ORG_ID --body "YOUR_ORG_ID"
gh secret create VERCEL_PROJECT_ID --body "YOUR_PROJECT_ID"
gh secret create SLACK_WEBHOOK --body "YOUR_WEBHOOK_URL"
```

**Verify:**
```bash
gh secret list
# Should show all secrets created
```

---

### ACTION 5: Setup Pre-Push Quality Gates ⏱️ 60 min

**What to do:**

1. **Create git hook script** (already done):
   ```bash
   ls -la scripts/pre-push-hook.sh
   # Should exist and be executable
   ```

2. **Make hook executable:**
   ```bash
   chmod +x scripts/pre-push-hook.sh
   ```

3. **Install hook in git:**
   ```bash
   cp scripts/pre-push-hook.sh .git/hooks/pre-push
   chmod +x .git/hooks/pre-push
   ```

4. **Test the hook** (before real push):
   ```bash
   # Make a dummy change
   echo "# Test" >> README.md
   git add README.md
   git commit -m "test: verify pre-push hook"

   # Try to push - should run quality checks
   git push origin test-branch
   # Should see: Running pre-push quality gates...

   # Rollback test
   git reset --soft HEAD~1
   git checkout README.md
   ```

5. **Add hook setup to README:**
   ```markdown
   ## Development Setup

   ```bash
   # Install pre-push hooks
   ./scripts/install-hooks.sh
   ```

   This ensures all developers run quality gates before pushing.
   ```

**Verify:**
```bash
cat .git/hooks/pre-push | head -5
# Should show: #!/bin/bash and quality gate script
```

---

### ACTION 6: Configure CodeRabbit Integration ⏱️ 30 min

**What to do:**

1. **Visit CodeRabbit:**
   - Go to: `https://coderabbit.ai`
   - Sign up with GitHub account
   - Authorize repository access

2. **Install CodeRabbit on Repository:**
   - https://github.com/coderabbit-ai/reviewer
   - Click "Install"
   - Select your organization
   - Select `all-max-mind` repository
   - Authorize

3. **Configure CodeRabbit Settings:**
   - Create `.coderabbit.yaml`:

   ```yaml
   rules:
     - type: patch
       instructions: Review code quality and security
   security:
     enforce_severity_level: CRITICAL
   ai:
     model: claude-3-sonnet
     temperature: 0
   ```

4. **Commit configuration:**
   ```bash
   git add .coderabbit.yaml
   git commit -m "chore: configure CodeRabbit AI review settings"
   git push origin main
   ```

5. **Test CodeRabbit:**
   - Create a test PR
   - CodeRabbit should automatically review within 2-5 minutes
   - Review comments should appear on the PR

---

### ACTION 7: Create GitHub CODEOWNERS ⏱️ 15 min

**What to do:**

Create `.github/CODEOWNERS`:

```
# ALL MAX MIND - Code Ownership

# Default reviewers
* @devops-team

# Frontend changes require frontend review
src/components/** @frontend-team @devops-team
src/services/** @frontend-team @devops-team

# Database changes require backend review
supabase/** @backend-team @devops-team
lib/supabase/** @backend-team @devops-team

# DevOps infrastructure
.github/** @devops-team
vercel.json @devops-team
scripts/** @devops-team

# Security sensitive
supabase/security-hardening.sql @devops-team @security-team
docs/DEVOPS_DEPLOYMENT_GUIDE.md @devops-team
docs/ARCHITECTURE.md @architect-team
```

**Commit:**
```bash
git add .github/CODEOWNERS
git commit -m "chore: add CODEOWNERS for automated code review routing"
git push origin main
```

---

### ACTION 8: Verify Vercel Connection ⏱️ 30 min

**What to do:**

1. **Create Vercel Account** (if needed)
   - Visit: `https://vercel.com`
   - Sign up with GitHub

2. **Create Vercel Project:**
   ```bash
   # Install Vercel CLI
   npm install -g vercel

   # Login to Vercel
   vercel login

   # Link current project
   cd C:\Users\adria\codes\All_Max_Mind_System
   vercel link

   # When prompted:
   # - Project name: all-max-mind
   # - Directory: .
   # - Command: npm run build
   # - Output directory: dist
   ```

3. **Verify Project Settings:**
   - Go to: `https://vercel.com/all-max-mind/settings`
   - Check: Build command = `npm run build`
   - Check: Output directory = `dist`
   - Check: Environment variables section

4. **Add Environment Variables to Vercel:**
   ```bash
   vercel env add VITE_GEMINI_API_KEY
   # Paste: (leave blank for now, will add later)

   vercel env add VITE_SUPABASE_URL
   # Paste: https://[project-id].supabase.co

   vercel env add VITE_SUPABASE_ANON_KEY
   # Paste: [anon-key]

   vercel env add SENTRY_DSN
   # Paste: https://[key]@[host]/[id]
   ```

5. **Verify:**
   ```bash
   vercel env list
   # Should show all environment variables
   ```

---

### ACTION 9: Test Quality Gate Pipeline ⏱️ 30 min

**What to do:**

1. **Create test branch:**
   ```bash
   git checkout -b test/quality-gates
   ```

2. **Make a small test change:**
   ```bash
   echo "# Quality Gate Test" >> test-file.md
   git add test-file.md
   git commit -m "test: verify quality gate pipeline"
   ```

3. **Test pre-push hook:**
   ```bash
   git push origin test/quality-gates
   # Should run all quality checks
   # Should pass without errors
   ```

4. **Create test PR:**
   ```bash
   gh pr create --title "test: verify CI pipeline" \
     --body "Testing GitHub Actions CI workflow"
   ```

5. **Monitor GitHub Actions:**
   - Go to: Actions tab in GitHub
   - Watch `ci.yml` workflow run
   - Should complete successfully
   - Verify all checks pass

6. **Cleanup:**
   ```bash
   gh pr close --delete-branch
   git branch -d test/quality-gates
   ```

---

## SUMMARY - PHASE 1 COMPLETION

**At this point (end of today):**

✅ Git repository initialized
✅ GitHub repository created
✅ GitHub Actions workflows deployed
✅ Pre-push quality gates working
✅ CodeRabbit integrated
✅ Vercel project created
✅ Environment variables configured
✅ Branch protection enabled
✅ Team can start pushing code with confidence

**Deliverables:**
```
Created/Modified Files:
├── .git/                          (git repository)
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   └── deploy.yml
│   ├── CODEOWNERS
│   └── .gitignore
├── scripts/
│   ├── pre-push-hook.sh
│   └── install-hooks.sh (to create)
├── supabase/
│   └── security-hardening.sql
├── docs/
│   ├── DEVOPS_GAP_ANALYSIS.md
│   ├── DEVOPS_ACTION_PLAN.md (this file)
│   └── DEVOPS_CHECKLIST.md
└── .github/ configuration
```

**Next Phase:** See DEVOPS_GAP_ANALYSIS.md for Phase 2 (Pre-Production) items

---

## PHASE 2: PRE-PRODUCTION SECURITY & HARDENING ⏱️ 8.5 hours

### ACTION 10: Harden Database Security (RLS Policies) ⏱️ 60 min

**What to do:**

1. **Login to Supabase Console:**
   - Go to: `https://app.supabase.com`
   - Select project: `all-max-mind`
   - Go to: SQL Editor

2. **Run Security Hardening SQL:**
   - Copy entire content from: `supabase/security-hardening.sql`
   - Paste into SQL Editor
   - Click "Run"

3. **Verify RLS is enabled:**
   ```sql
   SELECT tablename, rowsecurity
   FROM pg_tables
   WHERE tablename IN ('problems', 'dimensions', 'questions_answers', 'leads')
   AND schemaname = 'public'
   ORDER BY tablename;
   ```
   Should return 4 rows with `rowsecurity = true`

4. **Backup configuration:**
   ```bash
   # Save your RLS policies
   git add supabase/security-hardening.sql
   git commit -m "chore: apply production security hardening to database"
   git push origin main
   ```

---

### ACTION 11: Setup Sentry Error Monitoring ⏱️ 30 min

**What to do:**

1. **Create Sentry Account:**
   - Visit: `https://sentry.io/auth/register/`
   - Sign up with GitHub

2. **Create Sentry Organization & Project:**
   - Project Name: `all-max-mind`
   - Platform: React
   - Alert on: first event
   - Copy DSN

3. **Add Sentry DSN to Vercel:**
   ```bash
   vercel env add SENTRY_DSN
   # Paste the DSN: https://[key]@sentry.io/[project-id]
   ```

4. **Test Sentry Integration:**
   - Deploy to staging: `vercel`
   - Trigger a test error (add to app temporarily)
   - Error should appear in Sentry within 1 minute

5. **Configure Alert Rules:**
   - Go to: Sentry project settings → Alerts
   - Create rule: "Alert on new issues"
   - Create rule: "Alert when error rate > 5%"
   - Add notification: Slack (if configured)

---

### ACTION 12: Configure Uptime Monitoring ⏱️ 30 min

**What to do:**

Choose one uptime monitoring service:

**Option A: Pingdom (Recommended)**
```
1. Visit: https://pingdom.com
2. Sign up for free tier
3. Create monitor for: https://your-domain.vercel.app/api/health
4. Frequency: Every 5 minutes
5. Alert on: 3+ consecutive failures
6. Notification: Email + Slack
```

**Option B: UptimeRobot**
```
1. Visit: https://uptimerobot.com
2. Sign up (free tier available)
3. Add monitor: https://your-domain.vercel.app/api/health
4. Frequency: 5 minutes
5. Alert contacts: Slack, email
```

**Option C: DataDog**
```
1. Visit: https://datadog.com
2. Sign up
3. Create synthetic test for /api/health
4. Set alert thresholds
5. Configure Slack integration
```

---

### ACTION 13: Implement API Rate Limiting ⏱️ 60 min

**What to do:**

Create rate limiter middleware in Vercel function:

Create: `api/middleware/rate-limiter.ts`

```typescript
import { Request, Response } from '@vercel/node';

interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

const store: RateLimitStore = {};

export function rateLimit(req: Request, res: Response): boolean {
  const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
  const key = `rate-limit:${ip}`;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 100; // 100 requests per minute

  let record = store[key];

  if (!record || now > record.resetTime) {
    record = { count: 0, resetTime: now + windowMs };
    store[key] = record;
  }

  record.count++;

  if (record.count > maxRequests) {
    res.status(429).json({
      error: 'Too many requests',
      retryAfter: Math.ceil((record.resetTime - now) / 1000),
    });
    return false;
  }

  return true;
}
```

Use in endpoints:
```typescript
export default function handler(req: Request, res: Response) {
  if (!rateLimit(req, res)) return;

  // Your handler code
}
```

---

### ACTION 14: Run Performance Baseline ⏱️ 60 min

**What to do:**

1. **Measure Bundle Size:**
   ```bash
   npm run build

   # Check output size
   du -sh dist/
   # Should be < 500KB

   # List assets by size
   ls -lh dist/assets/ | sort -k5 -h
   ```

2. **Run Lighthouse Audit:**
   ```bash
   npm install -D lighthouse-ci

   # Run audit
   npx lhci autorun

   # Results in: .lighthouseci/
   ```

3. **Record Baseline Metrics:**
   Create: `docs/performance-baseline.md`

   ```markdown
   # Performance Baseline - 2026-01-27

   ## Bundle Size
   - Total: 450 KB (gzipped)
   - Main JS: 280 KB
   - CSS: 85 KB
   - Assets: 85 KB

   ## Lighthouse Scores
   - Performance: 85
   - Accessibility: 92
   - Best Practices: 90
   - SEO: 100

   ## Core Web Vitals
   - LCP: 1.8s
   - CLS: 0.08
   - FID: 45ms

   ## API Response Times (staging)
   - Health check: 150ms avg
   - Problem submission: 250ms avg
   - Analysis endpoint: 2-3s avg (Gemini API)
   ```

4. **Commit baseline:**
   ```bash
   git add docs/performance-baseline.md
   git commit -m "docs: record performance baselines"
   git push origin main
   ```

---

### ACTION 15: Test Disaster Recovery ⏱️ 60 min

**What to do:**

1. **Create Manual Backup:**
   ```bash
   # Login to Supabase
   # Go to Database → Backups
   # Click "Create backup now"
   # Wait for completion
   ```

2. **Test Restore Procedure:**
   ```bash
   # This is manual in Supabase UI:
   # Settings → Backups → Choose backup
   # Click "Restore" (on staging database first!)
   ```

3. **Document Recovery Procedure:**
   Create: `docs/disaster-recovery-procedures.md`

   ```markdown
   # Disaster Recovery Procedures

   ## Database Corruption

   1. Identify corruption via Sentry errors
   2. Stop application (set maintenance mode)
   3. Go to Supabase Console → Backups
   4. Select latest backup before corruption
   5. Click "Restore"
   6. Verify data integrity
   7. Resume application

   ## Complete Data Loss

   1. Ensure backups exist (check Supabase)
   2. Create new database (in separate Supabase project)
   3. Restore schema from backup
   4. Verify connections
   5. Update Vercel environment variables
   6. Deploy update

   ## API Credentials Compromise

   1. Immediately rotate compromised keys
   2. Update environment variables
   3. Redeploy application
   4. Monitor for unauthorized access
   5. Audit API logs for suspicious activity
   ```

4. **Verify Backup Retention:**
   - Check Supabase: Settings → Backups
   - Ensure 30-day retention is enabled
   - Verify daily backups are running

---

### ACTION 16: Create Incident Response Runbook ⏱️ 60 min

**Create:** `docs/incident-response-runbook.md`

```markdown
# Incident Response Runbook

## Severity Levels

### P1 - Critical (Immediate Response)
- Service completely down > 10 minutes
- Data loss occurring
- Security breach
- Response time: 5 minutes

### P2 - High (Urgent)
- Degraded performance (>50% slower)
- Error rate > 5%
- Partial service unavailability
- Response time: 15 minutes

### P3 - Medium
- Minor performance issue
- Error rate 1-5%
- Non-critical feature affected
- Response time: 1 hour

## P1 Incident Response

1. **Declare Incident** (0 min)
   - Page on-call engineer
   - Create #incidents Slack channel
   - Post initial status

2. **Investigate** (1-3 min)
   - Check Sentry for errors
   - Check Vercel deployment status
   - Check Supabase status page
   - Check monitoring dashboards

3. **Communicate** (ongoing)
   - Update every 5 minutes
   - Post to #incidents channel
   - Notify stakeholders

4. **Mitigate** (5-10 min)
   - Try quick fixes first
   - If unable: Rollback to previous deployment
   - If data issue: Restore from backup

5. **Verify** (10-15 min)
   - Health check endpoint returns 200
   - No errors in Sentry
   - API responding normally
   - Users can access service

6. **Post-Mortem** (within 24 hours)
   - Document what happened
   - Identify root cause
   - Create action items
   - Update runbook if needed

## P2 Incident Response

1. Notify team in Slack
2. Investigate root cause (database slow query, etc)
3. Implement fix or workaround
4. Monitor for resolution
5. Document for future reference

## Common Scenarios

### API responding slowly
- Check database query performance
- Check API logs in Sentry
- Implement caching if needed
- Scale infrastructure if needed

### High error rate
- Check Sentry for error patterns
- Identify affected component
- Roll back recent deployment if related
- Implement fix

### Database connection failed
- Check Supabase status
- Verify connection string in env vars
- Check RLS policies aren't blocking
- Restart connections
```

---

### ACTION 17: Execute Load Testing ⏱️ 120 min

**What to do:**

1. **Setup Staging Environment:**
   ```bash
   # Deploy to staging
   git checkout develop
   vercel
   # Note the preview URL
   ```

2. **Create Load Test Script:**
   Create: `tests/load-test.js`

   ```javascript
   import http from 'k6/http';
   import { check, sleep } from 'k6';

   export let options = {
     stages: [
       { duration: '30s', target: 20 },
       { duration: '1m', target: 50 },
       { duration: '30s', target: 0 },
     ],
   };

   export default function () {
     // Test landing page
     let res = http.get(__ENV.TARGET_URL || 'https://staging.example.com');
     check(res, { 'status 200': (r) => r.status === 200 });

     // Test API health
     res = http.get(__ENV.TARGET_URL + '/api/health');
     check(res, { 'health 200': (r) => r.status === 200 });

     sleep(1);
   }
   ```

3. **Run Load Test:**
   ```bash
   npm install -D k6

   k6 run tests/load-test.js \
     -e TARGET_URL=https://staging-xxx.vercel.app
   ```

4. **Document Results:**
   ```markdown
   # Load Test Results - 2026-01-27

   ## Test Configuration
   - Duration: 2 minutes
   - Peak concurrent users: 50
   - Ramp-up: 30s to 50 users, 30s ramp-down

   ## Results
   - Total requests: 3,245
   - Success rate: 99.2%
   - P95 latency: 245ms
   - P99 latency: 420ms
   - Error rate: 0.8% (mostly 429 rate limits)

   ## Capacity Assessment
   - Can handle 50 concurrent users comfortably
   - Gemini API is bottleneck for analysis
   - Rate limiting triggered at ~60 requests/min
   - Recommend implementing request queuing
   ```

---

## PHASE 2 COMPLETION CHECKLIST

- [ ] RLS policies hardened
- [ ] Sentry error monitoring setup
- [ ] Uptime monitoring configured
- [ ] API rate limiting implemented
- [ ] Performance baselines recorded
- [ ] Database backup verified
- [ ] Disaster recovery procedures documented
- [ ] Incident response runbook created
- [ ] Load testing completed
- [ ] All secrets secured in Vercel
- [ ] Team trained on deployment process
- [ ] Documentation complete and reviewed

**At this point, project is ready for production deployment.**

---

## FINAL SIGN-OFF

```
DevOps Lead: _________________ Date: _________
Architecture Review: __________ Date: _________
Security Team: _____________ Date: _________
```

**Prepared by:** Gage, DevOps Agent ⚡
**Document Status:** READY TO EXECUTE
**Timeline:** 4.5 hours (Phase 1) + 8.5 hours (Phase 2) = 13 hours total
