import { ApiError } from '@/core/errors';
import { SafeResult } from '@/core/types';

/**
 * Unwraps a SafeResult object and returns the result if there is no error.
 * Throws an ApiError if the result contains an error.
 *
 * @param result - The SafeResult object to unwrap.
 * @returns The unwrapped result if no error is present.
 * @throws ApiError if the result contains an error.
 */
export function unwrapResult<T>(result: SafeResult<T>): T {
  const error = result.error as { message: string; code: string };
  if (!error) {
    return result.result!;
  }
  throw new ApiError(error.message, Number(error.code));
}
