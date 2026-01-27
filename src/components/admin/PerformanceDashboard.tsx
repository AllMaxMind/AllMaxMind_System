import React, { useState, useEffect } from 'react';
import { RefreshCw, Download, AlertTriangle, Settings, CheckCircle } from 'lucide-react';
import { captureError } from '../../lib/monitoring/sentry';

const PerformanceDashboard = () => {
  const [metrics, setMetrics] = useState({
    coreWebVitals: {
      lcp: 0,
      fid: 0,
      cls: 0,
      inp: 0,
      ttfb: 0
    },
    businessMetrics: {
      totalVisitors: 0,
      conversionRate: 0,
      avgSessionDuration: 0,
      bounceRate: 0
    },
    errorMetrics: {
      totalErrors: 0,
      errorRate: 0,
      topErrors: [] as Array<{message: string, count: number}>
    },
    systemMetrics: {
      uptime: 100,
      responseTime: 0,
      apiHealth: 'healthy' as 'healthy' | 'degraded' | 'down'
    }
  });

  const [timeRange, setTimeRange] = useState('24h');

  useEffect(() => {
    loadPerformanceMetrics();
    const interval = setInterval(loadPerformanceMetrics, 60000); // Atualizar a cada minuto
    return () => clearInterval(interval);
  }, [timeRange]);

  const loadPerformanceMetrics = async () => {
    try {
      // Mocking API calls for the dashboard since endpoints are server-side
      // In a real scenario, these would hit /api/analytics/metrics etc.
      
      // Simulate data fetch
      setMetrics({
        coreWebVitals: {
          lcp: 1200,
          fid: 50,
          cls: 0.05,
          inp: 150,
          ttfb: 200
        },
        businessMetrics: {
          totalVisitors: 1250,
          conversionRate: 4.5,
          avgSessionDuration: 180,
          bounceRate: 45
        },
        errorMetrics: {
          totalErrors: 2,
          errorRate: 0.16,
          topErrors: [{ message: 'Network timeout on API', count: 2 }]
        },
        systemMetrics: {
          uptime: 99.99,
          responseTime: 120,
          apiHealth: 'healthy'
        }
      });
    } catch (error) {
      console.error('[Dashboard] Error loading metrics:', error);
      captureError(error as Error, { component: 'PerformanceDashboard' });
    }
  };

  const getVitalStatus = (metric: string, value: number) => {
    const thresholds: Record<string, { good: number; needsImprovement: number }> = {
      lcp: { good: 2500, needsImprovement: 4000 },
      fid: { good: 100, needsImprovement: 300 },
      cls: { good: 0.1, needsImprovement: 0.25 },
      inp: { good: 200, needsImprovement: 500 },
      ttfb: { good: 800, needsImprovement: 1800 }
    };

    const threshold = thresholds[metric];
    if (!threshold) return 'unknown';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.needsImprovement) return 'needs-improvement';
    return 'poor';
  };

  return (
    <div className="p-6 space-y-8 bg-ds-bg min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Performance Dashboard</h1>
          <p className="text-ds-text-secondary">
            Monitoramento em tempo real - ALL MAX MIND
          </p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="input-field w-40 py-2"
          >
            <option value="1h">Última hora</option>
            <option value="24h">Últimas 24h</option>
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
          </select>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            metrics.systemMetrics.apiHealth === 'healthy' ? 'bg-green-500/20 text-green-300' :
            metrics.systemMetrics.apiHealth === 'degraded' ? 'bg-yellow-500/20 text-yellow-300' :
            'bg-red-500/20 text-red-300'
          }`}>
            {metrics.systemMetrics.apiHealth === 'healthy' ? '✅ Operacional' :
             metrics.systemMetrics.apiHealth === 'degraded' ? '⚠️ Degradado' : '🔴 Fora do ar'}
          </div>
        </div>
      </div>

      {/* Core Web Vitals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { key: 'lcp', label: 'LCP', value: metrics.coreWebVitals.lcp, unit: 'ms', description: 'Largest Contentful Paint' },
          { key: 'fid', label: 'FID', value: metrics.coreWebVitals.fid, unit: 'ms', description: 'First Input Delay' },
          { key: 'cls', label: 'CLS', value: metrics.coreWebVitals.cls, unit: '', description: 'Cumulative Layout Shift' },
          { key: 'inp', label: 'INP', value: metrics.coreWebVitals.inp, unit: 'ms', description: 'Interaction to Next Paint' },
          { key: 'ttfb', label: 'TTFB', value: metrics.coreWebVitals.ttfb, unit: 'ms', description: 'Time to First Byte' }
        ].map((metric) => {
          const status = getVitalStatus(metric.key, metric.value);
          
          return (
            <div key={metric.key} className="glass-card p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-white">{metric.label}</h3>
                  <p className="text-xs text-ds-text-tertiary">{metric.description}</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  status === 'good' ? 'bg-green-500' :
                  status === 'needs-improvement' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`} />
              </div>
              <div className="text-2xl font-bold mb-1 text-white">
                {metric.value.toFixed(metric.key === 'cls' ? 3 : 0)}{metric.unit}
              </div>
              <div className={`text-xs ${
                status === 'good' ? 'text-green-400' :
                status === 'needs-improvement' ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {status === 'good' ? '✅ Ótimo' :
                 status === 'needs-improvement' ? '⚠️ Melhorar' : '🔴 Crítico'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Business Metrics & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Business Metrics */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-6 text-white">Métricas de Negócio</h2>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-ds-surface rounded-lg">
                <div className="text-sm text-ds-text-tertiary mb-1">Visitantes Totais</div>
                <div className="text-3xl font-bold text-white">{metrics.businessMetrics.totalVisitors.toLocaleString()}</div>
              </div>
              <div className="p-4 bg-ds-surface rounded-lg">
                <div className="text-sm text-ds-text-tertiary mb-1">Taxa de Conversão</div>
                <div className="text-3xl font-bold text-ds-primary-400">
                  {metrics.businessMetrics.conversionRate.toFixed(1)}%
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold mb-3 text-white">Funil de Conversão</h3>
              <div className="space-y-3">
                {[
                  { label: 'Visitantes → Fase 1', value: '45%', trend: '+2.3%' },
                  { label: 'Fase 1 → Blueprint', value: '22%', trend: '+1.1%' },
                  { label: 'Blueprint → Lead', value: '18%', trend: '+0.8%' },
                  { label: 'Lead → Cliente', value: '35%', trend: '+1.5%' }
                ].map((step, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm text-ds-text-secondary">{step.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-white">{step.value}</span>
                      <span className={`text-xs ${step.trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                        {step.trend}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* System Health & Errors */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold mb-4 text-white">Saúde do Sistema</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-ds-text-secondary">Uptime</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-ds-surface rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-ds-gradient-primary transition-all duration-500"
                      style={{ width: `${metrics.systemMetrics.uptime}%` }}
                    />
                  </div>
                  <span className="font-bold text-white">{metrics.systemMetrics.uptime.toFixed(2)}%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-ds-text-secondary">Tempo de Resposta</span>
                <span className="font-bold text-white">{metrics.systemMetrics.responseTime.toFixed(0)}ms</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-ds-text-secondary">Taxa de Erro</span>
                <span className={`font-bold ${
                  metrics.errorMetrics.errorRate < 1 ? 'text-green-400' :
                  metrics.errorMetrics.errorRate < 5 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {metrics.errorMetrics.errorRate.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          {/* Top Errors */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Erros Recentes</h2>
              <span className="text-sm text-ds-text-tertiary">
                {metrics.errorMetrics.totalErrors} erros
              </span>
            </div>
            
            {metrics.errorMetrics.topErrors.length > 0 ? (
              <div className="space-y-3">
                {metrics.errorMetrics.topErrors.slice(0, 5).map((error, idx) => (
                  <div key={idx} className="p-3 bg-ds-surface rounded-lg">
                    <div className="flex items-start justify-between mb-1">
                      <span className="font-medium text-sm text-ds-error truncate">{error.message}</span>
                      <span className="text-xs text-ds-text-tertiary">{error.count}x</span>
                    </div>
                    <button className="text-xs text-ds-primary-400 hover:underline">
                      Ver detalhes →
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="text-ds-text-secondary">Nenhum erro crítico nas últimas 24h</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <button className="btn-secondary flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Forçar Refresh
        </button>
        <button className="btn-secondary flex items-center gap-2">
          <Download className="w-4 h-4" />
          Exportar Relatório
        </button>
        <button className="btn-secondary flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Testar Endpoints
        </button>
        <button className="btn-primary flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Configurar Alertas
        </button>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
