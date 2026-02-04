// Lead Dashboard - Story 5.5
// Main admin dashboard for lead pipeline management

import React, { useState } from 'react';
import { LayoutGrid, List, AlertCircle } from 'lucide-react';
import { useLeadDashboard } from './useLeadDashboard';
import { StatsCards } from './StatsCards';
import { KanbanBoard } from './KanbanBoard';
import { LeadTable } from './LeadTable';
import { LeadDetailModal } from './LeadDetailModal';
import { Filters } from './Filters';
import type { Lead, KanbanLead } from './types';

type ViewMode = 'kanban' | 'table';

export function LeadDashboard() {
  const {
    leads,
    summary,
    loading,
    error,
    filters,
    setFilters,
    updateLeadColumn,
    getKanbanLeads,
    refresh
  } = useLeadDashboard();

  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const handleMoveCard = async (leadId: string, newColumn: any) => {
    await updateLeadColumn(leadId, newColumn);
  };

  const handleLeadClick = (lead: Lead | KanbanLead) => {
    setSelectedLead(lead);
  };

  return (
    <div className="min-h-screen bg-ds-bg p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Lead Dashboard</h1>
          <p className="text-ds-text-tertiary">Gerencie seu pipeline de leads quentes</p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-ds-surface rounded-lg p-1">
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
              viewMode === 'kanban'
                ? 'bg-ds-primary-500 text-white'
                : 'text-ds-text-secondary hover:text-white'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Kanban
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
              viewMode === 'table'
                ? 'bg-ds-primary-500 text-white'
                : 'text-ds-text-secondary hover:text-white'
            }`}
          >
            <List className="w-4 h-4" />
            Lista
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-300">Erro ao carregar dados</p>
            <p className="text-sm text-red-400/80">{error}</p>
          </div>
          <button
            onClick={refresh}
            className="ml-auto btn-secondary text-sm"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <StatsCards summary={summary} loading={loading} />

      {/* Filters */}
      <Filters
        filters={filters}
        onFiltersChange={setFilters}
        onRefresh={refresh}
        loading={loading}
      />

      {/* Content */}
      {viewMode === 'kanban' ? (
        <KanbanBoard
          leads={getKanbanLeads()}
          onMoveCard={handleMoveCard}
          onCardClick={handleLeadClick}
        />
      ) : (
        <LeadTable
          leads={leads}
          loading={loading}
          onLeadClick={handleLeadClick}
        />
      )}

      {/* Lead Detail Modal */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
        />
      )}
    </div>
  );
}

export default LeadDashboard;
