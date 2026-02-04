// Email Sequence Templates Index
// Story 5.4 - Export all sequence templates

export type { EmailContext, SequenceTemplateId } from './types.ts';
export { baseEmailLayout, ctaButton, footerWithUnsubscribe, divider } from './shared.ts';

// Hot lead templates (score >= 75)
export {
  quenteEmail1,
  quenteEmail2,
  quenteEmail3,
  quenteEmail4
} from './quente.ts';

// Warm lead templates (score 50-74)
export {
  acompEmail1,
  acompEmail2,
  acompEmail3,
  acompEmail4
} from './acompanhando.ts';

// Cold lead templates (score < 50)
export {
  mornoEmail1,
  mornoEmail2,
  mornoEmail3,
  mornoEmail4
} from './morno.ts';

import type { EmailContext, SequenceTemplateId } from './types.ts';
import { quenteEmail1, quenteEmail2, quenteEmail3, quenteEmail4 } from './quente.ts';
import { acompEmail1, acompEmail2, acompEmail3, acompEmail4 } from './acompanhando.ts';
import { mornoEmail1, mornoEmail2, mornoEmail3, mornoEmail4 } from './morno.ts';

// Template renderer map
export const SEQUENCE_TEMPLATES: Record<
  SequenceTemplateId,
  (ctx: EmailContext) => { subject: string; html: string }
> = {
  quente_1: quenteEmail1,
  quente_2: quenteEmail2,
  quente_3: quenteEmail3,
  quente_4: quenteEmail4,
  acomp_1: acompEmail1,
  acomp_2: acompEmail2,
  acomp_3: acompEmail3,
  acomp_4: acompEmail4,
  morno_1: mornoEmail1,
  morno_2: mornoEmail2,
  morno_3: mornoEmail3,
  morno_4: mornoEmail4,
};

/**
 * Get the appropriate template function for a sequence template ID
 */
export function getSequenceTemplate(
  templateId: SequenceTemplateId
): (ctx: EmailContext) => { subject: string; html: string } {
  const template = SEQUENCE_TEMPLATES[templateId];
  if (!template) {
    throw new Error(`Unknown sequence template: ${templateId}`);
  }
  return template;
}
