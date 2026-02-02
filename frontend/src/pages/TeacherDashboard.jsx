import React, { useState, useEffect } from 'react';
import api from '../api';
import Card from '../components/Card';
import { useNavigate } from 'react-router-dom';

const TeacherDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ exams: 0, students: 0, avgScore: 0, results: [], examsList: [], studentsList: [] });
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedExam, setSelectedExam] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [examsRes, studentsRes, resultsRes] = await Promise.all([
                api.get('/api/exams'),
                api.get('/api/users/students'),
                api.get('/api/results')
            ]);

            const exams = examsRes.data;
            const students = studentsRes.data;
            const results = resultsRes.data;

            const avg = results.length > 0
                ? Math.round(results.reduce((acc, curr) => acc + ((curr.score / curr.totalMarks) * 100), 0) / results.length)
                : 0;

            setStats({
                exams: exams.length,
                students: students.length,
                avgScore: avg,
                results: results.slice(0, 5),
                examsList: exams,
                studentsList: students
            });
        } catch (error) {
            console.error("Failed to load teacher stats", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async () => {
        if (!selectedExam || !selectedStudent) {
            alert("Please select both exam and student");
            return;
        }
        try {
            await api.post(`/api/exams/${selectedExam}/enroll/${selectedStudent}`);
            alert("Student enrolled successfully!");
            setShowModal(false);
        } catch (error) {
            console.error("Enrollment failed", error);
            alert("Failed to enroll student.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">Teacher Dashboard</h1>
                <button
                    onClick={() => navigate('/create-exam')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                    + Create New Exam
                </button>
                <button
                    onClick={() => navigate('/add-student')}
                    className="ml-4 inline-flex items-center px-4 py-2 border border-blue-600 text-sm font-medium rounded-md shadow-sm text-blue-600 bg-white hover:bg-blue-50"
                >
                    + Add Student
                </button>
                <button
                    onClick={() => setShowModal(true)}
                    className="ml-4 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                >
                    Assign Exam
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <Card>
                    <div className="text-center">
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Exams</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{loading ? '...' : stats.exams}</dd>
                    </div>
                </Card>
                <Card>
                    <div className="text-center">
                        <dt className="text-sm font-medium text-gray-500 truncate">Active Students</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{loading ? '...' : stats.students}</dd>
                    </div>
                </Card>
                <Card>
                    <div className="text-center">
                        <dt className="text-sm font-medium text-gray-500 truncate">Avg Score</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{loading ? '...' : stats.avgScore + '%'}</dd>
                    </div>
                </Card>
            </div>

            <h2 className="text-lg leading-6 font-medium text-gray-900">Recent Submissions</h2>
            <Card>
                {/* <p className="text-gray-500 text-sm text-center py-4">No recent submissions found.</p> */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {stats.results && stats.results.length > 0 ? (
                                stats.results.map((res) => (
                                    <tr key={res.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{res.examId}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{res.studentId}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{res.score} / {res.totalMarks}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${res.grade === 'F' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                {res.grade}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">No submissions yet</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
            {/* Enrollment Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">Enroll Student</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Select Exam</label>
                                <select
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                    value={selectedExam}
                                    onChange={(e) => setSelectedExam(e.target.value)}
                                >
                                    <option value="">-- Choose Exam --</option>
                                    {stats.examsList?.map(ex => (
                                        <option key={ex.id} value={ex.id}>{ex.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Select Student</label>
                                <select
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                    value={selectedStudent}
                                    onChange={(e) => setSelectedStudent(e.target.value)}
                                >
                                    <option value="">-- Choose Student --</option>
                                    {stats.studentsList?.map(st => (
                                        <option key={st.id} value={st.id}>{st.fullName}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-md hover:bg-gray-50">Cancel</button>
                                <button onClick={handleEnroll} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Enroll</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherDashboard;
