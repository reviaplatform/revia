import path from 'node:path';
import fs from 'node:fs/promises';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import Config, { Env } from '@/config/env';
import { log } from '@/log';
import { ApiError } from '../errors';

// ─── Storage provider switch ─────────────────────────────────────────────────
// Set  STORAGE_PROVIDER=local  in .env to store files on disk instead of S3.
// Default is 's3'.
const USE_S3 = Config.STORAGE_PROVIDER !== 'local';

// ─── Local uploads directory ──────────────────────────────────────────────────
// Resolves to  <project-root>/uploads/
const UPLOADS_DIR = path.join(__dirname, '..', '..', '..', 'uploads');

// ─── S3 client (initialised only when needed) ────────────────────────────────
const s3Client = USE_S3
  ? new S3Client({
    region: Config.S3_REGION,
    credentials: {
      accessKeyId: Config.S3_ACCESS_KEY_ID,
      secretAccessKey: Config.S3_SECRET_ACCESS_KEY,
    },
  })
  : null;

const bucketName = Config.S3_BUCKET_NAME;

// ─────────────────────────────────────────────────────────────────────────────
//  S3 implementations
// ─────────────────────────────────────────────────────────────────────────────

async function s3Upload(
  fileBuffer: Buffer,
  fileName: string,
  mimetype: string,
): Promise<void> {
  await s3Client!.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Body: fileBuffer,
      Key: fileName,
      ContentType: mimetype,
    }),
  );
}

async function s3Delete(fileName: string): Promise<void> {
  await s3Client!.send(
    new DeleteObjectCommand({ Bucket: bucketName, Key: fileName }),
  );
}

async function s3GetUrl(
  key: string,
  expiresIn: number,
): Promise<string> {
  const command = new GetObjectCommand({ Bucket: bucketName, Key: key });
  return (await getSignedUrl(s3Client!, command, { expiresIn })) || '';
}

// ─────────────────────────────────────────────────────────────────────────────
//  Local-disk implementations
// ─────────────────────────────────────────────────────────────────────────────

async function localUpload(
  fileBuffer: Buffer,
  fileName: string,
): Promise<void> {
  const filePath = path.join(UPLOADS_DIR, fileName);
  // Ensure any sub-directories inside uploads/ exist (e.g. "images/photo.png")
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, fileBuffer);
}

async function localDelete(fileName: string): Promise<void> {
  const filePath = path.join(UPLOADS_DIR, fileName);
  try {
    await fs.unlink(filePath);
  } catch (err: unknown) {
    // Ignore "file not found" errors — treat delete as idempotent
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
  }
}

/**
 * For local storage we build a relative public path.
 * Your Express app should serve the uploads folder statically, e.g.:
 *   app.use('/uploads', express.static('uploads'));
 * Then the URL will be something like  http://localhost:3000/uploads/images/foo.jpg
 *
 * `expiresIn` is ignored for local files (no expiry on static assets).
 */
function localGetUrl(key: string): string {
  if (!key) return '';
  if (Config.NODE_ENV !== Env.PRODUCTION) {
    return `http://localhost:${Config.PORT}/uploads/${key}`;
  }
  else {
    const base = Config.DOMAIN.startsWith('https')
      ? Config.DOMAIN
      : `https://api.${Config.DOMAIN}`;
    return `${base}/uploads/${key}`;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Public unified API  (use these everywhere in the codebase)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Upload a file using the configured storage provider.
 *
 * @param fileBuffer  Raw file bytes
 * @param fileName    Key / relative path (e.g. "images/avatar.jpg")
 * @param mimetype    MIME type (e.g. "image/jpeg")
 */
export async function uploadFile(
  fileBuffer: Buffer,
  fileName: string,
  mimetype: string,
): Promise<void> {
  try {
    if (USE_S3) {
      await s3Upload(fileBuffer, fileName, mimetype);
    } else {
      await localUpload(fileBuffer, fileName);
    }
  } catch (err) {
    log.error(`[storage] uploadFile error (${USE_S3 ? 's3' : 'local'}):`, err);
    throw ApiError.pleaseTryAgain();
  }
}

/**
 * Delete a file from the configured storage provider.
 *
 * @param fileName  Key / relative path used when the file was uploaded
 */
export async function deleteFile(fileName: string): Promise<void> {
  try {
    if (USE_S3) {
      await s3Delete(fileName);
    } else {
      await localDelete(fileName);
    }
  } catch (err) {
    log.error(`[storage] deleteFile error (${USE_S3 ? 's3' : 'local'}):`, err);
    throw ApiError.pleaseTryAgain();
  }
}

/**
 * Get a URL to access a stored file.
 *
 * - **S3**: returns a pre-signed URL valid for `expiresIn` seconds.
 * - **Local**: returns a static path like `/uploads/<fileName>`.
 *
 * Returns an empty string when `key` is falsy.
 *
 * @param key        Key / relative path of the file
 * @param expiresIn  S3 pre-signed URL lifetime in seconds (default 3 hours)
 */
export async function getFileUrl(
  key: string | null | undefined,
  expiresIn: number = 10800,
): Promise<string> {
  if (!key) return '';

  try {
    if (USE_S3) {
      return await s3GetUrl(key, expiresIn);
    } else {
      return localGetUrl(key);
    }
  } catch (err) {
    log.error(`[storage] getFileUrl error (${USE_S3 ? 's3' : 'local'}):`, err);
    return '';
  }
}
