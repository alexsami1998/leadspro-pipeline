import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PDFExportOptions {
  filterType: 'all' | 'status';
  status?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PdfExportService {
  private apiUrl = '';

  constructor(private http: HttpClient) {
    // Detectar URL da API dinamicamente
    this.apiUrl = this.getApiUrl();
  }

  private getApiUrl(): string {
    const hostname = window.location.hostname;
    const port = '5000';
    return `http://${hostname}:${port}/api`;
  }

  exportLeadsPDF(options: PDFExportOptions): Observable<Blob> {
    let params = new HttpParams();
    params = params.set('filterType', options.filterType);
    
    if (options.filterType === 'status' && options.status) {
      params = params.set('status', options.status);
    }

    return this.http.get(`${this.apiUrl}/leads/export/pdf`, {
      params: params,
      responseType: 'blob'
    });
  }

  downloadPDF(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
