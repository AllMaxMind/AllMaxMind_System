-- Migration 00002: Create problem_embeddings table with vector search
-- Date: 2026-01-27
-- Purpose: Store 384-dimensional embeddings from Gemini text-embedding-004

-- Tabela de embeddings de problemas (vector search)
CREATE TABLE IF NOT EXISTS public.problem_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  embedding VECTOR(384) NOT NULL, -- Gemini text-embedding-004 produces 384 dimensions
  model_version TEXT DEFAULT 'text-embedding-004',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para similarity search (HNSW - Hierarchical Navigable Small World)
-- HNSW é mais performático que IVFFlat para vector search
CREATE INDEX IF NOT EXISTS idx_problem_embeddings_vector
ON public.problem_embeddings
USING hnsw (embedding vector_cosine_ops);

-- Índice para foreign key lookup
CREATE INDEX IF NOT EXISTS idx_problem_embeddings_problem_id
ON public.problem_embeddings(problem_id);

-- RLS Policies
ALTER TABLE public.problem_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "session_view_own_embeddings" ON public.problem_embeddings
  FOR SELECT
  USING (
    problem_id IN (
      SELECT id FROM public.problems
      WHERE session_id::text = COALESCE(current_setting('app.session_id', true), session_id::text)
    )
  );

CREATE POLICY "service_role_insert_embeddings" ON public.problem_embeddings
  FOR INSERT
  WITH CHECK (true); -- Only service role can insert (via Edge Function)

-- Function for similarity search
-- Returns problems similar to query_embedding above match_threshold
CREATE OR REPLACE FUNCTION match_problems(
  query_embedding VECTOR(384),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  problem_id UUID,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pe.problem_id,
    1 - (pe.embedding <=> query_embedding) AS similarity
  FROM public.problem_embeddings pe
  WHERE 1 - (pe.embedding <=> query_embedding) > match_threshold
  ORDER BY pe.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

COMMENT ON TABLE public.problem_embeddings IS 'Vector embeddings for similarity search (384d from Gemini text-embedding-004)';
COMMENT ON FUNCTION match_problems IS 'Find similar problems using cosine similarity (pgvector <=> operator)';
