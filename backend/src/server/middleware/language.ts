import { NextFunction, Response } from 'express';
import i18next from '../utils/i18n';
import { CustomLangRequest } from './isAuth';

/**
 * Middleware function to change the language of the application based on the request.
 *
 * This function uses the `i18next` library to change the language setting according to the `lang` property
 * in the `req` (request) object. If the language change is successful, it calls the `next` middleware function.
 * If an error occurs during the language change, it passes the error to the `next` middleware function for error handling.
 *
 * @param req - The request object containing the `lang` property which specifies the desired language.
 * @param _ - The response object (not used in this middleware).
 * @param next - The next middleware function to be called.
 */
export async function changeLanguage(req: CustomLangRequest, _: Response, next: NextFunction) {
  try {
    await i18next.changeLanguage(req.lang);
    next();
  } catch (err) {
    next(err);
  }
}
