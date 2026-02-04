/**
 * Edge Function: Link Session to User
 * Story: SPRINT-2-P3 (Auth + Session)
 *
 * Links anonymous session data (blueprints) to authenticated user.
 * Called after successful authentication.
 *
 * POST /functions/v1/link-session-to-user
 * Body: { session_id: string }
 * Auth: Required (Bearer token)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { z } from 'https://esm.sh/zod@3.22.4';

// Validation schema
const LinkSessionSchema = z.object({
  session_id: z.string().uuid('Invalid session ID format')
});

type LinkSessionRequest = z.infer<typeof LinkSessionSchema>;

interface LinkSessionResponse {
  success: boolean;
  blueprints_linked: number;
  message: string;
  error?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-session-id',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Only POST allowed
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Get auth token from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Initialize Supabase clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    // Client with user auth (to get user_id)
    const supabaseUser = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: { Authorization: `Bearer ${token}` }
      }
    });

    // Service role client (for database operations)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from token
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser(token);

    if (authError || !user) {
      console.error('[LinkSession] Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = LinkSessionSchema.parse(body);
    const { session_id } = validatedData;

    console.log('[LinkSession] Linking session to user:', {
      session_id: session_id.substring(0, 8) + '...',
      user_id: user.id.substring(0, 8) + '...'
    });

    // Update blueprints with this session_id to include user_id
    const { data: linkedBlueprints, error: updateError } = await supabaseAdmin
      .from('blueprints')
      .update({
        user_id: user.id,
        updated_at: new Date().toISOString()
      })
      .eq('session_id', session_id)
      .is('user_id', null) // Only update if not already linked
      .select('id');

    if (updateError) {
      console.error('[LinkSession] Update error:', updateError);
      throw new Error(`Failed to link blueprints: ${updateError.message}`);
    }

    const linkedCount = linkedBlueprints?.length || 0;
    console.log('[LinkSession] Linked', linkedCount, 'blueprints');

    // Ensure user profile exists
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .upsert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      });

    if (profileError) {
      console.warn('[LinkSession] Profile upsert warning:', profileError);
      // Don't fail the request, profile creation is secondary
    }

    // Log the linking event for audit
    try {
      await supabaseAdmin
        .from('blueprint_audit_logs')
        .insert({
          action: 'session_linked',
          user_id: user.id,
          metadata: {
            session_id: session_id,
            blueprints_linked: linkedCount,
            linked_at: new Date().toISOString(),
            source: 'edge_function'
          }
        });
    } catch (auditError) {
      console.debug('[LinkSession] Audit log skipped:', auditError);
    }

    const response: LinkSessionResponse = {
      success: true,
      blueprints_linked: linkedCount,
      message: linkedCount > 0
        ? `Successfully linked ${linkedCount} blueprint(s) to your account`
        : 'No pending blueprints found for this session'
    };

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('[LinkSession] Error:', error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: 'Validation error',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle other errors
    const response: LinkSessionResponse = {
      success: false,
      blueprints_linked: 0,
      message: 'Failed to link session',
      error: error instanceof Error ? error.message : 'Unknown error'
    };

    return new Response(
      JSON.stringify(response),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
