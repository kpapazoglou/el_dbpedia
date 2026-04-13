import { useState, useEffect } from 'react';
import axios from 'axios';

const StatsDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); //  Κρατάμε το σφάλμα

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get('http://localhost:8080/stats');
                setStats(response.data);
            } catch (err) {
                console.error("Σφάλμα στατιστικών:", err);
                setError(err.message); // Αποθηκεύουμε το μήνυμα λάθους
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    // 1. Δείχνει ότι φορτώνει
    //if (loading) return <div className="text-sm text-gray-500 mb-4 animate-pulse">Φόρτωση στατιστικών από Backend...</div>;
    
    // 2. ΝΕΟ: Αν χτυπήσει λάθος, το δείχνει στην οθόνη!
    //if (error) return <div className="p-3 mb-6 text-sm text-red-700 bg-red-100 border border-red-400 rounded">Σφάλμα σύνδεσης με Backend: {error}</div>;

    if (!stats) return null;

    // 3. Αν όλα πάνε καλά, δείχνει τις κάρτες
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border border-gray-200 rounded p-4 shadow-sm border-t-4 border-t-blue-600">
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Νησιά</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total_islands}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded p-4 shadow-sm border-t-4 border-t-green-600">
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Μουσεία</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total_museums}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded p-4 shadow-sm border-t-4 border-t-yellow-500">
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Ομάδες</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total_teams}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded p-4 shadow-sm border-t-4 border-t-purple-600">
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Χρόνος (ms)</p>
                <p className="text-2xl font-bold text-purple-700">{stats.processing_time_ms}</p>
            </div>
        </div>
    );
};

export default StatsDashboard;