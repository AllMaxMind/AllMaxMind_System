# 🚀 Localhost Setup & Testing Guide
## All Max Mind System - Sprint 1 Implementation

**Last Updated:** 2026-01-28 | **QA Status:** ✅ APPROVED

---

## 📋 Pre-requisites

### Required:
- [x] Node.js 18+ (`node --version`)
- [x] npm 9+ (`npm --version`)
- [x] Supabase CLI (`brew install supabase/tap/supabase`)
- [x] Git configured

### Supabase Project:
- Project URL: `https://your-project.supabase.co`
- Anon Key: Available in Supabase Dashboard → API Settings
- Service Role Key: Same location

### APIs:
- Gemini API Key: From Google AI Studio
- (Optional) OpenAI API: From OpenAI Dashboard

---

## 🔧 Setup Steps

### 1. Clone & Install
```bash
cd /path/to/All_Max_Mind_System
npm install
```

### 2. Configure Environment

Create `.env.local`:
```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Gemini API (Backend - Supabase Secrets)
GEMINI_API_KEY=your-gemini-key-here

# Google Analytics (Optional)
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# Sentry (Optional)
SENTRY_DSN=your-sentry-dsn-here
```

### 3. Deploy Database Migrations

```bash
# Link Supabase project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push

# Or run directly on Supabase Dashboard:
# - Go to SQL Editor
# - Create new query
# - Paste each migration file (00001 → 00008)
```

**Migrations to deploy (in order):**
1. `supabase/migrations/00001_enable_pgvector.sql` - Enable vector search
2. `supabase/migrations/00002_create_problem_embeddings.sql` - Embeddings table
3. `supabase/migrations/00003_create_tracking_tables.sql` - Visitors & sessions
4. `supabase/migrations/00004_create_effective_questions.sql` - RAG data moat
5. `supabase/migrations/00005_create_blueprints.sql` - Blueprint storage
6. `supabase/migrations/00006_create_lead_analytics_view.sql` - Analytics view
7. `supabase/migrations/00007_add_updated_at_triggers.sql` - Auto timestamps
8. `supabase/migrations/00008_performance_optimization.sql` - Indexes & vacuum

### 4. Configure Supabase Secrets

In Supabase Dashboard → Project Settings → Secrets:

Add:
```
GEMINI_API_KEY=your-gemini-key-here
```

This key is used by Edge Functions.

### 5. Deploy Edge Functions

```bash
# Deploy analyze-problem function
supabase functions deploy analyze-problem

# Deploy/Update generate-questions function
supabase functions deploy generate-questions

# Verify deployment
supabase functions list
```

**Expected output:**
```
 NAME                         SLUG                        STATUS   VERSION
 analyze-problem              analyze-problem             ACTIVE   1
 generate-questions           generate-questions          ACTIVE   1
```

### 6. Start Development Server

```bash
npm run dev
```

**Expected output:**
```
  VITE v5.4.21  ready in 350 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

Open http://localhost:5173 in your browser.

---

## 🧪 Testing Complete Flow (Phases 0-4)

### Phase 0: Passive Data Layer
**What happens automatically:**
- ✅ Visitor ID created (localStorage)
- ✅ Session ID created (sessionStorage)
- ✅ Data persisted to `visitors` table
- ✅ Activity tracking to `sessions` table

**How to verify:**
```bash
# In Supabase Dashboard:
# Table: visitors
SELECT COUNT(*) FROM visitors; -- Should be > 0 after page load

# Table: sessions
SELECT COUNT(*) FROM sessions; -- Should be > 0
```

---

### Phase 1: Problem Intake ✅ NEW - NLP Real + Embeddings

**User Flow:**
1. Click on "Defina o problema" card
2. Type problem description (or click "VER EXEMPLO COMPLETO")
3. Click "ANALISAR MINHA DOR COM IA"

**What happens:**
- ✅ Frontend validates input (minimum 50 characters)
- ✅ Rate limit check (5 minutes between submissions)
- ✅ Calls `analyze-problem` Edge Function
- ✅ Gemini Pro analyzes: domain, persona, intentScore, emotionalTone, complexity
- ✅ Generates 384-dimensional embedding via `text-embedding-004`
- ✅ Saves problem + embedding to Supabase

**Example problem:**
```
Nossa empresa sofre com atrasos constantes na importação de componentes eletrônicos
da China. O processo atual é todo manual em Excel: a equipe de compras internacionais
cria uma planilha com os produtos, valores e prazos, mas frequentemente há erros nos
cálculos de impostos (II, IPI, PIS/COFINS) que só são descobertos na hora do
desembaraço aduaneiro. A equipe financeira precisa refazer todos os cálculos, e a
produção fica parada esperando os componentes.
```

**How to verify:**
```bash
# Check problems table
SELECT id, raw_text, domain, persona, intent_score, analysis_completed
FROM problems
ORDER BY created_at DESC LIMIT 1;

