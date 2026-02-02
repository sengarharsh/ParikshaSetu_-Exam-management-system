import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import api from '../api';
import toast from 'react-hot-toast';

const Students = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const res = await api.get('/api/users/students');
            setStudents(res.data);
        } catch (error) {
            console.error("Failed to load students", error);
            toast.error("Failed to load students");
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        const toastId = toast.loading("Uploading students...");
        try {
            await api.post('/api/users/students/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Students uploaded successfully!", { id: toastId });
            fetchStudents(); // Refresh list
        } catch (error) {
            console.error(error);
            toast.error("Upload failed: " + (error.response?.data || error.message), { id: toastId });
        }
    };


    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this student?")) return;

        try {
            await api.delete(`/api/admin/users/${id}`);
            toast.success("Student deleted successfully");
            fetchStudents();
        } catch (error) {
            console.error("Failed to delete student", error);
            toast.error("Failed to delete student");
        }
    };

    if (loading) return <div className="p-6">Loading Students...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Students Directory</h1>
                <div className="flex gap-2">
                    <label className="cursor-pointer bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2">
                        <span>Upload Excel</span>
                        <input type="file" className="hidden" accept=".xlsx,.xls" onChange={handleFileUpload} />
                    </label>
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
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${student.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {student.verified ? 'Active' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleDelete(student.id)}
                                                className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors duration-200"
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
        </div>
    );
};

export default Students;
