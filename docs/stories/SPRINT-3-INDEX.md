# SPRINT 3 - INDICE DE STORIES

**Sprint:** 3 - Funcionalidade Core
**Objetivo:** Eliminar todos os dados mockados e tornar o sistema 100% funcional
**Owner Principal:** @dev
**Status:** [ ] Em Andamento

---

## VISAO GERAL

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SPRINT 3 - STORIES                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  3.1 Email Service Real ─────────────────────────────── CRITICA         │
│      └─ Substituir stub por Resend                                      │
│                                                                         │
│  3.2 Autenticacao Funcional ─────────────────────────── CRITICA         │
│      └─ Google OAuth + Magic Link                                       │
│                                                                         │
│  3.3 Remover Mock Blueprint ─────────────────────────── CRITICA         │
│      └─ Error handling sem dados fake                                   │
│                                                                         │
│  3.4 Download PDF Blueprint ─────────────────────────── ALTA            │
│      └─ Gerar e baixar PDF                                              │
│                                                                         │
│  3.5 OpenAI Fallback ────────────────────────────────── ALTA            │
│      └─ Redundancia de AI providers                                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## STORIES

| ID | Story | Prioridade | Status | Arquivo |
|----|-------|------------|--------|---------|
| 3.1 | [Implementar Email Service Real](./SPRINT-3.1-email-service.md) | CRITICA | [ ] | `SPRINT-3.1-email-service.md` |
| 3.2 | [Implementar Autenticacao Funcional](./SPRINT-3.2-authentication.md) | CRITICA | [ ] | `SPRINT-3.2-authentication.md` |
| 3.3 | [Remover Blueprint Fallback Mockado](./SPRINT-3.3-remove-mock-blueprint.md) | CRITICA | [ ] | `SPRINT-3.3-remove-mock-blueprint.md` |
| 3.4 | [Implementar Download PDF Blueprint](./SPRINT-3.4-pdf-download.md) | ALTA | [ ] | `SPRINT-3.4-pdf-download.md` |
| 3.5 | [Adicionar OpenAI como Fallback](./SPRINT-3.5-openai-fallback.md) | ALTA | [ ] | `SPRINT-3.5-openai-fallback.md` |

---

## ORDEM DE EXECUCAO RECOMENDADA

```
Semana 1:
├── [PARALELO] Story 3.1 (Email) + Story 3.2 (Auth)
│   └── @devops configura credenciais primeiro
│
Semana 2:
├── Story 3.3 (Remover Mock) - Depende de 3.5 estar pronto
├── Story 3.5 (OpenAI Fallback)
│
Semana 3:
├── Story 3.4 (PDF Download)
├── QA e Testes
└── Deploy staging
```

---

## DEPENDENCIAS EXTERNAS

### Para @devops configurar ANTES de iniciar:

| Servico | Acao | Story |
|---------|------|-------|
| **Resend** | Criar conta, verificar dominio, gerar API key | 3.1 |
| **Google Cloud** | Criar OAuth credentials, configurar consent screen | 3.2 |
| **Supabase** | Habilitar Google provider, configurar redirect URLs | 3.2 |
| **OpenAI** | Obter API key, configurar organization (opcional) | 3.5 |

### Secrets do Supabase necessarios:

```bash
supabase secrets set RESEND_API_KEY=re_xxxxxxxxx
supabase secrets set OPENAI_API_KEY=sk-xxxxxxxxx
supabase secrets set OPENAI_ORGANIZATION=org-xxxxxxxxx  # Opcional
```

---

## ARQUIVOS A CRIAR

| Arquivo | Story | Descricao |
|---------|-------|-----------|
| `supabase/functions/send-email/templates/*.ts` | 3.1 | Templates de email HTML |
| `src/contexts/AuthContext.tsx` | 3.2 | Context de autenticacao |
| `src/pages/AuthCallback.tsx` | 3.2 | Pagina de callback OAuth |
| `lib/ai/providers/index.ts` | 3.5 | Abstracao de AI providers |
| `lib/ai/providers/gemini.ts` | 3.5 | Provider Gemini |
| `lib/ai/providers/openai.ts` | 3.5 | Provider OpenAI |
| `lib/pdf/BlueprintPDF.tsx` | 3.4 | Template PDF |
| `lib/pdf/downloadBlueprint.ts` | 3.4 | Funcao de download |

---

## ARQUIVOS A MODIFICAR

| Arquivo | Stories | Modificacoes |
|---------|---------|--------------|
| `supabase/functions/send-email/index.ts` | 3.1 | Implementar envio real |
| `src/components/phases/Phase4.tsx` | 3.2, 3.3, 3.4 | Auth, Error handling, Download |
| `lib/ai/blueprint.ts` | 3.3 | Remover fallback mockado |
| `supabase/functions/generate-blueprint/index.ts` | 3.5 | Usar abstração providers |
| `supabase/functions/generate-questions/index.ts` | 3.5 | Usar abstração providers |
| `src/App.tsx` | 3.2 | Adicionar AuthProvider e rota /callback |

---

## MIGRACOES DE BANCO

| Arquivo | Story | Descricao |
|---------|-------|-----------|
| `00011_add_user_id_to_leads.sql` | 3.2 | Coluna user_id na tabela leads |
| `00012_create_ai_metrics.sql` | 3.5 | Tabela para metricas de AI (opcional) |

---

## DEPENDENCIAS NPM

```bash
# Story 3.4 - PDF
npm install @react-pdf/renderer

# Story 3.5 - OpenAI (ja pode estar instalado)
npm install openai
```

---

## CRITERIOS DE CONCLUSAO DO SPRINT

### Definition of Done - Sprint 3 Completo:

- [ ] **3.1** Email de confirmacao enviado E recebido (verificar inbox, nao spam)
- [ ] **3.2** Login Google OAuth funciona end-to-end
- [ ] **3.2** Login Magic Link funciona end-to-end
- [ ] **3.3** Nenhum dado mockado no blueprint (verificar logs)
- [ ] **3.3** Erro de API mostra mensagem clara + retry
- [ ] **3.4** PDF baixado com todos os dados do blueprint
- [ ] **3.5** Fallback OpenAI funciona (testar desabilitando Gemini)
- [ ] Todos os testes passando
- [ ] Zero erros no console em producao
- [ ] Deploy em staging validado por @qa

---

## COMANDOS UTEIS

```bash
# Rodar localmente
npm run dev

# Testar Edge Functions localmente
supabase functions serve

# Ver logs de Edge Functions
supabase functions logs send-email
supabase functions logs generate-blueprint

# Deploy Edge Functions
supabase functions deploy send-email
supabase functions deploy generate-blueprint
supabase functions deploy generate-questions

# Verificar secrets
supabase secrets list
```

---

## CONTATO

- **Duvidas de Arquitetura:** @architect (Aria)
- **Duvidas de Produto:** @pm (Morgan)
- **Configuracao Infra:** @devops (Gage)
- **Testes:** @qa

---

*Indice criado por @architect (Aria) - Sprint 3*
