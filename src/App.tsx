import React, { useState, useRef, useEffect, useCallback } from 'react';
import './App.css';

interface CameraMode {
  isActive: boolean;
  stream: MediaStream | null;
}

const App: React.FC = () => {
  const [cameraMode, setCameraMode] = useState<CameraMode>({ isActive: false, stream: null });
  const [showPrivacyModal, setShowPrivacyModal] = useState<boolean>(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [isVideoLoaded, setIsVideoLoaded] = useState<boolean>(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  // Check if camera API is available
  const isCameraSupported = () => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  };

  const isSecureContext = () => {
    return window.isSecureContext || window.location.protocol === 'https:' || window.location.hostname === 'localhost';
  };

  // Properly handle video stream setup
  const setupVideoStream = useCallback(async (stream: MediaStream) => {
    if (!videoRef.current) {
      console.error('Video ref not available');
      setDebugInfo('Video element not ready');
      return false;
    }

    try {
      console.log('Setting up video stream...', stream);
      const video = videoRef.current;
      
      // Set the stream
      video.srcObject = stream;
      
      // Set video properties for better compatibility
      video.muted = true;
      video.playsInline = true;
      video.autoplay = true;
      
      // Wait for metadata to load
      await new Promise<void>((resolve, reject) => {
        const onLoadedMetadata = () => {
          console.log('Video metadata loaded successfully');
          console.log('Video dimensions:', video.videoWidth, 'x', video.videoHeight);
          setDebugInfo('Video metadata loaded - dimensions: ' + video.videoWidth + 'x' + video.videoHeight);
          setIsVideoLoaded(true);
          video.removeEventListener('loadedmetadata', onLoadedMetadata);
          video.removeEventListener('error', onError);
          resolve();
        };
        
        const onError = (e: Event) => {
          console.error('Video metadata loading error:', e);
          setDebugInfo('Video metadata loading failed');
          video.removeEventListener('loadedmetadata', onLoadedMetadata);
          video.removeEventListener('error', onError);
          reject(e);
        };
        
        video.addEventListener('loadedmetadata', onLoadedMetadata);
        video.addEventListener('error', onError);
        
        // If metadata is already loaded
        if (video.readyState >= 1) {
          onLoadedMetadata();
        }
      });

      // Try to play the video
      try {
        await video.play();
        console.log('Video is playing successfully');
        setDebugInfo('Video playing successfully - ' + video.videoWidth + 'x' + video.videoHeight);
        return true;
      } catch (playError) {
        console.error('Video play failed:', playError);
        setDebugInfo('Video play failed: ' + (playError instanceof Error ? playError.message : String(playError)));
        return false;
      }
      
    } catch (error) {
      console.error('Video setup failed:', error);
      setDebugInfo('Video setup failed: ' + (error instanceof Error ? error.message : String(error)));
      return false;
    }
  }, []);

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
    setIsVideoLoaded(false);
    console.log('Starting camera...');
    
    try {
      // Try back camera first
      console.log('Attempting to get back camera...');
      const constraints = {
        video: {
          facingMode: { exact: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Got back camera stream:', stream);
      setDebugInfo('Back camera stream obtained');
      
      const success = await setupVideoStream(stream);
      if (success) {
        setCameraMode({ isActive: true, stream });
      } else {
        // Clean up stream if video setup failed
        stream.getTracks().forEach(track => track.stop());
        setDebugInfo('Video setup failed for back camera');
      }
      
    } catch (error) {
      console.log('Back camera failed, trying default camera...', error);
      setDebugInfo('Back camera failed, trying default camera...');
      
      // Fallback to default camera
      try {
        console.log('Attempting to get default camera...');
        const constraints = {
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log('Got default camera stream:', stream);
        setDebugInfo('Default camera stream obtained');
        
        const success = await setupVideoStream(stream);
        if (success) {
          setCameraMode({ isActive: true, stream });
        } else {
          // Clean up stream if video setup failed
          stream.getTracks().forEach(track => track.stop());
          setDebugInfo('Video setup failed for default camera');
        }
        
      } catch (fallbackError) {
        console.error('All camera access failed:', fallbackError);
        const errorMessage = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
        setDebugInfo('Camera access failed: ' + errorMessage);
        alert('Camera access failed. Please ensure:\n1. Camera permissions are granted\n2. No other apps are using the camera\n3. Camera is properly connected');
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
    setIsVideoLoaded(false);
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
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Debug info overlay */}
        <div className="absolute top-4 left-4 right-4 z-50">
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <p className="text-xs text-gray-600">Debug: {debugInfo}</p>
            <p className="text-xs text-gray-500 mt-1">
              Stream active: {cameraMode.stream ? 'Yes' : 'No'} | Video loaded: {isVideoLoaded ? 'Yes' : 'No'}
            </p>
          </div>
        </div>

        {/* Video element with explicit styling */}
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
            width: '100vw',
            height: '100vh',
            objectFit: 'cover',
            backgroundColor: 'black',
            zIndex: 1
          }}
          onLoadedMetadata={() => {
            console.log('Video metadata loaded (event)');
            setIsVideoLoaded(true);
          }}
          onCanPlay={() => {
            console.log('Video can play');
          }}
          onPlay={() => {
            console.log('Video started playing');
          }}
          onError={(e) => {
            console.error('Video error event:', e);
            setDebugInfo('Video error occurred');
          }}
        />

        {/* Loading indicator */}
        {!isVideoLoaded && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-black">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
              <p>Loading camera feed...</p>
            </div>
          </div>
        )}

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
                {isVideoLoaded && (
                  <p className="text-xs text-green-600 mt-1">
                    ✅ Video feed active
                  </p>
                )}
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
                  ? "Click the button below to test your camera feed. Make sure no other apps are using your camera."
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
