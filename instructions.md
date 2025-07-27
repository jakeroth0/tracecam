Absolutely, I'll lay out a **clean, step-by-step build plan** for TraceCam as a markdown file, with each *phase* separated by core features. Each phase is broken into very small, sequential steps. This will let you (or Claude/Cursor) move through the project with total clarity—**one feature at a time**—and overwrite the repo as you go.

---

````markdown
# TraceCam Build Roadmap (Phase-Driven Step-by-Step)

This document guides you through building the TraceCam app **one core feature at a time**.
Each phase is self-contained—fully complete one before moving to the next.  
**Goal:** Build a mobile web app that opens the back camera, displays a privacy notice, allows overlaying an image (with opacity control), and never uploads user data.

---

## Phase 0: Clean Start

- [x] Delete the current project directory (or start a fresh folder).
- [x] Create a new Vite+React project:
  ```bash
  npm create vite@latest tracecam --template react
  cd tracecam
  npm install
````

* [x] Install Tailwind CSS:

  ```bash
  npm install -D tailwindcss postcss autoprefixer
  npx tailwindcss init -p
  ```

  * Follow [Tailwind's official Vite+React guide](https://tailwindcss.com/docs/guides/vite).

* [x] Remove default boilerplate from `App.jsx` and `main.jsx`.

* [x] In `index.css`, include Tailwind's base styles:

  ```css
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  ```

* [x] Confirm `npm run dev` works and displays a blank page.

---

## Phase 1: Camera Feed (Back Camera Only)

**Goal:** Show a full-screen, working live back camera view on mobile and desktop.

### Steps

1. **Set Up Main Layout**

   * [ ] Use a minimal, full-viewport container (`min-h-screen`, `flex`, `items-center`, `justify-center`, `bg-gray-100`).

2. **Add Video Element**

   * [ ] In `App.jsx`, add a `<video>` element with these props:

     * `autoPlay`
     * `playsInline`
     * `muted`
     * Full width/height (`className="fixed inset-0 w-full h-full object-cover z-0"`)
     * Ref: `videoRef` via `useRef`

3. **Request Camera Stream**

   * [ ] On mount (using `useEffect`), request `getUserMedia({ video: { facingMode: { exact: "environment" }}})`.
   * [ ] If error, fallback to `{ video: { facingMode: "environment" }}`.
   * [ ] Attach the stream to `videoRef.current.srcObject`.

4. **Error Handling**

   * [ ] If camera access fails, show a large, clear error message overlay.
   * [ ] If browser doesn't support camera, show a warning.

5. **Testing**

   * [ ] Confirm on laptop with webcam, then on phone (using `npm run dev -- --host` and your local IP).
   * [ ] The camera feed should fill the screen, be responsive, and not be covered by other elements.

---

## Phase 2: Privacy Pop-Up

**Goal:** Before showing or requesting the camera, display a privacy banner/modal.

### Steps

1. **Add Privacy State**

   * [ ] In `App.jsx`, create state: `showPrivacy` (default: `true`).
   * [ ] Only show the camera feed if `showPrivacy` is `false`.

2. **Privacy Modal UI**

   * [ ] Create a modal or banner using Tailwind:

     * Frosted glass look: `bg-white/60 backdrop-blur-md rounded-xl shadow-xl p-6 max-w-sm mx-auto`
     * Centered on screen, with larger text and a close/agree button.
   * [ ] Example message:
     "TraceCam uses your camera for tracing overlays. Images and data **never leave your device**. By continuing, you agree to grant camera access."

3. **Dismissal Logic**

   * [ ] On button click, set `showPrivacy` to `false`.
   * [ ] (Optional) Store a flag in `localStorage` so it doesn't pop up every visit.

4. **Testing**

   * [ ] Confirm modal appears on first visit.
   * [ ] When dismissed, camera feed starts.

---

## Phase 3: Image Overlay

**Goal:** Allow user to upload an image and overlay it (with adjustable opacity) on top of the live camera.

### Steps

1. **Add Upload UI**

   * [ ] Add a button/input for image upload (`type="file"`, accept `image/*`).
   * [ ] When image is chosen, read as base64 using `FileReader`.
   * [ ] Store in React state (`overlayImage`).

2. **Overlay the Image**

   * [ ] Render the uploaded image as an `<img>` tag with:

     * Absolute/fixed positioning
     * Full viewport size
     * `pointer-events-none` so it doesn't block UI
     * Use CSS `opacity` (controlled by state)
     * Place above the video via `z-index`

3. **Add Opacity Control**

   * [ ] Add a slider (`input type="range"`, min `0.1`, max `1`, step `0.01`).
   * [ ] Bind slider to overlay image opacity.

4. **Persist Overlay**

   * [ ] Store the uploaded image and last opacity value in `localStorage`.
   * [ ] On load, restore from storage if available.

5. **Testing**

   * [ ] Upload an image, see it appear over the camera feed.
   * [ ] Adjust opacity; confirm real-time changes.
   * [ ] Refresh page; overlay image and opacity should persist.

---

## Phase 4: Extras & Polish

**Optional, after MVP:**

* [ ] "Clear Image" button with confirmation modal.
* [ ] Bigger, touch-friendly UI buttons (min height, larger font).
* [ ] PWA install prompt (using Vite PWA plugin).
* [ ] Accessibility tweaks (focus styles, ARIA labels).
* [ ] Responsive/frosted glass theming for all UI panels.

---

## Summary

* **One phase at a time:**

  1. Camera feed
  2. Privacy pop-up
  3. Image overlay (with opacity)
* Do not proceed to the next phase until the previous is fully working and tested.
* All storage is local. All features should be tested on mobile, not just desktop.

---

*As you build, check off each step and phase. If you get stuck, stop and debug before moving forward.*

```

---

**You can copy this as your new `README.md` and start fresh.**  
Let me know if you want example code for any phase, or want this as a downloadable file!
```
