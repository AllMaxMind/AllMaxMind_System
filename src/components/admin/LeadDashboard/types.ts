// Lead Dashboard Types - Story 5.5

export type KanbanColumn = 'to_contact' | 'in_call' | 'scheduled' | 'done';

export interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  phone?: string;
  whatsapp_phone?: string;
  lead_status: 'quente' | 'acompanhando' | 'morno';
  engagement_score: number;
  feedback_score?: number;
  budget_range?: string;
  scheduled_call?: string;
  phase5_completed_at?: string;
  created_at: string;
  updated_at?: string;
  in_call?: boolean;
  call_completed?: boolean;
  contacted_at?: string;
}

export interface LeadSummary {
  total_leads: number;
  hot_leads_count: number;
  warm_leads_count: number;
  cold_leads_count: number;
  avg_score: number;
  conversion_pct: number;
  phase5_completed_count: number;
  whatsapp_connected_count: number;
}

export interface KanbanLead extends Lead {
  column: KanbanColumn;
}

export interface DashboardFilters {
  status: 'all' | 'quente' | 'acompanhando' | 'morno';
  dateRange: '7d' | '30d' | '90d' | 'all';
  search: string;
}

export interface LeadAnalytics {
  totalLeads: number;
  hotLeadsToday: number;
  conversionRate: number;
  avgScore: number;
  leadsByStatus: { status: string; count: number }[];
  leadsByDay: { date: string; count: number }[];
}
