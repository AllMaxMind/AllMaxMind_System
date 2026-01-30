-- Migration 00009: Fix embedding dimensions from 384 to 768
-- Reason: text-embedding-004 model generates 768 dimensions by default
-- Date: 2026-01-28

-- Drop existing index (requires column modification)
DROP INDEX IF EXISTS idx_problem_embeddings_vector;

-- Alter column to accept 768 dimensions
ALTER TABLE public.problem_embeddings
ALTER COLUMN embedding TYPE vector(768);

-- Recreate HNSW index with correct dimensions
CREATE INDEX idx_problem_embeddings_vector
ON public.problem_embeddings
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Update the comment
COMMENT ON TABLE public.problem_embeddings IS 'Vector embeddings for similarity search (768d from Gemini text-embedding-004)';

-- Update the search function to use correct dimensions
CREATE OR REPLACE FUNCTION find_similar_problems(
  query_embedding vector(768),
  similarity_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  problem_id uuid,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pe.problem_id,
    1 - (pe.embedding <=> query_embedding) AS similarity
  FROM public.problem_embeddings pe
  WHERE 1 - (pe.embedding <=> query_embedding) > similarity_threshold
  ORDER BY pe.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
