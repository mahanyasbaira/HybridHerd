# HybridHerd Frontend

A modern React 18 + Vite web application for monitoring cattle health using wearable sensors, specifically designed to detect Bovine Respiratory Disease (BRD).

## Tech Stack

- **Vite** - Lightning-fast build tool
- **React 18** - UI library
- **React Router v6** - Client-side routing
- **TanStack React Query v5** - Server state management
- **Tailwind CSS v3** - Utility-first CSS
- **Recharts** - Data visualization
- **Lucide React** - Icon library
- **Sonner** - Toast notifications
- **Axios** - HTTP client

## Project Structure

```
frontend-web/
├── src/
│   ├── api/              # API client layer
│   │   ├── client.js     # Axios instance with JWT interceptor
│   │   ├── auth.js       # Authentication endpoints
│   │   ├── animals.js    # Animal management endpoints
│   │   ├── alerts.js     # Alert endpoints
│   │   └── notes.js      # Notes and telehealth endpoints
│   ├── context/          # React context
│   │   └── AuthContext.jsx  # Auth state management
│   ├── hooks/            # Custom hooks
│   │   └── useAlertPoller.js  # Real-time alert polling
│   ├── components/
│   │   ├── ui/           # Reusable UI components
│   │   │   ├── GlassCard.jsx
│   │   │   ├── DottedBackground.jsx
│   │   │   ├── GooeyInput.jsx
│   │   │   ├── RiskBadge.jsx
│   │   │   └── AnimatedBeams.jsx
│   │   └── layout/       # Layout components
│   │       ├── Sidebar.jsx
│   │       └── AppLayout.jsx
│   ├── pages/            # Route pages
│   │   ├── LoginPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── AnimalDetailPage.jsx
│   │   ├── AlertsPage.jsx
│   │   └── AddAnimalPage.jsx
│   ├── App.jsx           # Main app component with routing
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Design Aesthetic

- **Color Palette:**
  - Background: Deep dark `#050810`
  - Cards: Glassmorphic with `bg-white/5 backdrop-blur-md border border-white/10`
  - Primary text: White, slate-100
  - Secondary text: Slate-400
  - Risk colors:
    - Low Risk: Emerald-500 (`#10b981`)
    - High Risk: Red-500 (`#ef4444`)
    - Flagged: Amber-400 (`#fbbf24`)
  - Accent: Violet-500 for interactive elements

- **Typography:**
  - Headings: Instrument Serif (Google Fonts)
  - Body: Inter (Google Fonts)
  - Sidebar: Slate-950 (`#0a0e1a`)

- **Effects:**
  - Animated dot background with opacity variations
  - Glassmorphic cards with hover effects
  - Gooey SVG filter input
  - Animated beam lines on login page
  - Pulsing ring animation for high-risk alerts

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
cd frontend-web
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build

```bash
npm run build
```

## API Integration

The frontend connects to a backend at `http://localhost:4000` with the following key endpoints:

### Authentication
- `POST /api/auth/login` - Login with email and password
- `POST /api/auth/register` - Register new account

### Animals
- `GET /api/animals?risk=All|High|Low` - List animals
- `GET /api/animals/:id` - Get animal details with 24h telemetry
- `POST /api/animals` - Add new animal
- `PATCH /api/animals/:id/flag` - Toggle manual flag
- `DELETE /api/animals/:id` - Delete animal

### Alerts
- `GET /api/alerts?acknowledged=true|false` - List alerts
- `PATCH /api/alerts/:id/acknowledge` - Acknowledge alert

### Notes & Telehealth
- `GET /api/notes/:animalId` - Get notes
- `POST /api/notes/:animalId` - Create note
- `PATCH /api/notes/entry/:id` - Update note
- `DELETE /api/notes/entry/:id` - Delete note
- `POST /api/telehealth/send` - Send alert to veterinarian

## Features

### Dashboard
- View all animals with filtering by risk level
- Search by name or tag ID
- View current sensor readings (temperature, respiratory rate, behavior index)
- Quick flag/unflag animals
- Add new animals

### Animal Detail View
- Complete sensor telemetry (3 wearable types)
- 24-hour historical charts with multiple metrics
- Current risk status with ML scoring
- Manual flagging for veterinary watchlist
- Alert management with send-to-vet functionality
- Comprehensive notes system with CRUD operations
- Behavior index explainer modal

### Alerts
- Real-time alert polling (30-second intervals)
- Toast notifications for new high-risk alerts
- Alert acknowledgment workflow
- Risk transition tracking (Low → High)
- Unread alert badge in sidebar

### Authentication
- Secure JWT-based auth with localStorage persistence
- Protected routes
- Role-based user display

## Key Features

- **Real-time Alerts:** useAlertPoller hook polls for new alerts every 30 seconds and fires toasts for high-risk events
- **Glassmorphic Design:** Modern dark aesthetic with transparency effects and backdrop blur
- **Responsive Grid:** Multi-column grid layouts that adapt from mobile to desktop
- **Data Visualization:** Recharts integration for telemetry trends
- **State Management:** TanStack React Query for server state with proper caching
- **Form Handling:** Gooey SVG filter inputs and standard form fields with validation

## Environment Variables

Create a `.env.local` file (if needed for custom API base):

```
VITE_API_BASE_URL=http://localhost:4000
```

Currently, the API base URL is hardcoded to `http://localhost:4000` in `src/api/client.js`.

## Notes

- JWT token is stored in localStorage as `hh_token`
- User data is cached in localStorage as `hh_user`
- All API requests include the authorization header automatically
- No console.log statements in production code
- Tailwind CSS is the only styling approach (no inline styles except for dynamic values)
