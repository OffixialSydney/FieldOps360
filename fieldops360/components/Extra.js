/* Customer rates a completed job */
export function Rating({ request }) {
  const [stars, setStars] = useState(null);
  const [fb, setFb] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!request?.id) return;
    supabase
      .from('ratings')
      .select('stars, feedback')
      .eq('request_id', request.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.stars) {
          setStars(data.stars);
          if (data.feedback) setFb(data.feedback);
        }
      });
  }, [request?.id]);

  async function rate(n) {
    setSubmitting(true);
    setErr('');
    try {
      // 1. Try server API route first (safely bypasses client RLS restrictions and manages duplicate keys)
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: request.id,
          customerId: request.customer_id,
          technicianId: request.technician_id,
          companyId: request.company_id,
          stars: n,
          feedback: fb || null,
        }),
      });

      if (res.ok) {
        setStars(n);
        setSubmitting(false);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('extras-changed'));
        }
        return;
      }
    } catch (e) {
      // Fall through to client direct query
    }

    // 2. Direct client fallback with check-then-update to prevent duplicate key constraint error
    try {
      let currentUid = request.customer_id;
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user?.id) {
        currentUid = authData.user.id;
      }

      // Check if rating already exists for this work order
      const { data: existing } = await supabase
        .from('ratings')
        .select('id')
        .eq('request_id', request.id)
        .maybeSingle();

      let clientError = null;

      if (existing?.id) {
        const { error } = await supabase
          .from('ratings')
          .update({
            stars: n,
            feedback: fb ? fb.trim() : null,
          })
          .eq('id', existing.id);
        clientError = error;
      } else {
        const { error } = await supabase
          .from('ratings')
          .insert({
            request_id: request.id,
            customer_id: currentUid,
            technician_id: request.technician_id,
            company_id: request.company_id || null,
            stars: n,
            feedback: fb ? fb.trim() : null,
          });

        if (error && (error.code === '23505' || String(error.message).includes('unique constraint') || String(error.message).includes('ratings_request_id_key'))) {
          // If already exists, update instead
          const { error: updErr } = await supabase
            .from('ratings')
            .update({
              stars: n,
              feedback: fb ? fb.trim() : null,
            })
            .eq('request_id', request.id);
          clientError = updErr;
        } else {
          clientError = error;
        }
      }

      if (clientError) {
        setErr(clientError.message);
        setSubmitting(false);
        return;
      }

      setStars(n);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('extras-changed'));
      }
    } catch (errFallback) {
      setErr(errFallback.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (stars) {
    return (
      <div style={{ margin: '8px 0', padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
        <p style={{ margin: 0, fontWeight: 700, color: '#166534', fontSize: '14px' }}>
          Your rating: {stars}/10
        </p>
        {fb && <p style={{ margin: '4px 0 0', color: '#15803d', fontSize: '13px' }}>Feedback: {fb}</p>}
      </div>
    );
  }

  return (
    <div style={{ margin: '8px 0' }}>
      <h3 style={{ margin: '0 0 6px', fontSize: '15px' }}>Rate the technician (1 to 10)</h3>
      {err && (
        <p style={{ margin: '0 0 8px', color: '#dc2626', fontSize: '13px', fontWeight: 600 }}>
          {err}
        </p>
      )}
      <textarea
        placeholder="Leave feedback (optional)"
        value={fb}
        onChange={(e) => setFb(e.target.value)}
        disabled={submitting}
        style={{ marginBottom: '8px' }}
      />
      <div className="row" style={{ gap: '6px', flexWrap: 'wrap' }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
          <button
            key={n}
            type="button"
            disabled={submitting}
            style={{ marginTop: 0, minWidth: '34px', padding: '6px 10px', fontSize: '13px', fontWeight: 700 }}
            onClick={() => rate(n)}
          >
            {n}
          </button>
        ))}
      </div>
      {submitting && <p className="muted" style={{ fontSize: '12px', margin: '4px 0 0' }}>Saving rating...</p>}
    </div>
  );
}
