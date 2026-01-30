// Email Templates Index
// Re-export all templates for easy importing

export { leadConfirmationTemplate, type LeadConfirmationData } from './leadConfirmation.ts';
export { blueprintDeliveryTemplate, type BlueprintDeliveryData } from './blueprintDelivery.ts';
export { prototypeOfferTemplate, type PrototypeOfferData } from './prototypeOffer.ts';

// Template type union for type safety
export type TemplateType = 'lead_confirmation' | 'blueprint_delivery' | 'prototype_offer';

// Template data map
export type TemplateDataMap = {
  lead_confirmation: import('./leadConfirmation.ts').LeadConfirmationData;
  blueprint_delivery: import('./blueprintDelivery.ts').BlueprintDeliveryData;
  prototype_offer: import('./prototypeOffer.ts').PrototypeOfferData;
};
