import React, { useState } from 'react';
import axios from 'axios';
import { Upload as UploadIcon, Loader2, AlertCircle } from 'lucide-react';

export default function Upload({ onUploadSuccess }) {
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFile = async (file) => {
        if (!file) return;

        setIsLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('image', file);

        try {
            await axios.post('/api/analyze', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            }).then(res => {
                onUploadSuccess(res.data);
            });
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Failed to upload image');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-sm">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <UploadIcon className="w-5 h-5 text-blue-400" />
                    New Analysis
                </h2>

                <label
                    className={`
            relative flex flex-col items-center justify-center w-full h-48 
            border-2 border-dashed rounded-lg cursor-pointer transition-all
            ${isDragging
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-slate-600 hover:border-slate-500 hover:bg-slate-700/50'
                        }
            ${isLoading ? 'opacity-50 pointer-events-none' : ''}
          `}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        handleFile(e.dataTransfer.files[0]);
                    }}
                >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                        {isLoading ? (
                            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-3" />
                        ) : (
                            <UploadIcon className="w-10 h-10 text-slate-400 mb-3" />
                        )}
                        <p className="mb-2 text-sm text-slate-400">
                            <span className="font-semibold text-slate-200">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-slate-500">JPG, PNG (Face images)</p>
                    </div>
                    <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFile(e.target.files[0])}
                        disabled={isLoading}
                    />
                </label>

                {error && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}