# Check embeddings (384 dimensions)
SELECT problem_id, array_length(embedding, 1) as embedding_dims
FROM problem_embeddings
ORDER BY created_at DESC LIMIT 1;
-- Should return: embedding_dims = 384
```

**Browser Console:**
```javascript
// Check localStorage
console.log(localStorage.getItem('am_visitor_id'));
console.log(sessionStorage.getItem('am_session_id'));
```

---

### Phase 2: Dimension Selection

**User Flow:**
1. After Phase 1, see dimension selection UI
2. Select dimensions (Technical, Business, Resource, etc.)
3. Click "PRÓXIMO"

**What happens:**
- ✅ Saves dimension selections to `dimensions` table
- ✅ Updates problem with refined score

**How to verify:**
```bash
# Check dimensions
SELECT problem_id, dimension_name, selected_value
FROM dimensions
WHERE problem_id = 'your-problem-id';
```

---

### Phase 3: Adaptive Questions ✅ NEW - RAG + Adaptive Count

**User Flow:**
1. After Phase 2, see adaptive questions
2. Answer each question in the textarea
3. Click "PRÓXIMO" to continue

**What happens:**
- ✅ Calls `generate-questions` Edge Function
- ✅ RAG: Fetches effective_questions from data moat
- ✅ Adaptive count:
  - intent_score < 30: 3-4 questions
  - intent_score 30-70: 5-7 questions
  - intent_score > 70: 8-9 questions
- ✅ Avoids repetition by mentioning effective_questions in prompt
- ✅ Saves answers to `questions_answers` table

**How to verify:**
```bash
# Check questions saved
SELECT question_id, question_text, answer_text, category
FROM questions_answers
WHERE problem_id = 'your-problem-id';
```

**Browser Network Tab:**
```
POST /functions/v1/generate-questions
Response: {
  "questions": [
    {
      "id": "q_1",
      "text": "...",
      "category": "context|process|pain|technical|scale",
      "isCritical": true/false,
      "explanation": "...",
      "example": "..."
    }
  ]
}
```

---

### Phase 4: Blueprint Preview & Lead Capture

**User Flow:**
1. After Phase 3, see blueprint preview
2. Blueprint content (requires login to see full content)
3. Login with:
   - Google OAuth (if configured)
   - Magic Link (email-based)
4. Fill lead form:
   - Name
   - Email
   - Company
   - Project size estimate
   - Marketing opt-in
5. Click "ENVIAR"

**What happens:**
- ✅ Generates blueprint via Gemini Pro
- ✅ Authenticates user (or creates guest session)
- ✅ Saves lead to `leads` table
- ✅ Auto-scores lead (50-100 based on answers)
- ✅ Email confirmation (stub - just returns success)

**How to verify:**
```bash
# Check leads
SELECT id, email, name, company, lead_score, lead_status
FROM leads
ORDER BY created_at DESC LIMIT 1;

