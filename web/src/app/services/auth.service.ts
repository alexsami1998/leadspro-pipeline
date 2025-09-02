import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { User, UserRole } from '../models/lead.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.currentUserSubject.next(user);
    }
  }

  login(email: string, senha: string): Observable<boolean> {
    // Primeiro tenta autenticar no banco
    return this.http.post<{success: boolean, user?: User, message?: string}>(`${this.apiUrl}/auth/login`, {
      email,
      senha
    }).pipe(
      map(response => {
        if (response.success && response.user) {
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
          return true;
        }
        return false;
      }),
      catchError(() => {
        // Fallback para credenciais padrão se o banco não estiver disponível
        if (email === 'admin' && senha === '123@mudar') {
          const defaultUser: User = {
            id: 1,
            nome: 'Administrador',
            email: 'admin@leadpro.com',
            role: UserRole.ADMIN,
            ativo: true,
            dataCriacao: new Date(),
            dataAtualizacao: new Date()
          };
          localStorage.setItem('currentUser', JSON.stringify(defaultUser));
          this.currentUserSubject.next(defaultUser);
          return of(true);
        }
        return of(false);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  isAdmin(): boolean {
    return this.hasRole(UserRole.ADMIN);
  }

  canViewContractValues(): boolean {
    return this.isAdmin();
  }

  canEditLeads(): boolean {
    return this.isAdmin();
  }

  canDeleteLeads(): boolean {
    return this.isAdmin();
  }
}
