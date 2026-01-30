# Story SPRINT-3.1: Implementar Email Service Real

**Sprint:** 3 - Funcionalidade Core
**Prioridade:** CRITICA
**Owner:** @dev
**Status:** [x] Em Progresso

---

## Objetivo

Substituir o stub de email atual por uma implementacao real usando Resend, garantindo que emails de confirmacao e blueprint sejam efetivamente enviados aos usuarios.

---

## Contexto

**Problema Atual:**
O arquivo `supabase/functions/send-email/index.ts` contem apenas um stub que loga no console mas NAO envia emails reais:

```typescript
// Linha 39-45
// TODO: Implementar envio real via Supabase Auth Email Templates
// Para agora, apenas logar e retornar sucesso
console.log(`[send-email] Email queued for ${to}`)
```

**Impacto:** Usuarios NAO recebem confirmacao de lead nem o blueprint por email.

---

## Criterios de Aceite

- [ ] Email de confirmacao de lead enviado E recebido na caixa de entrada
- [ ] Email com blueprint completo enviado E recebido
- [ ] Templates HTML responsivos e com branding All Max Mind
- [ ] Retry automatico em caso de falha (max 3 tentativas)
- [ ] Logs de sucesso/falha salvos na tabela `email_logs`
- [ ] Rate limiting de 100 emails/hora por dominio
- [ ] Tratamento de bounces e unsubscribes

---

## Tasks

