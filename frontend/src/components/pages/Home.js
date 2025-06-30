import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FiCheckCircle, FiShare2, FiTrendingUp } from 'react-icons/fi';

const Home = () => {
  const { user } = useContext(AuthContext);

  const FeatureCard = ({ icon, title, children }) => (
    <div className="card text-center p-8">
      <div className="flex justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-content mb-2">{title}</h3>
      <p className="text-content-secondary">{children}</p>
    </div>
  );

  return (
    <div className="text-center py-12 px-4">
      <h1 className="text-5xl font-extrabold text-content mb-4">
        Bienvenido a <span className="text-primary-600 dark:text-primary-400">Smarth Task</span>
      </h1>
      <p className="text-xl text-content-secondary mb-10 max-w-2xl mx-auto">
        Una aplicación simple e intuitiva para gestionar tus tareas diarias y colaborar con tu equipo.
      </p>
      
      {user ? (
        <div className="flex justify-center gap-4 mb-16">
          <Link to="/tasks" className="btn btn-primary text-lg">
            Ver Mis Tareas
          </Link>
          <Link to="/tasks/new" className="btn btn-secondary text-lg">
            Crear Nueva Tarea
          </Link>
        </div>
      ) : (
        <div className="flex justify-center gap-4 mb-16">
          <Link to="/login" className="btn btn-primary text-lg">
            Iniciar Sesión
          </Link>
          <Link to="/register" className="btn btn-secondary text-lg">
            Registrarse
          </Link>
        </div>
      )}
      
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <FeatureCard icon={<FiCheckCircle className="text-green-500 text-4xl"/>} title="Organiza tus tareas">
          Crea, edita y elimina tareas fácilmente con nuestra interfaz amigable.
        </FeatureCard>
        
        <FeatureCard icon={<FiShare2 className="text-blue-500 text-4xl"/>} title="Comparte con otros">
          Invita a amigos o compañeros de trabajo para colaborar en proyectos compartidos.
        </FeatureCard>
        
        <FeatureCard icon={<FiTrendingUp className="text-purple-500 text-4xl"/>} title="Visualiza tu progreso">
          Monitorea el avance de tus proyectos con nuestro tablero Kanban y estadísticas.
        </FeatureCard>
      </div>
    </div>
  );
};

export default Home;