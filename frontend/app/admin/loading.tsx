import Spinner from '../components/ui/Spinner';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 dark:bg-black/70">
      <Spinner size={64} />
    </div>
  );
}
