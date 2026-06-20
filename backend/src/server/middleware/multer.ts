import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';

/**
 * Configures and returns a Multer instance with specific storage and file filter options.
 *
 * The storage is set to memory storage, meaning files will be stored in memory as Buffer objects.
 * The file filter allows only image and video files to be uploaded, based on their MIME types.
 *
 * @returns {multer.Instance} A configured Multer instance for handling file uploads.
 */
const multerOptions = () => {
  const multerStorage = multer.memoryStorage();

  const multerFilter = (_: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (file.mimetype.startsWith('image') || file.mimetype.startsWith('video') || file.mimetype.startsWith('audio')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };

  const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

  return upload;
};

/**
 * Uploads a single file with the specified field name using multer middleware.
 *
 * @param fieldName - The name of the form field that holds the file.
 * @returns A middleware function configured to handle a single file upload.
 */
export function uploadSingleData(fieldName: string) {
  return multerOptions().single(fieldName);
}

/**
 * Configures multer to handle multiple file uploads with specified fields.
 *
 * @param arrayOfFields - An array of objects specifying the fields for file uploads.
 * Each object should have a `name` property (the field name) and an optional `maxCount` property (the maximum number of files for that field).
 *
 * @returns A middleware function configured to handle the specified fields for file uploads.
 */
export function uploadMultiData(arrayOfFields: multer.Field[]) {
  return multerOptions().fields(arrayOfFields);
}
