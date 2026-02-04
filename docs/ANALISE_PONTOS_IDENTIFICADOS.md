# 📋 Análise de Pontos Identificados - Synkra AIOS

**Data**: 2026-02-03
**Agent**: Atlas (Analyst)
**Status**: Pronto para Arquitetura + Priorização PO

---

## 📊 RESUMO EXECUTIVO

| Total Pontos | Para Arquiteta | Para PO | Simples Dev |
|-------------|-----------------|---------|------------|
| **9** | **4** | **3** | **2** |

---

## 🔴 PONTOS CRÍTICOS PARA @ARCHITECT

### **P1: Blueprint - Fluxo Completo de Persistência + Email Automático**

**Status**: ❌ CRÍTICO - Incompleto

**Descoberta na Codebase**:
- ✅ Geração de Blueprint: Implementada (Gemini + OpenAI fallback)
- ✅ PDF Generator: Implementado (jsPDF)
- ✅ Email Service: Implementado (Resend via Edge Function)
- ✅ Email Sequences: Implementado (3 fluxos: quente/acompanhando/morno)
- ❌ **Integração entre geração e persistência**: NÃO EXISTE
- ❌ **Trigger automático de email**: NÃO EXISTE

**Fluxo Esperado**:
```
Phase 4: Blueprint gerado
         ↓
    [Usuário preenche: Nome, Email, Telefone, Empresa, Cargo]
         ↓
    [SALVAR blueprint em BD: blueprints table]
    - Chave: user_id (se logged) ou session_id (anon)
    - Campos: title, executive_summary, problem_statement, etc.
    - PDF: Gerar e guardar path
         ↓
    [Enviar email automático com PDF]
    - Email para: endereço preenchido na Phase 4 (ou login)
    - Conteúdo: Blueprint em PDF attachment
    - Template: blueprint_delivery
    - Inicia email_sequence (quente/acompanhando/morno baseado score)
         ↓
    Phase 5: Lead Scoring + Engagement
```

**Localização do Código**:
- **Frontend**: `src/components/phases/Phase4.tsx` (adicionar lógica de save)
- **Backend**: `src/lib/ai/blueprint.ts` (adicionar chamada de persistência)
- **Edge Function**: `supabase/functions/send-email/index.ts` (adicionar PDF attachment)
- **Database**: Já existe schema em `supabase/migrations/00005_create_blueprints.sql`

**Decisões Arquiteturais Necessárias**:
1. **Quando exatamente salvar?**
   - Opção A: Assim que gera (automático, usuário nem vê)
   - Opção B: Após usuário confirmar "Usar exemplo" (mais controle)
   - **Recomendação**: Opção B (menos risco de salvar lixo)

2. **Email attachment ou link?**
   - Opção A: PDF anexado ao email (mais pesado)
   - Opção B: Link para download no email (mais leve)
   - **Recomendação**: Opção A (melhor UX, não precisa login)

3. **Sequência de email**:
   - Score não disponível ainda (Phase 5)
   - Usar status padrão ("acompanhando") ou aguardar Phase 5?
   - **Recomendação**: Enviar immediate com template "blueprint_delivery", depois re-score após Phase 5

**Complexidade**: ⭐⭐⭐ ALTO

**Estimativa de Desenvolvimento**: Sprint completa

**Bloqueadores**: Nenhum (código base existe)

---

### **P2: Audio-to-Text (Speech Recognition)**

**Status**: ❌ Não implementado

**Requisitos**:
- ✅ Primário: Gemini (multimodal com audio)
- ✅ Fallback: OpenAI Whisper
- ✅ Online only (sem offline)
- ✅ Fluxo: `Usuário fala → Áudio enviado → Transcrição → Inserido em textarea`
- ✅ Ícone: Similar ChatGPT (Whisper-like)

