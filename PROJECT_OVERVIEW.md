# Insights App - Project Overview

> **Company**: Lottery Analytics  
> **Application**: Insights  
> **Status**: Production Ready - Session Management System Fully Implemented  
> **Last Updated**: July 24, 2025  
> **Developer Contact**: developer@lotteryanalytics.app

---

## 🎯 Project Summary

**Insights** is a comprehensive lottery analytics application developed by Lottery Analytics that provides game management, draw tracking, result analysis, and user management with enterprise-grade access control system.

**✅ MAJOR UPDATE (July 24, 2025)**: Centralized Session Management System fully implemented - All 22 API endpoints updated with automatic session refresh, eliminating 403 errors and CRUD operation failures.

### Quick Links to Documentation
- � **[Session Management Plan](SESSION_MANAGEMENT_PLAN.md)** - New centralized auth system (IMPLEMENTED)
- 📋 **[API Migration Plan](API_MIGRATION_PLAN.md)** - Complete API modernization results
- �📊 **[Database Schema](DATABASE_SCHEMA_GENERATED.md)** - Complete database structure and relationships
- �️ **[RBAC Guide](RBAC_GUIDE.md)** - Access Group-based permission system
- 🛠️ **[Development Setup](DEV_SETUP.md)** - Environment setup and development guide
- 🧩 **[Component Patterns](COMPONENT_PATTERNS.md)** - React/Next.js patterns and best practices
- 🌐 **[API Reference](API_REFERENCE.md)** - Complete API endpoint documentation (UPDATED)
- 🧪 **[Testing Guide](TESTING_GUIDE.md)** - Testing procedures and strategies
- 📁 **[Project Structure](PROJECT_STRUCTURE.md)** - File organization and architecture

---

## 🏗️ Technical Architecture

### **Core Technologies**
- **Frontend**: Next.js 15.4.2 with App Router
- **Backend**: Supabase (PostgreSQL + Auth)
- **Session Management**: Centralized AuthContext with auto-refresh
- **API Layer**: Standardized handlers with retry logic
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript
- **Deployment**: Vercel

### **Key Features**
- ✅ **Centralized Session Management**: Auto-refresh, permission caching, retry logic
- ✅ **Access Group System**: Group-based permissions with feature-level granularity (not role-based)
- ✅ **Admin Dashboard**: Complete user, group, and feature management
- ✅ **Standardized APIs**: All 22 endpoints use consistent authentication patterns
- ✅ **Lottery Analytics**: Game management, draw tracking, and insights
- ✅ **Modern UI**: Responsive design with sidebar navigation
- ✅ **Authentication**: Supabase Auth with login tracking and auto-retry
- ✅ **Type Safety**: Comprehensive TypeScript definitions

---

## 🚀 Current Status & Recent Achievements

### **✅ MAJOR IMPLEMENTATION (July 24, 2025) - Session Management System**

#### **Complete API Modernization**
- **22 API Endpoints Updated**: All endpoints now use centralized session management
- **403 Errors Eliminated**: Automatic session refresh prevents expiration issues  
- **CRUD Operations Reliable**: Consistent authentication patterns across all endpoints
- **Retry Logic Implemented**: Failed requests automatically retry with fresh sessions
- **Permission Caching**: 5-minute feature cache reduces database load

#### **New Architecture Components**
- **AuthContext** (`/context/AuthContext.tsx`): Centralized auth state management
- **API Handler** (`/utils/api-handler.ts`): Standardized server-side patterns
- **API Client** (`/utils/api-client.ts`): Authenticated client with auto-retry
- **Permission Hooks** (`/utils/hooks/useRequireFeatureNew.tsx`): Enhanced access control
- **Error Handling** (`/components/ui/ApiErrorHandler.tsx`): Unified error management

### **✅ Completed Features (July 2025)**

