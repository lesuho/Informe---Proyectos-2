import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import Login from '../components/auth/Login';

const MockLogin = () => (
  <AuthProvider>
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  </AuthProvider>
);

describe('Login Component', () => {
  it('should render the login form correctly', () => {
    render(<MockLogin />);
    
    // Verificar que el título esté presente
    expect(screen.getByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument();
    
    // Verificar que los campos de entrada existan
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    
    // Verificar que el botón de envío exista
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
    
    // Verificar que el texto y el enlace para registrarse existan
    expect(screen.getByText(/¿no tienes una cuenta\?/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /regístrate/i })).toBeInTheDocument();
  });
}); 