**Localização do Desenvolvimento**:
- **Frontend UI**: `src/components/phases/Phase2.tsx` (ícone + trigger)
- **New Module**: `src/lib/audio/speechToText.ts` (lógica de transcrição)
- **New Module**: `src/lib/ai/providers/audioTranscription.ts` (integração Gemini/OpenAI)

**Fluxo de Implementação**:
```
Componente Phase 2:
  [Input textarea] [🎤 Ícone Audio]
           ↓
    Usuário clica e fala
           ↓
    Captura áudio via Web Audio API
           ↓
    Envia para speechToText.ts
           ↓
    Tenta Gemini audio transcription
           ↓
    Se falha, fallback OpenAI Whisper
           ↓
    Resultado insere no textarea (após texto existente)
           ↓
    Prossegue com lógica normal
```

**APIs Necessárias**:
1. **Gemini 2.0 Flash Audio**:
   - Endpoint: POST `/v1/models/gemini-2.0-flash-audio:generateContent`
   - Suporta arquivo de áudio ou base64
   - Resposta: transcription string

2. **OpenAI Whisper**:
   - Endpoint: POST `/v1/audio/transcriptions`
   - Modelo: `whisper-1`
   - Resposta: transcription object com `text`

**Decisões Arquiteturais**:
1. **Armazenar áudio ou descartar após transcrição?**
   - Recomendação: Descartar (GDPR, privacidade)

2. **Timeout e retry**:
   - Timeout: 30s (áudio pode ser longo)
   - Retries: 2 (igual blueprint)

3. **Erro handling**:
   - Se áudio muito longo/pequeno
   - Se áudio ininteligível
   - Se ambas APIs falham

**Complexidade**: ⭐⭐⭐ ALTO

**Estimativa**: 3-5 dias (integração + testes)

**Bloqueadores**: Precisa VITE_OPENAI_API_KEY configurada para fallback

---

### **P3: Google Auth - Fluxo de Sessão + Não Perder Blueprint**

**Status**: ⚠️ Problema em 2 camadas

**Problema 1: Google Auth não exibe sempre**
- Localização: Provavelmente `src/components/phases/Phase5/Step4Schedule.tsx`
- Causa: VITE_GOOGLE_AUTH_CLIENT_ID não configurado ou renderização condicional errada
- Fix: Verificar env vars e lógica de exibição

**Problema 2: Blueprint perdido após login**
- Causa raiz: Blueprint não persistido ANTES de auth
- **Crítica**: Se solucionar P1 (persistência), este problema desaparece

**Fluxo Esperado com Auth**:
```
Phase 4: Blueprint gerado
         ↓
    [Dados pessoais: Nome, Email, Telefone, etc.]
         ↓
    [SALVAR Blueprint em BD] ← P1 (persistência)
         ↓
    Phase 5: Google Auth OU Signup/Login tradicional
         ↓
    [Auth completa, user_id vinculado]
         ↓
    [Blueprint agora referencia user_id real (não mais session)]
         ↓
    [Email enviado para email de login]
```

**Decisões Arquiteturais**:
1. **Como vincular blueprint anon ao user depois de auth?**
   - Stage 1 (anon): blueprint.session_id = session UUID
   - Stage 2 (post-auth): UPDATE blueprints SET user_id = auth.uid() WHERE session_id = ?
   - Recomendação: Middleware na auth callback

2. **Email qual usar?**
   - Se veio de Google Auth: email do Google
   - Se signup: email de signup
   - Se anon: email de Phase 4
   - Prioridade: Auth email > Phase 4 email

3. **RLS para acesso**:
   - Verificar policies em `00005_create_blueprints.sql`
   - Garantir que user pode acessar seu próprio blueprint pós-auth

**Localização do Código**:
- **Auth flow**: `supabase/` (já configurado)
- **Blueprint linking**: Novo middleware em `src/lib/auth/`
- **Phase 4 → Phase 5**: `src/components/phases/Phase5/` (recuperar blueprint do BD)

**Complexidade**: ⭐⭐⭐ ALTO

**Estimativa**: 3-4 dias

