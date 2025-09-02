import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/lead.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="profile-container">
      <div class="profile-header">
        <h1>Meu Perfil</h1>
        <p>Gerencie suas informações pessoais e credenciais de acesso</p>
      </div>

      <div class="profile-content">
        <div class="profile-card">
          <h2>Informações Pessoais</h2>
          
          <form [formGroup]="profileForm" (ngSubmit)="updateProfile()" class="profile-form">
            <div class="form-group">
              <label for="nome">Nome Completo</label>
              <input 
                type="text" 
                id="nome" 
                formControlName="nome" 
                class="form-control"
                [class.error]="profileForm.get('nome')?.invalid && profileForm.get('nome')?.touched">
              <div class="error-message" *ngIf="profileForm.get('nome')?.invalid && profileForm.get('nome')?.touched">
                Nome é obrigatório
              </div>
            </div>

            <div class="form-group">
              <label for="email">E-mail</label>
              <input 
                type="email" 
                id="email" 
                formControlName="email" 
                class="form-control"
                [class.error]="profileForm.get('email')?.invalid && profileForm.get('email')?.touched">
              <div class="error-message" *ngIf="profileForm.get('email')?.invalid && profileForm.get('email')?.touched">
                E-mail válido é obrigatório
              </div>
            </div>

            <div class="form-group">
              <label for="role">Função</label>
              <input 
                type="text" 
                id="role" 
                formControlName="role" 
                class="form-control" 
                readonly>
            </div>

            <button type="submit" class="btn-primary" [disabled]="profileForm.invalid || isUpdating">
              <span *ngIf="!isUpdating">Atualizar Perfil</span>
              <span *ngIf="isUpdating">Atualizando...</span>
            </button>
          </form>
        </div>

        <div class="profile-card">
          <h2>Alterar Senha</h2>
          
          <form [formGroup]="passwordForm" (ngSubmit)="updatePassword()" class="password-form">
            <div class="form-group">
              <label for="currentPassword">Senha Atual</label>
              <input 
                type="password" 
                id="currentPassword" 
                formControlName="currentPassword" 
                class="form-control"
                [class.error]="passwordForm.get('currentPassword')?.invalid && passwordForm.get('currentPassword')?.touched">
              <div class="error-message" *ngIf="passwordForm.get('currentPassword')?.invalid && passwordForm.get('currentPassword')?.touched">
                Senha atual é obrigatória
              </div>
            </div>

            <div class="form-group">
              <label for="newPassword">Nova Senha</label>
              <input 
                type="password" 
                id="newPassword" 
                formControlName="newPassword" 
                class="form-control"
                [class.error]="passwordForm.get('newPassword')?.invalid && passwordForm.get('newPassword')?.touched">
              <div class="error-message" *ngIf="passwordForm.get('newPassword')?.invalid && passwordForm.get('newPassword')?.touched">
                Nova senha deve ter pelo menos 6 caracteres
              </div>
            </div>

            <div class="form-group">
              <label for="confirmPassword">Confirmar Nova Senha</label>
              <input 
                type="password" 
                id="confirmPassword" 
                formControlName="confirmPassword" 
                class="form-control"
                [class.error]="passwordForm.get('confirmPassword')?.invalid && passwordForm.get('confirmPassword')?.touched">
              <div class="error-message" *ngIf="passwordForm.get('confirmPassword')?.invalid && passwordForm.get('confirmPassword')?.touched">
                Confirmação de senha é obrigatória
              </div>
            </div>

            <button type="submit" class="btn-secondary" [disabled]="passwordForm.invalid || isUpdatingPassword">
              <span *ngIf="!isUpdatingPassword">Alterar Senha</span>
              <span *ngIf="isUpdatingPassword">Alterando...</span>
            </button>
          </form>
        </div>
      </div>

      <div class="profile-footer">
        <button class="btn-back" (click)="goBack()">
          ← Voltar
        </button>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    .profile-header {
      text-align: center;
      margin-bottom: 40px;
    }

    .profile-header h1 {
      color: #1f2937;
      margin-bottom: 10px;
      font-size: 2rem;
    }

    .profile-header p {
      color: #6b7280;
      font-size: 1.1rem;
    }

    .profile-content {
      display: grid;
      gap: 30px;
      margin-bottom: 40px;
    }

    .profile-card {
      background: white;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border: 1px solid #e5e7eb;
    }

    .profile-card h2 {
      color: #1f2937;
      margin-bottom: 25px;
      font-size: 1.5rem;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 15px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      color: #374151;
      font-weight: 500;
    }

    .form-control {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #d1d5db;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.3s, box-shadow 0.3s;
    }

    .form-control:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-control.error {
      border-color: #ef4444;
    }

    .form-control[readonly] {
      background-color: #f9fafb;
      color: #6b7280;
    }

    .error-message {
      color: #ef4444;
      font-size: 0.875rem;
      margin-top: 5px;
    }

    .btn-primary, .btn-secondary {
      width: 100%;
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s;
      margin-top: 10px;
    }

    .btn-primary {
      background-color: #3b82f6;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #2563eb;
      transform: translateY(-1px);
    }

    .btn-primary:disabled {
      background-color: #9ca3af;
      cursor: not-allowed;
    }

    .btn-secondary {
      background-color: #10b981;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background-color: #059669;
      transform: translateY(-1px);
    }

    .btn-secondary:disabled {
      background-color: #9ca3af;
      cursor: not-allowed;
    }

    .profile-footer {
      text-align: center;
    }

    .btn-back {
      padding: 12px 24px;
      background-color: #6b7280;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .btn-back:hover {
      background-color: #4b5563;
    }

    @media (max-width: 768px) {
      .profile-container {
        padding: 15px;
      }
      
      .profile-card {
        padding: 20px;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  currentUser: User | null = null;
  isUpdating = false;
  isUpdatingPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.initForms(user);
      }
    });
  }

  private initForms(user: User): void {
    this.profileForm = this.fb.group({
      nome: [user.nome, [Validators.required]],
      email: [user.email, [Validators.required, Validators.email]],
      role: [user.role]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(form: FormGroup): { [key: string]: any } | null {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (newPassword !== confirmPassword) {
      return { passwordMismatch: true };
    }
    
    return null;
  }

  updateProfile(): void {
    if (this.profileForm.valid && this.currentUser) {
      this.isUpdating = true;
      
      // Implementar chamada para a API
      const updates = {
        userId: this.currentUser.id,
        nome: this.profileForm.get('nome')?.value,
        email: this.profileForm.get('email')?.value
      };
      
      // Aqui você faria a chamada HTTP para /api/profile
      console.log('Atualizando perfil:', updates);
      
      setTimeout(() => {
        this.isUpdating = false;
        // Atualizar dados do usuário localmente
        if (this.currentUser) {
          this.currentUser.nome = updates.nome;
          this.currentUser.email = updates.email;
        }
        // Mostrar mensagem de sucesso
        alert('Perfil atualizado com sucesso!');
      }, 1000);
    }
  }

  updatePassword(): void {
    if (this.passwordForm.valid && this.currentUser) {
      this.isUpdatingPassword = true;
      
      // Implementar chamada para a API
      const passwordData = {
        userId: this.currentUser.id,
        currentPassword: this.passwordForm.get('currentPassword')?.value,
        newPassword: this.passwordForm.get('newPassword')?.value
      };
      
      // Aqui você faria a chamada HTTP para /api/profile
      console.log('Alterando senha:', passwordData);
      
      setTimeout(() => {
        this.isUpdatingPassword = false;
        this.passwordForm.reset();
        // Mostrar mensagem de sucesso
        alert('Senha alterada com sucesso!');
      }, 1000);
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
