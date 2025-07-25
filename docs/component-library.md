# Component Library Documentation
## Insights App Components

---

## 🧩 **Authentication Components**

### **AuthForm.tsx**
**Location**: `/src/components/AuthForm.tsx`  
**Purpose**: Main authentication interface with tabbed design  

**Features**:
- Three modes: Login, Register, Password Reset
- Gradient tab design with color themes
- Password visibility toggle
- Mobile-responsive layout
- App branding integration
- Form validation and error handling

**Props**: None (self-contained)  
**State**:
- `mode`: 'login' | 'register' | 'recover'
- `showPassword`: boolean
- `form`: object with email, password, name, phone
- `loading`, `error`, `success`: UI states
- `showVerify`: boolean for email verification

**Usage**:
```tsx
import AuthForm from '@/components/AuthForm';

export default function HomePage() {
  return <AuthForm />;
}
```

### **VerifyEmailForm.tsx**
**Location**: `/src/components/VerifyEmailForm.tsx`  
**Purpose**: Email verification interface  
**Props**: `{ email: string }`

---

## 🧭 **Navigation Components**

### **ConditionalNavBar.tsx**
**Location**: `/src/components/ConditionalNavBar.tsx`  
**Purpose**: Smart navigation that shows/hides based on route  

**Logic**:
- Hides on home page (`/`)
- Shows on all other authenticated pages
- Uses `usePathname()` for route detection

**Usage**:
```tsx
// Already integrated in layout.tsx
<ConditionalNavBar />
```

### **NavBar.tsx** 
**Location**: `/src/components/NavBar.tsx`  
**Purpose**: Main navigation component  
**Links**: Dashboard, Insights, Settings

---

## 📊 **Utility Components**

### **AppInfo.tsx**
**Location**: `/src/components/AppInfo.tsx`  
**Purpose**: Display app information footer  

**Features**:
- Shows app name and version
- Company copyright
- Environment indicator (dev/staging)
- Uses app configuration

**Usage**:
```tsx
import AppInfo from '@/components/AppInfo';

export default function Footer() {
  return (
    <footer>
      <AppInfo />
    </footer>
  );
}
```

---

## 🎨 **Icon Library**

### **Available Icons**:
All icons are inline SVG components in `AuthForm.tsx`:

- **AppIcon**: Chart/analytics icon for branding
- **LoginIcon**: Arrow with door
- **RegisterIcon**: User with plus
- **ResetIcon**: Key/lock
- **UserIcon**: Person silhouette  
- **PhoneIcon**: Phone device
- **EmailIcon**: Email symbol
- **PasswordIcon**: Lock icon
- **EyeIcon**: Open eye (show password)
- **EyeOffIcon**: Closed eye (hide password)

**Specifications**:
- Size: `w-4 h-4` for tabs, `w-5 h-5` for inputs, `w-8 h-8` for app icon
- Stroke width: 2
- Style: Outline icons from Heroicons

---

## 🔧 **Hooks & Utilities**

### **useAppConfig()**
**Location**: `/src/lib/config.ts`  
**Purpose**: Access app configuration anywhere  

**Returns**: `AppConfig` object
```typescript
interface AppConfig {
  appName: string;
  companyName: string;
  email: string;
  version: string;
  productionState: 'development' | 'staging' | 'production';
  description: string;
  tagline: string;
}
```

**Usage**:
```tsx
import { useAppConfig } from '@/lib/config';

function MyComponent() {
  const appConfig = useAppConfig();
  return <h1>{appConfig.appName}</h1>;
}
```

---

## 🎨 **Design System**

### **Color Themes**:
- **Login**: Blue to Indigo (`from-blue-600 to-indigo-600`)
- **Register**: Emerald to Teal (`from-emerald-600 to-teal-600`)
- **Reset**: Orange to Red (`from-orange-600 to-red-600`)

### **Spacing System**:
- **Mobile**: `p-6`, `space-y-4`, `py-3`
- **Desktop**: `sm:p-8`, `sm:space-y-5`, `sm:py-4`

### **Typography**:
- **Headers**: `text-xl sm:text-2xl` for main titles
- **Subtext**: `text-sm text-gray-600`
- **Labels**: `text-sm font-medium text-gray-700`

### **Responsive Breakpoints**:
- **Mobile First**: Default styles for mobile
- **Small+**: `sm:` prefix for 640px and up
- **Responsive Text**: Hide/show different text on mobile vs desktop

---

## 📱 **Mobile Considerations**

### **Touch Targets**:
- Minimum 44px tap targets
- Adequate spacing between interactive elements
- Large input fields for better usability

### **Text Adaptations**:
- Shorter labels on mobile ("Sign In" → "Login")
- Compact tab layouts
- Responsive font sizes

### **Layout Adjustments**:
- Reduced padding on smaller screens
- Stack elements vertically when needed
- Ensure form fits in mobile viewports

---

## 🔒 **Security Features**

### **Password Input**:
- Toggle visibility with eye icon
- Secure by default (type="password")
- Visual feedback on toggle state

### **Form Validation**:
- Required field validation
- Email format validation
- Error state handling and display

---

## 🚀 **Performance Notes**

### **Optimizations**:
- Inline SVG icons (no external requests)
- Minimal re-renders with proper state management
- Efficient responsive classes

### **Bundle Size**:
- Self-contained components
- No external icon libraries
- Minimal dependencies

---

## 🔄 **Future Enhancements**

### **Planned Features**:
- [ ] Loading skeleton states
- [ ] Animation transitions between tabs
- [ ] Dark mode support
- [ ] Accessibility improvements (ARIA labels)
- [ ] Internationalization support
- [ ] Custom validation messages
- [ ] Social login buttons
- [ ] Remember me functionality

### **Component Extraction Opportunities**:
- [ ] Separate icon library file
- [ ] Reusable gradient button component  
- [ ] Generic form input component
- [ ] Tab system as reusable component

---

*Last Updated: July 25, 2025*
