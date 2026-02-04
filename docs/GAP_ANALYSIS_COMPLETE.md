# GAP ANALYSIS COMPLETO - ALL MAX MIND

**Data:** 30/01/2026
**Versao:** 1.0
**Analista:** @architect (Aria)
**Status:** Analise Completa

---

## SUMARIO EXECUTIVO

Este documento apresenta uma analise end-to-end comparando:
- **MAPA DO PRODUTO** (Fluxo Funcional v2.0)
- **PRD Oficial** (v1.1 - 26/01/2026)
- **Implementacao Atual** (Codebase All_Max_Mind_System)

### RESULTADO GERAL

| Metrica | Valor |
|---------|-------|
| **Fases Especificadas (PRD)** | 6 (0-5) |
| **Fases Implementadas** | 5 (0-4) |
| **Fase Totalmente Ausente** | FASE 5 (Hot Lead Conversion) |
| **Funcionalidades Mockadas** | 6+ criticas |
| **Integracao Real** | ~60% |
| **Pronto para Producao** | NAO |

---

## 1. ANALISE POR FASE

### FASE 0 - Passive Data Layer (Visitante Anonimo)

| Requisito PRD | Status | Gap |
|---------------|--------|-----|
| IP, pais, cidade (geo) | PARCIAL | Nao ha captura de IP/geo real |
| Device, OS, browser | IMPLEMENTADO | Via analytics |
| Fonte (UTM, LinkedIn, Google) | PARCIAL | UTM capturado, falta atribuicao |
| Scroll, tempo sessao, cliques | IMPLEMENTADO | Via analytics |
| Anonymous Visitor ID | IMPLEMENTADO | `am_visitor_id` em localStorage |
| GA4 / GTM / PostHog | PARCIAL | GA4 parcial, GTM/PostHog ausentes |

**Arquivos Relevantes:**
- `lib/analytics/visitor.ts` - Visitor tracking
- `lib/analytics/session.ts` - Session management
- `supabase/migrations/00003_create_tracking_tables.sql` - DB schema

**GAPS IDENTIFICADOS:**
1. Nao ha captura de IP/geolocalizacao real (LGPD considerations)
2. PostHog nao integrado
3. GTM nao configurado
4. Atribuicao UTM incompleta

---

### FASE 1 - Problem Intake (Descarrego Guiado)

| Requisito PRD | Status | Gap |
|---------------|--------|-----|
| Campo livre com guias | IMPLEMENTADO | Guias hardcoded |
| NLP inferir dominio | IMPLEMENTADO | Via Edge Function |
| Inferencia persona | IMPLEMENTADO | Via Edge Function |
| Embedding vetorial | IMPLEMENTADO | pgvector 384-d |
| Armazenamento | IMPLEMENTADO | problems + embeddings |

**Arquivos Relevantes:**
- `components/phases/Phase1.tsx` - UI Component
- `supabase/functions/analyze-problem/index.ts` - Edge Function
- `supabase/migrations/00002_create_problem_embeddings.sql` - Embeddings

**GAPS IDENTIFICADOS:**
1. **CRITICO:** Guias de pensamento HARDCODED (linhas 24-53 Phase1.tsx)
   ```typescript
   // Hardcoded guides - should come from DB or i18n
   const thinkingGuides = [
     { title: "O problema que quero resolver...", examples: [...] },
     ...
   ];
   ```
2. **CRITICO:** Exemplo de problema HARDCODED (linhas 252-266)
3. i18n incompleto para Phase1 (strings em portugues fixas)

---

### FASE 2 - Dimension Selection (Structured Metadata)

| Requisito PRD | Status | Gap |
|---------------|--------|-----|
| Frequencia | IMPLEMENTADO | |
| Impacto | IMPLEMENTADO | |
| Area de negocio | IMPLEMENTADO | |
| Urgencia | IMPLEMENTADO | |
| Recursos afetados | IMPLEMENTADO | |
| Armazenamento dimensions | IMPLEMENTADO | |

**Arquivos Relevantes:**
- `src/components/phases/Phase2.tsx` - UI Component
- `lib/supabase/dimensions.ts` - Data layer

**GAPS IDENTIFICADOS:**
1. Dimensoes sao estaticas no codigo (nao vem do banco)
2. Nao ha feedback visual de progresso

---

### FASE 3 - Perguntas Adaptativas (Consultor Invisivel)

| Requisito PRD | Status | Gap |
|---------------|--------|-----|
| 3-4 perguntas (intent < 30) | PARCIAL | Codigo usa 4 |
| 5-7 perguntas (intent 30-70) | PARCIAL | Codigo usa 5 |
| 8-9 perguntas (intent > 70) | PARCIAL | Codigo usa 8 |
| RAG data moat | IMPLEMENTADO | effective_questions |
| Context window | IMPLEMENTADO | |
| System prompt | IMPLEMENTADO | |

