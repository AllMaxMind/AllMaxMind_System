# Epic: UI Polish & 7-Day Offer Messaging
**Sprint 2 - All Max Mind System**

**Epic ID**: SPRINT2-E4
**Status**: READY FOR SPRINT PLANNING
**Priority**: MUST HAVE
**Estimated Story Points**: 3
**Target Duration**: 1-2 days
**Owner**: @dev (Implementation), @architect (Design)

---

## 📋 Epic Description

Polish Phase 4 UI with prominent "7-day offer" messaging to set user expectations. This includes countdown timer, urgency copy, and visual refinements to improve lead conversion and reduce drop-off after blueprint generation.

---

## 🎯 Business Value

| Metric | Impact |
|--------|--------|
| Conversion Rate | +8-12% (urgency messaging) |
| Lead Quality | Qualified leads with expectations set |
| Brand Perception | Professional, polished experience |
| User Clarity | Clear on time-limited offer |

---

## 📊 Current State (Phase 4)

### What's Missing
- ❌ "7-day offer" countdown timer
- ❌ Urgency messaging ("Blueprint expires in X days")
- ❌ Clear CTA (action items post-blueprint)
- ⚠️ Blueprint preview could be more visually prominent

### Visual Issues
- ⚠️ Blueprint text wrapping on mobile
- ⚠️ CTA button could be more prominent
- ⚠️ Lead form spacing needs adjustment
- ⚠️ Email confirmation messaging unclear

---

## ✅ Acceptance Criteria

**Messaging**:
- [ ] "7-day offer" text displayed prominently (Phase 4 top)
- [ ] Countdown timer shows days remaining
- [ ] Urgency copy: "Blueprint expires in X days"
- [ ] Email confirmation messaging clarified
- [ ] Clear next steps for user

**Visual Polish**:
- [ ] Blueprint preview prominent (highlight box)
- [ ] Lead form properly spaced (padding)
- [ ] CTA button prominent (color + size)
- [ ] Mobile responsive (tested on iPhone)
- [ ] Accessibility: WCAG 2.1 AA compliant

**Technical**:
- [ ] No hardcoded expiration dates (config-driven)
- [ ] Countdown timer updates real-time
- [ ] Zero console errors/warnings
- [ ] Performance: Load time <3s
- [ ] CodeRabbit: 0 CRITICAL, 0 HIGH

---

## 🎨 UI Components

### New Component: 7-Day Offer Banner
```typescript
interface OfferBannerProps {
  expirationDate: string; // ISO string
  variant?: 'warning' | 'danger'; // Color intensity
  compact?: boolean; // Mobile version
}

export function OfferBanner({ expirationDate, variant = 'warning', compact }: OfferBannerProps) {
  const daysRemaining = calculateDaysRemaining(expirationDate);
  const isExpiringSoon = daysRemaining <= 2;

  return (
    <div className={cn(
      'p-4 rounded-lg border-2',
      variant === 'danger'
        ? 'bg-red-50 border-red-300'
        : 'bg-amber-50 border-amber-300'
    )}>
      <div className="flex items-center gap-2">
        <Clock className="text-amber-600" size={20} />
        <div>
          <p className="font-bold text-amber-900">
            {isExpiringSoon ? '⚠️ ' : ''}
            Blueprint válido por {daysRemaining} dias
          </p>
          <p className="text-sm text-amber-700">
            {daysRemaining === 1
              ? 'Ultimo dia para acessar este blueprint!'
              : `Expira em ${daysRemaining} dias`}
          </p>
        </div>
      </div>
    </div>
  );
}
```

### Enhanced CTA Section
```typescript
export function BlueprintCTA({ isLoggedIn, blueprintId }: CTAProps) {
  return (
    <div className="mt-8 space-y-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border-2 border-blue-200">
      <h3 className="text-2xl font-bold text-blue-900">Próximos Passos</h3>

      <OfferBanner expirationDate={expirationDate} />

      <div className="space-y-2">
        <p className="text-blue-800">
          ✅ Você recebeu um blueprint customizado
        </p>
        <p className="text-blue-800">
          ✅ Um especialista entrará em contato em 24 horas
        </p>
        <p className="text-blue-800">
          ✅ Documente suas respostas para referência
        </p>
      </div>

      {!isLoggedIn && (
        <>
          <hr className="my-4" />
          <Button
            size="lg"
            onClick={() => openLoginModal()}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Acessar Com Magic Link
          </Button>
        </>
      )}

      <p className="text-xs text-gray-600 text-center">
        Este blueprint expira em {daysRemaining} dias.
      </p>
    </div>
  );
}
```

