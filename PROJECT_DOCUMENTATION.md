# ThinkOwn Teams - Project Management Dashboard Documentation

## Overview
ThinkOwn Teams is a comprehensive project management dashboard built with React, TypeScript, and Supabase. It provides a complete solution for managing projects, tasks, team members, and quality assurance processes.

## Architecture

### Tech Stack
- **Frontend**: React 18 with TypeScript
- **UI Framework**: Tailwind CSS with Shadcn/ui components
- **Backend**: Supabase (PostgreSQL database, Authentication, Real-time)
- **State Management**: React hooks with custom data fetching hooks
- **Routing**: React Router DOM
- **Build Tool**: Vite

### Database Schema
The application uses 6 main database tables:

1. **profiles** - User profile information
2. **projects** - Project data and metadata
3. **tasks** - Individual tasks with assignments and status
4. **team_members** - Team member information and capacity
5. **qa_issues** - Quality assurance issues and bug tracking
6. **project_team_members** - Many-to-many relationship between projects and team members

## Main Application Structure

### App.tsx
- Root component that sets up routing and providers
- Includes authentication protection via `ProtectedRoute`
- Routes:
  - `/auth` - Authentication page
  - `/` - Main dashboard (protected route)
  - `*` - 404 Not Found page

### Authentication System
Located in `src/contexts/AuthContext.tsx` and `src/pages/Auth.tsx`

**Features:**
- Email/password authentication via Supabase
- Session management with automatic token refresh
- User profile creation on signup
- Protected routes that redirect to auth page when not logged in

**Flow:**
1. User signs up/signs in via Auth page
2. AuthContext manages session state globally
3. ProtectedRoute component guards dashboard access
4. User profile is automatically created in database on first signup

## Main Dashboard (`src/components/dashboard/Dashboard.tsx`)

The main dashboard is a tabbed interface with 6 primary views:

### 1. Overview Tab
**Purpose:** High-level project and team statistics dashboard

**Components:**
- **Quick Stats Cards**: Display key metrics (Active Projects, Tasks Completed, Team Members, Open Issues)
- **Enhanced Kanban Board**: Main task management interface
- **Upcoming Deadlines**: Shows project deadlines with priority indicators
- **Quick Actions**: Buttons for creating projects and team members
- **Recent Activity**: Notification-style activity feed

**Data Sources:**
- Projects from `useProjects()` hook
- Tasks from `useTasks()` hook  
- Team members from `useTeamMembers()` hook
- Real-time calculations for statistics

### 2. Projects Tab
Displays the **Project Tracker** component

### 3. Team Tab
Displays the **Team Role View** component

### 4. QA Tab
Displays the **QA Tracker** component

### 5. Files Tab
Contains:
- **File Repository** component
- **Calendar Integration** component
- **Design Notes** component

### 6. Marketing Tab
Contains:
- **Marketing Calendar** component
- **Meeting Notes** component

## Core Components

### Enhanced Kanban Board (`src/components/dashboard/EnhancedKanbanBoard.tsx`)

**Purpose:** Visual task management with drag-and-drop functionality

**Features:**
- **Drag & Drop**: Tasks can be moved between columns (To Do, In Progress, Review, Completed)
- **Real-time Updates**: Uses Supabase real-time subscriptions for live updates
- **Task Creation**: Quick add functionality with "+" button
- **Task Editing**: Click any task to open detailed edit modal
- **Visual Indicators**: Priority badges, assignee avatars, due dates
- **Filtering**: Filter tasks by assignee, project, or priority

**Data Flow:**
1. Fetches tasks via `useTasks()` hook with related assignee and project data
2. Groups tasks by status into columns
3. Uses `@dnd-kit` for drag-and-drop functionality
4. Updates task status in Supabase when moved between columns
5. Real-time subscription updates all connected clients instantly

**Key Functions:**
- `handleDragEnd()`: Updates task status when dropped in new column
- `handleTaskUpdate()`: Saves task changes to database
- `handleDeleteTask()`: Removes tasks with confirmation

### Project Tracker (`src/components/dashboard/ProjectTracker.tsx`)

**Purpose:** Comprehensive project overview and management

