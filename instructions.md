# TraceCam - Build Checklist

> **Goal:**  
Build a mobile-friendly PWA for tracing images over a live back camera feed.  
Users upload an image, adjust transparency, and overlay it on the camera.  
All data stays local. Includes “Clear Image” with confirmation. Minimal, frosted-glass UI.

---

## 1. Project Setup

- [ ] Install Node.js (v18+ recommended)
- [ ] Create a new Vite React app
    ```bash
    npm create vite@latest tracecam --template react
    cd tracecam
    npm install
    ```
- [ ] Install Tailwind CSS  
    - Follow the [official Vite+React+Tailwind guide](https://tailwindcss.com/docs/guides/vite) step by step.

- [ ] Run `npm run dev` and confirm you see the default Vite React app in your browser.

---

## 2. UI Base & Styling

- [ ] Clear out Vite boilerplate (`App.jsx`, `main.jsx`, etc.).
- [ ] Set up a **single column, centered layout** that fills the screen (Tailwind: `min-h-screen flex flex-col items-center justify-center`).
- [ ] Add a **frosted glass panel**:
    - Tailwind: `bg-white/60 backdrop-blur-md rounded-xl shadow-lg p-4`
    - Should be centered and mobile-friendly.

- [ ] Add a **title** at the top: `TraceCam`
- [ ] Add an **Upload Image** button (styled file input).
- [ ] Add a **slider** for opacity (label: “Overlay Opacity”).
- [ ] Add a **Start Camera** button.
- [ ] Add a placeholder for privacy info at the bottom.
- [ ] Add a placeholder for “Clear Image” button (don’t implement yet).

**Test:**  
Check that the UI looks good on mobile and desktop browser in responsive mode.

---

## 3. Image Upload & Display

- [ ] Implement the file input to accept image files (JPEG/PNG).
- [ ] On image select:
    - Read image as **base64 data URL** using FileReader.
    - Store image in a React state variable.
    - Display the image in the frosted glass panel for preview.
- [ ] Add a “Remove Image” button next to the preview (for dev/test only; remove later if not needed).

**Test:**  
Upload an image, see the preview. Try small and large images.

---

## 4. Save to Local Storage

- [ ] When image is uploaded, **save base64 string** to `localStorage` (key: `tracecam-image`).
- [ ] On page load, **check localStorage** for `tracecam-image` and restore if present.
- [ ] When user “clears” the image (see below), remove the key from `localStorage`.

**Test:**  
- Upload an image, refresh page—image should persist.
- Use browser dev tools to confirm value in `localStorage`.

---

## 5. Opacity Slider

- [ ] Implement slider (`input type="range"`) with min/max (e.g., 0.1 to 1, step 0.01).
- [ ] Store opacity in React state.
- [ ] Bind slider value to CSS `opacity` of the image preview.
- [ ] Save opacity setting to `localStorage` (key: `tracecam-opacity`).
- [ ] On load, restore opacity setting from `localStorage`.

**Test:**  
Adjust slider, see live opacity change. Refresh—should persist.

---

## 6. Camera Integration

#### 6.1. Start Camera (Back Facing)
- [ ] On “Start Camera” click, use `navigator.mediaDevices.getUserMedia` with `{ video: { facingMode: { exact: "environment" } } }`
- [ ] Show live camera in a `<video>` element.
- [ ] Handle errors gracefully (permissions denied, not supported, etc.):
    - Show a clear message: “Camera access is required for TraceCam to work.”

#### 6.2. Full-Screen Camera Mode
- [ ] When camera is started, **hide upload UI** and show:
    - Camera feed (video element)
    - Overlay image (if set) absolutely positioned on top of video
    - Opacity slider
    - “Clear Image” button
    - “Exit Camera” button to return to main UI

#### 6.3. Overlay Image on Camera
- [ ] Overlay the uploaded image using absolute/fixed positioning, matching the size of the video feed.
- [ ] Bind overlay opacity to slider.

**Test:**  
- Click “Start Camera,” see live video from back camera.
- If image was uploaded, it appears on top with correct opacity.
- Opacity slider adjusts overlay in real time.

---

## 7. Clear Image (With Confirmation)

- [ ] Add a “Clear Image” button in camera mode and preview mode.
- [ ] On click, show confirmation dialog:
    - “Are you sure you want to clear this image? This cannot be undone.”  
      Buttons: [Cancel] [Clear Image]
- [ ] If confirmed, remove image from state and `localStorage`, hide overlay.

**Test:**  
- Clear image; overlay disappears; localStorage key removed.
- Test cancel path—image stays.

---

## 8. Privacy Info

- [ ] On first visit, show a dismissible privacy banner/modal:
    - “TraceCam uses your camera and lets you upload images for overlay tracing. All data stays on your device and is never uploaded. You can clear images at any time.”
- [ ] Add a small “Privacy” or “Info” link at the bottom with the same text.

**Test:**  
- Banner shows on first load, can be dismissed, doesn’t show again unless cleared from storage.

---

## 9. PWA Support

- [ ] Add [Vite PWA Plugin](https://vite-pwa-org.netlify.app/guide/)
    - Follow quickstart instructions (just a few lines in `vite.config.js`)
- [ ] Create `manifest.json` with:
    - App name: TraceCam
    - Icons (you can use a generated PWA icon)
    - Theme color, display: standalone, etc.
- [ ] Register the service worker.
- [ ] Test “Add to Home Screen” on iOS and Android.

---

## 10. Deployment

- [ ] Push to GitHub (private or public).
- [ ] Deploy to Vercel or Netlify:
    - Connect repo, click “Deploy.”
    - Update site as you make changes.
- [ ] Open on your phone, test camera, overlay, opacity, clear, privacy, and PWA install.

---

## Done!
Congratulations! Your MVP is ready.

---

**Debug/Tip:**  
- Always test on a real mobile device (iOS + Android).
- If the back camera isn’t available, display a helpful message and fall back to default camera.

---

*Check off each step as you go. Each task is bite-sized to keep you moving! Let me know if you need any individual step broken down into code snippets or want extra QA tips.*
