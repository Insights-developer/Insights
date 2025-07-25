import { useAppConfig } from '../lib/config';

export default function AppInfo() {
  const appConfig = useAppConfig();
  
  return (
    <div className="text-center text-sm text-gray-500 space-y-1">
      <p>{appConfig.appName} v{appConfig.version}</p>
      <p>&copy; 2025 {appConfig.companyName}</p>
      {appConfig.productionState !== 'production' && (
        <p className="text-xs text-orange-600">
          {appConfig.productionState.toUpperCase()} Environment
        </p>
      )}
    </div>
  );
}