**Arquivos Relevantes:**
- `src/components/phases/Phase3.tsx` - UI Component
- `supabase/functions/generate-questions/index.ts` - Edge Function
- `lib/ai/questions/engine.ts` - Question logic

**GAPS IDENTIFICADOS:**
1. **DIVERGENCIA:** PRD especifica 3-4/5-7/8-9 perguntas, codigo usa 4/5/8
2. Filtragem de perguntas repetidas pode nao estar 100%

---

### FASE 4 - Blueprint + Lead Capture

| Requisito PRD | Status | Gap |
|---------------|--------|-----|
| Blueprint Preview (gostinho) | IMPLEMENTADO | |
| Disclaimer estimativa | IMPLEMENTADO | |
| Login Google Auth | NAO FUNCIONAL | Stub |
| Login Magic Link | NAO FUNCIONAL | Stub |
| Lead form capture | IMPLEMENTADO | |
| Blueprint PDF download | NAO IMPLEMENTADO | Falta |
| Email confirmacao | STUB | Nao envia real |

**Arquivos Relevantes:**
- `src/components/phases/Phase4.tsx` - UI Component (718 linhas)
- `lib/ai/blueprint.ts` - Blueprint generation
- `lib/leads/manager.ts` - Lead management
- `supabase/functions/send-email/index.ts` - Email stub

**GAPS CRITICOS:**

1. **AUTENTICACAO NAO FUNCIONAL** (Phase4.tsx:185-213)
   ```typescript
   if (!supabase.auth) {
     toast.info("Autenticacao nao configurada neste ambiente de demo.");
     return;
   }
   ```

2. **EMAIL SERVICE STUB** (send-email/index.ts:39-45)
   ```typescript
   // TODO: Implementar envio real via Supabase Auth Email Templates
   // Para agora, apenas logar e retornar sucesso
   console.log(`[send-email] Email queued for ${to}`)
   ```

3. **BLUEPRINT FALLBACK MOCKADO** (blueprint.ts:68-98)
   ```typescript
   // Fallback estatico com dados hardcoded
   return {
     objectives: ['Otimizacao de Processos', 'Reducao de Custos', 'Automacao'],
     technicalArchitecture: ['Cloud Native', 'API First', 'Supabase', 'React'],
     // ... sempre os mesmos dados
   };
   ```

4. **NAO HA DOWNLOAD PDF** - PRD especifica "Blueprint tecnico (download)"

---

### FASE 5 - Hot Lead Conversion (COMPLETAMENTE AUSENTE)

| Requisito PRD | Status | Gap |
|---------------|--------|-----|
| WhatsApp Business deep link | PARCIAL | Link basico existe |
| Formulario Premium | NAO IMPLEMENTADO | |
| Campos Lead Quente completos | NAO IMPLEMENTADO | |
| CRM integration | NAO IMPLEMENTADO | |
| Consulting ticket automatico | NAO IMPLEMENTADO | |

**FASE INTEIRA NAO EXISTE NO CODIGO**

O PRD define FASE 5 como conversao de lead morno para quente com:
- Formulario premium com campos adicionais (Nº funcionarios, Budget, Urgencia real)
- Integracao CRM
- Ticket automatico para consultoria
- Lead score final

**Implementacao atual:** Apenas um botao de WhatsApp basico em Phase4

---

## 2. DADOS MOCKADOS / HARDCODED

### LISTA COMPLETA DE MOCKS

| Arquivo | Linha | Descricao | Severidade |
|---------|-------|-----------|------------|
| `lib/ai/blueprint.ts` | 68-98 | Fallback blueprint com dados estaticos | CRITICA |
| `lib/ai/blueprint.ts` | 87 | Objectives hardcoded | CRITICA |
| `lib/ai/blueprint.ts` | 88 | Tech stack hardcoded | CRITICA |
| `components/phases/Phase1.tsx` | 24-53 | Thinking guides estaticos | ALTA |
| `components/phases/Phase1.tsx` | 252-266 | Exemplo de problema | MEDIA |
| `supabase/functions/send-email/index.ts` | 39-45 | Email stub (TODO) | CRITICA |
| `src/lib/supabaseClient.ts` | 36-37 | Placeholder credentials | ALTA |
| `lib/leads/manager.ts` | 206-219 | sendConfirmationEmail stub | CRITICA |
| `src/components/phases/Phase4.tsx` | 185-188 | Auth stub message | CRITICA |
| `src/components/phases/Phase4.tsx` | 283 | WhatsApp numero hardcoded | MEDIA |

---

## 3. FLUXO FUNCIONAL - ETAPAS REPETIDAS

### Analise de Redundancia

Voce mencionou que ha etapas repetidas. Analisando:

