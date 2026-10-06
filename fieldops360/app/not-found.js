import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="auth">
      <h1>Page not found</h1>
      <p className="muted">The page you are looking for does not exist.</p>
      <Link href="/"><button>Go to FieldOps 360</button></Link>
    </div>
  );
}