# Insights App Documentation Index

**Company**: Lottery Analytics  
**Application**: Insights  
**Status**: In Development  
**Developer Contact**: developer@lotteryanalytics.app  

> **Quick Reference**: Navigate to the right documentation for your needs

---

## 🎯 Start Here

### **New to the Project?**
1. **[PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)** - Complete project summary and current status
2. **[DEV_SETUP.md](DEV_SETUP.md)** - Set up your development environment
3. **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - Understand the codebase organization

### **Need Quick Reference?**
- 🚀 **[PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)** - Project summary with links to everything
- 🌐 **[API_REFERENCE.md](API_REFERENCE.md)** - All API endpoints and usage
- 📊 **[DATABASE_SCHEMA_GENERATED.md](DATABASE_SCHEMA_GENERATED.md)** - Database structure and relationships (auto-generated)

---

## 📚 Complete Documentation Library

### **📋 Project Management**
| Document | When to Use | Key Content |
|----------|-------------|-------------|
| **[PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)** | Starting point, status check | Current features, quick links, project summary |
| **[DEVELOPMENT_HISTORY.md](DEVELOPMENT_HISTORY.md)** | Understanding decisions, debugging context | Timeline, critical resolutions, lessons learned |
| **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** | Finding files, understanding organization | Directory structure, file purposes |

### **🛠️ Development Guides**
| Document | When to Use | Key Content |
|----------|-------------|-------------|
| **[DEV_SETUP.md](DEV_SETUP.md)** | Environment setup, getting started | Installation, configuration, commands |
| **[COMPONENT_PATTERNS.md](COMPONENT_PATTERNS.md)** | Writing React/Next.js code | Patterns, build error prevention, examples |
| **[TESTING_GUIDE.md](TESTING_GUIDE.md)** | Verifying changes, QA | Testing procedures, verification steps |

### **🔧 Technical References**
| Document | When to Use | Key Content |
|----------|-------------|-------------|
| **[API_REFERENCE.md](API_REFERENCE.md)** | API integration, endpoint reference | All endpoints, request/response patterns |
| **[DATABASE_SCHEMA_GENERATED.md](DATABASE_SCHEMA_GENERATED.md)** | Database work, schema understanding | Table structure, relationships, queries (auto-generated) |
| **[TYPES_REFERENCE.md](TYPES_REFERENCE.md)** | TypeScript development | Interface definitions, type usage |

### **🎯 Domain-Specific**
| Document | When to Use | Key Content |
|----------|-------------|-------------|
| **[RBAC_GUIDE.md](RBAC_GUIDE.md)** | Permission system work | How Access Groups work, implementation patterns |
| **[BUSINESS_LOGIC.md](BUSINESS_LOGIC.md)** | Understanding app purpose | Business entities, user workflows |
| **[KNOWN_ISSUES.md](KNOWN_ISSUES.md)** | Troubleshooting, error resolution | Common problems, solutions, workarounds |

### **🔧 Maintenance & Automation**
| Document | When to Use | Key Content |
|----------|-------------|-------------|
| **[DOC_MAINTENANCE_CHECKLIST.md](DOC_MAINTENANCE_CHECKLIST.md)** | After coding sessions | Maintenance tasks, automation scripts |
| **[SCHEMA_DOCS_GUIDE.md](SCHEMA_DOCS_GUIDE.md)** | Database documentation | Auto-generated schema documentation guide |

---

## 🎯 By Task Type

### **I want to...**

#### **🏗️ Set up Development**
1. **[DEV_SETUP.md](DEV_SETUP.md)** - Complete setup guide
2. **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - Understand file organization
3. **[COMPONENT_PATTERNS.md](COMPONENT_PATTERNS.md)** - Learn coding patterns

#### **🔧 Build Features**
1. **[API_REFERENCE.md](API_REFERENCE.md)** - Available endpoints
2. **[RBAC_GUIDE.md](RBAC_GUIDE.md)** - Permission system
3. **[TYPES_REFERENCE.md](TYPES_REFERENCE.md)** - TypeScript types
4. **[COMPONENT_PATTERNS.md](COMPONENT_PATTERNS.md)** - React patterns

