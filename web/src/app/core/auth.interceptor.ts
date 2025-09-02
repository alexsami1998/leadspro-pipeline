import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Adiciona headers de autenticação se o usuário estiver logado
  const currentUser = authService.getCurrentUser();
  
  if (currentUser) {
    req = req.clone({
      setHeaders: {
        'Authorization': `Bearer ${generateToken(currentUser)}`,
        'Content-Type': 'application/json',
        'X-User-Id': currentUser.id?.toString() || '',
        'X-User-Role': currentUser.role
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token expirado ou inválido
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};

function generateToken(user: any): string {
  // Em uma aplicação real, você usaria JWT ou outro método de autenticação
  // Por simplicidade, vamos criar um token básico
  const tokenData = {
    userId: user.id,
    email: user.email,
    role: user.role,
    timestamp: Date.now()
  };
  
  return btoa(JSON.stringify(tokenData));
}

