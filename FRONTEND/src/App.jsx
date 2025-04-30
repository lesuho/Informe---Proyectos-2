import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TaskProvider } from './context/TasksContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthGuard from './guards/AuthGuard';
import HomePage from './pages/HomePage';
import TasksPage from './pages/TasksPage';
import TaskFormPage from './pages/TaskFormPage';
import ProgressPage from './pages/ProgressPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Navbar from './components/Navbar';

function App() {
  return (
    <AuthProvider>
      <TaskProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<AuthGuard><HomePage /></AuthGuard>} />
            <Route path="/tasks" element={<AuthGuard><TasksPage /></AuthGuard>} />
            <Route path="/tasks/new" element={<AuthGuard><TaskFormPage /></AuthGuard>} />
            <Route path="/tasks/:id" element={<AuthGuard><TaskFormPage /></AuthGuard>} />
            <Route path="/progress" element={<AuthGuard><ProgressPage /></AuthGuard>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </BrowserRouter>
      </TaskProvider>
    </AuthProvider>
  );
}

export default App;