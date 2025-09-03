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
    enabled: false, // Alterar para true quando executar manualmente
    vmIp: '192.168.1.100', // IP da VM local
    frontend: {
      port: 8080,
      host: '0.0.0.0'
    },
    backend: {
      port: 5000,
      host: '0.0.0.0'
    }
  },
  
  // Configuração do banco de dados
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'leadpro',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password'
  }
};

module.exports = config;
