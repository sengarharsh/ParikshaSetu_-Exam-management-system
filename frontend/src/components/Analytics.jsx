import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import Card from './Card';

const Analytics = ({ results }) => {
    // Transform results to chart data
    const data = results && results.length > 0
        ? results.map((r, index) => ({
            name: `Exam ${index + 1}`,
            score: r.score,
            total: r.totalMarks,
            avg: Math.round((r.score / r.totalMarks) * 100) // Percentage
        }))
        : [];

    if (data.length === 0) {
        return (
            <div className="mt-6">
                <Card title="Performance Trend">
                    <p className="text-gray-500 text-center py-10">No exam data available yet.</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <Card title="Performance Trend">
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="avg" stroke="#3B82F6" name="Percentage %" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <Card title="Subject Analysis">
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="score" fill="#3B82F6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
    );
};

export default Analytics;
