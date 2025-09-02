import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { DatabaseService } from '../../services/database.service';
import { User, UserRole } from '../../models/lead.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  selectedUser: User | null = null;
  showCreateModal = false;
  showEditModal = false;
  loading = true;
  searchTerm = '';

  // Form data
  newUser: Partial<User> = {};
  editUser: Partial<User> = {};

  // Enums para o template
  UserRole = UserRole;
  Object = Object;

  constructor(
    private authService: AuthService,
    private databaseService: DatabaseService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.databaseService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = users;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar usuários:', error);
        this.loading = false;
      }
    });
  }

  // CRUD Operations
  createUser(): void {
    if (!this.newUser.nome || !this.newUser.email || !this.newUser.senha || !this.newUser.role) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    this.databaseService.createUser(this.newUser as any).subscribe({
      next: (user) => {
        this.users.unshift(user);
        this.filterUsers();
        this.showCreateModal = false;
        this.newUser = {};
        alert('Usuário criado com sucesso!');
      },
      error: (error) => {
        console.error('Erro ao criar usuário:', error);
        alert('Erro ao criar usuário');
      }
    });
  }

  updateUser(): void {
    if (!this.editUser.id) return;

    this.databaseService.updateUser(this.editUser.id, this.editUser as any).subscribe({
      next: (user) => {
        const index = this.users.findIndex(u => u.id === user.id);
        if (index !== -1) {
          this.users[index] = user;
          this.filterUsers();
        }
        this.showEditModal = false;
        this.editUser = {};
        alert('Usuário atualizado com sucesso!');
      },
      error: (error) => {
        console.error('Erro ao atualizar usuário:', error);
        alert('Erro ao atualizar usuário');
      }
    });
  }

  deleteUser(user: User): void {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${user.nome}"?`)) {
      return;
    }

    if (!user.id) return;

    this.databaseService.deleteUser(user.id).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== user.id);
        this.filterUsers();
        alert('Usuário excluído com sucesso!');
      },
      error: (error) => {
        console.error('Erro ao excluir usuário:', error);
        alert('Erro ao excluir usuário');
      }
    });
  }

  // Filtering and Search
  filterUsers(): void {
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = !this.searchTerm || 
        user.nome.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(this.searchTerm.toLowerCase());

      return matchesSearch;
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.filterUsers();
  }

  // Modal Management
  openCreateModal(): void {
    this.showCreateModal = true;
    this.newUser = {
      role: UserRole.USUARIO,
      ativo: true
    };
  }

  openEditModal(user: User): void {
    this.editUser = { ...user };
    this.showEditModal = true;
  }

  closeModals(): void {
    this.showCreateModal = false;
    this.showEditModal = false;
    this.newUser = {};
    this.editUser = {};
  }

  // Utility Methods
  getRoleLabel(role: string): string {
    const labels: { [key: string]: string } = {
      [UserRole.ADMIN]: 'Administrador',
      [UserRole.USUARIO]: 'Usuário'
    };
    return labels[role] || role;
  }

  getRoleColor(role: string): string {
    const colors: { [key: string]: string } = {
      [UserRole.ADMIN]: '#ef4444',
      [UserRole.USUARIO]: '#3b82f6'
    };
    return colors[role] || '#6b7280';
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  // Permissions
  canManageUsers(): boolean {
    return this.authService.isAdmin();
  }

  canDeleteUsers(): boolean {
    return this.authService.isAdmin();
  }

  // Toggle user status
  toggleUserStatus(user: User): void {
    if (!user.id) return;

    const newStatus = !user.ativo;
    this.databaseService.updateUser(user.id, { ativo: newStatus } as any).subscribe({
      next: (updatedUser) => {
        const index = this.users.findIndex(u => u.id === updatedUser.id);
        if (index !== -1) {
          this.users[index] = updatedUser;
          this.filterUsers();
        }
        alert(`Status do usuário alterado para: ${newStatus ? 'Ativo' : 'Inativo'}`);
      },
      error: (error) => {
        console.error('Erro ao alterar status:', error);
        alert('Erro ao alterar status do usuário');
      }
    });
  }
}

