'use client';

/**
 * A handsome, modern 403 Forbidden Page for Insights App.
 * Usage: Show when a user lacks feature permission.
 */
export default function Forbidden() {
  return (
    <section
      style={{
        maxWidth: 400,
        margin: '4rem auto',
        padding: '3rem 2rem',
        borderRadius: 12,
        boxShadow: '0 2px 20px rgba(80,97,255,0.07)',
        background: 'white',
        textAlign: 'center',
        color: '#334',
      }}
    >
      <div style={{ fontSize: 72, fontWeight: 800, color: '#5173fa' }}>403</div>
      <div style={{ fontSize: 28, margin: '1.5rem 0 0.8rem' }}>
        Forbidden
      </div>
      <p style={{ margin: '0 0 1.6rem', color: '#545468' }}>
        Sorry, you don’t have permission to view this page or feature.
      </p>
      <a
        href="/"
        style={{
          color: 'white',
          background: 'linear-gradient(90deg,#5167fa 25%,#6296ff 100%)',
          padding: '10px 30px',
          borderRadius: 22,
          textDecoration: 'none',
          fontWeight: 500,
          fontSize: 16,
        }}
      >
        Go to Homepage
      </a>
    </section>
  );
}