**Bloqueadores**: Depende de P1 (persistência)

---

### **P4: Admin Access - RLS + Verificação de Role**

**Status**: ⚠️ Desenvolvido mas não visível

**Descoberta na Codebase**:
- ✅ Componente completo: `src/components/admin/LeadDashboard/` (Story 5.5)
- ✅ Funcionalidades: Kanban + Tabela + Filtros + Real-time
- ✅ RLS policies: `supabase/migrations/00016_leads_rls_security.sql`
- ❌ **Rota/navegação não configurada**
- ❌ **Verificação de role não implementada no frontend**

**O Que Existe no Banco**:
```sql
-- RLS Policy (00016)
admin_team_view_leads:
  Acesso se: auth.jwt() ->> 'email' LIKE '%@allmax%'
          OR auth.jwt() ->> 'email' LIKE '%@maxmind%'
```

**O Que Falta**:
1. **Role no banco de dados**: Coluna `role` em `auth.users` ou `user_profiles`
   - Tipo: 'admin' | 'user'
   - Default: 'user'

2. **Verificação frontend**: Guard/Protected Route
   - Antes de renderizar LeadDashboard
   - Verificar `user.role === 'admin'`

3. **Rota/Navegação**: Acessar onde?
   - `/admin` (nova rota)
   - Ou link na navbar/menu (condicional se admin)

**Fluxo Esperado**:
```
Usuário faz cadastro/login
        ↓
    Verifica if user.role === 'admin'
        ↓
    SIM: Mostra link "Admin Dashboard" na navbar
    NÃO: Sem acesso
        ↓
    Admin clica: Navega para `/admin`
        ↓
    Componente verifica:
      - user autenticado?
      - user.role === 'admin'?
      - Caso contrário: redireciona
        ↓
    LeadDashboard carrega dados via RLS
```

**Localização do Desenvolvimento**:
- **Database**: `src/lib/auth/` (adicionar role check function)
- **Frontend**: `src/App.tsx` (adicionar rota `/admin`)
- **Navigation**: `src/components/` (adicionar conditional admin link)
- **Guard**: `src/lib/auth/requireAdmin.ts` (new file)

**Decisões Arquiteturais**:
1. **Como definir admin?**
   - Opção A: Email domain (@allmax, @maxmind)
   - Opção B: Coluna role explícita no banco
   - Opção C: Combinação (domain + flag)
   - **Recomendação**: Opção B + C (mais flexível)

2. **RLS: Email vs role?**
   - Atual: Email domain checking
   - Novo: user.role = 'admin'
   - Recomendação: Manter ambos (fail-safe)

3. **Super-admin override?**
   - Se houver super-admin, pode ver tudo?
   - Roles sugeridos: 'user' | 'admin' | 'super_admin'

**Schema Sugerido**:
```sql
-- Adicionar em user_profiles ou auth.users metadata
ALTER TABLE user_profiles ADD COLUMN role VARCHAR DEFAULT 'user';
-- Valores: 'user', 'admin', 'super_admin'

-- Ou usar JWT metadata
UPDATE auth.users
SET raw_app_meta_data = jsonb_set(raw_app_meta_data, '{role}', '"admin"')
WHERE email LIKE '%@allmax%';
```

**Complexidade**: ⭐⭐ MÉDIO

**Estimativa**: 2-3 dias

**Bloqueadores**: Nenhum

---

## 🟡 PONTOS PARA PO (Priorização)

### **P5: Idioma não aplicado em todas as fases + IA ignora idioma**

**Status**: ⚠️ Parcialmente implementado

**Level 1 - Frontend (i18n)**:
- ✅ Configurado: `src/i18n/config.ts`
- ✅ Arquivos: `src/i18n/locales/pt-BR/` e `en/`
- ❌ **Nem todas fases usam `useTranslation()`**
- ❌ **Verificação**: Phase 2, Phase 3 podem estar hardcoded

