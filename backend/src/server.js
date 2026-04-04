require('dotenv').config();
const app = require('./app');
const { startCronJob } = require('./services/cronJob');

const PORT = process.env.PORT || 4000;

// TODO: add rate limiting

const server = app.listen(PORT, () => {
  console.log(`HybridHerd backend running on http://localhost:${PORT}`);
  console.log(`GraphQL endpoint available at http://localhost:${PORT}/graphql`);

  // Start alert checking cron job
  startCronJob();
});

server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
