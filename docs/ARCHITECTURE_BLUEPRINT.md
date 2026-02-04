# 🏛️ ARQUITETURA SYNKRA AIOS - BLUEPRINT COMPLETO

**Data**: 2026-02-03
**Arquiteto**: Aria (Visionary)
**Status**: Pronto para Desenvolvimento
**Versão**: 1.0 (Production-Ready)

---

## 📑 ÍNDICE

1. [Visão Geral do Sistema](#visão-geral-do-sistema)
2. [Arquitetura em Camadas](#arquitetura-em-camadas)
3. [Fluxos Críticos (P1-P4)](#fluxos-críticos)
4. [Design de Banco de Dados](#design-de-banco-de-dados)
5. [Integração de Serviços Externos](#integração-de-serviços-externos)
6. [Padrões & Decisões Arquiteturais](#padrões--decisões-arquiteturais)
7. [Error Handling & Resilience](#error-handling--resilience)
8. [Roadmap de Implementação](#roadmap-de-implementação)

---

## VISÃO GERAL DO SISTEMA

### 🎯 Objetivo
Sistema de IA orquestrado (AIOS) que transforma problemas técnicos em blueprints arquiteturais, com múltiplos pontos de entrada (fases 1-5) e automação de entrega via email.

### 📊 Escopo
- **Usuários**: Anônimos (Phase 1-4) → Autenticados (Phase 5+)
- **Tipos de dados**: Blueprints, Leads, Scores, Email jobs
- **Integrações**: Gemini, OpenAI, Google Auth, Resend, Supabase
- **Geograficamente**: Global (sem restrições geo)

### 🔐 Premissas de Segurança
- RLS (Row-Level Security) em todas as tabelas
- JWT via Supabase Auth
- Dados anônimos isolados por session_id
- GDPR compliance (sem armazenar áudio bruto)

---

## ARQUITETURA EM CAMADAS

### Diagrama de Camadas Completo

```
┌────────────────────────────────────────────────────────────────────────┐
│ 🖥️  PRESENTATION LAYER (React 19 + TypeScript + Vite)                 │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │  Landing    │  │  Phase 1-3  │  │  Phase 4     │  │  Phase 5    │ │
│  │  Page       │  │  Input      │  │  Blueprint   │  │  Auth +     │ │
│  │             │  │  Collection │  │  Display     │  │  Dashboard  │ │
│  └─────────────┘  └─────────────┘  └──────────────┘  └─────────────┘ │
│                                                                        │
│  ┌──────────────────────────┐      ┌────────────────────────────────┐ │
│  │  Admin Dashboard         │      │  User Profile / Settings       │ │
│  │  (LeadDashboard)         │      │                                │ │
│  │  - Kanban View           │      │  - Account Settings            │ │
│  │  - Table View            │      │  - Language Selection          │ │
│  │  - Real-time Updates     │      │  - Email Preferences           │ │
│  └──────────────────────────┘      └────────────────────────────────┘ │
│                                                                        │
│  Shared Components:                                                   │
│  ├─ LanguageSelector (i18n context)                                 │
│  ├─ NavBar (conditional admin link)                                 │
│  ├─ AudioButton (Phase 2 - P2)                                      │
│  └─ ErrorBoundary + Toast notifications                             │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌────────────────────────────────────────────────────────────────────────┐
│ 🎯 APPLICATION LAYER (Edge Functions + Client Logic)                  │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ORCHESTRATION:                      CLIENT UTILITIES:               │
│  ├─ Blueprint Save & Persist (P1)   ├─ Audio Transcription (P2)     │
│  │  └─ saveBlueprint()              │  └─ speechToText.ts           │
│  ├─ Auth Middleware (P3)            ├─ Session Management           │
│  │  └─ linkSessionToUser()          │  └─ session utils             │
│  ├─ Admin Role Check (P4)           └─ Language Context             │
│  │  └─ requireAdmin()                                               │
│  └─ Email Queue Processor                                           │
│     └─ processEmailQueue()                                          │
│                                                                        │
│  PROVIDERS (Multi-stack):                                             │
│  ├─ Blueprint Generation                                             │
│  │  ├─ Gemini 2.0 Flash (primary)                                   │
│  │  └─ OpenAI GPT-4 (fallback)                                      │
│  ├─ Audio Transcription                                             │
│  │  ├─ Gemini 2.0 Audio (primary)                                   │
│  │  └─ OpenAI Whisper (fallback)                                    │
│  └─ PDF Generation                                                  │
│     └─ jsPDF + HTML2Canvas                                          │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌────────────────────────────────────────────────────────────────────────┐
│ 🤖 AI PROVIDERS LAYER (External APIs)                                 │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌──────────────────────┐          ┌──────────────────────┐         │
│  │ Google Gemini        │          │ OpenAI               │         │
│  ├──────────────────────┤          ├──────────────────────┤         │
│  │ - 2.0 Flash (main)   │          │ - GPT-4 (fallback)   │         │
│  │ - Text to Blueprint  │          │ - Text to Blueprint  │         │
│  │ - Audio Transcription│          │ - Whisper Audio      │         │
│  │ - Timeout: 30s       │          │ - Timeout: 45s       │         │
│  │ - Retries: 2         │          │ - Retries: 1         │         │
│  └──────────────────────┘          └──────────────────────┘         │
│                                                                        │
│  Fallback Strategy:                                                   │
│  Blueprint: Gemini → OpenAI → Error                                  │
│  Audio:     Gemini Audio → Whisper → Error                           │
│                                                                        │
│  Rate Limiting: Per API key, monitored via providers                │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌────────────────────────────────────────────────────────────────────────┐
│ 📧 EXTERNAL SERVICES LAYER                                            │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐   │
│  │ Supabase Auth    │  │ Resend Email     │  │ Google OAuth     │   │
│  ├──────────────────┤  ├──────────────────┤  ├──────────────────┤   │
│  │ - User mgmt      │  │ - Email delivery │  │ - Sign-in flow   │   │
│  │ - JWT tokens     │  │ - PDF attachment │  │ - Profile data   │   │
│  │ - Email/Pass     │  │ - Batch sends    │  │ - Token refresh  │   │
│  │ - RLS policies   │  │ - Template mgmt  │  │                  │   │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘   │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌────────────────────────────────────────────────────────────────────────┐
│ 💾 DATA LAYER (Supabase PostgreSQL + Storage)                        │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  TABLES:                           RELATIONSHIPS:                    │
│  ├─ auth.users (Supabase)          ├─ user_profiles → auth.users    │
│  ├─ user_profiles (custom)         ├─ blueprints → user_profiles   │
│  ├─ blueprints                     ├─ leads → blueprints            │
│  ├─ leads                          ├─ email_jobs → leads            │
│  ├─ email_jobs                     └─ lead_scores → leads           │
│  ├─ lead_scores                                                     │
│  ├─ email_sequences                RLS PROTECTION:                  │
│  └─ audit_logs                     ├─ Users veem seus próprios      │
│                                    ├─ Admins veem tudo (@allmax)   │
│  STORAGE:                          ├─ Session-based isolation       │
│  ├─ blueprints-pdf/ (PDF files)   └─ Audit trail completo         │
│  └─ attachments/ (email files)                                     │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## FLUXOS CRÍTICOS

### P1: BLUEPRINT PERSISTÊNCIA + EMAIL AUTOMÁTICO

#### Diagrama de Fluxo Completo

```
┌─────────────────────────────────────────────────────────────────────────┐
│ PHASE 4: BLUEPRINT GERADO + CONFIRMAÇÃO                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  [User vê blueprint gerado]                                            │
│           ↓                                                             │
│  [Campos:] Nome | Email | Telefone | Empresa | Cargo                 │
│           ↓                                                             │
│  [Button "Usar este Blueprint" → Salvar]                              │
│           ↓                                                             │
│  Frontend POST /api/blueprints/save                                   │
│  {                                                                      │
│    session_id: "uuid-xxxxx",                                           │
│    user_id: null (ainda não autenticado),                             │
│    email: "user@example.com",                                          │
│    name: "João Silva",                                                 │
│    phone: "+55 11 98765-4321",                                         │
│    company: "Tech Corp",                                               │
│    role: "CTO",                                                        │
│    blueprint: { ... blueprint JSON ... },                              │
│    language: "pt-BR"                                                   │
│  }                                                                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ BACKEND: EDGE FUNCTION (Supabase)                                      │
│ supabase/functions/save-blueprint/index.ts                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1. VALIDATE Input                                                      │
│     ├─ Blueprint not empty                                              │
│     ├─ Email format valid                                               │
│     └─ Session ID exists                                                │
│                  ↓                                                      │
│  2. SAVE Blueprint to Database                                          │
│     INSERT INTO blueprints (                                            │
│       id (UUID),                                                        │
│       session_id,          ← Anon tracking                             │
│       user_id (NULL),      ← Will fill in Phase 5                      │
│       email,               ← From Phase 4 form                          │
│       name,                ← From Phase 4 form                          │
│       phone,               ← From Phase 4 form                          │
│       company,             ← From Phase 4 form                          │
│       role,                ← From Phase 4 form                          │
│       content (JSON),      ← Full blueprint                             │
│       language,            ← Language used for gen                      │
│       status: 'generated', ← Lifecycle status                          │
│       created_at,                                                       │
│       updated_at                                                        │
│     ) VALUES (...)                                                      │
│     RETURNING blueprint_id                                              │
│                  ↓                                                      │
│  3. GENERATE PDF                                                        │
│     ├─ Call jsPDF generator                                             │
│     ├─ Render blueprint content                                         │
│     └─ Upload to Supabase Storage:                                      │
│        /blueprints-pdf/{blueprint_id}.pdf                              │
│                  ↓                                                      │
│  4. ENQUEUE EMAIL JOB                                                   │
│     INSERT INTO email_jobs (                                            │
│       id,                                                               │
│       recipient_email: email,                                           │
│       blueprint_id,                                                     │
│       pdf_url,            ← Storage URL                                 │
│       template: 'blueprint_delivery',                                   │
│       subject: 'Seu Blueprint Arquitetural',                            │
│       status: 'pending',   ← Not sent yet                              │
│       retry_count: 0,      ← For exponential backoff                    │
│       created_at                                                        │
│     ) VALUES (...)                                                      │
│                  ↓                                                      │
│  5. RETURN to Frontend                                                  │
│     {                                                                    │
│       success: true,                                                    │
│       blueprint_id: "uuid-xxxxx",                                       │
│       pdf_url: "https://storage.../blueprints-pdf/...",               │
│       message: "Blueprint salvo! Email será enviado."                  │
│     }                                                                    │
│                                                                         │
│  ERROR HANDLING:                                                        │
│  ├─ If save fails → Rollback transaction                               │
│  ├─ If PDF gen fails → Store error, queue retry                        │
│  ├─ If email enqueue fails → Return partial success, admin alert       │
│  └─ All errors logged to audit_logs                                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ QUEUE WORKER: EMAIL DISPATCH (Cron Job)                                │
│ supabase/functions/process-email-queue/index.ts                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Trigger: Every 5 minutes (or immediate via webhook)                   │
│                  ↓                                                      │
│  1. FETCH Pending Jobs                                                  │
│     SELECT * FROM email_jobs                                            │
│     WHERE status = 'pending'                                            │
│     AND retry_count < 3                                                 │
│     ORDER BY created_at ASC                                             │
│     LIMIT 10  ← Batch processing                                        │
│                  ↓                                                      │
│  2. For Each Job:                                                       │
│     ├─ Fetch Blueprint data                                             │
│     ├─ Fetch PDF from Storage                                           │
│     ├─ Render Email Template (blueprint_delivery)                       │
│     │  ├─ Subject: "Seu Blueprint Arquitetural - {name}"              │
│     │  ├─ Body: Customized para language                               │
│     │  └─ Attachment: {name}-blueprint.pdf                            │
│     └─ Send via Resend API                                              │
│        POST https://api.resend.com/emails                              │
│        {                                                                │
│          from: "noreply@maxmind.tech",                                 │
│          to: email,                                                     │
│          subject: subject,                                              │
│          html: renderedTemplate,                                        │
│          attachments: [{                                                │
│            filename: "blueprint.pdf",                                   │
│            content: pdfBuffer,                                          │
│            contentType: "application/pdf"                               │
│          }]                                                              │
│        }                                                                │
│                  ↓                                                      │
│  3. UPDATE Email Status                                                 │
│     IF success:                                                         │
│       UPDATE email_jobs SET status = 'sent'                             │
│     IF failure:                                                         │
│       UPDATE email_jobs SET                                             │
│         retry_count = retry_count + 1,                                 │
│         last_error = error_message,                                     │
│         status = CASE                                                   │
│           WHEN retry_count >= 3 THEN 'failed'                          │
│           ELSE 'pending'                                                │
│         END                                                              │
│     Also UPDATE blueprints SET status = 'sent'                          │
│                  ↓                                                      │
│  4. LOG & ALERT                                                         │
│     ├─ INSERT INTO audit_logs (action, details)                         │
│     ├─ If all 3 retries failed: Slack alert to devops                  │
│     └─ Metrics: sent count, failed count, latency                       │
│                                                                         │
│  RESILIENCE:                                                             │
│  ├─ Exponential backoff: 1s → 5s → 30s                                │
│  ├─ Max retries: 3                                                      │
│  ├─ Timeout per email: 30s                                              │
│  └─ Idempotency: Same email_id won't send twice                        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ PHASE 5: AUTHENTICATION (P3 Related)                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  [User at Step 4: Google Auth or Email/Pass]                          │
│           ↓                                                             │
│  Option A: Google OAuth                                                │
│  Option B: Email/Password Signup                                       │
│  Option C: Continue Anon with Email (skip login)                       │
│                  ↓                                                      │
│  IF Autenticado:                                                       │
│    POST /auth/callback                                                  │
│           ↓                                                             │
│    Auth Middleware (linkSessionToUser)                                  │
│    ├─ Get: session_id from localStorage                                │
│    ├─ Get: user_id from Supabase Auth                                  │
│    ├─ UPDATE blueprints SET user_id = auth.uid()                      │
│    │  WHERE session_id = ?                                             │
│    ├─ UPDATE user_profiles SET email = auth.email()                   │
│    └─ DELETE session_id from localStorage                              │
│           ↓                                                             │
│  ELSE (Continue Anon):                                                  │
│    Keep session_id active                                               │
│    Store email in blueprints for future auth                            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Código de Exemplo (P1 - Backend)**

```typescript
// supabase/functions/save-blueprint/index.ts
import { createClient } from '@supabase/supabase-js';
import { generatePDF } from '../_shared/pdf-generator';
import { ResendClient } from '../_shared/email-provider';

export async function saveBlueprintAndQueue(req: Request) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL'),
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  );

  try {
    const {
      session_id,
      email,
      name,
      phone,
      company,
      role,
      blueprint,
      language
    } = await req.json();

    // 1. Validate
    if (!blueprint || !email) throw new Error('Invalid input');

    // 2. Save Blueprint
    const { data: savedBlueprint, error: saveError } = await supabase
      .from('blueprints')
      .insert({
        session_id,
        user_id: null,
        email,
        name,
        phone,
        company,
        role,
        content: blueprint,
        language,
        status: 'generated',
        created_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (saveError) throw saveError;

    const blueprint_id = savedBlueprint.id;

    // 3. Generate PDF
    const pdfBuffer = await generatePDF(blueprint, language);
    const pdfPath = `blueprints-pdf/${blueprint_id}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from('blueprints')
      .upload(pdfPath, pdfBuffer);

    if (uploadError) {
      console.error('PDF upload failed:', uploadError);
      // Continue anyway, queue retry for PDF
    }

    // 4. Enqueue Email Job
    const { error: jobError } = await supabase
      .from('email_jobs')
      .insert({
        recipient_email: email,
        blueprint_id,
        pdf_url: `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/blueprints/${pdfPath}`,
        template: 'blueprint_delivery',
        subject: `Seu Blueprint Arquitetural - ${name}`,
        status: 'pending',
        retry_count: 0,
        created_at: new Date().toISOString()
      });

    if (jobError) throw jobError;

    // 5. Trigger Email Process (if available)
    // Optional: Call process-email-queue immediately
    await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/process-email-queue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
      }
    }).catch(() => {}); // Non-blocking

    return new Response(JSON.stringify({
      success: true,
      blueprint_id,
      message: 'Blueprint salvo com sucesso!'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Save blueprint error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
```

---

### P2: AUDIO-TO-TEXT (SPEECH RECOGNITION)

#### Diagrama de Fluxo

```
┌──────────────────────────────────────────────────────────────────┐
│ PHASE 2: AUDIO TRANSCRIPTION                                     │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [User vê textarea + 🎤 icon]                                   │
│           ↓                                                      │
│  [Click 🎤] → Browser asks for microphone permission            │
│           ↓                                                      │
│  IF denied: Toast "Permissão de microfone negada"              │
│  ELSE: Start Recording                                          │
│           ↓                                                      │
│  [Visual feedback: "🔴 Gravando..."]                             │
│  [Max 120 seconds, auto-stop on silence]                        │
│           ↓                                                      │
│  [User speaks problem in Portuguese or English]                 │
│           ↓                                                      │
│  [Click 🎤 again OR timeout] → Stop Recording                   │
│           ↓                                                      │
│  Convert Audio Blob to Base64                                   │
│  ├─ browser MediaRecorder → WAV/MP3                             │
│  └─ Compress if > 25MB (Whisper limit)                          │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ CLIENT: speechToText.ts (Fallback Strategy)                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [Visual: "⏳ Transcrevendo..."]                                 │
│           ↓                                                      │
│  TRY (5 second timeout):                                         │
│    POST https://generativelanguage.googleapis.com/               │
│    /v1/models/gemini-2.0-flash-audio:generateContent            │
│    {                                                             │
│      "contents": [{                                              │
│        "parts": [{                                               │
│          "inlineData": {                                          │
│            "mimeType": "audio/wav",                              │
│            "data": base64AudioData                               │
│          }                                                        │
│        }, {                                                       │
│          "text": "Transcreva este áudio em ${language}."         │
│        }]                                                         │
│      }]                                                           │
│    }                                                             │
│                ↓                                                 │
│    RESPONSE: { text: "usuario falou isso..." }                   │
│           ↓                                                      │
│  ON SUCCESS:                                                      │
│    ├─ Insert text into textarea                                  │
│    ├─ Toast: "Transcrição concluída!"                           │
│    └─ Resume normal flow                                         │
│                                                                  │
│  ON TIMEOUT/ERROR:                                               │
│    ├─ Log error                                                  │
│    └─ FALLBACK (30 second timeout):                             │
│       POST https://api.openai.com/v1/audio/transcriptions       │
│       {                                                          │
│         "file": audioFile,                                       │
│         "model": "whisper-1",                                    │
│         "language": language === 'pt-BR' ? 'pt' : 'en'           │
│       }                                                          │
│                ↓                                                 │
│       RESPONSE: { text: "usuario falou isso..." }                │
│                ↓                                                 │
│       ON SUCCESS: Same as above                                  │
│       ON ERROR:                                                  │
│         ├─ Toast: "Falha na transcrição. Tente novamente."      │
│         ├─ Button "🔄 Tentar Novamente"                          │
│         └─ Log to error tracking (Sentry)                        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Código de Exemplo (P2 - Frontend)**

```typescript
// src/lib/audio/speechToText.ts
interface TranscriptionResult {
  text: string;
  provider: 'gemini' | 'whisper';
  timestamp: number;
}

export async function transcribeAudio(
  audioBlob: Blob,
  language: 'en' | 'pt-BR'
): Promise<TranscriptionResult> {
  const maxRetries = 2;
  let lastError: Error | null = null;

  // Strategy 1: Try Gemini Audio
  try {
    const result = await transcribeWithGemini(audioBlob, language);
    return { ...result, provider: 'gemini', timestamp: Date.now() };
  } catch (error) {
    console.warn('Gemini transcription failed, trying Whisper:', error);
    lastError = error as Error;
  }

  // Strategy 2: Fallback to OpenAI Whisper
  try {
    const result = await transcribeWithWhisper(audioBlob, language);
    return { ...result, provider: 'whisper', timestamp: Date.now() };
  } catch (error) {
    console.error('Whisper transcription failed:', error);
    lastError = error as Error;
  }

  // Both failed
  throw new Error(`Transcrição falhou: ${lastError?.message}`);
}

async function transcribeWithGemini(
  audioBlob: Blob,
  language: 'en' | 'pt-BR'
): Promise<{ text: string }> {
  const base64Audio = await blobToBase64(audioBlob);
  const mimeType = audioBlob.type || 'audio/wav';

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-audio:generateContent?key=${VITE_GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64Audio.split(',')[1] // Remove data:audio/wav;base64,
              }
            },
            {
              text: `Transcreva este áudio em ${language === 'pt-BR' ? 'Português' : 'Inglês'}. Responda apenas com a transcrição, sem explicações.`
            }
          ]
        }]
      }),
      signal: AbortSignal.timeout(5000) // 5s timeout
    }
  );

  if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  if (!text) throw new Error('Sem texto na resposta Gemini');

  return { text };
}

async function transcribeWithWhisper(
  audioBlob: Blob,
  language: 'en' | 'pt-BR'
): Promise<{ text: string }> {
  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.wav');
  formData.append('model', 'whisper-1');
  formData.append('language', language === 'pt-BR' ? 'pt' : 'en');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VITE_OPENAI_API_KEY}`
    },
    body: formData,
    signal: AbortSignal.timeout(30000) // 30s timeout
  });

  if (!response.ok) throw new Error(`Whisper API error: ${response.status}`);

  const data = await response.json();
  return { text: data.text || '' };
}

// Helper function
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
```

---

### P3: GOOGLE AUTH + SESSÃO (SESSION CONTINUITY)

#### Diagrama de Fluxo

```
┌────────────────────────────────────────────────────────────────┐
│ FASE 1-4: USUÁRIO ANÔNIMO                                      │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  [App Mount] → Generate Session ID                            │
│  session_id = crypto.randomUUID()                             │
│  localStorage.setItem('session_id', session_id)               │
│           ↓                                                    │
│  [Phases 1-4: Input + Blueprint Generation]                   │
│  All requests include: ?session_id=xxxxx                       │
│           ↓                                                    │
│  [Phase 4: Save Blueprint]                                     │
│  INSERT blueprints (session_id: xxxxx, user_id: NULL, ...)   │
│           ↓                                                    │
│  [Email queued with session tracking]                         │
│                                                                │
└────────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────────┐
│ PHASE 5: AUTH DECISION POINT                                   │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  User at "Step 4: Autentique-se"                              │
│  Opções apresentadas:                                          │
│  ├─ [Google Sign-In]                                           │
│  ├─ [Email/Password Signup]                                    │
│  └─ [Continue com Email]                                       │
│           ↓                                                    │
│  PATH A: Google Sign-In                                        │
│  ├─ Click → Google OAuth redirect                             │
│  ├─ User authorizes → Google callback                         │
│  ├─ Backend receives auth code                                │
│  ├─ Exchange code → JWT + user_id                             │
│  └─ POST /auth/callback { code, session_id }                 │
│           ↓                                                    │
│  PATH B: Email/Pass Signup                                     │
│  ├─ Form: Email + Password                                     │
│  ├─ POST /auth/signup { email, password, session_id }        │
│  ├─ Supabase creates auth.user                                │
│  └─ Backend receives user_id                                  │
│           ↓                                                    │
│  PATH C: Continue Anon                                         │
│  ├─ Skip auth, keep session_id                                │
│  ├─ Blueprint remains with session_id                         │
│  └─ Retry auth later                                          │
│                                                                │
└────────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────────┐
│ POST-AUTH MIDDLEWARE: linkSessionToUser()                      │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  [Backend receives callback with session_id + user_id]        │
│           ↓                                                    │
│  1. Fetch session_id from request                              │
│  2. Fetch user_id from JWT                                     │
│           ↓                                                    │
│  3. LINK: UPDATE blueprints                                    │
│     SET user_id = $1                                           │
│     WHERE session_id = $2                                      │
│     RETURNING *;                                               │
│           ↓                                                    │
│  4. SYNC: INSERT user_profiles (if not exists)                │
│     {                                                          │
│       id: user_id,                                             │
│       email: auth.email,                                       │
│       role: 'user', (or 'admin' if domain match)              │
│       created_at: now()                                        │
│     }                                                          │
│           ↓                                                    │
│  5. CLEANUP: localStorage.removeItem('session_id')            │
│           ↓                                                    │
│  6. RETURN to Frontend                                         │
│     {                                                          │
│       success: true,                                           │
│       user_id: "uuid-xxxxx",                                   │
│       blueprint_id: "uuid-xxxxx",                              │
│       redirect: "/phase5/step5"                                │
│     }                                                          │
│           ↓                                                    │
│  Frontend:                                                      │
│  ├─ Save JWT in auth context                                  │
│  ├─ Update RLS context (JWT payload)                          │
│  ├─ Redirect to Phase 5 continuation                          │
│  └─ Future requests use user_id (not session_id)             │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**Código de Exemplo (P3 - Middleware)**

```typescript
// src/lib/auth/linkSessionToUser.ts
import { createClient } from '@supabase/supabase-js';

export async function linkSessionToUser(
  sessionId: string,
  userId: string,
  userEmail: string
): Promise<{ success: boolean; blueprint_id?: string; error?: string }> {
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );

  try {
    // 1. Link blueprints
    const { data: blueprints, error: linkError } = await supabase
      .from('blueprints')
      .update({ user_id: userId })
      .eq('session_id', sessionId)
      .select('id')
      .single();

    if (linkError && linkError.code !== 'PGRST116') {
      throw linkError;
    }

    // 2. Create user profile if not exists
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert(
        {
          id: userId,
          email: userEmail,
          role: isAdminEmail(userEmail) ? 'admin' : 'user',
          created_at: new Date().toISOString()
        },
        { onConflict: 'id' }
      );

    if (profileError) throw profileError;

    // 3. Clear session from localStorage (frontend will do this)
    return {
      success: true,
      blueprint_id: blueprints?.id
    };
  } catch (error) {
    console.error('Link session error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

function isAdminEmail(email: string): boolean {
  return email.endsWith('@allmax') || email.endsWith('@maxmind') ||
         email.includes('@allmax.') || email.includes('@maxmind.');
}
```

---

### P4: ADMIN ACCESS + RLS (ROLE-BASED SECURITY)

#### Diagrama de Fluxo

```
┌───────────────────────────────────────────────────────────────────┐
│ ADMIN ACCESS FLOW                                                 │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  [User Signup/Login]                                              │
│           ↓                                                        │
│  [Auth complete] → user_id received                               │
│           ↓                                                        │
│  [Check user_profiles.role]                                       │
│           ├─ role = 'admin'      → Show admin link in navbar     │
│           ├─ role = 'super_admin' → Show all admin features      │
│           └─ role = 'user'       → Hide admin link               │
│           ↓                                                        │
│  IF admin:                                                         │
│    [Click "Admin Dashboard" in navbar]                            │
│           ↓                                                        │
│    Frontend navigates to /admin                                   │
│           ↓                                                        │
│    ProtectedRoute Component Checks:                               │
│    ├─ Is user authenticated?                                      │
│    │  └─ If NO → redirect /auth/login                            │
│    ├─ Is user.role === 'admin'?                                  │
│    │  └─ If NO → redirect / + toast "Access Denied"             │
│    └─ Render LeadDashboard                                        │
│           ↓                                                        │
│  [Admin Dashboard Loads]                                          │
│  ├─ Calls: SELECT * FROM leads WHERE ... (RLS filters)          │
│  ├─ Calls: SELECT * FROM lead_scores (RLS filters)              │
│  └─ Real-time subscription to changes                            │
│                                                                   │
│  IF not admin:                                                    │
│    [No "Admin Dashboard" link visible]                            │
│    [If user tries /admin manually]                               │
│           ↓                                                        │
│    ProtectedRoute rejects:                                        │
│    └─ Redirect / + toast "Acesso não autorizado"                │
│           ↓                                                        │
│  RLS Policies Enforce:                                            │
│  ├─ Even if frontend bypassed, backend denies                    │
│  └─ User never sees other users' data                            │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

**Database Schema (P4)**

```sql
-- Add role column to user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';

-- RLS Policy: Admin can view all leads
CREATE POLICY admin_view_all_leads ON leads
  FOR SELECT
  USING (
    (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin'
    OR (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'super_admin'
    OR auth.uid() = user_id  -- User can always view own
  );

-- RLS Policy: Admin can update leads
CREATE POLICY admin_update_leads ON leads
  FOR UPDATE
  USING (
    (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin'
    OR (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'super_admin'
  );

-- Audit trail
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP DEFAULT now()
);

-- Enable RLS on audit
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can only view their own audit logs
CREATE POLICY user_view_own_audit ON audit_logs
  FOR SELECT
  USING (auth.uid() = user_id OR (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('admin', 'super_admin'));
```

---

## DESIGN DE BANCO DE DADOS

### Diagrama de Entidades (ERD)

```
┌─────────────────────┐
│   auth.users        │
├─────────────────────┤
│ id (PK)             │
│ email               │
│ encrypted_password  │
│ created_at          │
└──────────┬──────────┘
           │ 1:1
           │
┌──────────▼──────────────────┐
│    user_profiles            │
├─────────────────────────────┤
│ id (PK, FK auth.users)      │
│ email                       │
│ role ('user'/'admin'/...)   │ ◄─── NEW (P4)
│ preferred_language          │
│ created_at                  │
└──────────┬──────────────────┘
           │ 1:N
           │
┌──────────▼──────────────────────┐
│      blueprints                 │
├─────────────────────────────────┤
│ id (PK)                         │
│ session_id (anon tracking)      │ ◄─── NEW (P1)
│ user_id (FK user_profiles, NK)  │ ◄─── NEW (P1)
│ email                           │ ◄─── NEW (P1)
│ name                            │ ◄─── NEW (P1)
│ phone                           │ ◄─── NEW (P1)
│ company                         │ ◄─── NEW (P1)
│ role                            │ ◄─── NEW (P1)
│ content (JSONB)                 │
│ language ('en'/'pt-BR')         │ ◄─── NEW (P1)
│ status ('generated'/'sent'/...) │ ◄─── NEW (P1)
│ created_at                      │
│ updated_at                      │
└──────────┬──────────────────────┘
           │ 1:N
           ├────────────────────────┐
           │                        │
    ┌──────▼─────────┐    ┌─────────▼────────────┐
    │  leads          │    │  email_jobs         │
    ├─────────────────┤    ├─────────────────────┤
    │ id (PK)         │    │ id (PK)             │
    │ blueprint_id    │    │ blueprint_id        │
    │ (FK)            │    │ (FK)                │
    │ user_id         │    │ recipient_email     │ ◄─ NEW (P1)
    │ (FK user_prof..)│    │ template            │ ◄─ NEW (P1)
    │ status          │    │ status ('pending'..│ ◄─ NEW (P1)
    │ created_at      │    │ retry_count         │ ◄─ NEW (P1)
    │                 │    │ last_error          │ ◄─ NEW (P1)
    └────────┬────────┘    │ created_at          │
             │             └────────┬────────────┘
             │ 1:N                   │
             │              ┌────────▼─────────────────┐
             │              │  email_sequences        │
             │              ├────────────────────────┤
             │              │ id (PK)                 │
             │              │ lead_id (FK)            │
             │              │ sequence_type           │
             │              │ ('quente'/'acompanhando'..
             │              │ status                  │
             │              │ sent_at                 │
             │              │ opened_at               │
             │              └────────────────────────┘
             │ 1:N
    ┌────────▼──────────────┐
    │  lead_scores          │
    ├───────────────────────┤
    │ id (PK)               │
    │ lead_id (FK)          │
    │ score (0-100)         │
    │ criteria (JSONB)      │
    │ calculated_at         │
    └───────────────────────┘

ALL TABLES: Enable RLS with auth context
```

---

## INTEGRAÇÃO DE SERVIÇOS EXTERNOS

### API Provider Strategy

```
┌───────────────────────────────────────────────────────────┐
│ AI PROVIDERS: Multi-Stack Resilience                      │
├───────────────────────────────────────────────────────────┤
│                                                           │
│ BLUEPRINT GENERATION:                                     │
│  1. Try: Gemini 2.0 Flash                                │
│     ├─ Timeout: 30s                                       │
│     ├─ Retries: 2                                         │
│     └─ Rate limit: 100 req/min                           │
│  2. Fallback: OpenAI GPT-4                               │
│     ├─ Timeout: 45s                                       │
│     ├─ Retries: 1                                         │
│     └─ Rate limit: 50 req/min                            │
│  3. Error: Return cached blueprint or error page         │
│                                                           │
│ AUDIO TRANSCRIPTION:                                      │
│  1. Try: Gemini 2.0 Audio                                │
│     ├─ Timeout: 5s                                        │
│     ├─ Retries: 0                                         │
│     └─ Max file: 25MB                                     │
│  2. Fallback: OpenAI Whisper                              │
│     ├─ Timeout: 30s                                       │
│     ├─ Retries: 1                                         │
│     └─ Max file: 25MB                                     │
│  3. Error: User retries manually                          │
│                                                           │
└───────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────┐
│ EMAIL PROVIDER: Resend                                    │
├───────────────────────────────────────────────────────────┤
│                                                           │
│ Template: blueprint_delivery                              │
│  ├─ Subject: "Seu Blueprint Arquitetural - {name}"       │
│  ├─ From: noreply@maxmind.tech                           │
│  ├─ Body: Customized for language                        │
│  ├─ Attachment: {name}-blueprint.pdf                     │
│  └─ Resend tracking: Opens + clicks                      │
│                                                           │
│ Rate limit: 100 emails/min                               │
│ Retry strategy: Exponential backoff (1s, 5s, 30s)       │
│                                                           │
└───────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────┐
│ AUTH PROVIDER: Supabase Auth + Google OAuth               │
├───────────────────────────────────────────────────────────┤
│                                                           │
│ Methods:                                                  │
│  ├─ Email/Password (custom signup)                       │
│  ├─ Google OAuth 2.0                                      │
│  └─ Email magic link (optional)                          │
│                                                           │
│ JWT:                                                      │
│  ├─ HS256 signed                                          │
│  ├─ Includes: user_id, email, role (custom claim)       │
│  ├─ Expiry: 1 hour                                        │
│  └─ Refresh: Via refresh_token (7 days)                  │
│                                                           │
│ Storage: httpOnly cookie (secure)                        │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

---

## PADRÕES & DECISÕES ARQUITETURAIS

### Tabela de Decisões Críticas

| Decisão | Opções | Escolhido | Justificativa |
|---------|--------|-----------|---------------|
| **P1: Quando salvar blueprint?** | Imediato / Após confirmar | Após confirmar + antes Phase 5 | Minimiza risco, usuário controla |
| **P1: Email attachment vs link?** | Anexado / Link | Anexado (PDF) | Melhor UX, sem click extra |
| **P2: Armazenar áudio?** | Sim / Não | Não | GDPR + Privacy (sem dado pessoal) |
| **P2: Timeout transcrição** | 30s / 45s / 60s | 45s total | 5s Gemini + 30s Whisper + buffer |
| **P3: Session tracking** | Client-side / Server-side | Ambos | Redundância + auditoria |
| **P3: Email priority post-auth** | Auth email / Phase 4 | Auth email | Garante contato correto |
| **P4: Role storage** | JWT / Database | Database | Auditável + mutável |
| **P4: Admin discovery** | Email domain / Explicit role | Ambos | Fail-safe |
| **Data persistence** | Queue async / Sync | Async queue | Não bloqueia UX |
| **Error handling** | Retry auto / Manual | Auto + manual option | Balanceado |

---

## ERROR HANDLING & RESILIENCE

### Estratégia de Resiliência Completa

```
┌──────────────────────────────────────────────────────────────┐
│ ERROR HANDLING BY LAYER                                      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ PRESENTATION (React):                                        │
│  ├─ ErrorBoundary wrapper                                    │
│  ├─ Toast notifications (1-3 segundos)                       │
│  ├─ Fallback UI (reset button)                               │
│  └─ User-friendly messages                                   │
│                                                              │
│ APPLICATION (Edge Functions):                                │
│  ├─ Input validation (zod schemas)                           │
│  ├─ Try-catch blocks                                         │
│  ├─ Structured error logging                                 │
│  ├─ Automatic retry (exponential backoff)                    │
│  └─ Circuit breaker pattern (if API down)                   │
│                                                              │
│ AI PROVIDERS:                                                │
│  ├─ Timeout handling (per provider)                          │
│  ├─ Rate limit detection (429 response)                      │
│  ├─ Fallback strategy (Gemini → OpenAI)                      │
│  ├─ Graceful degradation (cached response)                   │
│  └─ Alert on consistent failures (Slack)                     │
│                                                              │
│ DATABASE:                                                    │
│  ├─ Transaction rollback (atomic operations)                 │
│  ├─ Connection pooling (avoid timeout)                       │
│  ├─ Unique constraints (no duplicates)                       │
│  └─ Soft deletes (audit trail)                               │
│                                                              │
│ EMAIL QUEUE:                                                 │
│  ├─ Idempotency keys (no duplicate sends)                    │
│  ├─ Retry strategy (1s → 5s → 30s)                          │
│  ├─ Max retries: 3                                           │
│  ├─ Failed jobs logged for manual review                     │
│  └─ Admin alert if > 10% failure rate                        │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ SPECIFIC ERROR SCENARIOS                                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ P1: Blueprint Save Fails                                     │
│  ├─ Error type: DB write error                              │
│  ├─ User sees: "Falha ao salvar. Tente novamente"           │
│  ├─ Retry: Frontend can retry button                         │
│  ├─ Log: audit_logs com stack trace                          │
│  └─ Alert: Slack se > 5 erros em 5 min                      │
│                                                              │
│ P1: PDF Generation Fails                                     │
│  ├─ Error type: File generation error                       │
│  ├─ User sees: "Blueprint salvo. PDF em processamento"      │
│  ├─ Retry: Async job queue                                   │
│  ├─ Fallback: Email link para revisar online                │
│  └─ Log: Tracked separately para analytics                  │
│                                                              │
│ P1: Email Send Fails                                         │
│  ├─ Error type: Email API timeout/reject                    │
│  ├─ Blueprint saved: ✅ (no user impact)                    │
│  ├─ Retry: Automatic (3 attempts)                            │
│  ├─ Fallback: Manual send button in admin                    │
│  └─ Log: email_jobs.last_error para debug                   │
│                                                              │
│ P2: Audio Transcription Fails                               │
│  ├─ Error type: Both Gemini + Whisper fail                 │
│  ├─ User sees: "Transcrição falhou. Tentar novamente?"      │
│  ├─ Retry: User-initiated only                              │
│  ├─ Fallback: Type manually                                  │
│  └─ Log: Provider + error code para analytics               │
│                                                              │
│ P3: Auth Linking Fails                                       │
│  ├─ Error type: Session not found or DB error              │
│  ├─ User sees: "Falha ao vincular conta. Tente login novamente" │
│  ├─ Retry: Full auth flow                                    │
│  ├─ Fallback: Create new account (link later manually)       │
│  └─ Log: Session + user_id para debugging                   │
│                                                              │
│ P4: Admin Unauthorized                                       │
│  ├─ Error type: Role check failed                           │
│  ├─ User sees: "Acesso não autorizado"                      │
│  ├─ Frontend: Redirect to /                                  │
│  ├─ Backend: Deny query (RLS enforced)                      │
│  └─ Log: audit_logs com user_id + attempted action         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## ROADMAP DE IMPLEMENTAÇÃO

### Sprint Timeline (4 semanas recomendadas)

```
┌──────────────────────────────────────────────────────────────┐
│ SEMANA 1: P1 + P4 Paralelamente                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ P1 - Blueprint Persistência (3 devs)                         │
│  ├─ Day 1-2: Database schema + migrations                    │
│  ├─ Day 2-3: Edge function (save-blueprint)                  │
│  ├─ Day 3-4: Email queue worker                              │
│  ├─ Day 4-5: Frontend integration (Phase 4 → save button)   │
│  └─ Day 5: Testing + error scenarios                        │
│                                                              │
│ P4 - Admin Access (1-2 devs)                                 │
│  ├─ Day 1-2: RLS policies + role column                      │
│  ├─ Day 2-3: ProtectedRoute component                        │
│  ├─ Day 3-4: Admin route + navbar conditional               │
│  ├─ Day 4-5: LeadDashboard visibility                        │
│  └─ Day 5: Testing + permission scenarios                   │
│                                                              │
│ QA: Smoke tests (both features)                              │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ SEMANA 2: P3 (Depends on P1) + Parallelizar P2              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ P3 - Auth + Session Linking (2 devs)                         │
│  ├─ Day 1-2: Session management (localStorage + UUID)        │
│  ├─ Day 2-3: Post-auth middleware (linkSessionToUser)       │
│  ├─ Day 3-4: Phase 5 integration (Step 4 auth flow)         │
│  ├─ Day 4-5: Blueprint recovery post-auth                    │
│  └─ Day 5: Testing (anon → auth journeys)                   │
│                                                              │
│ P2 - Audio Transcription (1-2 devs)                          │
│  ├─ Day 1-2: Audio capture (Web Audio API)                   │
│  ├─ Day 2-3: speechToText.ts module                          │
│  ├─ Day 3-4: Gemini + Whisper integration                    │
│  ├─ Day 4: Phase 2 UI component                              │
│  └─ Day 5: Testing (both providers + fallback)              │
│                                                              │
│ QA: Integration tests (P1 → P3 flow)                         │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ SEMANA 3: P2 Refinement + P5-P9 Quick Wins                   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ P2 - Audio Polish (1 dev)                                    │
│  ├─ Error handling + edge cases                              │
│  ├─ UI feedback (recording/transcribing states)             │
│  ├─ Timeout + retry button                                   │
│  └─ E2E tests (audio-to-blueprint flow)                     │
│                                                              │
│ P5 - Language em IA (1 dev)                                  │
│  ├─ System prompt + language parameter                       │
│  ├─ Providers: Gemini + OpenAI adapters                      │
│  └─ Testing: EN + PT-BR blueprints                           │
│                                                              │
│ P6 - Badge Tradução (15 min)                                 │
│  └─ i18n keys + LandingPage component                        │
│                                                              │
│ P7 - Exemplo Completo (15 min)                               │
│  └─ Textarea concatenation logic (Phase 2)                   │
│                                                              │
│ P8 - Navbar Z-Index (30 min)                                 │
│  └─ CSS fix (Phase 4 + 5 overlap)                            │
│                                                              │
│ P9 - Remove Tech Arch (10 min)                               │
│  └─ Filter blueprint display (frontend + PDF)               │
│                                                              │
│ QA: Full regression + translation tests                      │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ SEMANA 4: Polish + Testing + Deployment                      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ Bug fixes from Semana 3                                      │
│ Performance optimization                                     │
│ Security audit (RLS, auth, API keys)                         │
│ Load testing (email queue, AI providers)                     │
│ User acceptance testing (UAT)                                │
│ Documentation update                                         │
│ Staging deployment                                           │
│ Production deployment                                        │
│ Monitoring + alerting setup                                  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## MÉTRICAS & MONITORAMENTO

### KPIs para Rastrear

```
Blueprint Delivery:
├─ Save success rate (target: 99.5%)
├─ Email delivery rate (target: 98%)
├─ Time to delivery (target: < 2 min)
└─ PDF generation time (target: < 5s)

Audio Transcription:
├─ Success rate (target: 95%)
├─ Provider fallback rate (target: < 5%)
├─ Latency (target: < 30s)
└─ Accuracy feedback (user rating)

Auth & Session:
├─ Session to user link success (target: 99%)
├─ Login completion rate (target: 80%)
├─ Session timeout (target: 30 days)
└─ Auth error rate (target: < 1%)

Admin Access:
├─ RLS policy enforcement rate (target: 100%)
├─ Unauthorized access attempts (target: 0)
├─ Admin action audit completeness (target: 100%)
└─ Dashboard query latency (target: < 500ms)
```

---

## CONCLUSÃO

Esta arquitetura estabelece uma base sólida para o Synkra AIOS com:

✅ **Escalabilidade**: Microserviços + Edge Functions
✅ **Resiliência**: Multi-provider fallback + retry estratégias
✅ **Segurança**: RLS + JWT + audit trails
✅ **Observabilidade**: Logging estruturado + alertas
✅ **Flexibilidade**: Fácil adicionar novos provedores/idiomas

**Próximas etapas**: Priorização PO + Estimativas de desenvolvimento

---

**Documento finalizado por**: Aria (Visionary Architect)
**Data**: 2026-02-03
**Status**: Pronto para Desenvolvimento ✅
