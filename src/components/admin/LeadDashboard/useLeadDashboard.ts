// Lead Dashboard Hook - Story 5.5
// Manages data fetching and state for the lead dashboard

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import type { Lead, LeadSummary, DashboardFilters, KanbanColumn, KanbanLead } from './types';

export function useLeadDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [summary, setSummary] = useState<LeadSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DashboardFilters>({
    status: 'all',
    dateRange: '30d',
    search: ''
  });

  // Fetch leads from Supabase
  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('leads')
        .select('*')
        .order('engagement_score', { ascending: false });

      // Apply status filter
      if (filters.status !== 'all') {
        query = query.eq('lead_status', filters.status);
      }

      // Apply date range filter
      if (filters.dateRange !== 'all') {
        const days = parseInt(filters.dateRange);
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - days);
        query = query.gte('created_at', fromDate.toISOString());
      }

      // Apply search filter
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,company.ilike.%${filters.search}%`);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setLeads((data as Lead[]) || []);
    } catch (err) {
      console.error('[LeadDashboard] Error fetching leads:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch summary from view
  const fetchSummary = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('lead_summary')
        .select('*')
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        throw fetchError;
      }

      if (data) {
        setSummary(data as LeadSummary);
      }
    } catch (err) {
      console.warn('[LeadDashboard] Error fetching summary:', err);
      // Don't set error - summary is optional
    }
  }, []);

  // Update lead column in Kanban
  const updateLeadColumn = async (leadId: string, column: KanbanColumn): Promise<boolean> => {
    try {
      const updates: Record<string, any> = {
        updated_at: new Date().toISOString()
      };

      switch (column) {
        case 'to_contact':
          updates.in_call = false;
          updates.call_completed = false;
          updates.contacted_at = null;
          break;
        case 'in_call':
          updates.in_call = true;
          updates.contacted_at = new Date().toISOString();
          break;
        case 'scheduled':
          updates.in_call = false;
          // Keep scheduled_call as is
          break;
        case 'done':
          updates.in_call = false;
          updates.call_completed = true;
          break;
      }

      const { error: updateError } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', leadId);

      if (updateError) throw updateError;

      // Update local state
      setLeads(prev => prev.map(lead =>
        lead.id === leadId ? { ...lead, ...updates } : lead
      ));

      return true;
    } catch (err) {
      console.error('[LeadDashboard] Error updating lead:', err);
      return false;
    }
  };

  // Get leads organized by Kanban columns
  const getKanbanLeads = useCallback((): Record<KanbanColumn, KanbanLead[]> => {
    const kanban: Record<KanbanColumn, KanbanLead[]> = {
      to_contact: [],
      in_call: [],
      scheduled: [],
      done: []
    };

    // Only show hot leads in Kanban
    const hotLeads = leads.filter(l => l.lead_status === 'quente');

    hotLeads.forEach(lead => {
      let column: KanbanColumn;

      if (lead.call_completed) {
        column = 'done';
      } else if (lead.scheduled_call) {
        column = 'scheduled';
      } else if (lead.in_call) {
        column = 'in_call';
      } else {
        column = 'to_contact';
      }

      kanban[column].push({ ...lead, column });
    });

    return kanban;
  }, [leads]);

  // Initial fetch
  useEffect(() => {
    fetchLeads();
    fetchSummary();
  }, [fetchLeads, fetchSummary]);

  // Refresh data
  const refresh = useCallback(() => {
    fetchLeads();
    fetchSummary();
  }, [fetchLeads, fetchSummary]);

  return {
    leads,
    summary,
    loading,
    error,
    filters,
    setFilters,
    updateLeadColumn,
    getKanbanLeads,
    refresh
  };
}
