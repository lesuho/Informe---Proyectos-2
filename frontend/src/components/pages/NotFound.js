import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div style={notFoundStyle}>
      <h1 style={titleStyle}>404</h1>
      <h2 style={subtitleStyle}>Página no encontrada</h2>
      <p style={textStyle}>
        La página que estás buscando no existe o ha sido movida.
      </p>
      <Link to="/" style={buttonStyle}>
        Volver al Inicio
      </Link>
    </div>
  );
};

// Estilos
const notFoundStyle = {
  textAlign: 'center',
  padding: '100px 0'
};

const titleStyle = {
  fontSize: '6rem',
  color: 'var(--text-color)',
  marginBottom: '20px'
};

const subtitleStyle = {
  fontSize: '2rem',
  marginBottom: '20px'
};

const textStyle = {
  fontSize: '1.2rem',
  marginBottom: '30px'
};

const buttonStyle = {
  backgroundColor: 'var(--accent-color)',
  color: 'var(--light-text)',
  padding: '12px 24px',
  borderRadius: '5px',
  textDecoration: 'none',
  fontWeight: 'bold',
  display: 'inline-block'
};

export default NotFound;