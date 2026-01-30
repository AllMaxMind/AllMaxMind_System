// Template: Prototype Offer Email
// Sent 24h after lead capture to offer 7-day prototype

export interface PrototypeOfferData {
  userName: string;
  projectTitle: string;
  blueprintId: string;
  complexity: 'small' | 'medium' | 'large';
}

const priceMap = {
  small: 'R$ 4.900',
  medium: 'R$ 7.900',
  large: 'R$ 12.900'
};

export const prototypeOfferTemplate = (data: PrototypeOfferData) => ({
  subject: `Oferta Especial: Prototipo em 7 dias - ${data.projectTitle}`,
  html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Oferta Especial - All Max Mind</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0f;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <tr>
      <td style="background:linear-gradient(135deg,#f59e0b,#eab308);padding:30px;border-radius:16px 16px 0 0;text-align:center;">
        <p style="color:#000;margin:0 0 5px;font-size:12px;text-transform:uppercase;letter-spacing:2px;font-weight:600;">OFERTA EXCLUSIVA</p>
        <h1 style="color:#000;margin:0;font-size:28px;font-weight:700;">Prototipo em 7 Dias</h1>
      </td>
    </tr>
    <tr>
      <td style="background:#111118;padding:40px 30px;border-radius:0 0 16px 16px;">
        <h2 style="color:#fff;margin:0 0 15px;font-size:22px;">Ola, ${data.userName}!</h2>
        <p style="color:#a1a1aa;line-height:1.7;margin:0 0 25px;font-size:15px;">
          Voce solicitou um Blueprint para <strong style="color:#14b8a6;">${data.projectTitle}</strong> e queremos te fazer uma oferta especial.
        </p>

        <!-- Oferta Box -->
        <div style="background:linear-gradient(135deg,#1a1a24,#0f0f14);padding:25px;border-radius:16px;margin:0 0 25px;border:2px solid #f59e0b;">
          <p style="color:#f59e0b;margin:0 0 15px;font-size:13px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">
            Transforme seu Blueprint em Realidade
          </p>
          <p style="color:#fff;margin:0 0 20px;font-size:16px;line-height:1.6;">
            Em apenas <strong>7 dias uteis</strong>, entregamos um prototipo navegavel da sua solucao para validar com stakeholders e usuarios.
          </p>

          <div style="background:#27272a;padding:15px;border-radius:8px;margin:0 0 20px;">
            <p style="color:#71717a;margin:0 0 5px;font-size:11px;text-transform:uppercase;">INVESTIMENTO ESPECIAL</p>
            <p style="color:#f59e0b;margin:0;font-size:28px;font-weight:bold;">${priceMap[data.complexity] || 'Sob consulta'}</p>
            <p style="color:#52525b;margin:5px 0 0;font-size:12px;">Valido por 48 horas</p>
          </div>

          <p style="color:#a1a1aa;font-size:13px;margin:0;">
            O que esta incluso:
          </p>
          <ul style="color:#d4d4d8;font-size:14px;margin:10px 0 0;padding-left:20px;line-height:1.8;">
            <li>Prototipo interativo navegavel</li>
            <li>Design System personalizado</li>
            <li>2 rodadas de revisao</li>
            <li>Documentacao de handoff</li>
            <li>Suporte por 15 dias</li>
          </ul>
        </div>

        <a href="https://allmaxmind.com/prototype/${data.blueprintId}?offer=7days"
           style="display:block;background:linear-gradient(135deg,#f59e0b,#eab308);color:#000;padding:16px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;text-align:center;">
          QUERO MEU PROTOTIPO
        </a>

        <p style="color:#71717a;font-size:12px;margin:25px 0 0;text-align:center;">
          Ou responda este email para agendar uma conversa com nosso time.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:30px;text-align:center;">
        <p style="color:#52525b;font-size:12px;margin:0;">
          All Max Mind - Transformando dores em solucoes
        </p>
        <p style="color:#3f3f46;font-size:11px;margin:10px 0 0;">
          <a href="https://allmaxmind.com/unsubscribe?id=${data.blueprintId}" style="color:#3f3f46;">Cancelar inscricao</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
});
