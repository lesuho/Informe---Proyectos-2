import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import NotificationIcon from '../notifications/NotificationIcon';
import { Menu, Transition } from '@headlessui/react';
import ThemeToggle from '../ThemeToggle';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="navbar sticky top-0 z-50 py-3 shadow-md">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-primary-600 dark:text-primary-400">
          Smarth Task
        </Link>
        
        <div className="flex items-center space-x-4">
          {user && (
            <>
              <NotificationIcon />
              <ThemeToggle />
            </>
          )}
          
          <ul className="flex items-center space-x-4">
            {user ? (
              <>
                <li>
                  <Link 
                    to="/tasks" 
                    className="navbar-link flex items-center px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    Mis Tareas
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/progress" 
                    className="navbar-link flex items-center px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Progreso
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/chat" 
                    className="navbar-link flex items-center px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    Chat
                  </Link>
                </li>
                
                <li className="relative">
                  <Menu as="div" className="relative inline-block text-left">
                    <Menu.Button className="navbar-link flex items-center px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors">
                      <div className="flex items-center space-x-2 text-content">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="text-primary-600 dark:text-primary-400"><path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/></svg>
                        <span className="font-medium">{user.name || user.email}</span>
                      </div>
                      <svg className="w-4 h-4 ml-1 text-content-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </Menu.Button>
                    
                    <Transition
                      as={React.Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-200 dark:divide-gray-700 rounded-md bg-white dark:bg-dark-bg-secondary shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                        <div className="px-1 py-1">
                          {user.isAdmin && (
                            <>
                              <Menu.Item>
                                {({ active }) => (
                                  <Link
                                    to="/roles"
                                    className={`${active ? 'bg-primary-500 text-white' : 'text-content-primary'} group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                  >
                                    Gestión de Roles
                                  </Link>
                                )}
                              </Menu.Item>
                              <Menu.Item>
                                {({ active }) => (
                                  <Link
                                    to="/users/roles"
                                    className={`${active ? 'bg-primary-500 text-white' : 'text-content-primary'} group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                  >
                                    Asignar Roles
                                  </Link>
                                )}
                              </Menu.Item>
                            </>
                          )}
                           <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={logout}
                                className={`${active ? 'bg-red-500 text-white' : 'text-red-600 dark:text-red-400'} group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium`}
                              >
                                Cerrar Sesión
                              </button>
                            )}
                          </Menu.Item>
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link 
                    to="/login" 
                    className="btn btn-primary"
                  >
                    Iniciar Sesión
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/register" 
                    className="btn btn-secondary"
                  >
                    Registrarse
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;