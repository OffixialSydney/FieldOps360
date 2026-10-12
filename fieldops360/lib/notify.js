/**
 * Client-side Dispatch Alert & WhatsApp Integration Helper
 */

export async function sendDispatchAlert({
  type,
  request,
  customer,
  technician,
  notes,
  workDone,
  invoice,
}) {
  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const res = await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type, // 'job_log' | 'job_completed' | 'job_status'
        requestId: request?.id,
        requestNo: request?.request_no,
        customerId: request?.customer_id,
        customerName: customer?.full_name || 'Valued Customer',
        customerPhone: customer?.phone || request?.phone,
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
