// Hot Lead Email Templates (Score >= 75)
// Story 5.4 - Email Sequences

import type { EmailContext } from './types.ts';
import { baseEmailLayout, ctaButton, footerWithUnsubscribe } from './shared.ts';

export function quenteEmail1(ctx: EmailContext): { subject: string; html: string } {
  const subject = `Seu Blueprint Tecnico: ${ctx.blueprintTitle}`;

  const content = `
    <h1 style="color: #1a1a2e; margin-bottom: 20px;">
      Ola ${ctx.leadName}! 🎉
    </h1>

    <p style="font-size: 16px; line-height: 1.6; color: #333;">
      Obrigado por completar a analise do seu projeto. Seu Blueprint Tecnico
      "<strong>${ctx.blueprintTitle}</strong>" esta pronto!
    </p>

    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 24px 0;">
      <h3 style="color: #1a1a2e; margin-top: 0;">Proximos Passos:</h3>
      <ol style="color: #555; padding-left: 20px;">
        <li>Revise o blueprint com sua equipe</li>
        <li>Identifique as prioridades de implementacao</li>
        <li>Agende uma sessao de discussao com nosso especialista</li>
      </ol>
    </div>

    ${ctaButton('Ver Meu Blueprint', `${ctx.scheduleUrl || '#'}`, '#4F46E5')}

    <p style="font-size: 14px; color: #666; margin-top: 24px;">
      Estamos ansiosos para ajudar ${ctx.companyName} a transformar seu negocio!
    </p>
  `;

  return {
    subject,
    html: baseEmailLayout(content, footerWithUnsubscribe(ctx.unsubscribeUrl))
  };
}

export function quenteEmail2(ctx: EmailContext): { subject: string; html: string } {
  const subject = `Como empresas como ${ctx.companyName} reduziram custos`;

  const content = `
    <h1 style="color: #1a1a2e; margin-bottom: 20px;">
      ${ctx.leadName}, veja como outros conseguiram
    </h1>

    <p style="font-size: 16px; line-height: 1.6; color: #333;">
      Empresas semelhantes a ${ctx.companyName} implementaram solucoes de
      automacao e IA para resolver desafios como o seu:
    </p>

    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 24px; border-radius: 12px; margin: 24px 0;">
      <p style="font-size: 32px; font-weight: bold; margin: 0;">-40%</p>
      <p style="margin: 8px 0 0 0;">Reducao media em custos operacionais</p>
    </div>

    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 24px 0;">
      <h3 style="color: #1a1a2e; margin-top: 0;">Caso de Sucesso:</h3>
      <p style="color: #555;">
        "Implementamos a solucao em 6 semanas e ja vimos uma reducao de 35%
        no tempo de processamento manual."
      </p>
      <p style="color: #888; font-size: 14px; margin-bottom: 0;">
        — Diretor de Operacoes, Empresa do Setor de Servicos
      </p>
    </div>

    ${ctaButton('Quero Saber Mais', ctx.caseStudyUrl || '#', '#10B981')}
  `;

  return {
    subject,
    html: baseEmailLayout(content, footerWithUnsubscribe(ctx.unsubscribeUrl))
  };
}

export function quenteEmail3(ctx: EmailContext): { subject: string; html: string } {
  const subject = `Sua analise tecnica: ${ctx.blueprintTitle}`;

  const content = `
    <h1 style="color: #1a1a2e; margin-bottom: 20px;">
      ${ctx.leadName}, sua analise tecnica detalhada
    </h1>

    <p style="font-size: 16px; line-height: 1.6; color: #333;">
      Nosso time preparou uma analise mais profunda do seu projeto baseada
      no problema que voce descreveu:
    </p>

    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 16px; margin: 24px 0;">
      <p style="color: #856404; margin: 0; font-style: italic;">
        "${ctx.problemStatement.substring(0, 150)}..."
      </p>
    </div>

    <h3 style="color: #1a1a2e;">O que incluimos na analise:</h3>
    <ul style="color: #555; line-height: 1.8;">
      <li>Diagrama de arquitetura proposta</li>
      <li>Estimativa de timeline detalhada</li>
      <li>ROI projetado para 12 meses</li>
      <li>Stack tecnologico recomendado</li>
    </ul>

    ${ctaButton('Acessar Analise Completa', ctx.scheduleUrl || '#', '#4F46E5')}

    <p style="font-size: 14px; color: #666; margin-top: 24px;">
      Quer discutir os detalhes? Estamos disponiveis para uma call rapida.
    </p>
  `;

  return {
    subject,
    html: baseEmailLayout(content, footerWithUnsubscribe(ctx.unsubscribeUrl))
  };
}

export function quenteEmail4(ctx: EmailContext): { subject: string; html: string } {
  const subject = `Confirmar discussao com especialista`;

  const content = `
    <h1 style="color: #1a1a2e; margin-bottom: 20px;">
      ${ctx.leadName}, vamos conversar?
    </h1>

    <p style="font-size: 16px; line-height: 1.6; color: #333;">
      Ja faz alguns dias desde que voce gerou seu Blueprint Tecnico.
      Gostaríamos de agendar uma conversa para:
    </p>

    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 24px 0;">
      <ul style="color: #555; line-height: 1.8; margin: 0; padding-left: 20px;">
        <li>Discutir suas duvidas sobre a implementacao</li>
        <li>Ajustar o blueprint conforme suas necessidades especificas</li>
        <li>Apresentar opcoes de parceria e suporte</li>
        <li>Definir proximos passos concretos</li>
      </ul>
    </div>

    <p style="font-size: 16px; color: #333;">
      A conversa dura aproximadamente <strong>30 minutos</strong> e e totalmente
      sem compromisso.
    </p>

    ${ctaButton('Agendar Conversa Agora', ctx.scheduleUrl || '#', '#EF4444')}

    <p style="font-size: 14px; color: #666; margin-top: 24px;">
      Prefere WhatsApp? Responda este email com seu numero.
    </p>
  `;

  return {
    subject,
    html: baseEmailLayout(content, footerWithUnsubscribe(ctx.unsubscribeUrl))
  };
}
