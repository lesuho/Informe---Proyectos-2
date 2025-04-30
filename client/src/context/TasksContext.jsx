import { createContext, useContext, useState } from "react";
import { getTasksRequest, createTaskRequest, deleteTaskRequest, getTaskRequest, updateTaskRequest } from "../api/tasks";
import { useAuth } from "./AuthContext";
import axios from "../api/axios";

const TaskContext = createContext(); 

export const useTasks = () => {
    const context = useContext(TaskContext);
    
    if (!context) {
        throw new Error('useTasks must be used within a TaskProvider');
    }
    
    return context;
}

export function TaskProvider({children}) {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    
    const getTasks = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await getTasksRequest();
            setTasks(res.data);
        } catch (error) {
            console.error("Error al obtener tareas:", error);
            const errorMessage = error.response?.data?.message || 'Error al obtener las tareas';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    const createTask = async (task) => {
        try {
            setLoading(true);
            setError(null);
            const res = await createTaskRequest(task);
            setTasks([...tasks, res.data]);
            return res.data;
        } catch (error) {
            console.error("Error al crear tarea:", error);
            const errorMessage = error.response?.data?.message || 'Error al crear la tarea';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    const deleteTask = async (id) => {
        try {
            await deleteTaskRequest(id);
            setTasks(tasks.filter(task => task._id !== id));
        } catch (error) {
            throw error.response?.data?.message || 'Error al eliminar la tarea';
        }
    }

    const getTask = async (id) => {
        try {
            const res = await getTaskRequest(id);
            return res.data;
        } catch (error) {
            console.error('Error al obtener la tarea:', error);
            throw error;
        }
    }

    const updateTask = async (id, task) => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            const res = await axios.put(
                `/tasks/${id}`,
                task,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            setTasks(tasks.map(task => 
                task._id === id ? res.data : task
            ));
            return res.data;
        } catch (error) {
            console.error("Error al actualizar tarea:", error);
            const errorMessage = error.response?.data?.message || "Error al actualizar la tarea";
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const shareTask = async (taskId, { email, role }) => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            const res = await axios.post(
                `/tasks/${taskId}/share`,
                { email, role },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            setTasks(tasks.map(task => 
                task._id === taskId ? res.data : task
            ));
            return res.data;
        } catch (error) {
            console.error("Error al compartir tarea:", error);
            const errorMessage = error.response?.data?.message || "Error al compartir la tarea";
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const removeShare = async (taskId, userId) => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            const res = await axios.delete(
                `/tasks/${taskId}/share/${userId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            setTasks(tasks.map(task => 
                task._id === taskId ? res.data : task
            ));
            return res.data;
        } catch (error) {
            console.error("Error al remover compartido:", error);
            const errorMessage = error.response?.data?.message || "Error al remover el compartido";
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <TaskContext.Provider value={{
            tasks,
            loading,
            error,
            getTasks,
            createTask,
            deleteTask,
            getTask,
            updateTask,
            shareTask,
            removeShare
        }}>{children}</TaskContext.Provider>
    )
}
