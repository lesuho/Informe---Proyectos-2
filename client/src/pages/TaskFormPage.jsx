import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTasks } from '../context/TasksContext';
import TaskForm from '../components/TaskForm';
import { toast } from 'react-toastify';

const TaskFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getTask } = useTasks();
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadTask = async () => {
            try {
                if (id && id !== 'new') {
                    const taskData = await getTask(id);
                    console.log('Task loaded:', taskData);
                    if (!taskData) {
                        toast.error('Tarea no encontrada');
                        navigate('/tasks');
                        return;
                    }
                    setTask(taskData);
                } else {
                    setTask(null);
                }
            } catch (error) {
                console.error('Error al cargar la tarea:', error);
                toast.error('Error al cargar la tarea');
                navigate('/tasks');
            } finally {
                setLoading(false);
            }
        };

        loadTask();
    }, [id, getTask, navigate]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-100px)]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return <TaskForm task={task} />;
};

export default TaskFormPage;