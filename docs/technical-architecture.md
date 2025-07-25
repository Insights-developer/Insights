# Technical Architecture Documentation
## Insights - Lottery Analytics Platform

---

## 🏗️ **System Architecture Overview**

### **Technology Stack**
- **Frontend**: Next.js 15.4.4 (React 19.1.0)
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS 4
- **Database**: PostgreSQL
- **Authentication**: JWT with bcryptjs
- **Email**: Resend service
- **Deployment**: Vercel
- **Development**: VS Code with Copilot

### **Project Structure**
```
/workspaces/Insights/
├── app/                    # Next.js application
│   ├── config/            # Configuration files
│   ├── public/            # Static assets
│   ├── src/               # Source code
│   │   ├── app/           # App router pages
│   │   ├── components/    # React components
│   │   ├── lib/           # Utility libraries
│   │   └── hooks/         # Custom React hooks
│   └── package.json       # Dependencies
├── docs/                  # Documentation
├── database-schema.sql    # Database structure
├── python_parser.py       # Data processing
└── PROJECT_PLAN.md        # Project roadmap
```

---

## 🗄️ **Database Architecture**

### **Current Schema** (from database-schema.sql)
The app uses PostgreSQL with the following key tables:

**Note**: Detailed schema should be documented from the actual database-schema.sql file in the root directory.

### **Connection Setup**
- **Library**: `pg` (node-postgres)
- **Configuration**: Environment variables for connection
- **Location**: `/src/lib/db.ts`

---

## 🔐 **Authentication System**

### **JWT Implementation**
- **Library**: `jsonwebtoken`
- **Password Hashing**: `bcryptjs`
- **Token Generation**: `crypto-random-string`

### **API Endpoints**
```
POST /api/auth/login      # User login
POST /api/auth/register   # User registration  
POST /api/auth/verify     # Email verification
```

### **Authentication Flow**
1. User submits credentials via AuthForm
2. API validates against database
3. JWT token generated and returned
4. Token stored client-side (TODO: implement storage)
5. Token validated on protected routes

### **Security Features**
- Password hashing with bcrypt
- JWT token expiration
- Email verification required
- Input validation and sanitization

---

## 📧 **Email System**

### **Service**: Resend
- **Library**: `resend`
- **Use Cases**: 
  - Email verification
  - Password reset
  - Account notifications

### **Configuration**
- API key stored in environment variables
- Email templates (TODO: implement)
- Sender verification required

---

## 🎨 **Frontend Architecture**

### **Component Architecture**
```
Components/
├── Layout Components
│   ├── ConditionalNavBar  # Smart navigation
│   └── NavBar            # Main navigation
├── Authentication
│   ├── AuthForm          # Main auth interface
│   └── VerifyEmailForm   # Email verification
└── Utility
    └── AppInfo           # App information display
```

### **State Management**
- **Local State**: React useState hooks
- **Configuration**: Custom useAppConfig hook
- **Global State**: TODO (consider Zustand or Context)

### **Styling System**
- **Framework**: Tailwind CSS
- **Approach**: Mobile-first responsive design
- **Themes**: Gradient-based color system
- **Components**: Utility-first with custom components

---

## 🚀 **Deployment Architecture**

### **Vercel Configuration**
- **Root Directory**: `/app` (not project root)
- **Build Command**: `npm run build`
- **Framework**: Next.js (auto-detected)
- **Environment**: Production deployment ready

### **Environment Variables Required**
```bash
# Database
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=...

# Email Service  
RESEND_API_KEY=...

# App Environment
NODE_ENV=production
```

---

## 📦 **Dependency Management**

### **Core Dependencies**
```json
{
  "dependencies": {
    "next": "15.4.4",
    "react": "19.1.0", 
    "react-dom": "19.1.0",
    "bcryptjs": "^3.0.2",
    "jsonwebtoken": "^9.0.2",
    "pg": "^8.16.3",
    "resend": "^4.7.0",
    "crypto-random-string": "^5.0.0"
  }
}
```

### **Development Dependencies**
```json
{
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@types/bcryptjs": "^3.0.0",
    "@types/jsonwebtoken": "^9.0.10",
    "@types/pg": "^8.15.4",
    "tailwindcss": "^4",
    "eslint": "^9",
    "eslint-config-next": "15.4.4"
  }
}
```

---

## 🔧 **Configuration Management**

