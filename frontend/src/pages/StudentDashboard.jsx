import React, { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Analytics from '../components/Analytics';
import { useAuth } from '../context/AuthContext';


function StudentDashboard() {
    const { user } = useAuth();
    const [exams, setExams] = useState([]);
    const [results, setResults] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            fetchExams();
            fetchResults();
        }
    }, [user]);

    const fetchExams = async () => {
        try {
            // 1. Fetch Enrolled Courses
            const coursesRes = await api.get(`/api/courses/my/${user.id}`);
            const courses = coursesRes.data;

            if (courses.length > 0) {
                // 2. Fetch Exams for these courses
                const courseIds = courses.map(c => c.courseId);
                const examsRes = await api.post('/api/exams/by-courses', courseIds);
                setExams(examsRes.data);
            } else {
                setExams([]);
            }
        } catch (error) {
            console.error('Error fetching exams', error);
            // Fallback to legacy/direct assignments if needed, or leave empty
        }
    };

    const fetchResults = async () => {
        try {
            const res = await api.get(`/api/results/student/${user.id}`);
            setResults(res.data);
        } catch (err) {
            console.log("Result fetch error");
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="mt-1 text-sm text-gray-500">Overview of your activity.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <div className="text-center">
                        <div className="text-3xl">📚</div>
                        <div className="text-lg font-bold">{exams.length}</div>
                        <div className="text-gray-500">Available Exams</div>
                    </div>
                </Card>
                <Card>
                    <div className="text-center">
                        <div className="text-3xl">✅</div>
                        <div className="text-lg font-bold">{results.length}</div>
                        <div className="text-gray-500">Exams Taken</div>
                    </div>
                </Card>
                <Card>
                    <div className="text-center">
                        <div className="text-3xl">🏆</div>
                        <div className="text-lg font-bold">TOP 10%</div>
                        <div className="text-gray-500">Current Rank</div>
                    </div>
                </Card>
            </div>

            {/* Analytics Component */}
            <Analytics results={results} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Available Exams">
                    {exams.length === 0 ? <p className="text-gray-500">No exams found.</p> : (
                        <ul className="divide-y divide-gray-200">
                            {exams.map(exam => (
                                <li key={exam.id} className="py-4 flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{exam.title}</p>
                                        <p className="text-sm text-gray-500">{exam.durationMinutes} mins</p>
                                    </div>
                                    <button onClick={() => navigate(`/exam/${exam.id}`)} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">Start</button>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>

                <Card title="Recent Results">
                    {results.length === 0 ? <p className="text-gray-500">No results yet.</p> : (
                        <ul className="divide-y divide-gray-200">
                            {results.map(r => (
                                <li key={r.id} className="py-4 flex justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Exam #{r.examId}</p>
                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">{r.grade}</span>
                                    </div>
                                    <p className="text-sm text-gray-500">Score: {r.score}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>
            </div>
        </div>
    );
}

export default StudentDashboard;
