import { Router } from 'express';

// Type definition for a function that initializes a router with the given app instance
export type InitRouterFunc = (app: Router) => void;

// Interface for a standardized response template
export interface ResponseTemplate<T = unknown> {
  // Status of the response, can be either 'success' or 'error'
  status: 'success' | 'error';

  // Optional data field to hold the response data
  data?: T;

  // Optional error object to hold error details
  error?: {
    // Error code
    code: number;

    // Error message
    message: string;
  };
}
