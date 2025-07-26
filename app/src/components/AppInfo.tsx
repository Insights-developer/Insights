import { useAppConfig } from '../lib/config';

export default function AppInfo() {
  const appConfig = useAppConfig();
  
  return (
    <div className="text-center text-sm space-y-1" style={{ color: 'var(--gray)' }}>
      <p>{appConfig.appName} v{appConfig.version}</p>
      <p>&copy; 2025 {appConfig.companyName}</p>
      {appConfig.productionState !== 'production' && (
        <p className="text-xs" style={{ color: 'var(--accent-dark)' }}>
          {appConfig.productionState.toUpperCase()} Environment
        </p>
      )}
    </div>
  );
}