**FASE 2 (Dimensions) vs FASE 3 (Questions):**

| FASE 2 | FASE 3 |
|--------|--------|
| Frequencia | "Com que frequencia ocorre?" |
| Impacto | "Qual o impacto financeiro?" |
| Urgencia | "Qual a urgencia?" |

**CONCLUSAO:** NAO HA REDUNDANCIA REAL

O PRD desenha intencionalmente assim:
- **FASE 2:** Coleta RAPIDA (1 clique) de metadados estruturados
- **FASE 3:** Aprofundamento CONTEXTUAL baseado nas dimensoes

O que PODE parecer repetido e o fluxo de perguntas que EXPANDEM as dimensoes, mas isso e intencional para:
1. Manter FASE 2 rapida (baixa friccao)
2. Usar FASE 3 para detalhamento profundo

**Recomendacao:** Manter como esta, mas garantir que FASE 3 NAO repita perguntas sobre dados ja coletados em FASE 2.

---

## 4. ARQUITETURA DE DADOS - GAPs

### Tabelas PRD vs Implementadas

| Tabela PRD | Implementada | Status |
|------------|--------------|--------|
| visitors | SIM | OK |
| sessions | SIM | OK |
| problems | SIM | OK |
| problem_embeddings | SIM | OK |
| dimensions | SIM | OK |
| questions_answers | SIM | OK |
| blueprints | SIM | OK |
| leads | SIM | PARCIAL |
| leads_morno | NAO NECESSARIA | PRD v1.1 unificou |
| leads_quente | NAO NECESSARIA | PRD v1.1 unificou |
| effective_questions | SIM | OK |
| email_logs | SIM | OK |
| persona_embeddings | NAO | GAP |
| blueprint_embeddings | NAO | GAP |

### Campos Ausentes em Leads

PRD especifica mas NAO implementados:
- `prototype_commitment` - Campo para lead quente
- `scheduled_call` - Agendamento
- `call_completed` - Status da call
- `employee_count` - Nº funcionarios
- `budget_range` - Faixa de orcamento

---

## 5. GAPS DE SEGURANCA

| Requisito PRD | Status | Gap |
|---------------|--------|-----|
| Rate limiting login | NAO IMPLEMENTADO | |
| Brute force protection | NAO IMPLEMENTADO | |
| HTTPS enforced | PARCIAL | Vercel handles |
| Input validation | PARCIAL | Basico |
| RLS policies | PARCIAL | Algumas ausentes |
| API key rotation | NAO IMPLEMENTADO | |

---

## 6. INTEGRAÇÕES EXTERNAS

| Integracao | PRD | Status Atual | Gap |
|------------|-----|--------------|-----|
| Google Gemini AI | Obrigatorio | FUNCIONAL | OK |
| OpenAI (fallback) | Recomendado | NAO IMPLEMENTADO | FALTA |
| Supabase Auth | Obrigatorio | STUB | CRITICO |
| Supabase DB | Obrigatorio | FUNCIONAL | OK |
| Supabase Edge Functions | Obrigatorio | FUNCIONAL | OK |
| Resend/SendGrid Email | Obrigatorio | STUB | CRITICO |
| Google Analytics | Obrigatorio | PARCIAL | FALTA EVENTS |
| WhatsApp Business API | Recomendado | LINK BASICO | FALTA API |
| CRM (HubSpot/Pipedrive) | Opcional | NAO IMPLEMENTADO | FUTURO |
| PostHog | Opcional | NAO IMPLEMENTADO | FUTURO |

---

## 7. CODIGO DUPLICADO

### Estrutura Atual (Problema)

```
/lib/                  <- OLD location
  /ai/
  /analytics/
  /leads/
  /supabase/

/src/lib/              <- NEW location
  /ai/
  /supabase/

/components/           <- OLD location
  /phases/

/src/components/       <- NEW location
  /phases/
```

**Problema:** Alguns imports usam `/lib`, outros `/src/lib`, causando:
1. Confusao sobre qual e o codigo "oficial"
2. Possivel duplicacao de logica
3. Dificuldade de manutencao

**Recomendacao:** Consolidar TUDO em `/src/` e eliminar raiz `/lib` e `/components`

---

## 8. PLANO DE ACAO - SPRINTS

### SPRINT 3 - Funcionalidade Core (Prioridade CRITICA)

| # | Task | Owner | Descricao |
|---|------|-------|-----------|
| 3.1 | Implementar Email Service Real | @dev | Integrar Resend ou SendGrid |
| 3.2 | Implementar Autenticacao | @dev | Google OAuth + Magic Link funcionais |
| 3.3 | Remover Blueprint Fallback Mockado | @dev | Tratar erro sem dados fake |
| 3.4 | Implementar Download PDF Blueprint | @dev | Gerar PDF para download |
| 3.5 | Adicionar OpenAI Fallback | @dev | Quando Gemini falhar |

