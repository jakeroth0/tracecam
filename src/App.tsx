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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/40 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-8 max-w-md w-full">
        <div className="bg-gradient-to-br from-white/30 to-blue-200/20 p-6 rounded-xl">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">Privacy Notice</h2>
          <p className="text-gray-700 mb-6 text-lg leading-relaxed">
            TraceCam uses your camera and lets you upload images for overlay tracing. 
            All data stays on your device and is never uploaded. You can clear images at any time.
          </p>
          <button
            onClick={dismissPrivacyModal}
            className="w-full bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 text-white font-semibold py-4 px-6 rounded-xl text-lg transition-all cursor-pointer select-none shadow-lg"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );

  // Clear confirmation modal
  const ClearConfirmModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/40 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-8 max-w-md w-full">
        <div className="bg-gradient-to-br from-white/30 to-blue-200/20 p-6 rounded-xl">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">Clear Image</h2>
          <p className="text-gray-700 mb-6 text-lg leading-relaxed text-center">
            Are you sure you want to clear this image? This cannot be undone.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => setShowClearConfirm(false)}
              className="flex-1 bg-gray-300 hover:bg-gray-400 focus:ring-4 focus:ring-gray-300 text-gray-800 font-semibold py-4 px-6 rounded-xl text-lg transition-all cursor-pointer select-none shadow-lg min-w-[120px]"
            >
              Cancel
            </button>
            <button
              onClick={clearImage}
              className="flex-1 bg-red-500 hover:bg-red-600 focus:ring-4 focus:ring-red-300 text-white font-semibold py-4 px-6 rounded-xl text-lg transition-all cursor-pointer select-none shadow-lg min-w-[120px]"
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
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent z-30">
          <div className="max-w-md mx-auto space-y-6">
            {/* Opacity slider */}
            <div className="bg-white/40 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-6">
              <label className="block text-white text-lg font-semibold mb-3">
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
            <div className="flex gap-4">
              <button
                onClick={exitCamera}
                className="flex-1 bg-white/40 backdrop-blur-lg hover:bg-white/50 focus:ring-4 focus:ring-white/30 text-white font-semibold py-4 px-6 rounded-xl text-lg transition-all cursor-pointer select-none shadow-xl border border-white/30 min-w-[120px]"
              >
                Exit Camera
              </button>
              {uploadedImage && (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="flex-1 bg-red-500/80 hover:bg-red-600/90 focus:ring-4 focus:ring-red-300 text-white font-semibold py-4 px-6 rounded-xl text-lg transition-all cursor-pointer select-none shadow-xl min-w-[120px]"
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
      <div className="bg-white/40 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-8 w-full max-w-md">
        <div className="bg-gradient-to-br from-white/30 to-blue-200/20 p-6 rounded-xl">
          {/* Title */}
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-8 select-none">TraceCam</h1>

          {/* Image preview */}
          {uploadedImage && (
            <div className="mb-8">
              <img
                src={uploadedImage}
                alt="Preview"
                className="w-full h-48 object-contain bg-gray-100/50 rounded-xl border-2 border-dashed border-gray-300"
                style={{ opacity }}
              />
              <button
                onClick={() => setShowClearConfirm(true)}
                className="mt-3 text-red-600 hover:text-red-800 text-lg font-semibold cursor-pointer select-none"
              >
                Remove Image
              </button>
            </div>
          )}

          {/* Upload button */}
          <div className="mb-8">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 text-white font-semibold py-4 px-6 rounded-xl text-lg transition-all cursor-pointer select-none shadow-lg"
            >
              {uploadedImage ? 'Change Image' : 'Upload Image'}
            </button>
          </div>

          {/* Opacity slider */}
          <div className="mb-8">
            <label className="block text-gray-700 text-lg font-semibold mb-3 select-none">
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
            className={`w-full font-semibold py-4 px-6 rounded-xl text-lg transition-all cursor-pointer select-none shadow-lg min-w-[120px] ${
              uploadedImage
                ? 'bg-green-500 hover:bg-green-600 focus:ring-4 focus:ring-green-300 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Start Camera
          </button>

          {!uploadedImage && (
            <p className="text-gray-600 text-lg text-center mt-4 select-none">
              Upload an image first to start tracing
            </p>
          )}
        </div>
      </div>

      {/* Privacy info */}
      <div className="mt-8 text-center">
        <button
          onClick={() => setShowPrivacyModal(true)}
          className="text-white/90 hover:text-white text-lg underline cursor-pointer select-none font-medium"
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
