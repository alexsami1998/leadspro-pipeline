import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { DatabaseService } from '../../services/database.service';
import { Webhook, WebhookEvent, WebhookEventConfig, WebhookDataField } from '../../models/lead.model';

@Component({
  selector: 'app-webhooks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './webhooks.component.html',
  styleUrls: ['./webhooks.component.scss']
})
export class WebhooksComponent implements OnInit {
  webhooks: Webhook[] = [];
  filteredWebhooks: Webhook[] = [];
  selectedWebhook: Webhook | null = null;
  showCreateModal = false;
  showEditModal = false;
  showConfigModal = false;
  loading = true;
  searchTerm = '';

  // Form data
  newWebhook: Partial<Webhook> = {};
  editWebhook: Partial<Webhook> = {};
  configWebhook: Webhook | null = null;

  // Enums para o template
  WebhookEvent = WebhookEvent;
  Object = Object;

  // Campos disponíveis para webhooks
  availableDataFields: WebhookDataField[] = [
    { campo: 'id', label: 'ID do Lead', ativo: true, obrigatorio: true },
    { campo: 'nome', label: 'Nome do Lead', ativo: true, obrigatorio: true },
    { campo: 'email', label: 'Email do Lead', ativo: true, obrigatorio: false },
    { campo: 'telefone', label: 'Telefone do Lead', ativo: true, obrigatorio: false },
    { campo: 'empresa', label: 'Empresa do Lead', ativo: true, obrigatorio: false },
    { campo: 'cargo', label: 'Cargo do Lead', ativo: true, obrigatorio: false },
    { campo: 'fonte', label: 'Fonte do Lead', ativo: true, obrigatorio: false },
    { campo: 'status', label: 'Status do Lead', ativo: true, obrigatorio: true },
    { campo: 'valorContrato', label: 'Valor do Contrato', ativo: true, obrigatorio: false },
    { campo: 'observacoes', label: 'Observações', ativo: true, obrigatorio: false },
    { campo: 'dataCriacao', label: 'Data de Criação', ativo: true, obrigatorio: false },
    { campo: 'dataAtualizacao', label: 'Data de Atualização', ativo: true, obrigatorio: false },
    { campo: 'usuarioCriacao', label: 'Usuário de Criação', ativo: true, obrigatorio: false },
    { campo: 'usuarioAtualizacao', label: 'Usuário de Atualização', ativo: true, obrigatorio: false }
  ];

  constructor(
    private authService: AuthService,
    private databaseService: DatabaseService
  ) {}

  ngOnInit(): void {
    this.loadWebhooks();
  }

  loadWebhooks(): void {
    this.loading = true;
    this.databaseService.getWebhooks().subscribe({
      next: (webhooks) => {
        this.webhooks = webhooks;
        this.filteredWebhooks = webhooks;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar webhooks:', error);
        this.loading = false;
      }
    });
  }

  // CRUD Operations
  createWebhook(): void {
    if (!this.newWebhook.nome || !this.newWebhook.url) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    // Configurar eventos padrão
    const configuracaoEventos = Object.values(WebhookEvent).map(evento => ({
      evento,
      ativo: evento === WebhookEvent.LEAD_CRIADO, // Por padrão, apenas LEAD_CRIADO ativo
      dadosEnviados: this.availableDataFields.map(field => ({
        ...field,
        ativo: field.obrigatorio // Campos obrigatórios sempre ativos
      }))
    }));

    const webhookData = {
      ...this.newWebhook,
      eventos: [WebhookEvent.LEAD_CRIADO],
      configuracaoEventos
    };

    this.databaseService.createWebhook(webhookData as any).subscribe({
      next: (webhook) => {
        this.webhooks.unshift(webhook);
        this.filterWebhooks();
        this.showCreateModal = false;
        this.newWebhook = {};
        alert('Webhook criado com sucesso!');
      },
      error: (error) => {
        console.error('Erro ao criar webhook:', error);
        alert('Erro ao criar webhook');
      }
    });
  }

