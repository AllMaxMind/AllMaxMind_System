# Epic: OpenAI Fallback Implementation
**Sprint 2 - All Max Mind System**

**Epic ID**: SPRINT2-E3
**Status**: READY FOR SPRINT PLANNING
**Priority**: MUST HAVE
**Estimated Story Points**: 4
**Target Duration**: 2-3 days
**Owner**: @dev (Implementation), @architect (Design)

---

## 📋 Epic Description

Implement OpenAI API fallback for Gemini-dependent features (analyze-problem, generate-questions). This provides 99.9% uptime guarantee by ensuring the system continues operating if Gemini becomes unavailable.

---

## 🎯 Business Value

| Metric | Impact |
|--------|--------|
| Uptime SLA | 99% → **99.9%** (3 nines) |
| Enterprise Readiness | Meets SLA requirements |
| Vendor Risk | Eliminated single-vendor dependency |
| Operational Resilience | Automatic failover |

---

## 📊 Current Architecture

### Single Vendor (Current)
```
Phase 1 Problem Analysis
  ↓
analyze-problem Edge Function
  ↓
Gemini API (ONLY)
  ↓
❌ If down → Service down
```

### Dual-Vendor (After This Epic)
```
Phase 1 Problem Analysis
  ↓
analyze-problem Edge Function (v2)
  ↓
Try Gemini API
  ↓ (success)
Return response
  ↓ (timeout/error)
Retry logic (3x)
  ↓ (still fails)
Fallback to OpenAI API
  ↓ (success)
Return response with fallback_used=true
```

---

## ✅ Acceptance Criteria

- [ ] OpenAI API client initialized in Edge Functions
- [ ] API key securely stored in Supabase secrets
- [ ] Fallback logic: Gemini → Retry 3x → OpenAI
- [ ] Response format identical (both return same schema)
- [ ] Fallback metadata tracked (fallback_used flag)
- [ ] Timeout values configured (Gemini 10s, OpenAI 15s)
- [ ] Error logging distinguishes Gemini vs OpenAI errors
- [ ] Staging tests with both APIs passing
- [ ] Production monitoring alerts on fallback usage
- [ ] Cost tracking (Gemini vs OpenAI usage)
- [ ] Zero CRITICAL/HIGH CodeRabbit issues
- [ ] Documentation updated (API architecture)

---

## 🔄 Failover Logic

### Retry Strategy (Exponential Backoff)
```
Attempt 1: Gemini API (timeout: 10s)
  ↓ (timeout)
Wait 1s
Attempt 2: Gemini API (timeout: 10s)
  ↓ (timeout)
Wait 2s
Attempt 3: Gemini API (timeout: 10s)
  ↓ (timeout)
Wait 4s
Fallback: OpenAI API (timeout: 15s)
  ↓ (success/failure)
Return response
```

### Error Classification
```
Gemini Error Types:
- TIMEOUT (>10s) → Retry
- QUOTA_EXCEEDED → Fallback to OpenAI
- AUTH_ERROR → Log + Alert + Fallback
- INVALID_REQUEST → Don't retry, return error

OpenAI Error Types:
- TIMEOUT (>15s) → Return error
- RATE_LIMIT → Queue request, retry later
- AUTH_ERROR → Log + Alert
- INVALID_REQUEST → Return error
```

---

## 📊 User Stories

### Story 1: OpenAI Edge Function Integration
**Points**: 1.5
**Scope**:
- Create OpenAI API client in Edge Function
- Implement prompt templates matching Gemini
- Handle response transformation

**Acceptance**:
- [ ] OpenAI client initialized with API key
- [ ] Prompts generate equivalent output to Gemini
- [ ] Response schema matches Gemini output
- [ ] Error handling for OpenAI-specific errors

### Story 2: Implement Fallback Logic
**Points**: 1.5
**Scope**:
- Modify analyze-problem to use fallback
- Modify generate-questions to use fallback
- Implement retry logic with backoff
- Add fallback_used metadata to response

