import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import SubtaskList from '../components/tasks/SubtaskList';
import { ToastContainer } from 'react-toastify';

// Creamos una instancia del mock adapter
const mock = new MockAdapter(axios);

// Mock de localStorage
const localStorageMock = (() => {
  let store = {
    user: JSON.stringify({ token: 'fake-token' })
  };
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    }
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('SubtaskList Component', () => {
  const taskId = 'task-1';
  const initialSubtasks = [
    { _id: 'sub-1', title: 'Subtarea 1', completed: false },
    { _id: 'sub-2', title: 'Subtarea 2', completed: true },
  ];

  beforeEach(() => {
    // Reseteamos el historial del mock antes de cada prueba
    mock.reset();
  });

  it('should fetch and display subtasks on initial render', async () => {
    // Mock de la llamada GET inicial
    mock.onGet(`/api/tasks/${taskId}`).reply(200, {
      subtasks: initialSubtasks,
    });

    render(
      <>
        <SubtaskList taskId={taskId} canEdit={true} />
        <ToastContainer />
      </>
    );

    // Esperamos a que se complete la carga inicial
    await waitFor(() => {
      expect(screen.queryByText('Cargando subtareas...')).not.toBeInTheDocument();
    });

    // Verificamos que las subtareas aparezcan
    expect(screen.getByText('Subtarea 1')).toBeInTheDocument();
    expect(screen.getByText('Subtarea 2')).toBeInTheDocument();
    // Verificamos que una esté tachada y la otra no
    expect(screen.getByText('Subtarea 2')).toHaveClass('line-through');
  });

  it('should allow adding a new subtask', async () => {
    // Mock de la llamada GET inicial (sin subtareas)
    mock.onGet(`/api/tasks/${taskId}`).reply(200, { subtasks: [] });
    
    // Mock de la llamada POST para añadir
    const newSubtask = { _id: 'sub-3', title: 'Nueva Subtarea', completed: false };
    mock.onPost(`/api/tasks/${taskId}/subtasks`).reply(200, {
      subtasks: [newSubtask]
    });

    render(
      <>
        <SubtaskList taskId={taskId} canEdit={true} />
        <ToastContainer />
      </>
    );

    // Esperamos a que se complete la carga inicial
    await waitFor(() => {
      expect(screen.queryByText('Cargando subtareas...')).not.toBeInTheDocument();
    });

    // 1. El usuario hace clic en "Añadir"
    const addButton = screen.getByText('Añadir');
    fireEvent.click(addButton);

    // 2. Rellena el input y envía el formulario
    const input = screen.getByPlaceholderText('Nueva subtarea...');
    const submitButton = screen.getByText('Añadir');
    
    fireEvent.change(input, { target: { value: 'Nueva Subtarea' } });
    fireEvent.click(submitButton);
    
    // 3. Verificamos que la nueva subtarea aparece en la lista
    await waitFor(() => {
      expect(screen.getByText('Nueva Subtarea')).toBeInTheDocument();
    });
  });
  
  it('should display a message when there are no subtasks', async () => {
    mock.onGet(`/api/tasks/${taskId}`).reply(200, { subtasks: [] });

    render(<SubtaskList taskId={taskId} canEdit={false} />);

    // Esperamos a que se complete la carga inicial
    await waitFor(() => {
      expect(screen.queryByText('Cargando subtareas...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('No hay subtareas')).toBeInTheDocument();
  });
}); 