import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, BookOpen, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({ totalUsers: 0, students: 0, teachers: 0 });
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ fullName: '', email: '', role: 'TEACHER', password: '' });

    const [pendingUsers, setPendingUsers] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [usersRes, statsRes] = await Promise.all([
                api.get('/api/admin/users'),
                api.get('/api/admin/stats')
            ]);
            setUsers(usersRes.data);
            setStats(statsRes.data);
            setPendingUsers(usersRes.data.filter(u => u.status === 'PENDING'));
        } catch (error) {
            console.error(error);
            toast.error("Failed to load admin data");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await api.delete(`/api/admin/users/${id}`);
            toast.success("User deleted");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete user");
        }
    };

    const handleApprove = async (id) => {
        try {
            await api.post(`/api/admin/users/${id}/approve`);
            toast.success("User approved");
            fetchData();
        } catch (error) {
            toast.error("Failed to approve user");
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/admin/users', formData);
            toast.success("User created successfully");
            setShowModal(false);
            setFormData({ fullName: '', email: '', role: 'TEACHER', password: '' });
            fetchData();
        } catch (error) {
            toast.error("Failed to create user");
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading Admin Dashboard...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Admin Dashboard</h1>
                    <p className="text-slate-500 mt-1">System overview and management.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white border border-gray-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                        System Logs
                    </button>
                    <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-sm shadow-blue-200 transition-all active:scale-95">
                        + Add New User
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { title: 'Total Users', value: stats.totalUsers, icon: <Users size={22} />, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { title: 'Pending Users', value: pendingUsers.length, icon: <AlertTriangle size={22} />, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { title: 'Teachers', value: stats.teachers, icon: <BookOpen size={22} />, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { title: 'Students', value: stats.students, icon: <Users size={22} />, color: 'text-emerald-600', bg: 'bg-emerald-50' }
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                                {stat.icon}
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-800 mb-1">{stat.value}</h3>
                        <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                    </div>
                ))}
            </div>

            {/* Pending Approvals */}
            {pendingUsers.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-yellow-200 overflow-hidden ring-1 ring-yellow-100">
                    <div className="px-6 py-5 border-b border-yellow-100 bg-yellow-50/50 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <AlertTriangle size={18} className="text-amber-500" />
                            <h2 className="text-lg font-bold text-slate-800">Pending Approvals</h2>
                        </div>
                        <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{pendingUsers.length} Pending</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-yellow-50/30">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {pendingUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-yellow-50/10 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{user.fullName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{user.role}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{user.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 text-right">
                                            <button onClick={() => handleApprove(user.id)} className="text-emerald-600 hover:text-emerald-700 font-semibold px-3 py-1 rounded-lg hover:bg-emerald-50 transition-colors">Approve</button>
                                            <button onClick={() => handleDelete(user.id)} className="text-red-500 hover:text-red-600 font-semibold px-3 py-1 rounded-lg hover:bg-red-50 transition-colors">Reject</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* User Management Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/30 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-800">All Users</h2>
                    <div className="flex gap-2">
                        <button className="text-sm text-slate-500 font-medium hover:text-slate-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">Filter</button>
                        <button className="text-sm text-blue-600 font-semibold hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">Export</button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50/80 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs ring-2 ring-white">
                                                {user.fullName ? user.fullName.charAt(0) : 'U'}
                                            </div>
                                            <div className="ml-3">
                                                <div className="text-sm font-medium text-slate-900">{user.fullName || 'No Name'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase ${user.role === 'TEACHER' ? 'bg-purple-50 text-purple-700 ring-1 ring-purple-500/10' : user.role === 'ADMIN' ? 'bg-red-50 text-red-700 ring-1 ring-red-500/10' : 'bg-green-50 text-green-700 ring-1 ring-green-500/10'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === 'APPROVED' ? 'bg-green-50 text-green-700 border border-green-100' : user.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-gray-50 text-gray-600 border border-gray-100'}`}>
                                            <span className={`h-1.5 w-1.5 rounded-full ${user.status === 'APPROVED' ? 'bg-green-500' : user.status === 'PENDING' ? 'bg-amber-500' : 'bg-gray-400'}`}></span>
                                            {user.status || 'Active'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                                        <button onClick={() => handleDelete(user.id)} className="text-slate-400 hover:text-red-600 transition-colors">
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create User Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-md w-full scale-100 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-800">Create New User</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">✕</button>
                        </div>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                <input type="text" required className="w-full border border-gray-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                                    value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                <input type="email" required className="w-full border border-gray-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                                    value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                                <input type="text" required className="w-full border border-gray-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                                    value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                                <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                                    value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                    <option value="TEACHER">Teacher</option>
                                    <option value="STUDENT">Student</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>
                            <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-gray-50">
                                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 bg-white border border-gray-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all">Cancel</button>
                                <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-sm shadow-blue-200 transition-all">Create User</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
