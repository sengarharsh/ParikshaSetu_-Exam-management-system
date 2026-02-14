import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        const storedRole = localStorage.getItem('role');
        const storedUserId = localStorage.getItem('userId');

        if (token && storedRole) {
            try {
                // Try to fetch profile, if fails use stored ID
                const res = await api.get('/api/users/profile');
                setUser(res.data);
            } catch (e) {
                console.warn("Profile fetch failed, using stored session data");
                // Fallback to stored data
                setUser({
                    token,
                    role: storedRole,
                    id: storedUserId ? parseInt(storedUserId) : null,
                    fullName: localStorage.getItem('fullName'),
                    email: localStorage.getItem('email') // Optional if stored
                });
            }
            setRole(storedRole);
        }
        setLoading(false);
    };

    const login = async (token, userRole) => {
        localStorage.setItem('token', token);
        localStorage.setItem('role', userRole);
        setRole(userRole);
        await checkAuth(); // Fetch user details immediately
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setUser(null);
        setRole(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, role, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
