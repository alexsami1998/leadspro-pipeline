import React, { useState, useEffect } from 'react';

interface Webhook {
  id: string;
  name: string;
  url: string;
  isActive: boolean;
  createdAt: string;
}

const Webhooks: React.FC = () => {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/webhooks');
      if (response.ok) {
        const data = await response.json();
        setWebhooks(data);
      }
    } catch (error) {
      console.error('Erro ao carregar webhooks:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Carregando webhooks...</div>;
  }

  return (
    <div>
      <h1>Gerenciar Webhooks</h1>
      <div className="webhooks-container">
        <div className="webhooks-header">
          <h2>Lista de Webhooks</h2>
          <button className="btn-primary">Novo Webhook</button>
        </div>
        
        {webhooks.length === 0 ? (
          <p>Nenhum webhook encontrado. Clique em "Novo Webhook" para começar.</p>
        ) : (
          <div className="webhooks-grid">
            {webhooks.map((webhook) => (
              <div key={webhook.id} className="webhook-card">
                <h3>{webhook.name}</h3>
                <p>URL: {webhook.url}</p>
                <p>Status: {webhook.isActive ? 'Ativo' : 'Inativo'}</p>
                <p>Criado em: {new Date(webhook.createdAt).toLocaleDateString()}</p>
                <div className="webhook-actions">
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

export default Webhooks;