### **App Configuration System**
```typescript
// /src/lib/config.ts
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

### **Configuration Sources**
1. **Static Config**: `/config/app.json`
2. **Environment Variables**: `.env.local`
3. **Runtime Config**: Vercel environment variables

---

## 🚦 **Routing Architecture**

### **App Router Structure** (Next.js 13+ App Directory)
```
/src/app/
├── layout.tsx           # Root layout
├── page.tsx            # Home page (AuthForm)
├── not-found.tsx       # 404 page
├── admin/              # Admin routes
│   ├── page.tsx        # Admin dashboard
│   ├── users/          # User management
│   └── access-groups/  # Permission management
├── dashboard/          # Main dashboard
├── insights/           # Analytics pages
├── settings/           # User settings
└── api/               # API routes
    └── auth/          # Authentication endpoints
```

### **Route Protection**
- **Public Routes**: `/` (login page)
- **Protected Routes**: All others require authentication
- **Admin Routes**: `/admin/*` require admin privileges
- **Implementation**: Middleware or layout-based protection (TODO)

---

## 🔍 **Data Flow Architecture**

### **Client-Side Data Flow**
1. **User Interaction** → AuthForm component
2. **Form Submission** → API route
3. **API Processing** → Database query
4. **Response** → UI state update
5. **Success/Error** → User feedback

### **Server-Side Data Flow**
1. **API Request** → Route handler
2. **Validation** → Input sanitization
3. **Database** → Query execution
4. **Processing** → Business logic
5. **Response** → JSON return

---

## 🧪 **Testing Strategy** (Planned)

### **Testing Levels**
- **Unit Tests**: Component and utility testing
- **Integration Tests**: API route testing
- **E2E Tests**: Full user flow testing

### **Testing Tools** (To be implemented)
- **Jest**: Unit testing framework
- **React Testing Library**: Component testing
- **Playwright**: E2E testing
- **MSW**: API mocking

---

## 📊 **Performance Considerations**

### **Optimization Strategies**
- **Bundle Splitting**: Next.js automatic code splitting
- **Image Optimization**: Next.js Image component
- **Static Generation**: Pre-rendered pages where possible
- **Database Indexing**: Optimized queries
- **Caching**: API response caching

### **Monitoring** (Planned)
- **Web Vitals**: Core performance metrics
- **Error Tracking**: Sentry integration
- **Analytics**: User behavior tracking
- **Database Performance**: Query optimization

---

## 🔒 **Security Architecture**

### **Security Measures**
- **HTTPS**: SSL/TLS encryption
- **JWT Security**: Secure token handling
- **Password Security**: bcrypt hashing
- **Input Validation**: Sanitization and validation
- **CORS**: Cross-origin request protection
- **Rate Limiting**: API abuse prevention (TODO)

### **Data Protection**
- **PII Handling**: Minimal data collection
- **Encryption**: Sensitive data encryption
- **Access Control**: Role-based permissions
- **Audit Logging**: Security event tracking (TODO)

---

## 🔄 **Development Workflow**

### **Code Standards**
- **TypeScript**: Strict type checking
- **ESLint**: Code quality enforcement
- **Prettier**: Code formatting (TODO: configure)
- **Git Hooks**: Pre-commit validation (TODO)

### **Deployment Pipeline**
1. **Development**: Local development with hot reload
2. **Testing**: Automated test suite
3. **Building**: Next.js production build
4. **Deployment**: Vercel automatic deployment
5. **Monitoring**: Performance and error tracking

---

## 📋 **Current Technical Debt**

### **Immediate TODOs**
- [ ] Implement JWT storage and session management
- [ ] Add proper error boundaries
- [ ] Implement API rate limiting
- [ ] Add comprehensive input validation
- [ ] Set up proper logging system
- [ ] Configure environment-specific settings

### **Performance TODOs**
- [ ] Implement code splitting optimization
- [ ] Add image optimization
- [ ] Set up API response caching
- [ ] Optimize database queries
- [ ] Add bundle analysis

### **Security TODOs**
- [ ] Implement CSRF protection
- [ ] Add rate limiting middleware
- [ ] Set up security headers
- [ ] Implement proper session management
- [ ] Add audit logging

---

## 🚀 **Scalability Considerations**

### **Horizontal Scaling**
- **Stateless Design**: JWT-based authentication
- **Database Scaling**: Connection pooling, read replicas
- **CDN Integration**: Static asset delivery
- **Microservices**: Potential future architecture

### **Vertical Scaling**
- **Database Optimization**: Query performance
- **Server Resources**: Memory and CPU optimization
- **Caching Layers**: Redis integration (planned)
- **Background Jobs**: Queue system (planned)

---

*Last Updated: July 25, 2025*  
*For Technical Questions: Contact development team*
