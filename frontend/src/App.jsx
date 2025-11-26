import React, { useState, useEffect } from 'react';
import Upload from './components/Upload';
import Results from './components/Results';
import { Eye } from 'lucide-react';

function App() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleUploadSuccess = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <header className="flex items-center gap-3 border-b border-slate-700 pb-6">
                    <div className="p-3 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20">
                        <Eye className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Eye Region Detector</h1>
                        <p className="text-slate-400">Analyze eye features using YOLO & Python</p>
                    </div>
                </header>

                <main className="grid gap-8 md:grid-cols-[350px_1fr]">
                    <aside>
                        <Upload onUploadSuccess={handleUploadSuccess} />
                    </aside>
                    <section>
                        <Results refreshTrigger={refreshTrigger} />
                    </section>
                </main>
            </div>
        </div>
    );
}

export default App;
