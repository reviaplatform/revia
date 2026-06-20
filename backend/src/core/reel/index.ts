import { AsyncSafeResult } from '../types';
import ReelModel, { IReelDB } from '@/database/models/reel';
import ReelLikeModel from '@/database/models/reelLike';
import { ReelResult } from './interfaces';
import { deleteFile, getFileUrl, uploadFile } from '../utils/storage';
import { v4 as uuidv4 } from 'uuid';
import { IBrandDB } from '@/database/models/brand';
import { converToTimeZone } from '../utils/functions';

// Provider APIs
export async function createReel(
  brand: IBrandDB,
  data: { caption: { en: string; ar: string }; tags?: string[]; video: Buffer; videoMimetype: string; thumbnail: Buffer },
): AsyncSafeResult<ReelResult> {
  const videoExt = data.videoMimetype.split('/')[1] || 'mp4';
  const videoName = `reel-video-${uuidv4()}-${Date.now()}.${videoExt}`;
  const thumbnailName = `reel-thumb-${uuidv4()}-${Date.now()}.jpeg`;

  try {
    // Upload files
    await uploadFile(data.video, videoName, data.videoMimetype);
    await uploadFile(data.thumbnail, thumbnailName, 'image/jpeg');

    const reel = await ReelModel.create({
      brand: brand._id,
      video: videoName,
      thumbnail: thumbnailName,
      caption: data.caption,
      tags: data.tags ?? [],
    });

    await reel.populate('brand');

    return { result: await _formatReel(reel), error: null };
  } catch (err) {
    // Cleanup
    await deleteFile(videoName);
    await deleteFile(thumbnailName);

    return { error: err, result: null };
  }
}

export async function updateReel(
  reel: IReelDB,
  data: { caption?: { en: string; ar: string }; tags?: string[]; isVisible?: boolean },
): AsyncSafeResult<ReelResult> {
  try {
    if (data.caption) reel.caption = data.caption;
    if (data.tags !== undefined) reel.tags = data.tags;
    if (data.isVisible !== undefined) reel.isVisible = data.isVisible;

    await reel.save();

    await reel.populate('brand');

    return { result: await _formatReel(reel), error: null };
  } catch (err) {
    return { error: err, result: null };
  }
}

export async function deleteReel(reel: IReelDB): AsyncSafeResult<null> {
  try {
    reel.deletedAt = new Date();

    await reel.save();

    return { result: null, error: null };
  } catch (err) {
    return { error: err, result: null };
  }
}

export async function getBrandReels(brandId: string): AsyncSafeResult<ReelResult[]> {
  try {
    const reels = await ReelModel.find({ brand: brandId, deletedAt: null })
      .populate('brand')
      .sort('-createdAt');

    const result = await Promise.all(reels.map((r) => _formatReel(r)));

    return { result, error: null };
  } catch (err) {
    return { error: err, result: null };
  }
}

// User APIs
export async function getUserReels(
  customerId: string | null,
  identifier: string,
  query: { page?: number; limit?: number },
): AsyncSafeResult<ReelResult[]> {
  try {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    // Use identifier + daily date to create a stable but changing seed
    const today = new Date().toISOString().slice(0, 10);
    const seed = `${identifier}-${today}`;

    // 1. Get all visible and not deleted reel IDs
    const allReels = await ReelModel.find({ isVisible: true, deletedAt: null }, { _id: 1 }).sort({
      _id: 1,
    });
    const reelIds = allReels.map((r) => r._id.toString());

    if (reelIds.length === 0) {
      return { result: [], error: null };
    }

    // 2. Deterministic shuffle based on seed
    const shuffledIds = _shuffleWithSeed(reelIds, seed);

    // 3. Paginate
    const paginatedIds = shuffledIds.slice(skip, skip + limit);

    if (paginatedIds.length === 0) {
      return { result: [], error: null };
    }

    // 4. Fetch full documents for the paginated IDs
    // We fetch and then re-sort according to shuffledIds order
    const reels = await ReelModel.find({ _id: { $in: paginatedIds } }).populate('brand');

    // Restore the shuffled order
    const orderMap = new Map(paginatedIds.map((id, index) => [id, index]));
    reels.sort((a, b) => {
      return orderMap.get(a._id.toString())! - orderMap.get(b._id.toString())!;
    });

    const result = await Promise.all(reels.map((r) => _formatReel(r, customerId)));

    return { result, error: null };
  } catch (err) {
    return { error: err, result: null };
  }
}

// Simple seeded random number generator
function _seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Fisher-Yates shuffle with seed
function _shuffleWithSeed<T>(array: T[], seed: string): T[] {
  const copy = [...array];
  // Generate a number from string seed
  let seedNum = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(_seededRandom(seedNum) * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
    seedNum++; // Change seed for next pick
  }
  return copy;
}

export async function likeReel(reelId: string, customerId: string): AsyncSafeResult<null> {
  try {
    const existingLike = await ReelLikeModel.findOne({ reel: reelId, customer: customerId });
    if (existingLike) return { result: null, error: null };

    await ReelLikeModel.create({ reel: reelId, customer: customerId });

    await ReelModel.findByIdAndUpdate(reelId, { $inc: { likesCount: 1 } });

    return { result: null, error: null };
  } catch (err) {
    return { error: err, result: null };
  }
}

export async function unlikeReel(reelId: string, customerId: string): AsyncSafeResult<null> {
  try {
    const existingLike = await ReelLikeModel.findOneAndDelete({ reel: reelId, customer: customerId });
    if (!existingLike) return { result: null, error: null };

    await ReelModel.findByIdAndUpdate(reelId, { $inc: { likesCount: -1 } });

    return { result: null, error: null };
  } catch (err) {
    return { error: err, result: null };
  }
}

export async function recordView(reelId: string): AsyncSafeResult<null> {
  try {
    await ReelModel.findByIdAndUpdate(reelId, { $inc: { viewsCount: 1 } });

    return { result: null, error: null };
  } catch (err) {
    return { error: err, result: null };
  }
}

// Internal formatting
export async function _formatReel(doc: IReelDB, customerId: string | null = null): Promise<ReelResult> {
  let isLiked = false;
  if (customerId) {
    const like = await ReelLikeModel.findOne({ reel: doc._id, customer: customerId });
    isLiked = !!like;
  }

  const brandDoc = doc.brand as any;
  const isBrandPopulated = brandDoc && typeof brandDoc === 'object' && brandDoc.name;

  return {
    id: doc._id!.toString(),
    video: await getFileUrl(doc.video),
    thumbnail: await getFileUrl(doc.thumbnail),
    caption: doc.caption,
    tags: doc.tags ?? [],
    likesCount: doc.likesCount,
    viewsCount: doc.viewsCount,
    isVisible: doc.isVisible,
    isLiked,
    brand: isBrandPopulated
      ? {
        id: brandDoc._id!.toString(),
        name: brandDoc.name,
        logo: await getFileUrl(brandDoc.logo),
      }
      : undefined,
    createdAt: converToTimeZone(doc.createdAt),
  };
}
