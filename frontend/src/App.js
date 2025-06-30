import React, { useContext, useEffect } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { useTheme } from './context/ThemeContext';
import './styles/main.css';
import { SocketProvider } from './context/SocketContext';

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
import NotificationsPage from './pages/NotificationsPage';
import NotificationDetail from './components/notifications/NotificationDetail';
import ChatPage from './pages/ChatPage';

// Importar componentes de roles y permisos
import RoleList from './components/roles/RoleList';
import UserRoleManager from './components/roles/UserRoleManager';

// Componente para manejar la lógica de rutas
const RouteManager = ({ isGuest = false }) => {
  const { user, loading } = useContext(AuthContext);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-dark-bg-primary">
        <div className="text-gray-700 dark:text-gray-300">Cargando...</div>
      </div>
    );
  }
  
  if (isGuest && user) {
    // Si es una ruta de invitado y el usuario está logueado, redirigir a la home
    return <Navigate to="/tasks" replace />;
  }

  if (!isGuest && !user) {
    // Si es una ruta protegida y el usuario no está logueado, redirigir al login
    return <Navigate to="/login" replace />;
  }
  
  // Si las condiciones se cumplen, renderizar el contenido de la ruta
  return <Outlet />;
};

// Componente principal
function App() {
  return (
    <NotificationProvider>
      <SocketProvider>
        <div className="transition-colors duration-200">
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
          toastClassName={() => "relative flex p-4 mb-4 min-h-16 rounded-md justify-between overflow-hidden cursor-pointer bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg"}
          bodyClassName={() => "text-sm font-normal text-gray-900 dark:text-white"}
          progressClassName="bg-blue-500"
          progressStyle={{ background: 'rgb(59, 130, 246)' }}
        />
        
          <main className="container mx-auto px-4 py-8 text-content">
          <Routes>
              {/* Rutas Públicas y de Invitado */}
            <Route path="/" element={<Home />} />
              <Route element={<RouteManager isGuest />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
              </Route>

              {/* Rutas Protegidas */}
              <Route element={<RouteManager />}>
                <Route path="/tasks" element={<TaskList />} />
                <Route path="/tasks/new" element={<TaskForm />} />
                <Route path="/tasks/:id" element={<TaskDetail />} />
                <Route path="/tasks/:id/edit" element={<TaskForm />} />
                <Route path="/progress" element={<Progress />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/roles" element={<RoleList />} />
                <Route path="/users/roles" element={<UserRoleManager />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/notifications/:id" element={<NotificationDetail />} />
              </Route>
              
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
      </SocketProvider>
    </NotificationProvider>
  );
}

export default App;