**Features:**
- **Project Cards**: Visual representation of each project with key metrics
- **Progress Tracking**: Automatic calculation based on completed vs total tasks
- **Status Indicators**: Color-coded badges (on-track, at-risk, delayed)
- **Team Assignment**: Shows assigned team members with avatars
- **Deadline Tracking**: Visual deadline indicators
- **Project Creation**: Integrated project creation form

**Calculations:**
- **Progress**: `(completed tasks / total tasks) * 100`
- **Team Assignment**: Shows team members who have tasks in the project
- **Status Color Coding**: 
  - Green (on-track)
  - Yellow (at-risk)  
  - Red (delayed)

### Team Role View (`src/components/dashboard/TeamRoleView.tsx`)

**Purpose:** Team member management and workload tracking

**Features:**
- **Role Distribution**: Visual breakdown of team members by role (Dev, QA, UI/UX, BA)
- **Workload Management**: Shows current tasks vs capacity for each member
- **Status Tracking**: Available, Busy, or Overloaded based on task load
- **Skills Display**: Shows team member skills and expertise
- **Capacity Planning**: Visual progress bars showing current workload percentage

**Workload Calculation:**
- **Available**: < 80% of max capacity
- **Busy**: 80-100% of max capacity  
- **Overloaded**: > 100% of max capacity

**Visual Elements:**
- Role-based color coding for easy identification
- Progress bars for workload visualization
- Avatar display with fallback initials
- Skills tags for quick reference

### QA Tracker (`src/components/dashboard/QATracker.tsx`)

**Purpose:** Quality assurance issue and bug tracking

**Features:**
- **Issue Management**: Create, edit, and track QA issues
- **Severity Levels**: Critical, High, Medium, Low priority classification
- **Status Tracking**: Open, In Progress, Resolved, Closed
- **Assignment**: Assign issues to specific team members
- **Project Linking**: Associate issues with specific projects
- **Filtering**: Filter by status, severity, or assignee

**Issue Lifecycle:**
1. **Creation**: New issues start as "Open" status
2. **Assignment**: Issues can be assigned to QA team members
3. **Progress**: Status updates as issues are worked on
4. **Resolution**: Issues move to "Resolved" then "Closed"

### Real Task Modal (`src/components/dashboard/RealTaskModal.tsx`)

**Purpose:** Comprehensive task creation and editing interface

**Features:**
- **Full Task Details**: Title, description, priority, assignee, project, due date, tags
- **Priority Selection**: High, Medium, Low priority levels
- **Assignee Management**: Dropdown selection from team members
- **Project Association**: Link tasks to specific projects
- **Due Date Picker**: Calendar interface for deadline selection
- **Tag System**: Add/remove custom tags for categorization
- **Form Validation**: Required field validation and error handling

**Form Validation:**
- Task title is required
- User authentication validation
- Error handling with toast notifications
- Loading states during save/delete operations

## Data Hooks

### useProjects (`src/hooks/useProjects.ts`)
- Fetches all projects from Supabase
- Provides loading states
- Real-time updates via subscriptions
- Automatic error handling

### useTasks (`src/hooks/useTasks.ts`)
- Fetches tasks with related assignee and project data
- Includes complex joins for complete task information
- Real-time subscriptions for live updates
- Filtering and sorting capabilities

### useTeamMembers (`src/hooks/useTeamMembers.ts`)
- Manages team member data
- Includes skills, capacity, and status information
- Used for task assignment dropdowns
- Real-time updates for team changes

## Authentication Flow

### 1. Initial Load
- App checks for existing Supabase session
- AuthContext provides user state globally
- ProtectedRoute redirects unauthenticated users

### 2. Sign Up Process
- User completes registration form
- Supabase creates auth user
- Database trigger creates corresponding profile
- User is automatically signed in

### 3. Sign In Process  
- Email/password validation via Supabase
- Session token stored in localStorage
- User redirected to main dashboard
- Global auth state updated

### 4. Session Management
- Automatic token refresh
- Persistent sessions across browser restarts
- Global sign out functionality
- Auth state synchronization across components

## Real-time Features

### Supabase Real-time Integration
The application uses Supabase's real-time capabilities for live updates:

