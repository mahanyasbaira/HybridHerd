const cron = require('node-cron');
const pool = require('../db/pool');
const { checkAndCreateAlert, buildNotificationPayload } = require('./alertService');

let cronJobInstance = null;

function startCronJob() {
  cronJobInstance = cron.schedule('*/5 * * * *', async () => {
    try {
      // Fetch all animals
      const result = await pool.query('SELECT id FROM animals');
      const animals = result.rows;

      if (animals.length === 0) {
        console.info('[Cron] No animals to check');
        return;
      }

      console.info(`[Cron] Checking ${animals.length} animals for alerts`);

      let alertsCreated = 0;

      for (const animal of animals) {
        try {
          const alert = await checkAndCreateAlert(animal.id, pool);
          if (alert) {
            alertsCreated++;
            try {
              const payload = await buildNotificationPayload(alert, pool);
              console.info(`[Cron] New alert created for animal ${animal.id}:`, JSON.stringify(payload));
              // In production, this would push to websocket, FCM, or other notification service
            } catch (err) {
              console.error(`[Cron] Failed to build notification payload for alert ${alert.id}:`, err.message);
            }
          }
        } catch (err) {
          // Check if it's a ML service timeout/error
          if (err.message.includes('Failed to predict risk')) {
            console.error(`[Cron] ML service error for animal ${animal.id}: ${err.message}`);
          } else {
            console.error(`[Cron] Error checking animal ${animal.id}:`, err.message);
          }
        }
      }

      console.info(`[Cron] Completed check: ${alertsCreated} new alerts created`);
    } catch (err) {
      console.error('[Cron] Fatal error in cron job:', err.message);
    }
  });

  console.info('[Cron] Alert checking cron job started (every 5 minutes)');
}

function stopCronJob() {
  if (cronJobInstance) {
    cronJobInstance.stop();
    cronJobInstance = null;
    console.info('[Cron] Alert checking cron job stopped');
  }
}

module.exports = {
  startCronJob,
  stopCronJob,
};