**Level 2 - IA (Critical)**:
- ❌ **Gemini/OpenAI não respeitam idioma selecionado**
- ❌ **System prompt não inclui language parameter**
- ❌ **Blueprint sempre em inglês mesmo com PT selecionado**

**Exemplo do Problema**:
```
Usuário clica: "PT" (Português)
       ↓
UI traduz para português ✅
       ↓
Fase 3: "Qual é seu problema?"
       ↓
Usuário responde em português
       ↓
AI gera Blueprint em INGLÊS ❌
       ↓
Mistura: UI em PT + Conteúdo em EN
```

**Localização do Problema**:
- **Frontend**: `src/lib/ai/blueprint.ts` (linha ~45-60)
  ```typescript
  // ANTES:
  const systemPrompt = `You are a technical architect...`;

  // DEPOIS:
  const systemPrompt = `You are a technical architect...
  Respond in ${selectedLanguage === 'pt-BR' ? 'Portuguese' : 'English'}.
  Use proper terminology in the selected language.`;
  ```

- **Backend**: `supabase/functions/generate-blueprint/index.ts`
  ```typescript
  // Adicionar language ao request body
  const { problemText, dimensions, answers, complexity, language } = await req.json();
  ```

- **Providers**: `src/lib/ai/providers/gemini.ts` e `openai.ts`
  ```typescript
  // Passar language no prompt
  const fullPrompt = `${systemPrompt}\nLanguage: ${language}`;
  ```

**Complexidade**: ⭐⭐ MÉDIO

**Estimativa**: 1-2 dias

**Prioridade**: ALTA (impacto direto UX)

---

### **P6: Badge "Ai-Driven Smart Solutions" não traduz**

**Status**: ✅ Confirmado - Bug de i18n

**Localização**: `src/components/LandingPage.tsx` (provável)

**Causa**: Badge text faltando chave de tradução em:
- `src/i18n/locales/pt-BR/landing.json`
- `src/i18n/locales/en/landing.json`

**Fix**:
1. Adicionar chave em ambos os arquivos:
   ```json
   // pt-BR/landing.json
   "badge_ai_driven": "Soluções Inteligentes Orientadas por IA"

   // en/landing.json
   "badge_ai_driven": "AI-Driven Smart Solutions"
   ```

2. Usar `useTranslation()` no componente:
   ```typescript
   const { t } = useTranslation('landing');
   return <span>{t('badge_ai_driven')}</span>;
   ```

**Complexidade**: ⭐ SIMPLES

**Estimativa**: 30 minutos

**Prioridade**: BAIXA (cosmético)

---

### **P7: Botão "Usar Exemplo Completo" não preserva texto**

**Status**: ❌ Não implementado

**Localização**: `src/components/phases/Phase2.tsx`

**Requisito**:
- Ao clicar "Usar exemplo completo"
- NÃO apagar texto já escrito
- Inserir espaço + quebra de linha
- Adicionar exemplo consolidado das perguntas guias

**Exemplo esperado**:
```
[Texto original do usuário]

[Espaço vazio]

[Exemplo consolidado gerado]
```

**Fix**:
```typescript
// ANTES:
setTextarea(exampleText);

// DEPOIS:
const currentText = textarea.trim();
const consolidated = currentText
  ? `${currentText}\n\n${exampleText}`
  : exampleText;
setTextarea(consolidated);
```

**Complexidade**: ⭐ SIMPLES

**Estimativa**: 15 minutos

**Prioridade**: MÉDIA (UX)

---

## ✅ PONTOS SIMPLES PARA DEV

### **P8: Navbar sobrepondo conteúdo (Phase 4 + 5)**

**Status**: ✅ Confirmado (imagens mostram overlap)

**Localização**: Navbar Z-index ou posicionamento CSS quebrado
- Verificar `src/components/layout/` ou `src/App.tsx`
- Imagens evidenciam overlap em:
  - Phase 4: "Perguntas Personalizadas"
  - Phase 5: Área de progress bar

