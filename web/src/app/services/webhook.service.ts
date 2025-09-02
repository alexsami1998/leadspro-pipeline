import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DatabaseService } from './database.service';
import { Webhook, WebhookEvent, Lead, Interaction } from '../models/lead.model';

@Injectable({
  providedIn: 'root'
})
export class WebhookService {
  constructor(private databaseService: DatabaseService) {}

  getWebhooks(): Observable<Webhook[]> {
    return this.databaseService.getWebhooks();
  }

  createWebhook(webhook: Omit<Webhook, 'id' | 'dataCriacao' | 'dataAtualizacao'>): Observable<Webhook> {
    const newWebhook: Webhook = {
      ...webhook,
      dataCriacao: new Date(),
      dataAtualizacao: new Date()
    };

    return this.databaseService.createWebhook(newWebhook);
  }

  updateWebhook(id: number, webhook: Partial<Webhook>): Observable<Webhook> {
    const updatedWebhook = {
      ...webhook,
      dataAtualizacao: new Date()
    };

    return this.databaseService.updateWebhook(id, updatedWebhook as Webhook);
  }

  deleteWebhook(id: number): Observable<void> {
    return this.databaseService.deleteWebhook(id);
  }

  // Disparar webhooks para eventos específicos
  async triggerWebhooks(event: WebhookEvent, data: any): Promise<void> {
    try {
      const webhooks = await this.databaseService.getWebhooks().toPromise();
      if (!webhooks) return;

      const activeWebhooks = webhooks.filter(webhook => 
        webhook.ativo && webhook.eventos.includes(event)
      );

      for (const webhook of activeWebhooks) {
        await this.sendWebhook(webhook, event, data);
      }
    } catch (error) {
      console.error('Erro ao disparar webhooks:', error);
    }
  }

  private async sendWebhook(webhook: Webhook, event: WebhookEvent, data: any): Promise<void> {
    try {
      const payload = {
        event,
        timestamp: new Date().toISOString(),
        data,
        webhookId: webhook.id,
        webhookName: webhook.nome
      };

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'LeadPro-Webhook/1.0'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log(`Webhook enviado com sucesso para ${webhook.url}`);
    } catch (error) {
      console.error(`Erro ao enviar webhook para ${webhook.url}:`, error);
    }
  }

  // Métodos específicos para diferentes tipos de eventos
  async onLeadCreated(lead: Lead): Promise<void> {
    await this.triggerWebhooks(WebhookEvent.LEAD_CRIADO, {
      lead,
      action: 'created'
    });
  }

  async onLeadUpdated(lead: Lead, oldData?: Partial<Lead>): Promise<void> {
    await this.triggerWebhooks(WebhookEvent.LEAD_ATUALIZADO, {
      lead,
      oldData,
      action: 'updated'
    });
  }

  async onLeadDeleted(leadId: number): Promise<void> {
    await this.triggerWebhooks(WebhookEvent.LEAD_DELETADO, {
      leadId,
      action: 'deleted'
    });
  }

  async onInteractionCreated(interaction: Interaction, lead: Lead): Promise<void> {
    await this.triggerWebhooks(WebhookEvent.INTERACAO_CRIADA, {
      interaction,
      lead,
      action: 'interaction_created'
    });
  }

  async onStatusChanged(lead: Lead, oldStatus: string, newStatus: string): Promise<void> {
    await this.triggerWebhooks(WebhookEvent.STATUS_ALTERADO, {
      lead,
      oldStatus,
      newStatus,
      action: 'status_changed'
    });
  }

  // Validação de URL de webhook
  validateWebhookUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }

  // Teste de webhook
  async testWebhook(webhook: Webhook): Promise<boolean> {
    try {
      const testData = {
        event: 'TEST',
        timestamp: new Date().toISOString(),
        data: {
          message: 'Teste de webhook do LeadPro',
          webhookId: webhook.id,
          webhookName: webhook.nome
        }
      };

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'LeadPro-Webhook/1.0'
        },
        body: JSON.stringify(testData)
      });

      return response.ok;
    } catch (error) {
      console.error('Erro no teste de webhook:', error);
      return false;
    }
  }

  // Formatação de dados para n8n
  formatDataForN8n(event: WebhookEvent, data: any): any {
    const basePayload = {
      event,
      timestamp: new Date().toISOString(),
      source: 'LeadPro',
      version: '1.0'
    };

    switch (event) {
      case WebhookEvent.LEAD_CRIADO:
        return {
          ...basePayload,
          lead: {
            id: data.lead.id,
            nome: data.lead.nome,
            email: data.lead.email,
            telefone: data.lead.telefone,
            empresa: data.lead.empresa,
            cargo: data.lead.cargo,
            fonte: data.lead.fonte,
            status: data.lead.status,
            valorContrato: data.lead.valorContrato,
            dataCriacao: data.lead.dataCriacao,
            usuarioCriacao: data.lead.usuarioCriacao
          }
        };

      case WebhookEvent.LEAD_ATUALIZADO:
        return {
          ...basePayload,
          lead: {
            id: data.lead.id,
            nome: data.lead.nome,
            email: data.lead.email,
            telefone: data.lead.telefone,
            empresa: data.lead.empresa,
            cargo: data.lead.cargo,
            fonte: data.lead.fonte,
            status: data.lead.status,
            valorContrato: data.lead.valorContrato,
            dataAtualizacao: data.lead.dataAtualizacao,
            usuarioAtualizacao: data.lead.usuarioAtualizacao
          },
          changes: data.oldData ? this.getChanges(data.oldData, data.lead) : {}
        };

      case WebhookEvent.INTERACAO_CRIADA:
        return {
          ...basePayload,
          interaction: {
            id: data.interaction.id,
            leadId: data.interaction.leadId,
            tipo: data.interaction.tipo,
            conteudo: data.interaction.conteudo,
            dataCriacao: data.interaction.dataCriacao,
            usuarioCriacao: data.interaction.usuarioCriacao
          },
          lead: {
            id: data.lead.id,
            nome: data.lead.nome,
            email: data.lead.email,
            status: data.lead.status
          }
        };

      case WebhookEvent.STATUS_ALTERADO:
        return {
          ...basePayload,
          lead: {
            id: data.lead.id,
            nome: data.lead.nome,
            email: data.lead.email,
            status: data.lead.status
          },
          statusChange: {
            oldStatus: data.oldStatus,
            newStatus: data.newStatus,
            timestamp: new Date().toISOString()
          }
        };

      default:
        return {
          ...basePayload,
          data
        };
    }
  }

  private getChanges(oldData: any, newData: any): any {
    const changes: any = {};
    
    Object.keys(newData).forEach(key => {
      if (oldData[key] !== newData[key]) {
        changes[key] = {
          old: oldData[key],
          new: newData[key]
        };
      }
    });

    return changes;
  }
}
