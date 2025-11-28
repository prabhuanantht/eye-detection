import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Upload as UploadIcon, Loader2, AlertCircle, Camera, X, RefreshCw } from 'lucide-react';

export default function Upload({ onUploadSuccess }) {
    const [mode, setMode] = useState('upload'); // 'upload' | 'camera'
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Camera refs and state
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);

    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    const startCamera = async () => {
        try {
            setError(null);
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            setError("Could not access camera. Please check permissions.");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const handleModeChange = (newMode) => {
        setMode(newMode);
        setError(null);
        if (newMode === 'camera') {
            startCamera();
        } else {
            stopCamera();
            setCapturedImage(null);
        }
    };

    const captureImage = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            // Set canvas dimensions to match video
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Draw video frame to canvas
            const context = canvas.getContext('2d');
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Convert to blob/file
            canvas.toBlob((blob) => {
                const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
                setCapturedImage(file);
                stopCamera(); // Stop stream after capture
            }, 'image/jpeg');
        }
    };

    const retake = () => {
        setCapturedImage(null);
        startCamera();
    };

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
                // Reset state after success
                if (mode === 'camera') {
                    setCapturedImage(null);
                    startCamera();
                }
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
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        {mode === 'upload' ? <UploadIcon className="w-5 h-5 text-blue-400" /> : <Camera className="w-5 h-5 text-blue-400" />}
                        New Analysis
                    </h2>

                    {/* Mode Toggle */}
                    <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700">
                        <button
                            onClick={() => handleModeChange('upload')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${mode === 'upload'
                                    ? 'bg-slate-700 text-white shadow-sm'
                                    : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            Upload
                        </button>
                        <button
                            onClick={() => handleModeChange('camera')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${mode === 'camera'
                                    ? 'bg-slate-700 text-white shadow-sm'
                                    : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            Camera
                        </button>
                    </div>
                </div>

                {mode === 'upload' ? (
                    <label
                        className={`
                            relative flex flex-col items-center justify-center w-full h-64
                            border-2 border-dashed rounded-xl cursor-pointer transition-all
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
                ) : (
                    <div className="flex flex-col items-center space-y-4">
                        <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-slate-700">
                            {!capturedImage ? (
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover transform scale-x-[-1]" // Mirror effect
                                />
                            ) : (
                                <img
                                    src={URL.createObjectURL(capturedImage)}
                                    alt="Captured"
                                    className="w-full h-full object-cover transform scale-x-[-1]"
                                />
                            )}

                            {/* Hidden canvas for capture */}
                            <canvas ref={canvasRef} className="hidden" />

                            {isLoading && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                                </div>
                            )}
                        </div>

                        <div className="flex gap-4">
                            {!capturedImage ? (
                                <button
                                    onClick={captureImage}
                                    disabled={!stream || isLoading}
                                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Camera className="w-4 h-4" />
                                    Capture
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={retake}
                                        disabled={isLoading}
                                        className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg font-medium transition-colors disabled:opacity-50"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        Retake
                                    </button>
                                    <button
                                        onClick={() => handleFile(capturedImage)}
                                        disabled={isLoading}
                                        className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                                    >
                                        <UploadIcon className="w-4 h-4" />
                                        Analyze
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}

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
