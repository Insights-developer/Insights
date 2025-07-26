# Insights App Documentation Library
## Complete Documentation System


Track daily development progress and changes.

- **[Session Log - July 26, 2025](./session-log-2025-07-26.md)**
  - Centralized theme and card design applied to all main pages
  - AuthForm and UserInfoBox modernized and fixed
  - JWT cookie/session management implemented
  - All build errors/warnings resolved
  - Documentation updated

- **[Session Log - July 25, 2025](./session-log-2025-07-25.md)**
  - Vercel deployment fixes
  - AuthForm complete redesign  
  - Navigation system updates
  - Configuration management system
  - All changes and improvements made today

### **1. Session Logs**
Track daily development progress and changes.

- **[Session Log - July 25, 2025](./session-log-2025-07-25.md)**
  - Vercel deployment fixes
  - AuthForm complete redesign  
  - Navigation system updates
  - Configuration management system
  - All changes and improvements made today

### **2. Component Library**
Complete reference for all React components.

- **[Component Library Documentation](./component-library.md)**
  - AuthForm and authentication components
  - Navigation components (NavBar, ConditionalNavBar)
  - Utility components (AppInfo)
  - Icon library and design system
  - Usage examples and API reference

### **3. Technical Architecture**
System design and technical specifications.

- **[Technical Architecture Documentation](./technical-architecture.md)**
  - Technology stack overview
  - Database architecture
  - Authentication system design
  - Frontend/backend architecture
  - Deployment and security considerations

---

## 🎯 **Quick Start for AI Assistants**

### **Before Making Changes:**
1. **Read Session Log**: Understand recent changes and current state
2. **Review Component Library**: Check existing components before creating new ones
3. **Check Technical Architecture**: Understand system constraints and patterns

### **Current Project Status:**
- ✅ **Authentication UI**: Complete and professional
- ✅ **Vercel Deployment**: Working and live
- ✅ **Configuration System**: Implemented and functional
- ✅ **Mobile Responsive**: Fully optimized
- 🔄 **Authentication Logic**: Needs implementation
- 🔄 **Database Integration**: Needs completion
- 🔄 **Dashboard Pages**: Needs development

---

## 🗂️ **File Reference Guide**

### **Configuration Files**
- `/config/app.json` - App settings (name, company, version, etc.)
- `/src/lib/config.ts` - TypeScript configuration interface
- `package.json` - Dependencies and scripts

### **Core Components**
- `/src/components/AuthForm.tsx` - Main authentication interface
- `/src/components/ConditionalNavBar.tsx` - Smart navigation system
- `/src/app/layout.tsx` - Root application layout

### **API Routes**
- `/src/app/api/auth/login/route.ts` - Login endpoint
- `/src/app/api/auth/register/route.ts` - Registration endpoint
- `/src/app/api/auth/verify/route.ts` - Email verification endpoint

---

## 🎨 **Design System Quick Reference**

### **Color Themes**
- **Login**: Blue to Indigo gradients
- **Register**: Emerald to Teal gradients  
- **Reset**: Orange to Red gradients

### **Component Patterns**
- **Mobile-first responsive design**
- **Gradient tabs with icons**
- **Professional card layouts**
- **Consistent spacing and typography**

---

## 🔧 **Development Patterns**

### **Configuration Usage**
```tsx
import { useAppConfig } from '@/lib/config';

function Component() {
  const config = useAppConfig();
  return <h1>{config.appName}</h1>;
}
```

### **Responsive Design**
```tsx
// Mobile-first with desktop breakpoints
className="text-sm sm:text-base p-4 sm:p-6"
```

### **Icon Integration**
```tsx
// Inline SVG components with consistent sizing
<IconComponent className="w-5 h-5" />
```

---

## 📝 **Change Log Format**

When documenting changes, use this format:

```markdown
## Date: YYYY-MM-DD

### Changes Made:
- **File**: Description of change
- **New Feature**: What was added
- **Bug Fix**: What was resolved

### Files Modified:
- `/path/to/file.tsx` - Brief description
- `/path/to/another.ts` - Brief description

### Next Steps:
- [ ] TODO item 1
- [ ] TODO item 2
```

---

## 🚨 **Important Notes for Future Development**

### **DO NOT MODIFY:**
- `/app/package.json` dependencies without understanding Vercel setup
- Root directory structure (app lives in `/app` subdirectory)
- Authentication component structure without checking integration

### **ALWAYS CHECK:**
- Current app configuration in `/config/app.json`
- Existing component library before creating new components
- Mobile responsiveness when making UI changes
- TypeScript types when modifying interfaces

### **FOLLOW PATTERNS:**
- Use `useAppConfig()` for app information
- Implement mobile-first responsive design
- Add proper TypeScript types for all new code
- Use the established gradient color system

---

## 🔍 **Common Questions & Answers**

### **Q: Why is the app in `/app` subdirectory?**
A: The project has both frontend (Next.js in `/app`) and backend utilities in the root. Vercel is configured to use `/app` as the root directory.

### **Q: How do I change app branding?**
A: Update `/config/app.json` - changes will automatically reflect throughout the app.

### **Q: Where are the API routes?**
A: Located in `/src/app/api/` using Next.js App Router convention.

### **Q: How is authentication handled?**
A: JWT-based system with bcrypt password hashing. Frontend is complete, backend logic needs implementation.

### **Q: What's the database structure?**
A: PostgreSQL schema defined in `/database-schema.sql` in project root.

---

## 📞 **Support & Contact**

- **Company**: Lottery Analytics
- **Email**: developer@lotteryanalytics.app
- **Version**: 1.0.0
- **Environment**: Development

---

*This documentation library is maintained automatically during development sessions.*  
*Last Updated: July 25, 2025*
