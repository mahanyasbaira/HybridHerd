# HybridHerd Frontend - Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
cd frontend-web
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 3. Build for Production

```bash
npm run build
npm run preview
```

## Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- Backend server running at `http://localhost:4000`

## Environment Setup

The frontend is configured to connect to the backend at `http://localhost:4000`. To customize this:

1. Edit `src/api/client.js`
2. Change the `baseURL` in the axios create call:
   ```javascript
   const api = axios.create({
     baseURL: 'http://your-api-url:port',
   });
   ```

## Features Overview

### Authentication
- Login with email and password
- Secure JWT token storage
- Automatic token injection in API requests
- Protected routes

### Dashboard
- View all animals
- Filter by risk level (All, High, Low)
- Search by name or tag ID
- Quick stats (total, high-risk, flagged)
- Add new animals with floating button

### Animal Details
- View complete sensor telemetry (3 wearable types)
- Interactive 24-hour charts
- Risk status and manual flagging
- Send high-risk alerts to veterinarian
- Comprehensive notes management

### Alerts
- Real-time alert monitoring (30-second polling)
- Toast notifications for new high-risk alerts
- Acknowledge/unacknowledge workflow
- Unread badge in sidebar

## Architecture

### API Layer (`src/api/`)
- `client.js` - Axios instance with JWT interceptor
- `auth.js` - Login/register
- `animals.js` - CRUD operations for animals
- `alerts.js` - Alert endpoints
- `notes.js` - Notes and telehealth operations

### State Management
- **React Query** - Server state (animals, alerts, notes)
- **React Context** - Authentication state
- **localStorage** - Token persistence

### UI Components
- **Glassmorphic Design** - Semi-transparent cards with backdrop blur
- **Dark Theme** - Deep slate backgrounds with white/emerald/red accents
- **Responsive Grids** - Mobile-first layout
- **Animations** - Dot background, beam effects, pulse rings

## Development Tips

### Adding a New Page
1. Create component in `src/pages/PageName.jsx`
2. Import in `src/App.jsx`
3. Add route in `AppRoutes()`

### Adding API Endpoints
1. Create function in appropriate `src/api/*.js` file
2. Import and use with `useQuery` or `useMutation`
3. Handle loading and error states

### Styling
- Use Tailwind CSS classes only
- Reference the color palette in `tailwind.config.js`
- Custom animations defined in `index.css`

### Error Handling
- API errors automatically trigger `toast.error()`
- Use try-catch in mutations
- Display GlassCard with red border for major errors

## Troubleshooting

### "Cannot GET /" after npm run build
- Backend is not running
- API base URL is incorrect
- CORS issues - verify backend CORS configuration

### Toast notifications not appearing
- Ensure `<Toaster />` is in App.jsx
- Check browser console for JS errors

### Charts not rendering
- Verify telemetry_24h data exists in animal response
- Check that timestamps are valid ISO strings

### Authentication not persisting
- Check localStorage for `hh_token` and `hh_user`
- Verify token is valid and not expired
- Clear browser cache and try again

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Modern mobile browsers

## Performance

- React Query caching: 60s staleTime, 5m gcTime
- Alert polling: 30-second intervals
- Code splitting via Vite for faster initial load
- Lazy chart rendering with ResponsiveContainer

## Testing

Currently no automated tests are configured. To add:

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
```

Then create `*.test.jsx` files alongside components.

## Deployment

### Vercel
```bash
vercel deploy
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

### Static Hosting (GitHub Pages, Netlify)
1. Run `npm run build`
2. Deploy `dist/` folder
3. Ensure backend URL is correct for your environment

## Security Notes

- JWT tokens stored in localStorage (vulnerable to XSS)
- Consider moving to httpOnly cookies for production
- Always use HTTPS in production
- Validate user roles on backend
- Never commit `.env` files with secrets

## Support

For issues or questions:
1. Check the README.md
2. Review the API documentation
3. Check backend logs for errors
4. Verify network requests in browser DevTools
