import React from 'react';
import { useRouteError } from 'react-router-dom';

const ErrorBoundary: React.FC = () => {
  const error = useRouteError() as any;

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Oops! Algo deu errado.</h1>
      <p>Desculpe, ocorreu um erro inesperado.</p>
      {error?.status && (
        <p>Status: {error.status}</p>
      )}
      {error?.message && (
        <p>Mensagem: {error.message}</p>
      )}
      <button 
        onClick={() => window.location.href = '/'}
        style={{
          background: '#007bff',
          color: 'white',
          border: 'none',
          padding: '0.75rem 1.5rem',
          borderRadius: '0.5rem',
          cursor: 'pointer',
          marginTop: '1rem'
        }}
      >
        Voltar ao Dashboard
      </button>
    </div>
  );
};

export default ErrorBoundary;
