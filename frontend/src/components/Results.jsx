import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Activity, Eye, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function Results({ refreshTrigger }) {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchResults();
    }, [refreshTrigger]);

    const fetchResults = async () => {
        try {
            const res = await axios.get('/api/results');
            setResults(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading && results.length === 0) {
        return <div className="text-slate-400 text-center p-8">Loading history...</div>;
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                Recent Analysis
            </h2>

            <div className="grid gap-4">
                {results.map((item) => (
                    <div key={item.id} className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-slate-600 transition-colors">
                        <div className="p-4 flex gap-4 items-start">
                            {/* Image Preview */}
                            <div className="w-24 h-24 bg-slate-900 rounded-lg flex-shrink-0 overflow-hidden border border-slate-700">
                                <img
                                    src={`/api/uploads/${item.filename}`}
                                    alt="Analysis"
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.style.display = 'none' }}
                                />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-medium text-slate-200 truncate pr-4">
                                        {item.filename?.split('_').slice(1).join('_') || 'Unknown Image'}
                                    </h3>
                                    <span className="text-xs text-slate-500 whitespace-nowrap">
                                        {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'Just now'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                                    <Stat label="Eyes Detected" value={item.eye_count} />
                                    <Stat label="Symmetry" value={item.symmetry_score ? (item.symmetry_score * 100).toFixed(1) + '%' : 'N/A'} />
                                    <Stat
                                        label="Avg Openness"
                                        value={item.features?.length
                                            ? (item.features.reduce((acc, curr) => acc + curr.openness, 0) / item.features.length).toFixed(2)
                                            : '0.00'}
                                    />
                                    <Stat
                                        label="Avg Brightness"
                                        value={item.features?.length
                                            ? (item.features.reduce((acc, curr) => acc + curr.brightness, 0) / item.features.length).toFixed(0)
                                            : '0'}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Detailed Features (Collapsible or just listed) */}
                        {item.features && item.features.length > 0 && (
                            <div className="bg-slate-900/50 px-4 py-3 border-t border-slate-700/50 text-xs text-slate-400 flex gap-4 overflow-x-auto">
                                {item.features.map((eye, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <Eye className="w-3 h-3" />
                                        <span>Eye {idx + 1}: Conf {(eye.confidence * 100).toFixed(0)}%</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                {results.length === 0 && (
                    <div className="text-center py-12 bg-slate-800/50 rounded-xl border border-dashed border-slate-700">
                        <p className="text-slate-400">No analysis history found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function Stat({ label, value }) {
    return (
        <div>
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <p className="font-mono text-sm font-medium text-slate-200">{value}</p>
        </div>
    );
}
