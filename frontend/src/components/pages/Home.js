import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Home = () => {
  const { user } = useContext(AuthContext);

  return (
    <div style={homeStyle}>
      <h1 style={titleStyle}>Bienvenido a Smarth Task</h1>
      <p style={subtitleStyle}>
        Una aplicación simple para gestionar tus tareas diarias
      </p>
      
      {user ? (
        <div style={buttonContainerStyle}>
          <Link to="/tasks" style={buttonStyle}>
            Ver Mis Tareas
          </Link>
          <Link to="/tasks/new" style={buttonStyle}>
            Crear Nueva Tarea
          </Link>
        </div>
      ) : (
        <div style={buttonContainerStyle}>
          <Link to="/login" style={buttonStyle}>
            Iniciar Sesión
          </Link>
          <Link to="/register" style={buttonStyle}>
            Registrarse
          </Link>
        </div>
      )}
      
      <div style={featuresStyle}>
        <div style={featureCardStyle}>
          <h3 style={featureTitleStyle}>Organiza tus tareas</h3>
          <p>Crea, edita y elimina tareas fácilmente</p>
        </div>
        
        <div style={featureCardStyle}>
          <h3 style={featureTitleStyle}>Comparte con otros</h3>
          <p>Comparte tareas con amigos o compañeros de trabajo</p>
        </div>
        
        <div style={featureCardStyle}>
          <h3 style={featureTitleStyle}>Visualiza tu progreso</h3>
          <p>Monitorea el avance de tus tareas con gráficos intuitivos</p>
        </div>
      </div>
    </div>
  );
};

// Estilos
const homeStyle = {
  textAlign: 'center',
  padding: '50px 0'
};

const titleStyle = {
  fontSize: '3rem',
  marginBottom: '20px',
  color: 'var(--text-color)'
};

const subtitleStyle = {
  fontSize: '1.5rem',
  marginBottom: '40px',
  color: 'var(--light-text)'
};

const buttonContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  gap: '20px',
  marginBottom: '50px'
};

const buttonStyle = {
  backgroundColor: 'var(--accent-color)',
  color: 'var(--light-text)',
  padding: '12px 24px',
  borderRadius: '5px',
  textDecoration: 'none',
  fontWeight: 'bold',
  transition: 'background-color 0.3s ease'
};

const featuresStyle = {
  display: 'flex',
  justifyContent: 'center',
  gap: '30px',
  flexWrap: 'wrap',
  marginTop: '50px'
};

const featureCardStyle = {
  backgroundColor: 'var(--secondary-color)',
  padding: '30px',
  borderRadius: '8px',
  width: '300px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
};

const featureTitleStyle = {
  color: 'var(--text-color)',
  marginBottom: '15px'
};

export default Home;