  updateWebhook(): void {
    if (!this.editWebhook.id) return;

    this.databaseService.updateWebhook(this.editWebhook.id, this.editWebhook as any).subscribe({
      next: (webhook) => {
        const index = this.webhooks.findIndex(w => w.id === webhook.id);
        if (index !== -1) {
          this.webhooks[index] = webhook;
          this.filterWebhooks();
        }
        this.showEditModal = false;
        this.editWebhook = {};
        alert('Webhook atualizado com sucesso!');
      },
      error: (error) => {
        console.error('Erro ao atualizar webhook:', error);
        alert('Erro ao atualizar webhook');
      }
    });
  }

  deleteWebhook(webhook: Webhook): void {
    if (!confirm(`Tem certeza que deseja excluir o webhook "${webhook.nome}"?`)) {
      return;
    }

    if (!webhook.id) return;

    this.databaseService.deleteWebhook(webhook.id).subscribe({
      next: () => {
        this.webhooks = this.webhooks.filter(w => w.id !== webhook.id);
        this.filterWebhooks();
        alert('Webhook excluído com sucesso!');
      },
      error: (error) => {
        console.error('Erro ao excluir webhook:', error);
        alert('Erro ao excluir webhook');
      }
    });
  }

  // Filtering and Search
  filterWebhooks(): void {
    this.filteredWebhooks = this.webhooks.filter(webhook => {
      const matchesSearch = !this.searchTerm || 
        webhook.nome.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        webhook.url.toLowerCase().includes(this.searchTerm.toLowerCase());

      return matchesSearch;
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.filterWebhooks();
  }

  // Modal Management
  openCreateModal(): void {
    this.showCreateModal = true;
    this.newWebhook = {
      ativo: true,
      eventos: [WebhookEvent.LEAD_CRIADO]
    };
  }

  openEditModal(webhook: Webhook): void {
    this.editWebhook = { ...webhook };
    this.showEditModal = true;
  }

  openConfigModal(webhook: Webhook): void {
    this.configWebhook = { ...webhook };
    this.showConfigModal = true;
  }

  closeModals(): void {
    this.showCreateModal = false;
    this.showEditModal = false;
    this.showConfigModal = false;
    this.newWebhook = {};
    this.editWebhook = {};
    this.configWebhook = null;
  }

  // Event Configuration
  toggleEvent(webhook: Webhook, evento: WebhookEvent): void {
    if (!webhook.id) return;

    const hasEvent = webhook.eventos.includes(evento);
    if (hasEvent) {
      webhook.eventos = webhook.eventos.filter(e => e !== evento);
    } else {
      webhook.eventos.push(evento);
    }

    // Atualizar configuração de eventos
    this.updateWebhookEventConfig(webhook, evento, !hasEvent);
  }

  updateWebhookEventConfig(webhook: Webhook, evento: WebhookEvent, ativo: boolean): void {
    if (!webhook.configuracaoEventos) {
      webhook.configuracaoEventos = [];
    }

    let config = webhook.configuracaoEventos.find(c => c.evento === evento);
    if (!config) {
      config = {
        evento,
        ativo,
        dadosEnviados: this.availableDataFields.map(field => ({
          ...field,
          ativo: field.obrigatorio || ativo
        }))
      };
      webhook.configuracaoEventos.push(config);
    } else {
      config.ativo = ativo;
    }

    // Salvar no banco
    this.databaseService.updateWebhook(webhook.id!, webhook as any).subscribe({
      next: (updatedWebhook) => {
        const index = this.webhooks.findIndex(w => w.id === updatedWebhook.id);
        if (index !== -1) {
          this.webhooks[index] = updatedWebhook;
          this.filterWebhooks();
        }
      },
      error: (error) => {
        console.error('Erro ao atualizar configuração do webhook:', error);
        alert('Erro ao atualizar configuração');
      }
    });
  }

  toggleDataField(webhook: Webhook, evento: WebhookEvent, campo: string): void {
    if (!webhook.id) return;

    const config = webhook.configuracaoEventos?.find(c => c.evento === evento);
    if (config) {
      const dataField = config.dadosEnviados.find(d => d.campo === campo);
      if (dataField && !dataField.obrigatorio) {
        dataField.ativo = !dataField.ativo;
        
        // Salvar no banco
        this.databaseService.updateWebhook(webhook.id, webhook as any).subscribe({
          next: (updatedWebhook) => {
            const index = this.webhooks.findIndex(w => w.id === updatedWebhook.id);
            if (index !== -1) {
              this.webhooks[index] = updatedWebhook;
              this.filterWebhooks();
            }
          },
          error: (error) => {
            console.error('Erro ao atualizar campo do webhook:', error);
            alert('Erro ao atualizar campo');
          }
        });
      }
    }
  }

  // Utility Methods
  getEventLabel(evento: string): string {
    const labels: { [key: string]: string } = {
      [WebhookEvent.LEAD_CRIADO]: 'Lead Criado',
      [WebhookEvent.LEAD_ATUALIZADO]: 'Lead Atualizado',
      [WebhookEvent.LEAD_DELETADO]: 'Lead Deletado',
      [WebhookEvent.INTERACAO_CRIADA]: 'Interação Criada',
      [WebhookEvent.STATUS_ALTERADO]: 'Status Alterado',
      [WebhookEvent.VALOR_PROPOSTA_ALTERADO]: 'Valor da Proposta Alterado'
    };
    return labels[evento] || evento;
  }

  getEventColor(evento: string): string {
    const colors: { [key: string]: string } = {
      [WebhookEvent.LEAD_CRIADO]: '#10b981',
      [WebhookEvent.LEAD_ATUALIZADO]: '#3b82f6',
      [WebhookEvent.LEAD_DELETADO]: '#ef4444',
      [WebhookEvent.INTERACAO_CRIADA]: '#8b5cf6',
      [WebhookEvent.STATUS_ALTERADO]: '#f59e0b',
      [WebhookEvent.VALOR_PROPOSTA_ALTERADO]: '#06b6d4'
    };
    return colors[evento] || '#6b7280';
  }

  getEventDescription(evento: string): string {
    const descriptions: { [key: string]: string } = {
      [WebhookEvent.LEAD_CRIADO]: 'Dispara quando um novo lead é criado no sistema',
      [WebhookEvent.LEAD_ATUALIZADO]: 'Dispara quando qualquer dado do lead é alterado',
      [WebhookEvent.LEAD_DELETADO]: 'Dispara quando um lead é excluído do sistema',
      [WebhookEvent.INTERACAO_CRIADA]: 'Dispara quando uma nova interação é registrada',
      [WebhookEvent.STATUS_ALTERADO]: 'Dispara quando o status do lead é alterado',
      [WebhookEvent.VALOR_PROPOSTA_ALTERADO]: 'Dispara quando o valor da proposta é alterado'
    };
    return descriptions[evento] || 'Descrição não disponível';
  }

  isDataFieldActive(webhook: Webhook, evento: WebhookEvent, campo: string): boolean {
    const config = webhook.configuracaoEventos?.find(c => c.evento === evento);
    if (config) {
      const dataField = config.dadosEnviados.find(d => d.campo === campo);
      return dataField ? dataField.ativo : false;
    }
    return false;
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  // Permissions
  canManageWebhooks(): boolean {
    return this.authService.isAdmin();
  }

  canDeleteWebhooks(): boolean {
    return this.authService.isAdmin();
  }

  // Test webhook
  testWebhook(webhook: Webhook): void {
    if (!webhook.id) return;

    const testData = {
      evento: 'TESTE',
      timestamp: new Date().toISOString(),
      webhook: {
        id: webhook.id,
        nome: webhook.nome,
        url: webhook.url
      },
      dados: {
        mensagem: 'Este é um teste do webhook LeadPro',
        data: new Date().toISOString()
      }
    };

    fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    })
    .then(response => {
      if (response.ok) {
        alert('Webhook testado com sucesso! Verifique o n8n para confirmar o recebimento.');
      } else {
        alert(`Erro ao testar webhook: ${response.status} ${response.statusText}`);
      }
    })
    .catch(error => {
      console.error('Erro ao testar webhook:', error);
      alert('Erro ao testar webhook. Verifique se a URL está acessível.');
    });
  }
}