**Acceptance**:
- [ ] Tries Gemini 3x before falling back
- [ ] Exponential backoff between retries
- [ ] OpenAI used if all Gemini attempts fail
- [ ] Response metadata includes fallback flag
- [ ] Cost tracking for analytics

### Story 3: Monitoring & Cost Tracking
**Points**: 1
**Scope**:
- Log fallback usage to Supabase
- Create dashboard for Gemini vs OpenAI usage
- Cost estimation per API
- Alerts on fallback > 10% of requests

**Acceptance**:
- [ ] Fallback events logged to analytics table
- [ ] Dashboard shows Gemini/OpenAI split
- [ ] Cost calculation by request type
- [ ] Alert fires if fallback > 10% (1 week)

### Story 4: Testing & Validation
**Points**: 1
**Scope**:
- Unit tests for both APIs
- Integration tests with staging
- Load testing with both APIs
- Rollback procedure documented

**Acceptance**:
- [ ] Mock tests for Gemini pass
- [ ] Mock tests for OpenAI pass
- [ ] Staging E2E test with both APIs
- [ ] Rollback documented and tested

---

## 💰 Cost Comparison

### Current (Gemini Only)
```
Per 1000 problems analyzed:
- Gemini Pro (analyze): 1000 × $0.001 = $1.00
- Text Embedding (embedding): 1000 × $0.00002 = $0.02
- Total: ~$1.02 per 1000

Per 1000 questions generated:
- Gemini Flash (generate): 1000 × $0.075 = $0.075
- Total: ~$0.075 per 1000

MONTHLY (2K problems, 2K question sets):
- Gemini: ~$2.04 + $0.15 = $2.19
```

### With OpenAI Fallback (Assuming 5% fallback rate)
```
Per 1000 problems analyzed:
- 950 × Gemini ($1.00 × 0.95) = $0.95
- 50 × OpenAI GPT-4 ($0.03/problem) = $1.50
- Embeddings: $0.02
- Total: ~$2.47 per 1000

Per 1000 questions generated:
- 950 × Gemini Flash ($0.075 × 0.95) = $0.071
- 50 × OpenAI GPT-3.5T ($0.002/question) = $0.10
- Total: ~$0.171 per 1000

MONTHLY (2K problems, 2K question sets, 5% fallback):
- Cost increase: ~$4.00-5.00/month (2-3% increase)
- Uptime improvement: 99% → 99.9% (10x reliability)
```

---

## 🏗️ Implementation Architecture

### Edge Function Structure
```typescript
// supabase/functions/analyze-problem/index.ts (v2)

interface AnalysisRequest {
  problemText: string;
  problemId: string;
}

interface AnalysisResponse {
  domain: string;
  persona: string;
  intentScore: number;
  emotionalTone: string;
  complexity: string;
  embedding: number[];
  fallback_used: 'gemini' | 'openai';
  analysis_time_ms: number;
}

async function analyzeWithFallback(request: AnalysisRequest): Promise<AnalysisResponse> {
  const startTime = Date.now();

  // Try Gemini 3x
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const result = await callGeminiAPI(request);
      return { ...result, fallback_used: 'gemini' };
    } catch (error) {
      if (attempt === 3) break;
      await wait(Math.pow(2, attempt - 1) * 1000); // Exponential backoff
    }
  }

  // Fallback to OpenAI
  try {
    const result = await callOpenAIAPI(request);
    return { ...result, fallback_used: 'openai' };
  } catch (error) {
    throw new Error(`Both APIs failed: ${error.message}`);
  }
}
```

---

## 🧪 Testing Strategy

### Unit Tests
- [ ] Gemini API call mocked
- [ ] OpenAI API call mocked
- [ ] Fallback triggers on timeout
- [ ] Retry logic works correctly
- [ ] Response format matches schema

