import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import { Users, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
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

    if (loading) return <div className="p-6">Loading Admin Dashboard...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    + Create User
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="flex items-center p-4">
                    <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4"><Users /></div>
                    <div>
                        <p className="text-sm text-gray-500">Total Users</p>
                        <p className="text-xl font-bold">{stats.totalUsers}</p>
                    </div>
                </Card>
                <Card className="flex items-center p-4">
                    <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4"><AlertTriangle /></div>
                    <div>
                        <p className="text-sm text-gray-500">Pending</p>
                        <p className="text-xl font-bold">{pendingUsers.length}</p>
                    </div>
                </Card>
                <Card className="flex items-center p-4">
                    <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4"><Users /></div>
                    <div>
                        <p className="text-sm text-gray-500">Teachers</p>
                        <p className="text-xl font-bold">{stats.teachers}</p>
                    </div>
                </Card>
                <Card className="flex items-center p-4">
                    <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4"><Users /></div>
                    <div>
                        <p className="text-sm text-gray-500">Students</p>
                        <p className="text-xl font-bold">{stats.students}</p>
                    </div>
                </Card>
            </div>

            {/* Pending Approvals */}
            {pendingUsers.length > 0 && (
                <Card title="Pending Approvals">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-yellow-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {pendingUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.fullName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            <button onClick={() => handleApprove(user.id)} className="text-green-600 hover:text-green-900">Approve</button>
                                            <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900">Reject</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* User Management Table */}
            <Card title="All Users">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold mr-3">
                                                {user.fullName ? user.fullName.charAt(0) : 'U'}
                                            </div>
                                            <div className="text-sm font-medium text-gray-900">{user.fullName || 'No Name'}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'TEACHER' ? 'bg-purple-100 text-purple-800' : user.role === 'ADMIN' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'APPROVED' ? 'bg-green-100 text-green-800' : user.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {user.status || 'Active'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Create User Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">Create New User</h2>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input type="text" required className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                    value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input type="email" required className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                    value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Password</label>
                                <input type="text" required className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                    value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Role</label>
                                <select className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                    value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                    <option value="TEACHER">Teacher</option>
                                    <option value="STUDENT">Student</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-md hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
