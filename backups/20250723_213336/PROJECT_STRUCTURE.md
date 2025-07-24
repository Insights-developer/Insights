# Insights App Project Structure

**Company**: Lottery Analytics  
**Application**: Insights  
**Status**: In Development  
> **Last Updated**: 2025-07-23 21:33

## Overview
This document outlines the key directories and files in the Insights lottery analytics application, focusing on the important project structure while excluding generated files, dependencies, and build artifacts.

---

## 📁 Root Directory

```
Insights/
├── 📚 Current Documentation
│   ├── PROJECT_OVERVIEW.md           # Main project summary and quick reference
│   ├── DEVELOPMENT_HISTORY.md        # Evolution timeline and lessons learned
│   ├── API_REFERENCE.md              # Complete API endpoint documentation
│   ├── BUSINESS_LOGIC.md             # Core business entities and workflows
│   ├── COMPONENT_PATTERNS.md         # React/Next.js patterns and build error prevention
│   ├── DATABASE_SCHEMA_GENERATED.md  # Auto-generated database documentation
│   ├── DEV_SETUP.md                  # Development environment setup guide
│   ├── KNOWN_ISSUES.md               # Critical issues and solutions
│   ├── RBAC_GUIDE.md                 # Access Group permission system guide
│   ├── TESTING_GUIDE.md              # Testing procedures and strategies
│   └── TYPES_REFERENCE.md            # TypeScript interface documentation
│
├── 📄 Archive Directory
│   └── archive/
│       └── legacy-docs/              # Archived legacy documentation
│           ├── Insights Design Brief.txt     # Historical implementation notes
│           ├── Insights Project Brief.txt    # Original project overview
│           └── file-structure.txt            # Generated file structure (verbose)
│
├── 🗄️ Database Files
│   ├── database-schema.sql           # Executable SQL schema
│   ├── database-schema.txt           # Human-readable schema export
│   ├── DATABASE_SCHEMA_GENERATED.md  # Auto-generated comprehensive schema docs
│   └── add_login_history.sql         # Schema migration file
│
├── 🔧 Utility Scripts
│   ├── export_schema.py              # Database schema export script
│   ├── generate_file_structure.py    # Project structure generator
│   └── connection_test.py            # Database connection tester
│
├── 🏗️ Application Directories
│   ├── frontend/                     # Next.js application (primary)
│   └── backend/                      # Backend services (separate)
│
└── package.json                      # Root dependencies (minimal)
```

---

## 🖥️ Frontend Application (`/frontend/`)

```
frontend/
├── 📦 Configuration Files
│   ├── package.json                  # Dependencies and scripts
│   ├── next.config.ts                # Next.js configuration
│   ├── tailwind.config.js            # Tailwind CSS configuration
│   ├── postcss.config.js             # PostCSS configuration
│   ├── tsconfig.json                 # TypeScript configuration
│   └── README.md                     # Frontend documentation
│
├── 🏠 App Directory (Next.js App Router)
│   ├── layout.tsx                    # Root layout component
│   ├── page.tsx                      # Home page
│   ├── loading.tsx                   # Global loading component
│   ├── globals.css                   # Global styles
│   └── favicon.ico                   # App icon
│
├── 👑 Admin Pages
│   ├── admin/
│   │   ├── page.tsx                  # Admin dashboard
│   │   ├── loading.tsx               # Admin loading state
│   │   ├── users/page.tsx            # User management
│   │   ├── groups/page.tsx           # Group management
│   │   └── features/page.tsx         # Feature management
│   └── manage-users/                 # User management (workaround location)
│       ├── page.tsx                  # Main user management page
│       ├── page.tsx.backup           # Backup file
│       └── UserManagementClient.tsx  # Client component
│
├── 🌐 API Routes
│   ├── api/
│   │   ├── admin/                    # Admin endpoints
│   │   │   ├── users/
│   │   │   │   ├── route.ts          # List/create users
│   │   │   │   └── [id]/route.ts     # Update/delete user
│   │   │   ├── groups/route.ts       # Group management
│   │   │   ├── features/route.ts     # Feature management
│   │   │   ├── group-features/route.ts   # Group-feature assignments
│   │   │   ├── group-members/route.ts    # Group membership
│   │   │   └── insight-templates/route.ts # Insight templates
│   │   │
│   │   ├── user/                     # User endpoints
│   │   │   ├── profile/route.ts      # User profile
│   │   │   ├── features/route.ts     # User permissions
│   │   │   ├── nav/route.ts          # Navigation items
│   │   │   ├── cards/route.ts        # Dashboard cards
│   │   │   ├── update-login/route.ts # Login tracking
│   │   │   └── promote-if-verified/route.ts # Account promotion
│   │   │
│   │   ├── auth/                     # Authentication callbacks
│   │   ├── contact/route.ts          # Contact form
│   │   ├── dashboard/route.ts        # Dashboard data
│   │   ├── games/route.ts            # Games management
│   │   ├── draws/route.ts            # Draw data
│   │   ├── results/route.ts          # Results analysis
│   │   ├── insights/route.ts         # Insights generation
│   │   ├── notifications/route.ts    # Notifications
│   │   ├── uploads/route.ts          # File uploads
│   │   ├── access-groups/route.ts    # Access groups
│   │   └── ping/route.ts             # Health check
│
├── 📄 User Pages
│   ├── dashboard/page.tsx            # User dashboard
│   ├── login/page.tsx                # Login page
│   ├── profile/page.tsx              # User profile
│   ├── contact/page.tsx              # Contact form
│   ├── games/page.tsx                # Games view
│   ├── draws/page.tsx                # Draws view
│   ├── results/page.tsx              # Results analysis
│   └── insights/page.tsx             # Insights view
│
├── 🔐 Authentication
│   └── auth/
│       ├── callback/page.tsx         # Auth callback handler
│       └── resend-confirmation/page.tsx # Email confirmation
│
├── 🧩 Components
│   ├── components/                   # Shared components
│   │   ├── AuthForm.tsx              # Authentication form
│   │   ├── AuthProvider.tsx          # Auth context provider
│   │   ├── Navbar.tsx                # Navigation bar
│   │   ├── Forbidden.tsx             # Access denied component
│   │   ├── ConfirmModal.tsx          # Confirmation dialog
│   │   ├── EditUserModal.tsx         # User edit modal
│   │   ├── AdminUserTable.tsx        # User management table
│   │   └── AdminGroupTable.tsx       # Group management table
│   │
│   └── components/ui/                # UI components
│       ├── Avatar.tsx                # User avatar
│       ├── Button.tsx                # Button component
│       ├── Card.tsx                  # Card layout
│       ├── Icon.tsx                  # Icon system
│       ├── Input.tsx                 # Form inputs
│       ├── Notification.tsx          # Notifications
│       ├── Sidebar.tsx               # Navigation sidebar
│       ├── Spinner.tsx               # Loading spinner
│       ├── ThemeProvider.tsx         # Theme context
│       └── UserInfoBox.tsx           # User information display
│
├── 🛠️ Utilities
│   ├── utils/
│   │   ├── hooks/                    # Custom React hooks
│   │   │   ├── useRequireFeature.tsx # RBAC permission hook
│   │   │   └── usePageLoading.ts     # Page loading hook
│   │   │
│   │   ├── supabase/                 # Supabase clients
│   │   │   ├── browser.ts            # Client-side Supabase
│   │   │   ├── client.ts             # Universal client
│   │   │   └── server.ts             # Server-side Supabase
│   │   │
│   │   ├── rbac.ts                   # RBAC utility functions
│   │   ├── types.ts                  # TypeScript type definitions
│   │   ├── cache.ts                  # Caching utilities
│   │   └── prefetch.ts               # Data prefetching
│
├── 🎨 Styling
│   ├── styles/
│   │   ├── globals.css               # Global CSS styles
│   │   └── theme.ts                  # Theme configuration
│
├── 🏗️ Schema & Admin Components
│   ├── schema/
│   │   └── database-schema.sql       # Database schema definition
│   │
│   └── components/admin/             # Admin-specific components
│       ├── FeaturesManager.tsx       # Feature management
│       ├── GroupsManager.tsx         # Group management
│       ├── GroupFeatureManager.tsx   # Group-feature assignments
│       └── GroupMemberManager.tsx    # Group membership management
│
└── 🌍 Public Assets
    └── public/
        ├── next.svg                  # Next.js logo
        ├── vercel.svg                # Vercel logo
        ├── file.svg                  # File icon
        ├── globe.svg                 # Globe icon
        ├── window.svg                # Window icon
        └── user-listing.html         # Static user listing
```

