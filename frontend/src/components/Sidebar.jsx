import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, BarChart2, User, FilePlus, Users, Trophy, FileText } from 'lucide-react';

const Sidebar = () => {
    const location = useLocation();
    const role = localStorage.getItem('role');

    let links = [];

    if (role === 'ADMIN') {
        links = [
            { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
            { name: 'Users', path: '/admin', icon: <Users size={20} /> }, // Can allow managing users
            { name: 'Settings', path: '/profile', icon: <User size={20} /> }
        ];
    } else if (role === 'TEACHER') {
        links = [
            { name: 'Dashboard', path: '/teacher', icon: <LayoutDashboard size={20} /> },
            { name: 'My Courses', path: '/teacher-courses', icon: <BookOpen size={20} /> },
            { name: 'My Exams', path: '/teacher-exams', icon: <FileText size={20} /> },
            { name: 'Create Exam', path: '/create-exam', icon: <FilePlus size={20} /> },
            { name: 'Students', path: '/students', icon: <Users size={20} /> },
            { name: 'Leaderboard', path: '/teacher-leaderboard', icon: <Trophy size={20} /> },
            { name: 'Profile', path: '/profile', icon: <User size={20} /> }
        ];
    } else {
        // STUDENT
        links = [
            { name: 'Dashboard', path: '/student', icon: <LayoutDashboard size={20} /> },
            { name: 'My Courses', path: '/student-courses', icon: <BookOpen size={20} /> },
            { name: 'My Exams', path: '/student-exams', icon: <FileText size={20} /> },
            { name: 'Results', path: '/results', icon: <BarChart2 size={20} /> },
            { name: 'Leaderboard', path: '/leaderboard', icon: <Trophy size={20} /> },
            { name: 'Profile', path: '/profile', icon: <User size={20} /> }
        ];
    }

    return (
        <div className="w-72 h-screen bg-white shadow-xl fixed left-0 top-0 pt-0 hidden md:flex flex-col border-r border-gray-100 z-40">
            <div className="h-20 flex items-center px-8 border-b border-gray-50">
                <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">ParikshaSetu</Link>
            </div>
            <nav className="flex-1 mt-6 px-4 space-y-1.5 overflow-y-auto">
                {links.map((link) => (
                    <Link
                        key={link.name}
                        to={link.path}
                        className={`flex items-center px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 group ${location.pathname === link.path
                            ? 'bg-blue-50 text-blue-700 shadow-sm'
                            : 'text-slate-600 hover:bg-gray-50 hover:text-slate-900 hover:translate-x-1'
                            }`}
                    >
                        <span className={`mr-4 transition-colors ${location.pathname === link.path ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`}>{link.icon}</span>
                        <span>{link.name}</span>
                        {location.pathname === link.path && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600"></div>}
                    </Link>
                ))}
            </nav>
            <div className="p-4 border-t border-gray-50">
                <div className="bg-blue-50/50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-blue-800 uppercase tracking-wider mb-1">Current Role</p>
                    <p className="text-sm font-medium text-slate-700">{role}</p>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
