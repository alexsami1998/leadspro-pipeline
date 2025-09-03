export interface AppConfig {
  production: boolean;
  apiUrl: string;
  appName: string;
  version: string;
  defaultLanguage: string;
  dateFormat: string;
  timeFormat: string;
  currency: string;
  timezone: string;
}

const baseConfig: Omit<AppConfig, 'production' | 'apiUrl'> = {
  appName: 'LeadPro',
  version: '1.0.0',
  defaultLanguage: 'pt-BR',
  dateFormat: 'dd/MM/yyyy',
  timeFormat: 'HH:mm:ss',
  currency: 'BRL',
  timezone: 'America/Sao_Paulo'
};

export const environment: AppConfig = {
  ...baseConfig,
  production: false,
  apiUrl: 'http://localhost:5000/api'
};

export const environmentProd: AppConfig = {
  ...baseConfig,
  production: true,
  apiUrl: 'http://localhost:5000/api'
};
