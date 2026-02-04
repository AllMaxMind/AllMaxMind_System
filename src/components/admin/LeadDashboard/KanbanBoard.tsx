// Kanban Board Component - Story 5.5
// Visual pipeline for hot lead management

import React from 'react';
import { Phone, Calendar, CheckCircle, User, Mail, Building, Clock } from 'lucide-react';
import type { KanbanColumn, KanbanLead } from './types';

interface KanbanBoardProps {
  leads: Record<KanbanColumn, KanbanLead[]>;
  onMoveCard: (leadId: string, newColumn: KanbanColumn) => void;
  onCardClick: (lead: KanbanLead) => void;
}

const COLUMNS: { id: KanbanColumn; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'to_contact', label: 'A Contatar', icon: <User className="w-4 h-4" />, color: 'border-yellow-500' },
  { id: 'in_call', label: 'Em Ligacao', icon: <Phone className="w-4 h-4" />, color: 'border-blue-500' },
  { id: 'scheduled', label: 'Agendado', icon: <Calendar className="w-4 h-4" />, color: 'border-purple-500' },
  { id: 'done', label: 'Finalizado', icon: <CheckCircle className="w-4 h-4" />, color: 'border-green-500' }
];

export function KanbanBoard({ leads, onMoveCard, onCardClick }: KanbanBoardProps) {
  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('leadId', leadId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, column: KanbanColumn) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('leadId');
    if (leadId) {
      onMoveCard(leadId, column);
    }
  };

  return (
    <div className="glass-card p-4">
      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <span className="text-red-400">🔥</span>
        Pipeline de Leads Quentes
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNS.map(column => (
          <div
            key={column.id}
            className={`bg-ds-surface rounded-lg p-3 min-h-[300px] border-t-2 ${column.color}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-ds-text-secondary">
                {column.icon}
                <span className="font-medium">{column.label}</span>
              </div>
              <span className="bg-ds-surface-elevated px-2 py-0.5 rounded text-xs text-ds-text-tertiary">
                {leads[column.id].length}
              </span>
            </div>

            <div className="space-y-2">
              {leads[column.id].map(lead => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  onDragStart={handleDragStart}
                  onClick={() => onCardClick(lead)}
                />
              ))}

              {leads[column.id].length === 0 && (
                <div className="text-center py-8 text-ds-text-tertiary text-sm">
                  Nenhum lead
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface LeadCardProps {
  lead: KanbanLead;
  onDragStart: (e: React.DragEvent, leadId: string) => void;
  onClick: () => void;
}

function LeadCard({ lead, onDragStart, onClick }: LeadCardProps) {
  const scoreColor = lead.engagement_score >= 80
    ? 'text-red-400'
    : lead.engagement_score >= 70
      ? 'text-orange-400'
      : 'text-yellow-400';

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, lead.id)}
      onClick={onClick}
      className="bg-ds-bg p-3 rounded-lg cursor-pointer hover:bg-ds-surface-elevated transition-colors border border-ds-border"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-white truncate">{lead.name}</p>
          <div className="flex items-center gap-1 text-xs text-ds-text-tertiary">
            <Building className="w-3 h-3" />
            <span className="truncate">{lead.company || 'N/A'}</span>
          </div>
        </div>
        <span className={`font-bold text-sm ${scoreColor}`}>
          {lead.engagement_score}
        </span>
      </div>

      <div className="flex items-center gap-3 text-xs text-ds-text-tertiary">
        <div className="flex items-center gap-1">
          <Mail className="w-3 h-3" />
          <span className="truncate max-w-[100px]">{lead.email}</span>
        </div>
        {lead.scheduled_call && (
          <div className="flex items-center gap-1 text-purple-400">
            <Clock className="w-3 h-3" />
            <span>{new Date(lead.scheduled_call).toLocaleDateString('pt-BR')}</span>
          </div>
        )}
      </div>

      {lead.budget_range && (
        <div className="mt-2">
          <span className="text-xs px-2 py-0.5 bg-ds-primary-500/20 text-ds-primary-300 rounded">
            {formatBudget(lead.budget_range)}
          </span>
        </div>
      )}
    </div>
  );
}

function formatBudget(budget: string): string {
  const map: Record<string, string> = {
    ate_30k: 'Ate R$ 30k',
    '30_60k': 'R$ 30-60k',
    '60_120k': 'R$ 60-120k',
    acima_120k: '+R$ 120k'
  };
  return map[budget] || budget;
}
