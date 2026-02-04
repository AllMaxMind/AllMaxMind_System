# 📖 User Story: P2 - Audio-to-Text (Speech Recognition)

**Story ID**: SPRINT-2-P2
**Epic**: Input Methods & Accessibility
**Sprint**: Sprint 2
**Priority**: 🟠 ALTA 1
**Status**: 📋 Ready for Development
**Points**: 10 (4 days)
**Created**: 2026-02-03
**PO**: Pax (Balancer)
**Dependencies**: None (independent)

---

## 📝 User Story Statement

**As a** user in Phase 2 answering guided questions
**I want to** speak my problem instead of typing
**So that** I can quickly provide rich context without typing effort

---

## 🎯 Acceptance Criteria

### Audio Capture (Web Audio API)
- [ ] 🎤 Record button visible in Phase 2 textarea area
- [ ] Button click triggers browser microphone permission
- [ ] Permission denial handled gracefully (toast message)
- [ ] Visual feedback: "🔴 Recording..." while active
- [ ] Auto-stop on 120 seconds (configurable max)
- [ ] Auto-stop on silence detection (3 seconds configurable)
- [ ] Manual stop: click 🎤 button again
- [ ] Audio format: WAV or MP3 (configurable)
- [ ] Recorded audio not stored (discarded after transcription)
- [ ] Browser compatibility: Chrome, Firefox, Edge, Safari check

### Transcription Provider - Gemini (Primary)
- [ ] Try Gemini 2.0 Audio API first
- [ ] Timeout: 5 seconds (fast response)
- [ ] Send audio blob + language parameter
- [ ] Extract transcription text from response
- [ ] Retry: 0 (fast-fail to fallback)
- [ ] Error logging (for analytics)
- [ ] On success: insert text into textarea

### Transcription Provider - OpenAI Whisper (Fallback)
- [ ] Fallback when Gemini fails/times out
- [ ] Timeout: 30 seconds (can be slower)
- [ ] Send audio file + language parameter (pt/en)
- [ ] Extract transcription text from response
- [ ] Retry: 1 (one retry on network error)
- [ ] On success: insert text into textarea
- [ ] On fail: error message + retry button

### Textarea Integration
- [ ] Text inserted into textarea after transcription
- [ ] Existing text preserved (concatenate, not replace)
- [ ] Add double line break if text already exists
- [ ] Cursor position preserved or moved to end
- [ ] User can continue typing/editing normally
- [ ] No page reload or loss of context

### Error Handling & User Feedback
- [ ] Permission denied: "Permissão de microfone negada"
- [ ] Audio too short: "Áudio muito curto (min 1s)"
- [ ] Audio too long: "Áudio muito longo (máx 120s)"
- [ ] Both providers fail: "Transcrição falhou. Tentar novamente?"
- [ ] Network error: "Erro de conexão. Tentando novamente..."
- [ ] Incoherent audio: "Não consegui entender. Tentar novamente?"
- [ ] Browser not supported: "Seu navegador não suporta gravação"
- [ ] All errors show retry button + ability to type manually
- [ ] Toast notifications (success + errors)
- [ ] No red X (graceful degradation)

### Language Support
- [ ] Get language from i18n context (useTranslation)
- [ ] Pass language to Gemini prompt ("Transcreva em Português")
- [ ] Pass language to Whisper API (language parameter)
- [ ] Improve transcription accuracy via explicit language
- [ ] Support: Portuguese (pt-BR) + English (en)

### UI/UX States
- [ ] Idle state: [Textarea] [🎤 Record]
- [ ] Recording state: [Textarea] [🔴 Stop] + "Recording..."
- [ ] Transcribing state: [Textarea] [⏳ Processing...] (disabled)
- [ ] Success state: [Textarea with text] [✅ Done]
- [ ] Error state: [Textarea] [❌ Retry] + error message

### Testing & QA
- [ ] Audio capture working (permission granted)
- [ ] Audio capture denied (graceful)
- [ ] Gemini transcription succeeds (Portuguese)
- [ ] Gemini transcription succeeds (English)
- [ ] Gemini timeout → Whisper fallback
- [ ] Whisper transcription succeeds
- [ ] Both providers fail → error message
- [ ] Audio too short (< 1s) → rejected
- [ ] Audio too long (> 120s) → auto-stop
- [ ] Silent/noisy audio → handled gracefully
- [ ] Non-native speaker audio → acceptable accuracy
- [ ] Special characters in transcript → preserved
- [ ] Bilingual content → transcribed as-is
- [ ] Text insertion preserves existing content
- [ ] Browser compatibility tested (Chrome, Firefox, etc)
- [ ] Mobile browser support tested (iOS/Android)
- [ ] All tests passing

