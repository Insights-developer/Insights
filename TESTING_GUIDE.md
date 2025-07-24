# Insights App Testing Guide

**Company**: Lottery Analytics  
**Application**: Insights  
**Status**: In Development  

## Testing Philosophy
Focus on **manual testing** with systematic approaches to ensure reliability of core functionality, especially Access Group permissions and admin operations.

## Core Testing Areas

### 1. Authentication & Session Management

#### Test Cases
```
✓ User registration with email verification
✓ User login with valid credentials  
✓ User login with invalid credentials
✓ Session persistence across browser refresh
✓ Logout functionality clears session
✓ Login timestamp tracking
✓ Multiple browser session handling
```

#### Test Procedure
```bash
# Test in incognito/private browser windows
1. Register new user account
2. Verify email confirmation flow
3. Login and check dashboard access
4. Refresh browser, verify session persists
5. Logout and verify redirect to login
6. Check login_count increment in database
```

### 2. Access Group Permissions

#### Test Users Setup
Create test users with different Access Group memberships:
```sql
-- Test Admin User
INSERT INTO user_access_groups (user_id, group_id) 
VALUES ('admin-user-id', 1); -- Admins group

-- Test Regular User  
INSERT INTO user_access_groups (user_id, group_id)
VALUES ('regular-user-id', 2); -- Basic Users group

-- Test No-Groups User (should have minimal access)
-- Don't assign to any groups
```

#### Test Matrix
| User Type | Feature | Expected Result |
|-----------|---------|----------------|
| Admin | `/admin/*` | ✅ Access granted |
| Admin | All pages | ✅ Access granted |
| Regular | `/admin/*` | ❌ Forbidden/redirect |
| Regular | `/dashboard` | ✅ Access granted |
| No Groups | Any protected page | ❌ Forbidden/redirect |

#### Access Group Test Procedure
```bash
1. Login as Admin user
   - Verify admin dashboard accessible
   - Check all navigation items visible
   - Test user management CRUD operations
   - Test group management functions

2. Login as Regular user  
   - Verify limited navigation menu
   - Try accessing /admin URLs directly (should fail)
   - Verify permitted pages work correctly

3. Admin changes Regular user's groups
   - Add/remove groups for Regular user
   - Regular user refreshes/logs back in
   - Verify navigation and access updated
```

### 3. Admin Functionality

#### User Management Testing
```
✓ View all users list
✓ Edit user details (username, phone, etc.)
✓ Edit user group memberships  
✓ Delete user account
✓ Create new user (if implemented)
✓ User search/filtering (if implemented)
```

#### Group Management Testing
```
✓ View all access groups
✓ Create new access group
✓ Edit group details
✓ Assign/remove features from groups
✓ Delete access group
✓ Handle cascade deletes properly
```

#### Feature Management Testing
```
✓ View all features list
✓ Create new feature
✓ Edit feature properties (name, nav_name, url, etc.)
✓ Activate/deactivate features
✓ Delete features
✓ Verify navigation updates with feature changes
```

### 4. Navigation & UI Testing

#### Navigation Testing
```
✓ Sidebar shows correct items for user permissions
✓ Navigation links work correctly
✓ Icons display properly
✓ Sidebar collapse/expand functionality
✓ Mobile responsiveness
✓ User info box displays correct information
✓ Logout from user info box works
```

#### Loading States
```
✓ Page loading spinners display
✓ Permission checks show loading state
✓ API calls show loading indicators
✓ No flash of unauthorized content
```

#### Error Handling
```
✓ Unauthorized access shows Forbidden component
✓ Network errors display user-friendly messages
✓ Form validation errors display correctly
✓ 404 pages work for invalid routes
```

### 5. Build & Development Testing

#### Build Verification
**Critical**: Always run after admin page changes
```bash
# Run full build test
cd frontend
npm run build

# Check for common errors:
# - "Element type is invalid" 
# - TypeScript compilation errors
# - Missing dependencies
# - Environment variable errors
```

#### Development Environment
```
✓ `npm run dev` starts without errors
✓ Hot reload works correctly
✓ TypeScript errors appear in console
✓ API routes respond correctly in development
```

## Browser Testing Matrix

### Primary Browsers
- **Chrome** (latest) - Primary testing browser
- **Firefox** (latest) - Secondary testing
- **Safari** (if available) - Check for compatibility issues
- **Edge** (latest) - Windows compatibility

### Mobile Testing
- **Chrome Mobile** - Primary mobile browser
- **Safari Mobile** (if available) - iOS compatibility
- **Responsive design** at various screen sizes