**Real-time Subscriptions:**
- **Tasks**: Live updates when tasks are created, updated, or moved
- **Projects**: Project changes reflect immediately
- **Team Members**: Team updates sync across sessions
- **QA Issues**: Issue status changes broadcast to all users

**Implementation:**
```typescript
// Example from Enhanced Kanban Board
useEffect(() => {
  const channel = supabase
    .channel('tasks-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'tasks' },
      () => refetchTasks()
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}, []);
```

## Security Implementation

### Row Level Security (RLS)
All database tables have RLS policies that ensure:
- Users can only modify data they created
- All users can view shared data (tasks, projects, team members)
- Authentication is required for all operations

### Authentication Guards
- `ProtectedRoute` component guards dashboard access
- All API calls include authentication tokens
- User context provides auth state throughout app

## Design System

### Tailwind Configuration
- Custom color scheme with semantic tokens
- Consistent spacing and typography
- Responsive design patterns
- Dark/light mode support (configured)

### Component Styling
- Glass morphism effects (`glass-card` class)
- Gradient backgrounds (`gradient-primary`)
- Consistent hover states and transitions
- Accessible color contrasts

### UI Components (Shadcn/ui)
- Reusable component library
- Consistent styling across application
- Accessibility built-in
- Customizable variants

## Error Handling

### Form Validation
- Required field validation
- Type checking for inputs  
- User-friendly error messages
- Toast notifications for feedback

### Database Errors
- Connection error handling
- Graceful degradation
- Loading states during operations
- Retry functionality where appropriate

### Authentication Errors
- Invalid credentials handling
- Session expiration management
- Network error recovery
- Clear user feedback

## Performance Optimizations

### Data Fetching
- Custom hooks with built-in caching
- Selective data loading (only fetch what's needed)
- Real-time subscriptions instead of polling
- Optimistic updates for better UX

### Component Optimization
- React memo for expensive components
- Proper dependency arrays in useEffect
- Efficient re-render patterns
- Lazy loading for heavy components

### Database Optimization
- Proper indexing on frequently queried columns
- Efficient join queries
- Row-level security for data filtering
- Connection pooling via Supabase

## File Structure

```
src/
├── components/
│   ├── dashboard/
│   │   ├── Dashboard.tsx (Main container)
│   │   ├── EnhancedKanbanBoard.tsx (Task management)
│   │   ├── ProjectTracker.tsx (Project overview)
│   │   ├── TeamRoleView.tsx (Team management)
│   │   ├── QATracker.tsx (Issue tracking)
│   │   ├── RealTaskModal.tsx (Task form)
│   │   └── [Other components...]
│   ├── forms/ (Form components)
│   ├── ui/ (Shadcn/ui components)
│   └── ProtectedRoute.tsx
├── contexts/
│   └── AuthContext.tsx (Global auth state)
├── hooks/
│   ├── useProjects.ts
│   ├── useTasks.ts
│   └── useTeamMembers.ts
├── integrations/
│   └── supabase/ (Database client)
├── pages/
│   ├── Auth.tsx (Login/signup)
│   ├── Index.tsx (Dashboard route)
│   └── NotFound.tsx
└── lib/
    └── utils.ts (Utility functions)
```

## Future Enhancement Possibilities

### Features to Consider
- **File Upload**: Document attachment to tasks/projects
- **Time Tracking**: Built-in time logging for tasks
- **Notifications**: Email/push notifications for important updates
- **Reporting**: Advanced analytics and project reports
- **Templates**: Project and task templates for quick setup
- **Mobile App**: React Native companion app
- **API Integration**: Third-party tool integrations
- **Advanced Permissions**: Role-based access control

### Technical Improvements
- **Offline Support**: PWA capabilities for offline usage
- **Performance**: Virtual scrolling for large datasets
- **Testing**: Comprehensive test coverage
- **Documentation**: API documentation generation
- **Monitoring**: Error tracking and performance monitoring

## Conclusion

ThinkOwn Teams provides a complete project management solution with real-time collaboration, comprehensive task management, team tracking, and quality assurance capabilities. The modular architecture makes it easy to extend and customize for specific organizational needs while maintaining a consistent user experience throughout the application.