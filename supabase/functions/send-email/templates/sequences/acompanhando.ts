// Warm Lead Email Templates (Score 50-74)
// Story 5.4 - Email Sequences

import type { EmailContext } from './types.ts';
import { baseEmailLayout, ctaButton, footerWithUnsubscribe } from './shared.ts';

export function acompEmail1(ctx: EmailContext): { subject: string; html: string } {
  const subject = `Achamos sua situacao muito interessante`;

  const content = `
    <h1 style="color: #1a1a2e; margin-bottom: 20px;">
      Ola ${ctx.leadName}!
    </h1>

    <p style="font-size: 16px; line-height: 1.6; color: #333;">
      Analisamos o problema que voce compartilhou e achamos muito interessante:
    </p>

    <div style="background: #e8f4f8; border-left: 4px solid #17a2b8; padding: 16px; margin: 24px 0;">
      <p style="color: #0c5460; margin: 0; font-style: italic;">
        "${ctx.problemStatement.substring(0, 120)}..."
      </p>
    </div>

    <p style="font-size: 16px; line-height: 1.6; color: #333;">
      Seu Blueprint Tecnico esta salvo e disponivel sempre que precisar.
      Quando estiver pronto para dar o proximo passo, estaremos aqui.
    </p>

    ${ctaButton('Revisar Meu Blueprint', ctx.scheduleUrl || '#', '#17A2B8')}

    <p style="font-size: 14px; color: #666; margin-top: 24px;">
      Enquanto isso, fique a vontade para explorar nossos recursos.
    </p>
  `;

  return {
    subject,
    html: baseEmailLayout(content, footerWithUnsubscribe(ctx.unsubscribeUrl))
  };
}

export function acompEmail2(ctx: EmailContext): { subject: string; html: string } {
  const subject = `Case: Empresa similar implementou em 30 dias`;

  const content = `
    <h1 style="color: #1a1a2e; margin-bottom: 20px;">
      ${ctx.leadName}, veja este caso
    </h1>

    <p style="font-size: 16px; line-height: 1.6; color: #333;">
      Uma empresa com desafios similares aos de ${ctx.companyName}
      conseguiu implementar a solucao em apenas 30 dias.
    </p>

    <div style="background: #f8f9fa; padding: 24px; border-radius: 12px; margin: 24px 0; text-align: center;">
      <div style="display: inline-block; text-align: center; margin: 0 20px;">
        <p style="font-size: 36px; font-weight: bold; color: #4F46E5; margin: 0;">30</p>
        <p style="color: #666; margin: 4px 0 0 0;">dias</p>
      </div>
      <div style="display: inline-block; text-align: center; margin: 0 20px;">
        <p style="font-size: 36px; font-weight: bold; color: #10B981; margin: 0;">45%</p>
        <p style="color: #666; margin: 4px 0 0 0;">mais eficiencia</p>
      </div>
      <div style="display: inline-block; text-align: center; margin: 0 20px;">
        <p style="font-size: 36px; font-weight: bold; color: #F59E0B; margin: 0;">R$80k</p>
        <p style="color: #666; margin: 4px 0 0 0;">economia/ano</p>
      </div>
    </div>

    <h3 style="color: #1a1a2e;">Como eles fizeram:</h3>
    <ol style="color: #555; line-height: 1.8;">
      <li>Priorizaram os 3 processos mais criticos</li>
      <li>Implementaram em fases de 2 semanas</li>
      <li>Treinaram a equipe gradualmente</li>
      <li>Mediram resultados desde o dia 1</li>
    </ol>

    ${ctaButton('Conhecer o Case Completo', ctx.caseStudyUrl || '#', '#4F46E5')}
  `;

  return {
    subject,
    html: baseEmailLayout(content, footerWithUnsubscribe(ctx.unsubscribeUrl))
  };
}

export function acompEmail3(ctx: EmailContext): { subject: string; html: string } {
  const subject = `Reduzir custos operacionais: Guia pratico`;

  const content = `
    <h1 style="color: #1a1a2e; margin-bottom: 20px;">
      ${ctx.leadName}, um guia para voce
    </h1>

    <p style="font-size: 16px; line-height: 1.6; color: #333;">
      Preparamos um guia pratico com as principais estrategias para
      reduzir custos operacionais usando automacao e IA.
    </p>

    <div style="background: #f0fdf4; border: 1px solid #86efac; padding: 20px; border-radius: 8px; margin: 24px 0;">
      <h3 style="color: #166534; margin-top: 0;">O que voce vai aprender:</h3>
      <ul style="color: #15803d; margin-bottom: 0;">
        <li>5 processos que toda empresa deve automatizar primeiro</li>
        <li>Como calcular o ROI de projetos de automacao</li>
        <li>Erros comuns e como evita-los</li>
        <li>Checklist de implementacao</li>
      </ul>
    </div>

    ${ctaButton('Baixar Guia Gratuito', ctx.caseStudyUrl || '#', '#16A34A')}

    <p style="font-size: 14px; color: #666; margin-top: 24px;">
      Dica: O guia complementa perfeitamente o Blueprint que voce gerou!
    </p>
  `;

  return {
    subject,
    html: baseEmailLayout(content, footerWithUnsubscribe(ctx.unsubscribeUrl))
  };
}

export function acompEmail4(ctx: EmailContext): { subject: string; html: string } {
  const subject = `Aproveite 20% de desconto por tempo limitado`;

  const content = `
    <h1 style="color: #1a1a2e; margin-bottom: 20px;">
      ${ctx.leadName}, uma oferta especial 🎁
    </h1>

    <p style="font-size: 16px; line-height: 1.6; color: #333;">
      Notamos que voce ainda nao deu o proximo passo com seu Blueprint.
      Para ajuda-lo a comecar, estamos oferecendo um desconto exclusivo:
    </p>

    <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 32px; border-radius: 12px; margin: 24px 0; text-align: center;">
      <p style="font-size: 48px; font-weight: bold; margin: 0;">20% OFF</p>
      <p style="font-size: 18px; margin: 8px 0 0 0;">em qualquer plano de consultoria</p>
      <p style="font-size: 14px; margin: 16px 0 0 0; opacity: 0.9;">
        Valido por 7 dias | Codigo: <strong>BLUEPRINT20</strong>
      </p>
    </div>

    <p style="font-size: 16px; line-height: 1.6; color: #333;">
      Esta oferta inclui:
    </p>
    <ul style="color: #555; line-height: 1.8;">
      <li>Sessao de consultoria de 2 horas</li>
      <li>Revisao detalhada do seu Blueprint</li>
      <li>Plano de acao personalizado</li>
      <li>Suporte por 30 dias</li>
    </ul>

    ${ctaButton('Aproveitar Desconto', ctx.scheduleUrl || '#', '#EC4899')}

    <p style="font-size: 12px; color: #999; margin-top: 24px;">
      Oferta valida ate ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}.
      Nao cumulativa com outras promocoes.
    </p>
  `;

  return {
    subject,
    html: baseEmailLayout(content, footerWithUnsubscribe(ctx.unsubscribeUrl))
  };
}
