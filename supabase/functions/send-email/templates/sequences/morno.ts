// Cold Lead Email Templates (Score < 50)
// Story 5.4 - Email Sequences

import type { EmailContext } from './types.ts';
import { baseEmailLayout, ctaButton, footerWithUnsubscribe } from './shared.ts';

export function mornoEmail1(ctx: EmailContext): { subject: string; html: string } {
  const subject = `Vamos conversar quando quiser`;

  const content = `
    <h1 style="color: #1a1a2e; margin-bottom: 20px;">
      Ola ${ctx.leadName}
    </h1>

    <p style="font-size: 16px; line-height: 1.6; color: #333;">
      Obrigado por usar nossa plataforma para analisar seu projeto.
      Sabemos que cada decisao tem seu tempo certo.
    </p>

    <p style="font-size: 16px; line-height: 1.6; color: #333;">
      Seu Blueprint Tecnico esta salvo e voce pode acessa-lo quando quiser.
      Estaremos aqui quando decidir dar o proximo passo.
    </p>

    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 24px 0;">
      <p style="color: #555; margin: 0;">
        💡 <strong>Dica:</strong> Compartilhe o Blueprint com sua equipe
        para discutirem juntos as possibilidades.
      </p>
    </div>

    ${ctaButton('Acessar Meu Blueprint', ctx.scheduleUrl || '#', '#6B7280')}

    <p style="font-size: 14px; color: #666; margin-top: 24px;">
      Qualquer duvida, estamos a disposicao.
    </p>
  `;

  return {
    subject,
    html: baseEmailLayout(content, footerWithUnsubscribe(ctx.unsubscribeUrl))
  };
}

export function mornoEmail2(ctx: EmailContext): { subject: string; html: string } {
  const subject = `Seu blueprint esta salvo em nossa plataforma`;

  const content = `
    <h1 style="color: #1a1a2e; margin-bottom: 20px;">
      ${ctx.leadName}, lembrete rapido
    </h1>

    <p style="font-size: 16px; line-height: 1.6; color: #333;">
      Passando para lembrar que seu Blueprint Tecnico
      "<strong>${ctx.blueprintTitle}</strong>" esta salvo em nossa plataforma.
    </p>

    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0;">
      <p style="color: #92400e; margin: 0;">
        ⏰ Blueprints ficam disponiveis por 90 dias. Garanta o download!
      </p>
    </div>

    <p style="font-size: 16px; line-height: 1.6; color: #333;">
      Voce pode baixar em PDF para ter uma copia permanente:
    </p>

    ${ctaButton('Baixar Blueprint em PDF', ctx.scheduleUrl || '#', '#F59E0B')}

    <p style="font-size: 14px; color: #666; margin-top: 24px;">
      Se tiver duvidas sobre o blueprint, responda este email.
    </p>
  `;

  return {
    subject,
    html: baseEmailLayout(content, footerWithUnsubscribe(ctx.unsubscribeUrl))
  };
}

export function mornoEmail3(ctx: EmailContext): { subject: string; html: string } {
  const subject = `Novidades: IA ja esta transformando empresas`;

  const content = `
    <h1 style="color: #1a1a2e; margin-bottom: 20px;">
      ${ctx.leadName}, voce sabia?
    </h1>

    <p style="font-size: 16px; line-height: 1.6; color: #333;">
      A inteligencia artificial esta transformando empresas de todos os tamanhos.
      Veja algumas estatisticas recentes:
    </p>

    <div style="background: #f8f9fa; padding: 24px; border-radius: 12px; margin: 24px 0;">
      <div style="margin-bottom: 16px;">
        <span style="font-size: 24px; font-weight: bold; color: #4F46E5;">72%</span>
        <p style="color: #666; margin: 4px 0 0 0;">das empresas ja usam IA em algum processo</p>
      </div>
      <div style="margin-bottom: 16px;">
        <span style="font-size: 24px; font-weight: bold; color: #10B981;">3.5x</span>
        <p style="color: #666; margin: 4px 0 0 0;">retorno medio sobre investimento em automacao</p>
      </div>
      <div>
        <span style="font-size: 24px; font-weight: bold; color: #F59E0B;">60%</span>
        <p style="color: #666; margin: 4px 0 0 0;">reducao em erros operacionais</p>
      </div>
    </div>

    <p style="font-size: 16px; line-height: 1.6; color: #333;">
      Seu Blueprint ja contem sugestoes de como aplicar essas tecnologias
      no seu caso especifico.
    </p>

    ${ctaButton('Revisar Meu Blueprint', ctx.scheduleUrl || '#', '#4F46E5')}
  `;

  return {
    subject,
    html: baseEmailLayout(content, footerWithUnsubscribe(ctx.unsubscribeUrl))
  };
}

export function mornoEmail4(ctx: EmailContext): { subject: string; html: string } {
  const subject = `Oferta especial: Consultoria gratuita de 1h`;

  const content = `
    <h1 style="color: #1a1a2e; margin-bottom: 20px;">
      ${ctx.leadName}, presente especial 🎁
    </h1>

    <p style="font-size: 16px; line-height: 1.6; color: #333;">
      Faz um tempo desde que voce gerou seu Blueprint. Para ajuda-lo
      a dar o proximo passo, estamos oferecendo algo especial:
    </p>

    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 32px; border-radius: 12px; margin: 24px 0; text-align: center;">
      <p style="font-size: 24px; font-weight: bold; margin: 0;">CONSULTORIA GRATUITA</p>
      <p style="font-size: 48px; font-weight: bold; margin: 8px 0;">1 hora</p>
      <p style="font-size: 16px; margin: 0; opacity: 0.9;">
        com um de nossos especialistas
      </p>
    </div>

    <p style="font-size: 16px; line-height: 1.6; color: #333;">
      Nessa sessao voce pode:
    </p>
    <ul style="color: #555; line-height: 1.8;">
      <li>Tirar todas as duvidas sobre seu Blueprint</li>
      <li>Discutir viabilidade e proximos passos</li>
      <li>Receber recomendacoes personalizadas</li>
      <li>Entender custos e timelines realistas</li>
    </ul>

    <p style="font-size: 16px; color: #333; font-weight: bold;">
      Sem compromisso. Sem pressao de vendas.
    </p>

    ${ctaButton('Agendar Consultoria Gratuita', ctx.scheduleUrl || '#', '#7C3AED')}

    <p style="font-size: 12px; color: #999; margin-top: 24px;">
      Oferta valida por tempo limitado. Vagas limitadas.
    </p>
  `;

  return {
    subject,
    html: baseEmailLayout(content, footerWithUnsubscribe(ctx.unsubscribeUrl))
  };
}
