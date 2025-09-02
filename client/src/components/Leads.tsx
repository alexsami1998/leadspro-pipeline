import React, { useState, useEffect } from 'react';

interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  stage: string;
  createdAt: string;
}

const Leads: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/leads');
      if (response.ok) {
        const data = await response.json();
        setLeads(data);
      }
    } catch (error) {
      console.error('Erro ao carregar leads:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Carregando leads...</div>;
  }

  return (
    <div>
      <h1>Gerenciar Leads</h1>
      <div className="leads-container">
        <div className="leads-header">
          <h2>Lista de Leads</h2>
          <button className="btn-primary">Novo Lead</button>
        </div>
        
        {leads.length === 0 ? (
          <p>Nenhum lead encontrado. Clique em "Novo Lead" para começar.</p>
        ) : (
          <div className="leads-grid">
            {leads.map((lead) => (
              <div key={lead.id} className="lead-card">
                <h3>{lead.name}</h3>
                {lead.email && <p>Email: {lead.email}</p>}
                {lead.phone && <p>Telefone: {lead.phone}</p>}
                {lead.company && <p>Empresa: {lead.company}</p>}
                <p>Estágio: {lead.stage}</p>
                <p>Criado em: {new Date(lead.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leads;
