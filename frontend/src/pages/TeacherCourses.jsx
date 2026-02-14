import React, { useState, useEffect } from 'react';
import api from '../api';
import Card from '../components/Card';
import toast from 'react-hot-toast';
import { BookOpen, UserCheck, Clock, Check, X, FileText, Upload, Download, Trash, UserX } from 'lucide-react';
import Modal from '../components/Modal';

const TeacherCourses = () => {
    const [courses, setCourses] = useState([]);
    const [newCourse, setNewCourse] = useState({ title: '', description: '', code: '' });
    const [loading, setLoading] = useState(true);
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [pendingEnrollments, setPendingEnrollments] = useState([]);
    const [showMaterialModal, setShowMaterialModal] = useState(false);
    const [materials, setMaterials] = useState([]);
    const [newMaterial, setNewMaterial] = useState({ title: '', description: '', file: null });
    const [uploading, setUploading] = useState(false);
    const [approvedEnrollments, setApprovedEnrollments] = useState([]);
    const [showStudentUploadModal, setShowStudentUploadModal] = useState(false);
    const [showAddStudentModal, setShowAddStudentModal] = useState(false);
    const [newStudent, setNewStudent] = useState({ name: '', email: '' });
    const [addingStudent, setAddingStudent] = useState(false);
    const [studentFile, setStudentFile] = useState(null);
    const [uploadingStudents, setUploadingStudents] = useState(false);

    const teacherId = localStorage.getItem('userId');

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await api.get(`/api/courses/teacher/${teacherId}`);
            setCourses(res.data);
        } catch (err) {
            toast.error("Failed to load courses");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        try {
            const courseCode = newCourse.code || Math.random().toString(36).substring(7).toUpperCase();
            const teacherName = localStorage.getItem('fullName') || 'Unknown Teacher';
            await api.post('/api/courses', { ...newCourse, code: courseCode, teacherId, teacherName });
            toast.success("Course created!");
            setNewCourse({ title: '', description: '', code: '' });
            fetchCourses();
        } catch (err) {
            toast.error("Failed to create course");
        }
    };

    const handleDeleteCourse = async (courseId) => {
        if (!window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
            return;
        }
        try {
            await api.delete(`/api/courses/${courseId}`);
            toast.success("Course deleted successfully");
            if (selectedCourseId === courseId) {
                setSelectedCourseId(null);
            }
            fetchCourses();
        } catch (err) {
            toast.error("Failed to delete course");
        }
    };

    const loadEnrollments = async (courseId) => {
        setSelectedCourseId(courseId);
        try {
            const [pendingRes, approvedRes] = await Promise.all([
                api.get(`/api/courses/${courseId}/pending`),
                api.get(`/api/courses/${courseId}/students`)
            ]);
            setPendingEnrollments(pendingRes.data);
            setApprovedEnrollments(approvedRes.data);
        } catch (err) {
            console.error(err);
            // toast.error("Failed to load course details");
        }
    };

    const handleApprove = async (enrollmentId) => {
        try {
            await api.put(`/api/courses/enrollments/${enrollmentId}/approve`);
            toast.success("Student Approved!");
            loadEnrollments(selectedCourseId);
        } catch (err) {
            toast.error("Failed to approve");
        }
    };

    const handleReject = async (enrollmentId) => {
        if (!window.confirm("Reject this student request?")) return;
        try {
            await api.put(`/api/courses/enrollments/${enrollmentId}/reject`);
            toast.success("Student Rejected");
            loadEnrollments(selectedCourseId);
        } catch (err) {
            toast.error("Failed to reject");
        }
    };

    const handleRemoveEnrolledStudent = async (enrollmentId) => {
        if (!window.confirm("Remove this student from the course?")) return;
        try {
            await api.put(`/api/courses/enrollments/${enrollmentId}/reject`);
            toast.success("Student removed");
            loadEnrollments(selectedCourseId);
        } catch (err) {
            toast.error("Failed to remove student");
        }
    };

    const handleUploadStudents = async (e) => {
        e.preventDefault();
        if (!studentFile) {
            toast.error("Please select a file");
            return;
        }
        const formData = new FormData();
        formData.append("file", studentFile);

        setUploadingStudents(true);
        try {
            const res = await api.post(`/api/courses/${selectedCourseId}/students/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const { created, existing, enrolled, errors } = res.data;

            if (errors && errors.length > 0) {
                console.error("Bulk Upload Errors:", errors);
                toast.error("Upload completed with some errors. Check console.");
                toast(errors.slice(0, 3).join('\n'), { icon: '⚠️', duration: 6000 });
            }

            toast.success(`Success! Created: ${created}, Existing: ${existing}, Enrolled: ${enrolled}`);
            setStudentFile(null);
            setShowStudentUploadModal(false);
            loadEnrollments(selectedCourseId);
        } catch (err) {
            toast.error(err.response?.data || "Failed to upload students");
            console.error(err);
        } finally {
            setUploadingStudents(false);
        }
    };

    const fetchMaterials = async (courseId) => {
        try {
            const res = await api.get(`/api/materials/course/${courseId}`);
            setMaterials(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load materials");
        }
    };

    const openMaterialModal = (courseId) => {
        setSelectedCourseId(courseId);
        fetchMaterials(courseId);
        setShowMaterialModal(true);
    };

    const handleUploadMaterial = async (e) => {
        e.preventDefault();
        if (!newMaterial.file) {
            toast.error("Please select a file");
            return;
        }

        const formData = new FormData();
        formData.append("file", newMaterial.file);
        formData.append("title", newMaterial.title);
        formData.append("description", newMaterial.description);

        setUploading(true);
        try {
            await api.post(`/api/materials/course/${selectedCourseId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Material uploaded!");
            setNewMaterial({ title: '', description: '', file: null });
            fetchMaterials(selectedCourseId);
        } catch (err) {
            toast.error("Failed to upload material");
        } finally {
            setUploading(false);
        }
    };

    const handleAddStudent = async (e) => {
        e.preventDefault();
        setAddingStudent(true);
        try {
            let studentId = null;
            // 1. Check if user exists
            try {
                const res = await api.get(`/api/users/search/email?email=${newStudent.email}`);
                if (res.data && res.data.id) {
                    studentId = res.data.id;
                    toast.success("User found!");
                }
            } catch (err) {
                // If 404, create user
                if (err.response && err.response.status === 404) {
                    try {
                        const regRes = await api.post('/api/auth/register', {
                            fullName: newStudent.name,
                            email: newStudent.email,
                            password: 'password123', // Default password
                            role: 'STUDENT'
                        });
                        studentId = regRes.data.id;
                        toast.success("New student registered!");
                    } catch (regErr) {
                        throw new Error("Failed to register new student");
                    }
                } else {
                    throw err;
                }
            }

            if (studentId) {
                // 2. Enroll
                await api.post(`/api/courses/${selectedCourseId}/enroll/${studentId}`);
                toast.success("Student added to course!");
                setNewStudent({ name: '', email: '' });
                setShowAddStudentModal(false);
                loadEnrollments(selectedCourseId);
            }

        } catch (err) {
            console.error(err);
            toast.error(err.message || "Failed to add student");
        } finally {
            setAddingStudent(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>

            {/* Create Course Form */}
            <Card title="Create New Course">
                <form onSubmit={handleCreateCourse} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Course Title</label>
                        <input
                            type="text" required
                            value={newCourse.title}
                            onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <input
                            type="text"
                            value={newCourse.description}
                            onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        />
                    </div>
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 h-10">
                        + Create Course
                    </button>
                </form>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Courses List */}
                <div className="space-y-4">
                    <h2 className="text-lg font-medium text-gray-900">Your Courses</h2>
                    {loading ? <p>Loading...</p> : courses.length === 0 ? <p className="text-gray-500">No courses created yet.</p> : (
                        courses.map(course => (
                            <div key={course.id}
                                onClick={() => loadEnrollments(course.id)}
                                className={`bg-white p-4 rounded-lg shadow cursor-pointer border-l-4 transition-all ${selectedCourseId === course.id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-transparent hover:border-gray-300'}`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-gray-900">{course.title}</h3>
                                        <p className="text-sm text-gray-500">{course.description}</p>
                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded mt-2 inline-block">Code: {course.code}</span>
                                    </div>
                                    <div className="flex flex-col gap-2 items-end">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); openMaterialModal(course.id); }}
                                                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-sm hover:bg-blue-200 flex items-center"
                                                title="Manage Materials"
                                            >
                                                <FileText size={16} className="mr-1" />
                                                Materials
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteCourse(course.id); }}
                                                className="bg-red-100 text-red-700 px-3 py-1 rounded-md text-sm hover:bg-red-200 flex items-center"
                                                title="Delete Course"
                                            >
                                                <Trash size={16} className="mr-1" />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Course Details (Enrolled & Pending) */}
                <div className="space-y-6">
                    {!selectedCourseId ? (
                        <div className="bg-gray-50 p-8 rounded-lg text-center text-gray-500 border border-dashed border-gray-300">
                            Select a course to manage students
                        </div>
                    ) : (
                        <>
                            {/* Pending Approvals */}
                            <Card title="Pending Approvals">
                                {pendingEnrollments.length === 0 ? <p className="text-gray-500 text-sm">No pending requests.</p> : (
                                    <ul className="divide-y divide-gray-200">
                                        {pendingEnrollments.map(enrollment => (
                                            <li key={enrollment.id} className="py-2 flex justify-between items-center">
                                                <div className="flex items-center">
                                                    <UserCheck className="text-gray-400 mr-2" size={16} />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{enrollment.studentName || `Student ID: ${enrollment.studentId}`}</p>
                                                        <p className="text-xs text-gray-500">{enrollment.studentEmail}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleApprove(enrollment.id)}
                                                        className="text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-xs"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(enrollment.id)}
                                                        className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-xs"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </Card>

                            {/* Enrolled Students */}
                            <div className="bg-white p-6 rounded-lg shadow">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium leading-6 text-gray-900">Enrolled Students</h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setShowAddStudentModal(true)}
                                            className="text-sm bg-green-50 text-green-600 px-3 py-1 rounded hover:bg-green-100 flex items-center border border-green-200"
                                        >
                                            + Add Student
                                        </button>
                                        <button
                                            onClick={() => setShowStudentUploadModal(true)}
                                            className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100 flex items-center border border-blue-200"
                                        >
                                            <Upload size={14} className="mr-1" />
                                            Upload Excel
                                        </button>
                                    </div>
                                </div>
                                {approvedEnrollments.length === 0 ? <p className="text-gray-500 text-sm">No students enrolled.</p> : (
                                    <ul className="divide-y divide-gray-200">
                                        {approvedEnrollments.map(enrollment => (
                                            <li key={enrollment.id} className="py-2 flex justify-between items-center">
                                                <div className="flex items-center">
                                                    <UserCheck className="text-green-500 mr-2" size={16} />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{enrollment.studentName || `Student ID: ${enrollment.studentId}`}</p>
                                                        <p className="text-xs text-gray-500">{enrollment.studentEmail}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveEnrolledStudent(enrollment.id)}
                                                    className="text-red-600 hover:text-red-800 text-xs border border-red-200 bg-red-50 hover:bg-red-100 px-2 py-1 rounded"
                                                >
                                                    Remove
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Material Modal */}
            <Modal isOpen={showMaterialModal} onClose={() => setShowMaterialModal(false)} title="Course Materials">
                <div className="space-y-6">
                    <form onSubmit={handleUploadMaterial} className="space-y-4 bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-sm text-gray-700">Upload New Material</h4>
                        <input
                            type="text" required placeholder="Title"
                            value={newMaterial.title}
                            onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                            className="w-full border p-2 rounded text-sm"
                        />
                        <textarea
                            placeholder="Description (Optional)"
                            value={newMaterial.description}
                            onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                            className="w-full border p-2 rounded text-sm h-16"
                        />
                        <div className="flex gap-2 items-center">
                            <label className="flex-1 cursor-pointer bg-white border border-gray-300 px-3 py-2 rounded text-sm text-gray-600 hover:bg-gray-50 flex items-center justify-center truncate">
                                <Upload size={16} className="mr-2" />
                                {newMaterial.file ? newMaterial.file.name : "Choose File"}
                                <input type="file" className="hidden" onChange={(e) => setNewMaterial({ ...newMaterial, file: e.target.files[0] })} />
                            </label>
                            <button
                                type="submit" disabled={uploading}
                                className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:bg-blue-300"
                            >
                                {uploading ? 'Uploading...' : 'Upload'}
                            </button>
                        </div>
                    </form>

                    <div className="space-y-2">
                        <h4 className="font-medium text-sm text-gray-700">Uploaded Materials</h4>
                        {materials.length === 0 ? <p className="text-xs text-gray-500">No materials uploaded.</p> : (
                            <ul className="divide-y divide-gray-200">
                                {materials.map(m => (
                                    <li key={m.id} className="py-2 flex justify-between items-center">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{m.title}</p>
                                            <p className="text-xs text-gray-500">{m.description}</p>
                                        </div>
                                        <a
                                            href={`http://localhost:8086/api/materials/download/${m.fileUrl}`}
                                            target="_blank" rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 p-1"
                                            title="Download"
                                        >
                                            <Download size={18} />
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </Modal>

            {/* Student Upload Modal */}
            <Modal isOpen={showStudentUploadModal} onClose={() => setShowStudentUploadModal(false)} title="Upload Students">
                <form onSubmit={handleUploadStudents} className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-900">
                        <h4 className="font-bold mb-2">Excel File Requirements:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Format: <strong>.xlsx</strong> or .xls</li>
                            <li><strong>Row 1</strong>: Header (Name, Email)</li>
                            <li><strong>Column A</strong>: Student Full Name</li>
                            <li><strong>Column B</strong>: Student Email Address</li>
                        </ul>
                        <button
                            type="button"
                            onClick={async () => {
                                try {
                                    const res = await api.get('/api/courses/template/students', { responseType: 'blob' });
                                    const url = window.URL.createObjectURL(new Blob([res.data]));
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.setAttribute('download', 'students_template.xlsx');
                                    document.body.appendChild(link);
                                    link.click();
                                    link.remove();
                                } catch (e) {
                                    toast.error("Failed to download template");
                                }
                            }}
                            className="mt-2 text-blue-600 underline font-semibold flex items-center text-xs"
                        >
                            <Download size={14} className="mr-1" /> Download Student Template
                        </button>
                        <p className="mt-2 text-xs">Note: Valid emails will be enrolled. If the student doesn't exist, they will be registered with the provided name.</p>
                    </div>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <label className="mt-2 block text-sm font-medium text-blue-600 cursor-pointer hover:text-blue-500">
                            <span>Select Excel File</span>
                            <input type="file" className="hidden" accept=".xlsx, .xls" onChange={(e) => setStudentFile(e.target.files[0])} />
                        </label>
                        {studentFile && <p className="mt-2 text-sm text-gray-500">{studentFile.name}</p>}
                    </div>
                    <button
                        type="submit"
                        disabled={uploadingStudents || !studentFile}
                        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                    >
                        {uploadingStudents ? 'Processing...' : 'Upload Students'}
                    </button>
                </form>
            </Modal>

            {/* Add Student Modal */}
            <Modal isOpen={showAddStudentModal} onClose={() => setShowAddStudentModal(false)} title="Add Student Manually">
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
                    <button
                        type="submit"
                        disabled={addingStudent}
                        className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:bg-green-300"
                    >
                        {addingStudent ? 'Adding...' : 'Add Student'}
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default TeacherCourses;
