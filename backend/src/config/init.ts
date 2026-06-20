import { config } from 'dotenv';
// Load environment variables from a .env file into process.env
config();

import Config from './env';
import { CreateDir } from './dir';
import { log } from '@/log';

type Key = keyof typeof Config;

// Iterate over each key in the Config object
for (const key in Config) {
  // Check if the environment variable is undefined or an empty string
  if (Config[key as Key] === undefined || Config[key as Key] === '') {
    // Log an error message if the environment variable is not found
    log.error(`Environment variable '${key}' not found`);
  }
}

// Create necessary directories
CreateDir();
