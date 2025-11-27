import React, { useState } from 'react';
import Upload from './components/Upload';
import Results from './components/Results';
import AnalysisView from './components/AnalysisView';
import Modal from './components/Modal';
import { Eye } from 'lucide-react';

function App() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [currentResult, setCurrentResult] = useState(null);
    const [selectedResult, setSelectedResult] = useState(null);

    const handleUploadSuccess = (result) => {
        setCurrentResult(result);
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

                <main className="space-y-12">
                    {/* Top Section: Upload or Current Analysis */}
                    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {currentResult ? (
                            <AnalysisView
                                result={currentResult}
                                onReset={() => setCurrentResult(null)}
                            />
                        ) : (
                            <Upload onUploadSuccess={handleUploadSuccess} />
                        )}
                    </section>

                    {/* Bottom Section: History */}
                    <section className="border-t border-slate-800 pt-8">
                        <Results
                            refreshTrigger={refreshTrigger}
                            onSelect={setSelectedResult}
                        />
                    </section>
                </main>

                {/* Modal for History Items */}
                <Modal isOpen={!!selectedResult} onClose={() => setSelectedResult(null)}>
                    <AnalysisView result={selectedResult} />
                </Modal>
            </div>
        </div>
    );
}

export default App;
