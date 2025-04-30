import { useState } from 'react';
import { useTasks } from '../context/TasksContext';
import { useAuth } from '../context/AuthContext';
import { Link } from "react-router-dom";
import ShareTaskModal from './ShareTaskModal';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import TaskShare from "./TaskShare";
import { toast } from 'react-toastify';
import axios from 'axios';
dayjs.extend(utc);

function TaskCard({ task }) {
    const { deleteTask, updateTask, shareTask, removeShare } = useTasks();
    const { user } = useAuth();
    const [showShareModal, setShowShareModal] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isRequestingSuggestion, setIsRequestingSuggestion] = useState(false);

    if (!task || !user) return null;

    const handleDelete = async () => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
            try {
                await deleteTask(task._id);
            } catch (error) {
                console.error("Error al eliminar la tarea:", error);
            }
        }
    };

    const handleToggleDone = async () => {
        try {
            const newCompletedState = !task.completed;
            const updatedTask = await updateTask(task._id, { 
                completed: newCompletedState,
                completedAt: newCompletedState ? new Date().toISOString() : null
            });
            
            if (updatedTask) {
                toast.success(`Tarea ${newCompletedState ? 'completada' : 'pendiente'}`);
            }
        } catch (error) {
            console.error('Error al actualizar la tarea:', error);
            toast.error('Error al actualizar la tarea');
        }
    };

    const handleShare = async (email, role) => {
        try {
            await shareTask(task._id, { email, role });
            setShowShareModal(false);
            toast.success('Tarea compartida exitosamente');
        } catch (error) {
            console.error("Error al compartir la tarea:", error);
            toast.error(error.message || 'Error al compartir la tarea');
        }
    };

    const handleRemoveShare = async (userId) => {
        try {
            await removeShare(task._id, userId);
            toast.success('Usuario removido exitosamente');
        } catch (error) {
            console.error("Error al eliminar el compartido:", error);
            toast.error('Error al remover el usuario');
        }
    };

    const handleApplySuggestions = async () => {
        try {
            await updateTask(task._id, {
                ...task,
                deadline: task.suggestedDeadline,
                priority: task.suggestedPriority
            });
            setShowSuggestions(false);
        } catch (error) {
            console.error('Error al aplicar sugerencias:', error);
        }
    };

    const handleRequestSuggestion = async () => {
        try {
            setIsRequestingSuggestion(true);
            const response = await axios.post(`/api/tasks/${task._id}/suggest`, {}, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.data) {
                await updateTask(task._id, {
                    ...task,
                    suggestedDeadline: response.data.suggestedDeadline,
                    suggestedPriority: response.data.suggestedPriority,
                    suggestionExplanation: response.data.explanation
                });
            }
        } catch (error) {
            console.error('Error al solicitar sugerencia:', error);
        } finally {
            setIsRequestingSuggestion(false);
        }
    };

    const handleApplySuggestion = async (taskId) => {
        try {
            const updatedTask = {
                ...task,
                priority: task.suggestedPriority
            };
            await updateTask(taskId, updatedTask);
            toast.success('Prioridad sugerida aplicada exitosamente');
        } catch (error) {
            console.error('Error al aplicar la sugerencia:', error);
            toast.error('Error al aplicar la prioridad sugerida');
        }
    };

    const isOwner = task.user?._id === user?.id;
    const isEditor = task.sharedWith?.some(share => 
        share.user?._id === user?.id && share.role === 'editor'
    );
    const isViewer = task.sharedWith?.some(share => 
        share.user?._id === user?.id && share.role === 'viewer'
    );
    const canEdit = isOwner || isEditor;
    const canView = isOwner || isEditor || isViewer;

    // Si el usuario no tiene permisos para ver la tarea, no mostrar nada
    if (!canView) return null;

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high':
                return 'bg-red-500/20 text-red-400';
            case 'medium':
                return 'bg-yellow-500/20 text-yellow-400';
            case 'low':
                return 'bg-green-500/20 text-green-400';
            default:
                return 'bg-gray-500/20 text-gray-400';
        }
    };

    const getPriorityText = (priority) => {
        switch (priority) {
            case 'high':
                return 'Alta';
            case 'medium':
                return 'Media';
            case 'low':
                return 'Baja';
            default:
                return priority;
        }
    };

    return (
        <div className="space-y-4">
            <div className="bg-zinc-800 p-6 rounded-xl shadow-lg">
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-semibold text-white mb-2">{task.title}</h3>
                            <p className="text-gray-400 text-sm">
                                Creado por: {task.user?.username || 'Usuario desconocido'}
                                {!isOwner && (
                                    <span className="ml-2 text-blue-400">
                                        (Compartida - {isEditor ? 'Editor' : 'Visor'})
                                    </span>
                                )}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {(canEdit || isEditor) && (
                                <button
                                    onClick={handleToggleDone}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                                        task.completed
                                            ? 'bg-green-500/20 text-green-400'
                                            : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                                    }`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {task.completed ? 'Completada' : 'Completar'}
                                </button>
                            )}
                            {canEdit && (
                                <Link
                                    to={`/tasks/${task._id}`}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all duration-300"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Editar
                                </Link>
                            )}
                            {isOwner && (
                                <>
                                    <button
                                        onClick={() => setShowShareModal(true)}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-all duration-300"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                        </svg>
                                        Compartir
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all duration-300"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Eliminar
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(task.priority)}`}>
                            Prioridad actual: {getPriorityText(task.priority)}
                        </span>
                        {task.suggestedPriority && task.suggestedPriority !== task.priority && (
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(task.suggestedPriority)}`}>
                                Prioridad sugerida: {getPriorityText(task.suggestedPriority)}
                            </span>
                        )}
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-500/20 text-gray-400">
                            Fecha límite: {dayjs(task.deadline).format('DD/MM/YYYY')}
                        </span>
                        {task.completed && (
                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-400">
                                Completada
                            </span>
                        )}
                    </div>

                    <div className="text-gray-300">
                        {task.description}
                    </div>

                    {task.suggestedDeadline && task.suggestedPriority && (
                        <div className="mt-4 p-4 bg-zinc-700 rounded-lg">
                            <h4 className="text-white font-medium mb-2">Sugerencias de la IA:</h4>
                            <div className="flex flex-wrap gap-2 mb-2">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(task.suggestedPriority)}`}>
                                    Prioridad sugerida: {getPriorityText(task.suggestedPriority)}
                                </span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-500/20 text-gray-400">
                                    Fecha sugerida: {dayjs(task.suggestedDeadline).format('DD/MM/YYYY')}
                                </span>
                            </div>
                            {task.suggestionExplanation && (
                                <p className="text-gray-400 text-sm">
                                    {task.suggestionExplanation}
                                </p>
                            )}
                            {canEdit && (
                                <button
                                    onClick={handleApplySuggestions}
                                    className="mt-2 px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all duration-300"
                                >
                                    Aplicar sugerencias
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {showShareModal && (
                <ShareTaskModal
                    task={task}
                    onClose={() => setShowShareModal(false)}
                    onShare={handleShare}
                />
            )}

            {task.sharedWith && task.sharedWith.length > 0 && (
                <div className="bg-zinc-800 p-4 rounded-xl">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Compartida con:</h4>
                    <div className="flex flex-wrap gap-2">
                        {task.sharedWith.map((share) => (
                            <div
                                key={share.user._id}
                                className="flex items-center space-x-2 bg-zinc-700 px-3 py-1 rounded-full"
                            >
                                <span className="text-sm text-white">
                                    {share.user.username}
                                </span>
                                <span className="text-xs text-gray-400">
                                    ({share.role === "viewer" ? "Solo lectura" : "Editor"})
                                </span>
                                {isOwner && (
                                    <button
                                        onClick={() => handleRemoveShare(share.user._id)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default TaskCard;