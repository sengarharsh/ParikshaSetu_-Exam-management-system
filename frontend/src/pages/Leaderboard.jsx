import React from 'react';
import Card from '../components/Card';
import api from '../api';

const Leaderboard = () => {
    const [rankings, setRankings] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const [resultsRes, usersRes] = await Promise.all([
                    api.get('/api/results'),
                    api.get('/api/users')
                ]);

                const results = resultsRes.data;
                const users = usersRes.data;

                // Map results to user names
                const userScores = {};
                results.forEach(r => {
                    if (!userScores[r.studentId]) userScores[r.studentId] = 0;
                    userScores[r.studentId] += r.score;
                });

                const sorted = Object.keys(userScores)
                    .map(id => {
                        const user = users.find(u => u.id === parseInt(id));
                        return {
                            id: id,
                            name: user ? user.fullName || user.email : 'Unknown',
                            score: userScores[id],
                            exam: 'All Arguments' // Simplified
                        };
                    })
                    .sort((a, b) => b.score - a.score)
                    .map((item, index) => ({ ...item, rank: index + 1 }));

                setRankings(sorted);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div>Loading Leaderboard...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">Leaderboard</h1>

            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Score</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {rankings.map((r, idx) => (
                                <tr key={idx}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center justify-center h-8 w-8 rounded-full font-bold text-white ${idx === 0 ? 'bg-yellow-400' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-orange-400' : 'bg-blue-200 text-blue-800'}`}>
                                            {r.rank}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{r.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{r.score}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default Leaderboard;
