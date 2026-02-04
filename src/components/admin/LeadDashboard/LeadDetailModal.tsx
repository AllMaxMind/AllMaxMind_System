// Lead Detail Modal - Story 5.5
// Shows full lead information in a modal

import React from 'react';
import { X, Mail, Phone, Building, Calendar, DollarSign, MessageCircle, Clock, User } from 'lucide-react';
import type { Lead } from './types';

interface LeadDetailModalProps {
  lead: Lead;
  onClose: () => void;
}

export function LeadDetailModal({ lead, onClose }: LeadDetailModalProps) {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-ds-bg border border-ds-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-ds-border sticky top-0 bg-ds-bg">
          <div>
            <h2 className="text-xl font-bold text-white">{lead.name}</h2>
            <p className="text-sm text-ds-text-tertiary">{lead.company || 'Sem empresa'}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-ds-surface rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-ds-text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Score & Status */}
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-ds-surface rounded-lg p-4 text-center">
              <p className="text-sm text-ds-text-tertiary mb-1">Score</p>
              <p className={`text-3xl font-bold ${getScoreColor(lead.engagement_score)}`}>
                {lead.engagement_score || 50}
              </p>
            </div>
            <div className="flex-1 bg-ds-surface rounded-lg p-4 text-center">
              <p className="text-sm text-ds-text-tertiary mb-1">Status</p>
              <StatusBadgeLarge status={lead.lead_status} />
            </div>
            {lead.feedback_score && (
              <div className="flex-1 bg-ds-surface rounded-lg p-4 text-center">
                <p className="text-sm text-ds-text-tertiary mb-1">Feedback</p>
                <p className="text-3xl font-bold text-ds-primary-400">
                  {lead.feedback_score}
                </p>
              </div>
            )}
          </div>

          {/* Contact Info */}
          <div className="bg-ds-surface rounded-lg p-4">
            <h3 className="font-medium text-white mb-3">Informacoes de Contato</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-ds-text-tertiary" />
                <a href={`mailto:${lead.email}`} className="text-ds-primary-400 hover:underline">
                  {lead.email}
                </a>
              </div>
              {lead.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-ds-text-tertiary" />
                  <span className="text-ds-text-secondary">{lead.phone}</span>
                </div>
              )}
              {lead.whatsapp_phone && (
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-4 h-4 text-green-400" />
                  <a
                    href={`https://wa.me/${lead.whatsapp_phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 hover:underline"
                  >
                    {lead.whatsapp_phone}
                  </a>
                </div>
              )}
              {lead.company && (
                <div className="flex items-center gap-3">
                  <Building className="w-4 h-4 text-ds-text-tertiary" />
                  <span className="text-ds-text-secondary">{lead.company}</span>
                </div>
              )}
            </div>
          </div>

          {/* Phase 5 Data */}
          {(lead.budget_range || lead.scheduled_call) && (
            <div className="bg-ds-surface rounded-lg p-4">
              <h3 className="font-medium text-white mb-3">Dados da Fase 5</h3>
              <div className="grid grid-cols-2 gap-4">
                {lead.budget_range && (
                  <div>
                    <p className="text-xs text-ds-text-tertiary mb-1 flex items-center gap-1">
                      <DollarSign className="w-3 h-3" /> Orcamento
                    </p>
                    <p className="text-sm text-white">{formatBudget(lead.budget_range)}</p>
                  </div>
                )}
                {lead.scheduled_call && (
                  <div>
                    <p className="text-xs text-ds-text-tertiary mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Reuniao Agendada
                    </p>
                    <p className="text-sm text-white">
                      {new Date(lead.scheduled_call).toLocaleString('pt-BR')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-ds-surface rounded-lg p-4">
            <h3 className="font-medium text-white mb-3">Timeline</h3>
            <div className="space-y-3">
              <TimelineItem
                icon={<User className="w-4 h-4" />}
                label="Lead criado"
                date={lead.created_at}
              />
              {lead.phase5_completed_at && (
                <TimelineItem
                  icon={<Calendar className="w-4 h-4" />}
                  label="Fase 5 completada"
                  date={lead.phase5_completed_at}
                />
              )}
              {lead.contacted_at && (
                <TimelineItem
                  icon={<Phone className="w-4 h-4" />}
                  label="Contatado"
                  date={lead.contacted_at}
                />
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <a
              href={`mailto:${lead.email}`}
              className="flex-1 btn-secondary flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Enviar Email
            </a>
            {lead.whatsapp_phone && (
              <a
                href={`https://wa.me/${lead.whatsapp_phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 btn-primary flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineItem({ icon, label, date }: { icon: React.ReactNode; label: string; date: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 bg-ds-surface-elevated rounded-lg text-ds-text-tertiary">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm text-white">{label}</p>
        <p className="text-xs text-ds-text-tertiary">
          {new Date(date).toLocaleString('pt-BR')}
        </p>
      </div>
    </div>
  );
}

function StatusBadgeLarge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    quente: { label: '🔥 Quente', className: 'bg-red-500/20 text-red-300' },
    acompanhando: { label: '👀 Acompanhando', className: 'bg-yellow-500/20 text-yellow-300' },
    morno: { label: '❄️ Morno', className: 'bg-blue-500/20 text-blue-300' }
  };

  const { label, className } = config[status] || config.morno;

  return (
    <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${className}`}>
      {label}
    </span>
  );
}

function formatBudget(budget: string): string {
  const map: Record<string, string> = {
    ate_30k: 'Ate R$ 30.000',
    '30_60k': 'R$ 30.000 - R$ 60.000',
    '60_120k': 'R$ 60.000 - R$ 120.000',
    acima_120k: 'Acima de R$ 120.000'
  };
  return map[budget] || budget;
}

function getScoreColor(score: number): string {
  if (score >= 75) return 'text-red-400';
  if (score >= 50) return 'text-yellow-400';
  return 'text-blue-400';
}