**Fix**: Aumentar margin-top ou ajustar z-index do navbar

**Complexidade**: ⭐ SIMPLES

**Estimativa**: 15-30 minutos

**Prioridade**: MÉDIA (UI/UX)

---

### **P9: Remover Arquitetura Técnica do Blueprint (Frontend)**

**Status**: ✅ Simples filtro de exibição

**Requisito**:
- ❌ **Frontend**: Não exibir campo `technicalArchitecture`
- ✅ **Backend**: Manter geração (para futuras APIs)

**Localização**:
- `src/components/phases/Phase4.tsx` (remover renderização)
- `src/lib/pdf/blueprintGenerator.ts` (remover da exibição no PDF)

**Fix**:
```typescript
// ANTES:
{blueprint.technicalArchitecture && (
  <div>{blueprint.technicalArchitecture}</div>
)}

// DEPOIS:
// Remover completamente (ou comentar para futura API)
```

**Complexidade**: ⭐ SIMPLES

**Estimativa**: 10 minutos

**Prioridade**: BAIXA (pode ficar para Sprint próximo)

---

## 📋 TABELA RESUMIDA DE FLUXO

| # | Ponto | Criticidade | Fluxo | Est. Dias | Bloqueador |
|---|-------|-------------|-------|-----------|-----------|
| P1 | Blueprint persistência + email | 🔴 CRÍTICA | @architect → Dev | 5 | Nenhum |
| P2 | Audio-to-text | 🔴 CRÍTICA | @architect → Dev | 4 | API keys |
| P3 | Google Auth + sessão | 🔴 CRÍTICA | @architect → Dev | 4 | Depende P1 |
| P4 | Admin access + RLS | 🟡 ALTA | @architect → Dev | 3 | Nenhum |
| P5 | Idioma em IA | 🟡 ALTA | PO → Dev | 2 | Nenhum |
| P6 | Badge tradução | 🟡 MÉDIA | PO → Dev | 0.5 | Nenhum |
| P7 | Exemplo completo | 🟡 MÉDIA | PO → Dev | 0.25 | Nenhum |
| P8 | Navbar overlap | 🟡 MÉDIA | PO → Dev | 0.5 | Nenhum |
| P9 | Remover tech arch | 🟢 BAIXA | PO → Dev | 0.25 | Nenhum |

---

## 🎯 RECOMENDAÇÃO DE EXECUÇÃO

### **Sprint Sequencial Sugerido**

**Sprint 1 (Arquitetura)**:
```
Week 1:
- @architect: P1 (Blueprint persistência) + P3 (Auth sessão)
- @architect: P4 (Admin RLS)
- @architect: P2 (Audio-to-text design)
```

**Sprint 2 (Desenvolvimento)**:
```
Week 2-3:
- @dev: P1 + P3 + P4 (blocos críticos)
- Testes com usuários reais

Week 4:
- @dev: P2 (audio-to-text implementação)
- @dev: P5 + P6 + P7 + P8 + P9 (quick wins)
```

---

## ⚠️ DEPENDÊNCIAS CRÍTICAS

```
P1 (Blueprint persistência)
  ↓
P3 (Auth sessão) depende de P1
  ↓
P5 (Idioma IA) - independente, pode paralelizar
P6, P7, P8, P9 - independentes, podem fazer anytime
  ↓
P2 (Audio) - independente, pode paralelizar
P4 (Admin) - independente, pode paralelizar
```

---

## 📝 PRÓXIMAS AÇÕES

1. **Para @architect**: Revisar seções de P1, P2, P3, P4 e confirmar abordagem
2. **Para @po**: Revisar seções de P5-P9 e priorizar no backlog
3. **Para @dev**: Aguardar decisões de arquitetura antes de iniciar P1, P2, P3, P4

---

**Documento gerado por**: Atlas (Analyst Agent)
**Data**: 2026-02-03
**Próxima revisão**: Após decisões arquiteturais
