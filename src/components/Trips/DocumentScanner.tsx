import React, { useState, useRef } from 'react';
import { Camera, Upload, FileText, Loader2, CheckCircle2, AlertCircle, X, MapPin, Calendar, Clock, User, Hash, Building2, Save } from 'lucide-react';
import { scanTravelDocument, ScannedDocument, saveScannedDocument } from '../../services/geminiScannerService';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useAuth } from '../Auth/AuthContext';

interface DocumentScannerProps {
  onSave?: () => void;
}

export const DocumentScanner: React.FC<DocumentScannerProps> = ({ onSave }) => {
  const { user } = useAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<ScannedDocument | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      toast.error('Please upload an image or PDF document.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      
      let finalBase64 = base64;
      // Only compress if it's an image
      if (file.type.startsWith('image/')) {
        try {
          finalBase64 = await compressImage(base64);
        } catch (error) {
          console.error('Compression failed, using original image:', error);
          // Fallback to original if compression fails
        }
      }
      
      setPreviewUrl(finalBase64);
      setResult(null);
      await processDocument(finalBase64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const compressImage = (base64: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(base64);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = (e) => reject(e);
    });
  };

  const processDocument = async (base64: string, mimeType: string) => {
    setIsScanning(true);
    try {
      const data = await scanTravelDocument(base64, mimeType);
      setResult(data);
      toast.success('Document scanned successfully!');
    } catch (error: any) {
      console.error('Full Scan Error:', error);
      let errorMessage = 'Failed to scan document. Please try again.';
      
      if (error?.message?.includes('API Key is missing')) {
        errorMessage = 'AI configuration issue: API Key is missing in Secrets.';
      } else if (error?.message?.includes('API key')) {
        errorMessage = 'AI service error. Please check your API key in Secrets.';
      } else if (error?.message?.includes('too large')) {
        errorMessage = 'The file is too large for the AI to process.';
      } else if (error?.message?.includes('429') || error?.message?.includes('quota')) {
        errorMessage = 'AI Quota Exceeded: You have reached the limit for your Gemini API key. Please wait a moment or check your billing in Google AI Studio.';
      } else if (error?.message) {
        // Show the actual error message if it's available and not too long
        errorMessage = error.message.length < 150 ? error.message : `AI Error: ${error.message.substring(0, 100)}...`;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsScanning(false);
    }
  };

  const handleRetry = () => {
    if (previewUrl) {
      const mimeType = previewUrl.startsWith('data:application/pdf') ? 'application/pdf' : 'image/jpeg';
      processDocument(previewUrl, mimeType);
    }
  };

  const resetScanner = () => {
    setPreviewUrl(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async () => {
    if (!user || !result) return;
    
    setIsSaving(true);
    try {
      // We save the base64 image to Firestore for now. 
      // Note: Firestore has a 1MB limit per document.
      await saveScannedDocument(user.uid, result, previewUrl);
      toast.success('Document saved to your vault!');
      if (onSave) onSave();
      resetScanner();
    } catch (error) {
      console.error(error);
      toast.error('Failed to save document. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-indigo-600 p-6 text-white">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Smart Document Scanner
          </h2>
          <p className="text-indigo-100 text-sm mt-1">
            Upload your tickets or ID proofs for instant extraction.
          </p>
        </div>

        <div className="p-6">
          {!previewUrl ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-2xl p-12 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
            >
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-indigo-600" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900">Click to upload or drag & drop</p>
                <p className="text-sm text-gray-500">Supports JPG, PNG, PDF</p>
              </div>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,application/pdf"
              />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Preview & Status */}
              <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-video flex items-center justify-center border border-gray-200">
                {previewUrl.startsWith('data:application/pdf') ? (
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="w-12 h-12 text-gray-400" />
                    <span className="text-sm font-medium text-gray-600">PDF Document</span>
                  </div>
                ) : (
                  <img src={previewUrl} alt="Preview" className="max-h-full object-contain" />
                )}
                
                {isScanning && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-white gap-3 p-6 text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
                    <div className="space-y-1">
                      <p className="font-bold text-lg animate-pulse">AI is analyzing...</p>
                      <p className="text-xs text-indigo-200">Extracting tickets, dates, and booking details</p>
                    </div>
                  </div>
                )}

                {!isScanning && !result && previewUrl && (
                  <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] flex flex-col items-center justify-center gap-4">
                    <button 
                      onClick={handleRetry}
                      className="px-6 py-3 bg-white text-indigo-600 rounded-full font-bold shadow-xl hover:bg-indigo-50 transition-all flex items-center gap-2 active:scale-95"
                    >
                      <Camera className="w-5 h-5" />
                      Retry Scan
                    </button>
                    <p className="text-white text-xs font-medium drop-shadow-md">Scan failed? Try again or use a clearer image</p>
                  </div>
                )}

                <button 
                  onClick={resetScanner}
                  className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Results */}
              <AnimatePresence>
                {result && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {/* Summary Card */}
                    <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100 flex items-start gap-4">
                      <div className="bg-white p-2 rounded-xl shadow-sm">
                        <CheckCircle2 className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded">
                            {result.type}
                          </span>
                          <span className="text-xs font-medium text-gray-500">
                            Confidence: {result.confidence}%
                          </span>
                        </div>
                        <p className="text-gray-900 font-medium mt-1">{result.summary}</p>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(result.details || {}).map(([key, value]) => {
                        if (!value) return null;
                        
                        const getIcon = (k: string) => {
                          switch (k) {
                            case 'from_location':
                            case 'to_location':
                            case 'address': return <MapPin className="w-4 h-4" />;
                            case 'departure_date':
                            case 'arrival_date': return <Calendar className="w-4 h-4" />;
                            case 'departure_time':
                            case 'arrival_time': return <Clock className="w-4 h-4" />;
                            case 'name': return <User className="w-4 h-4" />;
                            case 'booking_id':
                            case 'id_number_masked': return <Hash className="w-4 h-4" />;
                            case 'provider': return <Building2 className="w-4 h-4" />;
                            default: return <FileText className="w-4 h-4" />;
                          }
                        };

                        const formatLabel = (k: string) => k.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

                        return (
                          <div key={key} className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-3">
                            <div className="text-gray-400 mt-0.5">{getIcon(key)}</div>
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{formatLabel(key)}</p>
                              <p className="text-sm font-semibold text-gray-900">{value}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSaving ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Save className="w-5 h-5" />
                      )}
                      {isSaving ? 'Saving...' : 'Save to Travel Vault'}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error State */}
              {!isScanning && result && result.confidence < 30 && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-amber-900">Low Confidence Detection</p>
                    <p className="text-xs text-amber-700">The AI had trouble reading this document. Please ensure the image is clear and well-lit.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
