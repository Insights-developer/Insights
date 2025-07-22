import Spinner from './components/ui/Spinner';

export default function Loading() {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: 'var(--background)',
        opacity: 0.98,
        backdropFilter: 'blur(1px)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
      }}
    >
      <div 
        className="flex flex-col items-center justify-center"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <Spinner size={64} />
        <div className="mt-4 text-lg" style={{ color: 'var(--foreground, #6b7280)' }}>Loading...</div>
      </div>
    </div>
  );
}
