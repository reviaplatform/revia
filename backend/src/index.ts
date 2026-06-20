// Initialize configuration
import './config/init';

import { createServer } from './server/index';
import { initDB } from './database/init';
import { log } from './log';

// Helper to extract a readable message from any thrown value
function formatError(err: unknown): string {
  if (err instanceof Error) {
    return `${err.message}${err.stack ? `\n${err.stack}` : ''}`;
  }
  if (typeof err === 'string') return err;
  try { return JSON.stringify(err); } catch { return String(err); }
}

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  log.error(`[uncaughtException] ${formatError(err)}`);
});

// Handle unhandled rejections
process.on('unhandledRejection', reason => {
  log.error(`[unhandledRejection] ${formatError(reason)}`);
});

async function main() {
  try {
    // Initialize database
    await initDB();

    // Initialize server
    createServer();
  } catch (err) {
    log.error(`[startup] ${formatError(err)}`);
    process.exit(1);
  }
}

// Start the application
main();
