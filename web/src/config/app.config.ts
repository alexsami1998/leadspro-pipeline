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

// Detectar automaticamente a URL da API baseada no host atual
function getApiUrl(): string {
  const hostname = window.location.hostname;
  
  // Se for localhost ou 127.0.0.1, usar localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }
  
  // Caso contrário, usar o IP atual da VM
  return `http://${hostname}:5000/api`;
}

export const environment: AppConfig = {
  ...baseConfig,
  production: false,
  apiUrl: getApiUrl()
};

export const environmentProd: AppConfig = {
  ...baseConfig,
  production: true,
  apiUrl: getApiUrl()
};