# Check blueprints
SELECT id, problem_id, title, project_size, estimated_investment
FROM blueprints
ORDER BY created_at DESC LIMIT 1;
```

---

## 📊 Validation Checklist

After completing all 5 phases, verify:

### Data Persistence (Supabase)
- [ ] `visitors` table has records
- [ ] `sessions` table has records
- [ ] `problems` table has your problem
- [ ] `problem_embeddings` table has 384-dim embedding
- [ ] `dimensions` table has your selections
- [ ] `questions_answers` table has your answers
- [ ] `leads` table has your lead submission
- [ ] `blueprints` table has generated blueprint

### Frontend Features
- [ ] Phase 0: Visitor ID shown in localStorage
- [ ] Phase 1: NLP analysis completes (not instant)
- [ ] Phase 2: Dimension selection saves
- [ ] Phase 3: Questions adapt to intent score
- [ ] Phase 4: Blueprint preview visible
- [ ] Phase 4: Lead form submits successfully

### Analytics
- [ ] Browser console shows `[Analytics]` logs
- [ ] GA4 events sent (if GA ID configured)
- [ ] Sentry errors reported (if DSN configured)

### Performance
- [ ] Page load < 3 seconds
- [ ] Phase 1 NLP analysis < 10 seconds
- [ ] Phase 3 question generation < 5 seconds
- [ ] Phase 4 blueprint generation < 10 seconds

---

## 🐛 Troubleshooting

### "GEMINI_API_KEY not configured"
**Problem:** Edge Functions can't access Gemini API key
**Solution:**
1. Go to Supabase Dashboard → Project Settings → Secrets
2. Add: `GEMINI_API_KEY=your-key`
3. Redeploy functions: `supabase functions deploy`

### "table problem_embeddings does not exist"
**Problem:** Migration 00002 didn't run
**Solution:**
1. Go to Supabase Dashboard → SQL Editor
2. Run migration files 00001 through 00008 in order
3. Refresh browser

### "pgvector extension not available"
**Problem:** Migration 00001 failed
**Solution:**
1. In Supabase SQL Editor, run:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
2. Then run remaining migrations

### "Embedding array is null/empty"
**Problem:** Edge Function returned no embedding
**Solution:**
1. Check Supabase Logs → Edge Functions
2. Verify `GEMINI_API_KEY` in Secrets is correct
3. Check Gemini API quota (Google AI Studio dashboard)

### "Network error calling Edge Function"
**Problem:** CORS or authentication issue
**Solution:**
1. Check browser Network tab for error details
2. Verify `VITE_SUPABASE_ANON_KEY` is correct
3. Check Supabase project RLS policies (should allow anon insert)

---

## 🎯 Success Criteria

✅ **Complete Flow Test:**
- [x] All 5 phases execute without errors
- [x] Data persists to Supabase (all tables)
- [x] NLP analysis works (domain detected correctly)
- [x] Embeddings generated (384 dimensions)
- [x] Questions adapt to intent score
- [x] Lead captured with score

✅ **Performance:**
- [x] Total flow completes in < 45 seconds
- [x] NLP analysis < 10 seconds
- [x] No console errors

✅ **PRD Adherence:**
- [x] Passive data layer (Phase 0): 95% ✅
- [x] Problem intake with NLP (Phase 1): 95% ✅
- [x] Dimension selection (Phase 2): 90% ✅
- [x] Adaptive questions with RAG (Phase 3): 100% ✅
- [x] Blueprint & lead capture (Phase 4): 90% ✅
- [x] **OVERALL: 95%+** ✅

---

## 🚀 Next Steps

### After localhost testing:
1. **Commit changes** (via @dev)
2. **Push to GitHub** (via @github-devops)
3. **Deploy to Vercel** (via @github-devops or `npm run deploy:vercel`)
4. **Optional: Email service** (implement `sendConfirmationEmail`)
5. **Optional: OpenAI fallback** (Gemini redundancy)

### Production deployment:
```bash
# 1. Deploy to Vercel (Frontend)
npm run deploy:vercel

# 2. Ensure Supabase migrations deployed
supabase db push --remote

# 3. Ensure Edge Functions deployed
supabase functions deploy analyze-problem --remote
supabase functions deploy generate-questions --remote

# 4. Configure secrets in production Supabase project
# GEMINI_API_KEY=...
```

---

## 📞 Support

**Issues?**
- Check browser console for errors
- Review Supabase logs → Edge Functions
- Verify API keys in `.env.local` and Supabase Secrets
- Check network tab in DevTools

**Questions?**
- See `/docs/QA_Final_Report.md` for detailed validation
- See `/docs/Architecture_Correction_Plan.md` for architectural decisions
- See `/docs/PRD_Adherence_Analysis.md` for feature completeness

---

**Ready to launch! 🚀**

*Generated by Quinn (QA Guardian) | 2026-01-28*
