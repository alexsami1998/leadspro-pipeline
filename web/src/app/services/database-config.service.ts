import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DatabaseConfig } from '../models/lead.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DatabaseConfigService {
  private readonly CONFIG_KEY = 'leadpro_db_config';
  private readonly CHECKED_DATABASES_KEY = 'leadpro_checked_databases';
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Configuração padrão do PostgreSQL
  getDefaultConfig(): DatabaseConfig {
    return {
      host: 'localhost',
      port: 5432,
      database: 'n8n',
      username: 'postgres',
      password: 'MICROazu9107@#'
    };
  }

  // Obter configuração salva
  getSavedConfig(): DatabaseConfig | null {
    const config = localStorage.getItem(this.CONFIG_KEY);
    return config ? JSON.parse(config) : null;
  }

  // Salvar configuração
  saveConfig(config: DatabaseConfig): void {
    localStorage.setItem(this.CONFIG_KEY, JSON.stringify(config));
  }

  // Verificar se o banco já foi inicializado
  isDatabaseInitialized(config: DatabaseConfig): boolean {
    const checkedDatabases = this.getCheckedDatabases();
    const connectionString = this.createConnectionString(config);
    return checkedDatabases.includes(connectionString);
  }

  // Marcar banco como inicializado
  markDatabaseAsInitialized(config: DatabaseConfig): void {
    const checkedDatabases = this.getCheckedDatabases();
    const connectionString = this.createConnectionString(config);
    
    if (!checkedDatabases.includes(connectionString)) {
      checkedDatabases.push(connectionString);
      localStorage.setItem(this.CHECKED_DATABASES_KEY, JSON.stringify(checkedDatabases));
    }
  }

  // Testar conexão com o banco
  testConnection(config: DatabaseConfig): Observable<boolean> {
    return this.http.post<{ success: boolean; message?: string }>(`${this.apiUrl}/database/test`, config)
      .pipe(
        map(response => response.success),
        catchError(() => of(false))
      );
  }

  // Inicializar banco de dados
  initializeDatabase(config: DatabaseConfig): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/database/init`, config);
  }

  // Criar tabelas se não existirem
  createTablesIfNotExist(config: DatabaseConfig): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/database/create-tables`, config);
  }

  // Obter SQL para criar tabelas
  getCreateTablesSQL(): string {
    return `
      -- Tabela de usuários
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        senha VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'USUARIO',
        ativo BOOLEAN DEFAULT true,
        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabela de leads
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        telefone VARCHAR(50) NOT NULL,
        empresa VARCHAR(255),
        cargo VARCHAR(255),
        fonte VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'NOVO_LEAD',
        valor_contrato DECIMAL(10,2),
        observacoes TEXT,
        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        usuario_criacao VARCHAR(255),
        usuario_atualizacao VARCHAR(255)
      );

      -- Tabela de interações
      CREATE TABLE IF NOT EXISTS interactions (
        id SERIAL PRIMARY KEY,
        lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
        tipo VARCHAR(50) NOT NULL,
        conteudo TEXT NOT NULL,
        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        usuario_criacao VARCHAR(255) NOT NULL
      );

      -- Tabela de webhooks
      CREATE TABLE IF NOT EXISTS webhooks (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        url VARCHAR(500) NOT NULL,
        ativo BOOLEAN DEFAULT true,
        eventos JSON NOT NULL,
        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Índices para melhor performance
      CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
      CREATE INDEX IF NOT EXISTS idx_leads_fonte ON leads(fonte);
      CREATE INDEX IF NOT EXISTS idx_leads_data_criacao ON leads(data_criacao);
      CREATE INDEX IF NOT EXISTS idx_interactions_lead_id ON interactions(lead_id);
      CREATE INDEX IF NOT EXISTS idx_interactions_data_criacao ON interactions(data_criacao);

      -- Inserir usuário padrão se não existir
      INSERT INTO users (nome, email, senha, role, ativo) 
      VALUES ('Administrador', 'admin@leadpro.com', '$2b$10$rQZ8K9mN2pL1vX3yW4uJ5e', 'ADMIN', true)
      ON CONFLICT (email) DO NOTHING;
    `;
  }

  private getCheckedDatabases(): string[] {
    const checked = localStorage.getItem(this.CHECKED_DATABASES_KEY);
    return checked ? JSON.parse(checked) : [];
  }

  private createConnectionString(config: DatabaseConfig): string {
    return `${config.host}:${config.port}/${config.database}`;
  }

  // Validar configuração
  validateConfig(config: DatabaseConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.host || config.host.trim() === '') {
      errors.push('Host é obrigatório');
    }

    if (!config.port || config.port < 1 || config.port > 65535) {
      errors.push('Porta deve estar entre 1 e 65535');
    }

    if (!config.database || config.database.trim() === '') {
      errors.push('Nome do banco de dados é obrigatório');
    }

    if (!config.username || config.username.trim() === '') {
      errors.push('Usuário é obrigatório');
    }

    if (!config.password) {
      errors.push('Senha é obrigatória');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Limpar configurações
  clearConfig(): void {
    localStorage.removeItem(this.CONFIG_KEY);
    localStorage.removeItem(this.CHECKED_DATABASES_KEY);
  }
}
