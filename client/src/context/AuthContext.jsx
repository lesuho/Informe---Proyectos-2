import { createContext, useState, useContext, useEffect } from "react";
import { registerRequest, loginRequest, verifyTokenRequest } from '../api/auth'
import axios from "../api/axios";

export const AuthContext = createContext()

export const useAuth = () => {
    const context = useContext(AuthContext)
    if(!context) {
        throw new Error("useAuth must be within an AuthProvider");
    }
    return context;
}

export const AuthProvider = ({children}) => { 
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (errors.length > 0) {
            const timer = setTimeout(() => {
                setErrors([]);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [errors])
    
    const signup = async (userData) => {
        try {
            const res = await registerRequest(userData);
            const { token, user } = res.data;
            localStorage.setItem("token", token);
            setUser(user);
            setIsAuthenticated(true);
            setErrors([]);
        } catch (error) {
            console.error("Error en signup:", error);
            if (error.response) {
                if (Array.isArray(error.response.data)) {
                    setErrors(error.response.data);
                } else if (error.response.data.message) {
                    setErrors([error.response.data.message]);
                } else {
                    setErrors(["Error desconocido al registrar usuario"]);
                }
            } else {
                setErrors(["Error de conexión al servidor"]);
            }
        }
    };

    const signin = async (userData) => {
        try {
            const res = await loginRequest(userData);
            const { token, user } = res.data;
            localStorage.setItem("token", token);
            setUser(user);
            setIsAuthenticated(true);
            setErrors([]);
        } catch (error) {
            console.error("Error en signin:", error);
            if (error.response) {
                if (Array.isArray(error.response.data)) {
                    setErrors(error.response.data);
                } else if (error.response.data.message) {
                    setErrors([error.response.data.message]);
                } else {
                    setErrors(["Error desconocido al iniciar sesión"]);
                }
            } else {
                setErrors(["Error de conexión al servidor"]);
            }
        }
    }

    const logout = () => {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        setUser(null);
    }

    useEffect(() => {
        const checkLogin = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setIsAuthenticated(false);
                setLoading(false);
                return;
            }

            try {
                const res = await verifyTokenRequest();
                if (!res.data) {
                    setIsAuthenticated(false);
                    return;
                }
                setIsAuthenticated(true);
                setUser(res.data);
            } catch (error) {
                console.error("Error al verificar token:", error);
                setIsAuthenticated(false);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkLogin();
    }, [])

    return (
        <AuthContext.Provider value={{
            signup,
            signin,
            logout,
            loading,
            user,
            isAuthenticated,
            errors
        }}>
            {children}
        </AuthContext.Provider>    
    )
}