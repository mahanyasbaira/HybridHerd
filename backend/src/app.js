const express = require('express');
const { createHandler } = require('graphql-http/lib/use/express');
const schema = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');

const telemetryRoutes = require('./routes/telemetry');
const animalRoutes = require('./routes/animals');
const alertRoutes = require('./routes/alerts');
const telehealthRoutes = require('./routes/telehealth');

const app = express();

// Middleware
app.use(express.json());

// REST Routes
app.use('/api/telemetry', telemetryRoutes);
app.use('/api/animals', animalRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/telehealth', telehealthRoutes);

// GraphQL Endpoint
// TODO: add authentication middleware for GraphQL endpoint
app.use('/graphql', createHandler({ schema, rootValue: resolvers }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = app;
