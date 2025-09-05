# Dockerfile para Backend LeadPro
FROM node:20-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY backend/package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código fonte do backend
COPY backend/ ./

# Copiar arquivo de configuração da raiz
COPY config.js ./

# Criar diretório de logs
RUN mkdir -p logs

# Expor porta
EXPOSE 5000

# Comando para iniciar o servidor
CMD ["node", "server.js"]
