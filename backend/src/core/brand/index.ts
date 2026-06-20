import BrandModel, { IBrandDB } from '@/database/models/brand';
import { AsyncSafeResult } from '../types';
import { BrandData, BrandResultInAdmin, BrandResultInProvider, BrandResultInUser } from './interfaces';
import { ApiFeatures } from '../utils/apiFeatures';
import CategoryModel, { ICategoryDB } from '@/database/models/category';
import { deleteFile, getFileUrl, uploadFile } from '../utils/storage';
import { converToTimeZone } from '../utils/functions';
import { v4 as uuidv4 } from 'uuid';
import { ApiError } from '../errors';

// admin api
export async function getAllBrands(
  query: Record<string, any>,
): AsyncSafeResult<BrandResultInAdmin[]> {
  try {
    const brandQuery = BrandModel.find().populate('categories').sort('-createdAt');

    const apiFeatures = new ApiFeatures(brandQuery, query).filter().searchBrand().paginate();
    const brands = await apiFeatures.dbQuery;

    const result = await Promise.all(brands.map(_formatBrandInAdmin));

    return { result, error: null };
  } catch (error) {
    return { error, result: null };
  }
}

// signup provider api
export async function createBrand(data: BrandData): AsyncSafeResult<BrandResultInAdmin> {
  const filename = `brand-${uuidv4()}-${Date.now()}.jpeg`;

  try {
    // Validate main category existence
    for (const category of data.categories) {
      const mainCategory = await CategoryModel.findById(category);
      if (!mainCategory) throw ApiError.notFoundCategory();
    }

    // Create the brand
    const brand = await BrandModel.create({
      name: data.name,
      logo: filename,
      crn: data.crn,
      tin: data.tin,
      categories: data.categories,
      branches: data.branches ? data.branches : [],
      tags: data.tags ? data.tags : [],
      allowPayUsePOS: data.allowPayUsePOS,
    });

    // Upload logo to S3
    await uploadFile(data.logo as Buffer, filename, 'image/jpeg');

    // Populate categories for the created brand
    await brand.populate('categories');

    return { result: await _formatBrandInAdmin(brand), error: null };
  } catch (err) {
    // Clean up uploaded file in case of an error
    await deleteFile(filename);

    return { error: err, result: null };
  }
}

// provider api
export async function updateBrand(
  brand: IBrandDB,
  data: Partial<BrandData>,
): AsyncSafeResult<BrandResultInProvider> {
  const filename = data.logo ? `brand-${uuidv4()}-${Date.now()}.jpeg` : null;

  try {
    // Handle logo update
    if (data.logo && filename) {
      await deleteFile(brand.logo);
      await uploadFile(data.logo as Buffer, filename, 'image/jpeg');
      brand.logo = filename;
    }

    if (data.name) {
      brand.name = data.name;
    }
    if (data.allowPayUsePOS !== undefined) {
      brand.allowPayUsePOS = data.allowPayUsePOS;
    }
    if (data.tags) {
      brand.tags = data.tags;
    }

    // Save the updated brand
    await brand.save();

    // Populate necessary fields
    await brand.populate('categories');

    // Format and return the result
    return {
      result: await _formatBrandInProvider(brand),
      error: null,
    };
  } catch (err) {
    // Cleanup uploaded logo in case of an error
    if (filename) await deleteFile(filename);

    return { error: err, result: null };
  }
}

// admin api
export async function banBrand(brandId: string): Promise<ApiError | null> {
  try {
    const brand = await BrandModel.findById(brandId);
    if (!brand) throw ApiError.notFoundBrand();

    if (brand.deletedAt) return null; // Brand is already marked as deleted

    // Mark the brand as deleted
    brand.deletedAt = new Date();

    // Save the updated brand
    await brand.save();

    return null;
  } catch (err) {
    return err;
  }
}

// admin api
export async function unBanBrand(brandId: string): Promise<ApiError | null> {
  try {
    const brand = await BrandModel.findById(brandId);
    if (!brand) throw ApiError.notFoundBrand();

    if (!brand.deletedAt) return null; // Brand is already active

    // Reset the deletedAt field
    brand.deletedAt = undefined as unknown as Date;

    // Save the updated brand
    await brand.save();

    return null;
  } catch (err) {
    return err;
  }
}

