import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import { Webhook, WebhookEvent, WebhookEventConfig } from '../models/lead.model';
import { Lead, Interaction } from '../models/lead.model';

@Injectable({
  providedIn: 'root'
})
export class WebhookDispatcherService {

  constructor(private databaseService: DatabaseService) {}

  // Disparar webhook quando status do lead é alterado
  async dispatchStatusChanged(lead: Lead, oldStatus: string, newStatus: string): Promise<void> {
    await this.dispatchWebhooks(WebhookEvent.STATUS_ALTERADO, {
      evento: WebhookEvent.STATUS_ALTERADO,
      timestamp: new Date().toISOString(),
      lead: this.formatLeadData(lead, WebhookEvent.STATUS_ALTERADO),
      mudanca: {
        campo: 'status',
        valorAnterior: oldStatus,
        valorNovo: newStatus
      }
    });
  }

  // Disparar webhook quando valor da proposta é alterado
  async dispatchProposalValueChanged(lead: Lead, oldValue: number, newValue: number): Promise<void> {
    await this.dispatchWebhooks(WebhookEvent.VALOR_PROPOSTA_ALTERADO, {
      evento: WebhookEvent.VALOR_PROPOSTA_ALTERADO,
      timestamp: new Date().toISOString(),
      lead: this.formatLeadData(lead, WebhookEvent.VALOR_PROPOSTA_ALTERADO),
      mudanca: {
        campo: 'valorContrato',
        valorAnterior: oldValue,
        valorNovo: newValue
      }
    });
  }

  // Disparar webhook quando lead é criado
  async dispatchLeadCreated(lead: Lead): Promise<void> {
    await this.dispatchWebhooks(WebhookEvent.LEAD_CRIADO, {
      evento: WebhookEvent.LEAD_CRIADO,
      timestamp: new Date().toISOString(),
      lead: this.formatLeadData(lead, WebhookEvent.LEAD_CRIADO)
    });
  }

  // Disparar webhook quando lead é atualizado
  async dispatchLeadUpdated(lead: Lead): Promise<void> {
    await this.dispatchWebhooks(WebhookEvent.LEAD_ATUALIZADO, {
      evento: WebhookEvent.LEAD_ATUALIZADO,
      timestamp: new Date().toISOString(),
      lead: this.formatLeadData(lead, WebhookEvent.LEAD_ATUALIZADO)
    });
  }

  // Disparar webhook quando lead é deletado
  async dispatchLeadDeleted(lead: Lead): Promise<void> {
    await this.dispatchWebhooks(WebhookEvent.LEAD_DELETADO, {
      evento: WebhookEvent.LEAD_DELETADO,
      timestamp: new Date().toISOString(),
      lead: this.formatLeadData(lead, WebhookEvent.LEAD_DELETADO)
    });
  }

  // Disparar webhook quando interação é criada
  async dispatchInteractionCreated(interaction: Interaction, lead: Lead): Promise<void> {
    await this.dispatchWebhooks(WebhookEvent.INTERACAO_CRIADA, {
      evento: WebhookEvent.INTERACAO_CRIADA,
      timestamp: new Date().toISOString(),
      lead: this.formatLeadData(lead, WebhookEvent.INTERACAO_CRIADA),
      interacao: {
        id: interaction.id,
        tipo: interaction.tipo,
        conteudo: interaction.conteudo,
        dataCriacao: interaction.dataCriacao,
        usuarioCriacao: interaction.usuarioCriacao
      }
    });
  }

  // Método principal para disparar webhooks
  private async dispatchWebhooks(evento: WebhookEvent, payload: any): Promise<void> {
    try {
      // Buscar todos os webhooks ativos para este evento
      const webhooks = await this.databaseService.getWebhooks().toPromise();
      
      if (!webhooks) return;

      const activeWebhooks = webhooks.filter(webhook => 
        webhook.ativo && 
        webhook.eventos.includes(evento)
      );

      // Disparar para cada webhook ativo
      for (const webhook of activeWebhooks) {
        await this.sendWebhook(webhook, evento, payload);
      }
    } catch (error) {
      console.error('Erro ao disparar webhooks:', error);
    }
  }

  // Enviar webhook individual
  private async sendWebhook(webhook: Webhook, evento: WebhookEvent, payload: any): Promise<void> {
    try {
      // Filtrar dados baseado na configuração do webhook
      const filteredPayload = this.filterPayloadByWebhookConfig(webhook, evento, payload);
      
      // Enviar webhook
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'LeadPro-Webhook/1.0',
          'X-Webhook-Event': evento,
          'X-Webhook-Source': 'LeadPro'
        },
        body: JSON.stringify(filteredPayload)
      });

      if (!response.ok) {
        console.warn(`Webhook ${webhook.nome} falhou: ${response.status} ${response.statusText}`);
      } else {
        console.log(`Webhook ${webhook.nome} enviado com sucesso para evento ${evento}`);
      }
    } catch (error) {
      console.error(`Erro ao enviar webhook ${webhook.nome}:`, error);
    }
  }

  // Filtrar payload baseado na configuração do webhook
  private filterPayloadByWebhookConfig(webhook: Webhook, evento: WebhookEvent, payload: any): any {
    const config = webhook.configuracaoEventos?.find(c => c.evento === evento);
    
    if (!config) {
      // Se não há configuração, enviar dados básicos
      return {
        evento: payload.evento,
        timestamp: payload.timestamp,
        webhook: {
          id: webhook.id,
          nome: webhook.nome
        }
      };
    }

    // Filtrar dados do lead baseado na configuração
    const filteredLead: any = {};
    if (config.dadosEnviados) {
      config.dadosEnviados.forEach(field => {
        if (field.ativo && payload.lead && payload.lead[field.campo] !== undefined) {
          filteredLead[field.campo] = payload.lead[field.campo];
        }
      });
    }

    // Construir payload filtrado
    const filteredPayload: any = {
      evento: payload.evento,
      timestamp: payload.timestamp,
      webhook: {
        id: webhook.id,
        nome: webhook.nome
      }
    };

    // Adicionar lead filtrado se houver dados
    if (Object.keys(filteredLead).length > 0) {
      filteredPayload.lead = filteredLead;
    }

    // Adicionar outros campos específicos do evento
    if (payload.mudanca) {
      filteredPayload.mudanca = payload.mudanca;
    }

    if (payload.interacao) {
      filteredPayload.interacao = payload.interacao;
    }

    return filteredPayload;
  }

  // Formatar dados do lead baseado no evento
  private formatLeadData(lead: Lead, evento: WebhookEvent): any {
    const baseData: any = {
      id: lead.id,
      nome: lead.nome,
      email: lead.email,
      telefone: lead.telefone,
      empresa: lead.empresa,
      cargo: lead.cargo,
      fonte: lead.fonte,
      status: lead.status,
      valorContrato: lead.valorContrato,
      observacoes: lead.observacoes,
      dataCriacao: lead.dataCriacao,
      dataAtualizacao: lead.dataAtualizacao,
      usuarioCriacao: lead.usuarioCriacao,
      usuarioAtualizacao: lead.usuarioAtualizacao
    };

    // Remover campos undefined
    Object.keys(baseData).forEach(key => {
      if (baseData[key] === undefined) {
        delete baseData[key];
      }
    });

    return baseData;
  }
}
