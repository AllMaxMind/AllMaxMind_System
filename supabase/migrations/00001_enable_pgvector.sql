-- Migration 00001: Enable pgvector extension for embeddings support
-- Date: 2026-01-27
-- Purpose: Unlock vector similarity search for problem_embeddings table

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify installation
SELECT extname, extversion
FROM pg_extension
WHERE extname = 'vector';

-- Success message
COMMENT ON EXTENSION vector IS 'pgvector extension enabled for 384-dimensional embeddings (Gemini text-embedding-004)';
