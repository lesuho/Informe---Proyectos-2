import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <nav className="bg-gradient-to-r from-zinc-900 to-zinc-800 shadow-lg my-3 flex justify-between items-center py-4 px-8 rounded-lg">
      <Link to="/" className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text hover:from-purple-500 hover:to-blue-500 transition-all duration-300">
        TaskManager
      </Link>

      <ul className="flex items-center gap-x-4">
        {isAuthenticated ? (
          <>
            <li>
              <Link to="/tasks" className="text-gray-300 hover:text-white px-4 py-2 rounded-md hover:bg-zinc-700 transition-all duration-300 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Tareas
              </Link>
            </li>
            <li>
              <Link to="/progress" className="text-gray-300 hover:text-white px-4 py-2 rounded-md hover:bg-zinc-700 transition-all duration-300 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Progreso
              </Link>
            </li>
            <li>
              <span className="text-gray-300 px-4 py-2 rounded-md flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Welcome {user?.username}
              </span>
            </li>
            <li>
              <button
                onClick={() => logout()}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-md transition-all duration-300 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Cerrar Sesión
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login" className="text-gray-300 hover:text-white px-4 py-2 rounded-md hover:bg-zinc-700 transition-all duration-300">
                Iniciar Sesión
              </Link>
            </li>
            <li>
              <Link to="/register" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-purple-500 hover:to-blue-500 text-white px-4 py-2 rounded-md transition-all duration-300">
                Registrarse
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
