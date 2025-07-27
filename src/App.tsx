import React, { useRef, useEffect, useState } from 'react';

const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [cameraSupported, setCameraSupported] = useState<boolean>(true);
  const [showPrivacy, setShowPrivacy] = useState<boolean>(true);
  const [overlayImage, setOverlayImage] = useState<string>('');
  const [overlayOpacity, setOverlayOpacity] = useState<number>(0.5);
  
  const [showMoveMenu, setShowMoveMenu] = useState<boolean>(false);
  const [hideMode, setHideMode] = useState<boolean>(false);
  const [showOpacitySlider, setShowOpacitySlider] = useState<boolean>(false);
  const [isPictureMoveActive, setIsPictureMoveActive] = useState(false);
  const [isCameraMoveActive, setIsCameraMoveActive] = useState(false);

  // Simple position state - using viewport coordinates
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0, scale: 1 });
  const [cameraTransform, setCameraTransform] = useState({ x: 0, y: 0, scale: 1 });
  const dragStartPos = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const lastPinchDistance = useRef(0);
  const isPinching = useRef(false);

  // Helper function to calculate distance between two touch points
  const getDistance = (touch1: React.Touch, touch2: React.Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isPictureMoveActive && !isCameraMoveActive) return;
    isDragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if ((!isPictureMoveActive && !isCameraMoveActive) || !isDragging.current) return;
    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;
    
    if (isPictureMoveActive) {
      setImagePosition(prev => ({
        ...prev,
        x: prev.x + dx,
        y: prev.y + dy
      }));
    } else if (isCameraMoveActive) {
      setCameraTransform(prev => ({
        ...prev,
        x: prev.x + dx,
        y: prev.y + dy
      }));
    }
    
    dragStartPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isPictureMoveActive && !isCameraMoveActive) return;
    isDragging.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
    
    // Save to localStorage
    if (isPictureMoveActive) {
      localStorage.setItem('tracecam_image_transform', JSON.stringify(imagePosition));
    } else if (isCameraMoveActive) {
      localStorage.setItem('tracecam_camera_transform', JSON.stringify(cameraTransform));
    }
  };

  // Touch event handlers for pinch-to-zoom
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isPictureMoveActive && !isCameraMoveActive) return;
    
    if (e.touches.length === 2) {
      // Start pinch gesture
      isPinching.current = true;
      isDragging.current = false; // Disable dragging during pinch
      lastPinchDistance.current = getDistance(e.touches[0], e.touches[1]);
    } else if (e.touches.length === 1) {
      // Single touch for dragging
      isPinching.current = false;
      isDragging.current = true;
      dragStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPictureMoveActive && !isCameraMoveActive) return;
    e.preventDefault(); // Prevent page scrolling
    
    if (e.touches.length === 2 && isPinching.current) {
      // Handle pinch gesture
      const currentDistance = getDistance(e.touches[0], e.touches[1]);
      const scale = currentDistance / lastPinchDistance.current;
      
      if (isPictureMoveActive) {
        setImagePosition(prev => ({
          ...prev,
          scale: Math.max(0.5, Math.min(3, prev.scale * scale)) // Limit scale between 0.5x and 3x
        }));
      } else if (isCameraMoveActive) {
        setCameraTransform(prev => ({
          ...prev,
          scale: Math.max(0.5, Math.min(3, prev.scale * scale)) // Limit scale between 0.5x and 3x
        }));
      }
      
      lastPinchDistance.current = currentDistance;
    } else if (e.touches.length === 1 && isDragging.current) {
      // Handle single touch drag
      const dx = e.touches[0].clientX - dragStartPos.current.x;
      const dy = e.touches[0].clientY - dragStartPos.current.y;
      
      if (isPictureMoveActive) {
        setImagePosition(prev => ({
          ...prev,
          x: prev.x + dx,
          y: prev.y + dy
        }));
      } else if (isCameraMoveActive) {
        setCameraTransform(prev => ({
          ...prev,
          x: prev.x + dx,
          y: prev.y + dy
        }));
      }
      
      dragStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isPictureMoveActive && !isCameraMoveActive) return;
    
    if (e.touches.length === 0) {
      // All touches ended
      isDragging.current = false;
      isPinching.current = false;
      
      // Save to localStorage
      if (isPictureMoveActive) {
        localStorage.setItem('tracecam_image_transform', JSON.stringify(imagePosition));
      } else if (isCameraMoveActive) {
        localStorage.setItem('tracecam_camera_transform', JSON.stringify(cameraTransform));
      }
    } else if (e.touches.length === 1 && isPinching.current) {
      // Transition from pinch to single touch drag
      isPinching.current = false;
      isDragging.current = true;
      dragStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  // Load from localStorage on mount
  useEffect(() => {
    const savedImageTransform = localStorage.getItem('tracecam_image_transform');
    const savedCameraTransform = localStorage.getItem('tracecam_camera_transform');
    
    if (savedImageTransform) {
      try {
        const parsedTransform = JSON.parse(savedImageTransform);
        if (parsedTransform && typeof parsedTransform === 'object') {
          setImagePosition(parsedTransform);
        }
      } catch (e) {
        console.error("Failed to parse image transform from localStorage", e);
      }
    }
    
    if (savedCameraTransform) {
      try {
        const parsedTransform = JSON.parse(savedCameraTransform);
        if (parsedTransform && typeof parsedTransform === 'object') {
          setCameraTransform(parsedTransform);
        }
      } catch (e) {
        console.error("Failed to parse camera transform from localStorage", e);
      }
    }
  }, []);

  // Check privacy consent from localStorage on mount
  useEffect(() => {
    const privacyAccepted = localStorage.getItem('tracecam_privacy_accepted');
    if (privacyAccepted === 'true') {
      setShowPrivacy(false);
    }

    // Restore overlay image and opacity from localStorage
    const savedImage = localStorage.getItem('tracecam_overlay_image');
    const savedOpacity = localStorage.getItem('tracecam_overlay_opacity');
    
    if (savedImage) {
      setOverlayImage(savedImage);
    }
    if (savedOpacity) {
      setOverlayOpacity(parseFloat(savedOpacity));
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
        } else {
          console.log('Video ref is null, cannot assign stream');
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

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setOverlayImage(base64);
        // localStorage.setItem('tracecam_overlay_image', base64); // This can exceed quota
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle opacity change
  const handleOpacityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newOpacity = parseFloat(event.target.value);
    setOverlayOpacity(newOpacity);
    localStorage.setItem('tracecam_overlay_opacity', newOpacity.toString());
  };

  // Clear overlay image
  const handleClearImage = () => {
    setOverlayImage('');
    const resetImagePos = { x: 0, y: 0, scale: 1 };
    const resetCameraPos = { x: 0, y: 0, scale: 1 };
    setImagePosition(resetImagePos);
    setCameraTransform(resetCameraPos);
    localStorage.removeItem('tracecam_image_transform');
    localStorage.removeItem('tracecam_camera_transform');
  };

  // Handle Move button toggle
  const handleMoveToggle = () => {
    setShowMoveMenu(prev => !prev);
    // When closing the move menu, deactivate picture move mode and save position
    if (showMoveMenu && isPictureMoveActive) {
      setIsPictureMoveActive(false);
      localStorage.setItem('tracecam_image_transform', JSON.stringify(imagePosition));
    }
    // Close other menus when opening move
    if (!showMoveMenu) {
      setShowOpacitySlider(false);
    }
  };

  const handlePictureMoveToggle = () => {
    setIsPictureMoveActive(prev => !prev);
    // Disable camera mode when enabling picture mode
    if (!isPictureMoveActive) {
      setIsCameraMoveActive(false);
    }
  };

  const handleCameraMoveToggle = () => {
    setIsCameraMoveActive(prev => !prev);
    // Disable picture mode when enabling camera mode
    if (!isCameraMoveActive) {
      setIsPictureMoveActive(false);
    }
  };

  // Handle Hide button
  const handleHide = () => {
    // Lock the image position when hiding
    if (isPictureMoveActive) {
      setIsPictureMoveActive(false);
      localStorage.setItem('tracecam_image_transform', JSON.stringify(imagePosition));
    }
    if (isCameraMoveActive) {
      setIsCameraMoveActive(false);
      localStorage.setItem('tracecam_camera_transform', JSON.stringify(cameraTransform));
    }
    
    // Compensate camera transform to prevent jumping
    // When container expands from top-14 to inset-0, it moves up 56px
    // So we move the camera down 56px to keep it visually in the same place
    setCameraTransform(prev => ({
      ...prev,
      y: prev.y + 56
    }));
    
    setHideMode(true);
    setShowMoveMenu(false);
    setShowOpacitySlider(false);
  };

  // Handle show from eye button
  const handleShow = () => {
    // Compensate camera transform to prevent jumping  
    // When container shrinks from inset-0 to top-14, it moves down 56px
    // So we move the camera up 56px to keep it visually in the same place
    setCameraTransform(prev => ({
      ...prev,
      y: prev.y - 56
    }));
    
    setHideMode(false);
  };

  // Handle Opacity button toggle
  const handleOpacityToggle = () => {
    setShowOpacitySlider(!showOpacitySlider);
    // Close other menus when opening opacity
    if (!showOpacitySlider) {
      setShowMoveMenu(false);
    }
  };

  // Handle video can play event
  const handleCanPlay = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.error('Video play failed:', err);
        setError('Video playback failed');
      });
    } else {
      console.log('Video ref is null in handleCanPlay');
    }
  };

  // Ensure video stream is assigned when stream changes
  useEffect(() => {
    if (stream && videoRef.current) {
      console.log('Re-assigning stream to video element');
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Error overlay component
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 px-4">
        <div className="bg-slate-50/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 max-w-sm w-full border border-slate-300">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">📷</div>
            <h1 className="font-bold text-2xl text-slate-800 mb-4">Camera Error</h1>
            <p className="text-base text-slate-700 mb-6 leading-relaxed">{error}</p>
          </div>
          <div className="bg-slate-200 border border-slate-300 rounded-xl p-4 mb-6">
            <p className="font-semibold text-lg text-slate-700 mb-2">Please ensure:</p>
            <ul className="text-sm text-slate-500 space-y-1 leading-relaxed">
              <li>• Camera permissions are granted</li>
              <li>• No other apps are using the camera</li>
              <li>• Camera is properly connected</li>
            </ul>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-slate-600 hover:bg-slate-700 text-white py-3 px-6 rounded-xl font-semibold transition-colors duration-200"
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 px-4">
        <div className="bg-slate-50/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 max-w-sm w-full border border-slate-300">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">🚫</div>
            <h1 className="font-bold text-2xl text-slate-800 mb-4">Camera Not Supported</h1>
            <p className="text-base text-slate-700 leading-relaxed">
              Your browser doesn't support camera access. Please try a modern browser like Chrome, Firefox, or Safari.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* ---- UI Elements ---- */}

      {/* Privacy Modal (Highest Priority) */}
      {showPrivacy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="bg-slate-50 border border-slate-300 rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <div className="text-center">
              <div className="text-4xl mb-4">📷</div>
              <h1 className="text-2xl mb-4 text-slate-800 font-bold">Welcome to TraceCam</h1>
              <p className="text-base leading-relaxed mb-6 text-slate-700">
                TraceCam uses your camera for tracing overlays. Images and data <strong>never leave your device</strong>. 
                By continuing, you agree to grant camera access.
              </p>
            </div>
            <div className="bg-slate-200 border border-slate-300 rounded-xl p-3 mb-6">
              <div className="flex items-center justify-center">
                <span className="w-2 h-2 bg-slate-600 rounded-full mr-3"></span>
                <span className="text-sm font-semibold text-slate-800">100% Private - Everything stays local</span>
              </div>
            </div>
            <button 
              onClick={handlePrivacyAccept} 
              className="w-full bg-slate-600 hover:bg-slate-700 text-white py-3 px-6 rounded-xl font-semibold transition-colors duration-200"
            >
              Continue & Allow Camera
            </button>
          </div>
        </div>
      )}

      {/* Main UI (conditionally rendered based on stream availability) */}
      {stream && (
        <>
          {/* Top and Bottom Bars (hidden in hideMode) */}
          {!hideMode && (
            <>
              {/* Top Navigation Bar */}
              <div className="fixed top-0 left-0 right-0 h-14 bg-white flex items-center justify-between px-4 z-40 border-b border-gray-200 shadow-sm">
                <h1 className="text-lg font-bold text-black">TraceCam</h1>
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="upload-image"
                  />
                  <label
                    htmlFor="upload-image"
                    className="bg-gray-100 hover:bg-gray-200 text-black px-4 py-2 rounded-full font-medium transition-colors duration-200 cursor-pointer border border-gray-300 text-sm"
                  >
                    Upload
                  </label>
                  {overlayImage && (
                    <button
                      onClick={handleClearImage}
                      className="bg-red-100 hover:bg-red-200 text-red-600 px-4 py-2 rounded-full font-medium transition-colors duration-200 cursor-pointer border border-red-300 text-sm"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Bottom Control Bar */}
              <div className="fixed bottom-0 left-0 right-0 h-14 bg-white flex items-center justify-around px-4 z-40 border-t border-gray-200 shadow-sm">
                <button
                  onClick={handleMoveToggle}
                  className={`text-black font-medium px-4 py-2 rounded-lg transition-colors duration-200 min-h-[44px] ${
                    showMoveMenu ? 'bg-gray-200' : 'hover:bg-gray-100'
                  }`}
                >
                  Move
                </button>
                <button
                  onClick={handleHide}
                  className="text-black font-medium px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 min-h-[44px]"
                >
                  Hide
                </button>
                <button
                  onClick={handleOpacityToggle}
                  className={`text-black font-medium px-4 py-2 rounded-lg transition-colors duration-200 min-h-[44px] ${
                    showOpacitySlider ? 'bg-gray-200' : 'hover:bg-gray-100'
                  }`}
                >
                  Opacity
                </button>
              </div>

              {/* Opacity Slider (appears above bottom bar when active) */}
              {showOpacitySlider && (
                <div className="fixed bottom-16 left-4 right-4 z-30">
                  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-lg">
                    <div className="text-black text-center mb-2 font-medium">
                      Opacity: {Math.round(overlayOpacity * 100)}%
                    </div>
                    <input
                      type="range"
                      min={0.1}
                      max={1}
                      step={0.01}
                      value={overlayOpacity}
                      onChange={handleOpacityChange}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Move Submenu (appears above bottom bar when active) */}
              {showMoveMenu && (
                <div className="fixed bottom-16 left-4 right-4 z-30">
                  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-lg">
                    <div className="flex justify-center space-x-8">
                      <button 
                        onClick={handlePictureMoveToggle}
                        className={`text-black font-medium px-6 py-2 rounded-lg transition-colors duration-200 border border-gray-200 ${
                          isPictureMoveActive ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                        }`}
                      >
                        Picture
                      </button>
                      <button 
                        onClick={handleCameraMoveToggle}
                        className={`text-black font-medium px-6 py-2 rounded-lg transition-colors duration-200 border border-gray-200 ${
                          isCameraMoveActive ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                        }`}
                      >
                        Camera
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Eye Button (shown only in hideMode) */}
          {hideMode && (
            <button
              onClick={handleShow}
              className="fixed top-4 left-4 z-50 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-black hover:bg-white transition-colors duration-200 shadow-lg"
            >
              👁️
            </button>
          )}

          {/* Camera Feed & Overlay (using smart positioning) */}
          <div 
            className={`fixed ${hideMode ? 'inset-0' : 'top-14 bottom-14 left-0 right-0'} w-full h-full`}
            style={{
              transform: `translate(${cameraTransform.x}px, ${cameraTransform.y}px) scale(${cameraTransform.scale})`,
              transformOrigin: 'center center'
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              onCanPlay={handleCanPlay}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
              className="w-full h-full object-cover z-0"
            />
            {overlayImage && (
              <div
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
                className="absolute inset-0 w-full h-full touch-none z-10"
                style={{
                  transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${imagePosition.scale})`,
                  opacity: overlayOpacity,
                  backgroundImage: `url(${overlayImage})`,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  cursor: isPictureMoveActive ? 'grab' : 'default',
                }}
              />
            )}
          </div>
        </>
      )}

      {/* Loading overlay (shown when stream is not yet ready) */}
      {!stream && !showPrivacy && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200">
          <div className="bg-slate-50/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 max-w-sm w-full border border-slate-300 text-center mx-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
            <h2 className="font-semibold text-lg text-slate-800 mb-2">Starting Camera</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Please allow camera access when prompted
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
