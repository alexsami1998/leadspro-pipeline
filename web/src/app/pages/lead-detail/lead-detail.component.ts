import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { LeadService } from '../../services/lead.service';

@Component({
  selector: 'app-lead-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="lead-detail-container">
      <div class="header">
        <h1>Detalhes do Lead</h1>
        <a routerLink="/leads" class="back-button">← Voltar</a>
      </div>
      
      <div class="lead-content" *ngIf="lead">
        <div class="lead-info">
          <h2>{{ lead.name }}</h2>
          <p class="email">{{ lead.email }}</p>
          <p class="phone">{{ lead.phone }}</p>
          <p class="source">Origem: {{ lead.source }}</p>
          <p class="status">Status: {{ lead.status }}</p>
          <p class="date">Data: {{ lead.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
        </div>
        
        <div class="lead-notes" *ngIf="lead.notes">
          <h3>Observações</h3>
          <p>{{ lead.notes }}</p>
        </div>
      </div>
      
      <div class="loading" *ngIf="!lead && !error">
        Carregando...
      </div>
      
      <div class="error" *ngIf="error">
        {{ error }}
      </div>
    </div>
  `,
  styles: [`
    .lead-detail-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .back-button {
      padding: 10px 20px;
      background-color: #6b7280;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      transition: background-color 0.3s;
    }
    
    .back-button:hover {
      background-color: #4b5563;
    }
    
    .lead-content {
      background: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .lead-info h2 {
      color: #1f2937;
      margin-bottom: 15px;
    }
    
    .lead-info p {
      margin-bottom: 10px;
      color: #6b7280;
    }
    
    .lead-info .email,
    .lead-info .phone {
      font-weight: 500;
      color: #374151;
    }
    
    .lead-notes {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
    }
    
    .lead-notes h3 {
      color: #1f2937;
      margin-bottom: 15px;
    }
    
    .loading, .error {
      text-align: center;
      padding: 40px;
      color: #6b7280;
    }
    
    .error {
      color: #ef4444;
    }
  `]
})
export class LeadDetailComponent implements OnInit {
  lead: any = null;
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private leadService: LeadService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadLead(id);
    }
  }

  private loadLead(id: string) {
    // Implementar carregamento do lead
    // Por enquanto, usando dados mock
    this.lead = {
      id: id,
      name: 'Lead Exemplo',
      email: 'lead@exemplo.com',
      phone: '(11) 99999-9999',
      source: 'Website',
      status: 'Novo',
      notes: 'Lead interessado no produto X',
      createdAt: new Date()
    };
  }
}
