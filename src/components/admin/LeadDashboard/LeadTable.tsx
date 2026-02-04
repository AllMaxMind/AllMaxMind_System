// Lead Table Component - Story 5.5
// Full list view of all leads with sorting and filtering

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, Mail, Phone } from 'lucide-react';
import type { Lead } from './types';

interface LeadTableProps {
  leads: Lead[];
  loading: boolean;
  onLeadClick: (lead: Lead) => void;
}

type SortField = 'name' | 'engagement_score' | 'lead_status' | 'created_at';
type SortDirection = 'asc' | 'desc';

export function LeadTable({ leads, loading, onLeadClick }: LeadTableProps) {
  const [sortField, setSortField] = useState<SortField>('engagement_score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedLeads = [...leads].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'engagement_score':
        comparison = (a.engagement_score || 0) - (b.engagement_score || 0);
        break;
      case 'lead_status':
        comparison = a.lead_status.localeCompare(b.lead_status);
        break;
      case 'created_at':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
    }
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc'
      ? <ChevronUp className="w-4 h-4 inline ml-1" />
      : <ChevronDown className="w-4 h-4 inline ml-1" />;
  };

  if (loading) {
    return (
      <div className="glass-card p-4">
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-ds-surface rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-ds-border">
              <th
                className="px-4 py-3 text-left text-sm font-medium text-ds-text-secondary cursor-pointer hover:text-white"
                onClick={() => handleSort('name')}
              >
                Nome <SortIcon field="name" />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-ds-text-secondary">
                Empresa
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-ds-text-secondary">
                Contato
              </th>
              <th
                className="px-4 py-3 text-center text-sm font-medium text-ds-text-secondary cursor-pointer hover:text-white"
                onClick={() => handleSort('engagement_score')}
              >
                Score <SortIcon field="engagement_score" />
              </th>
              <th
                className="px-4 py-3 text-center text-sm font-medium text-ds-text-secondary cursor-pointer hover:text-white"
                onClick={() => handleSort('lead_status')}
              >
                Status <SortIcon field="lead_status" />
              </th>
              <th
                className="px-4 py-3 text-left text-sm font-medium text-ds-text-secondary cursor-pointer hover:text-white"
                onClick={() => handleSort('created_at')}
              >
                Criado <SortIcon field="created_at" />
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-ds-text-secondary">
                Acoes
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedLeads.map(lead => (
              <tr
                key={lead.id}
                className="border-b border-ds-border hover:bg-ds-surface/50 cursor-pointer transition-colors"
                onClick={() => onLeadClick(lead)}
              >
                <td className="px-4 py-3">
                  <p className="font-medium text-white">{lead.name}</p>
                </td>
                <td className="px-4 py-3 text-ds-text-secondary">
                  {lead.company || '-'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 text-xs text-ds-text-tertiary">
                    <Mail className="w-3 h-3" />
                    <span className="truncate max-w-[150px]">{lead.email}</span>
                  </div>
                  {lead.whatsapp_phone && (
                    <div className="flex items-center gap-2 text-xs text-green-400 mt-1">
                      <Phone className="w-3 h-3" />
                      <span>{lead.whatsapp_phone}</span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`font-bold ${getScoreColor(lead.engagement_score)}`}>
                    {lead.engagement_score || 50}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <StatusBadge status={lead.lead_status} />
                </td>
                <td className="px-4 py-3 text-ds-text-tertiary text-sm">
                  {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLeadClick(lead);
                    }}
                    className="p-2 hover:bg-ds-surface rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-ds-text-tertiary" />
                  </button>
                </td>
              </tr>
            ))}

            {sortedLeads.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-ds-text-tertiary">
                  Nenhum lead encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    quente: { label: 'Quente', className: 'bg-red-500/20 text-red-300' },
    acompanhando: { label: 'Acompanhando', className: 'bg-yellow-500/20 text-yellow-300' },
    morno: { label: 'Morno', className: 'bg-blue-500/20 text-blue-300' }
  };

  const { label, className } = config[status] || config.morno;

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

function getScoreColor(score: number): string {
  if (score >= 75) return 'text-red-400';
  if (score >= 50) return 'text-yellow-400';
  return 'text-blue-400';
}
