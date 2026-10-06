'use client';

export default function Error({ error, reset }) {
  return (
    <div className="auth">
      <h1>Something went wrong</h1>
      <p className="muted">{error?.message || 'An unexpected problem happened.'} Your saved work is safe.</p>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
