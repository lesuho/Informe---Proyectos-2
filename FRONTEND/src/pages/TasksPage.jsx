import { useEffect, useState } from 'react';
import { useTasks } from '../context/TasksContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

function TasksPage() {
    const { tasks, loading, error, getTasks } = useTasks();
    const { user } = useAuth();
    const [showForm, setShowForm] = useState(false);
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date');
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPriority, setSelectedPriority] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');

    useEffect(() => {
        getTasks();
    }, []);

    useEffect(() => {
        if (filter === 'all') {
            setFilteredTasks(tasks);
        } else if (filter === 'my-tasks') {
            setFilteredTasks(tasks.filter(task => task.user._id === user?.id));
        } else if (filter === 'shared') {
            setFilteredTasks(tasks.filter(task => 
                task.sharedWith?.some(share => share.user._id === user?.id)
            ));
        }
    }, [tasks, filter, user?.id]);

    const sortedAndFilteredTasks = filteredTasks
        .filter(task => {
            const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                task.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
            const matchesStatus = selectedStatus === 'all' || 
                                (selectedStatus === 'completed' && task.completed) ||
                                (selectedStatus === 'pending' && !task.completed);
            return matchesSearch && matchesPriority && matchesStatus;
        })
        .sort((a, b) => {
            if (sortBy === 'date') {
                return new Date(b.createdAt) - new Date(a.createdAt);
            } else if (sortBy === 'priority') {
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            }
            return 0;
        });

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-100px)]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-100px)]">
                <div className="bg-red-500 text-white p-4 rounded-lg">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-zinc-800 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text mb-4 md:mb-0">
                        Mis Tareas
                    </h1>
                    <div className="flex flex-wrap gap-4">
                        <Link
                            to="/tasks/new"
                            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-purple-500 hover:to-blue-500 text-white px-6 py-2 rounded-lg transition-all duration-300 flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Nueva Tarea
                        </Link>
                    </div>
                </div>

                {/* Filtros y Ordenamiento */}
                <div className="bg-zinc-800 p-6 rounded-xl shadow-lg mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Filtrar por:</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setFilter('all')}
                                    className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                                        filter === 'all' 
                                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                                            : 'bg-zinc-700 text-gray-300 hover:bg-zinc-600'
                                    }`}
                                >
                                    Todas
                                </button>
                                <button
                                    onClick={() => setFilter('my-tasks')}
                                    className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                                        filter === 'my-tasks' 
                                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                                            : 'bg-zinc-700 text-gray-300 hover:bg-zinc-600'
                                    }`}
                                >
                                    Mis Tareas
                                </button>
                                <button
                                    onClick={() => setFilter('shared')}
                                    className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                                        filter === 'shared' 
                                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                                            : 'bg-zinc-700 text-gray-300 hover:bg-zinc-600'
                                    }`}
                                >
                                    Compartidas
                                </button>
                            </div>
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Ordenar por:</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setSortBy('date')}
                                    className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                                        sortBy === 'date' 
                                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                                            : 'bg-zinc-700 text-gray-300 hover:bg-zinc-600'
                                    }`}
                                >
                                    Fecha
                                </button>
                                <button
                                    onClick={() => setSortBy('priority')}
                                    className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                                        sortBy === 'priority' 
                                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                                            : 'bg-zinc-700 text-gray-300 hover:bg-zinc-600'
                                    }`}
                                >
                                    Prioridad
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lista de Tareas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedAndFilteredTasks.length > 0 ? (
                        sortedAndFilteredTasks.map(task => (
                            <TaskCard key={task._id} task={task} />
                        ))
                    ) : (
                        <div className="col-span-full bg-zinc-800 p-8 rounded-xl text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <p className="text-gray-400 text-lg">No hay tareas para mostrar</p>
                            <p className="text-gray-500 text-sm mt-2">Intenta cambiar los filtros o crear una nueva tarea</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Formulario */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-zinc-800 p-6 rounded-xl shadow-lg w-full max-w-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
                                Nueva Tarea
                            </h2>
                            <button
                                onClick={() => setShowForm(false)}
                                className="text-gray-400 hover:text-white transition-colors duration-300"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <TaskForm onClose={() => setShowForm(false)} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default TasksPage;