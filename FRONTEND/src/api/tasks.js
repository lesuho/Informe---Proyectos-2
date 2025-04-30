import axios from './axios';

export const getTasksRequest = () => axios.get('/tasks');

export const getTaskRequest = (id) => axios.get(`/tasks/${id}`);

export const createTaskRequest = (task) => axios.post('/tasks', task);

export const updateTaskRequest = (id, task) => axios.put(`/tasks/${id}`, task);

export const deleteTaskRequest = (id) => axios.delete(`/tasks/${id}`);

export const shareTaskRequest = (taskId, email, role) => 
    axios.post(`/tasks/${taskId}/share`, { email, role });

export const removeShareRequest = (taskId, userId) => 
    axios.delete(`/tasks/${taskId}/share/${userId}`);
