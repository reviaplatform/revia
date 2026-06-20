import jwt from 'jsonwebtoken';
import { ApiError } from '../errors';

export function createToken(
  payload: Record<string, unknown>,
  key: string,
  expiresIn: string,
): string {
  return jwt.sign(payload, key, { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] });
}

export function verifyToken(
  token: string,
  key: string,
  type: 'access' | 'refresh' | 'register',
): any {
  try {
    return jwt.verify(token, key);
  } catch (err) {
    handleTokenError(type);
  }
}

function handleTokenError(type: 'access' | 'refresh' | 'register'): never {
  switch (type) {
    case 'register':
      throw ApiError.invalidRegisterToken();
    case 'refresh':
      throw ApiError.invalidRefreshToken();
    case 'access':
    default:
      throw ApiError.invalidAccessToken();
  }
}
