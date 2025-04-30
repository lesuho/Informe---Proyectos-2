import { useEffect } from 'react';
import { useTasks } from '../context/TasksContext';
import ProgressPanel from '../components/ProgressPanel';
import TaskCard from '../components/Taskcard';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

function HomePage() {
    const { tasks, getTasks } = useTasks();

    useEffect(() => {
        getTasks();
    }, []);

    // Filtrar tareas urgentes
    const urgentTasks = tasks
        .filter(task => !task.completed && task.priority === 'Urgente')
        .sort((a, b) => dayjs(a.deadline).diff(dayjs(b.deadline)));

    // Filtrar tareas próximas (próximos 3 días)
    const upcomingTasks = tasks
        .filter(task => !task.completed && dayjs(task.deadline).diff(dayjs(), 'day') <= 3)
        .sort((a, b) => dayjs(a.deadline).diff(dayjs(b.deadline)));

    // Calcular estadísticas
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const pendingTasks = totalTasks - completedTasks;

    // Calcular tareas por prioridad
    const tasksByPriority = tasks.reduce((acc, task) => {
        if (!task.completed) {
            acc[task.priority] = (acc[task.priority] || 0) + 1;
        }
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-zinc-800 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text mb-4 md:mb-0">
                        Dashboard
                    </h1>
                    <div className="flex items-center gap-2 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Última actualización: {dayjs().format('DD/MM/YYYY HH:mm')}</span>
                    </div>
                </div>

                {/* Panel de Progreso */}
                <div className="mb-8">
                    <ProgressPanel />
                </div>

                {/* Estadísticas Principales */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-zinc-800 p-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-300">Total de Tareas</h3>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <p className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-500 text-transparent bg-clip-text">
                            {totalTasks}
                        </p>
                    </div>
                    <div className="bg-zinc-800 p-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-300">Tasa de Completado</h3>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-500 text-transparent bg-clip-text">
                            {completionRate}%
                        </p>
                    </div>
                    <div className="bg-zinc-800 p-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-300">Tareas Pendientes</h3>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
                            {pendingTasks}
                        </p>
                    </div>
                </div>

                {/* Distribución de Tareas */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Tareas Urgentes */}
                    <div className="bg-zinc-800 p-6 rounded-xl shadow-lg">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-orange-500 text-transparent bg-clip-text">
                                Tareas Urgentes
                            </h2>
                            <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm">
                                {urgentTasks.length} tareas
                            </span>
                        </div>
                        <div className="space-y-4">
                            {urgentTasks.length > 0 ? (
                                urgentTasks.map(task => (
                                    <TaskCard key={task._id} task={task} />
                                ))
                            ) : (
                                <div className="bg-zinc-700/50 p-6 rounded-lg text-center">
                                    <p className="text-gray-400">No hay tareas urgentes pendientes</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Próximas Tareas */}
                    <div className="bg-zinc-800 p-6 rounded-xl shadow-lg">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
                                Próximas Tareas
                            </h2>
                            <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm">
                                {upcomingTasks.length} tareas
                            </span>
                        </div>
                        <div className="space-y-4">
                            {upcomingTasks.length > 0 ? (
                                upcomingTasks.map(task => (
                                    <TaskCard key={task._id} task={task} />
                                ))
                            ) : (
                                <div className="bg-zinc-700/50 p-6 rounded-lg text-center">
                                    <p className="text-gray-400">No hay tareas próximas en los próximos 3 días</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Distribución por Prioridad */}
                <div className="bg-zinc-800 p-6 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
                        Distribución por Prioridad
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {['Urgente', 'Alta', 'Media', 'Baja'].map(priority => (
                            <div key={priority} className="bg-zinc-700/50 p-4 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-300">{priority}</span>
                                    <span className="text-lg font-semibold text-white">
                                        {tasksByPriority[priority] || 0}
                                    </span>
                                </div>
                                <div className="w-full bg-zinc-600 rounded-full h-2">
                                    <div 
                                        className="h-2 rounded-full"
                                        style={{
                                            width: `${((tasksByPriority[priority] || 0) / pendingTasks) * 100}%`,
                                            backgroundColor: priority === 'Urgente' ? '#ef4444' :
                                                          priority === 'Alta' ? '#f97316' :
                                                          priority === 'Media' ? '#eab308' : '#22c55e'
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HomePage;