#### **🗄️ Work with Database**
1. **[DATABASE_SCHEMA_GENERATED.md](DATABASE_SCHEMA_GENERATED.md)** - Complete schema documentation (auto-generated)
2. **[RBAC_GUIDE.md](RBAC_GUIDE.md)** - Permission table relationships
3. **[BUSINESS_LOGIC.md](BUSINESS_LOGIC.md)** - Business entities

#### **🐛 Debug Issues**
1. **[KNOWN_ISSUES.md](KNOWN_ISSUES.md)** - Common problems and solutions
2. **[DEVELOPMENT_HISTORY.md](DEVELOPMENT_HISTORY.md)** - Context for architectural decisions
3. **[COMPONENT_PATTERNS.md](COMPONENT_PATTERNS.md)** - Correct patterns to follow

#### **🧪 Test Changes**
1. **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Testing procedures
2. **[RBAC_GUIDE.md](RBAC_GUIDE.md)** - Permission testing
3. **[API_REFERENCE.md](API_REFERENCE.md)** - API testing

#### **📚 Understand the Project**
1. **[PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)** - Complete project picture
2. **[BUSINESS_LOGIC.md](BUSINESS_LOGIC.md)** - What the app does
3. **[DEVELOPMENT_HISTORY.md](DEVELOPMENT_HISTORY.md)** - How we got here

---

## 🚨 Emergency Reference

### **Build Failing?**
1. **[KNOWN_ISSUES.md](KNOWN_ISSUES.md#1-nextjs-admin-page-build-errors-resolved)** - Build error solutions
2. **[COMPONENT_PATTERNS.md](COMPONENT_PATTERNS.md)** - Correct patterns
3. **[DEVELOPMENT_HISTORY.md](DEVELOPMENT_HISTORY.md)** - Historical context

### **Permission Issues?**
1. **[RBAC_GUIDE.md](RBAC_GUIDE.md)** - How permissions work
2. **[DATABASE_SCHEMA_GENERATED.md](DATABASE_SCHEMA_GENERATED.md)** - Access Group table structure
3. **[API_REFERENCE.md](API_REFERENCE.md)** - Permission endpoints

### **Can't Find Something?**
1. **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - File locations
2. **[PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)** - Links to everything
3. This document - Complete navigation guide

---

## 📝 Documentation Standards

### **Cross-References**
All documentation files include links to related documents. Look for:
- **"Reference:"** links for detailed information
- **"See also:"** for related topics
- **Quick Links** sections for navigation

### **Document Structure**
Each document follows a consistent structure:
- **Overview** - What this document covers
- **Quick Links** - Jump to related docs
- **Detailed Content** - Main information
- **Cross-References** - Links to related docs

### **Maintenance**
- **Regular Updates** - Keep docs synchronized with code
- **Version Notes** - Document changes and evolution
- **Link Validation** - Ensure all cross-references work

---

## 🎯 Quick Command Reference

```bash
# Development
cd frontend && npm run dev

# Build verification  
cd frontend && npm run build

# Documentation Maintenance (after coding sessions)
python3 maintain_docs.py --session-notes "description of changes"

# Quick schema update (after database changes)
python3 quick_schema_update.py

# Manual database operations
python3 export_schema.py
```

---

## 📞 Get Help

### **Documentation Issues**
- Missing information? Check **[PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)** for links
- Outdated content? Reference **[DEVELOPMENT_HISTORY.md](DEVELOPMENT_HISTORY.md)** for context
- Can't find what you need? Use this index to navigate

### **Development Issues**
- Build problems? **[KNOWN_ISSUES.md](KNOWN_ISSUES.md)**
- Permission problems? **[RBAC_GUIDE.md](RBAC_GUIDE.md)**
- Pattern questions? **[COMPONENT_PATTERNS.md](COMPONENT_PATTERNS.md)**

---

*This index provides multiple ways to navigate the Insights documentation. Start with your task or use the emergency reference for quick problem resolution.*