---

## 📊 Copy Changes (EN → PT-BR)

### Phase 4 Header
**Before:**
```
"Blueprint Preview"
```

**After:**
```
"Seu Blueprint Exclusivo - Válido por 7 dias"
(Your Exclusive Blueprint - Valid for 7 days)
```

### Offer Banner
```
Banner Title:    "⏳ Blueprint válido por {N} dias"
Urgency Copy:    "{N} dias restantes para acessar"
CTAs:            "Acessar Com Magic Link"
```

### Email Subject
**Before:**
```
"Your Blueprint is Ready"
```

**After:**
```
"Seu Blueprint está pronto! 🚀 (Válido por 7 dias)"
(Your Blueprint is Ready! Valid for 7 days)
```

---

## 📊 User Stories

### Story 1: Implement 7-Day Offer Banner
**Points**: 1
**Scope**:
- Create OfferBanner component
- Add countdown timer logic
- Display in Phase 4 prominently
- Styling: amber/red based on days remaining

**Acceptance**:
- [ ] Banner displays days remaining
- [ ] Timer updates in real-time
- [ ] Colors change if < 2 days
- [ ] Mobile responsive
- [ ] Accessible (ARIA labels)

### Story 2: Enhance CTA & Messaging
**Points**: 1
**Scope**:
- Create "Next Steps" section
- Update lead form messaging
- Add email confirmation clarification
- Polish spacing and layout

**Acceptance**:
- [ ] Next steps clearly listed
- [ ] Lead form has context
- [ ] Email confirmation messaging clear
- [ ] Visual hierarchy improved
- [ ] Tested on mobile

### Story 3: Update Email Templates
**Points**: 0.5
**Scope**:
- Add expiration message to confirmation email
- Update subject line with urgency
- Add countdown badge

**Acceptance**:
- [ ] Email subject includes offer duration
- [ ] Body mentions 7-day expiration
- [ ] CTA button color improved
- [ ] Tested rendering

### Story 4: Visual Polish & QA
**Points**: 0.5
**Scope**:
- Review all Phase 4 components
- Fix spacing issues
- Mobile responsiveness check
- Accessibility audit

**Acceptance**:
- [ ] No responsive issues
- [ ] WCAG 2.1 AA passed
- [ ] No console errors
- [ ] Performance budget met

---

## 🎨 Design Specs

### Colors
```
Offer Banner:
- Background: #fffbeb (amber-50)
- Border: #fca5a5 (amber-300)
- Text: #92400e (amber-900)

Danger State (< 2 days):
- Background: #fef2f2 (red-50)
- Border: #fca5a5 (red-300)
- Text: #991b1b (red-900)

CTA Section:
- Background: linear-gradient(to right, #eff6ff, #eef2ff)
- Border: #86efac (blue-200)
```

### Typography
```
Offer Title:
- Size: 16px (mobile), 18px (desktop)
- Weight: bold (700)
- Color: amber-900

Offer Message:
- Size: 14px
- Weight: regular (400)
- Color: amber-700

Next Steps:
- Size: 14px
- Weight: regular (400)
- Color: blue-800 (checkmarks: green-600)
```

### Layout (Desktop)
```
┌─────────────────────────────────┐
│  Seu Blueprint Exclusivo         │
│  Válido por 7 dias              │
├─────────────────────────────────┤
│                                 │
│  ⏳ Blueprint válido por 5 dias │
│  Expira em 5 dias              │
│                                 │
│  Próximos Passos:              │
│  ✅ Você recebeu blueprint     │
│  ✅ Especialista em 24h        │
│  ✅ Documente respostas        │
│                                 │
│  ┌─────────────────────────────┐│
│  │ Acessar Com Magic Link      ││
│  └─────────────────────────────┘│
│                                 │
│  Este blueprint expira em 7 dias │
└─────────────────────────────────┘
```

