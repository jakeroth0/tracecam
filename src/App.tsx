import React, { useState, useRef, useEffect } from 'react';
import './App.css';

interface CameraMode {
  isActive: boolean;
  stream: MediaStream | null;
}

const App: React.FC = () => {
  const [cameraMode, setCameraMode] = useState<CameraMode>({ isActive: false, stream: null });
  const [showPrivacyModal, setShowPrivacyModal] = useState<boolean>(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  
  const videoRef = useRef<HTMLVideoElement>(null);

  // Check if camera API is available
  const isCameraSupported = () => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  };

  const isSecureContext = () => {
    return window.isSecureContext || window.location.protocol === 'https:' || window.location.hostname === 'localhost';
  };

  // Load saved data from localStorage on component mount
  useEffect(() => {
    const hasSeenPrivacy = localStorage.getItem('tracecam-privacy-seen');

    if (!hasSeenPrivacy) {
      setShowPrivacyModal(true);
    }

    // Set initial debug info
    if (!isCameraSupported()) {
      setDebugInfo('Camera API not supported in this browser');
    } else if (!isSecureContext()) {
      setDebugInfo('HTTPS required for camera access (except on localhost)');
    } else {
      setDebugInfo('Camera API available - ready to test');
    }
  }, []);

  const startCamera = async () => {
    if (!isCameraSupported()) {
      setDebugInfo('Camera API not supported');
      alert('Camera API not supported in this browser');
      return;
    }

    if (!isSecureContext()) {
      setDebugInfo('HTTPS required for camera access');
      alert('Camera access requires HTTPS when not on localhost. Try accessing via localhost or use HTTPS.');
      return;
    }

    setDebugInfo('Requesting camera access...');
    console.log('Starting camera...');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { exact: "environment" } }
      });
      
      console.log('Got back camera stream:', stream);
      setDebugInfo('Back camera stream obtained');
      
      if (videoRef.current) {
        console.log('Setting video source...');
        videoRef.current.srcObject = stream;
        
        // Add event listeners for video debugging
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded');
          setDebugInfo('Video metadata loaded');
        };
        
        videoRef.current.onplay = () => {
          console.log('Video playing');
          setDebugInfo('Video playing successfully');
        };
        
        videoRef.current.onerror = (e) => {
          console.error('Video error:', e);
          setDebugInfo('Video error occurred');
        };
        
        // Ensure video plays automatically
        try {
          await videoRef.current.play();
          console.log('Video play() called successfully');
          setCameraMode({ isActive: true, stream });
          setDebugInfo('Camera active - should see video');
        } catch (playError) {
          console.error('Video play error:', playError);
          setDebugInfo('Video play failed: ' + (playError instanceof Error ? playError.message : String(playError)));
        }
      }
    } catch (error) {
      console.log('Back camera failed, trying default camera...');
      setDebugInfo('Back camera failed, trying default camera...');
      
      // Fallback to default camera if back camera not available
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        console.log('Got default camera stream:', stream);
        setDebugInfo('Default camera stream obtained');
        
        if (videoRef.current) {
          console.log('Setting video source (default camera)...');
          videoRef.current.srcObject = stream;
          
          // Add event listeners for video debugging
          videoRef.current.onloadedmetadata = () => {
            console.log('Video metadata loaded (default)');
            setDebugInfo('Video metadata loaded (default)');
          };
          
          videoRef.current.onplay = () => {
            console.log('Video playing (default)');
            setDebugInfo('Video playing successfully (default)');
          };
          
          videoRef.current.onerror = (e) => {
            console.error('Video error (default):', e);
            setDebugInfo('Video error occurred (default)');
          };
          
          // Ensure video plays automatically
          try {
            await videoRef.current.play();
            console.log('Video play() called successfully (default)');
            setCameraMode({ isActive: true, stream });
            setDebugInfo('Camera active (default) - should see video');
          } catch (playError) {
            console.error('Video play error (default):', playError);
            setDebugInfo('Video play failed (default): ' + (playError instanceof Error ? playError.message : String(playError)));
          }
        }
      } catch (fallbackError) {
        console.error('All camera access failed:', fallbackError);
        setDebugInfo('Camera access failed: ' + (fallbackError instanceof Error ? fallbackError.message : String(fallbackError)));
        alert('Camera access is required for TraceCam to work. Please enable camera permissions and try again.');
      }
    }
  };

  const exitCamera = () => {
    console.log('Exiting camera...');
    if (cameraMode.stream) {
      cameraMode.stream.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped track:', track);
      });
    }
    setCameraMode({ isActive: false, stream: null });
    setDebugInfo('Camera stopped');
  };

  const dismissPrivacyModal = () => {
    setShowPrivacyModal(false);
    localStorage.setItem('tracecam-privacy-seen', 'true');
  };

  // Privacy modal component
  const PrivacyModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
      <div className="bg-green-50 rounded-lg max-w-md w-full border border-green-200">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Privacy Notice</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            TraceCam uses your camera for live video feed. All data stays on your device and is never uploaded. 
            You can exit camera mode at any time.
          </p>
          <button
            onClick={dismissPrivacyModal}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded text-sm transition-colors"
          >
            Understand
          </button>
        </div>
      </div>
    </div>
  );

  // Camera view component
  if (cameraMode.isActive) {
    return (
      <div className="min-h-screen bg-gray-900 relative overflow-hidden">
        {/* Debug info overlay */}
        <div className="absolute top-4 left-4 right-4 z-50">
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <p className="text-xs text-gray-600">Debug: {debugInfo}</p>
            <p className="text-xs text-gray-500 mt-1">
              Stream active: {cameraMode.stream ? 'Yes' : 'No'}
            </p>
          </div>
        </div>

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          controls={false}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            backgroundColor: 'black'
          }}
        />

        {/* Camera controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-40">
          <div className="max-w-sm mx-auto">
            {/* Control panel */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Camera Test Mode
                </label>
                <p className="text-xs text-gray-500">
                  Status: {debugInfo}
                </p>
              </div>
              
              <button
                onClick={exitCamera}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 px-4 rounded text-sm transition-colors"
              >
                Exit Camera
              </button>
            </div>
          </div>
        </div>

        {/* Modal */}
        {showPrivacyModal && <PrivacyModal />}
      </div>
    );
  }

  // Main UI view
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-md mx-auto pt-16">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">TraceCam</h1>
          <p className="text-gray-500 text-sm">Camera Testing Mode</p>
        </div>

        {/* Camera compatibility info */}
        <div className={`rounded-lg p-3 mb-6 ${
          isCameraSupported() && isSecureContext() 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${
              isCameraSupported() && isSecureContext() ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <p className={`text-xs font-medium ${
              isCameraSupported() && isSecureContext() ? 'text-green-800' : 'text-red-800'
            }`}>
              {isCameraSupported() && isSecureContext() 
                ? 'Camera API Ready' 
                : 'Camera API Not Available'
              }
            </p>
          </div>
          {(!isCameraSupported() || !isSecureContext()) && (
            <p className="text-xs text-red-600 mt-1">
              {!isCameraSupported() 
                ? 'Camera API not supported in this browser'
                : 'For mobile testing, deploy to a service like Vercel or Netlify (HTTPS required)'
              }
            </p>
          )}
        </div>

        {/* Debug info */}
        {debugInfo && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
            <p className="text-xs text-yellow-800">{debugInfo}</p>
          </div>
        )}

        {/* Main card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="space-y-6">
            {/* Info section */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-lg font-medium text-gray-900 mb-2">Test Camera Access</h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                {isSecureContext() 
                  ? "Click the button below to test your camera feed."
                  : "Camera testing works on localhost. For mobile testing, deploy to HTTPS."
                }
              </p>
            </div>

            {/* Camera button */}
            <div>
              <button
                onClick={startCamera}
                disabled={!isCameraSupported() || !isSecureContext()}
                className={`w-full font-medium py-3 px-4 rounded transition-colors ${
                  isCameraSupported() && isSecureContext()
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Start Camera Test
              </button>
            </div>

            {/* Note */}
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Desktop: Works on localhost | Mobile: Requires HTTPS deployment
              </p>
            </div>
          </div>
        </div>

        {/* Privacy link */}
        <div className="text-center mt-6">
          <button
            onClick={() => setShowPrivacyModal(true)}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Privacy Information
          </button>
        </div>
      </div>

      {/* Modal */}
      {showPrivacyModal && <PrivacyModal />}
    </div>
  );
};

export default App;
