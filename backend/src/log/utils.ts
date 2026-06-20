import { log } from './index';

/**
 * Logs an incoming request.
 * 
 * @param method - The HTTP method of the request.
 * @param path - The path of the request.
 * @param ip - The IP address of the client.
 * @param agent - The user agent of the client.
 */
export function logRequest(method: string, path: string, ip: string, agent: string): void {
  log.info(`[${method}] ${path} <- |Client ${ip}| |Agent ${agent}|`);
}

/**
 * Logs an outgoing response.
 * 
 * @param method - The HTTP method of the request.
 * @param path - The path of the request.
 * @param statusCode - The HTTP status code of the response.
 * @param ms - The time taken to process the request in milliseconds.
 */
export function logResponse(method: string, path: string, statusCode: number, ms: number): void {
  if (statusCode >= 500) {
    log.error(`[${method}] ${path} -> |${statusCode}| [${ms}ms]`);
  } else if (statusCode >= 400) {
    log.warn(`[${method}] ${path} -> |${statusCode}| [${ms}ms]`);
  } else {
    log.info(`[${method}] ${path} -> |${statusCode}| [${ms}ms]`);
  }
}
