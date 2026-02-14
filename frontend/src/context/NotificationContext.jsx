import React, { createContext, useContext, useState, useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';
import api from '../api';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [stompClient, setStompClient] = useState(null);

    useEffect(() => {
        if (user) {
            fetchNotifications();
        }
    }, [user]);

    const fetchNotifications = async () => {
        if (!user) return;
        try {
            // Use safe notification endpoint if available, or just mock for now if backend is unstable
            const res = await api.get(`/notifications/user/${user.id}`);
            if (res.data) {
                setNotifications(res.data);
                setUnreadCount(res.data.filter(n => !n.read).length);
            }
        } catch (error) {
            // Silent fail for notifications
            console.warn("Notifications system unavailable");
        }
    };

    const notify = (message, type = "info") => {
        const id = Date.now();
        const notification = { id, message, read: false, date: new Date().toISOString() };
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);

        // Show toast
        if (type === 'error') toast.error(message);
        else if (type === 'success') toast.success(message);
        else toast(message, { icon: '🔔' });
    };

    const markAsRead = async (id) => {
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));

        try {
            await api.put(`/notifications/${id}/read`);
        } catch (error) {
            console.warn("Failed to sync read status");
        }
    };

    const markAllAsRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
        // Sync if needed
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, notify }}>
            {children}
        </NotificationContext.Provider>
    );
};
