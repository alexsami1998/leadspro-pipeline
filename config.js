// Configuração do sistema LeadPro
// Propriedade exclusiva de MW Soluções

const config = {
  // Configuração para ambiente de deploy (Jenkins, Docker, etc.)
  deploy: {
    frontend: {
      port: 8080, // Porta diferente de 4200
      host: '0.0.0.0'
    },
    backend: {
      port: 5000, // Porta diferente de 3000
      host: '0.0.0.0'
    }
  },
  
  // Configuração para execução manual em VM
  manual: {
    enabled: true, // Habilitado para execução manual
    vmIp: '0.0.0.0', // Permite acesso de qualquer IP da rede
    frontend: {
      port: 8080,
      host: '0.0.0.0' // Permite acesso de qualquer IP
    },
    backend: {
      port: 5000,
      host: '0.0.0.0' // Permite acesso de qualquer IP
    }
  },
  
  // Configuração do banco de dados
  database: {
    host: process.env.DB_HOST || '72.60.144.80',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'pipeline',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'DEv019107'
  }
};

export default config;
