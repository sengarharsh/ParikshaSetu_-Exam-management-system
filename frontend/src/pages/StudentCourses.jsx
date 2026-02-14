import React, { useState, useEffect } from 'react';
import api from '../api';
import Card from '../components/Card';
import toast from 'react-hot-toast';
import { BookOpen, Clock, CheckCircle, AlertCircle, FileText, Download, X } from 'lucide-react';
import Modal from '../components/Modal';

const StudentCourses = () => {
    const [availableCourses, setAvailableCourses] = useState([]);
    const [myCourses, setMyCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Materials State
    const [showMaterialModal, setShowMaterialModal] = useState(false);
    const [materials, setMaterials] = useState([]);
    const [selectedCourseName, setSelectedCourseName] = useState('');

    const studentId = localStorage.getItem('userId');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [allRes, myRes] = await Promise.all([
                api.get('/api/courses'),
                api.get(`/api/courses/my/${studentId}`)
            ]);

            const enrolledIds = new Set(myRes.data.map(c => c.courseId));

            // Filter out courses I'm already enrolled in (or requested)
            const available = allRes.data.filter(c => !enrolledIds.has(c.id));

            setAvailableCourses(available);

            // For myCourses, we need to merge course details if the API only returns enrollment objects
            // The current backend endpoint `getStudentCourses` returns CourseEnrollment objects.
            // We might need to fetch course details separately or update backend to return DTO.
            // CAUTION: The current `CourseService` implementation `getStudentCourses` returns `List<CourseEnrollment>`.
            // We need to fetch the actual course details for these enrollments. 
            // Ideally backend should return a composite DTO. 
            // For now, let's just display the ID or fetch details one by one (inefficient but works for prototype).
            // BETTER: Let's assume for now we list them and maybe fetch details if needed.
            // Actually, `api.get('/api/courses')` returns ALL courses. We can map from there.

            const coursesMap = {};
            allRes.data.forEach(c => coursesMap[c.id] = c);

            const myCoursesWithDetails = myRes.data.map(enrollment => ({
                ...enrollment,
                course: coursesMap[enrollment.courseId] || { title: 'Unknown Course', description: '...' }
            }));

            setMyCourses(myCoursesWithDetails);

        } catch (err) {
            console.error(err);
            toast.error("Failed to load courses");
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async (courseId) => {
        try {
            await api.post(`/api/courses/${courseId}/enroll/${studentId}`);
            toast.success("Request sent! Waiting for teacher approval.");
            fetchData();
        } catch (err) {
            console.error(err);
            const errorMsg = err.response?.data?.message || JSON.stringify(err.response?.data) || "Failed to join course";
            toast.error(errorMsg);
        }
    };

    const openMaterialModal = async (course) => {
        setSelectedCourseName(course.title);
        setShowMaterialModal(true);
        try {
            const res = await api.get(`/api/materials/course/${course.id}`);
            setMaterials(res.data);
        } catch (err) {
            toast.error("Failed to load materials");
        }
    };

    if (loading) return <div className="p-6">Loading Courses...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">My Learning</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* My Courses */}
                <div className="space-y-4">
                    <h2 className="text-lg font-medium text-gray-900">Enrolled Courses</h2>
                    {myCourses.length === 0 ? <p className="text-gray-500">You haven't joined any courses yet.</p> : (
                        myCourses.map(item => (
                            <Card key={item.id} className="border-l-4 border-blue-500">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-gray-900">{item.course.title}</h3>
                                        <p className="text-sm text-gray-500">{item.course.description}</p>
                                        <p className="text-xs text-gray-400 mt-2">Enrolled: {new Date(item.enrolledAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        {item.status === 'APPROVED' ? (
                                            <>
                                                <span className="flex items-center text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded-full mb-2">
                                                    <CheckCircle size={14} className="mr-1" /> Active
                                                </span>
                                                <button
                                                    onClick={() => openMaterialModal(item.course)}
                                                    className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                                                >
                                                    <FileText size={16} className="mr-1" /> Materials
                                                </button>
                                            </>
                                        ) : (
                                            <span className="flex items-center text-yellow-600 text-sm font-medium bg-yellow-50 px-2 py-1 rounded-full">
                                                <Clock size={14} className="mr-1" /> Pending
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>

                {/* Available Courses */}
                <div className="space-y-4">
                    <h2 className="text-lg font-medium text-gray-900">Available Courses</h2>
                    {availableCourses.length === 0 ? <p className="text-gray-500">No new courses available.</p> : (
                        availableCourses.map(course => (
                            <Card key={course.id}>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-gray-900">{course.title}</h3>
                                        <p className="text-sm text-gray-500">{course.description}</p>
                                        <div className="flex items-center mt-2 gap-2">
                                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Code: {course.code}</span>
                                            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">By {course.teacherName || 'Teacher'}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleJoin(course.id)}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
                                    >
                                        Join
                                    </button>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </div>
            {/* Material Modal */}
            <Modal isOpen={showMaterialModal} onClose={() => setShowMaterialModal(false)} title={`Materials: ${selectedCourseName}`}>
                <div className="space-y-4">
                    {materials.length === 0 ? <p className="text-gray-500 text-sm">No materials uploaded for this course.</p> : (
                        <ul className="divide-y divide-gray-200">
                            {materials.map(m => (
                                <li key={m.id} className="py-3 flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{m.title}</p>
                                        <p className="text-xs text-gray-500">{m.description}</p>
                                        <span className="text-xs text-gray-400">{new Date(m.uploadedAt).toLocaleDateString()}</span>
                                    </div>
                                    <a
                                        href={`http://localhost:8080/api/materials/download/${m.fileUrl}`}
                                        target="_blank" rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 p-2 bg-blue-50 rounded-full"
                                        title="Download"
                                    >
                                        <Download size={18} />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default StudentCourses;