### Integration Tests
- [ ] Staging: Real Gemini API call succeeds
- [ ] Staging: Real OpenAI API call succeeds
- [ ] Staging: Simulate Gemini timeout → fallback works
- [ ] Staging: Both APIs return identical schema

### Performance Tests
- [ ] Gemini response time: <8s (p95)
- [ ] OpenAI response time: <12s (p95)
- [ ] Fallback adds <2s latency

### Load Tests
- [ ] 100 concurrent requests
- [ ] Mixed Gemini/OpenAI distribution
- [ ] No resource exhaustion

---

## 🚀 Deployment Plan

### Staging (Pre-Production Testing)
1. Deploy v2 Edge Functions with fallback logic
2. Configure OpenAI API key in staging secrets
3. Run E2E tests (all 5 phases)
4. Simulate Gemini failure → verify fallback works
5. Monitor error rates, response times
6. QA sign-off

### Production Rollout
1. Configure OpenAI API key in production secrets
2. Deploy updated Edge Functions (feature flag: ENABLE_OPENAI_FALLBACK=true)
3. Monitor first 1000 requests (error rate <1%)
4. Gradually enable fallback (phase: 10% → 25% → 50% → 100%)
5. Document in runbook

---

## 📊 Monitoring & Alerting

### Metrics to Track
```sql
-- Fallback usage by day
SELECT
  DATE(created_at) as date,
  fallback_used,
  COUNT(*) as count,
  AVG(analysis_time_ms) as avg_time
FROM analysis_logs
GROUP BY DATE(created_at), fallback_used;

-- Cost estimate
SELECT
  fallback_used,
  COUNT(*) * CASE
    WHEN fallback_used='gemini' THEN 0.001
    WHEN fallback_used='openai' THEN 0.03
  END as estimated_cost
FROM analysis_logs
WHERE created_at > NOW() - INTERVAL '1 month'
GROUP BY fallback_used;
```

### Alerts (Sentry)
- [ ] Alert if fallback > 10% in 1 hour window
- [ ] Alert if error rate > 5% (either API)
- [ ] Alert if response time > 15s (p95)

---

## ⚠️ Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| OpenAI response quality worse | Low | Medium | A/B test quality before full rollout |
| Cost spike if fallback high | Low | Medium | Set alerts + fallback % monitoring |
| Increased latency with fallback | Low | Medium | Optimize timeout values + caching |
| API key leakage | Very Low | Critical | Use Supabase secrets + rotate keys monthly |

---

## 📞 Dependencies

- [ ] OpenAI API account created + API key
- [ ] Supabase secrets ready for both APIs
- [ ] Monitoring dashboard prepared
- [ ] Runbook documented

---

## 🎓 API Cost Comparison

### Request Cost (Per Request)
| API | Model | Use Case | Cost |
|-----|-------|----------|------|
| Gemini | 3 Pro | analyze-problem | $0.001 |
| Gemini | 3 Flash | generate-questions | $0.000075 |
| OpenAI | GPT-4 Turbo | analyze-problem | $0.03 |
| OpenAI | GPT-3.5 Turbo | generate-questions | $0.002 |

**Preference**: Use Gemini for cost, fallback to OpenAI for reliability

---

## ✨ Definition of Done

- [ ] All 4 user stories completed
- [ ] OpenAI API integrated
- [ ] Fallback logic tested (both mock and real)
- [ ] Monitoring dashboard created
- [ ] Cost tracking implemented
- [ ] CodeRabbit: 0 CRITICAL, 0 HIGH
- [ ] 100% staging tests passed
- [ ] Runbook documented
- [ ] QA sign-off
- [ ] Commit references SPRINT2-E3

---

**Epic Owner**: Morgan (@pm)
**Technical Lead**: Aria (@architect)
**Dev Assignee**: Dex (@dev)
**QA Assignee**: Quinn (@qa)

---

*Created: 2026-01-28*
*Status: Ready for Sprint Planning*
