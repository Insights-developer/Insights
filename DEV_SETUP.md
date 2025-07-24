# Insights App Development Setup Guide

**Company**: Lottery Analytics  
**Application**: Insights  
**Status**: In Development  
**Developer Contact**: developer@lotteryanalytics.app  

## Project Structure
```
/workspaces/Insights/           # Monorepo root
├── frontend/                   # Next.js application
├── backend/                    # Backend services (separate)
├── *.SQL                      # Database schema files (all caps)
└── *.md                       # Documentation files (markdown)
```

## Tech Stack

### Frontend
- **Framework**: Next.js 15.4.2 with App Router
- **React**: 19.1.0
- **Styling**: Tailwind CSS v4
- **Authentication**: Supabase Auth with @supabase/ssr
- **Database**: PostgreSQL via Supabase
- **Deployment**: Vercel
- **Language**: TypeScript

### Dependencies
```json
{
  "dependencies": {
    "@supabase/auth-helpers-nextjs": "^0.10.0",
    "@supabase/ssr": "^0.6.1",
    "@supabase/supabase-js": "^2.52.0",
    "@vercel/blob": "^1.1.1",
    "@vercel/postgres": "^0.10.0",
    "clsx": "^2.1.1",
    "next": "^15.4.2",
    "pg": "^8.16.3",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "zod": "^4.0.5"
  }
}
```

## Development Commands

### Frontend Development
```bash
cd frontend
npm run dev              # Start development server with Turbopack
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run linting
```

### Database Operations
```bash
# Export current schema (generates DATABASE_SCHEMA.SQL and DATABASE_SCHEMA_GENERATED.md)
python3 export_schema.py

# Test database connection
python3 connection_test.py

# Generate file structure
python3 generate_file_structure.py
```

## Environment Variables
Required environment variables (create `.env.local` in frontend/):
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Vercel (for uploads)
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token

# Database (if using direct connection)
POSTGRES_URL=your_postgres_connection_string
```

## Local Development Setup

### 1. Clone and Install
```bash
git clone [repository]
cd Insights/frontend
npm install
```

### 2. Environment Setup
- Copy environment variables
- Ensure Supabase project is configured
- Verify database schema is up to date

### 3. Database Schema
The app uses the schema in `/frontend/schema/database-schema.sql` or the auto-generated schema in `DATABASE_SCHEMA.SQL` and `DATABASE_SCHEMA_GENERATED.md`.

**Important**: The Insights app uses **Access Groups** (not roles) to determine user permissions. Access Groups define which features users can access.

### 4. Start Development
```bash
npm run dev
```
App will be available at `http://localhost:3000`

## Build Process

### Critical: Admin Page Build Issues
**Resolved July 22, 2025** - Admin pages had build errors due to:
- Complex React imports
- Static generation conflicts
- Custom UI component issues

**Solution**: Use the established pattern in `COMPONENT_PATTERNS.md`

### Build Verification
Always run after admin page changes:
```bash
npm run build
```

## Key Development Paths

### File Locations
```
/frontend/app/                          # Next.js app directory
├── components/                         # Shared components
│   └── ui/                            # UI components
├── api/                               # API routes
│   ├── admin/                         # Admin endpoints
│   └── user/                          # User endpoints
├── utils/                             # Utilities
│   ├── hooks/                         # Custom hooks
│   ├── supabase/                      # Supabase clients
│   ├── rbac.ts                        # RBAC utilities
│   └── types.ts                       # TypeScript types
└── [pages]/                           # Page components
```

### Import Paths
No absolute path aliases configured. Use relative imports:
```typescript
// From page to hook
import { useRequireFeature } from '../../utils/hooks/useRequireFeature';

// From component to type
import { UserProfile } from '../utils/types';
```

## Database Development

### Schema Management
- Primary schema: `/frontend/schema/database-schema.sql`
- Auto-generated schema: `DATABASE_SCHEMA.SQL` and `DATABASE_SCHEMA_GENERATED.md`
- Use `export_schema.py` to update auto-generated schema files

### RBAC Development
- **Access Groups**: All permissions based on group membership + features
- **Never use legacy role field**: The `role` field in users table is deprecated
- **Access Control**: Use Access Groups to determine user access levels and features
- Use `getUserFeatures(userId)` for all permission checks
- Test with different user group assignments

### Data Seeding
Create test data through admin interface or direct SQL inserts for:
- Access groups (`access_groups`)
- Features (`features`)
- Group-feature assignments (`access_group_features`)
- User-group assignments (`user_access_groups`)

## Testing Strategy

### Manual Testing
1. **Build Testing**: Run `npm run build` after changes
2. **RBAC Testing**: Test with users in different groups
3. **Admin Testing**: Verify admin functions work properly
4. **Navigation Testing**: Check sidebar updates with permission changes

### Browser Testing
- Chrome/Edge (primary)
- Firefox (secondary)
- Mobile responsive testing

## Deployment

### Vercel Deployment
- Connected to Git repository
- Automatic deployments on push
- Environment variables configured in Vercel dashboard

### Database Migrations
- Schema changes applied directly to Supabase
- No formal migration system currently

## Troubleshooting

### Common Issues
1. **Build Errors**: Check admin page patterns
2. **Auth Issues**: Verify Supabase configuration
3. **RBAC Issues**: Check group memberships and feature assignments
4. **Import Errors**: Verify relative paths are correct

### Debug Tools
```bash
# Check Node version
node --version

# Check package versions
npm list

# Clear Next.js cache
rm -rf .next

# Restart with fresh install
rm -rf node_modules package-lock.json
npm install
```

## Performance Considerations
- Use `dynamic = 'force-dynamic'` for admin pages
- Minimize client-side JavaScript
- Optimize Tailwind CSS usage
- Use proper loading states for better UX
