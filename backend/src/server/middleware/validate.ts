import { ApiError, HttpStatus } from '@/core/errors';
import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { z, ZodError } from 'zod';
import { FilterXSS } from 'xss';

// This snippet creates an instance of the FilterXSS class with the specified options.
const myXSS = new FilterXSS();

// Define a list of fields that should not be sanitized to prevent data loss
const noSanitizeFields: string[] = ['password', 'instgramLink', 'facebookLink'];

// This function sanitizes the input to prevent XSS attacks by removing special characters from the input.
function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return input;
  }

  input = myXSS.process(input); // Sanitize the input to prevent XSS attacks
  let output = input.replace(/[\\\/\$\{\}"=*]/g, ''); // Remove \ / $ { } and " *= characters

  return output;
}

// This snippet is a middleware function that validates the body of an HTTP request using Joi.
export function validateBody(schema: Schema, skipSanitizeFields: string[] = []) {
  return (req: Request, _: Response, next: NextFunction) => {
    try {
      // Step 1: Sanitize the request body to prevent XSS attacks
      Object.keys(req.body).forEach(key => {
        // Sanitize all string fields in the request body except for fields in noSanitizeFields
        if (
          typeof req.body[key] === 'string' &&
          !noSanitizeFields.includes(key) &&
          !skipSanitizeFields.includes(key)
        ) {
          req.body[key] = sanitizeInput(req.body[key] as string);
        }
      });

      // Step 2: Perform the validation using the provided schema
      const { error, value } = schema.validate(req.body);

      // If validation fails, throw an error
      if (error) {
        throw new ApiError(error.message, HttpStatus.BadRequest);
      } else {
        req.body = value;
        next();
      }
    } catch (error) {
      // If something goes wrong during sanitization or validation, handle the error
      throw new ApiError(error.message, HttpStatus.BadRequest);
    }
  };
}

// This snippet is a middleware function that validates the query parameters of an HTTP request using zod.
export function validateQuery(schema: z.ZodSchema) {
  return (req: Request, _: Response, next: NextFunction) => {
    try {
      // Sanitize all query parameters to prevent XSS attacks
      for (const key in req.query) {
        if (typeof req.query[key] === 'string' && !noSanitizeFields.includes(key)) {
          req.query[key] = sanitizeInput(req.query[key] as string);
        }
      }

      // Validate the query using zod
      const parsedQuery = schema.parse(req.query);

      // Remove extra fields from the query
      req.query = parsedQuery;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // If validation fails, send a BadRequest error
        const errorMessage = error.errors.map(e => e.message).join(', ');
        throw new ApiError(errorMessage, HttpStatus.BadRequest);
      }
      throw new ApiError(error.message, HttpStatus.BadRequest);
    }
  };
}
