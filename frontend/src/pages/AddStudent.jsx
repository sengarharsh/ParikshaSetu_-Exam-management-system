import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { User, Mail, Lock } from 'lucide-react';

const AddStudent = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        role: 'STUDENT'
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/api/auth/register', formData);
            toast.success("Student Added Successfully!");
            // Reset form or navigate back
            setFormData({ fullName: '', email: '', password: '', role: 'STUDENT' });
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to add student.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Add New Student</h2>

            <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input name="fullName" value={formData.fullName} required onChange={handleChange} className="pl-10 block w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2 border" placeholder="Student Name" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input name="email" type="email" value={formData.email} required onChange={handleChange} className="pl-10 block w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2 border" placeholder="student@example.com" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Default Password</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input name="password" type="text" value={formData.password} required onChange={handleChange} className="pl-10 block w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2 border" placeholder="Set a temporary password" />
                    </div>
                </div>

                <div className="flex gap-4">
                    <button type="button" onClick={() => navigate('/teacher-dashboard')} className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        {loading ? 'Adding...' : 'Add Student'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddStudent;
