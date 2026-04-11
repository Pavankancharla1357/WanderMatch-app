import React, { useState, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import { Camera, Link as LinkIcon, X, Check, Upload, RefreshCw } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase';
import getCroppedImg from '../../utils/cropImage';
import { toast } from 'sonner';

interface ImageUploadProps {
  currentImageUrl?: string;
  onImageUploaded: (url: string) => void;
  aspectRatio?: number;
  folder?: string;
  label?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImageUrl,
  onImageUploaded,
  aspectRatio = 1,
  folder = 'profiles',
  label = 'Profile Photo'
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result as string);
        setIsCropping(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    setIsUploading(true);
    try {
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (!croppedImageBlob) throw new Error('Failed to crop image');

      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
      const storageRef = ref(storage, `${folder}/${fileName}`);
      
      const snapshot = await uploadBytes(storageRef, croppedImageBlob);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      onImageUploaded(downloadURL);
      setIsCropping(false);
      setImageSrc(null);
      toast.success('Image uploaded successfully!');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleLinkSubmit = () => {
    if (!linkUrl) return;
    onImageUploaded(linkUrl);
    setShowLinkInput(false);
    setLinkUrl('');
    toast.success('Image link updated!');
  };

  return (
    <div className="space-y-4">
      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
        {label}
      </label>
      
      <div className="flex items-center gap-4">
        <div className="relative group">
          <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center relative">
            {currentImageUrl ? (
              <img 
                src={currentImageUrl} 
                alt="Preview" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <Camera className="w-8 h-8 text-gray-300" />
            )}
            
            {isUploading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-white animate-spin" />
              </div>
            )}
          </div>
          
          <div className="absolute -bottom-2 -right-2 flex gap-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-colors"
              title="Upload Photo"
            >
              <Upload className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowLinkInput(!showLinkInput)}
              className="w-8 h-8 bg-white text-gray-600 border border-gray-100 rounded-lg flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors"
              title="Add Link"
            >
              <LinkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1">
          <p className="text-xs text-gray-500 mb-2">
            Upload a photo or provide a link. Recommended size: 512x512px.
          </p>
          {showLinkInput && (
            <div className="flex gap-2">
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleLinkSubmit}
                className="px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
              >
                Add
              </button>
            </div>
          )}
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Cropping Modal */}
      {isCropping && imageSrc && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col">
          <div className="flex items-center justify-between p-4 text-white">
            <h3 className="font-bold">Crop Image</h3>
            <button 
              onClick={() => {
                setIsCropping(false);
                setImageSrc(null);
              }}
              className="p-2 hover:bg-white/10 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex-1 relative">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspectRatio}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>
          
          <div className="p-8 space-y-6 bg-black/50 backdrop-blur-md">
            <div className="space-y-2">
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Zoom</p>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
            
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              {isUploading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Check className="w-5 h-5" />
              )}
              Apply Crop & Upload
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