### SPRINT 4 - FASE 5 Hot Lead Conversion (Prioridade ALTA)

| # | Task | Owner | Descricao |
|---|------|-------|-----------|
| 4.1 | Criar Formulario Premium | @dev | Campos adicionais para lead quente |
| 4.2 | Migrar schema leads | @data-engineer | Adicionar campos PRD |
| 4.3 | Implementar Lead Scoring | @dev | Calculo automatico de score |
| 4.4 | Integrar WhatsApp Business API | @dev | Deep link com contexto |
| 4.5 | Criar fase de conversao | @dev | Nova Phase5.tsx |

### SPRINT 5 - Data Moat & Analytics (Prioridade MEDIA)

| # | Task | Owner | Descricao |
|---|------|-------|-----------|
| 5.1 | Implementar persona_embeddings | @data-engineer | Embeddings de personas |
| 5.2 | Implementar blueprint_embeddings | @data-engineer | Embeddings de blueprints |
| 5.3 | Captura de Geo/IP | @dev | Com consentimento LGPD |
| 5.4 | Integrar PostHog | @devops | Analytics avancado |
| 5.5 | Configurar GTM | @devops | Tag Manager |

### SPRINT 6 - Qualidade & Seguranca (Prioridade MEDIA)

| # | Task | Owner | Descricao |
|---|------|-------|-----------|
| 6.1 | Rate Limiting | @dev | Protecao contra abuse |
| 6.2 | Brute Force Protection | @dev | Lock apos falhas |
| 6.3 | Consolidar codigo /src | @dev | Eliminar duplicacao |
| 6.4 | i18n Phase1 completo | @dev | Traduzir strings hardcoded |
| 6.5 | Testes E2E | @qa | Cypress/Playwright |

### SPRINT 7 - Integracoes Avanadas (Prioridade BAIXA)

| # | Task | Owner | Descricao |
|---|------|-------|-----------|
| 7.1 | CRM Integration | @dev | HubSpot ou Pipedrive |
| 7.2 | Webhook para leads | @dev | Notificacao externa |
| 7.3 | Dashboard Admin | @dev | Visualizacao de metricas |
| 7.4 | API publica | @architect | Para integradores |

---

## 9. DELEGACAO POR AGENTE

### @dev (Implementacao)
- SPRINT 3 completo (Core functionality)
- SPRINT 4: Tasks 4.1, 4.3, 4.4, 4.5
- SPRINT 5: Tasks 5.3
- SPRINT 6: Tasks 6.1, 6.2, 6.3, 6.4

### @data-engineer (Database/Data)
- SPRINT 4: Task 4.2 (migracao schema)
- SPRINT 5: Tasks 5.1, 5.2 (embeddings)

### @devops (Infrastructure)
- SPRINT 5: Tasks 5.4, 5.5 (PostHog, GTM)
- Deploy e monitoramento

### @qa (Quality)
- SPRINT 6: Task 6.5 (testes E2E)
- Validacao de cada sprint

### @pm (Product)
- Priorizacao de backlog
- Validacao de requisitos PRD

---

## 10. METRICAS DE SUCESSO

### Definition of Done - 100% Funcional

- [ ] Email de confirmacao enviado com sucesso (real)
- [ ] Login Google OAuth funcional
- [ ] Login Magic Link funcional
- [ ] Blueprint gerado sem fallback mockado
- [ ] Download PDF disponivel
- [ ] FASE 5 implementada
- [ ] Lead scoring funcional
- [ ] Zero dados hardcoded em producao
- [ ] Testes E2E passando
- [ ] Rate limiting ativo
- [ ] Analytics completo (GA4 + PostHog)

---

## 11. RISCOS

| Risco | Probabilidade | Impacto | Mitigacao |
|-------|---------------|---------|-----------|
| Gemini API indisponivel | Media | Alto | Implementar OpenAI fallback |
| Email nao entrega | Media | Alto | Usar provider reputado (Resend) |
| Rate limit API | Baixa | Medio | Cache + retry logic |
| LGPD compliance | Media | Alto | Consentimento explicito |
| Performance embeddings | Baixa | Medio | Indexes HNSW ja implementados |

---

## CONCLUSAO

O sistema All Max Mind esta aproximadamente **60% funcional** em relacao ao PRD.

**Gaps Criticos que impedem producao:**
1. Email service e STUB
2. Autenticacao e STUB
3. FASE 5 nao existe
4. Blueprint fallback com dados mockados

**Proximos Passos Imediatos:**
1. **@dev** deve iniciar SPRINT 3 (funcionalidade core)
2. **@data-engineer** deve preparar migracoes para novos campos
3. **@pm** deve validar priorizacao

---

*Documento gerado por @architect (Aria) - Synkra AIOS*
