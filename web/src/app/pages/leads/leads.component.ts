import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeadService } from '../../services/lead.service';
import { AuthService } from '../../services/auth.service';
import { Lead, LeadStatus, LeadSource, Interaction, InteractionType, LeadProduct, ProductName } from '../../models/lead.model';
import { PdfExportComponent } from '../../components/pdf-export/pdf-export.component';

@Component({
  selector: 'app-leads',
  standalone: true,
  imports: [CommonModule, FormsModule, PdfExportComponent],
  templateUrl: './leads.component.html',
  styleUrls: ['./leads.component.scss']
})
export class LeadsComponent implements OnInit {
  leads: Lead[] = [];
  filteredLeads: Lead[] = [];
  selectedLead: Lead | null = null;
  showCreateModal = false;
  showEditModal = false;
  showInteractionModal = false;
  showPdfExportModal = false;
  loading = true;
  activeTab = 'details';
  leadInteractions: Interaction[] = [];
  searchTerm = '';
  selectedStatus = '';
  selectedSource = '';

  // Form data
  newLead: Partial<Lead> = {};
  editLead: Lead | null = null;
  newInteraction: Partial<Interaction> = {};
  
  // Product management
  newLeadProducts: LeadProduct[] = [];
  editLeadProducts: LeadProduct[] = [];
  availableProducts = Object.values(ProductName);

  // Media management
  selectedFile: File | null = null;
  mediaPreviewUrl: string | null = null;
  uploadingMedia = false;
  isDragOver = false;
  showMediaModal = false;
  selectedMediaInteraction: Interaction | null = null;
  isImageZoomed = false;

  // Enums para o template
  LeadStatus = LeadStatus;
  LeadSource = LeadSource;
  InteractionType = InteractionType;
  ProductName = ProductName;
  Object = Object;

  constructor(
    private leadService: LeadService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadLeads();
  }

  loadLeads(): void {
    this.loading = true;
    this.leadService.getLeads().subscribe({
      next: (leads) => {
        this.leads = leads;
        this.filteredLeads = leads;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar leads:', error);
        this.loading = false;
      }
    });
  }

  // CRUD Operations
  createLead(): void {
    if (!this.newLead.nome || !this.newLead.email || !this.newLead.telefone || !this.newLead.fonte) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const leadData = {
      ...this.newLead,
      produtos: this.newLeadProducts,
      descontoGeral: this.newLead.descontoGeral || 0,
      valorTotal: this.newLead.valorTotal || 0
    };

    this.leadService.createLead(leadData as Omit<Lead, 'id' | 'dataCriacao' | 'dataAtualizacao'>).subscribe({
      next: (lead) => {
        this.leads.unshift(lead);
        this.filterLeads();
        this.showCreateModal = false;
        this.newLead = {};
        this.newLeadProducts = [];
        alert('Lead criado com sucesso!');
      },
      error: (error) => {
        console.error('Erro ao criar lead:', error);
        alert('Erro ao criar lead');
      }
    });
  }

  updateLead(): void {
    if (!this.editLead?.id) return;

    const leadData = {
      ...this.editLead,
      produtos: this.editLeadProducts,
      descontoGeral: this.editLead.descontoGeral || 0,
      valorTotal: this.editLead.valorTotal || 0
    };

    this.leadService.updateLead(this.editLead.id, leadData).subscribe({
      next: (lead) => {
        const index = this.leads.findIndex(l => l.id === lead.id);
        if (index !== -1) {
          this.leads[index] = lead;
          this.filterLeads();
        }
        this.showEditModal = false;
        this.editLead = null;
        this.editLeadProducts = [];
        alert('Lead atualizado com sucesso!');
      },
      error: (error) => {
        console.error('Erro ao atualizar lead:', error);
        alert('Erro ao atualizar lead');
      }
    });
  }

