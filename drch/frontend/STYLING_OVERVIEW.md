# Disaster Management System - Styling Overview

## 🎨 Theme System

We've created a comprehensive theme system with distinct visual identities for each page:

### 🔵 Dashboard Theme (Blue)
- **Primary Color**: Blue gradient (#667eea to #764ba2)
- **Purpose**: Professional, analytical overview
- **Features**: 
  - Emergency operations dashboard
  - Key metrics with animated cards
  - Quick action buttons
  - System status overview
  - Recent activity feed

### 🔴 Flood Monitor Theme (Red)
- **Primary Color**: Red gradient (#ff6b6b to #ee5a24)
- **Purpose**: High-alert, emergency response
- **Features**:
  - Interactive flood event map
  - Confidence-based color coding
  - Real-time event detection
  - Emergency alert system
  - Detailed event analysis

### 🟠 Road Status Theme (Orange)
- **Primary Color**: Orange gradient (#ffa726 to #ff7043)
- **Purpose**: Infrastructure monitoring
- **Features**:
  - Road segment visualization
  - Traffic impact analysis
  - Status-based polylines (Green/Red/Orange)
  - Real-time road closures
  - Management actions

### 🟢 Victim Reports Theme (Green/Teal)
- **Primary Color**: Teal gradient (#26d0ce to #1a2980)
- **Purpose**: Humanitarian response
- **Features**:
  - Victim location markers
  - Address-based reporting
  - Priority-based color coding
  - Real-time WebSocket updates
  - Rescue coordination

## 🎯 Key Design Features

### Visual Hierarchy
- **Page Containers**: Full-height gradient backgrounds
- **Content Wrappers**: Centered, rounded containers with shadows
- **Theme Cards**: Glass-morphism effect with backdrop blur
- **Stat Cards**: Hover animations and color-coded borders

### Interactive Elements
- **Buttons**: Themed colors with hover effects
- **Maps**: Custom styling and interactive markers
- **Cards**: Hover animations and selection states
- **Loading States**: Themed spinners and animations

### Responsive Design
- **Mobile-first**: Optimized for all screen sizes
- **Grid Layouts**: Flexible and adaptive
- **Typography**: Scalable and readable
- **Touch-friendly**: Large interactive areas

## 🛠 Technical Implementation

### CSS Architecture
- **CSS Variables**: Theme-based color system
- **Utility Classes**: Reusable component styles
- **Animations**: Smooth transitions and hover effects
- **Glass-morphism**: Modern backdrop blur effects

### Component Structure
- **Theme Wrappers**: Each page has its own theme class
- **Consistent Layout**: Standardized header, content, and action areas
- **Modular Styling**: Reusable theme components
- **Performance**: Optimized CSS with minimal bundle size

## 🚀 Usage

Each page automatically applies its theme when loaded:

```tsx
// Dashboard uses dashboard-theme
<div className="dashboard-theme page-container">
  <div className="content-wrapper">
    {/* Content */}
  </div>
</div>

// FloodMonitor uses flood-theme
<div className="flood-theme page-container">
  <div className="content-wrapper">
    {/* Content */}
  </div>
</div>
```

## 🎨 Customization

To customize themes, modify the CSS variables in `src/styles/themes.css`:

```css
.dashboard-theme {
  --theme-primary: #your-color;
  --theme-bg: linear-gradient(135deg, #color1 0%, #color2 100%);
}
```

## 📱 Browser Support

- Modern browsers with CSS Grid support
- CSS Variables support
- Backdrop-filter support for glass effects
- Flexbox support for layouts
