import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { Plus, Trash, Save } from 'lucide-react';
import Card from '../components/Card';

const CreateExam = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [examData, setExamData] = useState({
        title: '',
        description: '',
        durationMinutes: 60,
        courseId: ''
    });
    const [questions, setQuestions] = useState([
        { text: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A', marks: 5 }
    ]);
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        const fetchCourses = async () => {
            const teacherId = localStorage.getItem('userId');
            if (teacherId) {
                try {
                    const res = await api.get(`/api/courses/teacher/${teacherId}`);
                    setCourses(res.data);
                } catch (err) {
                    console.error("Failed to fetch courses");
                }
            }
        };
        fetchCourses();
    }, []);

    const handleQuestionChange = (index, field, value) => {
        const newQuestions = [...questions];
        newQuestions[index][field] = value;
        setQuestions(newQuestions);
    };

    const addQuestion = () => {
        setQuestions([...questions, { text: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A', marks: 5 }]);
    };

    const removeQuestion = (index) => {
        if (questions.length === 1) return;
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const teacherId = localStorage.getItem('userId');
            const token = localStorage.getItem('token');

            if (!teacherId || !token) {
                toast.error("You must be logged in to create an exam");
                setLoading(false);
                return;
            }

            const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);

            const payload = {
                ...examData,
                courseId: examData.courseId ? parseInt(examData.courseId) : null,
                totalMarks,
                teacherId: parseInt(teacherId),
                questions: questions
            };
            // Assuming endpoint is POST /api/exams
            await api.post('/api/exams', payload);
            toast.success("Exam Created Successfully!");
            navigate('/dashboard');
        } catch (error) {
            console.error(error);
            toast.error("Failed to create exam");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-10">
            <h1 className="text-2xl font-bold text-gray-900">Create New Exam</h1>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Exam Details */}
                <Card title="Exam Details">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Link to Course (Optional)</label>
                            <select
                                value={examData.courseId}
                                onChange={(e) => setExamData({ ...examData, courseId: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                                <option value="">-- Connect to a Course --</option>
                                {courses.map(course => (
                                    <option key={course.id} value={course.id}>{course.title} ({course.code})</option>
                                ))}
                            </select>
                            <p className="mt-1 text-xs text-gray-500">Linking an exam to a course makes it visible to all approved students in that course.</p>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Exam Title</label>
                            <input
                                type="text" required
                                value={examData.title}
                                onChange={(e) => setExamData({ ...examData, title: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="e.g. Final Mathematics Assessment"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                value={examData.description}
                                onChange={(e) => setExamData({ ...examData, description: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Instructions for students..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Duration (Minutes)</label>
                            <input
                                type="number" required min="1"
                                value={examData.durationMinutes}
                                onChange={(e) => setExamData({ ...examData, durationMinutes: parseInt(e.target.value) })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                    </div>
                </Card>

                {/* Questions */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-medium text-gray-900">Questions ({questions.length})</h2>
                        <button type="button" onClick={addQuestion} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200">
                            <Plus size={16} className="mr-2" /> Add Question
                        </button>
                    </div>

                    {questions.map((q, index) => (
                        <Card key={index} className="relative">
                            <div className="absolute top-4 right-4">
                                <button type="button" onClick={() => removeQuestion(index)} className="text-red-400 hover:text-red-600">
                                    <Trash size={18} />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Question {index + 1}</label>
                                    <input
                                        type="text" required
                                        value={q.text}
                                        onChange={(e) => handleQuestionChange(index, 'text', e.target.value)}
                                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="Enter question text here..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {['A', 'B', 'C', 'D'].map((opt) => (
                                        <div key={opt}>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Option {opt}</label>
                                            <input
                                                type="text" required
                                                value={q[`option${opt}`]}
                                                onChange={(e) => handleQuestionChange(index, `option${opt}`, e.target.value)}
                                                className="block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer</label>
                                        <select
                                            value={q.correctOption}
                                            onChange={(e) => handleQuestionChange(index, 'correctOption', e.target.value)}
                                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        >
                                            {['A', 'B', 'C', 'D'].map(opt => <option key={opt} value={opt}>Option {opt}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Marks</label>
                                        <input
                                            type="number" min="1" required
                                            value={q.marks}
                                            onChange={(e) => handleQuestionChange(index, 'marks', parseInt(e.target.value))}
                                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                <div className="flex justify-end pt-6">
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        <Save size={20} className="mr-2" />
                        {loading ? 'Creating Exam...' : 'Publish Exam'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateExam;
