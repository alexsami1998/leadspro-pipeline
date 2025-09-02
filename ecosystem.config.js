module.exports = {
  apps: [
    {
      name: 'leadpro-backend',
      script: './backend/server.js',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        DB_HOST: '191.96.251.155',
        DB_PORT: 5432,
        DB_NAME: 'n8n',
        DB_USER: 'postgres',
        DB_PASSWORD: 'MICROazu9107@#'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        DB_HOST: '191.96.251.155',
        DB_PORT: 5432,
        DB_NAME: 'n8n',
        DB_USER: 'postgres',
        DB_PASSWORD: 'MICROazu9107@#'
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true
    },
    {
      name: 'leadpro-frontend',
      script: 'ng',
      cwd: './web',
      args: 'serve --configuration=production --host 0.0.0.0 --port 4200 --disable-host-check',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production'
      },
      error_file: '../logs/frontend-error.log',
      out_file: '../logs/frontend-out.log',
      log_file: '../logs/frontend-combined.log',
      time: true
    }
  ]
};
