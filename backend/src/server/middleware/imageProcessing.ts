import { Request, Response, NextFunction } from 'express';
import sharp from 'sharp';
import { processReelVideo } from '@/core/utils/video';

// Unified quality settings
const QUALITY = {
  HIGH: 82, // For important images (balance quality/size)
  MEDIUM: 78, // For general purpose images
  LOW: 72, // For thumbnails and chat images
  MAX: 88, // Absolute maximum when needed
};

// Common image processing function
const processImage = async (buffer: Buffer, quality: number): Promise<Buffer> => {
  let pipeline = sharp(buffer).toFormat('jpeg').jpeg({
    quality,
    mozjpeg: true, // Better compression
    chromaSubsampling: '4:4:4', // Preserve color details
    progressive: true, // Enable progressive JPEGs
  });

  const maxDimension = getMaxDimension(quality);

  // Get original image metadata
  const metadata = await sharp(buffer).metadata();
  const originalWidth = metadata.width || 0;
  const originalHeight = metadata.height || 0;

  if (maxDimension && originalWidth > 0 && originalHeight > 0) {
    const { targetWidth, targetHeight } = calculateDimensions(
      originalWidth,
      originalHeight,
      maxDimension,
    );

    // Apply resizing
    pipeline = pipeline.resize({
      width: Math.round(targetWidth),
      height: Math.round(targetHeight),
      fit: 'inside', // Preserve aspect ratio
      withoutEnlargement: true, // Don't enlarge smaller images
    });
  }
  return pipeline.toBuffer();
};

const getMaxDimension = (quality: number): { width: number; height: number } => {
  switch (quality) {
    case QUALITY.HIGH:
      return { width: 1920, height: 1080 };
    case QUALITY.MEDIUM:
      return { width: 1200, height: 1200 };
    case QUALITY.LOW:
      return { width: 600, height: 600 };
    default:
      return { width: 2400, height: 3000 };
  }
};

const calculateDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxDimension: { width: number; height: number },
) => {
  const aspectRatio = originalWidth / originalHeight;
  let targetWidth, targetHeight;

  if (aspectRatio > 1) {
    // Landscape image (width > height)
    targetWidth = Math.min(originalWidth, maxDimension.width);
    targetHeight = targetWidth / aspectRatio;
  } else {
    // Portrait or square image (height >= width)
    targetHeight = Math.min(originalHeight, maxDimension.height);
    targetWidth = targetHeight * aspectRatio;
  }

  return { targetWidth, targetHeight };
};

export async function uploadUserProfileImage(
  req: Request,
  _: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (req.file) {
      req.body.picture = await processImage(req.file.buffer, QUALITY.MEDIUM);
    }
    next();
  } catch (err) {
    next(err);
  }
}

export async function uploadBrandImage(
  req: Request,
  _: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (req.file) {
      req.body.brandData.logo = await processImage(req.file.buffer, QUALITY.MEDIUM);
    }
    next();
  } catch (err) {
    next(err);
  }
}

export async function resizeBrandLogo(
  req: Request,
  _: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (req.file) {
      req.body.logo = await processImage(req.file.buffer, QUALITY.MEDIUM);
    }
    next();
  } catch (err) {
    next(err);
  }
}

export async function uploadReelFiles(
  req: Request,
  _: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (files && files['video'] && files['video'][0]) {
      const { videoBuffer, thumbnailBuffer } = await processReelVideo(files['video'][0].buffer);

      req.body.videoBuffer = videoBuffer;
      req.body.videoMimetype = 'video/mp4'; // ffmpeg outputs mp4
      req.body.thumbnailBuffer = await processImage(thumbnailBuffer, QUALITY.MEDIUM);
    }
    next();
  } catch (err) {
    next(err);
  }
}

export async function processChatAttachments(
  req: Request,
  _: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const processedFiles: { buffer: Buffer; mimetype: string }[] = [];

    if (files && files['attachments']) {
      for (const file of files['attachments']) {
        if (file.mimetype.startsWith('image/')) {
          // Optimize image for chat
          const optimized = await processImage(file.buffer, QUALITY.LOW);
          processedFiles.push({ buffer: optimized, mimetype: 'image/jpeg' });
        } else if (file.mimetype.startsWith('audio/')) {
          // Keep audio as is for now, or we could transcode if needed
          processedFiles.push({ buffer: file.buffer, mimetype: file.mimetype });
        }
      }
    }

    req.body.processedFiles = processedFiles;
    next();
  } catch (err) {
    next(err);
  }
}