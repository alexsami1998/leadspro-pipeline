import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PdfExportService, PDFExportOptions } from '../../services/pdf-export.service';

@Component({
  selector: 'app-pdf-export',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="pdf-export-container">
      <div class="export-header">
        <h3>📄 Exportar Relatório PDF</h3>
        <p>Selecione as opções para gerar o relatório de leads em PDF</p>
      </div>

      <div class="export-options">
        <div class="option-group">
          <label class="option-label">
            <input 
              type="radio" 
              name="filterType" 
              value="all" 
              [(ngModel)]="exportOptions.filterType"
              (change)="onFilterTypeChange()">
            <span class="radio-custom"></span>
            <div class="option-content">
              <strong>📊 Todos os Leads</strong>
              <small>Exportar todos os leads cadastrados no sistema</small>
            </div>
          </label>
        </div>

        <div class="option-group">
          <label class="option-label">
            <input 
              type="radio" 
              name="filterType" 
              value="status" 
              [(ngModel)]="exportOptions.filterType"
              (change)="onFilterTypeChange()">
            <span class="radio-custom"></span>
            <div class="option-content">
              <strong>🎯 Filtrar por Status</strong>
              <small>Exportar apenas leads com status específico</small>
            </div>
          </label>
        </div>

        <div class="status-selector" *ngIf="exportOptions.filterType === 'status'">
          <label for="statusSelect">Status:</label>
          <select 
            id="statusSelect" 
            [(ngModel)]="exportOptions.status"
            class="status-select">
            <option value="">Selecione um status</option>
            <option value="Novo">Novo</option>
            <option value="Contato">Contato</option>
            <option value="Proposta">Proposta</option>
            <option value="Fechado">Fechado</option>
            <option value="Perdido">Perdido</option>
          </select>
        </div>
      </div>

      <div class="export-actions">
        <button 
          type="button" 
          class="btn btn-secondary"
          (click)="onCancel()">
          ❌ Cancelar
        </button>
        <button 
          type="button" 
          class="btn btn-primary"
          [disabled]="!canExport()"
          (click)="onExport()"
          [class.loading]="isExporting">
          <span *ngIf="!isExporting">📄 Gerar PDF</span>
          <span *ngIf="isExporting">⏳ Gerando...</span>
        </button>
      </div>

      <div class="export-info" *ngIf="exportOptions.filterType === 'all'">
        <div class="info-box">
          <strong>ℹ️ Informação:</strong>
          <p>O relatório incluirá todos os leads cadastrados no sistema, organizados em páginas individuais com layout profissional.</p>
        </div>
      </div>

      <div class="export-info" *ngIf="exportOptions.filterType === 'status' && exportOptions.status">
        <div class="info-box">
          <strong>ℹ️ Informação:</strong>
          <p>O relatório incluirá apenas os leads com status "{{ exportOptions.status }}", organizados em páginas individuais.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pdf-export-container {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      max-width: 500px;
      margin: 0 auto;
    }

    .export-header {
      text-align: center;
      margin-bottom: 24px;
      border-bottom: 2px solid #e9ecef;
      padding-bottom: 16px;
    }

    .export-header h3 {
      color: #007bff;
      margin: 0 0 8px 0;
      font-size: 1.5rem;
    }

    .export-header p {
      color: #6c757d;
      margin: 0;
      font-size: 0.9rem;
    }

    .export-options {
      margin-bottom: 24px;
    }

    .option-group {
      margin-bottom: 16px;
    }

    .option-label {
      display: flex;
      align-items: flex-start;
      cursor: pointer;
      padding: 12px;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      transition: all 0.3s ease;
    }

    .option-label:hover {
      border-color: #007bff;
      background-color: #f8f9fa;
    }

    .option-label input[type="radio"] {
      display: none;
    }

    .radio-custom {
      width: 20px;
      height: 20px;
      border: 2px solid #dee2e6;
      border-radius: 50%;
      margin-right: 12px;
      margin-top: 2px;
      position: relative;
      transition: all 0.3s ease;
    }

    .option-label input[type="radio"]:checked + .radio-custom {
      border-color: #007bff;
      background-color: #007bff;
    }

    .option-label input[type="radio"]:checked + .radio-custom::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 8px;
      height: 8px;
      background-color: white;
      border-radius: 50%;
    }

    .option-content {
      flex: 1;
    }

    .option-content strong {
      display: block;
      color: #333;
      margin-bottom: 4px;
    }

    .option-content small {
      color: #6c757d;
      font-size: 0.8rem;
    }

    .status-selector {
      margin-top: 16px;
      padding: 16px;
      background-color: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #dee2e6;
    }

    .status-selector label {
      display: block;
      font-weight: 600;
      color: #333;
      margin-bottom: 8px;
    }

    .status-select {
      width: 100%;
      padding: 8px 12px;
      border: 2px solid #dee2e6;
      border-radius: 6px;
      font-size: 0.9rem;
      background-color: white;
      transition: border-color 0.3s ease;
    }

    .status-select:focus {
      outline: none;
      border-color: #007bff;
    }

    .export-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-bottom: 20px;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background-color: #5a6268;
    }

    .btn-primary {
      background-color: #007bff;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #0056b3;
    }

    .btn-primary:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
      opacity: 0.6;
    }

    .btn.loading {
      position: relative;
    }

    .export-info {
      margin-top: 16px;
    }

    .info-box {
      background-color: #e7f3ff;
      border: 1px solid #b3d9ff;
      border-radius: 6px;
      padding: 12px;
    }

    .info-box strong {
      color: #0066cc;
      display: block;
      margin-bottom: 4px;
    }

    .info-box p {
      color: #333;
      margin: 0;
      font-size: 0.9rem;
      line-height: 1.4;
    }
  `]
})
export class PdfExportComponent {
  @Output() export = new EventEmitter<PDFExportOptions>();
  @Output() cancel = new EventEmitter<void>();

  exportOptions: PDFExportOptions = {
    filterType: 'all'
  };

  isExporting = false;

  constructor(private pdfExportService: PdfExportService) {}

  onFilterTypeChange(): void {
    if (this.exportOptions.filterType === 'all') {
      this.exportOptions.status = undefined;
    }
  }

  canExport(): boolean {
    if (this.exportOptions.filterType === 'status') {
      return !!this.exportOptions.status;
    }
    return true;
  }

  onExport(): void {
    if (!this.canExport() || this.isExporting) {
      return;
    }

    this.isExporting = true;
    console.log('Iniciando exportação PDF com opções:', this.exportOptions);

    this.pdfExportService.exportLeadsPDF(this.exportOptions).subscribe({
      next: (blob) => {
        console.log('PDF recebido, tamanho:', blob.size, 'bytes');
        const filename = this.generateFilename();
        this.pdfExportService.downloadPDF(blob, filename);
        this.isExporting = false;
        this.export.emit(this.exportOptions);
        alert('PDF gerado com sucesso!');
      },
      error: (error) => {
        console.error('Erro ao exportar PDF:', error);
        console.error('Detalhes do erro:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url
        });
        
        let errorMessage = 'Erro ao gerar PDF. ';
        if (error.status === 0) {
          errorMessage += 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.';
        } else if (error.status === 500) {
          errorMessage += 'Erro interno do servidor. Verifique os logs do backend.';
        } else {
          errorMessage += `Erro ${error.status}: ${error.statusText}`;
        }
        
        alert(errorMessage);
        this.isExporting = false;
      }
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }

  private generateFilename(): string {
    const date = new Date().toISOString().split('T')[0];
    
    if (this.exportOptions.filterType === 'status' && this.exportOptions.status) {
      return `leads_status_${this.exportOptions.status}_${date}.pdf`;
    }
    
    return `leads_completo_${date}.pdf`;
  }
}
