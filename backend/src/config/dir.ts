import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

// List of directories to be created
const Dirs = ['logs', 'tmp', 'uploads'];

/**
 * Function to create directories if they do not exist.
 */
export function CreateDir() {
  for (const dir of Dirs) {
    // Construct the path to the directory
    const path = join(__dirname, '..', '..', dir);

    // Check if the directory already exists
    if (existsSync(path)) continue;

    // Create the directory recursively
    mkdirSync(path, { recursive: true });
  }
}
