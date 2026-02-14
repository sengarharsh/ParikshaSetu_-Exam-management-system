import React, { useState, useEffect } from 'react';
import api from '../api';
import Card from '../components/Card';
import { useNavigate } from 'react-router-dom';
import { FileText, Users, AlertCircle, BookOpen } from 'lucide-react';

const TeacherDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalExams: 0,
        activeStudents: 0,
        pendingResults: 0,
        totalMaterials: 0,
        results: [],
        rankings: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        const teacherId = localStorage.getItem('userId');
        try {
            // 1. Fetch Teacher's Exams
            const examsRes = await api.get(`/api/exams/teacher/${teacherId}`);
            const exams = examsRes.data;

            // 2. Fetch Teacher's Students (Enrolled in any course)
            let students = [];
            try {
                const studentIdsRes = await api.get(`/api/courses/teacher/${teacherId}/all-student-ids`);
                const studentIds = studentIdsRes.data;

                if (studentIds.length > 0) {
                    const studentsRes = await api.post('/api/users/batch', studentIds);
                    students = studentsRes.data;
                }
            } catch (e) {
                console.warn("Failed to fetch students", e);
            }

            // 3. Fetch Results for Teacher's Exams
            let results = [];
            try {
                if (exams.length > 0) {
                    const examIds = exams.map(e => e.id);
                    const resultsRes = await api.post('/api/results/by-exams', examIds);
                    results = resultsRes.data;
                }
            } catch (e) {
                console.warn("Failed to fetch results", e);
            }

            // 4. Fetch Material Count
            try {
                const materialsRes = await api.get(`/api/courses/teacher/${teacherId}/material-count`);
                setStats(prev => ({ ...prev, totalMaterials: materialsRes.data }));
            } catch (e) {
                console.warn("Failed to fetch material count", e);
            }

            const avg = results.length > 0
                ? Math.round(results.reduce((acc, curr) => acc + ((curr.score / curr.totalMarks) * 100), 0) / results.length)
                : 0;

            // Calculate Rankings
            const userScores = {};
            results.forEach(r => {
                if (!userScores[r.studentId]) userScores[r.studentId] = 0;
                userScores[r.studentId] += r.score;
            });

            const rankings = Object.keys(userScores).map(id => {
                const s = students.find(u => u.id === parseInt(id));
                return {
                    id,
                    name: s ? s.fullName : 'Unknown',
                    score: userScores[id]
                };
            }).sort((a, b) => b.score - a.score).slice(0, 5);

            setStats(prev => ({
                ...prev,
                totalExams: exams.length,
                activeStudents: students.length,
                pendingResults: 0,
                results: results.slice(0, 5),
                rankings,
                recentExams: exams.slice(0, 5) // Store recent exams
            }));
        } catch (error) {
            console.error("Failed to load teacher stats", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 w-full max-w-full overflow-x-hidden">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">Teacher Dashboard</h1>
                <div className="flex gap-4">
                    <button
                        onClick={() => navigate('/students')}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-blue-600 bg-blue-100 hover:bg-blue-200"
                    >
                        + Add Student
                    </button>
                    <button
                        onClick={() => navigate('/create-exam')}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    >
                        + Create New Exam
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { title: 'Total Exams', value: loading ? '...' : stats.totalExams, icon: <FileText size={22} />, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { title: 'Active Students', value: loading ? '...' : stats.activeStudents, icon: <Users size={22} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { title: 'Pending Results', value: loading ? '...' : stats.pendingResults, icon: <AlertCircle size={22} />, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { title: 'Course Materials', value: loading ? '...' : stats.totalMaterials, icon: <BookOpen size={22} />, color: 'text-violet-600', bg: 'bg-violet-50' }
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

            {/* Recent Activity / Exams Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                    <h2 className="text-lg font-bold text-slate-800">Recent Exams</h2>
                    <button className="text-sm text-blue-600 font-semibold opacity-50 cursor-not-allowed" title="Coming Soon">View All</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Exam Title</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Duration</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {stats.recentExams && stats.recentExams.length > 0 ? (
                                stats.recentExams.map((exam, i) => (
                                    <tr key={i} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900">{exam.title}</td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {exam.scheduledTime || exam.startTime ? new Date(exam.scheduledTime || exam.startTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">{exam.durationMinutes ? `${exam.durationMinutes} mins` : '—'}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-slate-400 font-medium opacity-50 cursor-not-allowed" title="Coming Soon">Edit</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-slate-400 text-sm">No recent exams found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Recent Submissions Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/30">
                    <h2 className="text-lg font-bold text-slate-800">Recent Submissions</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Exam ID</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Student ID</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Score</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Grade</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {stats.results && stats.results.length > 0 ? (
                                stats.results.map((res) => (
                                    <tr key={res.id} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900">#{res.examId}</td>
                                        <td className="px-6 py-4 text-slate-500">#{res.studentId}</td>
                                        <td className="px-6 py-4 text-slate-900 font-medium">{res.score} / {res.totalMarks}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${res.grade === 'F' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                                                {res.grade}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-slate-400 text-sm">No submissions yet</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Top Performing Students */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/30">
                    <h2 className="text-lg font-bold text-slate-800">Top Performing Students</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Rank</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Student Name</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Score</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {stats.rankings && stats.rankings.length > 0 ? (
                                stats.rankings.map((r, idx) => (
                                    <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs ${idx === 0 ? 'bg-yellow-100 text-yellow-700 ring-4 ring-yellow-50' : idx === 1 ? 'bg-gray-100 text-gray-700' : idx === 2 ? 'bg-orange-100 text-orange-700' : 'bg-blue-50 text-blue-700'}`}>
                                                {idx + 1}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-900">{r.name}</td>
                                        <td className="px-6 py-4 text-slate-600 font-semibold">{r.score} pts</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="px-6 py-8 text-center text-slate-400 text-sm">No data available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