### Layout (Mobile)
```
┌──────────────────┐
│ Blueprint (7d)   │
├──────────────────┤
│                  │
│ ⏳ 5 dias       │
│ Expira em 5d    │
│                  │
│ Próximos Passos │
│ ✅ Blueprint   │
│ ✅ Em 24h      │
│                  │
│ ┌──────────────┐│
│ │ Magic Link   ││
│ └──────────────┘│
└──────────────────┘
```

---

## 🧪 Testing Checklist

### Functional Testing
- [ ] Countdown timer displays correct days
- [ ] Timer updates at midnight UTC
- [ ] Banner color changes at 2-day mark
- [ ] 1-day warning shows
- [ ] 0-days shows "Expired"

### Visual Testing
- [ ] Desktop (1920px): Layout correct
- [ ] Tablet (768px): Responsive
- [ ] Mobile (375px): Text readable
- [ ] Dark mode: Accessible
- [ ] Print view: Reasonable

### Accessibility Testing
- [ ] Screen reader: All text announced
- [ ] Keyboard: All interactive elements focusable
- [ ] Color contrast: WCAG AA (4.5:1)
- [ ] Motion: Respects prefers-reduced-motion

### Performance Testing
- [ ] Component loads < 500ms
- [ ] Timer updates don't cause re-renders
- [ ] No memory leaks
- [ ] Bundle size increase < 10KB gzip

---

## 🚀 Deployment Plan

### Staging
1. Deploy UI changes to staging
2. Configure 7-day expiration (use fixture date)
3. Visual QA on multiple devices
4. Accessibility audit
5. Performance check

### Production
1. Deploy to production
2. Monitor new Phase 4 conversion rate
3. Track banner view rates (GA4)
4. A/B test messaging (optional Phase 3)

---

## 📊 Success Metrics

| Metric | Target | Current | Goal |
|--------|--------|---------|------|
| Phase 4 Conversion | >35% | TBD | 38-40% |
| Lead Quality | >70 avg | TBD | 72+ avg |
| Blueprint Views | N/A | TBD | Track views |
| Bounce Rate (Phase 4) | <20% | TBD | <18% |

---

## ⚠️ Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Urgency messaging backfires | Low | Medium | A/B test with control group |
| Timer calculation wrong | Very Low | High | Unit test timer logic |
| Mobile rendering breaks | Low | Medium | Test on real devices |
| Accessibility regression | Low | Low | Automated a11y audit |

---

## 📞 Dependencies

- [ ] Phase 4 lead form finalized
- [ ] Email templates finalized (Epic 1)
- [ ] Design approval on messaging
- [ ] QA test environment ready

---

## ✨ Definition of Done

- [ ] All 4 user stories completed
- [ ] Visual design approved
- [ ] Mobile responsive tested
- [ ] Accessibility audit passed (WCAG 2.1 AA)
- [ ] CodeRabbit: 0 CRITICAL, 0 HIGH
- [ ] Performance budget met
- [ ] QA sign-off
- [ ] Commit references SPRINT2-E4

---

## 🎨 Implementation Checklist

### Components to Create/Update
- [ ] OfferBanner (new)
- [ ] BlueprintCTA (new)
- [ ] Phase4.tsx (update)
- [ ] Email templates (update - from Epic 1)

### Styling
- [ ] Tailwind classes for banner
- [ ] Responsive breakpoints
- [ ] Dark mode support
- [ ] Animation for countdown

### Testing
- [ ] Timer logic tests
- [ ] Days remaining calculation
- [ ] Component rendering
- [ ] Mobile responsiveness

---

**Epic Owner**: Morgan (@pm)
**Design Lead**: Aria (@architect)
**Dev Assignee**: Dex (@dev)
**QA Assignee**: Quinn (@qa)

---

*Created: 2026-01-28*
*Status: Ready for Sprint Planning*
