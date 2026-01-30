// Template: Lead Confirmation Email
// Sent when user submits lead form

export interface LeadConfirmationData {
  userName: string;
  projectSize: 'small' | 'medium' | 'large';
  blueprintId: string;
}

const complexityLabels = {
  small: 'Pequeno',
  medium: 'Medio',
  large: 'Grande'
};

export const leadConfirmationTemplate = (data: LeadConfirmationData) => ({
  subject: `Recebemos sua solicitacao - All Max Mind`,
  html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmacao - All Max Mind</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0f;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <tr>
      <td style="background:linear-gradient(135deg,#0d9488,#14b8a6);padding:30px;border-radius:16px 16px 0 0;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:28px;font-weight:700;">All Max Mind</h1>
        <p style="color:rgba(255,255,255,0.8);margin:10px 0 0;font-size:14px;">Fast Soft-House AI-Driven</p>
      </td>
    </tr>
    <tr>
      <td style="background:#111118;padding:40px 30px;border-radius:0 0 16px 16px;">
        <h2 style="color:#14b8a6;margin:0 0 20px;font-size:24px;">Ola, ${data.userName}!</h2>
        <p style="color:#a1a1aa;line-height:1.6;margin:0 0 20px;font-size:16px;">
          Recebemos sua solicitacao de Blueprint Tecnico com sucesso.
        </p>
        <div style="background:#1a1a24;padding:20px;border-radius:12px;margin:20px 0;">
          <p style="color:#71717a;margin:0 0 10px;font-size:12px;text-transform:uppercase;letter-spacing:1px;">DETALHES DO PROJETO</p>
          <p style="color:#fff;margin:0;font-size:18px;font-weight:bold;">
            Complexidade: ${complexityLabels[data.projectSize] || data.projectSize}
          </p>
          <p style="color:#71717a;margin:10px 0 0;font-size:12px;">
            ID: ${data.blueprintId}
          </p>
        </div>
        <p style="color:#a1a1aa;line-height:1.6;font-size:16px;">
          Nosso time entrara em contato em breve para agendar uma reuniao de alinhamento tecnico.
        </p>
        <a href="https://allmaxmind.com/blueprint/${data.blueprintId}"
           style="display:inline-block;background:linear-gradient(135deg,#0d9488,#14b8a6);color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:20px;font-size:14px;">
          Ver Meu Blueprint
        </a>
      </td>
    </tr>
    <tr>
      <td style="padding:30px;text-align:center;">
        <p style="color:#52525b;font-size:12px;margin:0;">
          All Max Mind - Transformando dores em solucoes
        </p>
        <p style="color:#3f3f46;font-size:11px;margin:10px 0 0;">
          Voce recebeu este email porque solicitou um Blueprint Tecnico.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
});
