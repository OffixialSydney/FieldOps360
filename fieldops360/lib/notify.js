/**
 * Client-side Dispatch Alert & Universal WhatsApp Integration Helper
 */

export function cleanPhone(rawPhone) {
  if (!rawPhone) return '';
  let p = String(rawPhone).trim().replace(/[\s\-\(\)\+]/g, '');

  // Convert Nigerian local formats (e.g. 080..., 070..., 090..., 081...) to international +234
  if (p.startsWith('0') && p.length === 11) {
    p = '234' + p.slice(1);
  } else if (p.startsWith('2340') && p.length === 14) {
    p = '234' + p.slice(4);
  } else if (p.length === 10 && (p.startsWith('80') || p.startsWith('70') || p.startsWith('90') || p.startsWith('81'))) {
    p = '234' + p;
  }
  return p;
}

export function formatWhatsAppUrl(rawPhone, text = '') {
  const p = cleanPhone(rawPhone);
  const encodedText = encodeURIComponent(text);

  // Check if valid international phone number (must be 10-15 digits and not a fictional or dummy number)
  const isFictional = !p || p.includes('5550000') || p.startsWith('000') || p.length < 10;
  if (!isFictional && /^\d{10,15}$/.test(p)) {
    return `https://api.whatsapp.com/send?phone=${p}&text=${encodedText}`;
  }

  // Fallback: If phone is dummy or missing, open WhatsApp with pre-filled message so sender can select recipient
  return `https://api.whatsapp.com/send?text=${encodedText}`;
}

export async function sendDispatchAlert({
  type,
  request,
  customer,
  technician,
  notes,
  workDone,
  invoice,
  customPhone,
}) {
  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const phoneToUse = customPhone || customer?.phone || request?.phone;
    const res = await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type, // 'job_log' | 'job_completed' | 'job_status'
        requestId: request?.id,
        requestNo: request?.request_no,
        customerId: request?.customer_id,
        customerName: customer?.full_name || 'Valued Customer',
        customerPhone: phoneToUse,
        techName: technician?.full_name || 'Assigned Specialist',
        serviceType: request?.service_type,
        status: request?.status,
        notes: notes || request?.tech_notes,
        workDone: workDone || request?.work_done,
        invoiceId: invoice?.id,
        invoiceNo: invoice?.invoice_no,
        invoiceAmount: invoice?.amount,
        origin,
      }),
    });
    return await res.json();
  } catch (err) {
    console.warn('Dispatch notification trigger error:', err);
    return { ok: false, error: err.message };
  }
}
