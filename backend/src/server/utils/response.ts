import { ResponseTemplate } from "@server/types/server";

/**
 * Wraps the provided data in a response template.
 *
 * @template T - The type of the data to be wrapped.
 * @param {T} data - The data to be wrapped in the response template.
 * @returns {ResponseTemplate<T>} The wrapped response containing the status and data.
 */
export function wrapResponse<T>(data: T): ResponseTemplate<T> {
  const response: ResponseTemplate<T> = {
    status: 'success',
    data: data,
  };
  return response;
}
