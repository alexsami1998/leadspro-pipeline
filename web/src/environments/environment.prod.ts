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

export const environment = {
  production: true,
  apiUrl: getApiUrl(),
  appName: 'LeadPro',
  version: '1.0.0',
  defaultLanguage: 'pt-BR',
  dateFormat: 'dd/MM/yyyy',
  timeFormat: 'HH:mm:ss',
  currency: 'BRL',
  timezone: 'America/Sao_Paulo'
};
