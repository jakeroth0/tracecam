# TraceCam

A mobile-friendly Progressive Web App (PWA) for tracing images over a live camera feed. Upload an image, adjust its transparency, and overlay it on your device's back camera for precise tracing and drawing.

![TraceCam Preview](https://img.shields.io/badge/PWA-Ready-blue)
![React](https://img.shields.io/badge/React-18+-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3+-blue)

## ✨ Features

- **📱 Mobile-First Design**: Optimized for smartphones and tablets
- **📷 Camera Integration**: Access back-facing camera for optimal tracing
- **🖼️ Image Upload**: Support for JPEG and PNG image formats
- **🔍 Adjustable Opacity**: Real-time opacity control with smooth slider
- **💾 Local Storage**: All data stays on your device - no uploads
- **🔒 Privacy-Focused**: No data collection or external tracking
- **⚡ PWA Support**: Install as a native app on mobile devices
- **🌙 Intuitive UI**: Frosted glass design with modern aesthetics
- **✅ Confirmation Dialogs**: Safe image clearing with user confirmation

## 🚀 Live Demo

Visit the live app: [TraceCam on Vercel](https://your-vercel-url.vercel.app)

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **PWA**: Vite PWA Plugin with Workbox
- **Camera API**: MediaDevices getUserMedia API
- **Storage**: Browser LocalStorage

## 📱 Installation

### As a PWA (Recommended)
1. Visit the app in your mobile browser
2. Look for the "Add to Home Screen" prompt
3. Follow your browser's installation instructions
4. Access TraceCam like a native app!

### Local Development
```bash
# Clone the repository
git clone https://github.com/jakeroth0/tracecam.git
cd tracecam

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📋 Usage

1. **Upload Image**: Tap "Upload Image" and select a photo from your device
2. **Adjust Opacity**: Use the slider to set the perfect transparency level
3. **Start Camera**: Tap "Start Camera" to activate your device's back camera
4. **Trace Away**: Position your device and start tracing the overlaid image
5. **Exit Camera**: Tap "Exit Camera" when finished tracing

### Tips for Best Results
- Use high-contrast images for easier tracing
- Ensure good lighting for camera visibility
- Hold device steady for precise tracing
- Adjust opacity based on lighting conditions

## 🔒 Privacy & Security

TraceCam is built with privacy in mind:
- ✅ No data collection or analytics
- ✅ No external API calls
- ✅ All images stored locally on your device
- ✅ Camera access only when explicitly requested
- ✅ Open source and transparent

## 🧪 Browser Compatibility

TraceCam works on modern browsers that support:
- Camera API (getUserMedia)
- ES6+ JavaScript features
- CSS backdrop-filter (for frosted glass effect)
- Service Workers (for PWA functionality)

**Tested on:**
- ✅ Chrome 90+ (Android/iOS)
- ✅ Safari 14+ (iOS)
- ✅ Firefox 88+ (Android)
- ✅ Edge 90+ (Android)

## 🏗️ Development

### Project Structure
```
tracecam/
├── src/
│   ├── App.tsx           # Main application component
│   ├── App.css          # Custom styles
│   ├── index.css        # Tailwind imports
│   └── main.tsx         # Application entry point
├── public/              # Static assets
├── instructions.md      # Development checklist
└── README.md           # This file
```

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Build Checklist Progress
- [x] Project Setup (Vite + React + TypeScript)
- [x] Tailwind CSS Integration
- [x] Frosted Glass UI Design
- [x] Image Upload & Display
- [x] Local Storage Implementation
- [x] Opacity Slider Control
- [x] Camera Integration (Back-facing)
- [x] Full-Screen Camera Mode
- [x] Image Overlay on Camera
- [x] Clear Image with Confirmation
- [x] Privacy Information Modal
- [x] PWA Support & Service Worker
- [ ] Deployment to Vercel/Netlify

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Vercel will automatically build and deploy
3. Your app will be available at `https://your-app.vercel.app`

### Netlify
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Deploy automatically on push

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Jacob Roth** - [GitHub](https://github.com/jakeroth0) | [Portfolio](https://jakeroth0.github.io/Jake_Roth_Portfolio/)

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first styling
- Vite team for the lightning-fast build tool
- All contributors and users of TraceCam

---

<div align="center">
  
**[⬆ Back to Top](#tracecam)**

Made with ❤️ for artists, designers, and creative minds everywhere

</div>
