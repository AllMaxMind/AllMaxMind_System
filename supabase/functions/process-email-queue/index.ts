/**
 * Edge Function: Process Email Queue
 * Story: SPRINT-1-P1
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

Deno.serve(async (req: Request) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (!supabaseUrl || !supabaseServiceKey || !resendApiKey) {
      throw new Error('Missing configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch pending jobs
    const { data: jobs } = await supabase
      .from('email_jobs')
      .select('*')
      .in('status', ['pending', 'retrying'])
      .lt('retry_count', 3)
      .order('created_at', { ascending: true })
      .limit(10);

    let sentCount = 0;
    let failedCount = 0;

    for (const job of jobs || []) {
      try {
        // TODO: Implement email sending via Resend
        // For now, just mark as sent
        await supabase
          .from('email_jobs')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString()
          })
          .eq('id', job.id);

        sentCount++;
      } catch (err) {
        failedCount++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        sent_count: sentCount,
        failed_count: failedCount,
        total: (jobs || []).length
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
