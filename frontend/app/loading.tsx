import Spinner from './components/ui/Spinner';

export default function Loading() {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: 'var(--background)', // Use CSS variable to match app background exactly
        opacity: 0.98,
        backdropFilter: 'blur(1px)',
      }}
    >
      <div className="flex flex-col items-center justify-center">
        <Spinner size={64} />
        <div className="mt-4 text-lg" style={{ color: 'var(--foreground, #6b7280)' }}>Loading...</div>
      </div>
    </div>
  );
}
