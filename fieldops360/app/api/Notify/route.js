import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function cleanPhone(rawPhone) {
  if (!rawPhone) return '';
  let p = String(rawPhone).trim().replace(/[\s\-\(\)]/g, '');
  if (p.startsWith('+')) p = p.slice(1);
  // Convert local Nigerian 080... / 070... / 090... to 234...
  if (p.startsWith('0') && p.length === 11) {
    p = '234' + p.slice(1);
  }
  return p;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      type, // 'job_log' | 'job_completed' | 'job_status'
      requestId,
      requestNo,
      customerId,
      customerName,
      customerPhone,
      techName,
      serviceType,
      status,
      notes,
      workDone,
      invoiceId,
      invoiceNo,
      invoiceAmount,
      origin,
    } = body;

    const baseOrigin = origin || process.env.NEXT_PUBLIC_APP_URL || 'https://fieldops360.vercel.app';
    const portalLink = `${baseOrigin}/dashboard#${requestNo || ''}`;

    let title = '';
    let messageText = '';
    const phone = cleanPhone(customerPhone);

    if (type === 'job_completed') {
      title = `Work Completed - Invoice #${invoiceNo || 'Pending'}`;
      messageText = 
`FieldOps 360 Notification:
Hello ${customerName || 'Customer'},
Your service order #${requestNo || 'REQ'} (${serviceType || 'Service'}) has been completed by ${techName || 'your technician'}.

Work Performed: ${workDone || 'Complete inspection and repairs verified.'}
Invoice Amount: ₦${Number(invoiceAmount || 0).toLocaleString()}

Review your itemized invoice, sign off, and settle directly on your portal:
${portalLink}`;
    } else if (type === 'job_log') {
      title = `Service Log Update - #${requestNo || 'REQ'}`;
      messageText = 
`FieldOps 360 Live Update:
Hello ${customerName || 'Customer'},
Technician ${techName || 'assigned'} logged a new update for #${requestNo || 'REQ'} (${serviceType || 'Service'}):

Log Notes: "${notes || 'Inspection in progress'}"
Current Status: ${status || 'In Progress'}

View real-time job timeline on your portal:
${portalLink}`;
    } else {
      title = `Status Update - #${requestNo || 'REQ'}`;
      messageText = 
`FieldOps 360 Status Alert:
Hello ${customerName || 'Customer'},
Your service order #${requestNo || 'REQ'} is now marked as: ${status || 'Updated'} by technician ${techName || 'assigned'}.

Track live job details:
${portalLink}`;
    }

    // 1. Save in-app notification in Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseServiceKey && customerId) {
      try {
        const sb = createClient(supabaseUrl, supabaseServiceKey);
        await sb.from('notifications').insert({
          user_id: customerId,
          message: `${title}: ${notes || workDone || status || 'Job updated'}. View at ${portalLink}`,
          read: false,
        });
      } catch (dbErr) {
        console.warn('Could not save in-app notification:', dbErr.message);
      }
    }

    // 2. Automated dispatch via Twilio (if credentials present in Vercel/.env.local)
    let twilioSent = false;
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioWaFrom = process.env.TWILIO_WHATSAPP_FROM; // e.g. 'whatsapp:+14155238886'
    const twilioSmsFrom = process.env.TWILIO_SMS_FROM;

    if (twilioSid && twilioToken && phone) {
      try {
        const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
        const targetNumber = phone.startsWith('+') ? phone : `+${phone}`;

        // Attempt automated WhatsApp
        if (twilioWaFrom) {
          const params = new URLSearchParams({
            From: twilioWaFrom.startsWith('whatsapp:') ? twilioWaFrom : `whatsapp:${twilioWaFrom}`,
            To: `whatsapp:${targetNumber}`,
            Body: messageText,
          });
          const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
            method: 'POST',
            headers: {
              Authorization: `Basic ${auth}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
          });
          if (res.ok) twilioSent = true;
        }

        // Attempt automated SMS if WhatsApp wasn't configured
        if (!twilioSent && twilioSmsFrom) {
          const params = new URLSearchParams({
            From: twilioSmsFrom,
            To: targetNumber,
            Body: messageText,
          });
          const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
            method: 'POST',
            headers: {
              Authorization: `Basic ${auth}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
          });
          if (res.ok) twilioSent = true;
        }
      } catch (twErr) {
        console.warn('Twilio automated dispatch error:', twErr.message);
      }
    }

    // 3. Automated dispatch via Termii (for Nigerian SMS/WhatsApp)
    let termiiSent = false;
    const termiiKey = process.env.TERMII_API_KEY;
    if (termiiKey && phone && !twilioSent) {
      try {
        const res = await fetch('https://api.ng.termii.com/api/sms/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: phone,
            from: process.env.TERMII_SENDER_ID || 'FieldOps360',
            sms: messageText,
            type: 'plain',
            channel: 'generic',
            api_key: termiiKey,
          }),
        });
        if (res.ok) termiiSent = true;
      } catch (termiiErr) {
        console.warn('Termii dispatch error:', termiiErr.message);
      }
    }

    // 4. Generate direct 1-tap WhatsApp deep link
    const waLink = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(messageText)}`
      : '';

    return Response.json({
      ok: true,
      deliveredAuto: twilioSent || termiiSent,
      channel: twilioSent ? 'twilio' : termiiSent ? 'termii' : 'direct',
      waLink,
      messageText,
      portalLink,
    });
  } catch (err) {
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  }
}