// admin api
export async function approveBrand(brandId: string): Promise<ApiError | null> {
  try {
    const brand = await BrandModel.findById(brandId);
    if (!brand) throw ApiError.notFoundBrand();

    if (brand.approvedAt) return null; // Brand is already approved

    // Reset the approvedAt field
    brand.approvedAt = new Date();

    // Save the updated brand
    await brand.save();

    return null;
  } catch (err) {
    return err;
  }
}

// provider api
export async function addBranch(
  brand: IBrandDB,
  branchData: {
    name: { en: string; ar: string };
    location: { longitude: number; latitude: number };
    isActive?: boolean;
  },
): AsyncSafeResult<BrandResultInProvider> {
  try {
    // Add the new branch to the branches array
    brand.branches.push({
      name: branchData.name,
      location: branchData.location,
      isActive: branchData.isActive !== undefined ? branchData.isActive : true,
    });

    // Save the updated brand
    await brand.save();

    // Populate categories
    await brand.populate('categories');

    return {
      result: await _formatBrandInProvider(brand),
      error: null,
    };
  } catch (err) {
    return { error: err, result: null };
  }
}

// provider api
export async function updateBranch(
  brand: IBrandDB,
  branchIndex: number,
  branchData: Partial<{
    name: { en: string; ar: string };
    location: { longitude: number; latitude: number };
    isActive: boolean;
  }>,
): AsyncSafeResult<BrandResultInProvider> {
  try {
    // Validate branch index
    if (branchIndex < 0 || branchIndex >= brand.branches.length) {
      throw ApiError.invalidBranchIndex();
    }

    // Update branch fields if provided
    if (branchData.name) {
      brand.branches[branchIndex].name = branchData.name;
    }
    if (branchData.location) {
      brand.branches[branchIndex].location = branchData.location;
    }
    if (branchData.isActive !== undefined) {
      brand.branches[branchIndex].isActive = branchData.isActive;
    }

    // Mark the branches array as modified for Mongoose to detect changes
    brand.markModified('branches');

    // Save the updated brand
    await brand.save();

    // Populate categories
    await brand.populate('categories');

    return {
      result: await _formatBrandInProvider(brand),
      error: null,
    };
  } catch (err) {
    return { error: err, result: null };
  }
}

async function _formatBrandInAdmin(doc: IBrandDB): Promise<BrandResultInAdmin> {
  return {
    id: doc._id!.toString(),
    logo: await getFileUrl(doc.logo),
    name: doc.name,
    crn: doc.crn,
    tin: doc.tin,
    branches: doc.branches,
    tags: doc.tags,
    allowPayUsePOS: doc.allowPayUsePOS,
    completedRepairs: doc.completedRepairs,
    rating: doc.rating,
    ratingCount: doc.ratingCount,
    categories: (doc.categories as unknown as ICategoryDB[]).map((category: ICategoryDB) => {
      return {
        name: category.name,
        commissionPerRequest: category.commissionPerRequest,
      };
    }),
    approvedAt: doc.approvedAt ? converToTimeZone(doc.approvedAt) : null,
    deletedAt: doc.deletedAt ? converToTimeZone(doc.deletedAt) : null,
    createdAt: converToTimeZone(doc.createdAt),
    updatedAt: converToTimeZone(doc.updatedAt),
  };
}

export async function _formatBrandInProvider(doc: IBrandDB): Promise<BrandResultInProvider> {
  return {
    id: doc._id!.toString(),
    logo: await getFileUrl(doc.logo),
    name: doc.name,
    crn: doc.crn,
    tin: doc.tin,
    branches: doc.branches,
    tags: doc.tags,
    allowPayUsePOS: doc.allowPayUsePOS,
    completedRepairs: doc.completedRepairs,
    rating: doc.rating,
    ratingCount: doc.ratingCount,
    categories: (doc.categories as unknown as ICategoryDB[]).map((category: ICategoryDB) => {
      return {
        id: category._id!.toString(),
        name: category.name,
        commissionPerRequest: category.commissionPerRequest,
      };
    }),
  };
}

export async function _formatBrandInUser(doc: IBrandDB, language: 'en' | 'ar'): Promise<BrandResultInUser> {
  return {
    id: doc._id!.toString(),
    logo: await getFileUrl(doc.logo),
    name: language == 'en' ? doc.name.en : doc.name.ar,
    completedRepairs: doc.completedRepairs,
    rating: doc.rating,
    ratingCount: doc.ratingCount,
  };
}
