import React, { useRef, useEffect, useState } from 'react';

const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [cameraSupported, setCameraSupported] = useState<boolean>(true);
  const [showPrivacy, setShowPrivacy] = useState<boolean>(true);

  // Check privacy consent from localStorage on mount
  useEffect(() => {
    const privacyAccepted = localStorage.getItem('tracecam_privacy_accepted');
    if (privacyAccepted === 'true') {
      setShowPrivacy(false);
    }
  }, []);

  // Check if camera API is supported
  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraSupported(false);
      setError('Camera API not supported in this browser');
    }
  }, []);

  // Request camera stream only after privacy consent
  useEffect(() => {
    if (!cameraSupported || showPrivacy) return;

    const startCamera = async () => {
      try {
        setError('');
        
        // Try back camera first (exact)
        let mediaStream: MediaStream;
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { exact: "environment" } }
          });
        } catch (backCameraError) {
          console.log('Back camera (exact) failed, trying fallback...', backCameraError);
          
          // Fallback to preferred back camera
          try {
            mediaStream = await navigator.mediaDevices.getUserMedia({
              video: { facingMode: "environment" }
            });
          } catch (fallbackError) {
            console.log('Back camera (preferred) failed, trying any camera...', fallbackError);
            
            // Final fallback to any camera
            mediaStream = await navigator.mediaDevices.getUserMedia({
              video: true
            });
          }
        }

        streamRef.current = mediaStream;
        setStream(mediaStream);

        // Attach stream to video element
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }

      } catch (err) {
        console.error('Camera access failed:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown camera error';
        setError(`Camera access failed: ${errorMessage}`);
      }
    };

    startCamera();

    // Cleanup function
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [cameraSupported, showPrivacy]);

  // Handle privacy dismissal
  const handlePrivacyAccept = () => {
    setShowPrivacy(false);
    localStorage.setItem('tracecam_privacy_accepted', 'true');
  };

  // Handle video can play event
  const handleCanPlay = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.error('Video play failed:', err);
        setError('Video playback failed');
      });
    }
  };

  // Error overlay component
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-white p-8 max-w-md">
          <div className="text-6xl mb-4">📷</div>
          <h2 className="text-xl font-semibold mb-4">Camera Error</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <div className="text-sm text-gray-400">
            <p>Please ensure:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Camera permissions are granted</li>
              <li>No other apps are using the camera</li>
              <li>Camera is properly connected</li>
            </ul>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Browser not supported
  if (!cameraSupported) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-white p-8 max-w-md">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-xl font-semibold mb-4">Camera Not Supported</h2>
          <p className="text-gray-300">
            Your browser doesn't support camera access. Please try a modern browser like Chrome, Firefox, or Safari.
          </p>
        </div>
      </div>
    );
  }

  // Privacy modal
  if (showPrivacy) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 px-4">
        <div className="bg-white/60 backdrop-blur-md rounded-xl shadow-xl p-6 max-w-sm mx-auto text-center">
          <div className="text-4xl mb-4">📷</div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Welcome to TraceCam</h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            TraceCam uses your camera for tracing overlays. Images and data <strong>never leave your device</strong>. 
            By continuing, you agree to grant camera access.
          </p>
          <div className="bg-green-100 border border-green-300 rounded-lg p-3 mb-6">
            <p className="text-green-800 text-sm font-medium">
              🔒 100% Private - Everything stays local
            </p>
          </div>
          <button
            onClick={handlePrivacyAccept}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Continue & Allow Camera
          </button>
        </div>
      </div>
    );
  }

  // Main camera view
  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Full-screen video element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        onCanPlay={handleCanPlay}
        className="fixed inset-0 w-full h-full object-cover z-0"
      />

      {/* Loading overlay while stream is being established */}
      {!stream && (
        <div className="fixed inset-0 flex items-center justify-center z-10 bg-black">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-lg">Starting camera...</p>
            <p className="text-sm text-gray-400 mt-2">
              Please allow camera access when prompted
            </p>
          </div>
        </div>
      )}

      {/* Camera info overlay */}
      {stream && (
        <div className="fixed top-4 left-4 z-20">
          <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded">
            <span className="text-green-400">●</span> Camera Active
          </div>
        </div>
      )}

      {/* TraceCam title overlay */}
      {stream && (
        <div className="fixed top-4 right-4 z-20">
          <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded">
            TraceCam
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
