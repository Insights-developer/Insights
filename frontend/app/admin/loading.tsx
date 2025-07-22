import Spinner from '../components/ui/Spinner';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 dark:bg-black/70">
      <div className="flex flex-col items-center">
        <Spinner size={64} />
        <div className="mt-4 text-lg text-gray-600">Loading Admin Dashboard...</div>
      </div>
    </div>
  );
}
