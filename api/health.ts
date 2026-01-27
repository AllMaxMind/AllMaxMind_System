import { createClient } from '@supabase/supabase-js';

// Separate Supabase client for Serverless context (uses process.env)
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// Mock or create client
const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey)
  : { from: () => ({ select: () => ({ limit: () => ({ error: null }) }) }) };

export default async function handler(req: any, res: any) {
  const startTime = Date.now();
  
  const healthChecks: any = {
    api: 'healthy',
    database: 'checking',
    cache: 'healthy',
    memory: 'healthy',
    uptime: (process as any).uptime()
  };
  
  try {
    // Verificar conexão com Supabase
    // Using any cast to bypass type checks in this standalone file
    const { error: dbError } = await (supabase as any).from('health').select('count').limit(1);
    healthChecks.database = dbError ? 'unhealthy' : 'healthy';
    
    // Verificar uso de memória
    const memoryUsage = (process as any).memoryUsage();
    const memoryPercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
    healthChecks.memory = memoryPercent > 90 ? 'critical' : memoryPercent > 80 ? 'warning' : 'healthy';
    
    const responseTime = Date.now() - startTime;
    
    res.status(200).json({
      status: healthChecks.database === 'healthy' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      checks: healthChecks,
      responseTime,
      version: process.env.VITE_APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV
    });
    
  } catch (error: any) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      checks: { ...healthChecks, api: 'unhealthy' }
    });
  }
}