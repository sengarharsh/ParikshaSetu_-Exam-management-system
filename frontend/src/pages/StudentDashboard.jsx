import React, { useEffect, useState, useMemo } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, FileText, AlertCircle, Trophy } from 'lucide-react';


function StudentDashboard() {
    const { user } = useAuth();
    const [exams, setExams] = useState([]);
    const [courses, setCourses] = useState([]);
    const [results, setResults] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchExams();
        fetchResults();
    }, [user]);

    const fetchExams = async () => {
        try {
            const studentId = user?.id || localStorage.getItem('userId');
            if (!studentId) {
                console.error("Student ID not found in context or localStorage");
                return;
            }

            // 1. Fetch Enrolled Courses
            const coursesRes = await api.get(`/api/courses/my/${studentId}`);
            const fetchedCourses = coursesRes.data;
            setCourses(fetchedCourses); // Store for UI

            if (fetchedCourses.length > 0) {
                // 2. Fetch Exams for these courses
                const courseIds = fetchedCourses.map(c => c.courseId);
                const examsRes = await api.post('/api/exams/by-courses', courseIds);
                setExams(examsRes.data);
            } else {
                setExams([]);
            }
        } catch (error) {
            console.error('Error fetching exams', error);
        }
    };

    const fetchResults = async () => {
        try {
            const studentId = user?.id || localStorage.getItem('userId');
            if (!studentId) return;

            const res = await api.get(`/api/results/student/${studentId}`);
            setResults(res.data);
        } catch (err) {
            console.log("Result fetch error");
        }
    };

    const stats = useMemo(() => {
        const enrolledCourses = courses.length;
        const examsAttempted = results.length;
        const pendingExams = exams.filter(e => !results.some(r => r.examId === e.id)).length;

        const totalScores = results.reduce((sum, r) => sum + r.score, 0);
        const totalPossibleMarks = results.reduce((sum, r) => {
            const exam = exams.find(e => e.id === r.examId);
            return sum + (exam ? exam.totalMarks : 0);
        }, 0);

        const avgScore = totalPossibleMarks > 0 ? Math.round((totalScores / totalPossibleMarks) * 100) : 0;

        const recentResults = results
            .map(r => {
                const exam = exams.find(e => e.id === r.examId);
                return {
                    ...r,
                    examTitle: exam ? exam.title : `Exam #${r.examId}`,
                    totalMarks: exam ? exam.totalMarks : 0
                };
            })
            .sort((a, b) => new Date(b.dateTaken) - new Date(a.dateTaken)) // Assuming results have a dateTaken
            .slice(0, 5); // Show top 5 recent results

        return {
            enrolledCourses,
            examsAttempted,
            pendingExams,
            avgScore,
            recentResults
        };
    }, [courses, exams, results]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Student Dashboard</h1>
                    <p className="text-slate-500 mt-1">Track your progress and upcoming exams.</p>
                </div>
                <button
                    onClick={() => navigate('/student-exams')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-sm shadow-blue-200 transition-all active:scale-95"
                >
                    View All Exams
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { title: 'Enrolled Courses', value: stats.enrolledCourses, icon: <BookOpen size={22} />, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { title: 'Exams Attempted', value: stats.examsAttempted, icon: <FileText size={22} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { title: 'Pending Exams', value: stats.pendingExams, icon: <AlertCircle size={22} />, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { title: 'Average Score', value: `${stats.avgScore}%`, icon: <Trophy size={22} />, color: 'text-violet-600', bg: 'bg-violet-50' }
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Results Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/30 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-slate-800">Recent Results</h2>
                        <button onClick={() => navigate('/results')} className="text-sm text-blue-600 font-semibold hover:text-blue-700">View All</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Exam</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Score</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Grade</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {stats.recentResults.length > 0 ? (
                                    stats.recentResults.map((res) => (
                                        <tr key={res.id} className="hover:bg-gray-50/80 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900">Exam #{res.examId}</td>
                                            <td className="px-6 py-4 text-slate-600 font-medium">{res.score} / {res.totalMarks}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${res.grade === 'F' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                                                    {res.grade}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-8 text-center text-slate-400 text-sm">No recent results</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Upcoming Exams */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/30">
                        <h2 className="text-lg font-bold text-slate-800">Pending Exams</h2>
                    </div>
                    <div className="p-6">
                        {stats.pendingExams > 0 ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-4">
                                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                        <AlertCircle size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-blue-900 text-sm">You have {stats.pendingExams} pending exams</h4>
                                        <p className="text-xs text-blue-700 mt-1">Check the "My Exams" section to attempt them.</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="w-12 h-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Trophy size={20} />
                                </div>
                                <p className="text-slate-500 text-sm">You're all caught up! No pending exams.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StudentDashboard;
