import React, { useState, useRef, useEffect } from 'react';
import './App.css';

interface CameraMode {
  isActive: boolean;
  stream: MediaStream | null;
}

const App: React.FC = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [opacity, setOpacity] = useState<number>(0.5);
  const [cameraMode, setCameraMode] = useState<CameraMode>({ isActive: false, stream: null });
  const [showPrivacyModal, setShowPrivacyModal] = useState<boolean>(false);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Load saved data from localStorage on component mount
  useEffect(() => {
    const savedImage = localStorage.getItem('tracecam-image');
    const savedOpacity = localStorage.getItem('tracecam-opacity');
    const hasSeenPrivacy = localStorage.getItem('tracecam-privacy-seen');

    if (savedImage) {
      setUploadedImage(savedImage);
    }
    if (savedOpacity) {
      setOpacity(parseFloat(savedOpacity));
    }
    if (!hasSeenPrivacy) {
      setShowPrivacyModal(true);
    }
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setUploadedImage(base64);
        localStorage.setItem('tracecam-image', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpacityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newOpacity = parseFloat(event.target.value);
    setOpacity(newOpacity);
    localStorage.setItem('tracecam-opacity', newOpacity.toString());
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { exact: "environment" } }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraMode({ isActive: true, stream });
      }
    } catch (error) {
      // Fallback to default camera if back camera not available
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraMode({ isActive: true, stream });
        }
      } catch (fallbackError) {
        alert('Camera access is required for TraceCam to work. Please enable camera permissions and try again.');
      }
    }
  };

  const exitCamera = () => {
    if (cameraMode.stream) {
      cameraMode.stream.getTracks().forEach(track => track.stop());
    }
    setCameraMode({ isActive: false, stream: null });
  };

  const clearImage = () => {
    setUploadedImage(null);
    localStorage.removeItem('tracecam-image');
    setShowClearConfirm(false);
  };

  const dismissPrivacyModal = () => {
    setShowPrivacyModal(false);
    localStorage.setItem('tracecam-privacy-seen', 'true');
  };

  // Privacy modal component
  const PrivacyModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Privacy Notice</h2>
        <p className="text-gray-700 mb-6">
          TraceCam uses your camera and lets you upload images for overlay tracing. 
          All data stays on your device and is never uploaded. You can clear images at any time.
        </p>
        <button
          onClick={dismissPrivacyModal}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );

  // Clear confirmation modal
  const ClearConfirmModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Clear Image</h2>
        <p className="text-gray-700 mb-6">
          Are you sure you want to clear this image? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setShowClearConfirm(false)}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={clearImage}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Clear Image
          </button>
        </div>
      </div>
    </div>
  );

  // Camera view component
  if (cameraMode.isActive) {
    return (
      <div className="min-h-screen bg-gray-900 relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-screen object-cover"
        />
        
        {/* Image overlay */}
        {uploadedImage && (
          <img
            src={uploadedImage}
            alt="Overlay"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            style={{ opacity }}
          />
        )}

        {/* Camera controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
          <div className="max-w-md mx-auto space-y-4">
            {/* Opacity slider */}
            <div className="bg-white/20 backdrop-blur-md rounded-lg p-4">
              <label className="block text-white text-sm font-medium mb-2">
                Overlay Opacity: {Math.round(opacity * 100)}%
              </label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.01"
                value={opacity}
                onChange={handleOpacityChange}
                className="w-full"
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={exitCamera}
                className="flex-1 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Exit Camera
              </button>
              {uploadedImage && (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="flex-1 bg-red-500/80 hover:bg-red-600/80 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Clear Image
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Modals */}
        {showPrivacyModal && <PrivacyModal />}
        {showClearConfirm && <ClearConfirmModal />}
      </div>
    );
  }

  // Main UI view
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex flex-col items-center justify-center p-4">
      <div className="bg-white/60 backdrop-blur-md rounded-xl shadow-lg p-6 w-full max-w-md">
        {/* Title */}
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">TraceCam</h1>

        {/* Image preview */}
        {uploadedImage && (
          <div className="mb-6">
            <img
              src={uploadedImage}
              alt="Preview"
              className="w-full h-48 object-contain bg-gray-100 rounded-lg border-2 border-dashed border-gray-300"
              style={{ opacity }}
            />
            <button
              onClick={() => setShowClearConfirm(true)}
              className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Remove Image
            </button>
          </div>
        )}

        {/* Upload button */}
        <div className="mb-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            {uploadedImage ? 'Change Image' : 'Upload Image'}
          </button>
        </div>

        {/* Opacity slider */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Overlay Opacity: {Math.round(opacity * 100)}%
          </label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.01"
            value={opacity}
            onChange={handleOpacityChange}
            className="w-full"
          />
        </div>

        {/* Start camera button */}
        <button
          onClick={startCamera}
          disabled={!uploadedImage}
          className={`w-full font-medium py-3 px-4 rounded-lg transition-colors ${
            uploadedImage
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Start Camera
        </button>

        {!uploadedImage && (
          <p className="text-gray-600 text-sm text-center mt-2">
            Upload an image first to start tracing
          </p>
        )}
      </div>

      {/* Privacy info */}
      <div className="mt-6 text-center">
        <button
          onClick={() => setShowPrivacyModal(true)}
          className="text-white/80 hover:text-white text-sm underline"
        >
          Privacy Info
        </button>
      </div>

      {/* Modals */}
      {showPrivacyModal && <PrivacyModal />}
      {showClearConfirm && <ClearConfirmModal />}
    </div>
  );
};

export default App;
