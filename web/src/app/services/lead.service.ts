import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { DatabaseService } from './database.service';
import { Lead, LeadStatus, LeadSource, Interaction, InteractionType } from '../models/lead.model';
import { AuthService } from './auth.service';
import { WebhookDispatcherService } from './webhook-dispatcher.service';

@Injectable({
  providedIn: 'root'
})
export class LeadService {
  private leadsSubject = new BehaviorSubject<Lead[]>([]);
  public leads$ = this.leadsSubject.asObservable();

  constructor(
    private databaseService: DatabaseService,
    private authService: AuthService,
    private webhookDispatcher: WebhookDispatcherService
  ) {
    this.loadLeads();
  }

  private loadLeads(): void {
    this.databaseService.getLeads().subscribe({
      next: (leads) => this.leadsSubject.next(leads),
      error: (error) => console.error('Erro ao carregar leads:', error)
    });
  }

  getLeads(): Observable<Lead[]> {
    return this.leads$;
  }

  getLead(id: number): Observable<Lead> {
    return this.databaseService.getLead(id);
  }

  createLead(lead: Omit<Lead, 'id' | 'dataCriacao' | 'dataAtualizacao'>): Observable<Lead> {
    const newLead: Lead = {
      ...lead,
      status: LeadStatus.NOVO_LEAD,
      dataCriacao: new Date(),
      dataAtualizacao: new Date(),
      usuarioCriacao: this.authService.getCurrentUser()?.nome || 'Sistema'
    };

    return this.databaseService.createLead(newLead).pipe(
      map(createdLead => {
        this.loadLeads();
        this.webhookDispatcher.dispatchLeadCreated(createdLead);
        return createdLead;
      })
    );
  }

  updateLead(id: number, updates: Partial<Lead>): Observable<Lead> {
    const updatedLead = {
      ...updates,
      dataAtualizacao: new Date(),
      usuarioAtualizacao: this.authService.getCurrentUser()?.nome || 'Sistema'
    };

    return this.databaseService.updateLead(id, updatedLead as Lead).pipe(
      map(updatedLead => {
        this.loadLeads();
        this.webhookDispatcher.dispatchLeadUpdated(updatedLead);
        return updatedLead;
      })
    );
  }

  updateLeadStatus(id: number, newStatus: LeadStatus): Observable<Lead> {
    return this.databaseService.getLead(id).pipe(
      map(currentLead => {
        const oldStatus = currentLead.status;
        
        this.updateLead(id, { status: newStatus }).subscribe(updatedLead => {
          this.webhookDispatcher.dispatchStatusChanged(updatedLead, oldStatus, newStatus);
        });
        
        return currentLead;
      })
    );
  }

  deleteLead(id: number): Observable<void> {
    return this.databaseService.deleteLead(id).pipe(
      map(() => {
        this.loadLeads();
      })
    );
  }

  qualifyLead(id: number, isQualified: boolean): Observable<Lead> {
    const newStatus = isQualified ? LeadStatus.LEAD_QUALIFICADO : LeadStatus.LEAD_NAO_QUALIFICADO;
    return this.updateLeadStatus(id, newStatus);
  }

  assessInterest(id: number, hasInterest: boolean): Observable<Lead> {
    const newStatus = hasInterest ? LeadStatus.INTERESSE : LeadStatus.NAO_TEVE_INTERESSE;
    return this.updateLeadStatus(id, newStatus);
  }

  schedulePresentation(id: number, scheduled: boolean): Observable<Lead> {
    const newStatus = scheduled ? LeadStatus.APRESENTACAO_AGENDADA : LeadStatus.NAO_FOI_POSSIVEL_AGENDAR;
    return this.updateLeadStatus(id, newStatus);
  }

  sendProposal(id: number): Observable<Lead> {
    return this.updateLeadStatus(id, LeadStatus.PROPOSTA_ENVIADA);
  }

  handleProposalResponse(id: number, accepted: boolean): Observable<Lead> {
    const newStatus = accepted ? LeadStatus.PROPOSTA_ACEITA : LeadStatus.PROPOSTA_NEGADA;
    return this.updateLeadStatus(id, newStatus);
  }

  requestData(id: number): Observable<Lead> {
    return this.updateLeadStatus(id, LeadStatus.AGUARDANDO_DADOS);
  }

