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
        // Ensure video plays automatically
        await videoRef.current.play();
        setCameraMode({ isActive: true, stream });
      }
    } catch (error) {
      // Fallback to default camera if back camera not available
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Ensure video plays automatically
          await videoRef.current.play();
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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-gray-200">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Privacy Notice</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            TraceCam uses your camera and lets you upload images for overlay tracing. 
            All data stays on your device and is never uploaded. You can clear images at any time.
          </p>
          <button
            onClick={dismissPrivacyModal}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );

  // Clear confirmation modal
  const ClearConfirmModal = () => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-gray-200">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Clear Image</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Are you sure you want to clear this image? This cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowClearConfirm(false)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              onClick={clearImage}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Clear Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Camera view component
  if (cameraMode.isActive) {
    return (
      <div className="min-h-screen bg-gray-900 relative overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover z-10"
        />
        
        {/* Image overlay */}
        {uploadedImage && (
          <img
            src={uploadedImage}
            alt="Overlay"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none z-20"
            style={{ opacity }}
          />
        )}

        {/* Camera controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-30">
          <div className="max-w-md mx-auto space-y-4">
            {/* Opacity slider */}
            <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
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
                className="w-full cursor-pointer"
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={exitCamera}
                className="flex-1 bg-white hover:bg-gray-50 text-gray-800 font-medium py-3 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 shadow-lg border border-gray-200"
              >
                Exit Camera
              </button>
              {uploadedImage && (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow-lg"
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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full border border-gray-200">
        <div className="p-6">
          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">TraceCam</h1>

          {/* Image preview */}
          {uploadedImage && (
            <div className="mb-6">
              <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-4">
                <img
                  src={uploadedImage}
                  alt="Preview"
                  className="w-full h-48 object-contain"
                  style={{ opacity }}
                />
              </div>
              <button
                onClick={() => setShowClearConfirm(true)}
                className="mt-3 text-red-600 hover:text-red-700 text-sm font-medium"
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
              className="w-full cursor-pointer"
            />
          </div>

          {/* Start camera button */}
          <button
            onClick={startCamera}
            disabled={!uploadedImage}
            className={`w-full font-medium py-3 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              uploadedImage
                ? 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Start Camera
          </button>

          {!uploadedImage && (
            <p className="text-gray-500 text-sm text-center mt-3">
              Upload an image first to start tracing
            </p>
          )}
        </div>
      </div>

      {/* Privacy info */}
      <div className="mt-6 text-center">
        <button
          onClick={() => setShowPrivacyModal(true)}
          className="text-gray-500 hover:text-gray-700 text-sm underline"
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
