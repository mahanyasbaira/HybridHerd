# HybridHerd Frontend - Route Reference

## Public Routes

### `/login`
**Component**: `LoginPage.jsx`  
**Purpose**: User authentication (login)  
**Access**: Anyone (redirects to dashboard if already logged in)  
**Features**:
- Email/password gooey input
- Glassmorphic form card
- Animated beams and dotted background
- Error display
- Loading state with spinner

## Protected Routes

All routes below require valid JWT authentication. Unauthenticated users are redirected to `/login`.

### `/` (Index)
**Redirect**: `/dashboard`  
**Purpose**: Default entry point after login

### `/dashboard`
**Component**: `DashboardPage.jsx`  
**Purpose**: Main dashboard with animal overview  
**Features**:
- List all animals with sensor data
- Filter by risk (All, High, Low)
- Search by name or tag ID
- Three stat cards (total, high-risk, flagged)
- Animal grid cards (3-col xl, 2-col md, 1-col sm)
- Flag toggle on each card
- Link to animal detail view
- Floating action button to add animal
- Loading skeletons
- Error handling

**API Calls**:
- `GET /api/animals?risk=All|High|Low`

### `/animals/add`
**Component**: `AddAnimalPage.jsx`  
**Purpose**: Register new animal in system  
**Features**:
- Form fields: tag_id (required), name, breed, birth_date
- Validation (tag_id required)
- Cancel/Submit buttons
- Error toast notifications
- Redirect to dashboard on success

**API Calls**:
- `POST /api/animals`

### `/animals/:id`
**Component**: `AnimalDetailPage.jsx`  
**Parameters**: `id` (animal ID)  
**Purpose**: Detailed view of single animal  
**Features**:
- Animal info header (name, tag, breed, age)
- Risk badge with flagged status
- Manual flag toggle
- Delete button (with confirmation)
- High-risk alert banner (when applicable)
- Send to veterinarian modal
- Three sensor cards:
  - Nose Ring (temperature, respiratory rate)
  - Collar (chew frequency, cough count)
  - Ear Tag (behavior index 0-1)
- 24-hour telemetry charts (tabbed):
  - Temperature chart
  - Respiratory rate chart
  - Behavior index chart
- Behavior index explainer (collapsible)
- Notes section with full CRUD:
  - Add new note
  - View all notes
  - Edit individual notes
  - Delete individual notes
  - Timestamp on each note

**API Calls**:
- `GET /api/animals/:id`
- `PATCH /api/animals/:id/flag`
- `DELETE /api/animals/:id`
- `GET /api/notes/:animalId`
- `POST /api/notes/:animalId`
- `PATCH /api/notes/entry/:id`
- `DELETE /api/notes/entry/:id`
- `POST /api/telehealth/send`

### `/alerts`
**Component**: `AlertsPage.jsx`  
**Purpose**: Centralized alert management  
**Features**:
- Toggle between unacknowledged/all alerts
- Alert count display
- Risk transition pills (Low → High)
- ML score display
- Timestamp display
- Acknowledge button
- Empty state with checkmark icon
- Real-time updates via polling

**API Calls**:
- `GET /api/alerts?acknowledged=false|true`
- `PATCH /api/alerts/:id/acknowledge`

## Layout Structure

```
<BrowserRouter>
  <AuthProvider>
    <QueryClientProvider>
      <App>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="animals/:id" element={<AnimalDetailPage />} />
            <Route path="animals/add" element={<AddAnimalPage />} />
            <Route path="alerts" element={<AlertsPage />} />
          </Route>
        </Routes>
      </App>
    </QueryClientProvider>
  </AuthProvider>
</BrowserRouter>
```

## Navigation

### Sidebar Navigation
- Dashboard (LayoutDashboard icon)
- Animals (Tag icon)
- Alerts (Bell icon with unread badge)
- User email and role (bottom section)
- Sign Out button

### In-Page Navigation
- DashboardPage:
  - Link to `/animals/:id` from each animal card
  - Floating button to `/animals/add`
  
- AnimalDetailPage:
  - Back button to `/dashboard`
  - Toggle to `/alerts` for alert context
  
- AlertsPage:
  - Back to `/dashboard` via sidebar
  
- AddAnimalPage:
  - Cancel button back to `/dashboard`

## Query Parameters

None currently implemented, but could be added for:
- `/dashboard?sort=name&risk=High`
- `/alerts?timeframe=24h`

## Error Handling

- Invalid routes → 404 (React Router handles)
- Authentication failure → Redirect to `/login`
- API errors → Toast notification + graceful fallback UI
- Network errors → Error card with message

## Protected Route Logic

```javascript
function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" />;
  
  return children;
}
```

## Route Transitions

- Login → Dashboard (automatic on auth success)
- Logout → Login (automatic on logout)
- Add Animal → Dashboard (automatic on creation)
- Delete Animal → Dashboard (automatic on deletion)
- All other navigation → Manual (sidebar, buttons, links)

## Query Client Configuration

Routes benefit from React Query caching:
- `staleTime`: 60 seconds
- `gcTime`: 5 minutes
- Alert polling: 30-second refetch interval

## Real-time Features

- **Alert Polling**: Every 30 seconds via `useAlertPoller` hook
- **Toast Notifications**: New high-risk alerts
- **Sidebar Badge**: Unread alert count updates automatically