  confirmDataReceived(id: number): Observable<Lead> {
    return this.updateLeadStatus(id, LeadStatus.DADOS_ENVIADOS);
  }

  createGroup(id: number): Observable<Lead> {
    return this.updateLeadStatus(id, LeadStatus.GRUPO_CRIADO);
  }

  confirmGroupEntry(id: number, entered: boolean): Observable<Lead> {
    const newStatus = entered ? LeadStatus.CLIENTE_ENTROU_GRUPO : LeadStatus.CLIENTE_NAO_ENTROU_GRUPO;
    return this.updateLeadStatus(id, newStatus);
  }

  requestVMs(id: number): Observable<Lead> {
    return this.updateLeadStatus(id, LeadStatus.AGUARDANDO_VMS);
  }

  confirmVMsReceived(id: number): Observable<Lead> {
    return this.updateLeadStatus(id, LeadStatus.VMS_ENVIADAS);
  }

  startActivation(id: number): Observable<Lead> {
    return this.updateLeadStatus(id, LeadStatus.ATIVACAO_INICIADA);
  }

  markAsImplemented(id: number): Observable<Lead> {
    return this.updateLeadStatus(id, LeadStatus.IMPLANTADO);
  }

  registerInSGP(id: number): Observable<Lead> {
    return this.updateLeadStatus(id, LeadStatus.CADASTRADO_SGP);
  }

  markAsBilled(id: number): Observable<Lead> {
    return this.updateLeadStatus(id, LeadStatus.FATURADO);
  }

  storeForFuture(id: number): Observable<Lead> {
    return this.updateLeadStatus(id, LeadStatus.ARMAZENADO_FUTURO);
  }

  setToFollowUp(id: number): Observable<Lead> {
    return this.updateLeadStatus(id, LeadStatus.COBRAR);
  }

  // Interações
  getInteractions(leadId: number): Observable<Interaction[]> {
    return this.databaseService.getInteractions(leadId);
  }

  createInteraction(leadId: number, tipo: InteractionType, conteudo: string): Observable<Interaction> {
    const interaction = {
      lead_id: leadId,
      tipo: tipo,
      conteudo: conteudo,
      usuario_criacao: this.authService.getCurrentUser()?.nome || 'Sistema'
    };

    return this.databaseService.createInteraction(interaction as any).pipe(
      map(createdInteraction => {
        // Buscar lead para disparar webhook
        this.databaseService.getLead(leadId).subscribe(lead => {
          this.webhookDispatcher.dispatchInteractionCreated(createdInteraction, lead);
        });
        
        return createdInteraction;
      })
    );
  }

  // Filtros e busca
  filterLeadsByStatus(status: LeadStatus): Observable<Lead[]> {
    return this.leads$.pipe(
      map(leads => leads.filter(lead => lead.status === status))
    );
  }

  filterLeadsBySource(source: LeadSource): Observable<Lead[]> {
    return this.leads$.pipe(
      map(leads => leads.filter(lead => lead.fonte === source))
    );
  }

  searchLeads(query: string): Observable<Lead[]> {
    const lowerQuery = query.toLowerCase();
    return this.leads$.pipe(
      map(leads => leads.filter(lead => 
        lead.nome.toLowerCase().includes(lowerQuery) ||
        lead.email.toLowerCase().includes(lowerQuery) ||
        lead.telefone.includes(query) ||
        lead.empresa?.toLowerCase().includes(lowerQuery)
      ))
    );
  }

  // Estatísticas
  getStats(): Observable<any> {
    return this.databaseService.getDashboardStats();
  }

  // WhatsApp
  generateWhatsAppMessage(lead: Lead): string {
    const message = `Olá ${lead.nome}! 

Sou da equipe LeadPro e gostaria de conversar sobre como podemos ajudar sua empresa.

Você poderia me informar um horário que seja conveniente para uma breve conversa?

Aguardo seu retorno!

Atenciosamente,
Equipe LeadPro`;

    return encodeURIComponent(message);
  }

  openWhatsApp(lead: Lead): void {
    const message = this.generateWhatsAppMessage(lead);
    const phone = lead.telefone.replace(/\D/g, '');
    const url = `https://wa.me/55${phone}?text=${message}`;
    window.open(url, '_blank');
  }
}
