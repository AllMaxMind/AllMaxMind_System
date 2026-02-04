// Stats Cards Component - Story 5.5
// Displays key metrics at the top of the dashboard

import React from 'react';
import { Users, Flame, TrendingUp, MessageCircle } from 'lucide-react';
import type { LeadSummary } from './types';

interface StatsCardsProps {
  summary: LeadSummary | null;
  loading: boolean;
}

export function StatsCards({ summary, loading }: StatsCardsProps) {
  const stats = [
    {
      label: 'Total Leads',
      value: summary?.total_leads ?? 0,
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      label: 'Leads Quentes',
      value: summary?.hot_leads_count ?? 0,
      icon: Flame,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10'
    },
    {
      label: 'Taxa Conversao',
      value: `${(summary?.conversion_pct ?? 0).toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10'
    },
    {
      label: 'WhatsApp',
      value: summary?.whatsapp_connected_count ?? 0,
      icon: MessageCircle,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card p-4 animate-pulse">
            <div className="h-12 bg-ds-surface rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="glass-card p-4">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-ds-text-tertiary">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
