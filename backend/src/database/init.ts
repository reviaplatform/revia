import Config from '@/config/env';
import { log } from '@/log';
import mongoose from 'mongoose';

export async function initDB() {
  try {
    await mongoose.connect(Config.MONGODB_URI, {
      maxPoolSize: 20, // Allow up to 20 concurrent connections
    });
    log.info('Connected to DB.');
  } catch (error) {
    log.error(`DB Connection Error ${error}`)
  }
}
