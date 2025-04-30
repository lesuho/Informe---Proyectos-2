import { useState } from "react";
import { useTasks } from "../context/TasksContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const TaskShare = ({ taskId }) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("viewer");
  const [loading, setLoading] = useState(false);
  const { shareTask } = useTasks();
  const { user } = useAuth();

  const handleShare = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Por favor ingresa un correo electrónico");
      return;
    }

    try {
      setLoading(true);
      await shareTask(taskId, { email, role });
      toast.success("Tarea compartida exitosamente");
      setEmail("");
    } catch (error) {
      toast.error(error.message || "Error al compartir la tarea");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-800 p-6 rounded-xl shadow-lg">
      <h3 className="text-xl font-semibold text-white mb-4">Compartir tarea</h3>
      <form onSubmit={handleShare} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Correo electrónico
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-zinc-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ejemplo@correo.com"
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
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-purple-500 hover:to-blue-500 text-white px-6 py-2 rounded-lg transition-all duration-300 disabled:opacity-50"
        >
          {loading ? 'Compartiendo...' : 'Compartir'}
        </button>
      </form>
    </div>
  );
};

export default TaskShare; 