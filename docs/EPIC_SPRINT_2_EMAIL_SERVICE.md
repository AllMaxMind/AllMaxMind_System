# Epic: Email Service Integration (Resend)
**Sprint 2 - All Max Mind System**

**Epic ID**: SPRINT2-E1
**Status**: READY FOR SPRINT PLANNING
**Priority**: MUST HAVE
**Estimated Story Points**: 5
**Target Duration**: 3 days
**Owner**: @dev (Implementation), @pm (Acceptance)

---

## 📋 Epic Description

Integrate Resend email service to enable lead confirmation emails, blueprints delivery, and nurture campaign tracking. Replace stub email implementation with production-ready transactional email service.

---

## 🎯 Business Value

| Metric | Impact |
|--------|--------|
| Lead Nurture Effectiveness | +40% (confirmation email)  |
| Phase 4 Completion | Closes final gap |
| Customer Confidence | "Professional" delivery |
| Campaign Tracking | Enable follow-up nurture |

---

## ✅ Acceptance Criteria

- [ ] Resend account created + API key configured
- [ ] Supabase secrets updated (RESEND_API_KEY)
- [ ] Email service module created (lib/email/service.ts)
- [ ] Lead confirmation email template implemented
- [ ] Blueprint PDF attachment option available
- [ ] Email delivery logged to leads table
- [ ] Rate limiting: max 5 emails per visitor per day
- [ ] Error handling with retry logic (3x exponential backoff)
- [ ] Test emails sent successfully
- [ ] Production emails validated (using test email)
- [ ] Zero CRITICAL/HIGH CodeRabbit issues
- [ ] Email content matches brand guidelines
- [ ] Analytics tracking for open rates (via Resend webhook)

---

## 📊 User Stories

### Story 1: Setup Resend Integration
**Points**: 2
**Acceptance**:
- Resend API client initialized
- API key securely stored in Supabase secrets
- Rate limiting configured
- Error handling implemented

### Story 2: Implement Lead Confirmation Email
**Points**: 2
**Acceptance**:
- Email template created (HTML + plain text)
- Personalization tokens (name, company)
- Blueprint PDF link included
- Branding elements (logo, footer, unsubscribe link)
- Tested with 5 variations

### Story 3: Add Email Logging & Tracking
**Points**: 1
**Acceptance**:
- Email send status logged to leads table
- Delivery status updated via Resend webhook
- Analytics event fired on send
- GA4 tracks email confirmations

---

## 🔧 Technical Details

### Architecture
```
Phase 4 (Blueprint)
  ↓
Lead Form Submission
  ↓
email/service.ts (Resend)
  ↓
Resend API
  ↓
User Inbox + Webhook logging
```

### Implementation Path
1. Create `lib/email/service.ts` module
2. Implement Resend client initialization
3. Create email templates (confirmation + blueprint)
4. Add webhook endpoint for delivery tracking
5. Integrate with Phase 4 lead capture flow
6. Test with staging Supabase project
7. Deploy to production

### Code Structure
```typescript
// lib/email/service.ts
export interface SendEmailParams {
  to: string;
  templateId: 'lead-confirmation' | 'blueprint-delivery';
  context: {
    name: string;
    company: string;
    blueprintUrl: string;
    magicLink?: string;
  };
}

export async function sendEmail(params: SendEmailParams): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}>;

// Webhook: /api/webhooks/resend
export async function handleResendWebhook(event: ResendEvent): Promise<void>;
```

---

## 📧 Email Templates

### Template 1: Lead Confirmation
```
Subject: Seu Blueprint está pronto! 🚀
From: hello@allmaxmind.com

Body:
Oi [NAME],

Obrigado por usar o All Max Mind System!

Seu blueprint foi gerado com sucesso e está pronto para download:
[BLUEPRINT_LINK]

Acesse com seu Magic Link:
[MAGIC_LINK]

Em 7 dias, este blueprint será arquivado.

Dúvidas? Responda este email.

—
All Max Mind System
```

### Template 2: Blueprint Delivery
```
Subject: [COMPANY] Blueprint - Solução Customizada
From: hello@allmaxmind.com

Body:
[GENERIC_BLUEPRINT_CONTENT]
```

---

## 🧪 Testing Strategy

### Unit Tests
- [ ] sendEmail() returns success/failure correctly
- [ ] Rate limiting blocks 6th email
- [ ] Error handling retries 3x on timeout
- [ ] Webhook signature validates

### Integration Tests
- [ ] E2E: Lead form → Email sent → Webhook received
- [ ] Resend API mock works offline
- [ ] Email content personalizes correctly

### Manual Testing
- [ ] Send test email to myself
- [ ] Verify email received in 5 min
- [ ] Click blueprint link, verify works
- [ ] Check GA4 event logged

---

## 🚀 Deployment Plan

### Staging (Resend Test Key)
1. Deploy to staging environment
2. Configure test email addresses
3. Run manual tests (5 emails)
4. Verify webhook logging
5. QA sign-off

### Production (Resend Live Key)
1. Create Resend production account
2. Verify domain (hello@allmaxmind.com)
3. Add API key to production Supabase secrets
4. Deploy to production
5. Monitor first 50 emails (error rate <1%)

---

## ⚠️ Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Email deliverability issues | Low | High | Use Resend (excellent track record) |
| API rate limits exceeded | Low | Medium | Implement queue system |
| SMTP authentication fails | Low | High | Pre-test in staging |
| Email content looks bad | Medium | Medium | Design review before launch |

---

## 📞 Dependencies

- [ ] Resend account created
- [ ] Phase 4 lead capture finalized
- [ ] Email templates approved by design
- [ ] Supabase secrets environment ready

---

## ✨ Definition of Done

- [ ] All 3 user stories completed
- [ ] CodeRabbit: 0 CRITICAL, 0 HIGH issues
- [ ] 100% test coverage for email module
- [ ] Documentation updated (setup guide)
- [ ] Staging tests passed
- [ ] Production deployment verified
- [ ] QA sign-off received
- [ ] Commit message references SPRINT2-E1

---

**Epic Owner**: Morgan (@pm)
**Technical Lead**: Aria (@architect)
**Dev Assignee**: Dex (@dev)
**QA Assignee**: Quinn (@qa)

---

*Created: 2026-01-28*
*Status: Ready for Sprint Planning*
