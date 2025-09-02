import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="logo-container" [class.small]="size === 'small'" [class.medium]="size === 'medium'" [class.large]="size === 'large'">
      <img 
        [src]="logoPath" 
        [alt]="altText" 
        class="logo-image"
        [class.small]="size === 'small'"
        [class.medium]="size === 'medium'"
        [class.large]="size === 'large'"
        (error)="onImageError($event)"
        (load)="onImageLoad()"
      />
      <div *ngIf="!logoPath" class="logo-placeholder">
        Logo não encontrado
      </div>
    </div>
  `,
  styles: [`
    .logo-container {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .logo-image {
      max-width: 100%;
      height: auto;
      transition: all 0.3s ease;
      object-fit: contain;
    }

    /* Tamanhos responsivos */
    .logo-image.small {
      width: 120px;
      height: auto;
    }

    .logo-image.medium {
      width: 180px;
      height: auto;
    }

    .logo-image.large {
      width: 240px;
      height: auto;
    }

    .logo-placeholder {
      color: #666;
      font-size: 14px;
      text-align: center;
      padding: 20px;
      border: 2px dashed #ccc;
      border-radius: 8px;
    }

    /* Responsivo para mobile */
    @media (max-width: 768px) {
      .logo-image.small {
        width: 100px;
      }
      
      .logo-image.medium {
        width: 150px;
      }
      
      .logo-image.large {
        width: 200px;
      }
    }
  `]
})
export class LogoComponent {
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() logoPath: string = '';
  @Input() altText: string = 'Logo da empresa';

  onImageError(event: any): void {
    console.error('Erro ao carregar logo:', this.logoPath, event);
  }

  onImageLoad(): void {
    console.log('Logo carregado com sucesso:', this.logoPath);
  }
}
