import { AsyncSafeResult } from '@/core/types';
import { ApiError } from '@/core/errors';
import { converToTimeZone } from '@/core/utils/functions';
import { uploadFile, getFileUrl } from '@/core/utils/storage';
import { IBrandDB } from '@/database/models/brand';
import { IProviderDB } from '@/database/models/provider';
import BrandChatSessionModel, { IBrandChatSessionDB } from '@/database/models/brandChatSession';
import { ChatRole } from '@/database/models/chatSession';
import { hasActiveSubscription } from '@/core/subscription';
import { BrandChatSessionResult, SendBrandMessageData } from './interfaces';
import { v4 as uuidv4 } from 'uuid';

// ---------------------------------------------------------------------------
// Internal formatter
// ---------------------------------------------------------------------------
async function _formatSession(doc: IBrandChatSessionDB): Promise<BrandChatSessionResult> {
  const messages = await Promise.all(
    doc.messages.map(async (msg) => {
      let content = msg.content;
      if (msg.type === 'image' || msg.type === 'voice') {
        content = await getFileUrl(msg.content);
      }
      return {
        role: msg.role,
        content,
        type: msg.type,
        mimetype: msg.mimetype,
        createdAt: converToTimeZone(msg.createdAt),
      };
    }),
  );

  return {
    id: doc._id!.toString(),
    brandId: doc.brandId.toString(),
    providerId: doc.providerId.toString(),
    messages,
    createdAt: converToTimeZone(doc.createdAt),
    updatedAt: converToTimeZone(doc.updatedAt),
  };
}

// ---------------------------------------------------------------------------
// Internal: Initialize a new session for a specific provider
// ---------------------------------------------------------------------------
async function _initializeSession(brand: IBrandDB, provider: IProviderDB): Promise<IBrandChatSessionDB> {
  return BrandChatSessionModel.create({
    brandId: brand._id,
    providerId: provider._id,
  });
}

// ---------------------------------------------------------------------------
// Get the latest session for this provider, or create one if none exists
// ---------------------------------------------------------------------------
export async function getBrandChatSession(
  brand: IBrandDB,
  provider: IProviderDB,
): AsyncSafeResult<BrandChatSessionResult> {
  try {
    let session = await BrandChatSessionModel.findOne({
      brandId: brand._id,
      providerId: provider._id,
    }).sort({ createdAt: -1 });

    if (!session) {
      // Auto-create on first login — check subscription first
      const subCheck = await hasActiveSubscription(brand._id.toString());
      if (subCheck.error) throw subCheck.error;
      if (!subCheck.result) throw ApiError.subscriptionRequired();

      session = await _initializeSession(brand, provider);
    }

    return { result: await _formatSession(session), error: null };
  } catch (err) {
    return { error: err, result: null };
  }
}

// ---------------------------------------------------------------------------
// Send a message in the provider's own session
// ---------------------------------------------------------------------------
export async function sendBrandMessage(
  brand: IBrandDB,
  provider: IProviderDB,
  data: SendBrandMessageData,
): AsyncSafeResult<BrandChatSessionResult> {
  try {
    const subCheck = await hasActiveSubscription(brand._id.toString());
    if (subCheck.error) throw subCheck.error;
    if (!subCheck.result) throw ApiError.subscriptionRequired();

    let session = await BrandChatSessionModel.findOne({
      brandId: brand._id,
      providerId: provider._id,
    }).sort({ createdAt: -1 });

    if (!session) {
      session = await BrandChatSessionModel.create({
        brandId: brand._id,
        providerId: provider._id,
      });
    }

    const newUserParts: any[] = [];

    if (data.content && data.content.trim() !== '') {
      session.messages.push({
        role: ChatRole.USER,
        content: data.content.trim(),
        type: 'text',
        createdAt: new Date(),
      });
      newUserParts.push({ text: data.content.trim() });
    }

    if (data.file) {
      const isVoice = data.file.mimetype.startsWith('audio/');
      const fileType = isVoice ? 'voice' : 'image';
      const ext = data.file.mimetype.split('/')[1] || (isVoice ? 'webm' : 'jpg');
      const fileName = `brand-chat/${session._id}/${uuidv4()}.${ext}`;
      await uploadFile(data.file.buffer, fileName, data.file.mimetype);

      session.messages.push({
        role: ChatRole.USER,
        content: fileName,
        type: fileType,
        mimetype: data.file.mimetype,
        createdAt: new Date(),
      });

      newUserParts.push({
        inlineData: {
          mimeType: data.file.mimetype,
          data: data.file.buffer.toString('base64'),
        },
      });
    }

    if (newUserParts.length === 0) {
      return { result: await _formatSession(session), error: null };
    }

    await session.save();

    return { result: await _formatSession(session), error: null };
  } catch (err) {
    return { error: err, result: null };
  }
}

// ---------------------------------------------------------------------------
// Start / reset — creates a brand-new session for this provider
// ---------------------------------------------------------------------------
export async function startBrandChatSession(
  brand: IBrandDB,
  provider: IProviderDB,
): AsyncSafeResult<BrandChatSessionResult> {
  try {
    const subCheck = await hasActiveSubscription(brand._id.toString());
    if (subCheck.error) throw subCheck.error;
    if (!subCheck.result) throw ApiError.subscriptionRequired();

    const session = await _initializeSession(brand, provider);

    return { result: await _formatSession(session), error: null };
  } catch (err) {
    return { error: err, result: null };
  }
}
