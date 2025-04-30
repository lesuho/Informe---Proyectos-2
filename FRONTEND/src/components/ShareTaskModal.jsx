import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TasksContext';
import axios from '../api/axios';
import { toast } from 'react-toastify';

function ShareTaskModal({ task, onClose, onShare }) {
    const { user } = useAuth();
    const { shareTask } = useTasks();
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('viewer');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error('Por favor ingresa un correo electrónico');
            return;
        }

        try {
            setLoading(true);
            await onShare(email, role);
            setEmail('');
            setRole('viewer');
        } catch (error) {
            console.error('Error al compartir la tarea:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-zinc-800 p-6 rounded-xl shadow-lg w-full max-w-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
                        Compartir Tarea
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors duration-300"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Correo electrónico
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="ejemplo@correo.com"
                            className="w-full bg-zinc-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Rol
                        </label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full bg-zinc-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="viewer">Solo lectura</option>
                            <option value="editor">Editor</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-300 hover:text-white transition-colors duration-300"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-purple-500 hover:to-blue-500 text-white px-6 py-2 rounded-lg transition-all duration-300 disabled:opacity-50"
                        >
                            {loading ? 'Compartiendo...' : 'Compartir'}
                        </button>
                    </div>
                </form>

                {task.sharedWith?.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-300 mb-4">
                            Compartido con:
                        </h3>
                        <div className="space-y-2">
                            {task.sharedWith.map((share) => (
                                <div key={share.user?._id} className="flex items-center justify-between bg-zinc-700/50 p-3 rounded-lg">
                                    <span className="text-white">{share.user?.username}</span>
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                        share.role === 'editor' 
                                            ? 'bg-blue-500/20 text-blue-400' 
                                            : 'bg-gray-500/20 text-gray-400'
                                    }`}>
                                        {share.role === 'editor' ? 'Editor' : 'Solo lectura'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ShareTaskModal; 