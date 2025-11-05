'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface AnalysisResult {
  success: boolean;
  ingredients: string[];
  rawResponse: string;
  modelUsed?: string;
  error?: string;
  suggestion?: string;
}

interface MealRecommendation {
  id: string;
  name: string;
  description: string;
  plateMethod: {
    vegetables: string[];
    protein: string[];
    carbohydrates: string[];
  };
  suitabilityScore: number;
  cookingTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  servings: number;
}

interface NutritionalFacts {
  calories: number;
  carbohydrates: number;
  protein: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  glycemicIndex: number;
}

interface CookingInstruction {
  step: number;
  instruction: string;
  time?: string;
  temperature?: string;
}

interface MealDetails {
  id: string;
  name: string;
  description: string;
  servings: number;
  cookingTime: string;
  difficulty: string;
  nutritionalFacts: NutritionalFacts;
  ingredients: string[];
  cookingInstructions: CookingInstruction[];
  diabeticTips: string[];
  plateMethodBreakdown: {
    vegetables: { items: string[]; percentage: number };
    protein: { items: string[]; percentage: number };
    carbohydrates: { items: string[]; percentage: number };
  };
}

export default function Scanner() {
  // Existing states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [pendingStream, setPendingStream] = useState<MediaStream | null>(null);
  
  // New states for meal recommendations
  const [isLoadingMeals, setIsLoadingMeals] = useState(false);
  const [mealRecommendations, setMealRecommendations] = useState<MealRecommendation[]>([]);
  const [showMeals, setShowMeals] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<MealDetails | null>(null);
  const [isLoadingMealDetails, setIsLoadingMealDetails] = useState(false);
  const [showMoreMeals, setShowMoreMeals] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const stopCamera = useCallback(() => {
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
  }, [pendingStream]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

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
      
      stopCamera();
      
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

  const capturePhoto = async () => {
    try {
      console.log('📸 Capturing photo...');
      
      if (!videoRef.current || !canvasRef.current) {
        console.error('❌ Video or canvas ref not available');
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      console.log(`Canvas size: ${canvas.width}x${canvas.height}`);
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('❌ Cannot get canvas context');
        return;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      console.log('✅ Frame drawn to canvas');
      
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
      console.log('🤖 Analyzing image with Qwen VLM...');
      setIsAnalyzing(true);
      setAnalysisResult(null);
      setShowMeals(false);
      setMealRecommendations([]);
      
      const formData = new FormData();
      formData.append('image', imageFile);
      
      console.log('📤 Sending to Qwen VLM API...');
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        body: formData,
      });
      
      console.log('📥 Response status:', response.status);
      const result = await response.json();
      console.log('✅ Analysis result:', result);
      
      setAnalysisResult(result);
      
      // Automatically get meal recommendations if ingredients found
      if (result.success && result.ingredients && result.ingredients.length > 0) {
        await getMealRecommendations(result.ingredients);
      }
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

  const getMealRecommendations = async (ingredients: string[]) => {
    try {
      console.log('🍽️ Getting meal recommendations from DeepSeek...');
      setIsLoadingMeals(true);
      
      const response = await fetch('/api/meal-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ingredients }),
      });
      
      const result = await response.json();
      console.log('✅ Meal recommendations result:', result);
      
      if (result.success && result.meals) {
        setMealRecommendations(result.meals);
        setShowMeals(true);
      }
    } catch (error) {
      console.error('❌ Meal recommendations error:', error);
    } finally {
      setIsLoadingMeals(false);
    }
  };

  const getMealDetails = async (meal: MealRecommendation) => {
    try {
      console.log('📋 Getting meal details...');
      setIsLoadingMealDetails(true);
      
      const response = await fetch('/api/meal-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          mealId: meal.id,
          mealName: meal.name 
        }),
      });
      
      const result = await response.json();
      console.log('✅ Meal details result:', result);
      
      if (result.success && result.mealDetails) {
        setSelectedMeal(result.mealDetails);
      }
    } catch (error) {
      console.error('❌ Meal details error:', error);
    } finally {
      setIsLoadingMealDetails(false);
    }
  };

  const clearResults = () => {
    setAnalysisResult(null);
    setSelectedImage(null);
    setShowMeals(false);
    setMealRecommendations([]);
    setSelectedMeal(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayedMeals = showMoreMeals ? mealRecommendations : mealRecommendations.slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            🍽️ Diabetic Meal Planner
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-4">
            Scan ingredients with AI, get personalized Type 2 diabetes meal recommendations using the plate method
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              🤖 Qwen VLM • 🧠 DeepSeek • ⚡ Instant
            </div>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              🍽️ Plate Method • 🩺 Diabetic-Friendly
            </div>
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
              📸 Scan Ingredients
            </h2>
            
            {!isCameraActive && !selectedImage && (
              <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-center text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0118.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="mb-4">Take a photo or upload an image</p>
                  <p className="text-sm">Position food items or ingredient labels in the frame</p>
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
                
                <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-3 py-2 rounded">
                  <div>📹 Camera Active</div>
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
                      <p>🤖 Analyzing with Qwen VLM...</p>
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
              {(selectedImage || analysisResult || showMeals) && (
                <button 
                  onClick={clearResults}
                  className="flex-1 min-w-32 bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-4 rounded-md transition-colors font-medium"
                >
                  🗑️ Clear All
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
              🔍 Ingredients Found
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
                  <p className="text-gray-600 font-medium">🤖 Analyzing with Qwen VLM...</p>
                  <p className="text-sm text-gray-500 mt-2">Extracting ingredients from your image</p>
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
                        🤖 Model: {analysisResult.modelUsed}
                      </div>
                    )}

                    {/* Loading meal recommendations */}
                    {isLoadingMeals && (
                      <div className="border-t pt-4">
                        <div className="flex items-center justify-center py-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                          <p className="text-blue-600 font-medium">🧠 Getting meal recommendations from DeepSeek...</p>
                        </div>
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

        {/* Meal Recommendations Section */}
        {showMeals && mealRecommendations.length > 0 && (
          <div className="bg-white p-8 rounded-lg shadow-md mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">
                🍽️ Diabetic Meal Recommendations
              </h2>
              <div className="text-sm text-gray-500">
                Using the diabetes plate method • {mealRecommendations.length} options available
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {displayedMeals.map((meal) => (
                <div 
                  key={meal.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-white to-gray-50"
                  onClick={() => getMealDetails(meal)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 flex-1">
                      {meal.name}
                    </h3>
                    <div className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                      {meal.suitabilityScore}/10
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4">
                    {meal.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="text-xs">
                      <span className="text-green-600 font-medium">🥬 Vegetables:</span> {meal.plateMethod.vegetables.slice(0, 2).join(', ')}
                      {meal.plateMethod.vegetables.length > 2 && '...'}
                    </div>
                    <div className="text-xs">
                      <span className="text-blue-600 font-medium">🥩 Protein:</span> {meal.plateMethod.protein.slice(0, 2).join(', ')}
                    </div>
                    <div className="text-xs">
                      <span className="text-orange-600 font-medium">🌾 Carbs:</span> {meal.plateMethod.carbohydrates.slice(0, 2).join(', ')}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>⏱️ {meal.cookingTime}</span>
                    <span>👨‍🍳 {meal.difficulty}</span>
                    <span>🍽️ {meal.servings} serving{meal.servings > 1 ? 's' : ''}</span>
                  </div>
                  
                  <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors text-sm font-medium">
                    📋 View Recipe & Nutrition
                  </button>
                </div>
              ))}
            </div>

            {mealRecommendations.length > 6 && (
              <div className="text-center">
                <button
                  onClick={() => setShowMoreMeals(!showMoreMeals)}
                  className="bg-gray-600 hover:bg-gray-700 text-white py-3 px-8 rounded-md transition-colors font-medium"
                >
                  {showMoreMeals ? '📄 Show Less' : `📄 See More (${mealRecommendations.length - 6} more options)`}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Meal Details Modal */}
        {selectedMeal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {isLoadingMealDetails ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 font-medium">🧠 Loading detailed recipe from DeepSeek...</p>
                </div>
              ) : (
                <div className="p-8">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        {selectedMeal.name}
                      </h2>
                      <p className="text-gray-600">{selectedMeal.description}</p>
                    </div>
                    <button
                      onClick={() => setSelectedMeal(null)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded-full transition-colors"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Nutritional Facts */}
                    <div className="lg:col-span-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">📊 Nutritional Facts</h3>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                        <div className="flex justify-between">
                          <span>Calories:</span>
                          <span className="font-medium">{selectedMeal.nutritionalFacts.calories}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Carbs:</span>
                          <span className="font-medium">{selectedMeal.nutritionalFacts.carbohydrates}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Protein:</span>
                          <span className="font-medium">{selectedMeal.nutritionalFacts.protein}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fat:</span>
                          <span className="font-medium">{selectedMeal.nutritionalFacts.fat}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fiber:</span>
                          <span className="font-medium">{selectedMeal.nutritionalFacts.fiber}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sugar:</span>
                          <span className="font-medium">{selectedMeal.nutritionalFacts.sugar}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sodium:</span>
                          <span className="font-medium">{selectedMeal.nutritionalFacts.sodium}mg</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span>Glycemic Index:</span>
                          <span className="font-medium text-green-600">{selectedMeal.nutritionalFacts.glycemicIndex}</span>
                        </div>
                      </div>

                      {/* Plate Method Breakdown */}
                      <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-3">🍽️ Plate Method</h4>
                      <div className="space-y-3">
                        <div className="bg-green-50 p-3 rounded">
                          <div className="font-medium text-green-800">🥬 Vegetables ({selectedMeal.plateMethodBreakdown.vegetables.percentage}%)</div>
                          <div className="text-sm text-green-600">{selectedMeal.plateMethodBreakdown.vegetables.items.join(', ')}</div>
                        </div>
                        <div className="bg-blue-50 p-3 rounded">
                          <div className="font-medium text-blue-800">🥩 Protein ({selectedMeal.plateMethodBreakdown.protein.percentage}%)</div>
                          <div className="text-sm text-blue-600">{selectedMeal.plateMethodBreakdown.protein.items.join(', ')}</div>
                        </div>
                        <div className="bg-orange-50 p-3 rounded">
                          <div className="font-medium text-orange-800">🌾 Carbohydrates ({selectedMeal.plateMethodBreakdown.carbohydrates.percentage}%)</div>
                          <div className="text-sm text-orange-600">{selectedMeal.plateMethodBreakdown.carbohydrates.items.join(', ')}</div>
                        </div>
                      </div>
                    </div>

                    {/* Ingredients & Instructions */}
                    <div className="lg:col-span-2">
                      {/* Ingredients */}
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">🛒 Ingredients</h3>
                      <div className="bg-gray-50 p-4 rounded-lg mb-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {selectedMeal.ingredients.map((ingredient, index) => (
                            <div key={index} className="text-sm">
                              • {ingredient}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Cooking Instructions */}
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">👨‍🍳 Cooking Instructions</h3>
                      <div className="space-y-4 mb-6">
                        {selectedMeal.cookingInstructions.map((instruction) => (
                          <div key={instruction.step} className="border-l-4 border-blue-500 pl-4">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                                {instruction.step}
                              </span>
                              {instruction.time && (
                                <span className="text-sm text-gray-500">⏱️ {instruction.time}</span>
                              )}
                              {instruction.temperature && (
                                <span className="text-sm text-gray-500">🌡️ {instruction.temperature}</span>
                              )}
                            </div>
                            <p className="text-gray-700">{instruction.instruction}</p>
                          </div>
                        ))}
                      </div>

                      {/* Diabetic Tips */}
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">🩺 Diabetic Tips</h3>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <ul className="space-y-2">
                          {selectedMeal.diabeticTips.map((tip, index) => (
                            <li key={index} className="text-sm text-blue-800">
                              💡 {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button
                      onClick={() => setSelectedMeal(null)}
                      className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md transition-colors font-medium"
                    >
                      Close Recipe
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}