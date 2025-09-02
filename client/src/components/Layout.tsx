import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const Layout: React.FC = () => {
  return (
    <div className="app-grid">
      <aside className="sidebar">
        <h2>LeadPro</h2>
        <nav>
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/leads">Leads</NavLink>
          <NavLink to="/users">Usuários</NavLink>
          <NavLink to="/webhooks">Webhooks</NavLink>
        </nav>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
