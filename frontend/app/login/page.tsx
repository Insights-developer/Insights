export default function HomePage() {
  return (
    <main style={{ maxWidth: 400, margin: '3rem auto', textAlign: 'center' }}>
      <h1>Welcome to Insights App</h1>
      <p>This is the public home page.</p>
      <p>
        <a href="/auth">Sign In / Sign Up</a>
        {' | '}
        <a href="/admin">Admin Dashboard</a>
      </p>
    </main>
  );
}
