import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, User, X } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
// ... existing imports

const Navbar = () => {
    const navigate = useNavigate();
    const { logout, user } = useAuth() || {};
    const { notifications, unreadCount, markAsRead } = useNotification();
    const [showNotifications, setShowNotifications] = useState(false);
    const notifRef = useRef(null);

    const role = localStorage.getItem('role');

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleNotificationClick = (notif) => {
        if (!notif.read) {
            markAsRead(notif.id);
        }
    };

    return (
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 fixed top-0 w-full z-30 flex items-center justify-between px-6 md:pl-80 transition-all duration-300">
            <div className="flex flex-col">
                <h1 className="text-lg font-bold text-slate-800">Dashboard</h1>
                <p className="text-xs text-slate-500 font-medium">Welcome back, {user?.fullName || 'User'}</p>
            </div>
            <div className="flex items-center space-x-4 md:space-x-8">

                {/* Notification Bell */}
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`p-2.5 rounded-xl transition-all duration-200 relative ${showNotifications ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:bg-gray-100 hover:text-slate-600'}`}
                    >
                        <Bell size={20} strokeWidth={2} />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 mt-4 w-96 bg-white rounded-2xl shadow-xl border border-gray-100/50 overflow-hidden z-50 ring-1 ring-black/5">
                            <div className="px-5 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                                <span className="font-semibold text-sm text-slate-800">Notifications</span>
                                <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-gray-200/50 transition-colors"><X size={16} /></button>
                            </div>
                            <div className="max-h-[24rem] overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map((notif, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => handleNotificationClick(notif)}
                                            className={`px-5 py-4 hover:bg-gray-50/80 border-b border-gray-50 last:border-0 cursor-pointer transition-colors ${!notif.read ? 'bg-blue-50/40 relative' : ''}`}
                                        >
                                            {!notif.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>}
                                            <div className="flex gap-3">
                                                <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!notif.read ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                                                <div>
                                                    <p className={`text-sm leading-relaxed ${!notif.read ? 'font-medium text-slate-900' : 'text-slate-600'}`}>{notif.message}</p>
                                                    <p className="text-xs text-slate-400 mt-1.5 font-medium">{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                            <Bell size={20} className="text-gray-300" />
                                        </div>
                                        <p className="text-sm text-gray-500">No new notifications</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="h-8 w-px bg-gray-200 mx-2"></div>

                <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/profile')}>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md ring-4 ring-blue-50/50 group-hover:ring-blue-100 transition-all">
                        {user?.fullName?.charAt(0) || role?.charAt(0) || 'U'}
                    </div>
                    <div className="hidden md:block text-left">
                        <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">{user?.fullName || user?.name || 'User'}</p>
                        <p className="text-xs font-medium text-slate-500">{role}</p>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                    title="Logout"
                >
                    <LogOut size={18} />
                    <span className="text-sm font-medium">Logout</span>
                </button>
            </div>
        </header>
    );
};

export default Navbar;
