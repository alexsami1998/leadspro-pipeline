import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatabaseConfigService } from '../../services/database-config.service';
import { DatabaseConfig } from '../../models/lead.model';

@Component({
  selector: 'app-database-setup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './database-setup.component.html',
  styleUrls: ['./database-setup.component.scss']
})
export class DatabaseSetupComponent implements OnInit {
  config: DatabaseConfig;
  loading = false;
  testing = false;
  errorMessage = '';
  successMessage = '';
  showAdvanced = false;

  constructor(private dbConfigService: DatabaseConfigService) {
    this.config = this.dbConfigService.getDefaultConfig();
  }

  ngOnInit(): void {
    const savedConfig = this.dbConfigService.getSavedConfig();
    if (savedConfig) {
      this.config = savedConfig;
    }
  }

  async testConnection(): Promise<void> {
    this.testing = true;
    this.errorMessage = '';
    this.successMessage = '';

    const validation = this.dbConfigService.validateConfig(this.config);
    if (!validation.valid) {
      this.errorMessage = validation.errors.join(', ');
      this.testing = false;
      return;
    }

    try {
      const success = await this.dbConfigService.testConnection(this.config).toPromise();
      
      if (success) {
        this.successMessage = 'Conexão com o banco de dados estabelecida com sucesso!';
      } else {
        this.errorMessage = 'Falha ao conectar com o banco de dados. Verifique as configurações.';
      }
    } catch (error) {
      this.errorMessage = 'Erro ao testar conexão: ' + (error as Error).message;
    } finally {
      this.testing = false;
    }
  }

  async initializeDatabase(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const validation = this.dbConfigService.validateConfig(this.config);
    if (!validation.valid) {
      this.errorMessage = validation.errors.join(', ');
      this.loading = false;
      return;
    }

    try {
      // Testar conexão primeiro
      const connectionSuccess = await this.dbConfigService.testConnection(this.config).toPromise();
      
      if (!connectionSuccess) {
        this.errorMessage = 'Não foi possível conectar com o banco de dados. Teste a conexão primeiro.';
        this.loading = false;
        return;
      }

      // Criar tabelas
      const createResult = await this.dbConfigService.createTablesIfNotExist(this.config).toPromise();
      
      if (createResult?.success) {
        this.dbConfigService.saveConfig(this.config);
        this.dbConfigService.markDatabaseAsInitialized(this.config);
        this.successMessage = 'Banco de dados inicializado com sucesso! As tabelas foram criadas.';
      } else {
        this.errorMessage = createResult?.message || 'Erro ao criar tabelas no banco de dados.';
      }
    } catch (error) {
      this.errorMessage = 'Erro ao inicializar banco de dados: ' + (error as Error).message;
    } finally {
      this.loading = false;
    }
  }

  useDefaultConfig(): void {
    this.config = this.dbConfigService.getDefaultConfig();
    this.errorMessage = '';
    this.successMessage = '';
  }

  toggleAdvanced(): void {
    this.showAdvanced = !this.showAdvanced;
  }

  getConnectionString(): string {
    return `postgresql://${this.config.username}:${this.config.password}@${this.config.host}:${this.config.port}/${this.config.database}`;
  }
}
