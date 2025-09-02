import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeadService } from '../../services/lead.service';
import { LeadStatus, LeadSource } from '../../models/lead.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  stats: any = {};
  leadsByStatus: { [key: string]: number } = {};
  leadsBySource: { [key: string]: number } = {};
  recentLeads: any[] = [];
  loading = true;

  constructor(private leadService: LeadService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.loading = true;

    // Carregar estatísticas
    this.leadService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar estatísticas:', error);
        this.loading = false;
      }
    });

    // Carregar leads por status
    this.leadService.getLeads().subscribe({
      next: (leads) => {
        this.calculateStats(leads);
        this.recentLeads = leads.slice(0, 5); // Últimos 5 leads
      },
      error: (error) => {
        console.error('Erro ao carregar leads:', error);
      }
    });
  }

  private calculateStats(leads: any[]): void {
    // Estatísticas por status
    this.leadsByStatus = leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {});

    // Estatísticas por fonte
    this.leadsBySource = leads.reduce((acc, lead) => {
      acc[lead.fonte] = (acc[lead.fonte] || 0) + 1;
      return acc;
    }, {});
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      [LeadStatus.NOVO_LEAD]: '#3b82f6',
      [LeadStatus.LEAD_QUALIFICADO]: '#10b981',
      [LeadStatus.INTERESSE]: '#f59e0b',
      [LeadStatus.PROPOSTA_ACEITA]: '#8b5cf6',
      [LeadStatus.IMPLANTADO]: '#06b6d4',
      [LeadStatus.FATURADO]: '#059669',
      [LeadStatus.ARMAZENADO_FUTURO]: '#6b7280',
      [LeadStatus.COBRAR]: '#ef4444'
    };
    return colors[status] || '#6b7280';
  }

  getSourceColor(source: string): string {
    const colors: { [key: string]: string } = {
      [LeadSource.INDICACAO]: '#3b82f6',
      [LeadSource.EVENTO]: '#10b981',
      [LeadSource.REDES_SOCIAIS]: '#f59e0b',
      [LeadSource.EX_CLIENTE]: '#8b5cf6',
      [LeadSource.PARCEIRO]: '#06b6d4'
    };
    return colors[source] || '#6b7280';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      [LeadStatus.NOVO_LEAD]: 'Novo Lead',
      [LeadStatus.LEAD_QUALIFICADO]: 'Qualificado',
      [LeadStatus.INTERESSE]: 'Interessado',
      [LeadStatus.PROPOSTA_ACEITA]: 'Proposta Aceita',
      [LeadStatus.IMPLANTADO]: 'Implantado',
      [LeadStatus.FATURADO]: 'Faturado',
      [LeadStatus.ARMAZENADO_FUTURO]: 'Armazenado',
      [LeadStatus.COBRAR]: 'Cobrar'
    };
    return labels[status] || status;
  }

  getSourceLabel(source: string): string {
    const labels: { [key: string]: string } = {
      [LeadSource.INDICACAO]: 'Indicação',
      [LeadSource.EVENTO]: 'Evento',
      [LeadSource.REDES_SOCIAIS]: 'Redes Sociais',
      [LeadSource.EX_CLIENTE]: 'Ex Cliente',
      [LeadSource.PARCEIRO]: 'Parceiro'
    };
    return labels[source] || source;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  getTotalLeads(): number {
    return Object.values(this.leadsByStatus).reduce((sum, count) => sum + count, 0);
  }

  getPercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  }
}

