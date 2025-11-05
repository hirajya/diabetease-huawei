'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface AnalysisResult {
  success: boolean;
  ingredients: string[];
  rawResponse: string;
  modelUsed?: string;
  error?: string;
  suggestion?: string;
}

export default function Scanner() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [pendingStream, setPendingStream] = useState<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // When camera becomes active, attach the pending stream to the video element
  useEffect(() => {
    if (isCameraActive && pendingStream && videoRef.current) {
      console.log('🎬 useEffect: Attaching stream to video element...');
      videoRef.current.srcObject = pendingStream;
      console.log('✅ useEffect: Stream attached successfully');
      setPendingStream(null);
    }
  }, [isCameraActive, pendingStream]);

  const startCamera = async () => {
    try {
      console.log('🎥 Starting camera...');
      setCameraError(null);
      
      // Stop any existing stream
      stopCamera();
      
      // Request camera FIRST
      const constraints = {
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      };
      
      console.log('📱 Requesting user media with constraints:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('✅ Stream obtained successfully:', stream);
      
      // Store the stream and then activate camera (which renders the video element)
      setPendingStream(stream);
      console.log('📹 Pending stream stored, activating camera...');
      setIsCameraActive(true);
      console.log('✅ Camera active state set');
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ Camera error:', errorMessage);
      setCameraError(`Camera Error: ${errorMessage}`);
      setIsCameraActive(false);
      alert(`Camera Error: ${errorMessage}\n\nMake sure:\n1. You granted camera permission\n2. No other app is using the camera\n3. You're on localhost or HTTPS`);
    }
  };

  const stopCamera = () => {
    console.log('🛑 Stopping camera...');
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('Track stopped:', track.kind);
      });
      videoRef.current.srcObject = null;
    }
    if (pendingStream) {
      pendingStream.getTracks().forEach(track => {
        track.stop();
        console.log('Pending track stopped:', track.kind);
      });
      setPendingStream(null);
    }
    setIsCameraActive(false);
    setCameraError(null);
  };

  const capturePhoto = async () => {
    try {
      console.log('📸 Capturing photo...');
      
      if (!videoRef.current || !canvasRef.current) {
        console.error('❌ Video or canvas ref not available');
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas size to match video
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      console.log(`Canvas size: ${canvas.width}x${canvas.height}`);
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('❌ Cannot get canvas context');
        return;
      }

      // Draw the video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      console.log('✅ Frame drawn to canvas');
      
      // Convert to blob
      canvas.toBlob(
        async (blob) => {
          if (blob) {
            console.log('✅ Blob created:', blob.size, 'bytes');
            const imageUrl = URL.createObjectURL(blob);
            setSelectedImage(imageUrl);
            stopCamera();
            await analyzeImage(blob);
          } else {
            console.error('❌ Failed to create blob');
          }
        },
        'image/jpeg',
        0.9
      );
    } catch (error) {
      console.error('❌ Capture error:', error);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('📂 File selected:', file.name, file.size, 'bytes');
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      analyzeImage(file);
    }
  };

  const analyzeImage = async (imageFile: File | Blob) => {
    try {
      console.log('🤖 Analyzing image...');
      setIsAnalyzing(true);
      setAnalysisResult(null);
      
      const formData = new FormData();
      formData.append('image', imageFile);
      
      console.log('📤 Sending to API...');
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        body: formData,
      });
      
      console.log('📥 Response status:', response.status);
      const result = await response.json();
      console.log('✅ Analysis result:', result);
      
      setAnalysisResult(result);
    } catch (error) {
      console.error('❌ Analysis error:', error);
      setAnalysisResult({
        success: false,
        ingredients: [],
        rawResponse: '',
        error: 'Failed to analyze image'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearResults = () => {
    setAnalysisResult(null);
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            AI Food Scanner
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Scan food labels with AI to instantly extract ingredients.
          </p>
          <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            🤖 Vision AI • ☁️ Cloud API • ⚡ Fast
          </div>
        </div>

        {/* Debug Panel */}
        {cameraError && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 rounded-lg text-red-800">
            <strong>⚠️ Error:</strong> {cameraError}
          </div>
        )}

        {/* Scanner Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Camera/Scanner Area */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Scan Product
            </h2>
            
            {!isCameraActive && !selectedImage && (
              <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-center text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0118.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="mb-4">Take a photo or upload an image</p>
                  <p className="text-sm">Position the nutrition label in the frame</p>
                </div>
              </div>
            )}

            {isCameraActive && (
              <div className="h-80 bg-black rounded-lg mb-6 relative overflow-hidden flex items-center justify-center">
                <video 
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  onLoadedMetadata={() => console.log('✅ Video metadata loaded')}
                  onPlay={() => console.log('✅ Video playing')}
                  onError={(e) => console.error('❌ Video error:', e)}
                />
                
                {/* Debug info overlay */}
                <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-3 py-2 rounded">
                  <div>Camera Active</div>
                  <div>{videoRef.current?.videoWidth}x{videoRef.current?.videoHeight}</div>
                </div>
                
                <button
                  onClick={capturePhoto}
                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white text-gray-900 px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors shadow-lg text-lg"
                >
                  📸 Capture Photo
                </button>
              </div>
            )}

            {selectedImage && (
              <div className="h-80 bg-gray-100 rounded-lg mb-6 relative overflow-hidden">
                <Image 
                  src={selectedImage} 
                  alt="Selected food item"
                  fill
                  className="object-cover"
                />
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                    <div className="text-white text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                      <p>Analyzing ingredients...</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-4 flex-wrap">
              {!isCameraActive ? (
                <>
                  <button 
                    onClick={startCamera}
                    className="flex-1 min-w-32 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md transition-colors font-medium"
                  >
                    📷 Start Camera
                  </button>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 min-w-32 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-md transition-colors font-medium"
                  >
                    📁 Upload Photo
                  </button>
                </>
              ) : (
                <button 
                  onClick={stopCamera}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-md transition-colors font-medium"
                >
                  🛑 Stop Camera
                </button>
              )}
              {(selectedImage || analysisResult) && (
                <button 
                  onClick={clearResults}
                  className="flex-1 min-w-32 bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-4 rounded-md transition-colors font-medium"
                >
                  🗑️ Clear
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Analysis Results */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Ingredients Analysis
            </h2>
            
            {!analysisResult && !isAnalyzing && (
              <div className="h-80 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  <p>AI analysis results will appear here</p>
                </div>
              </div>
            )}

            {isAnalyzing && (
              <div className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 font-medium">Analyzing with AI...</p>
                </div>
              </div>
            )}

            {analysisResult && (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {analysisResult.success ? (
                  <>
                    <div>
                      <h3 className="text-lg font-semibold text-green-700 mb-3">
                        ✅ Ingredients Found ({analysisResult.ingredients.length})
                      </h3>
                      <div className="grid grid-cols-1 gap-2">
                        {analysisResult.ingredients.map((ingredient, index) => (
                          <div 
                            key={index}
                            className="bg-green-50 border border-green-200 rounded-md p-3 text-green-800"
                          >
                            • {ingredient}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {analysisResult.modelUsed && (
                      <div className="text-xs text-gray-500 border-t pt-2">
                        Model: {analysisResult.modelUsed}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-red-600 font-medium mb-2">⚠️ {analysisResult.error}</p>
                    {analysisResult.suggestion && (
                      <p className="text-sm text-gray-600">{analysisResult.suggestion}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}