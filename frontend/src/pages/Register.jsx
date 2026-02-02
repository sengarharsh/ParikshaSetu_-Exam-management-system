import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import toast, { Toaster } from 'react-hot-toast';
import { BookOpen, User, Mail, Lock, CheckCircle } from 'lucide-react';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        role: 'STUDENT',
        courseId: ''
    });
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await api.get('/api/courses');
                setCourses(res.data);
            } catch (error) {
                console.error("Failed to fetch courses", error);
            }
        };
        fetchCourses();
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // 1. Register User
            const registerRes = await api.post('/api/auth/register', {
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
                role: formData.role
            });

            // 2. If Student and Course Selected, Enroll
            if (formData.role === 'STUDENT' && formData.courseId) {
                const userId = registerRes.data.id;
                try {
                    await api.post(`/api/courses/${formData.courseId}/enroll/${userId}`);
                    toast.success("Registered & Enrolled! Waiting for approval.");
                } catch (enrollError) {
                    console.error("Enrollment failed", enrollError);
                    toast.success("Registered, but manual enrollment needed.");
                }
            } else {
                toast.success("Registration Successful! Redirecting...");
            }

            setTimeout(() => navigate('/login'), 1500);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Registration Failed. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center sm:px-6 lg:px-8">
            <Toaster position="top-center" />
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <div className="bg-white p-2 rounded-full inline-block shadow-md mb-4">
                    <BookOpen className="h-10 w-10 text-blue-600" />
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900">Create an Account</h2>
                <p className="mt-2 text-gray-600">Join ParikshaSetu today</p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Full Name</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input name="fullName" required onChange={handleChange} className="pl-10 block w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2 border" placeholder="John Doe" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email Address</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input name="email" type="email" required onChange={handleChange} className="pl-10 block w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2 border" placeholder="you@example.com" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input name="password" type="password" required onChange={handleChange} className="pl-10 block w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2 border" placeholder="••••••••" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">I am a...</label>
                            <select name="role" onChange={handleChange} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                                <option value="STUDENT">Student</option>
                                <option value="TEACHER">Teacher</option>
                            </select>
                        </div>

                        {formData.role === 'STUDENT' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Select Course</label>
                                <select name="courseId" onChange={handleChange} required className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                                    <option value="">-- Choose a Course --</option>
                                    {courses.map(course => (
                                        <option key={course.id} value={course.id}>
                                            {course.title} (ID: {course.id})
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-1 text-xs text-gray-500">You will be enrolled as Pending.</p>
                            </div>
                        )}

                        <div className="flex items-center">
                            <input id="terms" type="checkbox" required className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                            <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                                I agree to the <a href="#" className="text-blue-600 hover:text-blue-500">Terms</a> and <a href="#" className="text-blue-600 hover:text-blue-500">Privacy Policy</a>
                            </label>
                        </div>

                        <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300">
                            {loading ? 'Creating Account & Enrolling...' : 'Sign Up'}
                        </button>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Already have an account?</span>
                            </div>
                        </div>
                        <div className="mt-6 text-center">
                            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">Sign in instead</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
