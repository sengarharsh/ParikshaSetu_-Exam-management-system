import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import api from '../api';
import toast from 'react-hot-toast';
import { Trash, Download } from 'lucide-react';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

const Students = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showAddModal, setShowAddModal] = useState(false);
    const [newStudent, setNewStudent] = useState({ name: '', email: '', password: 'password123' });
    const [adding, setAdding] = useState(false);

    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState('');

    useEffect(() => {
        fetchStudents();
        if (user?.role === 'TEACHER') {
            fetchCourses();
        }
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await api.get(`/api/courses/teacher/${user.id}`);
            setCourses(res.data);
            if (res.data.length > 0) setSelectedCourseId(res.data[0].id);
        } catch (err) {
            console.error("Failed to load courses");
        }
    };

    const fetchStudents = async () => {
        try {
            let res;
            if (user?.role === 'TEACHER') {
                res = await api.get(`/api/courses/teacher/${user.id}/students`);
            } else {
                res = await api.get('/api/users/students');
            }
            // Ensure data is array
            setStudents(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error("Failed to load students", error);
            toast.error("Failed to load students");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (student) => {
        if (window.confirm('Are you sure you want to delete this student system-wide?')) {
            try {
                await api.delete(`/api/users/${student.id}`);
                setStudents(students.filter(s => s.id !== student.id));
                toast.success('Student deleted successfully');
            } catch (error) {
                console.error('Failed to delete student', error);
                toast.error('Failed to delete student');
            }
        }
    };

    const handleAddStudent = async (e) => {
        e.preventDefault();
        setAdding(true);
        try {
            // 1. Register
            const regRes = await api.post('/api/auth/register', {
                fullName: newStudent.name,
                email: newStudent.email,
                password: newStudent.password || 'password123',
                role: 'STUDENT'
            });
            const newUserId = regRes.data.id;
            toast.success("Student registered!");

            // 2. Enroll (if teacher and course selected)
            if (user?.role === 'TEACHER' && selectedCourseId) {
                await api.post(`/api/courses/${selectedCourseId}/enroll/${newUserId}`);
                toast.success("Student enrolled in course!");
            }

            setNewStudent({ name: '', email: '', password: 'password123' });
            setShowAddModal(false);
            fetchStudents();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to register student");
        } finally {
            setAdding(false);
        }
    };

    if (loading) return <div className="p-6">Loading Students...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Students Directory</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
                    >
                        + Add Student
                    </button>
                    {/* Upload Excel Removed as per request */}
                </div>
            </div>

            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {students.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No students found.</td>
                                </tr>
                            ) : (
                                students.map((student) => (
                                    <tr key={student.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{student.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.fullName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${student.verified || student.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {student.verified || student.status === 'APPROVED' ? 'Active' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors duration-200"
                                                onClick={() => handleDelete(student)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Add Student Manual Modal */}
            <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Register New Student">
                <form onSubmit={handleAddStudent} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input
                            type="text" required
                            value={newStudent.name}
                            onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            placeholder="John Doe"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input
                            type="email" required
                            value={newStudent.email}
                            onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            placeholder="student@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="text"
                            value={newStudent.password}
                            onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            placeholder="Default: password123"
                        />
                    </div>
                    {user?.role === 'TEACHER' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Assign to Course</label>
                            <select
                                value={selectedCourseId}
                                onChange={(e) => setSelectedCourseId(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            >
                                <option value="">Select a course...</option>
                                {courses.map(course => (
                                    <option key={course.id} value={course.id}>{course.title}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={adding}
                        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                    >
                        {adding ? 'Registering...' : 'Register Student'}
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default Students;
