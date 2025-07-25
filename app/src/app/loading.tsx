export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto"
          style={{ borderColor: 'var(--primary)', borderBottomColor: 'var(--primary-dark)' }}
        ></div>
        <p className="mt-4" style={{ color: 'var(--gray)' }}>Loading...</p>
      </div>
    </div>
  );
}
