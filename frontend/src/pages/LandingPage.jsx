import React from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Shield, TrendingUp, Users } from "lucide-react";

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white">

            {/* Navbar */}
            <nav className="bg-white border-b shadow-sm fixed w-full z-10">
                <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">

                    <div className="flex items-center">
                        <BookOpen className="h-8 w-8 text-blue-600" />
                        <span className="ml-2 text-2xl font-bold text-blue-600">
                            ParikshaSetu
                        </span>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => navigate("/login")}
                            className="text-gray-600 hover:text-blue-600 font-medium"
                        >
                            Login
                        </button>

                        <button
                            onClick={() => navigate("/register")}
                            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                            Get Started
                        </button>
                    </div>

                </div>
            </nav>


            {/* Hero */}
            <div className="relative pt-32 pb-28 overflow-hidden">

                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50"></div>

                <div className="absolute -top-20 -left-20 w-72 h-72 bg-blue-200 rounded-full blur-3xl opacity-30"></div>
                <div className="absolute bottom-0 -right-20 w-72 h-72 bg-indigo-200 rounded-full blur-3xl opacity-30"></div>

                <div className="relative max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">

                    {/* Text */}
                    <div>

                        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
                            Smart & Secure <br />
                            <span className="text-blue-600">Online Examination</span>
                        </h1>

                        <p className="text-lg text-gray-600 mb-8 max-w-xl">
                            Conduct exams with full integrity, real-time analytics,
                            automated evaluation, and leaderboards.
                        </p>

                        <div className="flex gap-4">
                            <button
                                onClick={() => navigate("/register")}
                                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition"
                            >
                                Start Free
                            </button>

                            <button
                                onClick={() => navigate("/login")}
                                className="px-8 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
                            >
                                Login
                            </button>
                        </div>

                    </div>

                    {/* Image */}
                    <div className="flex justify-center">
                        <img
                            src="/assets/exam-dashboard.png"
                            alt="Dashboard"
                            className="w-full max-w-md rounded-xl shadow-2xl border"
                        />
                    </div>

                </div>
            </div>


            {/* Features */}
            <div className="py-20 bg-gray-50">

                <div className="max-w-7xl mx-auto px-4">

                    <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
                        Why ParikshaSetu?
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8">

                        <Feature
                            icon={<Shield className="text-blue-600 w-8 h-8" />}
                            title="Anti-Cheating"
                            desc="Tab-switch detection and monitoring."
                        />

                        <Feature
                            icon={<TrendingUp className="text-green-600 w-8 h-8" />}
                            title="Analytics"
                            desc="Performance insights and reports."
                        />

                        <Feature
                            icon={<Users className="text-purple-600 w-8 h-8" />}
                            title="Scalable"
                            desc="Supports thousands of users."
                        />

                    </div>

                </div>
            </div>


            {/* Stats */}
            <div className="py-16 bg-white">

                <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">

                    <Stat value="10K+" label="Students" />
                    <Stat value="500+" label="Teachers" />
                    <Stat value="50K+" label="Exams" />
                    <Stat value="99.9%" label="Uptime" />

                </div>
            </div>


            {/* CTA */}
            <div className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center">

                <h2 className="text-4xl font-bold mb-4">
                    Ready to Start?
                </h2>

                <p className="max-w-xl mx-auto mb-8 text-blue-100">
                    Join institutions using ParikshaSetu for smart assessments.
                </p>

                <button
                    onClick={() => navigate("/register")}
                    className="bg-white text-blue-600 px-8 py-3 font-semibold rounded-lg shadow hover:bg-gray-100 transition"
                >
                    Create Account
                </button>

            </div>


            {/* Footer */}
            <footer className="bg-white border-t py-10 text-center text-gray-500">

                <div className="flex justify-center items-center mb-3">
                    <BookOpen className="h-5 w-5 mr-2" />
                    <span className="font-semibold">ParikshaSetu</span>
                </div>

                <p>© 2026 ParikshaSetu. All rights reserved.</p>

            </footer>

        </div>
    );
};


/* Components */

const Feature = ({ icon, title, desc }) => (
    <div className="bg-white p-8 rounded-xl shadow border hover:shadow-md transition">

        <div className="mb-4 bg-gray-50 w-14 h-14 rounded-full flex items-center justify-center">
            {icon}
        </div>

        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-500">{desc}</p>

    </div>
);


const Stat = ({ value, label }) => (
    <div>
        <h3 className="text-4xl font-extrabold text-blue-600">{value}</h3>
        <p className="mt-2 text-gray-600 font-medium">{label}</p>
    </div>
);

export default LandingPage;
