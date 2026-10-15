import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const body = await req.json();
    const { requestId, customerId, technicianId, stars, feedback, companyId } = body;

    if (!requestId || stars == null) {
      return Response.json({ error: 'Request ID and rating score are required.' }, { status: 400 });
    }

    const numericStars = parseInt(stars, 10);
    if (isNaN(numericStars) || numericStars < 1 || numericStars > 10) {
      return Response.json({ error: 'Rating must be an integer between 1 and 10.' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return Response.json({ error: 'Database credentials missing.' }, { status: 500 });
    }

    const sb = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });

    // Look up the work order to guarantee accurate references
    const { data: job } = await sb
      .from('requests')
      .select('id, customer_id, technician_id, company_id')
      .eq('id', requestId)
      .maybeSingle();

    const finalCustId = customerId || job?.customer_id;
    const finalTechId = technicianId || job?.technician_id;
    const finalCompId = companyId || job?.company_id;

    // Upsert rating (insert new or update existing rating)
    const { data, error } = await sb
      .from('ratings')
      .upsert(
        {
          request_id: requestId,
          customer_id: finalCustId,
          technician_id: finalTechId,
          company_id: finalCompId,
          stars: numericStars,
          feedback: feedback ? String(feedback).trim() : null,
        },
        { onConflict: 'request_id' }
      )
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error saving rating via API:', error);
      return Response.json({ error: error.message }, { status: 400 });
    }

    return Response.json({ ok: true, rating: data });
  } catch (err) {
    console.error('Rating server handler exception:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
