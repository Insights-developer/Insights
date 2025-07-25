export interface AppConfig {
  appName: string;
  companyName: string;
  email: string;
  version: string;
  productionState: 'development' | 'staging' | 'production';
  description: string;
  tagline: string;
}

export const appConfig: AppConfig = {
  appName: "Insights",
  companyName: "Lottery Analytics.",
  email: "developer@lotteryanalytics.app",
  version: "1.0.0",
  productionState: "development",
  description: "Your lottery data analytics platform",
  tagline: "Unlock the power of your data"
};

export const useAppConfig = (): AppConfig => {
  return appConfig;
};
