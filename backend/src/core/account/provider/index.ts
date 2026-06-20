import { AsyncSafeResult, PASSWORD_SALT_ROUNDS } from '@/core/types';
import bcrypt from 'bcrypt';
import { ProviderData, ProviderResult } from './interfaces';
import ProviderModel, { IProviderDB } from '@/database/models/provider';
import { ApiFeatures } from '@/core/utils/apiFeatures';
import { ApiError } from '@/core/errors';
import { converToTimeZone, generateStrongPassword } from '@/core/utils/functions';
import { IBrandDB } from '@/database/models/brand';

// admin api | provider api
export async function getAllProviders(
  query: Record<string, any>,
  providerId?: string,
  brandId?: string,
): AsyncSafeResult<ProviderResult[]> {
  try {
    const providerQuery = providerId
      ? ProviderModel.find({ _id: { $ne: providerId }, brandId })
        .populate('brandId')
        .select('+password')
        .sort('-createdAt')
      : ProviderModel.find().populate('brandId').select('+password').sort('-createdAt');

    const apiFeatures = new ApiFeatures(providerQuery, query).filter().searchAccounts().paginate();
    const providers = await apiFeatures.dbQuery;

    const result = providers.map(_formatProvider);

    return { result: result, error: null };
  } catch (err) {
    return { error: err, result: null };
  }
}

// provider api
export async function createProvider(data: ProviderData): AsyncSafeResult<ProviderResult> {
  try {
    const providerExist = await ProviderModel.findOne({
      $or: [{ phoneNumber: data.phoneNumber }, { email: data.email }],
    });
    if (providerExist) throw ApiError.duplicateProvider();

    const password = generateStrongPassword();
    const hashedPassword = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);

    const provider = await ProviderModel.create({
      name: data.name,
      email: data.email,
      phoneNumber: data.phoneNumber,
      role: data.role,
      password: hashedPassword,
      brandId: data.brandId,
      lastLoginAt: new Date(),
      languagePreference: data.languagePreference,
    });

    return { result: _formatProvider(provider), error: null };
  } catch (err) {
    return { error: err, result: null };
  }
}

// provider api
export async function providerUpdateProvider(
  providerData: IProviderDB,
  providerId: string,
  data: Partial<ProviderData>,
): AsyncSafeResult<ProviderResult> {
  try {
    const provider = await ProviderModel.findById(providerId);
    if (!provider) throw ApiError.notFoundProvider();

    if (providerData.brandId.toString() !== provider.brandId.toString()) throw ApiError.unauthorized();

    if (data.email) {
      const existingProvider = await ProviderModel.findOne({
        email: data.email,
      });
      if (existingProvider) throw ApiError.duplicateMail();
    }

    Object.assign(provider, data);

    await provider.save();

    return { result: _formatProvider(provider), error: null };
  } catch (err) {
    return { error: err, result: null };
  }
}

// provider api
export async function updateProvider(
  provider: IProviderDB,
  data: Partial<ProviderData>,
): AsyncSafeResult<ProviderResult> {
  try {
    if (data.email) {
      const existingProvider = await ProviderModel.findOne({
        email: data.email,
        _id: { $ne: provider._id },
      });
      if (existingProvider) throw ApiError.duplicateMail();
    }

    Object.assign(provider, data);

    await provider.save();

    return { result: await _formatProvider(provider), error: null };
  } catch (err) {
    return { error: err, result: null };
  }
}

// provider api
export async function banProvider(
  providerData: IProviderDB,
  providerId: string,
): Promise<ApiError | null> {
  try {
    const provider = await ProviderModel.findById(providerId);
    if (!provider) throw ApiError.notFoundProvider();

    if (providerData.brandId.toString() !== provider.brandId.toString()) throw ApiError.unauthorized();

    if (provider.deletedAt) return null;

    provider.deletedAt = new Date();
    await provider.save();

    return null;
  } catch (err) {
    return err;
  }
}

// provider api
export async function unBanProvider(
  providerData: IProviderDB,
  providerId: string,
): Promise<ApiError | null> {
  try {
    const provider = await ProviderModel.findById(providerId);
    if (!provider) throw ApiError.notFoundProvider();

    if (providerData.brandId.toString() !== provider.brandId.toString()) throw ApiError.unauthorized();

    if (!provider.deletedAt) return null;

    provider.deletedAt = null;
    await provider.save();

    return null;
  } catch (err) {
    return err;
  }
}

export function _formatProvider(doc: IProviderDB): ProviderResult {
  return {
    id: doc._id!.toString(),
    name: doc.name,
    email: doc.email,
    phoneNumber: doc.phoneNumber,
    lastLoginAt: converToTimeZone(doc.lastLoginAt),
    deletedAt: doc.deletedAt ? converToTimeZone(doc.deletedAt) : null,
    role: doc.role,
    languagePreference: doc.languagePreference,
    createdAt: converToTimeZone(doc.createdAt),
    brand: (doc.brandId as unknown as IBrandDB).name
      ? (doc.brandId as unknown as IBrandDB).name
      : null,
  };
}
