# ALL MAX MIND - DevOps Deployment Guide

**Document Version:** 1.0
**Last Updated:** 2026-01-27
**Prepared for:** DevOps Team
**Project Name:** All Max Mind
**Tagline:** Architect Your Intelligence

---

## TABLE OF CONTENTS
1. [Executive Summary](#executive-summary)
2. [Project Overview](#project-overview)
3. [Technology Stack](#technology-stack)
4. [Architecture](#architecture)
5. [Infrastructure Requirements](#infrastructure-requirements)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [Deployment Process](#deployment-process)
8. [Environment Configuration](#environment-configuration)
9. [Monitoring & Observability](#monitoring--observability)
10. [Security Considerations](#security-considerations)
11. [Scaling & Performance](#scaling--performance)
12. [Troubleshooting](#troubleshooting)
13. [Disaster Recovery](#disaster-recovery)

---

## EXECUTIVE SUMMARY

**ALL MAX MIND** is a production-ready, full-stack AI-powered cognitive analysis platform that helps users solve complex problems using Google Gemini AI. The application follows a 7-stage user journey implemented through a React frontend and Supabase backend, deployed on Vercel serverless infrastructure.

### Key Metrics
- **Frontend Size:** ~1,700 lines of TypeScript/React
- **Bundle Size Target:** < 500KB (gzipped)
- **Build Time:** 30-60 seconds
- **Deployment Platform:** Vercel (serverless)
- **Database:** Supabase PostgreSQL (managed)
- **Primary Region:** Brazil (gru1)

### Deployment Readiness
- ✅ Type-safe (TypeScript strict mode)
- ✅ Tested (Vitest unit tests)
- ✅ Monitored (Sentry integration)
- ✅ Scalable (serverless architecture)
- ⚠️ Security: RLS policies need production hardening

---

## PROJECT OVERVIEW

### Purpose
ALL MAX MIND is a strategic problem-solving platform that leverages Google Gemini AI to:
1. Capture complex problems from users
2. Analyze multi-dimensional impacts
3. Ask adaptive, AI-generated questions
4. Generate intelligent technical blueprints
5. Convert users to leads for follow-up

### User Journey (7 Stages)
```
LANDING
  ↓
PASSIVE_DATA (Analytics init)
  ↓
PROBLEM_INTAKE (Phase 1: Define problem)
  ↓
DIMENSION_SELECTION (Phase 2: Select impact areas)
  ↓
ADAPTIVE_QUESTIONS (Phase 3: Answer AI questions)
  ↓
BLUEPRINT_PREVIEW (Phase 4: View generated solution)
  ↓
LEAD_CAPTURED (Conversion complete)
```

### Business Objectives
- Lead generation and qualification
- User engagement with AI analysis
- High-quality problem-solving insights
- International support (i18n enabled)
- Performance optimization for mobile users

---

## TECHNOLOGY STACK

### Frontend Layer
```
├── React 19.2.4
├── TypeScript 5.3.3 (strict mode)
├── Vite 5.1.0 (build tool)
├── TailwindCSS 3.4.1 (styling)
├── Framer Motion 10.18.0 (animations)
├── React Router (SPA navigation)
├── i18next 23.8.0 (internationalization)
└── Lucide Icons 0.563.0
```

### Backend & Services
```
├── Node.js 18+ (runtime)
├── Vercel Functions (serverless compute)
├── Express.js (implicitly via Vercel)
└── API Routes (REST endpoints)
```

### Data & Storage
```
├── Supabase PostgreSQL 14+
├── PostgREST (auto-generated REST API)
├── Row Level Security (RLS) policies
└── Realtime subscriptions (optional)
```

### AI/LLM Integration
```
├── Google Gemini API (@google/genai ^1.38.0)
├── Gemini 2.5 Flash (text analysis)
├── Gemini 3 Pro (advanced reasoning)
└── JSON schema for structured responses
```

### Monitoring & Observability
```
├── Sentry 10.37.0 (error tracking)
├── Custom health check endpoint (api/health.ts)
├── Performance monitoring scripts
├── Google Analytics (optional)
└── Uptime monitoring
```

### Development Tools
```
├── ESLint (code quality)
├── Vitest 1.2.2 (unit tests)
├── @testing-library/react 14.2.1 (component tests)
└── TypeScript Compiler (type checking)
```

---

## ARCHITECTURE

### System Architecture Diagram
```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  React 19 SPA (Vite)                                │   │
│  │  - Landing → Phase 1 → Phase 2 → Phase 3 → Phase 4 │   │
│  │  - Responsive UI (Mobile-first)                     │   │
│  │  - Framer Motion animations                         │   │
│  │  - i18n multi-language support                      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           ↓ HTTPS
┌─────────────────────────────────────────────────────────────┐
│                    EDGE LAYER (Vercel CDN)                  │
│  - Global cache for static assets                           │
│  - Security headers injection                               │
│  - Request routing to appropriate backend                   │
└─────────────────────────────────────────────────────────────┘
              ↙              ↓              ↘
    ┌────────────┐   ┌──────────────┐   ┌────────────────┐
    │ API Routes │   │ Static Files │   │ Image Optimization│
    │(Serverless)│   │   (1yr cache)│   │  (Automatic)   │
    └────────────┘   └──────────────┘   └────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────┐
│              COMPUTE LAYER (Vercel Functions)               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ api/health.ts          - Health check               │   │
│  │ api/webhooks/*         - External integrations      │   │
│  │ api/ai/*               - AI processing (optional)   │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ Memory: 1024 MB | Timeout: 10s | Region: gru1      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
         ↓ HTTPS
┌─────────────────────────────────────────────────────────────┐
│           EXTERNAL SERVICES                                 │
│  ┌──────────────┐  ┌──────────┐  ┌──────────────┐         │
│  │ Supabase     │  │ Gemini   │  │ Sentry       │         │
│  │ PostgreSQL   │  │ AI API   │  │ Error Track  │         │
│  └──────────────┘  └──────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

**Phase 1: Problem Intake**
```
User Input → React Component → Store (State) → Supabase (problems table)
```

**Phase 2: Dimension Selection**
```
User Selection → Store → Supabase (dimensions table)
```

**Phase 3: Adaptive Questions**
```
Store Problem Data → Gemini API → Generate Questions → Display → Store Answers (questions_answers table)
```

**Phase 4: Blueprint Generation**
```
All Data Collected → Gemini API → Generate Blueprint → Lead Capture → Supabase (leads table)
```

### Component Architecture

**Top-Level Structure**
```
App.tsx (State Machine - 7 stages)
├── LandingPage (Hero + CTA)
├── Phase1/ProblemIntake (Problem definition)
├── Phase2/DimensionSelection (Multi-select)
├── Phase3/AdaptiveQuestions (Q&A loop)
├── Phase4/BlueprintPreview (Results display)
├── Analytics/CookieConsent (Privacy)
├── PerformanceDashboard (Admin only)
└── UI Components (Reusable)
```

**Service Architecture**
```
lib/
├── ai/
│   ├── api.ts (Gemini API wrapper)
│   ├── blueprint.ts (Blueprint generation)
│   └── questions/engine.ts (Question generation)
├── supabase/
│   ├── problems.ts (CRUD for problems)
│   ├── dimensions.ts (CRUD for dimensions)
│   ├── answers.ts (CRUD for Q&A)
│   └── leads.ts (CRUD for leads)
├── leads/
│   └── manager.ts (Lead scoring & tracking)
├── monitoring/
│   └── sentry.ts (Error & performance tracking)
├── validation/
│   └── problem.ts (Input validation)
└── analytics/
    └── tracking.ts (Event tracking)
```

---

## INFRASTRUCTURE REQUIREMENTS

### Deployment Infrastructure

| Component | Service | Configuration | Cost |
|-----------|---------|---------------|------|
| **Frontend Hosting** | Vercel | Serverless, auto-scaling | Free/Pro |
| **Database** | Supabase PostgreSQL | Managed, auto-scaling | $25-500+/mo |
| **CDN** | Vercel Edge | Global distribution | Included |
| **Error Tracking** | Sentry | Real-time monitoring | Free/$29+/mo |
| **AI API** | Google Gemini | Pay-per-token | $0.075-1.50/mtok |
| **Storage** | Supabase S3 | Object storage (optional) | $5+/mo |
| **Email Service** | SendGrid/AWS SES | Transactional emails | $10-100+/mo |

### Server Requirements (Vercel)

**Frontend Server**
- **Auto-scaling:** Vercel handles automatically
- **Memory per function:** 1024 MB
- **Execution timeout:** 10 seconds
- **Concurrency:** Unlimited (auto-scale)
- **Region:** Brazil (gru1)

**Database Server (Supabase)**
- **Type:** PostgreSQL 14+
- **Managed:** Fully managed by Supabase
- **Scaling:** Auto-scaling on demand
- **Backup:** Automated daily backups
- **High Availability:** Optional (Enterprise)

### Network Requirements

- **Bandwidth:** Auto-scaled
- **HTTPS:** Enforced (automatic with Vercel)
- **SSL Certificate:** Auto-renewed (Vercel)
- **DNS:** Vercel DNS or custom
- **Regions:** Primary (gru1), global distribution via CDN

### Storage Requirements

- **Static Assets:** ~500 KB (gzipped)
- **Database:** Depends on usage
  - Starter: ~1 GB
  - Scale: As needed
- **Logs (Sentry):** Kept for 90 days (default)

---

## CI/CD PIPELINE

### Recommended CI/CD Architecture

```
┌─────────────────┐
│   Git Push to   │
│   main/develop  │
└────────┬────────┘
         ↓
    ┌────────────────────────────────┐
    │   GitHub Actions / Vercel      │
    │   Automatic Build Trigger      │
    └────┬─────────────────────────┬──┘
         ↓                         ↓
    ┌──────────────┐       ┌──────────────┐
    │ Install Deps │       │   Lint       │
    │ Type Check   │       │   Tests      │
    │ Build        │       │   Security   │
    └────┬─────────┘       └──────┬───────┘
         ↓                        ↓
    ┌────────────────────────────────┐
    │  Tests Pass? Build Success?    │
    │  Security Check OK?            │
    └────┬──────────────┬────────────┘
         │              │
      YES│              │NO
         ↓              ↓
    ┌─────────┐   ┌──────────┐
    │ Deploy  │   │ Notify   │
    │ Preview │   │ Dev Team │
    │ → Prod  │   │ & Fail   │
    └────┬────┘   └──────────┘
         ↓
    ┌──────────────────┐
    │  Run Health Check│
    │  Smoke Tests     │
    │  Monitor        │
    └──────────────────┘
```

### GitHub Actions Workflow (Recommended)

Create `.github/workflows/deploy.yml`:

```yaml
name: Build & Deploy

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Type Check
        run: npm run typecheck

      - name: Lint
        run: npm run lint

      - name: Run Tests
        run: npm test

      - name: Build
        run: npm run build
        env:
          VITE_GEMINI_API_KEY: ${{ secrets.VITE_GEMINI_API_KEY }}
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}

      - name: Deploy to Vercel
        uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          production: ${{ github.ref == 'refs/heads/main' }}
```

### Vercel Native CI/CD

If using Vercel's native CI/CD:
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Configure build settings:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Automatic deployments on push:
   - Preview deployments on PRs
   - Production deployment on main/production branch merge

### Pre-deployment Checks

```bash
# Local validation before pushing
npm run typecheck    # TypeScript validation
npm run lint         # Code quality
npm test             # Unit tests
npm run build        # Production build
npm run security:audit  # Vulnerability check
```

---

## DEPLOYMENT PROCESS

### Step-by-Step Deployment Guide

#### **1. Prerequisites**
- [ ] Git repository access
- [ ] Vercel project created
- [ ] GitHub Actions secrets configured (if using GitHub Actions)
- [ ] Environment variables prepared
- [ ] Supabase project created
- [ ] Database schema applied

#### **2. Environment Setup**

**Create/Update Environment Variables in Vercel:**

```
# Gemini AI Configuration
VITE_GEMINI_API_KEY=your_gemini_api_key

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Error Tracking (Sentry)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project_id

# Optional: Other integrations
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
```

#### **3. Database Initialization**

```bash
# Connect to Supabase
supabase login

# Apply schema
psql -h db.supabase.co -U postgres -d postgres < supabase/schema.sql

# Or use Supabase CLI
supabase db push
```

#### **4. Deploy to Vercel**

**Option A: GitHub Push (Recommended)**
```bash
git add .
git commit -m "Deploy to production"
git push origin main
# Vercel automatically deploys
```

**Option B: Vercel CLI**
```bash
npm install -g vercel
vercel --prod
```

**Option C: Vercel Dashboard**
1. Go to Vercel dashboard
2. Select project
3. Click "Deploy"
4. Select branch (main)
5. Review settings
6. Click "Deploy"

#### **5. Post-Deployment Validation**

```bash
# Health check endpoint
curl https://your-domain.vercel.app/api/health

# Response should be:
{
  "status": "ok",
  "timestamp": "2026-01-27T...",
  "services": {
    "api": "ok",
    "database": "ok",
    "cache": "ok",
    "memory": "ok"
  }
}
```

#### **6. Smoke Tests**

Run basic smoke tests:
```bash
# Test landing page loads
curl -I https://your-domain.vercel.app/
# Should return 200

# Test API endpoints
curl https://your-domain.vercel.app/api/health

# Monitor Sentry
# Check https://sentry.io/ for any errors
```

### Rollback Procedure

**If deployment fails:**

```bash
# Option 1: Revert in Vercel UI
# 1. Go to Deployments
# 2. Click previous successful deployment
# 3. Click "Redeploy"

# Option 2: Git rollback
git revert HEAD
git push origin main
# Vercel redeploys

# Option 3: Vercel CLI
vercel rollback
```

### Blue-Green Deployment Strategy

For zero-downtime deployments:

```
Current Production (Blue)
├── Domain: app.maxmind.com
├── Vercel: [current-deployment]
└── Active Traffic: 100%

New Deployment (Green)
├── Domain: preview-[hash].vercel.app
├── Vercel: [new-deployment]
└── Active Traffic: 0% (testing only)

After Verification:
- Update DNS/vercel.json to point to Green
- Monitor for errors
- Keep Blue as fallback for quick rollback
```

---

## ENVIRONMENT CONFIGURATION

### Environment Variables Structure

**Frontend Variables** (prefixed with `VITE_` - exposed to client)
```
VITE_GEMINI_API_KEY        # Google Gemini API key
VITE_SUPABASE_URL          # Supabase project URL
VITE_SUPABASE_ANON_KEY     # Supabase anonymous key (public)
```

**Backend Variables** (private, server-side only)
```
SUPABASE_SERVICE_ROLE_KEY  # Supabase admin key (DO NOT expose to client)
SENTRY_DSN                 # Sentry error tracking
SENTRY_AUTH_TOKEN          # Sentry release tracking
SENTRY_ORG                 # Sentry organization
SENTRY_PROJECT             # Sentry project name
```

**Optional Integration Variables**
```
NEXT_PUBLIC_ANALYTICS_ID   # Google Analytics or similar
WEBHOOK_SECRET             # For webhook validation
EXTERNAL_API_KEY           # For third-party integrations
```

### Vercel Secrets Management

**Best Practices:**
1. Use Vercel's native secrets in project settings
2. Rotate API keys quarterly
3. Use service role key only on backend
4. Never commit `.env` to Git
5. Use `.env.example` template for documentation

### Local Development Environment

Create `.env.local`:
```
VITE_GEMINI_API_KEY=your_dev_key
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=your_dev_service_role_key
SENTRY_DSN=
```

---

## MONITORING & OBSERVABILITY

### Real-Time Monitoring Stack

```
┌──────────────────────────────────────────────────────┐
│             MONITORING DASHBOARD                     │
│  Vercel Status → Sentry → Custom Health Checks      │
└──────────────────────────────────────────────────────┘
         ↓              ↓              ↓
  ┌──────────┐  ┌──────────┐  ┌───────────┐
  │ Vercel   │  │ Sentry   │  │ Custom    │
  │ Metrics  │  │ Errors   │  │ Endpoint  │
  └──────────┘  └──────────┘  └───────────┘
```

### Sentry Integration

**Setup:**
1. Create account at https://sentry.io/
2. Create project for "React" platform
3. Get DSN from Settings → Projects
4. Add to Vercel secrets: `SENTRY_DSN`

**Monitoring Captures:**
- Uncaught errors
- Performance metrics (slow transactions)
- Release tracking
- User sessions
- Breadcrumbs (user actions)

**Alert Rules:**
- Error rate > 5%: Immediate notification
- Performance: P95 > 3s: Daily report
- New issues: Immediate notification

**Example Sentry Dashboard Checks:**
```
Errors by Page:
├── Landing Page: 2 errors
├── Phase 1 (Problem Intake): 8 errors
├── Phase 3 (Questions): 15 errors
├── Phase 4 (Blueprint): 3 errors
└── API Health: 0 errors

Performance:
├── Slowest Transaction: /phase-3 (2.3s)
├── API Response Time: 450ms avg
├── Page Load Time: 1.8s avg
└── Largest JS Bundle: 456 KB
```

### Health Check Endpoint

**Endpoint:** `GET /api/health`

**Purpose:** Continuous monitoring of system health

**Response Structure:**
```json
{
  "status": "ok|degraded|down",
  "timestamp": "2026-01-27T14:30:00Z",
  "services": {
    "api": {
      "status": "ok|down",
      "responseTime": 45
    },
    "database": {
      "status": "ok|down",
      "responseTime": 120
    },
    "cache": {
      "status": "ok|down",
      "hitRate": 0.85
    },
    "memory": {
      "status": "ok|warning",
      "usage": 512,
      "limit": 1024
    }
  },
  "uptime": 604800,
  "version": "1.0.0"
}
```

**Monitoring Frequency:**
- Frequency: Every 5 minutes
- Tool: Uptime monitoring service (e.g., Pingdom, Datadog)
- Alert threshold: > 3 consecutive failures

### Performance Monitoring

**Key Metrics to Track:**

| Metric | Target | Tool | Alert Threshold |
|--------|--------|------|-----------------|
| Page Load Time | < 2s | Vercel/Sentry | > 3s |
| Time to Interactive | < 3s | Vercel/Sentry | > 4s |
| Largest Contentful Paint | < 2.5s | Web Vitals | > 3s |
| Cumulative Layout Shift | < 0.1 | Web Vitals | > 0.15 |
| First Input Delay | < 100ms | Web Vitals | > 150ms |
| API Response Time | < 500ms | Sentry | > 1000ms |
| Error Rate | < 1% | Sentry | > 5% |
| Database Query Time | < 100ms | Custom | > 200ms |

### Custom Analytics Events

Track user behavior:
```
- problem_submitted
- phase_completed
- dimension_selected
- question_answered
- blueprint_generated
- lead_captured
- error_occurred
```

### Alerts Configuration

**Critical Alerts:**
```
1. Error rate > 5% → Immediate Slack notification
2. API health check fails 3 times → Page on-call
3. Database connection lost → Immediate page + SMS
4. Memory usage > 80% → Scaling alert
5. Deployment failure → Auto-rollback attempt
```

**Warning Alerts:**
```
1. Performance degradation (P95 > 2x baseline) → Slack notification
2. Error spike (2x previous hour average) → Slack notification
3. Unusual traffic pattern → Daily report
```

---

## SECURITY CONSIDERATIONS

### HTTPS & Transport Security
- ✅ Enforced HTTPS on all connections
- ✅ Automatic SSL certificate renewal (Vercel)
- ✅ TLS 1.3 support
- ✅ HSTS headers configured

### Environment Variables & Secrets

**DO:**
- ✅ Store secrets in Vercel environment variables
- ✅ Use service role key only on backend
- ✅ Rotate API keys quarterly
- ✅ Use environment-specific variables (dev/staging/prod)

**DO NOT:**
- ❌ Commit .env files to Git
- ❌ Expose service role key to frontend
- ❌ Log sensitive data
- ❌ Use same keys across environments

### Row Level Security (RLS) Policies

**Current State:** ⚠️ Too permissive for production

**Tables Requiring RLS Hardening:**
```sql
-- Before (OPEN TO PUBLIC - DEMO ONLY)
CREATE POLICY "public" ON problems
  FOR SELECT USING (true);

-- After (PRODUCTION - SESSION BASED)
CREATE POLICY "users_own_records" ON problems
  FOR SELECT USING (auth.uid() = user_id);
```

**Production RLS Implementation:**

```sql
-- 1. Add user reference to tables
ALTER TABLE problems ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE dimensions ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE questions_answers ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE leads ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- 2. Enable RLS
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE dimensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- 3. Create policies
CREATE POLICY "users_see_own_problems" ON problems
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_problems" ON problems
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Apply similar policies to other tables...
```

### API Security

**Implemented Headers:**
```
X-Frame-Options: DENY                    # Prevent clickjacking
X-Content-Type-Options: nosniff          # Prevent MIME type sniffing
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Content-Security-Policy: default-src 'self'; script-src 'self' 'wasm-unsafe-eval'
```

**Rate Limiting (Recommended):**
```javascript
// Per IP: 100 requests/minute
// Per user: 1000 requests/hour
// Per API endpoint: 50 requests/minute
```

### Data Protection

**Encryption:**
- ✅ In-transit: TLS 1.3
- ✅ At-rest: Supabase encryption (optional, enable for compliance)
- ✅ Sensitive fields: Consider field-level encryption for PII

**PII Handling:**
- Leads table contains: email, name, phone, company
- Store minimal data (GDPR, CCPA compliance)
- Implement data retention policy (30-90 days)
- Enable audit logging for PII access

### Dependency Security

**Regular Audits:**
```bash
npm audit --audit-level=high
# Run weekly

npm update
# Run monthly for non-breaking updates

npm outdated
# Review for deprecated packages
```

**Vulnerability Scanning:**
- GitHub Dependabot: Automatic PRs for security updates
- Snyk: Continuous vulnerability monitoring
- npm audit: Manual security audits

### CORS Configuration

**Allowed Origins:**
```
Production:   https://maxmind.com
Staging:      https://staging.maxmind.com
Dev:          http://localhost:3000
```

**CORS Headers:**
```
Access-Control-Allow-Origin: https://maxmind.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400
```

---

## SCALING & PERFORMANCE

### Horizontal Scaling Strategy

**Frontend (Vercel):**
- Automatic scaling via serverless functions
- No manual configuration needed
- Can handle thousands of concurrent users

**Database (Supabase):**
- Connection pooling: Up to 200 concurrent connections
- Scaling by plan: Starter (10GB) → Pro (250GB) → Enterprise (custom)

**Recommended Scaling Plan:**
```
Phase 1 (0-1K users/day)     → Vercel Free, Supabase Starter
Phase 2 (1K-10K users/day)   → Vercel Pro, Supabase Pro
Phase 3 (10K-100K users/day) → Vercel Team, Supabase Business
Phase 4 (100K+ users/day)    → Vercel Enterprise, Supabase Enterprise
```

### Performance Optimization

**Frontend Optimization:**
- ✅ Code splitting: Vite automatic
- ✅ Lazy loading: React.lazy() for routes
- ✅ Image optimization: Use next/image equivalent
- ✅ CSS minification: Vite built-in
- ✅ Bundle analysis: `npm run build && npm run analyze-bundle`

**Backend Optimization:**
- ✅ Query optimization: Index critical columns
- ✅ Connection pooling: Supabase handles
- ✅ Caching: Redis/Memcache for high-traffic queries
- ✅ CDN: Vercel edge caching

**Database Optimization:**
```sql
-- Create indexes on frequently queried columns
CREATE INDEX idx_problems_user_id ON problems(user_id);
CREATE INDEX idx_dimensions_problem_id ON dimensions(problem_id);
CREATE INDEX idx_questions_problem_id ON questions_answers(problem_id);
CREATE INDEX idx_leads_status ON leads(lead_status);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM problems WHERE user_id = $1;
```

### Caching Strategy

**Browser Caching:**
- Static assets (JS/CSS): 1 year (immutable)
- HTML: No cache (always validate)
- Images: 1 year

**CDN Caching (Vercel Edge):**
- Dynamic content: Cache-Control: public, max-age=60
- API responses: Cache-Control: private, max-age=0

**Application Caching:**
```javascript
// Cache API responses in memory
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedData(key) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data;
  }
  return null;
}
```

### Load Testing

**Recommended Tool:** Apache JMeter, K6, or Artillery

```bash
# Example: Test with 100 concurrent users for 10 minutes
k6 run --vus 100 --duration 10m loadtest.js

# Check metrics:
# - Success rate: > 95%
# - P95 latency: < 2s
# - Error rate: < 5%
```

---

## TROUBLESHOOTING

### Common Issues & Solutions

#### **1. Build Fails with TypeScript Error**
```
ERROR: Type 'any' is not assignable to type 'string'

Solution:
1. Run: npm run typecheck
2. Fix types in reported files
3. If using third-party lib without types: npm install @types/package-name
4. Redeploy
```

#### **2. Database Connection Timeout**
```
ERROR: ECONNREFUSED - Connection refused at Supabase

Solution:
1. Check VITE_SUPABASE_URL is correct
2. Verify VITE_SUPABASE_ANON_KEY is valid
3. Check Supabase project is active (not paused)
4. Test connection: curl https://your-project.supabase.co/rest/v1/
5. If using VPN: Whitelist IP in Supabase network settings
```

#### **3. Gemini API Returns 429 (Rate Limited)**
```
ERROR: Too many requests to Gemini API

Solution:
1. Check API quota in Google Cloud Console
2. Implement exponential backoff retry logic
3. Add request queuing mechanism
4. Consider batch processing for multiple requests
5. Upgrade plan if needed
```

#### **4. Sentry Not Recording Errors**
```
ERROR: Errors not appearing in Sentry dashboard

Solution:
1. Verify SENTRY_DSN is set correctly
2. Check if error sampling is too aggressive: setSampleRate(1.0)
3. Verify HTTPS is working (Sentry blocks HTTP)
4. Check browser console for Sentry errors
5. Test manually: throw new Error('test')
```

#### **5. Vercel Deployment Hangs**
```
ERROR: Deployment stuck at "Analyzing build"

Solution:
1. Check build logs in Vercel dashboard
2. Increase build timeout: 600s → 900s in vercel.json
3. Clear Vercel cache: Settings → Data → Clear cache
4. Try manual redeploy
5. Check for infinite loops in build process
```

#### **6. Memory Usage Spike in Production**
```
ERROR: 70%+ memory usage, degraded performance

Solution:
1. Analyze with heap snapshot in Sentry
2. Check for memory leaks: Event listeners not cleaned up
3. Optimize large data structures
4. Increase Vercel function memory: 1024MB → 3008MB
5. Implement data pagination for large queries
```

### Debug Mode

Enable verbose logging:
```javascript
// In app initialization
if (process.env.DEBUG_MODE === 'true') {
  console.log = (...args) => {
    console.info('[DEBUG]', ...args);
  };
}
```

Enable in Vercel:
```
Environment Variable: DEBUG_MODE=true
```

### Health Check Debugging

```bash
# Check API health
curl -v https://your-domain.vercel.app/api/health

# Check with custom headers
curl -H "User-Agent: MonitoringService" \
     https://your-domain.vercel.app/api/health

# Check response time
time curl https://your-domain.vercel.app/api/health

# Check DNS resolution
nslookup your-domain.vercel.app
```

---

## DISASTER RECOVERY

### Backup & Recovery Strategy

**Database Backups:**
- Supabase handles automatic daily backups (30 days retention)
- Backups stored in multiple regions
- Point-in-time recovery available (PITR)

**Point-in-Time Recovery (PITR):**
```
Backup Schedule:
├── Hourly backups: Last 24 hours
├── Daily backups: Last 30 days
└── Weekly backups: Last 180 days
```

**Manual Backup (SQL Export):**
```bash
pg_dump \
  --host db.supabase.co \
  --username postgres \
  --password \
  --format custom \
  postgres > backup-2026-01-27.sql

# To restore:
pg_restore \
  --host db.supabase.co \
  --username postgres \
  --password \
  --dbname postgres \
  backup-2026-01-27.sql
```

### Disaster Recovery Procedures

#### **Scenario 1: Database Corruption**
```
1. Check Sentry for error patterns
2. Identify affected tables using:
   SELECT * FROM information_schema.tables WHERE table_schema='public'
3. Restore from PITR:
   - Supabase Dashboard → Backups → Restore
   - Select timestamp before corruption occurred
4. Verify data integrity post-restore
5. Run health checks
6. Monitor for recurring issues
```

#### **Scenario 2: Accidental Data Deletion**
```
1. Stop application immediately (if possible)
2. Identify deletion time from Sentry timestamps
3. Use PITR to restore to point before deletion
4. Supabase Dashboard → Backups → Restore
5. Restore to new database if possible, then migrate back
6. Verify data completeness
7. Re-deploy if needed
```

#### **Scenario 3: Production Outage**
```
1. Alert paging: Page on-call DevOps engineer
2. Check Vercel status dashboard
3. Check Supabase status dashboard
4. If Vercel issue:
   - Rollback to last known good deployment
   - Check Vercel logs for deployment errors
5. If Supabase issue:
   - Check connection limits haven't been exceeded
   - Verify RLS policies aren't blocking queries
   - Contact Supabase support if outage continues
6. Implement temporary workarounds if needed
7. Post-incident: Root cause analysis
```

#### **Scenario 4: Security Breach**
```
1. Rotate all API keys immediately:
   - Gemini API key
   - Supabase anon key
   - Supabase service role key
   - Sentry DSN
2. Audit access logs in Sentry
3. Check for unauthorized API calls
4. Review RLS policies for misconfigurations
5. Force password reset for admin accounts
6. Enable 2FA for all accounts
7. File security incident report
8. Notify affected users if needed
```

### Recovery Time Objectives (RTO)

| Scenario | RTO | Recovery Steps |
|----------|-----|-----------------|
| Frontend deployment failure | 15 min | Rollback via Vercel UI |
| Database unavailable | 30 min | Failover to backup region (Enterprise only) |
| API rate limited | 5 min | Implement rate limit backoff |
| Sentry outage | 24 hours | Deploy with degraded monitoring |
| Complete data loss | 24 hours | Restore from backup |

### Recovery Point Objectives (RPO)

| Component | RPO | Strategy |
|-----------|-----|----------|
| Database | 1 hour | Hourly automated backups |
| Application code | 0 min | Git repository (immutable) |
| Configuration | 30 min | Environment variables stored separately |
| Secrets | Immediate | Rotated immediately upon compromise |

---

## DEPLOYMENT CHECKLIST

### Pre-Deployment

- [ ] All tests passing: `npm test`
- [ ] Type checking passing: `npm run typecheck`
- [ ] Linting passing: `npm run lint`
- [ ] Security audit passed: `npm audit --audit-level=high`
- [ ] Build successful locally: `npm run build`
- [ ] Environment variables configured in Vercel
- [ ] Database schema up-to-date
- [ ] Backup created before deployment

### Deployment

- [ ] Branch merged to main
- [ ] GitHub Actions triggered automatically
- [ ] Build completed successfully
- [ ] Tests passed in CI/CD
- [ ] Deployment to Vercel completed
- [ ] Preview URL tested
- [ ] Promoted to production

### Post-Deployment

- [ ] Health check endpoint returns 200
- [ ] Landing page loads successfully
- [ ] Phase 1 form submissions working
- [ ] Database queries successful
- [ ] Sentry receiving events
- [ ] No critical errors in Sentry
- [ ] Performance metrics normal
- [ ] Monitor for 24 hours

---

## CONTACTS & ESCALATION

### Key Contacts

| Role | Contact | Escalation |
|------|---------|-----------|
| **Vercel Support** | support@vercel.com | Priority: 15 min |
| **Supabase Support** | support@supabase.com | Priority: 1 hour |
| **Google Cloud Support** | support@google.com | Priority: 4 hours |
| **Sentry Support** | support@sentry.io | Priority: 24 hours |
| **On-Call DevOps** | [PagerDuty Link] | 24/7 |

### Escalation Matrix

```
Tier 1 (Application): First response within 15 min
  - Vercel deployment issues
  - Frontend errors < 1%
  - Performance degradation
  → Action: Rollback, restart, investigate

Tier 2 (Infrastructure): First response within 30 min
  - Database connection issues
  - Memory/CPU spikes
  - API rate limiting
  → Action: Scale, optimize, contact provider

Tier 3 (External Services): First response within 1 hour
  - Gemini API outage
  - Supabase downtime
  - Third-party service failures
  → Action: Failover, contact vendor, implement workarounds

Critical (P1): Immediate response required
  - Complete service outage (> 1 hour)
  - Data loss occurring
  - Security breach detected
  → Action: War room, escalate to leadership
```

---

## APPENDIX

### A. Useful Commands

```bash
# Development
npm install              # Install dependencies
npm run dev             # Start dev server on :3000
npm run typecheck       # Check TypeScript types
npm run lint            # Run ESLint
npm test                # Run tests with coverage
npm run build           # Production build

# Vercel CLI
npm install -g vercel   # Install Vercel CLI
vercel login            # Authenticate with Vercel
vercel                  # Deploy to preview
vercel --prod           # Deploy to production
vercel env list         # Show environment variables
vercel logs             # Stream production logs
vercel rollback         # Rollback to previous deployment

# Database
supabase login          # Login to Supabase CLI
supabase db pull        # Pull schema changes
supabase db push        # Push schema changes
supabase db reset       # Reset to migrations
```

### B. File Structure

```
.
├── src/                           # Application source
│   ├── components/                # React components
│   ├── lib/                       # Business logic
│   ├── services/                  # Service layer
│   ├── App.tsx                    # Root component
│   └── index.tsx                  # Entry point
├── api/                           # Vercel serverless functions
├── supabase/                      # Database config
│   └── schema.sql                 # Database schema
├── docs/                          # Documentation
├── .github/workflows/             # CI/CD pipelines
├── package.json                   # Dependencies
├── vite.config.ts                 # Vite configuration
├── tsconfig.json                  # TypeScript config
├── vercel.json                    # Vercel config
└── .env.example                   # Environment template
```

### C. Important URLs

```
Application:       https://maxmind.com (production)
Vercel Dashboard:  https://vercel.com/dashboard
Supabase Console:  https://app.supabase.com
Sentry Dashboard:  https://sentry.io/organizations/your-org
Google Cloud:      https://console.cloud.google.com
GitHub Repo:       https://github.com/your-org/all-max-mind
```

---

## DOCUMENT HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-27 | DevOps Lead | Initial documentation |

---

**Last Updated:** 2026-01-27
**Next Review:** 2026-04-27
**Document Owner:** DevOps Team
