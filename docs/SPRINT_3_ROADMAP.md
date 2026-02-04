# SPRINT 3 ROADMAP - FUNCIONALIDADE CORE

**Objetivo:** Eliminar todos os dados mockados e tornar o sistema 100% funcional

---

## VISAO GERAL

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    ESTADO ATUAL vs OBJETIVO                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  HOJE (60% funcional)              OBJETIVO (100% funcional)            │
│  ═══════════════════              ══════════════════════════            │
│                                                                         │
│  [x] Fase 0 - Tracking             [x] Fase 0 - Tracking                │
│  [x] Fase 1 - Problem Intake       [x] Fase 1 - Problem Intake          │
│  [x] Fase 2 - Dimensions           [x] Fase 2 - Dimensions              │
│  [x] Fase 3 - Questions            [x] Fase 3 - Questions               │
│  [~] Fase 4 - Blueprint (STUB)     [x] Fase 4 - Blueprint (REAL)        │
│  [ ] Fase 5 - HOT LEAD             [x] Fase 5 - Hot Lead Conversion     │
│                                                                         │
│  Legenda: [x] Implementado  [~] Parcial/Mock  [ ] Ausente               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## TASKS SPRINT 3

### 3.1 - Implementar Email Service Real

**Arquivo:** `supabase/functions/send-email/index.ts`

**Problema Atual:**
```typescript
// TODO: Implementar envio real via Supabase Auth Email Templates
// Para agora, apenas logar e retornar sucesso
console.log(`[send-email] Email queued for ${to}`)
```

**Solucao:**
- Integrar Resend (recomendado) ou SendGrid
- Criar templates de email (confirmation, blueprint delivery)
- Implementar retry logic

**Owner:** @dev
**Dependencias:** Conta Resend configurada

---

### 3.2 - Implementar Autenticacao Funcional

**Arquivo:** `src/components/phases/Phase4.tsx:185-213`

**Problema Atual:**
```typescript
if (!supabase.auth) {
  toast.info("Autenticacao nao configurada neste ambiente de demo.");
  return;
}
```

**Solucao:**
1. Configurar Supabase Auth providers (Google, Email)
2. Implementar callback handler `/callback`
3. Persistir sessao do usuario
4. Vincular lead ao user autenticado

**Owner:** @dev
**Dependencias:**
- Credenciais Google OAuth configuradas
- Supabase Auth habilitado

---

### 3.3 - Remover Blueprint Fallback Mockado

**Arquivo:** `lib/ai/blueprint.ts:68-98`

**Problema Atual:**
```typescript
const generateFallbackBlueprint = (input: BlueprintInput): Blueprint => {
  return {
    objectives: ['Otimizacao de Processos', 'Reducao de Custos', 'Automacao'],
    technicalArchitecture: ['Cloud Native', 'API First', 'Supabase', 'React'],
    // ... SEMPRE OS MESMOS DADOS
  };
};
```

**Solucao:**
1. Remover fallback com dados estaticos
2. Implementar error handling adequado
3. Mostrar mensagem de erro clara ao usuario
4. Permitir retry

**Owner:** @dev

---

### 3.4 - Implementar Download PDF Blueprint

**Requisito PRD:** "Blueprint tecnico (download)"

**Solucao:**
1. Usar biblioteca como `jspdf` ou `@react-pdf/renderer`
2. Gerar PDF com dados do blueprint
3. Adicionar botao de download apos captura do lead
4. Enviar PDF por email tambem

**Owner:** @dev
**Arquivos Novos:**
- `lib/pdf/blueprintGenerator.ts`
- `lib/email/templates/blueprintEmail.ts`

---

### 3.5 - Adicionar OpenAI Fallback

**Requisito PRD:** "Fallback OpenAI quando Gemini falhar"

**Arquivo Novo:** `lib/ai/providers/index.ts`

**Implementacao:**
```typescript
export const aiConfig = {
  primaryProvider: 'gemini',
  fallbackProvider: 'openai',
  providers: {
    gemini: { /* config */ },
    openai: { /* config */ }
  }
};
```

**Owner:** @dev
**Dependencias:** API Key OpenAI configurada

---

## CHECKLIST DE VALIDACAO

### Antes de marcar SPRINT 3 como completo:

- [ ] Email de confirmacao enviado E recebido na caixa de entrada
- [ ] Login com Google OAuth funciona
- [ ] Login com Magic Link funciona e redireciona corretamente
- [ ] Blueprint gerado SEM fallback mockado (verificar logs)
- [ ] Botao de download PDF disponivel
- [ ] PDF gerado contem dados reais do blueprint
- [ ] Se Gemini falhar, OpenAI assume automaticamente
- [ ] Zero erros no console em producao
- [ ] Metricas de analytics sendo enviadas

---

## CRONOGRAMA SUGERIDO

```
Semana 1:
├── Task 3.1 (Email Service)
└── Task 3.2 (Autenticacao)

Semana 2:
├── Task 3.3 (Remover Mock)
├── Task 3.4 (PDF Download)
└── Task 3.5 (OpenAI Fallback)

Semana 3:
├── QA e Testes
├── Bug fixes
└── Deploy staging
```

---

## VARIAVEIS DE AMBIENTE NECESSARIAS

```bash
# Email Service (Resend)
RESEND_API_KEY=re_xxxxx

# OpenAI Fallback
VITE_OPENAI_API_KEY=sk-xxxxx
VITE_OPENAI_ORGANIZATION=org-xxxxx

# Supabase Auth (ja deve existir)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx

# Google OAuth (configurar no Supabase Dashboard)
# Nao e env var, e configuracao no painel
```

---

## ARQUIVOS A MODIFICAR

| Arquivo | Modificacao |
|---------|-------------|
| `supabase/functions/send-email/index.ts` | Implementar envio real |
| `src/components/phases/Phase4.tsx` | Remover stub auth |
| `lib/ai/blueprint.ts` | Remover fallback mockado |
| `lib/ai/providers/index.ts` | NOVO - Provider abstraction |
| `lib/pdf/blueprintGenerator.ts` | NOVO - PDF generation |
| `supabase/functions/generate-blueprint/index.ts` | Adicionar OpenAI fallback |
| `.env` | Adicionar novas vars |

---

## DELEGACAO

**Recomendo iniciar por:**

1. **@dev** - Implementar 3.1 (Email) e 3.2 (Auth) em paralelo
2. **@devops** - Configurar credenciais Resend + Google OAuth
3. **@qa** - Preparar casos de teste para validacao

---

*Documento gerado por @architect (Aria) - Synkra AIOS*
