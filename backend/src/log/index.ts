import Config, { Env } from '@/config/env';
import winston from 'winston';
export * from './utils';

const { combine, timestamp, printf, colorize } = winston.format;

// Define a custom log format
const customFormat = printf(({ timestamp, level, message }) => `${timestamp} [${level}] ${message}`);

// Define the configuration for Winston logger
let winstonConfig: winston.LoggerOptions = {};

// Define the console transport for development environment
const consoleTransport = new winston.transports.Console({
  format: combine(
    colorize(), // Colorize the output
    timestamp({ format: 'YYYY/MM/DD HH:mm:ss' }), // Add timestamp to the log
    customFormat // Apply custom format
  ),
});

// Define the file transport for info level logs
const infoFileTransport = new winston.transports.File({
  filename: 'logs/combined.log',
  format: combine(
    timestamp({ format: 'YYYY/MM/DD HH:mm:ss' }), // Add timestamp to the log
    customFormat // Apply custom format
  ),
});

// Define the file transport for error level logs
const errorFileTransport = new winston.transports.File({
  filename: 'logs/errors.log',
  level: 'error',
  format: combine(
    timestamp({ format: 'YYYY/MM/DD HH:mm:ss' }), // Add timestamp to the log
    customFormat // Apply custom format
  ),
});

// Configure the logger based on the environment
if (Config.NODE_ENV === Env.PRODUCTION) {
  winstonConfig.level = 'info';
  winstonConfig.transports = [infoFileTransport, errorFileTransport];
} else {
  winstonConfig.level = 'debug';
  winstonConfig.transports = [consoleTransport];
}

// Create and export the logger
export const log = winston.createLogger(winstonConfig);