  deleteLead(lead: Lead): void {
    if (!confirm(`Tem certeza que deseja excluir o lead "${lead.nome}"?`)) {
      return;
    }

    if (!lead.id) return;

    this.leadService.deleteLead(lead.id).subscribe({
      next: () => {
        this.leads = this.leads.filter(l => l.id !== lead.id);
        this.filterLeads();
        alert('Lead excluído com sucesso!');
      },
      error: (error) => {
        console.error('Erro ao excluir lead:', error);
        alert('Erro ao excluir lead');
      }
    });
  }

  // Status Management
  updateLeadStatus(lead: Lead, newStatus: LeadStatus): void {
    if (!lead.id) return;

    this.leadService.updateLeadStatus(lead.id, newStatus).subscribe({
      next: (updatedLead) => {
        const index = this.leads.findIndex(l => l.id === updatedLead.id);
        if (index !== -1) {
          this.leads[index] = updatedLead;
          this.filterLeads();
        }
        alert(`Status do lead atualizado para: ${this.getStatusLabel(newStatus)}`);
      },
      error: (error) => {
        console.error('Erro ao atualizar status:', error);
        alert('Erro ao atualizar status');
      }
    });
  }

  onStatusChange(event: Event, lead: Lead): void {
    const select = event.target as HTMLSelectElement;
    const newStatus = select.value as LeadStatus;
    if (newStatus) {
      this.updateLeadStatus(lead, newStatus);
    }
  }

  // Interactions - função removida (duplicada)

