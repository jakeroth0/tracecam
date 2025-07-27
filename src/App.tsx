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
  const [cameraError, setCameraError] = useState<string>('');
  const [streamInfo, setStreamInfo] = useState<string>('');
  
  const videoRef = useRef<HTMLVideoElement>(null);

  // Version indicator
  const VERSION = "v2.1.0-camera-debug";

  // Check if camera API is available
  const isCameraSupported = () => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  };

  const isSecureContext = () => {
    return window.isSecureContext || window.location.protocol === 'https:' || window.location.hostname === 'localhost';
  };

  // Enhanced video stream setup with comprehensive debugging
  const setupVideoStream = useCallback(async (stream: MediaStream) => {
    console.log("=== setupVideoStream called ===");
    console.log("Stream received:", stream);
    console.log("Stream tracks:", stream.getTracks());
    
    if (!videoRef.current) {
      console.error('Video ref not available');
      setDebugInfo('Video element not ready');
      setCameraError('Video element not found');
      return false;
    }

    try {
      const video = videoRef.current;
      console.log("Video element found:", video);
      
      // Set stream info for display
      const videoTracks = stream.getVideoTracks();
      if (videoTracks.length > 0) {
        const track = videoTracks[0];
        const settings = track.getSettings();
        console.log("Video track settings:", settings);
        setStreamInfo(`${settings.width}x${settings.height} ${track.label}`);
      }
      
      // Set the stream
      console.log("Setting srcObject...");
      video.srcObject = stream;
      
      // Set video properties for better compatibility
      video.muted = true;
      video.playsInline = true;
      video.autoplay = true;
      
      // Add temporary red background for debugging
      video.style.backgroundColor = 'red';
      
      console.log("Video properties set:", {
        muted: video.muted,
        playsInline: video.playsInline,
        autoplay: video.autoplay
      });
      
      // Wait for metadata to load
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          console.error("Video metadata loading timeout");
          setDebugInfo('Video metadata loading timeout');
          reject(new Error('Metadata loading timeout'));
        }, 10000);
        
        const onLoadedMetadata = () => {
          clearTimeout(timeout);
          console.log('Video metadata loaded successfully');
          console.log('Video dimensions:', video.videoWidth, 'x', video.videoHeight);
          console.log('Video readyState:', video.readyState);
          setDebugInfo(`Video metadata loaded - ${video.videoWidth}x${video.videoHeight}`);
          setIsVideoLoaded(true);
          // Remove red background once working
          video.style.backgroundColor = 'black';
          video.removeEventListener('loadedmetadata', onLoadedMetadata);
          video.removeEventListener('error', onError);
          resolve();
        };
        
        const onError = (e: Event) => {
          clearTimeout(timeout);
          console.error('Video metadata loading error:', e);
          setDebugInfo('Video metadata loading failed');
          setCameraError('Video metadata loading failed');
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
        console.log("Attempting to play video...");
        await video.play();
        console.log('Video is playing successfully');
        console.log('Video currentTime:', video.currentTime);
        console.log('Video paused:', video.paused);
        setDebugInfo(`Video playing - ${video.videoWidth}x${video.videoHeight}`);
        return true;
      } catch (playError) {
        console.error('Video play failed:', playError);
        setDebugInfo('Video play failed: ' + (playError instanceof Error ? playError.message : String(playError)));
        setCameraError('Video play failed: ' + (playError instanceof Error ? playError.message : String(playError)));
        return false;
      }
      
    } catch (error) {
      console.error('Video setup failed:', error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      setDebugInfo('Video setup failed: ' + errorMsg);
      setCameraError('Video setup failed: ' + errorMsg);
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
    console.log("=== TraceCam Debug Info ===");
    console.log("Version:", VERSION);
    console.log("User agent:", navigator.userAgent);
    console.log("Camera API supported:", isCameraSupported());
    console.log("Secure context:", isSecureContext());
    
    if (!isCameraSupported()) {
      setDebugInfo('Camera API not supported in this browser');
      setCameraError('Camera API not supported');
    } else if (!isSecureContext()) {
      setDebugInfo('HTTPS required for camera access (except on localhost)');
      setCameraError('HTTPS required for camera access');
    } else {
      setDebugInfo('Camera API available - ready to test');
    }
  }, []);

  const startCamera = async () => {
    console.log("=== Starting Camera ===");
    setCameraError('');
    setStreamInfo('');
    
    if (!isCameraSupported()) {
      const error = 'Camera API not supported';
      setDebugInfo(error);
      setCameraError(error);
      alert('Camera API not supported in this browser');
      return;
    }

    if (!isSecureContext()) {
      const error = 'HTTPS required for camera access';
      setDebugInfo(error);
      setCameraError(error);
      alert('Camera access requires HTTPS when not on localhost. Try accessing via localhost or use HTTPS.');
      return;
    }

    setDebugInfo('Requesting camera access...');
    setIsVideoLoaded(false);
    console.log('Attempting to access camera...');
    
    // Try back camera first (exact)
    try {
      console.log('Trying back camera with exact facingMode...');
      const constraints = {
        video: {
          facingMode: { exact: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      console.log("Camera constraints:", constraints);
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Got back camera stream:', stream);
      setDebugInfo('Back camera stream obtained');
      
      const success = await setupVideoStream(stream);
      if (success) {
        setCameraMode({ isActive: true, stream });
        return;
      } else {
        // Clean up stream if video setup failed
        stream.getTracks().forEach(track => track.stop());
        setDebugInfo('Video setup failed for back camera');
      }
      
    } catch (error) {
      console.log('Back camera (exact) failed, trying back camera (preferred)...', error);
      setDebugInfo('Back camera (exact) failed, trying preferred...');
      
      // Try back camera (preferred, not exact)
      try {
        console.log('Trying back camera with preferred facingMode...');
        const constraints = {
          video: {
            facingMode: "environment", // Not exact, just preferred
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };
        console.log("Camera constraints (preferred):", constraints);
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log('Got back camera stream (preferred):', stream);
        setDebugInfo('Back camera stream obtained (preferred)');
        
        const success = await setupVideoStream(stream);
        if (success) {
          setCameraMode({ isActive: true, stream });
          return;
        } else {
          stream.getTracks().forEach(track => track.stop());
          setDebugInfo('Video setup failed for back camera (preferred)');
        }
        
      } catch (fallbackError) {
        console.log('Back camera (preferred) failed, trying any camera...', fallbackError);
        setDebugInfo('Back camera failed, trying any camera...');
        
        // Try any camera
        try {
          console.log('Trying any available camera...');
          const constraints = {
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          };
          console.log("Camera constraints (any):", constraints);
          
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          console.log('Got camera stream (any):', stream);
          setDebugInfo('Camera stream obtained (any)');
          
          const success = await setupVideoStream(stream);
          if (success) {
            setCameraMode({ isActive: true, stream });
            return;
          } else {
            stream.getTracks().forEach(track => track.stop());
            setDebugInfo('Video setup failed for any camera');
          }
          
        } catch (finalError) {
          console.error('All camera access failed:', finalError);
          const errorMessage = finalError instanceof Error ? finalError.message : String(finalError);
          setDebugInfo('Camera access failed: ' + errorMessage);
          setCameraError('Camera access failed: ' + errorMessage);
          alert(`Camera access failed: ${errorMessage}\n\nPlease ensure:\n1. Camera permissions are granted\n2. No other apps are using the camera\n3. Camera is properly connected`);
        }
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
    setCameraError('');
    setStreamInfo('');
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
        {/* Version indicator for camera mode */}
        <div className="absolute top-4 right-4 z-50">
          <div className="bg-yellow-400 text-black px-2 py-1 rounded text-xs font-bold">
            {VERSION}
          </div>
        </div>

        {/* Debug info overlay */}
        <div className="absolute top-4 left-4 right-20 z-50">
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <p className="text-xs text-gray-600">Debug: {debugInfo}</p>
            <p className="text-xs text-gray-500 mt-1">
              Stream: {cameraMode.stream ? 'Yes' : 'No'} | Video: {isVideoLoaded ? 'Yes' : 'No'}
            </p>
            {streamInfo && (
              <p className="text-xs text-blue-600 mt-1">Stream: {streamInfo}</p>
            )}
            {cameraError && (
              <p className="text-xs text-red-600 mt-1">Error: {cameraError}</p>
            )}
          </div>
        </div>

        {/* Video element with explicit styling and debugging background */}
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
            backgroundColor: 'red', // Temporary for debugging - will turn black when working
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
            setCameraError('Video error occurred');
          }}
        />

        {/* Loading indicator */}
        {!isVideoLoaded && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-black">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
              <p>Loading camera feed...</p>
              <p className="text-sm mt-2">Check console (F12) for detailed logs</p>
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
                {cameraError && (
                  <p className="text-xs text-red-600 mt-1">
                    ❌ {cameraError}
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
      {/* Version indicator for main UI */}
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg">
          {VERSION}
        </div>
      </div>

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

        {/* Error info */}
        {cameraError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
            <p className="text-xs text-red-800">Error: {cameraError}</p>
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
                  ? "Click the button below to test your camera feed. Make sure no other apps are using your camera. Check console (F12) for detailed debugging."
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
