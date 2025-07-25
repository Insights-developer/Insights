import appConfig from '../../config/app.json';

export interface AppConfig {
  appName: string;
  companyName: string;
  email: string;
  version: string;
  productionState: 'development' | 'staging' | 'production';
  description: string;
  tagline: string;
}

export const useAppConfig = (): AppConfig => {
  return appConfig as AppConfig;
};

export default appConfig;
