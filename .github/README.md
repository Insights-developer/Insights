# Insights - Lottery Analytics Platform

## Overview

Insights is a powerful analytics platform developed by Lottery Analytics. The application provides customized data insights, visualization tools, and reporting capabilities for lottery data analysis.

## Tech Stack

- **Frontend**: Next.js with React and Tailwind CSS
- **Database**: Vercel Postgres (Neon)
- **Authentication**: Custom JWT-based authentication
- **Email Service**: Resend

## Key Features

- **Custom Authentication System**
  - Email verification via verification code
  - Password recovery workflow
  - JWT-based session management

- **Role-Based Access Control**
  - Access Groups: Guest, Member, VIP Member, Developer, Admin
  - Permissions management through Admin interface
  - Page and feature visibility controlled by access groups

- **Data Analytics**
  - Insights generation
  - Results analysis
  - Game statistics

- **Responsive UI**
  - Mobile and desktop friendly design
  - Collapsible sidebar navigation
  - Card-based content layout

## Project Structure

```
/insights-app
  /app                 # Next.js App Router structure
    /api               # API routes
    /components        # Reusable UI components
    /(routes)          # Page routes
  /lib                 # Core libraries
    /db                # Database utilities
    /auth              # Authentication utilities
    /email             # Email sending utilities
  /styles              # Global styles
  /schema              # Database schema definitions
  /public              # Static assets
```

## Getting Started

### Prerequisites

- Node.js 16+
- Postgres database (Vercel Postgres/Neon recommended)
- Resend account for email services

### Environment Variables

Create a `.env.local` file with the following variables:

```
# Database
POSTGRES_URL=postgres://user:password@host:port/database
POSTGRES_URL_NON_POOLING=postgres://user:password@host:port/database

# Authentication
JWT_SECRET=your_secure_jwt_secret_key

# Email
RESEND_API_KEY=your_resend_api_key

# Admin Setup
ADMIN_EMAIL=developer@lotteryanalytics.app
INITIAL_ADMIN_PASSWORD=secure_initial_password_to_be_changed
```

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/insights.git
   cd insights
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   ```bash
   node setup-database.js
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Access the application:
   Open [http://localhost:3000](http://localhost:3000) in your browser

### Initial Login

After setting up the database:
1. Register as a new user
2. Verify your email using the verification code
3. For admin access, your account needs to be manually set to the Admin access group using the database tools or SQL

## Development

### Key Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run linting

### Adding New Features

1. Update database schema if necessary
2. Add new API endpoints in `/app/api/`
3. Create UI components in `/app/components/`
4. Add pages in the appropriate route directory

## Deployment

This application is designed to be deployed on Vercel:

1. Connect your GitHub repository to Vercel
2. Configure environment variables in the Vercel dashboard
3. Deploy from main branch

## Contact

For questions or support, contact:
- Developer: developer@lotteryanalytics.app
- Company: Lottery Analytics

---

© 2025 Lottery Analytics. All Rights Reserved.
