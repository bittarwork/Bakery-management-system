# UI Components Documentation

## Logo Component

The `Logo` component is a reusable bakery-themed logo that can be used throughout the application.

### Props

- `size` (string): Size of the logo - `'sm'`, `'md'`, `'lg'`, `'xl'`, `'2xl'` (default: `'md'`)
- `showText` (boolean): Whether to show the text "BakeMaster" (default: `true`)
- `animated` (boolean): Whether to show animations (default: `true`)
- `className` (string): Additional CSS classes
- `variant` (string): Logo variant - `'default'`, `'simple'`, `'icon-only'` (default: `'default'`)

### Usage Examples

```jsx
import Logo from '../components/ui/Logo';

// Default logo with text
<Logo />

// Small icon-only logo
<Logo size="sm" variant="icon-only" />

// Large animated logo
<Logo size="xl" animated={true} />

// Simple logo without decorations
<Logo variant="simple" showText={false} />
```

### Design Features

- **Gradient Background**: Amber to orange to red gradient
- **Chef Hat Icon**: Main bakery symbol
- **Decorative Elements**: Wheat and cookie icons with rotation animations
- **Responsive**: Scales appropriately for different sizes
- **Accessible**: Proper contrast and semantic markup

### File Structure

```
src/components/ui/
├── Logo.jsx          # Main logo component
├── README.md         # This documentation
└── ...
```

### Integration

The logo is used in:

- Login page (large animated version)
- Dashboard sidebar (small icon-only version)
- Favicon (SVG version)
- App manifest and meta tags
