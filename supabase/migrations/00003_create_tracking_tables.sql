-- Migration 00003: Create visitors and sessions tables (Fase 0: Passive Data Layer)
-- Date: 2026-01-27
-- Purpose: Persist anonymous visitor tracking data in backend

-- Tabela de visitantes (Fase 0: Passive Data Layer)
CREATE TABLE IF NOT EXISTS public.visitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  anonymous_id TEXT UNIQUE NOT NULL, -- Gerado no frontend (UUID persistente)
  ip TEXT,
  country TEXT,
  city TEXT,
  device TEXT,
  os TEXT,
  browser TEXT,
  source TEXT, -- utm_source
  medium TEXT, -- utm_medium
  campaign TEXT, -- utm_campaign
  first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_sessions INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de sessões (Fase 0: Passive Data Layer)
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visitor_id UUID NOT NULL REFERENCES public.visitors(id) ON DELETE CASCADE,
  session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_end TIMESTAMP WITH TIME ZONE,
  scroll_depth NUMERIC, -- Porcentagem (0-100)
  session_duration INT, -- Segundos
  click_count INT DEFAULT 0,
  page_views INT DEFAULT 1,
  metadata JSONB, -- Dados adicionais (referrer, landing_page, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_visitors_anonymous_id ON public.visitors(anonymous_id);
CREATE INDEX IF NOT EXISTS idx_visitors_first_seen ON public.visitors(first_seen DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_visitor_id ON public.sessions(visitor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_start ON public.sessions(session_start DESC);

-- RLS Policies (permissivo para tracking anônimo)
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_public_insert_visitors" ON public.visitors
  FOR INSERT WITH CHECK (true);

CREATE POLICY "allow_public_update_visitors" ON public.visitors
  FOR UPDATE USING (true);

CREATE POLICY "allow_public_select_visitors" ON public.visitors
  FOR SELECT USING (true); -- Em produção, restringir por anonymous_id

CREATE POLICY "allow_public_insert_sessions" ON public.sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "allow_public_update_sessions" ON public.sessions
  FOR UPDATE USING (true);

CREATE POLICY "allow_public_select_sessions" ON public.sessions
  FOR SELECT USING (true); -- Em produção, restringir por visitor_id

-- Trigger para atualizar last_seen no visitor quando nova sessão é criada
CREATE OR REPLACE FUNCTION update_visitor_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.visitors
  SET
    last_seen = NOW(),
    total_sessions = total_sessions + 1
  WHERE id = NEW.visitor_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_visitor_last_seen
AFTER INSERT ON public.sessions
FOR EACH ROW
EXECUTE FUNCTION update_visitor_last_seen();

COMMENT ON TABLE public.visitors IS 'Anonymous visitor tracking (Fase 0: Passive Data Layer)';
COMMENT ON TABLE public.sessions IS 'Session tracking with scroll depth and duration (Fase 0)';
COMMENT ON FUNCTION update_visitor_last_seen IS 'Auto-update last_seen and total_sessions when new session is created';
