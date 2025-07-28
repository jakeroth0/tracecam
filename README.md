# TraceCam 📹

A **privacy-first mobile web application** for camera overlay tracing. Open your device's back camera, upload reference images, and trace over them with adjustable opacity and positioning controls.

## 🚀 Live Demo

**[Try TraceCam Now →](https://tracecam.vercel.app)**

*Best experienced on mobile devices with rear cameras.*

---

## ✨ Features

### 🎯 **Core Functionality**
- **📱 Mobile-optimized** camera access (rear camera priority)
- **🖼️ Image overlay** with drag-and-drop positioning
- **🔍 Pinch-to-zoom** for both camera and uploaded images
- **🎚️ Adjustable opacity** slider (0-100%)
- **💾 Full persistence** - your settings survive page reloads

### 🔒 **Privacy-First Design**
- **🚫 Zero data upload** - everything stays on your device
- **📍 Local storage only** - images never leave your browser
- **🔐 No server processing** - completely client-side
- **✋ Privacy consent** modal on first use

### 🎨 **User Experience**
- **📏 Clean, minimal UI** with collapsible controls
- **👆 Touch-friendly** buttons and gestures
- **🔄 Unified transforms** - camera and image move together
- **👁️ Hide mode** for distraction-free tracing
- **🎯 Professional mobile app feel**

---

## 🛠️ Tech Stack

- **⚛️ React 18** + **TypeScript**
- **⚡ Vite** - Lightning-fast dev environment
- **🎨 Tailwind CSS** - Utility-first styling
- **📱 PWA-ready** - Install as mobile app
- **🌐 Camera APIs** - `getUserMedia` for device access

---

## 🚀 Development

### **Prerequisites**
- Node.js 18+
- Modern browser with camera support

### **Quick Start**
```bash
# Clone the repository
git clone https://github.com/jakeroth0/tracecam.git
cd tracecam

# Install dependencies
npm install

# Start development server
npm run dev
```

### **Build for Production**
```bash
npm run build
npm run preview
```

---

## 📱 Usage

### **Getting Started**
1. **📸 Grant camera permissions** when prompted
2. **✅ Accept privacy notice** (one-time setup)
3. **📹 Camera feed** appears automatically

### **Image Overlay**
1. **📤 Tap "Upload"** in the top bar
2. **🖼️ Select reference image** from your device
3. **🎚️ Tap "Opacity"** to adjust transparency
4. **🔄 Tap "Move"** → **"Picture"** to position your image

### **Camera Control**
1. **🔄 Tap "Move"** → **"Camera"** to enter camera mode
2. **👆 Drag** to pan the camera view
3. **🤏 Pinch** to zoom in/out
4. **🔒 Tap "Move"** again to lock position

### **Hide Mode**
- **👁️ Tap "Hide"** to remove all UI elements
- **👁️ Tap the eye icon** (top-left) to restore controls

---

## 🗂️ Project Structure

```
src/
├── App.tsx           # Main application component
├── main.tsx          # React entry point
├── index.css         # Tailwind imports
└── vite-env.d.ts     # TypeScript definitions

public/
└── vite.svg          # App icon

docs/
└── instructions.md   # Development roadmap
```

---

## 🤝 Contributing

### **Development Phases**
This project was built in structured phases:

1. **Phase 0**: Project setup + Tailwind CSS
2. **Phase 1**: Camera feed implementation  
3. **Phase 2**: Privacy consent modal
4. **Phase 3**: Image overlay + opacity controls
5. **Phase 4**: Advanced gestures + positioning

See [`instructions.md`](./instructions.md) for the complete development roadmap.

### **Making Changes**
1. **🌿 Create feature branch**: `git checkout -b feature/your-feature`
2. **💻 Develop and test** on mobile devices
3. **📝 Update this README** if adding features
4. **🔀 Submit pull request** to `main`

---

## 📄 License

**MIT License** - Feel free to use this project for personal or commercial purposes.

---

## 🙋 Support

- **🐛 Found a bug?** [Open an issue](https://github.com/jakeroth0/tracecam/issues)
- **💡 Feature request?** [Start a discussion](https://github.com/jakeroth0/tracecam/discussions)
- **📧 Need help?** Check the usage guide above

---

**Built with ❤️ for artists, designers, and anyone who needs precise tracing capabilities on mobile devices.**
