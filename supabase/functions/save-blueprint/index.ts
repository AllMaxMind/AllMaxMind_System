/**
 * Edge Function: Save Blueprint
 * Story: SPRINT-1-P1
 *
 * Saves blueprint to database, generates PDF, and enqueues email
 * POST /functions/v1/save-blueprint
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { z } from 'https://esm.sh/zod@3.22.4';

// Validation schema
const SaveBlueprintSchema = z.object({
  session_id: z.string().uuid(),
  user_id: z.string().uuid().optional(),
  email: z.string().email(),
  name: z.string().min(1),
  phone: z.string().optional(),
  company: z.string().optional(),
  role: z.string().optional(),
  blueprint: z.object({}).passthrough(),
  language: z.enum(['en', 'pt-BR'])
});

type SaveBlueprintRequest = z.infer<typeof SaveBlueprintSchema>;

Deno.serve(async (req: Request) => {
  // Only POST allowed
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Parse and validate request body
    const body = await req.json();
    const validatedData = SaveBlueprintSchema.parse(body);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Save Blueprint to Database
    const { data: blueprint, error: saveError } = await supabase
      .from('blueprints')
      .insert({
        session_id: validatedData.session_id,
        user_id: validatedData.user_id || null,
        email: validatedData.email,
        name: validatedData.name,
        phone: validatedData.phone,
        company: validatedData.company,
        role: validatedData.role,
        content: validatedData.blueprint,
        language: validatedData.language,
        status: 'generated',
        created_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (saveError) {
      console.error('Blueprint save error:', saveError);
      throw new Error(`Failed to save blueprint: ${saveError.message}`);
    }

    const blueprintId = blueprint.id;

    // 2. TODO: Generate PDF
    // In production, implement PDF generation here
    // For now, we'll store a placeholder
    const pdfUrl = `${supabaseUrl}/storage/v1/object/public/blueprints/blueprints-pdf/${blueprintId}.pdf`;

    // 3. Enqueue Email Job
    const { error: emailError } = await supabase
      .from('email_jobs')
      .insert({
        blueprint_id: blueprintId,
        recipient_email: validatedData.email,
        pdf_url: pdfUrl,
        template: 'blueprint_delivery',
        subject: `Seu Blueprint Arquitetural - ${validatedData.name}`,
        status: 'pending',
        retry_count: 0,
        created_at: new Date().toISOString()
      });

    if (emailError) {
      console.warn('Email job creation warning (non-fatal):', emailError);
      // Log but don't fail the request
    }

    // 4. Audit Log
    await supabase
      .from('blueprint_audit_logs')
      .insert({
        blueprint_id: blueprintId,
        action: 'created',
        user_id: validatedData.user_id || null,
        session_id: validatedData.session_id,
        changes: {
          blueprint_summary: validatedData.blueprint.executive_summary?.substring(0, 100)
        },
        created_at: new Date().toISOString()
      })
      .catch((err) => {
        console.warn('Audit log failed:', err);
      });

    // Success response
    return new Response(
      JSON.stringify({
        success: true,
        blueprint_id: blueprintId,
        pdf_url: pdfUrl,
        message: 'Blueprint salvo com sucesso! Email será enviado em breve.'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in save-blueprint:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        message: 'Falha ao salvar blueprint. Tente novamente.'
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
});
