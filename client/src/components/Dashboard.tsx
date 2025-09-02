import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Bem-vindo ao LeadPro! Aqui você pode gerenciar seus leads e acompanhar o progresso.</p>
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total de Leads</h3>
          <p className="stat-number">0</p>
        </div>
        <div className="stat-card">
          <h3>Leads Ativos</h3>
          <p className="stat-number">0</p>
        </div>
        <div className="stat-card">
          <h3>Conversões</h3>
          <p className="stat-number">0</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
