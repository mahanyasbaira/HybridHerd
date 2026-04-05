const express = require('express');
const { createHandler } = require('graphql-http/lib/use/express');
const schema = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');

const authRoutes = require('./routes/auth');
const telemetryRoutes = require('./routes/telemetry');
const animalRoutes = require('./routes/animals');
const alertRoutes = require('./routes/alerts');
const telehealthRoutes = require('./routes/telehealth');
const notesRoutes = require('./routes/notes');
const consultationsRoutes = require('./routes/consultations');

const cors = require('cors');

const app = express();

// Middleware
app.use(cors({ origin: ['http://localhost:8081', 'http://localhost:19006', 'http://localhost:5173', 'http://localhost:3000'] }));
app.use(express.json());

// REST Routes
app.use('/api/auth', authRoutes);
app.use('/api/telemetry', telemetryRoutes);
app.use('/api/animals', animalRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/telehealth', telehealthRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/consultations', consultationsRoutes);

// GraphQL Endpoint
app.use('/graphql', createHandler({ schema, rootValue: resolvers }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = app;
