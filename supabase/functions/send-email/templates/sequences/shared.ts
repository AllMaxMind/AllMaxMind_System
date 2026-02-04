// Shared Email Components and Layouts
// Story 5.4 - Email Sequences

export function baseEmailLayout(content: string, footer: string): string {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>All Max Mind</title>
      <!--[if mso]>
      <noscript>
        <xml>
          <o:OfficeDocumentSettings>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
      </noscript>
      <![endif]-->
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse;">
              <!-- Header -->
              <tr>
                <td style="padding: 24px; text-align: center;">
                  <img src="https://allmaxmind.com/logo.png" alt="All Max Mind" style="height: 40px; width: auto;" />
                </td>
              </tr>

              <!-- Main Content -->
              <tr>
                <td style="background-color: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  ${content}
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 24px; text-align: center;">
                  ${footer}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export function ctaButton(text: string, href: string, bgColor: string = '#4F46E5'): string {
  return `
    <table role="presentation" style="margin: 24px auto;">
      <tr>
        <td style="border-radius: 8px; background-color: ${bgColor};">
          <a href="${href}" target="_blank" style="display: inline-block; padding: 16px 32px; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px;">
            ${text}
          </a>
        </td>
      </tr>
    </table>
  `;
}

export function footerWithUnsubscribe(unsubscribeUrl?: string): string {
  const unsubscribeLink = unsubscribeUrl
    ? `<a href="${unsubscribeUrl}" style="color: #9ca3af; text-decoration: underline;">Cancelar inscricao</a>`
    : '';

  return `
    <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0;">
      All Max Mind - Solucoes Inteligentes para seu Negocio
    </p>
    <p style="color: #9ca3af; font-size: 12px; margin: 0 0 16px 0;">
      Sao Paulo, Brasil
    </p>
    ${unsubscribeLink ? `<p style="font-size: 12px; margin: 0;">${unsubscribeLink}</p>` : ''}
  `;
}

export function divider(): string {
  return `<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />`;
}
