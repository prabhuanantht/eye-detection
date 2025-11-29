import React from 'react';
import { Eye, Activity, RotateCcw } from 'lucide-react';

export default function AnalysisView({ result, onReset }) {
    if (!result) return null;

    // Use marked_filename if available, otherwise fallback to original
    const imageFilename = result.marked_filename || result.filename;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Activity className="w-6 h-6 text-emerald-400" />
                    Analysis Result
                </h2>
                {onReset && (
                    <button
                        onClick={onReset}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors text-sm font-medium"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Analyze Another
                    </button>
                )}
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Main Image */}
                <div className="bg-black rounded-xl overflow-hidden border border-slate-700 shadow-lg aspect-video flex items-center justify-center">
                    <img
                        src={`/api/uploads/${imageFilename}`}
                        alt="Analyzed Face"
                        className="max-w-full max-h-full object-contain"
                    />
                </div>

                {/* Stats & Details */}
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <StatCard label="Eyes Detected" value={result.eye_count} />
                        <StatCard
                            label="Symmetry Score"
                            value={result.symmetry_score ? (result.symmetry_score * 100).toFixed(1) + '%' : 'N/A'}
                            highlight={result.symmetry_score > 0.9}
                        />
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Detailed Features</h3>
                        <div className="space-y-3">
                            {result.features?.map((eye, idx) => (
                                <div key={idx} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                                    <div className="flex items-center gap-2 mb-2 text-emerald-400 font-medium">
                                        <Eye className="w-4 h-4" />
                                        Eye {idx + 1}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-slate-500 block text-xs">Openness</span>
                                            <span className="text-slate-200 font-mono">{eye.openness.toFixed(2)}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500 block text-xs">Brightness</span>
                                            <span className="text-slate-200 font-mono">{eye.brightness.toFixed(0)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, highlight }) {
    return (
        <div className={`p-4 rounded-xl border ${highlight ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-slate-800 border-slate-700'}`}>
            <p className="text-sm text-slate-400 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${highlight ? 'text-emerald-400' : 'text-white'}`}>{value}</p>
        </div>
    );
}
