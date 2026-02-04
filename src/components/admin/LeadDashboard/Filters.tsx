// Dashboard Filters Component - Story 5.5

import React from 'react';
import { Search, RefreshCw, Filter } from 'lucide-react';
import type { DashboardFilters } from './types';

interface FiltersProps {
  filters: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
  onRefresh: () => void;
  loading: boolean;
}

export function Filters({ filters, onFiltersChange, onRefresh, loading }: FiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ds-text-tertiary" />
        <input
          type="text"
          placeholder="Buscar por nome, email ou empresa..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="w-full pl-10 pr-4 py-2 bg-ds-surface border border-ds-border rounded-lg text-white placeholder:text-ds-text-tertiary focus:outline-none focus:border-ds-primary-500"
        />
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-ds-text-tertiary" />
        <select
          value={filters.status}
          onChange={(e) => onFiltersChange({ ...filters, status: e.target.value as any })}
          className="bg-ds-surface border border-ds-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-ds-primary-500"
        >
          <option value="all">Todos Status</option>
          <option value="quente">🔥 Quente</option>
          <option value="acompanhando">👀 Acompanhando</option>
          <option value="morno">❄️ Morno</option>
        </select>
      </div>

      {/* Date Range Filter */}
      <select
        value={filters.dateRange}
        onChange={(e) => onFiltersChange({ ...filters, dateRange: e.target.value as any })}
        className="bg-ds-surface border border-ds-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-ds-primary-500"
      >
        <option value="7d">Ultimos 7 dias</option>
        <option value="30d">Ultimos 30 dias</option>
        <option value="90d">Ultimos 90 dias</option>
        <option value="all">Todo periodo</option>
      </select>

      {/* Refresh Button */}
      <button
        onClick={onRefresh}
        disabled={loading}
        className="btn-secondary flex items-center gap-2 px-4"
      >
        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        Atualizar
      </button>
    </div>
  );
}
