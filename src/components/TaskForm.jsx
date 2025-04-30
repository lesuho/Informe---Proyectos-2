import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTask } from '../context/TaskContext';

function TaskForm() {
    const { register, handleSubmit, setValue } = useForm();
    const { createTask, getTask, updateTask } = useTask();
    const navigate = useNavigate();
    const params = useParams();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function loadTask() {
            if (params.id) {
                const task = await getTask(params.id);
                setValue('title', task.title);
                setValue('description', task.description);
                setValue('date', task.date?.split('T')[0]);
                setValue('priority', task.priority);
            }
        }
        loadTask();
    }, []);

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            
            if (params.id) {
                await updateTask(params.id, data);
            } else {
                await createTask(data);
            }
            
            navigate('/tasks');
        } catch (error) {
            console.error('Error al guardar la tarea:', error);
            if (error.response) {
                toast.error(error.response.data.message || 'Error al guardar la tarea');
            } else if (error.request) {
                toast.error('Error de conexión. Por favor, verifica tu conexión a internet');
            } else {
                toast.error(error.message || 'Error al guardar la tarea');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-100px)] items-center justify-center">
            <div className="bg-zinc-800 max-w-md w-full p-10 rounded-md">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <label htmlFor="title">Título</label>
                    <input
                        type="text"
                        placeholder="Título"
                        {...register("title")}
                        className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2"
                        autoFocus
                    />

                    <label htmlFor="description">Descripción</label>
                    <textarea
                        rows="3"
                        placeholder="Descripción"
                        {...register("description")}
                        className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2"
                    />

                    <label htmlFor="date">Fecha límite</label>
                    <input
                        type="date"
                        {...register("date")}
                        className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2"
                    />

                    <label htmlFor="priority">Prioridad</label>
                    <select
                        {...register("priority")}
                        className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2"
                    >
                        <option value="low">Baja</option>
                        <option value="medium">Media</option>
                        <option value="high">Alta</option>
                    </select>

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md text-white focus:outline-none disabled:opacity-50"
                    >
                        {loading ? "Cargando..." : params.id ? "Actualizar Tarea" : "Crear Tarea"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default TaskForm;