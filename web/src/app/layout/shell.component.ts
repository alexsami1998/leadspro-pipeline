import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { User } from '../models/lead.model';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss']
})
export class ShellComponent implements OnInit {
  sidebarOpen = true;
  currentUser$!: Observable<User | null>;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Inicialização após a construção do componente
    this.currentUser$ = this.authService.currentUser$;
    
    // Restaurar preferência da sidebar do localStorage
    const savedSidebarState = localStorage.getItem('sidebarOpen');
    if (savedSidebarState !== null) {
      this.sidebarOpen = savedSidebarState === 'true';
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
    // Salvar preferência no localStorage
    localStorage.setItem('sidebarOpen', this.sidebarOpen.toString());
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }

  canViewContractValues(): boolean {
    return this.authService.canViewContractValues();
  }

  canEditLeads(): boolean {
    return this.authService.canEditLeads();
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}

