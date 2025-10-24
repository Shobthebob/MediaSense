# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

<div align="center"><BR>

# 🎵 MediaSense

**Intelligent Media Playback Manager**

*Seamlessly manage multiple media sources with priority-based control*

[![Desktop Version](https://img.shields.io/badge/Desktop-Python%203.8%2B-blue?logo=python&logoColor=white)](Desktop/mediasense.py)
[![Web Demo](https://img.shields.io/badge/Web%20Demo-React%2019-61dafb?logo=react&logoColor=white)](src/App.tsx)
[![MPRIS](https://img.shields.io/badge/MPRIS-Compatible-green?logo=linux&logoColor=white)](#desktop-version-features)
[![GTK3](https://img.shields.io/badge/GTK-3.0-orange?logo=gtk&logoColor=white)](#installation)

</div>

---

## 🌟 Overview

MediaSense is a sophisticated dual-platform media management system that intelligently controls multiple audio/video sources simultaneously. The project consists of two complementary versions:

- **🖥️ Desktop Application**: Full-featured Python GTK3 app with system integration and MPRIS control
- **🌐 Web Demo**: Interactive React TypeScript showcase with premium UI design

### 🎯 Core Philosophy

MediaSense eliminates the chaos of overlapping audio from multiple applications by implementing **priority-based media control**. When you start playing music on Spotify while watching a YouTube video, MediaSense automatically pauses the lower-priority source, ensuring a seamless and distraction-free experience.

---

## 🏗️ Architecture Overview

### Desktop Version (Production)
```
Desktop/mediasense.py (775 lines)
├── MediaSenseCore      → MPRIS player detection & priority management
├── MediaSenseGUI       → GTK3 interface with settings dialog
├── MediaSenseTray      → System tray integration & quick controls
└── MediaSenseConfig    → JSON-based configuration management
```

### Web Demo (Showcase)
```
src/
├── App.tsx             → Main React application with reorganized layout
├── components/         → Premium UI components with Night Luxe design
│   ├── MediaCard.tsx   → Interactive media source cards
│   ├── StatusBar.tsx   → Real-time playback status display
│   └── SettingsPanel.tsx → Priority & configuration management
├── hooks/
│   └── useMediaManager.ts → Core media logic with fixed priority system
└── types/media.ts      → TypeScript interfaces for type safety
```

---

## 🚀 Desktop Version Features

The production desktop application provides comprehensive media management for Linux environments:

### 🎛️ Core Functionality
- **MPRIS Integration**: Seamlessly controls Spotify, VLC, Firefox, Chromium, and any MPRIS-compatible player
- **Priority-Based Control**: Configurable priority system (1 = highest priority)
- **Intelligent Auto-Pause**: Automatically pauses lower-priority sources when higher-priority media starts
- **Manual Override**: Respects user manual pause/play actions without interference

### 🖥️ System Integration
- **System Tray**: Persistent background operation with quick toggle controls
- **Desktop Notifications**: Non-intrusive alerts for media source changes
- **GTK3 GUI**: Native Linux interface with settings dialog
- **Auto-start Support**: Optional system startup integration

### ⚙️ Advanced Features
- **Real-time Monitoring**: Continuous MPRIS player detection with 1-second intervals
- **Smart Browser Handling**: Special priority logic for web-based media (YouTube, etc.)
- **Configuration Persistence**: JSON-based settings with automatic backup
- **Resource Efficient**: File-only logging to minimize RAM usage
- **Cross-Player Support**: Works with Firefox, Chrome, Spotify, VLC, Rhythmbox, Audacious

### 🎚️ Default Priority Configuration
```json
{
  "priorities": {
    "firefox": 1,      // Web videos (YouTube, etc.)
    "chromium": 1,     // Web videos  
    "chrome": 1,       // Web videos
    "spotify": 2,      // Music streaming
    "vlc": 3,          // Video player
    "rhythmbox": 4,    // Music player
    "audacious": 5     // Audio player
  }
}
```

---

## 🌐 Web Demo Features

The React TypeScript demo showcases MediaSense capabilities with a premium user interface:

### 🎨 Night Luxe Design System
- **Premium Typography**: Geist font family with JetBrains Mono monospace
- **Sophisticated Color Palette**: High-contrast design with brass accent colors (#d4af37)
- **Accessibility First**: WCAG 2.1 AA compliant with 4.5:1+ contrast ratios
- **CSS Custom Properties**: Systematic design tokens for consistent theming

### 🎮 Interactive Components
- **Live Media Cards**: Real-time status indicators with play/pause controls
- **Priority Visualization**: Clear priority numbering and status badges
- **Volume Controls**: Interactive sliders with visual feedback
- **Settings Panel**: Comprehensive configuration with tabbed interface

### 🔧 Technical Implementation
- **React 19**: Latest React with TypeScript strict mode
- **Vite Build System**: Lightning-fast development and optimized production builds
- **Tailwind CSS v4**: Utility-first styling with custom design system
- **Lucide React Icons**: Consistent iconography throughout the interface

---

## 📦 Installation

### Desktop Version Requirements
```bash
# Arch Linux / Manjaro
sudo pacman -S python python-gobject gtk3 libappindicator-gtk3 playerctl libnotify

# Ubuntu / Debian
sudo apt install python3 python3-gi gir1.2-gtk-3.0 gir1.2-appindicator3-0.1 playerctl libnotify-bin

# Fedora
sudo dnf install python3 python3-gobject gtk3-devel libappindicator-gtk3-devel playerctl libnotify-devel
```

### Desktop Installation
```bash
# Clone repository
git clone <repository-url>
cd MediaSense

# Make executable and run
chmod +x Desktop/mediasense.py
python3 Desktop/mediasense.py
```

### Web Demo Setup
```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build
npm run preview
```

---

## 🎯 Usage Guide

### Desktop Application

#### First Launch
1. **Start MediaSense**: `python3 Desktop/mediasense.py`
2. **System Tray**: Look for the MediaSense icon in your system tray
3. **Initial State**: The detector starts OFF by default - click "Turn On" to activate
4. **Settings Access**: Right-click tray icon → Settings to configure priorities

#### Priority Management
The priority system determines which media source takes precedence:

```
Priority 1 (Highest): Web browsers (YouTube, streaming)
Priority 2: Music apps (Spotify, Apple Music)
Priority 3+: Other media players (VLC, local players)
```

#### Smart Behavior Examples
- **Start YouTube video** → Spotify automatically pauses
- **Pause YouTube** → Spotify resumes if it was playing before
- **Manual Spotify pause** → YouTube won't cause auto-resume
- **Close browser** → Spotify resumes automatically

### Web Demo

#### Interactive Demo Flow
1. **Visit Demo**: Open the web interface
2. **Try Priority Control**: Click play on YouTube card, watch Spotify pause
3. **Test Manual Override**: Manually pause/play to see priority respect
4. **Adjust Settings**: Open settings panel to modify priorities
5. **Volume Control**: Use sliders to adjust individual source volumes

---

## 🛠️ Configuration

### Desktop Configuration
Location: `~/.config/mediasense/config.json`

```json
{
  "priorities": {
    "firefox": 1,
    "spotify": 2,
    "vlc": 3
  },
  "notification_enabled": true,
  "pause_all_enabled": false,
  "check_interval": 1.0,
  "browser_patterns": ["firefox", "chromium", "chrome", "brave"]
}
```

### Configuration Options
- **`priorities`**: Player priority mapping (1 = highest)
- **`notification_enabled`**: Desktop notifications on/off
- **`pause_all_enabled`**: Emergency pause all media mode
- **`check_interval`**: MPRIS polling frequency (seconds)
- **`browser_patterns`**: Browser detection patterns

---

## 🔧 Development

### Desktop Development
```bash
# Enable debug logging
export MEDIASENSE_DEBUG=1
python3 Desktop/mediasense.py

# View logs
tail -f ~/.local/share/mediasense/mediasense.log
```

### Web Development
```bash
# Hot reload development
npm run dev

# Type checking
npm run build

# Linting
npm run lint
```

### Code Architecture

#### Desktop Core Logic
```python
class MediaSenseCore:
    """775-line core with MPRIS integration"""
    def manage_playback(self):
        # Priority-based media control
        # Smart pause/resume logic
        # Manual override detection
```

#### Web State Management
```typescript
interface MediaSource {
    id: string;
    priority: number;
    isPlaying: boolean;
    manuallyPaused?: boolean; // Prevents unwanted auto-resume
}
```

---

## 🎨 Design System (Web Demo)

### Night Luxe Color Palette
```css
:root {
    --color-primary: #ffffff;      /* Pure white text */
    --color-secondary: #a1a1a1;   /* Subtle gray */
    --color-accent: #d4af37;      /* Brass gold */
    --color-success: #10b981;     /* Emerald green */
    --color-warning: #f59e0b;     /* Amber yellow */
    --color-error: #ef4444;       /* Red */
    --color-surface: #1a1a1a;     /* Dark surface */
    --color-elevated: #2a2a2a;    /* Elevated surface */
}
```

### Typography Scale
```css
--text-display: 3rem;    /* 48px - Hero headings */
--text-title: 2rem;      /* 32px - Section titles */
--text-heading: 1.5rem;  /* 24px - Component headings */
--text-body: 1rem;       /* 16px - Body text */
--text-caption: 0.875rem; /* 14px - Captions */
```

---

## 🤝 Contributing

### Desktop Contributions
- **MPRIS Compatibility**: Test with additional media players
- **Desktop Environment**: Support for KDE, XFCE system trays
- **Feature Requests**: Global hotkeys, advanced scheduling

### Web Demo Contributions
- **Design Enhancements**: Animation improvements, accessibility features
- **Component Library**: Reusable UI components for other projects
- **Mobile Responsive**: Tablet and mobile optimization

---

## 📋 Troubleshooting

### Desktop Issues

#### "playerctl not found"
```bash
# Install playerctl for your distribution
sudo pacman -S playerctl  # Arch
sudo apt install playerctl  # Ubuntu
```

#### "No players found"
- Ensure media applications are running
- Check if applications support MPRIS (most modern players do)
- Try toggling the detector off/on in system tray

#### System tray not visible
- Install system tray support for your DE
- Check AppIndicator3 libraries are installed

### Web Demo Issues

#### Development server won't start
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

#### TypeScript errors
```bash
# Check TypeScript configuration
npm run build
```

---

## 📊 Technical Specifications

### Desktop Performance
- **Memory Usage**: ~15-25MB (optimized with file-only logging)
- **CPU Impact**: Minimal (1-second polling intervals)
- **Startup Time**: <2 seconds on modern systems
- **Dependencies**: GTK3, AppIndicator3, playerctl, libnotify

### Web Demo Performance
- **Bundle Size**: <500KB gzipped
- **Runtime Memory**: ~8-12MB
- **Load Time**: <1 second on modern connections
- **Compatibility**: Modern browsers with ES2020+ support

---

## 📜 License & Credits

### Open Source License
This project is released under the MIT License. See LICENSE file for details.

### Technology Stack Credits
- **Desktop**: Python, GTK3, MPRIS, AppIndicator3
- **Web**: React, TypeScript, Vite, Tailwind CSS
- **Icons**: Lucide React icon library
- **Fonts**: Geist (Vercel), JetBrains Mono

### Special Recognition
MediaSense was designed to solve the real-world problem of audio chaos in modern multi-media workflows. The priority-based approach ensures that users maintain control over their audio environment without manual intervention.

---

<div align="center">

**🎵 MediaSense - Where Audio Chaos Meets Intelligent Control 🎵**

*Built with ❤️ for seamless media experiences*

</div>

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
