import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PDFService {
  constructor() {
    this.logoPath = path.join(__dirname, '../../web/src/assets/images/logo.png');
  }

  async generateLeadsPDF(leads, filterType = 'all', status = null) {
    try {
      // Configurar Puppeteer
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();

      // Filtrar leads se necessário
      let filteredLeads = leads;
      if (filterType === 'status' && status) {
        filteredLeads = leads.filter(lead => lead.status === status);
      }

      // Gerar HTML para o PDF
      const html = this.generateHTML(filteredLeads, filterType, status);

      // Configurar conteúdo
      await page.setContent(html, { waitUntil: 'networkidle0' });

      // Gerar PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        }
      });

      await browser.close();

      return pdfBuffer;

    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      throw error;
    }
  }

  generateHTML(leads, filterType, status) {
    const logoBase64 = this.getLogoBase64();
    const currentDate = new Date().toLocaleDateString('pt-BR');
    const currentTime = new Date().toLocaleTimeString('pt-BR');

    let title = 'Relatório de Leads - LeadPro';
    if (filterType === 'status' && status) {
      title = `Relatório de Leads - Status: ${status}`;
    }

    const leadsHTML = leads.map(lead => this.generateLeadHTML(lead)).join('');

    return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
            @page {
                size: A4;
                margin: 20mm 15mm;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 0;
                color: #333;
                line-height: 1.6;
            }
            
            .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 3px solid #007bff;
                padding-bottom: 20px;
            }
            
            .logo {
                max-width: 200px;
                height: auto;
                margin-bottom: 15px;
            }
            
            .title {
                font-size: 24px;
                font-weight: bold;
                color: #007bff;
                margin: 0;
            }
            
            .subtitle {
                font-size: 14px;
                color: #666;
                margin: 5px 0;
            }
            
            .lead-page {
                page-break-after: always;
                margin-bottom: 30px;
            }
            
            .lead-page:last-child {
                page-break-after: avoid;
            }
            
            .lead-header {
                background: linear-gradient(135deg, #007bff, #0056b3);
                color: white;
                padding: 15px;
                border-radius: 8px 8px 0 0;
                margin-bottom: 0;
            }
            
            .lead-title {
                font-size: 18px;
                font-weight: bold;
                margin: 0;
            }
            
            .lead-content {
                border: 2px solid #007bff;
                border-top: none;
                border-radius: 0 0 8px 8px;
                padding: 20px;
                background: #f8f9fa;
            }
            
            .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 20px;
            }
            
            .info-section {
                background: white;
                padding: 15px;
                border-radius: 6px;
                border-left: 4px solid #007bff;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .info-label {
                font-weight: bold;
                color: #007bff;
                font-size: 12px;
                text-transform: uppercase;
                margin-bottom: 5px;
            }
            
            .info-value {
                font-size: 14px;
                color: #333;
                word-wrap: break-word;
            }
            
            .status-badge {
                display: inline-block;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: bold;
                text-transform: uppercase;
            }
            
            .status-novo { background: #28a745; color: white; }
            .status-contato { background: #ffc107; color: #333; }
            .status-proposta { background: #17a2b8; color: white; }
            .status-fechado { background: #6f42c1; color: white; }
            .status-perdido { background: #dc3545; color: white; }
            
            .interactions {
                margin-top: 20px;
            }
            
            .interaction {
                background: white;
                border: 1px solid #dee2e6;
                border-radius: 6px;
                padding: 12px;
                margin-bottom: 10px;
            }
            
            .interaction-header {
                font-weight: bold;
                color: #007bff;
                font-size: 12px;
                margin-bottom: 5px;
            }
            
            .interaction-content {
                font-size: 13px;
                color: #555;
            }
            
            .interaction-date {
                font-size: 11px;
                color: #999;
                font-style: italic;
            }
            
            .no-interactions {
                text-align: center;
                color: #999;
                font-style: italic;
                padding: 20px;
            }
            
            .footer {
                position: fixed;
                bottom: 10mm;
                left: 15mm;
                right: 15mm;
                text-align: center;
                font-size: 10px;
                color: #666;
                border-top: 1px solid #dee2e6;
                padding-top: 10px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <img src="${logoBase64}" alt="LeadPro Logo" class="logo">
            <h1 class="title">${title}</h1>
            <p class="subtitle">Gerado em: ${currentDate} às ${currentTime}</p>
            <p class="subtitle">Total de leads: ${leads.length}</p>
        </div>

        ${leadsHTML}

        <div class="footer">
            LeadPro - Sistema de Gestão de Leads | Página <span class="page-number"></span>
        </div>
    </body>
    </html>
    `;
  }

  generateLeadHTML(lead) {
    const statusClass = lead.status ? lead.status.toLowerCase().replace(/\s+/g, '-') : 'novo';
    
    // Formatar data de criação
    const createdDate = lead.created_at ? new Date(lead.created_at).toLocaleDateString('pt-BR') : 'N/A';
    const createdTime = lead.created_at ? new Date(lead.created_at).toLocaleTimeString('pt-BR') : 'N/A';
    
    // Formatar data de atualização
    const updatedDate = lead.updated_at ? new Date(lead.updated_at).toLocaleDateString('pt-BR') : 'N/A';
    const updatedTime = lead.updated_at ? new Date(lead.updated_at).toLocaleTimeString('pt-BR') : 'N/A';

    // Gerar HTML das interações
    let interactionsHTML = '';
    if (lead.interactions && lead.interactions.length > 0) {
      interactionsHTML = lead.interactions.map(interaction => `
        <div class="interaction">
          <div class="interaction-header">${interaction.type || 'Interação'}</div>
          <div class="interaction-content">${interaction.content || 'Sem conteúdo'}</div>
          <div class="interaction-date">${new Date(interaction.created_at).toLocaleString('pt-BR')}</div>
        </div>
      `).join('');
    } else {
      interactionsHTML = '<div class="no-interactions">Nenhuma interação registrada</div>';
    }

    return `
      <div class="lead-page">
        <div class="lead-header">
          <h2 class="lead-title">Lead #${lead.id} - ${lead.name || 'Nome não informado'}</h2>
        </div>
        
        <div class="lead-content">
          <div class="info-grid">
            <div class="info-section">
              <div class="info-label">Informações Pessoais</div>
              <div class="info-value">
                <strong>Nome:</strong> ${lead.name || 'N/A'}<br>
                <strong>Email:</strong> ${lead.email || 'N/A'}<br>
                <strong>Telefone:</strong> ${lead.phone || 'N/A'}<br>
                <strong>Empresa:</strong> ${lead.company || 'N/A'}
              </div>
            </div>
            
            <div class="info-section">
              <div class="info-label">Status e Datas</div>
              <div class="info-value">
                <strong>Status:</strong> <span class="status-badge status-${statusClass}">${lead.status || 'Novo'}</span><br>
                <strong>Criado em:</strong> ${createdDate} às ${createdTime}<br>
                <strong>Atualizado em:</strong> ${updatedDate} às ${updatedTime}
              </div>
            </div>
          </div>
          
          <div class="info-grid">
            <div class="info-section">
              <div class="info-label">Informações Adicionais</div>
              <div class="info-value">
                <strong>Origem:</strong> ${lead.source || 'N/A'}<br>
                <strong>Valor:</strong> ${lead.value ? `R$ ${parseFloat(lead.value).toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : 'N/A'}<br>
                <strong>Observações:</strong> ${lead.notes || 'Nenhuma observação'}
              </div>
            </div>
            
            <div class="info-section">
              <div class="info-label">Contato</div>
              <div class="info-value">
                <strong>Endereço:</strong> ${lead.address || 'N/A'}<br>
                <strong>Cidade:</strong> ${lead.city || 'N/A'}<br>
                <strong>Estado:</strong> ${lead.state || 'N/A'}<br>
                <strong>CEP:</strong> ${lead.zip_code || 'N/A'}
              </div>
            </div>
          </div>
          
          <div class="interactions">
            <div class="info-label">Histórico de Interações</div>
            ${interactionsHTML}
          </div>
        </div>
      </div>
    `;
  }

  getLogoBase64() {
    try {
      if (fs.existsSync(this.logoPath)) {
        const logoBuffer = fs.readFileSync(this.logoPath);
        return `data:image/png;base64,${logoBuffer.toString('base64')}`;
      }
    } catch (error) {
      console.error('Erro ao carregar logo:', error);
    }
    
    // Logo padrão em base64 se não encontrar o arquivo
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgMjAwIDUwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iNTAiIGZpbGw9IiMwMDdiZmYiLz48dGV4dCB4PSIxMDAiIHk9IjMwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4IiBmb250LXdlaWdodD0iYm9sZCI+TGVhZFBybzwvdGV4dD48L3N2Zz4=';
  }
}

export default PDFService;