#### **Admin System (Fully Functional)**
- **User Management**: Complete CRUD operations with reliable session handling
  - View all users with detailed information
  - Edit user details and group memberships
  - Delete users with proper cascade handling
  - **Reference**: [User Management Implementation](KNOWN_ISSUES.md#2-admin-users-page-nextjs-bug-workaround)

- **RBAC Administration**: Dynamic permission management
  - Access group creation and management
  - Feature definition and assignment
  - Real-time permission updates
  - **Reference**: [RBAC System Guide](RBAC_GUIDE.md)

#### **Navigation & UX**
- **Modern Sidebar**: Collapsible navigation with RBAC integration
- **User Experience**: Loading states, error handling, responsive design
- **Authentication**: Supabase integration with login tracking
- **Reference**: [Component Patterns](COMPONENT_PATTERNS.md)

#### **Build System Stability**
- **Critical Issue Resolved**: Next.js admin page build errors
- **Established Patterns**: Proven component patterns for stability
- **Reference**: [Known Issues & Solutions](KNOWN_ISSUES.md#1-nextjs-admin-page-build-errors-resolved)

---

## 🎮 Business Logic

### **Core Entities**
For detailed business logic documentation, see **[Business Logic Guide](BUSINESS_LOGIC.md)**

- **Games**: Lottery game definitions and configurations
- **Draws**: Historical draw results and data
- **Insights**: Analytics templates and pattern recognition
- **Users**: Account management with RBAC permissions

### **User Journey**
1. **Authentication** → Supabase Auth with email verification
2. **Permission Resolution** → Group-based feature inheritance
3. **Dashboard Access** → Personalized based on permissions
4. **Feature Usage** → Protected by real-time RBAC checks

---

## 🔐 Security & Permissions

### **RBAC Implementation**
The app uses a sophisticated permission system detailed in **[RBAC Guide](RBAC_GUIDE.md)**:

```typescript
// Permission Check Pattern
const features = await getUserFeatures(userId);
if (features.includes('admin_dashboard')) {
  // Grant access
}
```

### **Key Security Features**
- **Feature-Based Access**: Granular permissions per app capability
- **Group Inheritance**: Users inherit all features from all their groups
- **API Protection**: Every endpoint protected by feature checks
- **Legacy Migration**: Moved from role-based to group-based permissions

---

## 📊 Database Architecture

The application uses a PostgreSQL database with comprehensive schema documentation at **[Database Schema](DATABASE_SCHEMA_GENERATED.md)** (auto-generated).

### **Key Table Groups**
- **👥 User Management**: `users`, `login_history`
- **🔐 RBAC Tables**: `access_groups`, `features`, `user_access_groups`, `access_group_features`
- **🎮 Business Logic**: `games`, `draws`, `insight_templates`
- **💬 Communication**: `contact_messages`, `notifications`

### **Schema Updates**
- **Current Schema**: Exported to `database-schema.sql` (executable)
- **Documentation**: Human-readable at `database-schema.txt`
- **Auto-Generated Docs**: Comprehensive markdown at `DATABASE_SCHEMA_GENERATED.md`
- **Migration Tools**: `insights_maintenance.py` for all maintenance tasks

---

## 🛠️ Development Workflow

### **Getting Started**
1. **Setup**: Follow **[Development Setup Guide](DEV_SETUP.md)**
2. **Patterns**: Review **[Component Patterns](COMPONENT_PATTERNS.md)**
3. **Testing**: Use **[Testing Guide](TESTING_GUIDE.md)**

### **Critical Development Notes**
- **Admin Pages**: Must follow established patterns to prevent build errors
- **RBAC Checks**: Always use `getUserFeatures()`, never legacy roles
- **TypeScript**: All types centralized in `/utils/types.ts`
- **Reference**: [Types Documentation](TYPES_REFERENCE.md)

### **Build Verification**
```bash
cd frontend
npm run build  # Always run after admin page changes
```

---

## 🚧 Known Issues & Solutions

Critical issues and their solutions are documented in **[Known Issues](KNOWN_ISSUES.md)**:

### **Resolved Issues**
- ✅ **Next.js Build Errors**: Admin page patterns established
- ✅ **RBAC Migration**: Legacy role system fully replaced
- ✅ **User Management**: Moved to `/manage-users` due to Next.js bug

### **Current Monitoring**
- ⚠️ **Navigation Refresh**: Manual refresh needed after permission changes
- ⚠️ **Import Paths**: Using relative paths (no absolute aliases configured)

---

## 📈 Future Development

### **Immediate Priorities**
1. **Create User Functionality**: Add user creation to admin interface
2. **Real-time Updates**: Implement live permission updates
3. **Testing Suite**: Automated testing for critical flows

### **Long-term Goals**
- **Mobile App**: React Native companion app
- **Advanced Analytics**: Machine learning insights
- **Multi-tenant**: Support for multiple organizations

---

## 📚 Documentation Index

| Document | Purpose | Use When |
|----------|---------|----------|
| **[API Reference](API_REFERENCE.md)** | Endpoint documentation | Building API integrations |
| **[Business Logic](BUSINESS_LOGIC.md)** | Domain concepts | Understanding app purpose |
| **[Component Patterns](COMPONENT_PATTERNS.md)** | React/Next.js patterns | Writing components |
| **[Database Schema](DATABASE_SCHEMA_GENERATED.md)** | Database structure (auto-generated) | Database work |
| **[Development Setup](DEV_SETUP.md)** | Environment setup | Starting development |
| **[Known Issues](KNOWN_ISSUES.md)** | Problems & solutions | Troubleshooting |
| **[Project Structure](PROJECT_STRUCTURE.md)** | File organization | Finding files |
| **[RBAC Guide](RBAC_GUIDE.md)** | Permission system | Working with permissions |
| **[Testing Guide](TESTING_GUIDE.md)** | Testing procedures | Verifying changes |
| **[Types Reference](TYPES_REFERENCE.md)** | TypeScript types | Type-safe development |

---

## 🎯 Quick Start Commands

```bash
```bash
# Database backup and schema documentation
python3 insights_maintenance.py --backup

# Generate file structure overview  
python3 insights_maintenance.py --structure

# Test database connectivity
python3 insights_maintenance.py --test

# Run all maintenance operations
python3 insights_maintenance.py --all

# Interactive menu (run without arguments)
python3 insights_maintenance.py
```
```

---

## 📞 Project Information

- **Company**: Lottery Analytics
- **Developer**: developer@lotteryanalytics.app
- **Repository**: Insights
- **Current Branch**: main
- **Deployment**: Vercel (automatic from main branch)

---

*This overview provides a comprehensive yet concise view of the Insights application. For detailed information on any topic, follow the linked documentation files.*