### Task 3.1.1 - Configurar Resend
- [x] Criar conta Resend (https://resend.com)
- [x] Verificar dominio allmaxmind.com
- [x] Gerar API Key
- [x] Adicionar `RESEND_API_KEY` nos secrets do Supabase

**Comando para adicionar secret:**
```bash
supabase secrets set RESEND_API_KEY=re_xxxxxxxxx
```

### Task 3.1.2 - Refatorar Edge Function send-email
- [x] Instalar SDK Resend no Deno
- [x] Implementar envio real
- [x] Adicionar retry logic (3 tentativas com backoff exponencial)
- [x] Melhorar logging
- [x] Adicionar rate limiting (100 emails/hora por dominio)

**Arquivo:** `supabase/functions/send-email/index.ts`

### Task 3.1.3 - Criar Templates de Email
- [x] Template: `lead_confirmation` - Confirmacao de recebimento
- [x] Template: `blueprint_delivery` - Entrega do blueprint
- [x] Template: `prototype_offer` - Oferta de prototipo 7 dias

**Arquivos Novos:**
- `supabase/functions/send-email/templates/leadConfirmation.ts`
- `supabase/functions/send-email/templates/blueprintDelivery.ts`
- `supabase/functions/send-email/templates/prototypeOffer.ts`

### Task 3.1.4 - Testar Envio
- [ ] Testar com email pessoal
- [ ] Verificar spam score
- [ ] Testar em diferentes clientes (Gmail, Outlook, Apple Mail)

---

## Especificacao Tecnica

### Refatoracao do Edge Function

```typescript
// supabase/functions/send-email/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@^2.39.0'
import { Resend } from 'npm:resend@^2.0.0'

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

const TEMPLATES = {
  lead_confirmation: (data: any) => ({
    subject: `Recebemos sua solicitacao - All Max Mind`,
    html: `...` // Template HTML
  }),
  blueprint_delivery: (data: any) => ({
    subject: `Seu Blueprint Tecnico esta pronto - ${data.projectTitle}`,
    html: `...` // Template HTML
  }),
  prototype_offer: (data: any) => ({
    subject: `Oferta Especial: Prototipo em 7 dias`,
    html: `...`
  })
}

serve(async (req) => {
  // ... CORS handling

  try {
    const { to, templateType, data } = await req.json()

    // Validacao
    if (!to || !templateType) {
      throw new Error('to and templateType are required')
    }

    if (!TEMPLATES[templateType]) {
      throw new Error(`Unknown template: ${templateType}`)
    }

    // Gerar template
    const template = TEMPLATES[templateType](data)

    // Enviar via Resend com retry
    let lastError
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const { data: emailData, error } = await resend.emails.send({
          from: 'All Max Mind <noreply@allmaxmind.com>',
          to: [to],
          subject: template.subject,
          html: template.html,
        })

        if (error) throw error

        // Log sucesso
        await logEmail(to, templateType, 'sent', emailData.id)

        return new Response(JSON.stringify({
          success: true,
          messageId: emailData.id,
        }), { headers: corsHeaders })

      } catch (err) {
        lastError = err
        console.error(`[send-email] Attempt ${attempt} failed:`, err)
        if (attempt < 3) {
          await new Promise(r => setTimeout(r, 1000 * attempt)) // Backoff
        }
      }
    }

    // Todas tentativas falharam
    await logEmail(to, templateType, 'failed', null, lastError.message)
    throw lastError

  } catch (error) {
    // ... error handling
  }
})

async function logEmail(to, template, status, messageId, errorMsg = null) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL'),
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  )

  await supabase.from('email_logs').insert({
    to_email: to,
    template_type: template,
    status,
    message_id: messageId,
    error_message: errorMsg,
    created_at: new Date().toISOString()
  })
}
```

### Template HTML - Lead Confirmation

```typescript
// supabase/functions/send-email/templates/leadConfirmation.ts
export const leadConfirmationTemplate = (data: {
  userName: string
  projectSize: string
  blueprintId: string
}) => ({
  subject: `Recebemos sua solicitacao - All Max Mind`,
  html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmacao - All Max Mind</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0f;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <tr>
      <td style="background:linear-gradient(135deg,#0d9488,#14b8a6);padding:30px;border-radius:16px 16px 0 0;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:28px;">All Max Mind</h1>
        <p style="color:rgba(255,255,255,0.8);margin:10px 0 0;">Fast Soft-House AI-Driven</p>
      </td>
    </tr>
    <tr>
      <td style="background:#111118;padding:40px 30px;border-radius:0 0 16px 16px;">
        <h2 style="color:#14b8a6;margin:0 0 20px;">Ola, ${data.userName}!</h2>
        <p style="color:#a1a1aa;line-height:1.6;margin:0 0 20px;">
          Recebemos sua solicitacao de Blueprint Tecnico com sucesso.
        </p>
        <div style="background:#1a1a24;padding:20px;border-radius:12px;margin:20px 0;">
          <p style="color:#71717a;margin:0 0 10px;font-size:14px;">DETALHES DO PROJETO</p>
          <p style="color:#fff;margin:0;font-size:18px;font-weight:bold;">
            Complexidade: ${data.projectSize === 'small' ? 'Pequeno' : data.projectSize === 'medium' ? 'Medio' : 'Grande'}
          </p>
          <p style="color:#71717a;margin:10px 0 0;font-size:12px;">
            ID: ${data.blueprintId}
          </p>
        </div>
        <p style="color:#a1a1aa;line-height:1.6;">
          Nosso time entrara em contato em breve para agendar uma reuniao de alinhamento tecnico.
        </p>
        <a href="https://allmaxmind.com/blueprint/${data.blueprintId}"
           style="display:inline-block;background:linear-gradient(135deg,#0d9488,#14b8a6);color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:20px;">
          Ver Meu Blueprint
        </a>
      </td>
    </tr>
    <tr>
      <td style="padding:30px;text-align:center;">
        <p style="color:#52525b;font-size:12px;margin:0;">
          All Max Mind - Transformando dores em solucoes
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `
})
```

---

## Dependencias

- **@devops** deve configurar:
  - Conta Resend
  - Verificacao de dominio
  - Secret `RESEND_API_KEY` no Supabase

---

## Metricas de Sucesso

| Metrica | Target |
|---------|--------|
| Taxa de entrega | > 98% |
| Tempo medio de entrega | < 30 segundos |
| Taxa de abertura | > 40% |
| Bounce rate | < 2% |

---

## Arquivos Modificados

| Arquivo | Acao |
|---------|------|
| `supabase/functions/send-email/index.ts` | Refatorar |
| `supabase/functions/send-email/templates/` | NOVO diretorio |
| `supabase/functions/send-email/templates/leadConfirmation.ts` | NOVO |
| `supabase/functions/send-email/templates/blueprintDelivery.ts` | NOVO |
| `supabase/functions/send-email/templates/prototypeOffer.ts` | NOVO |

---

## Checklist Final

- [ ] Codigo implementado
- [ ] Testes locais passando
- [ ] Email recebido na caixa de entrada (nao spam)
- [ ] Logs salvos no banco
- [ ] Deploy em staging
- [ ] Validacao @qa
- [ ] Deploy em producao

---

*Story criada por @architect (Aria) - Sprint 3*
