import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { DatabaseConfig, Lead, Interaction, User, Webhook } from '../models/lead.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private readonly CONFIG_KEY = 'leadpro_db_config';
  private readonly CHECKED_DATABASES_KEY = 'leadpro_checked_databases';
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Configuração do banco de dados
  getDatabaseConfig(): DatabaseConfig | null {
    const config = localStorage.getItem(this.CONFIG_KEY);
    return config ? JSON.parse(config) : null;
  }

  setDatabaseConfig(config: DatabaseConfig): void {
    localStorage.setItem(this.CONFIG_KEY, JSON.stringify(config));
  }

  // Verificação de tabelas
  private getCheckedDatabases(): string[] {
    const checked = localStorage.getItem(this.CHECKED_DATABASES_KEY);
    return checked ? JSON.parse(checked) : [];
  }

  private setCheckedDatabase(connectionString: string): void {
    const checked = this.getCheckedDatabases();
    if (!checked.includes(connectionString)) {
      checked.push(connectionString);
      localStorage.setItem(this.CHECKED_DATABASES_KEY, JSON.stringify(checked));
    }
  }

  private createConnectionString(config: DatabaseConfig): string {
    return `${config.host}:${config.port}/${config.database}`;
  }

  async initializeDatabase(config: DatabaseConfig): Promise<boolean> {
    try {
      this.setDatabaseConfig(config);
      const connectionString = this.createConnectionString(config);
      
      // Verifica se já foi checado este banco
      const checkedDatabases = this.getCheckedDatabases();
      if (checkedDatabases.includes(connectionString)) {
        console.log('Banco de dados já verificado anteriormente');
        return true;
      }

      // Testa conexão e cria tabelas se necessário
      const result = await this.http.post<{ success: boolean; message: string }>(
        `${this.apiUrl}/database/init`,
        config
      ).toPromise();

      if (result?.success) {
        this.setCheckedDatabase(connectionString);
        console.log('Banco de dados inicializado com sucesso');
        return true;
      } else {
        throw new Error(result?.message || 'Erro ao inicializar banco de dados');
      }
    } catch (error) {
      console.error('Erro ao inicializar banco de dados:', error);
      throw error;
    }
  }

  // Operações CRUD para Leads
  getLeads(): Observable<Lead[]> {
    return this.http.get<Lead[]>(`${this.apiUrl}/leads`).pipe(
      tap(leads => console.log('Leads carregados:', leads)),
      catchError(error => {
        console.error('Erro ao carregar leads:', error);
        return throwError(() => error);
      })
    );
  }

  getLead(id: number): Observable<Lead> {
    return this.http.get<Lead>(`${this.apiUrl}/leads/${id}`).pipe(
      catchError(error => {
        console.error(`Erro ao carregar lead ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  createLead(lead: Omit<Lead, 'id' | 'dataCriacao' | 'dataAtualizacao'>): Observable<Lead> {
    return this.http.post<Lead>(`${this.apiUrl}/leads`, lead).pipe(
      tap(newLead => console.log('Lead criado:', newLead)),
      catchError(error => {
        console.error('Erro ao criar lead:', error);
        return throwError(() => error);
      })
    );
  }

  updateLead(id: number, lead: Partial<Lead>): Observable<Lead> {
    return this.http.put<Lead>(`${this.apiUrl}/leads/${id}`, lead).pipe(
      tap(updatedLead => console.log('Lead atualizado:', updatedLead)),
      catchError(error => {
        console.error(`Erro ao atualizar lead ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  deleteLead(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/leads/${id}`).pipe(
      tap(() => console.log(`Lead ${id} excluído`)),
      catchError(error => {
        console.error(`Erro ao excluir lead ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  // Operações para Interações
  getInteractions(leadId: number): Observable<Interaction[]> {
    return this.http.get<Interaction[]>(`${this.apiUrl}/leads/${leadId}/interactions`);
  }

  createInteraction(interaction: Interaction): Observable<Interaction> {
    return this.http.post<Interaction>(`${this.apiUrl}/interactions`, interaction);
  }

  // Operações para Usuários
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  createUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users`, user);
  }

  updateUser(id: number, user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`);
  }

  // Operações para Webhooks
  getWebhooks(): Observable<Webhook[]> {
    return this.http.get<Webhook[]>(`${this.apiUrl}/webhooks`);
  }

  createWebhook(webhook: Webhook): Observable<Webhook> {
    return this.http.post<Webhook>(`${this.apiUrl}/webhooks`, webhook);
  }

  updateWebhook(id: number, webhook: Webhook): Observable<Webhook> {
    return this.http.put<Webhook>(`${this.apiUrl}/webhooks/${id}`, webhook);
  }

  deleteWebhook(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/webhooks/${id}`);
  }

  // Estatísticas do Dashboard
  getDashboardStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/dashboard/stats`);
  }

  // Teste de conexão
  testConnection(config: DatabaseConfig): Observable<boolean> {
    return this.http.post<{ success: boolean }>(`${this.apiUrl}/database/test`, config)
      .pipe(
        map(response => response.success),
        catchError(() => of(false))
      );
  }
}
