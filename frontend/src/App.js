import React, { useContext, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import './styles/main.css';

// Importar componentes
import Navbar from './components/layout/Navbar';
import Home from './components/pages/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import TaskList from './components/tasks/TaskList';
import TaskForm from './components/tasks/TaskForm';
import TaskDetail from './components/tasks/TaskDetail';
// Eliminar la importación no utilizada
// import ShareTask from './components/tasks/ShareTask';
import Progress from './components/tasks/Progress';
import NotFound from './components/pages/NotFound';

// Componente para rutas protegidas
const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) {
    return <div className="container">Cargando...</div>;
  }
  
  return user ? children : <Navigate to="/login" />;
};

// Componente principal
function App() {
  return (
    <NotificationProvider>
      <div className="min-h-screen bg-white dark:bg-dark-bg-primary text-gray-900 dark:text-dark-text-primary">
        <Navbar />
        
        {/* Configuración del contenedor de notificaciones */}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/tasks" element={<PrivateRoute><TaskList /></PrivateRoute>} />
            <Route path="/tasks/new" element={<PrivateRoute><TaskForm /></PrivateRoute>} />
            <Route path="/tasks/:id" element={<PrivateRoute><TaskDetail /></PrivateRoute>} />
            <Route path="/tasks/:id/edit" element={<PrivateRoute><TaskForm /></PrivateRoute>} />
            <Route path="/progress" element={<PrivateRoute><Progress /></PrivateRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </NotificationProvider>
  );
}

export default App;