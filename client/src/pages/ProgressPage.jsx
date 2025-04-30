import { useEffect, useState } from 'react';
import { useTasks } from '../context/TasksContext';
import ProgressPanel from '../components/ProgressPanel';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

function ProgressPage() {
    const { tasks, getTasks } = useTasks();
    const [selectedPeriod, setSelectedPeriod] = useState('week');
    const [completedTasks, setCompletedTasks] = useState([]);

    useEffect(() => {
        getTasks();
    }, []);

    useEffect(() => {
        const now = dayjs();
        let startDate;

        switch (selectedPeriod) {
            case 'week':
                startDate = now.subtract(7, 'day');
                break;
            case 'month':
                startDate = now.subtract(30, 'day');
                break;
            case 'year':
                startDate = now.subtract(365, 'day');
                break;
            default:
                startDate = now.subtract(7, 'day');
        }

        const filteredTasks = tasks.filter(task => 
            task.completed && 
            dayjs(task.completedAt).isAfter(startDate)
        );

        setCompletedTasks(filteredTasks);
    }, [tasks, selectedPeriod]);

    const calculateProductivity = () => {
        const totalTasks = tasks.length;
        const completed = completedTasks.length;
        return totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;
    };

    const getAverageCompletionTime = () => {
        if (completedTasks.length === 0) return 0;
        
        const totalTime = completedTasks.reduce((acc, task) => {
            const completionTime = dayjs(task.completedAt).diff(dayjs(task.createdAt), 'hour');
            return acc + completionTime;
        }, 0);

        return Math.round(totalTime / completedTasks.length);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-zinc-800 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text mb-4 md:mb-0">
                        Progreso
                    </h1>
                    <div className="flex gap-2 bg-zinc-800 p-1 rounded-lg">
                        <button
                            className={`px-4 py-2 rounded-md transition-all duration-300 ${
                                selectedPeriod === 'week' 
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                                    : 'text-gray-400 hover:text-white'
                            }`}
                            onClick={() => setSelectedPeriod('week')}
                        >
                            Semana
                        </button>
                        <button
                            className={`px-4 py-2 rounded-md transition-all duration-300 ${
                                selectedPeriod === 'month' 
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                                    : 'text-gray-400 hover:text-white'
                            }`}
                            onClick={() => setSelectedPeriod('month')}
                        >
                            Mes
                        </button>
                        <button
                            className={`px-4 py-2 rounded-md transition-all duration-300 ${
                                selectedPeriod === 'year' 
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                                    : 'text-gray-400 hover:text-white'
                            }`}
                            onClick={() => setSelectedPeriod('year')}
                        >
                            Año
                        </button>
                    </div>
                </div>

                {/* Panel de Progreso */}
                <div className="mb-8">
                    <ProgressPanel />
                </div>

                {/* Estadísticas Detalladas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-zinc-800 p-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300">
                        <h3 className="text-lg font-semibold mb-2 text-gray-300">Productividad</h3>
                        <p className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-500 text-transparent bg-clip-text">
                            {calculateProductivity()}%
                        </p>
                    </div>
                    <div className="bg-zinc-800 p-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300">
                        <h3 className="text-lg font-semibold mb-2 text-gray-300">Tareas Completadas</h3>
                        <p className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
                            {completedTasks.length}
                        </p>
                    </div>
                    <div className="bg-zinc-800 p-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300">
                        <h3 className="text-lg font-semibold mb-2 text-gray-300">Tiempo Promedio</h3>
                        <p className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-500 text-transparent bg-clip-text">
                            {getAverageCompletionTime()}h
                        </p>
                    </div>
                </div>

                {/* Historial de Tareas Completadas */}
                <div className="bg-zinc-800 p-6 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
                        Historial de Tareas Completadas
                    </h2>
                    <div className="space-y-4">
                        {completedTasks.map(task => (
                            <div key={task._id} className="bg-zinc-700 p-6 rounded-lg transform hover:scale-[1.02] transition-all duration-300">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div>
                                        <h3 className="text-xl font-semibold text-white">{task.title}</h3>
                                        <p className="text-gray-400 mt-2">{task.description}</p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-sm text-gray-400">
                                            Completada: {dayjs(task.completedAt).format('DD/MM/YYYY HH:mm')}
                                        </span>
                                        <div className="mt-2 flex gap-2">
                                            <span className="text-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full">
                                                {Math.round(dayjs(task.completedAt).diff(dayjs(task.createdAt), 'hour'))} horas
                                            </span>
                                            <span className="text-sm bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full">
                                                {task.priority}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProgressPage; 