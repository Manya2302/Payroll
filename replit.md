# Overview

Loco is a comprehensive payroll management system designed to streamline employee management, salary processing, attendance tracking, and project management. The application provides separate interfaces for administrators and employees, with features including AI-powered project planning, integrated payment processing, real-time notifications, and video conferencing capabilities.

# Recent Changes

**November 6, 2025**: Set up project in Replit environment and fixed critical bugs
- Downgraded Vite from 5.4.19 to 4.5.5 to resolve bus error/segmentation fault issue in Replit's Nix environment
- Downgraded @vitejs/plugin-react from 4.x to 3.1.0 for compatibility
- Downgraded esbuild from 0.25.0 to 0.18.20 for compatibility
- Configured deployment target as VM (required for Socket.IO and background jobs)
- Server configured to run on port 5000 with 0.0.0.0 binding for Replit proxy support
- Vite dev server configured with `allowedHosts: true` for iframe compatibility
- **Fixed profile image upload bug**: Modified profile save mutation to properly refetch profile data after save, ensuring employeeId is available before allowing image upload
- **Fixed salary sync bug**: Enabled admin to update employee salary through employee table, which now automatically syncs to profile table for consistency across the system

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Technology Stack**: React with Vite build tooling and shadcn/ui component library

- **UI Framework**: Built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state management with custom query client configuration
- **Form Handling**: React Hook Form with Zod validation resolvers
- **Routing**: Single-page application with client-side routing
- **Real-time Updates**: Socket.IO client for live notifications and updates
- **Charting**: Chart.js for data visualization with centralized registration pattern

**Design Decisions**:
- Chose shadcn/ui for consistent, accessible component library that can be customized
- Vite provides fast development experience with HMR and optimized production builds
- Path aliases (@, @shared, @assets) simplify imports and maintain clean code structure

## Backend Architecture

**Technology Stack**: Express.js server with MongoDB database

- **Server Framework**: Express with Socket.IO for real-time communication
- **Database**: MongoDB with Mongoose ODM for schema validation and relationship management
- **Authentication**: Passport.js with local and Google OAuth strategies
- **Session Management**: express-session with MongoDB session store (connect-mongo)
- **File Uploads**: Multer middleware for handling profile images and documents

**Key Architectural Patterns**:

1. **Hybrid Development/Production Setup**
   - Development: Vite middleware integrated into Express for HMR
   - Production: Static file serving from pre-built dist/public directory
   - Rationale: Single codebase serves both environments, simplifies deployment

2. **Authentication Flow**
   - Session-based authentication with Passport.js
   - Multiple strategies: username/password with bcrypt hashing, Google OAuth
   - OTP verification for registration and password reset
   - Role-based access control (admin/employee)

3. **Database Schema Design**
   - Mongoose schemas with Zod validation schemas in shared directory
   - Virtual `id` fields for compatibility with frontend expectations
   - Relationships: Users → Employees → Projects/Payroll/Attendance
   - Automatic user ID synchronization on startup to fix reference mismatches

4. **Real-time Features**
   - Socket.IO server for bidirectional communication
   - Meeting reminders and project notifications via scheduled jobs
   - User-specific event channels using Socket.IO rooms

## Data Storage Solutions

**Primary Database**: MongoDB

- **Schema Collections**:
  - Users: Authentication and role management
  - Employees: Profile information, salary details, contact info
  - Payroll: Salary records with breakdowns (basic, allowances, deductions)
  - Attendance: Daily check-in/out records with work hours tracking
  - Leave Requests: Employee leave applications with approval workflow
  - Projects: Multi-day task assignments with daily subtask tracking
  - Meetings: Video conference scheduling with Jitsi integration
  - Documents: Employee document storage with file references
  - Profiles: Extended employee profile data including emergency contacts
  - Loans: Employee loan requests and repayment tracking
  - Queries: Employee support ticket system

**File Storage**:
- Local filesystem storage for uploaded files
- Separate directories for profile images and documents
- Multer handles multipart form data with custom storage configuration

**Data Integrity**:
- Startup script automatically fixes user ID reference mismatches across collections
- Ensures consistent relationships between Users, Employees, and Projects
- **Salary Update Restriction**: Employee salary can only be updated through the Profile table (PUT /api/profile/:employeeId), not through the Employee endpoint (PUT /api/employees/:id). This design ensures salary changes are properly tracked and controlled through the profile management interface.

## External Dependencies

### Third-Party Services

1. **Payment Processing**
   - **PayPal SDK**: Server-side order creation and capture
   - **Razorpay**: Client-side checkout integration (via CDN script)
   - Environment-based configuration (sandbox/production modes)
   - Fallback handling when credentials not configured

2. **AI/ML Services**
   - **Google Gemini AI**: Project task distribution and planning
   - Generates day-by-day task breakdowns with employee assignments
   - Provides task refinement and optimization suggestions
   - Graceful fallback to manual planning when API unavailable

3. **Video Conferencing**
   - **Jitsi React SDK**: Embedded video meetings
   - Self-hosted or Jitsi Meet infrastructure
   - Automatic meeting room creation and management

4. **Email Service**
   - **Nodemailer**: Transactional email delivery
   - OTP verification emails for registration/password reset
   - Salary credit notifications with formatted payment details
   - Project assignment notifications to team members

5. **Google OAuth**
   - Passport Google OAuth 2.0 strategy
   - Social login integration with account linking

### Development Tools

- **Drizzle Kit**: Database migrations (configured but MongoDB currently used)
- **ESBuild**: Server-side code bundling for production
- **Vite Plugins**: Runtime error overlay, cartographer for development

### Background Jobs

- **Node-cron**: Scheduled task execution
- Meeting reminder checks every 60 seconds
- Project notification checks every 30 minutes
- Automatic archiving of completed projects

### Authentication & Security

- **bcrypt**: Password hashing with salt rounds
- **crypto**: Scrypt-based legacy password comparison support
- **express-session**: Secure session management with MongoDB persistence