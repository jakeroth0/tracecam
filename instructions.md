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
  ```
- [x] Install Tailwind CSS:
  ```bash
  npm install -D tailwindcss @tailwindcss/vite postcss autoprefixer
  npx tailwindcss init
  ```
  * Configured `vite.config.ts` to use the `@tailwindcss/vite` plugin.
- [x] Remove default boilerplate from `App.tsx` and `main.tsx`.
- [x] In `index.css`, include Tailwind's base styles:
  ```css
  @import "tailwindcss";
  ```
- [x] Confirm `npm run dev` works and displays a blank page.

---

## Phase 1: Camera Feed (Back Camera Only)

**Goal:** Show a full-screen, working live back camera view on mobile and desktop.

### Steps

1. **Set Up Main Layout**
   * [x] Use a minimal, full-viewport container.
   * [x] **Update:** Implemented a two-bar layout with solid white bars at the top and bottom.

2. **Add Video Element**
   * [x] In `App.tsx`, add a `<video>` element with these props:
     * `autoPlay`, `playsInline`, `muted`
     * Positioned to fill the space between the top and bottom bars.
     * Ref: `videoRef` via `useRef`.

3. **Request Camera Stream**
   * [x] On mount (using `useEffect`), request `getUserMedia({ video: { facingMode: { exact: "environment" }}})`.
   * [x] If error, fallback to `{ video: { facingMode: "environment" }}`.
   * [x] Attach the stream to `videoRef.current.srcObject`.

4. **Error Handling**
   * [x] If camera access fails, show a large, clear error message overlay.
   * [x] If browser doesn't support camera, show a warning.

5. **Testing**
   * [x] Confirm on laptop with webcam, then on phone.
   * [x] The camera feed fills the space between the bars correctly.

---

## Phase 2: Privacy Pop-Up

**Goal:** Before showing or requesting the camera, display a privacy banner/modal.

### Steps

1. **Add Privacy State**
   * [x] In `App.tsx`, create state: `showPrivacy` (default: `true`).
   * [x] Only show the camera feed if `showPrivacy` is `false`.

2. **Privacy Modal UI**
   * [x] Create a modal or banner using Tailwind.
   * [x] Message clarifies that data never leaves the device.

3. **Dismissal Logic**
   * [x] On button click, set `showPrivacy` to `false`.
   * [x] Store a flag in `localStorage` so it doesn't pop up every visit.

4. **Testing**
   * [x] Confirm modal appears on first visit.
   * [x] When dismissed, camera feed starts.

---

## Phase 3: Image Overlay

**Goal:** Allow user to upload an image and overlay it (with adjustable opacity) on top of the live camera.

### Steps

1. **Add Upload UI**
   * [x] Add a button/input for image upload (`type="file"`, accept `image/*`).
   * [x] When image is chosen, read as base64 using `FileReader`.
   * [x] Store in React state (`overlayImage`).

2. **Overlay the Image**
   * [x] Render the uploaded image as an `<img>` tag.
   * [x] Positioned to fill the space between the top and bottom bars.
   * [x] Use CSS `opacity` (controlled by state).
   * [x] Place above the video via `z-index`.

3. **Add Opacity Control**
   * [x] Add a slider (`input type="range"`) that appears when the "Opacity" button is clicked.
   * [x] Bind slider to overlay image opacity.

4. **Persist Overlay**
   * [x] Store the uploaded image and last opacity value in `localStorage`.
   * [x] On load, restore from storage if available.

5. **Testing**
   * [x] Upload an image, see it appear over the camera feed.
   * [x] Adjust opacity; confirm real-time changes.
   * [x] Refresh page; overlay image and opacity should persist.

---

## Phase 4: Extras & Polish

**Optional, after MVP:**

* [ ] "Clear Image" button with confirmation modal.
* [ ] Implement "Move" functionality (for image and/or camera).
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
