// Template: Blueprint Delivery Email
// Sent when blueprint is generated and ready

export interface BlueprintDeliveryData {
  userName: string;
  projectTitle: string;
  blueprintId: string;
  executiveSummary: string;
  complexity: 'small' | 'medium' | 'large';
  timeline: string;
  investmentRange: string;
}

export const blueprintDeliveryTemplate = (data: BlueprintDeliveryData) => ({
  subject: `Seu Blueprint Tecnico esta pronto - ${data.projectTitle}`,
  html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blueprint Pronto - All Max Mind</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0f;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <tr>
      <td style="background:linear-gradient(135deg,#0d9488,#14b8a6);padding:30px;border-radius:16px 16px 0 0;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:28px;font-weight:700;">All Max Mind</h1>
        <p style="color:rgba(255,255,255,0.8);margin:10px 0 0;font-size:14px;">Seu Blueprint esta Pronto!</p>
      </td>
    </tr>
    <tr>
      <td style="background:#111118;padding:40px 30px;border-radius:0 0 16px 16px;">
        <h2 style="color:#14b8a6;margin:0 0 10px;font-size:24px;">${data.projectTitle}</h2>
        <p style="color:#71717a;margin:0 0 25px;font-size:14px;">
          Ola ${data.userName}, seu blueprint tecnico foi gerado com sucesso!
        </p>

        <!-- Resumo Executivo -->
        <div style="background:#1a1a24;padding:20px;border-radius:12px;margin:0 0 20px;border-left:4px solid #14b8a6;">
          <p style="color:#71717a;margin:0 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:1px;">RESUMO EXECUTIVO</p>
          <p style="color:#d4d4d8;margin:0;font-size:14px;line-height:1.6;">
            ${data.executiveSummary}
          </p>
        </div>

        <!-- Metricas -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 25px;">
          <tr>
            <td width="50%" style="padding:15px;background:#1a1a24;border-radius:12px 0 0 12px;">
              <p style="color:#71717a;margin:0 0 5px;font-size:11px;text-transform:uppercase;">Timeline</p>
              <p style="color:#14b8a6;margin:0;font-size:18px;font-weight:bold;">${data.timeline}</p>
            </td>
            <td width="50%" style="padding:15px;background:#1a1a24;border-radius:0 12px 12px 0;border-left:1px solid #27272a;">
              <p style="color:#71717a;margin:0 0 5px;font-size:11px;text-transform:uppercase;">Investimento</p>
              <p style="color:#14b8a6;margin:0;font-size:18px;font-weight:bold;">${data.investmentRange}</p>
            </td>
          </tr>
        </table>

        <p style="color:#a1a1aa;line-height:1.6;font-size:14px;margin:0 0 25px;">
          Clique no botao abaixo para visualizar seu blueprint completo com arquitetura tecnica, funcionalidades e proximos passos.
        </p>

        <a href="https://allmaxmind.com/blueprint/${data.blueprintId}"
           style="display:inline-block;background:linear-gradient(135deg,#0d9488,#14b8a6);color:#fff;padding:16px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;">
          Acessar Meu Blueprint
        </a>

        <div style="margin-top:30px;padding-top:20px;border-top:1px solid #27272a;">
          <p style="color:#71717a;font-size:12px;margin:0;">
            Proximo passo: Agende uma reuniao de alinhamento com nosso time tecnico.
          </p>
        </div>
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
  `.trim()
});