### Test Scenarios per Browser
```
✓ Authentication flow
✓ Navigation functionality  
✓ Admin operations
✓ Form submissions
✓ File uploads (if applicable)
✓ Session persistence
```

## Performance Testing

### Page Load Testing
```
✓ Dashboard loads quickly after login
✓ Admin pages load within reasonable time
✓ Navigation changes are responsive
✓ No excessive API calls on page load
```

### Database Query Performance
```
✓ getUserFeatures() executes quickly
✓ Admin user lists load reasonably fast
✓ Permission checks don't cause delays
✓ No N+1 query problems
```

## API Testing

### Manual API Testing
Use browser dev tools or tools like Postman:

#### Authentication Endpoints
```bash
# Test user profile
GET /api/user/profile
# Expected: User data with groups

# Test user features  
GET /api/user/features
# Expected: Array of feature keys

# Test navigation
GET /api/user/nav
# Expected: Navigation items for user
```

#### Admin Endpoints
```bash
# Test with admin user session
GET /api/admin/users
PATCH /api/admin/users/[id]
DELETE /api/admin/users/[id]

GET /api/admin/groups
POST /api/admin/groups
```

#### Error Response Testing
```bash
# Test without authentication
GET /api/admin/users
# Expected: 401 Unauthorized

# Test with insufficient permissions
GET /api/admin/users (as regular user)
# Expected: 403 Forbidden
```

## Database Testing

### Data Integrity Testing
```sql
-- Test RBAC relationships
SELECT u.email, g.name, f.key 
FROM users u
JOIN user_access_groups ug ON u.id = ug.user_id
JOIN access_groups g ON ug.group_id = g.id
JOIN access_group_features gf ON g.id = gf.group_id
JOIN features f ON gf.feature = f.key
WHERE u.email = 'test@example.com';

-- Verify no orphaned records
SELECT * FROM user_access_groups ug
LEFT JOIN users u ON ug.user_id = u.id
WHERE u.id IS NULL;
```

### Constraint Testing
```sql
-- Test unique constraints
INSERT INTO features (key, name) VALUES ('duplicate_key', 'Test');
-- Should fail on second insert

-- Test foreign key constraints  
INSERT INTO user_access_groups (user_id, group_id) 
VALUES ('nonexistent-id', 999);
-- Should fail
```

## Regression Testing

### After Major Changes
Run full test suite focusing on:
```
✓ All admin functionality still works
✓ RBAC permissions unchanged
✓ Navigation renders correctly
✓ Build process succeeds
✓ No TypeScript errors
```

### Before Deployment
```
✓ Full build verification
✓ Admin user can perform all operations
✓ Regular user has correct limited access
✓ No console errors in browser
✓ All critical user flows work
```

## Test Data Management

### Creating Test Data
```sql
-- Create test access groups
INSERT INTO access_groups (name, description) VALUES 
('Test Admins', 'Test admin group'),
('Test Users', 'Test regular users');

-- Create test features
INSERT INTO features (key, name, description) VALUES
('test_feature', 'Test Feature', 'For testing purposes');

-- Assign features to groups
INSERT INTO access_group_features (group_id, feature) VALUES
(1, 'admin_dashboard'),
(1, 'test_feature'),
(2, 'test_feature');
```

### Cleanup Test Data
```sql
-- Remove test users from groups
DELETE FROM user_access_groups WHERE user_id IN ('test-user-1', 'test-user-2');

-- Remove test features and groups
DELETE FROM access_group_features WHERE feature = 'test_feature';
DELETE FROM features WHERE key = 'test_feature';
DELETE FROM access_groups WHERE name LIKE 'Test%';
```

## Automated Testing (Future)

### Potential Testing Tools
- **Playwright** - End-to-end testing
- **Jest** - Unit testing for utilities
- **React Testing Library** - Component testing

### Priority Areas for Automation
1. RBAC permission checking logic
2. getUserFeatures() function
3. Core authentication flows
4. Admin CRUD operations

## Issue Reporting

### Bug Report Template
```
**Environment**: Development/Production
**Browser**: Chrome/Firefox/Safari version
**User Type**: Admin/Regular/No Groups  
**Steps to Reproduce**:
1. Step one
2. Step two
3. Step three

**Expected Result**: 
**Actual Result**:
**Console Errors**: 
**Additional Notes**:
```

### Critical Issues
Report immediately:
- Authentication failures
- Permission bypasses  
- Build failures
- Data corruption
- Security vulnerabilities

### Performance Issues
Monitor and report:
- Slow page loads (>3 seconds)
- Excessive API calls
- Database query timeouts
- Memory leaks in browser