### Analytics & Monitoring
- [ ] Log provider used (Gemini vs Whisper)
- [ ] Log transcription latency (milliseconds)
- [ ] Log success rate (per provider)
- [ ] Log failure reason (timeout, API error, etc)
- [ ] Log language (which language was used)
- [ ] Track user engagement (% of users using audio)
- [ ] Identify problematic audio patterns

### Security & Privacy
- [ ] Audio not stored in database (discarded)
- [ ] Audio not cached (memory only)
- [ ] Audio not sent to third parties (only Gemini + Whisper)
- [ ] GDPR compliance (no personal data in audio)
- [ ] No audio in logs/error messages
- [ ] No user tracking (anonymous audio)
- [ ] API keys not exposed (environment variables)

---

## 📚 File List

### New Files Created
```
src/lib/audio/audioRecorder.ts
src/lib/audio/speechToText.ts
src/hooks/useAudioRecorder.ts
src/components/audio/AudioButton.tsx
src/__tests__/audio-recorder.test.ts
src/__tests__/speech-to-text.test.ts
src/__tests__/audio-integration.test.ts
```

### Modified Files
```
src/components/phases/Phase2.tsx
src/lib/ai/providers/audioTranscription.ts (if new)
.env.example (add Gemini + OpenAI API keys)
```

---

## 🔗 Dependencies

### Blockers (Must complete first)
- None (independent feature)

### Blocks These Stories
- None

### Related Stories
- None

---

## 💬 Task Breakdown

### Task 2.1: Audio Capture Module (Day 1)
**Owner**: Frontend Dev
**Estimate**: 1 day
**Status**: [ ] Not started

- [ ] Create audioRecorder.ts module
- [ ] Use Web Audio API for recording
- [ ] Implement MediaRecorder interface
- [ ] Handle microphone permission request
- [ ] Implement auto-stop on silence (configurable)
- [ ] Implement auto-stop on max duration (120s)
- [ ] Manual stop via button click
- [ ] Convert audio to Blob
- [ ] Error handling (permission denied, etc)
- [ ] Unit tests (happy + error paths)

### Task 2.2: Speech-to-Text Module (Day 1-2)
**Owner**: Backend Dev (integrations) + Frontend Dev
**Estimate**: 1.5 days
**Status**: [ ] Not started

- [ ] Create speechToText.ts module
- [ ] Implement Gemini 2.0 Audio API call
  - [ ] Encode audio to base64
  - [ ] Build request body
  - [ ] Handle response
  - [ ] 5s timeout + error
- [ ] Implement OpenAI Whisper fallback
  - [ ] Build FormData with audio file
  - [ ] Add language parameter
  - [ ] 30s timeout + retry
  - [ ] Handle response
- [ ] Fallback strategy (Gemini → Whisper → Error)
- [ ] Language parameter support (pt-BR, en)
- [ ] Logging (provider, latency, success/error)
- [ ] Error messages (user-friendly)
- [ ] Unit tests (mock APIs, test fallback)

### Task 2.3: Phase 2 UI Integration (Day 2-3)
**Owner**: Frontend Dev
**Estimate**: 1.5 days
**Status**: [ ] Not started

- [ ] Create AudioButton.tsx component
- [ ] Add 🎤 button next to textarea
- [ ] Implement recording state machine
  - [ ] Idle → Recording → Transcribing → Done
  - [ ] Error state + retry
- [ ] Call audioRecorder on click
- [ ] Show permission request UI
- [ ] Display recording indicator + time
- [ ] Call speechToText on stop
- [ ] Show transcribing spinner
- [ ] Insert text into textarea
- [ ] Show success toast
- [ ] Handle errors gracefully
- [ ] Update Phase2.tsx to use AudioButton
- [ ] Responsive layout (mobile + desktop)
- [ ] Unit tests

### Task 2.4: Error Handling & Retry (Day 3)
**Owner**: Frontend Dev
**Estimate**: 1 day
**Status**: [ ] Not started

- [ ] User-friendly error messages (i18n)
- [ ] Retry button (retry same audio)
- [ ] Record again button (new recording)
- [ ] Type manually fallback
- [ ] Toast notifications (success + errors)
- [ ] No red X visual (graceful)
- [ ] Console logging (debug info)
- [ ] Sentry integration (error tracking)
- [ ] Test all error scenarios
- [ ] Unit tests + E2E tests

### Task 2.5: Testing & QA (Day 4)
**Owner**: QA Lead
**Estimate**: 1 day
**Status**: [ ] Not started

