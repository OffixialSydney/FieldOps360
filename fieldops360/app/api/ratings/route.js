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

    // Check if rating already exists for this work order to prevent duplicate key constraint violations
    const { data: existingRating } = await sb
      .from('ratings')
      .select('id')
      .eq('request_id', requestId)
      .maybeSingle();

    let savedData = null;
    let saveError = null;

    if (existingRating?.id) {
      // Record exists: update it cleanly
      const { data, error } = await sb
        .from('ratings')
        .update({
          stars: numericStars,
          feedback: feedback ? String(feedback).trim() : null,
          technician_id: finalTechId,
          company_id: finalCompId,
        })
        .eq('id', existingRating.id)
        .select()
        .maybeSingle();
      savedData = data;
      saveError = error;
    } else {
      // Record does not exist: try inserting
      const { data, error } = await sb
        .from('ratings')
        .insert({
          request_id: requestId,
          customer_id: finalCustId,
          technician_id: finalTechId,
          company_id: finalCompId,
          stars: numericStars,
          feedback: feedback ? String(feedback).trim() : null,
        })
        .select()
        .maybeSingle();

      // If duplicate key error occurs due to concurrent insert, update existing record
      if (error && (error.code === '23505' || String(error.message).includes('unique constraint') || String(error.message).includes('ratings_request_id_key'))) {
        const { data: updateData, error: updateError } = await sb
          .from('ratings')
          .update({
            stars: numericStars,
            feedback: feedback ? String(feedback).trim() : null,
          })
          .eq('request_id', requestId)
          .select()
          .maybeSingle();
        savedData = updateData;
        saveError = updateError;
      } else {
        savedData = data;
        saveError = error;
      }
    }

    if (saveError) {
      console.error('Error saving rating via API:', saveError);
      return Response.json({ error: saveError.message }, { status: 400 });
    }

    return Response.json({ ok: true, rating: savedData });
  } catch (err) {
    console.error('Rating server handler exception:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
