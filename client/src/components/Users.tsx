import React, { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Carregando usuários...</div>;
  }

  return (
    <div>
      <h1>Gerenciar Usuários</h1>
      <div className="users-container">
        <div className="users-header">
          <h2>Lista de Usuários</h2>
          <button className="btn-primary">Novo Usuário</button>
        </div>
        
        {users.length === 0 ? (
          <p>Nenhum usuário encontrado. Clique em "Novo Usuário" para começar.</p>
        ) : (
          <div className="users-grid">
            {users.map((user) => (
              <div key={user.id} className="user-card">
                <h3>{user.name}</h3>
                <p>Email: {user.email}</p>
                <p>Função: {user.role}</p>
                <p>Criado em: {new Date(user.createdAt).toLocaleDateString()}</p>
                <div className="user-actions">
                  <button className="btn-secondary">Editar</button>
                  <button className="btn-danger">Excluir</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