- [ ] Audio capture (microphone permission)
- [ ] Recording state transitions
- [ ] Gemini transcription (PT + EN)
- [ ] Whisper transcription (PT + EN)
- [ ] Fallback strategy (Gemini → Whisper)
- [ ] Error scenarios (API down, timeout, bad audio)
- [ ] Text insertion (preserves existing)
- [ ] Language accuracy (PT-BR + EN)
- [ ] Edge cases (short, long, silent audio)
- [ ] Mobile browser testing
- [ ] Desktop browser testing
- [ ] Performance (< 45s total)
- [ ] Analytics logging verification
- [ ] Sign-off ✅

---

## 🧪 Test Cases

### Happy Path - Gemini Success
```gherkin
Scenario: User records and Gemini transcribes
  Given user in Phase 2 with textarea
  When user clicks 🎤 button
  Then browser requests microphone permission
  And user grants permission
  And recording starts (visual "🔴 Recording...")
  When user speaks problem (3 seconds)
  And clicks 🎤 again
  Then recording stops
  And "⏳ Transcribing..." shown
  And Gemini API called (< 5s)
  When response received
  Then text inserted into textarea
  And existing text preserved
  And toast: "Transcrição concluída!"
  And user can edit/continue
```

### Fallback - Gemini Timeout → Whisper
```gherkin
Scenario: Gemini times out, Whisper succeeds
  Given user recorded audio
  When speechToText called
  And Gemini times out (5s)
  Then Whisper fallback triggered
  And Whisper API called (< 30s)
  When response received
  Then text inserted (same as Gemini)
  And toast shows which provider used (optional)
```

### Error Scenario
```gherkin
Scenario: Both providers fail
  Given user recorded audio
  When both Gemini + Whisper fail
  Then error toast: "Transcrição falhou. Tentar novamente?"
  And retry button shown
  And "Digitar Manualmente" option available
  When user clicks retry
  Then recording can start again
```

### Language Testing
```gherkin
Scenario: Portuguese transcription
  Given language set to PT-BR
  When user speaks in Portuguese
  And Gemini transcribes
  Then text returned in Portuguese
  And terminology correct
  And accents preserved (não, são, etc)
```

---

## 📊 Metrics & KPIs

- **Audio capture success rate**: > 95%
- **Transcription success rate (Gemini)**: > 90%
- **Transcription success rate (Whisper)**: > 95%
- **Fallback rate**: < 5%
- **Average latency**: < 10s (Gemini) + fallback < 30s
- **User adoption**: Target > 20% of users try audio
- **Error recovery**: > 95% (retry succeeds)

---

## 🚨 Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| API timeout | Medium | Medium | Fallback provider + user retry |
| Browser not supported | Low | Medium | Graceful message, type fallback |
| Audio quality poor | Medium | Low | User can re-record |
| Privacy concerns | Low | High | Clear messaging (no storage) |
| Inaccurate transcription | Medium | Low | User can edit text |

---

## 📋 Review Checklist (before starting)

- [ ] Gemini API credentials configured
- [ ] OpenAI Whisper credentials configured
- [ ] Web Audio API browser support verified
- [ ] i18n translations for audio ready
- [ ] Error messages in both languages
- [ ] Privacy policy reviewed

---

## ✅ Definition of Done

- [x] All acceptance criteria met
- [x] All test cases passing (unit + E2E)
- [x] Code reviewed (security + UX focus)
- [x] Both providers integrated + fallback works
- [x] Error handling graceful (all scenarios)
- [x] Language support working (PT-BR + EN)
- [x] No console errors/warnings
- [x] TypeScript strict mode passing
- [x] Mobile responsive (tested)
- [x] Analytics logged (provider, latency, success)
- [x] Documentation updated
- [x] User story closed in backlog
- [x] Demo completed in Sprint 2 retro

---

## 📌 Notes & Comments

### Architecture Decisions
- Gemini primary (fast, multimodal)
- Whisper fallback (reliable, cheaper)
- No audio storage (privacy first)
- Web Audio API (client-side, efficient)

### Known Limitations
- No offline support (requires internet)
- No audio visualization (waveform, etc)
- No audio file upload (only microphone)
- No audio quality settings (fixed format)

### Future Enhancements
- Audio file upload support
- Recording visualization (waveform)
- Quality settings (compression, sample rate)
- Transcription editing UI
- Audio notes library (save recordings)

---

**Created by**: Pax (PO)
**Last Updated**: 2026-02-03
**Status**: ✅ Ready for Sprint 2