---

## 🔧 Backend Directory (`/backend/`)

```
backend/
└── [Separate backend services - details not in primary scope]
```

---

## 📊 Key Architectural Patterns

### **Next.js App Router Structure**
- **Pages**: Located in `/app/[route]/page.tsx`
- **API Routes**: Located in `/app/api/[endpoint]/route.ts`
- **Layouts**: Root layout in `/app/layout.tsx`
- **Loading States**: `/app/[route]/loading.tsx`

### **RBAC Implementation**
- **Hooks**: `useRequireFeature()` for page protection
- **Utilities**: `getUserFeatures()` for permission checking
- **API Protection**: Feature-based authorization on all routes

### **Component Organization**
- **Shared Components**: `/app/components/`
- **UI Components**: `/app/components/ui/`
- **Admin Components**: `/app/components/admin/`
- **Page Components**: Colocated with routes

### **Data Layer**
- **Database Schema**: Exported and versioned
- **Supabase Integration**: Multiple client configurations
- **Type Safety**: Centralized TypeScript definitions

---

## 🚫 Excluded from Documentation

This structure excludes:
- `node_modules/` directories (dependencies)
- `.next/` build artifacts
- `.git/` version control files
- `package-lock.json` dependency locks
- `.tsbuildinfo` TypeScript build cache
- Temporary and cache files
- Generated documentation (verbose versions)

---

## 📝 Usage Notes

### **For Development**
- Start with **[PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)** for comprehensive project understanding
- Reference **[DEV_SETUP.md](DEV_SETUP.md)** for environment configuration
- Use utility scripts for schema/structure updates

### **For New Team Members**
- Begin with **[PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)** for project context
- Follow **[DEV_SETUP.md](DEV_SETUP.md)** for environment setup
- Study **[RBAC_GUIDE.md](RBAC_GUIDE.md)** for permission system understanding
- Review **[COMPONENT_PATTERNS.md](COMPONENT_PATTERNS.md)** for coding standards

### **For Troubleshooting**
- Check **[KNOWN_ISSUES.md](KNOWN_ISSUES.md)** for common problems and solutions
- Reference **[DEVELOPMENT_HISTORY.md](DEVELOPMENT_HISTORY.md)** for context on architectural decisions
- Use **[TESTING_GUIDE.md](TESTING_GUIDE.md)** for verification procedures

### **For Maintenance**
- Run `export_schema.py` after database changes
- Update **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** after major reorganizations
- Keep documentation files synchronized with code changes
- Archive legacy documentation when creating new versions