  // Filtering and Search
  filterLeads(): void {
    this.filteredLeads = this.leads.filter(lead => {
      const matchesSearch = !this.searchTerm || 
        lead.nome.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        lead.telefone.includes(this.searchTerm) ||
        lead.empresa?.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = !this.selectedStatus || lead.status === this.selectedStatus;
      const matchesSource = !this.selectedSource || lead.fonte === this.selectedSource;

      return matchesSearch && matchesStatus && matchesSource;
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedSource = '';
    this.filterLeads();
  }

  // Modal Management
  openCreateModal(): void {
    this.showCreateModal = true;
    this.newLead = {
      status: LeadStatus.NOVO_LEAD,
      fonte: LeadSource.INDICACAO,
      descontoGeral: 0,
      valorTotal: 0
    };
    this.newLeadProducts = [];
  }

  openEditModal(lead: Lead): void {
    this.editLead = { ...lead };
    this.editLeadProducts = lead.produtos ? [...lead.produtos] : [];
    this.showEditModal = true;
    this.activeTab = 'details';
    if (lead.id) {
      this.loadLeadInteractions(lead.id);
    }
  }

  openInteractionModal(lead: Lead): void {
    this.selectedLead = lead;
    this.showInteractionModal = true;
    this.newInteraction = {
      leadId: lead.id,
      tipo: InteractionType.CONTATO_INICIAL
    };
  }

  closeModals(): void {
    this.showCreateModal = false;
    this.showEditModal = false;
    this.showInteractionModal = false;
    this.newLead = {};
    this.editLead = null;
    this.newInteraction = {};
    this.selectedLead = null;
    this.activeTab = 'details';
    this.leadInteractions = [];
    this.newLeadProducts = [];
    this.editLeadProducts = [];
  }

  // Load lead interactions
  loadLeadInteractions(leadId: number): void {
    this.leadService.getInteractions(leadId).subscribe({
      next: (interactions) => {
        console.log('Interações carregadas:', interactions);
        this.leadInteractions = interactions;
      },
      error: (error) => {
        console.error('Erro ao carregar interações:', error);
        this.leadInteractions = [];
      }
    });
  }

  // Utility Methods
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

  getInteractionTypeLabel(tipo: string): string {
    const labels: { [key: string]: string } = {
      [InteractionType.CONTATO_INICIAL]: 'Contato Inicial',
      [InteractionType.QUALIFICACAO]: 'Qualificação',
      [InteractionType.APRESENTACAO]: 'Apresentação',
      [InteractionType.PROPOSTA]: 'Proposta',
      [InteractionType.COBRANCA]: 'Cobrança',
      [InteractionType.IMPLEMENTACAO]: 'Implementação',
      [InteractionType.OUTRO]: 'Outro'
    };
    return labels[tipo] || tipo;
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

  formatCurrency(value: number | undefined): string {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  // Permissions
  canEditLeads(): boolean {
    return this.authService.canEditLeads();
  }

  canDeleteLeads(): boolean {
    return this.authService.canDeleteLeads();
  }

  canViewContractValues(): boolean {
    return this.authService.canViewContractValues();
  }

  // WhatsApp Integration
  openWhatsApp(lead: Lead): void {
    this.leadService.openWhatsApp(lead);
  }

  // Product Management Methods
  addProductToNewLead(): void {
    if (this.newLeadProducts.length < 6) {
      this.newLeadProducts.push({
        nome: ProductName.EASYMAPS,
        valor: 0,
        desconto: 0,
        valorFinal: 0
      });
    }
  }

  addProductToEditLead(): void {
    if (this.editLeadProducts.length < 6) {
      this.editLeadProducts.push({
        nome: ProductName.EASYMAPS,
        valor: 0,
        desconto: 0,
        valorFinal: 0
      });
    }
  }

  removeProductFromNewLead(index: number): void {
    this.newLeadProducts.splice(index, 1);
    this.calculateNewLeadTotal();
  }

  removeProductFromEditLead(index: number): void {
    this.editLeadProducts.splice(index, 1);
    this.calculateEditLeadTotal();
  }

  onProductChangeNewLead(index: number): void {
    this.calculateProductFinalValue(this.newLeadProducts[index]);
    this.calculateNewLeadTotal();
  }

  onProductChangeEditLead(index: number): void {
    this.calculateProductFinalValue(this.editLeadProducts[index]);
    this.calculateEditLeadTotal();
  }

  onDescontoGeralChangeNewLead(): void {
    this.calculateNewLeadTotal();
  }

  onDescontoGeralChangeEditLead(): void {
    this.calculateEditLeadTotal();
  }

  private calculateProductFinalValue(product: LeadProduct): void {
    product.valorFinal = product.valor - product.desconto;
  }

  private calculateNewLeadTotal(): void {
    let total = this.newLeadProducts.reduce((sum, product) => sum + product.valorFinal, 0);
    if (this.newLead.descontoGeral) {
      total -= this.newLead.descontoGeral;
    }
    this.newLead.valorTotal = Math.max(0, total);
  }

  private calculateEditLeadTotal(): void {
    let total = this.editLeadProducts.reduce((sum, product) => sum + product.valorFinal, 0);
    if (this.editLead?.descontoGeral) {
      total -= this.editLead.descontoGeral;
    }
    if (this.editLead) {
      this.editLead.valorTotal = Math.max(0, total);
    }
  }

  getProductLabel(productName: string): string {
    return productName;
  }

  getAvailableProductsForNewLead(index: number): ProductName[] {
    const usedProducts = this.newLeadProducts
      .map((p, i) => i !== index ? p.nome : null)
      .filter(p => p !== null);
    return this.availableProducts.filter(p => !usedProducts.includes(p));
  }

  getAvailableProductsForEditLead(index: number): ProductName[] {
    const usedProducts = this.editLeadProducts
      .map((p, i) => i !== index ? p.nome : null)
      .filter(p => p !== null);
    return this.availableProducts.filter(p => !usedProducts.includes(p));
  }

  // Media management methods
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  private handleFile(file: File): void {
    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!allowedTypes.includes(file.type)) {
      alert('Tipo de arquivo não permitido. Apenas imagens e PDFs são aceitos.');
      return;
    }

    // Validar tamanho (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Arquivo muito grande. Tamanho máximo: 10MB');
      return;
    }

    this.selectedFile = file;

    // Criar preview para imagens
    if (this.isImageFile(file)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.mediaPreviewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      this.mediaPreviewUrl = null;
    }
  }

  isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
  }

  isImageType(mimeType: string | undefined): boolean {
    return mimeType?.startsWith('image/') || false;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  removeSelectedFile(): void {
    this.selectedFile = null;
    this.mediaPreviewUrl = null;
  }

  getMediaUrl(mediaId: string): string {
    const url = `http://localhost:5000/api/media/${mediaId}`;
    console.log('Media URL:', url);
    return url;
  }

  onImageError(event: any): void {
    console.error('Erro ao carregar imagem:', event);
  }

  onImageLoad(): void {
    console.log('Imagem carregada com sucesso');
  }

  toggleImageZoom(): void {
    this.isImageZoomed = !this.isImageZoomed;
  }

  getFileTypeLabel(mimeType: string): string {
    const typeMap: { [key: string]: string } = {
      'image/jpeg': 'Imagem JPEG',
      'image/jpg': 'Imagem JPG',
      'image/png': 'Imagem PNG',
      'image/gif': 'Imagem GIF',
      'application/pdf': 'Documento PDF',
      'application/msword': 'Documento Word',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Documento Word'
    };
    return typeMap[mimeType] || 'Arquivo';
  }

  openMediaModal(interaction: Interaction): void {
    this.selectedMediaInteraction = interaction;
    this.showMediaModal = true;
  }

  closeMediaModal(): void {
    this.showMediaModal = false;
    this.selectedMediaInteraction = null;
  }

  downloadMedia(interaction: Interaction): void {
    if (interaction.mediaId) {
      const link = document.createElement('a');
      link.href = this.getMediaUrl(interaction.mediaId);
      link.download = interaction.mediaFilename || 'arquivo';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  async addInteraction(): Promise<void> {
    if (!this.newInteraction.tipo || !this.newInteraction.conteudo) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      this.uploadingMedia = true;
      
      let mediaId: string | null = null;
      let mediaType: string | null = null;
      let mediaFilename: string | null = null;

      // Upload da mídia se houver arquivo selecionado
      if (this.selectedFile) {
        const formData = new FormData();
        formData.append('media', this.selectedFile);

        const uploadResponse = await fetch('http://localhost:5000/api/media/upload', {
          method: 'POST',
          body: formData
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          mediaId = uploadData.mediaId;
          mediaType = uploadData.mimeType;
          mediaFilename = uploadData.filename;
        } else {
          throw new Error('Erro no upload da mídia');
        }
      }

      // Criar a interação
      const interactionData = {
        lead_id: this.newInteraction.leadId,
        tipo: this.newInteraction.tipo,
        conteudo: this.newInteraction.conteudo,
        usuario_criacao: this.authService.getCurrentUser()?.id,
        media_id: mediaId,
        media_type: mediaType,
        media_filename: mediaFilename
      };

      const response = await fetch('http://localhost:5000/api/interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(interactionData)
      });

      if (response.ok) {
        // Limpar formulário
        this.newInteraction = {};
        this.selectedFile = null;
        this.mediaPreviewUrl = null;
        
        // Fechar modal
        this.closeModals();
        
        // Recarregar interações
        if (this.editLead && this.editLead.id) {
          await this.loadLeadInteractions(this.editLead.id);
        }
        
        alert('Interação registrada com sucesso!');
      } else {
        throw new Error('Erro ao registrar interação');
      }
    } catch (error) {
      console.error('Erro ao adicionar interação:', error);
      alert('Erro ao registrar interação. Tente novamente.');
    } finally {
      this.uploadingMedia = false;
    }
  }

  // Métodos para exportação PDF
  openPdfExportModal(): void {
    this.showPdfExportModal = true;
  }

  closePdfExportModal(): void {
    this.showPdfExportModal = false;
  }

  onPdfExportSuccess(): void {
    this.closePdfExportModal();
    // Opcional: mostrar mensagem de sucesso
  }
}

