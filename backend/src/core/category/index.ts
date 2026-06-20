import mongoose from 'mongoose';
import CategoryModel, { ICategoryDB } from '@/database/models/category';
import { AsyncSafeResult } from '../types';
import { CategoryData, CategoryResult } from './interfaces';
import { ApiFeatures } from '../utils/apiFeatures';
import { ApiError } from '../errors';
import BrandModel from '@/database/models/brand';

// admin api | provider api | customer api
export async function getAllCategories(
  query: Record<string, any>,
  from: 'admin' | 'provider' | 'customer',
): AsyncSafeResult<CategoryResult[]> {
  try {
    if (from !== 'admin') {
      query.isActive = true;
    }

    const categoryQuery = CategoryModel.find();

    const apiFeatures = new ApiFeatures(categoryQuery, query).filter();
    const categories = await apiFeatures.dbQuery;

    const result = categories.map(_formatCategory);

    return { result: result, error: null };
  } catch (err) {
    return { error: err, result: null };
  }
}

// admin api
export async function createCategory(data: CategoryData): AsyncSafeResult<CategoryResult> {
  try {
    const category = await CategoryModel.create({
      name: data.name,
      commissionPerRequest: data.commissionPerRequest,
    });

    return { result: _formatCategory(category), error: null };
  } catch (err) {
    return { error: err, result: null };
  }
}

// admin api
export async function updateCategory(
  categoryId: string,
  data: Partial<CategoryData>,
): AsyncSafeResult<CategoryResult> {
  try {
    const category = await CategoryModel.findByIdAndUpdate(
      categoryId,
      { $set: data },
      { new: true },
    );
    if (!category) throw ApiError.notFoundCategory();

    return { result: _formatCategory(category), error: null };
  } catch (err) {
    return { error: err, result: null };
  }
}

// admin api
export async function removeCategory(mainCategoryId: string): Promise<ApiError | null> {
  try {
    // Fetch the main category
    const category = await CategoryModel.findById(mainCategoryId);
    if (!category) throw ApiError.notFoundCategory();

    // Check if the main category is associated with any brands
    const categoryObjectId = new mongoose.Types.ObjectId(mainCategoryId);
    const associatedBrandsCount = await BrandModel.countDocuments({ categories: categoryObjectId });
    if (associatedBrandsCount > 0) throw ApiError.notAllowed();

    // Delete the main category
    await CategoryModel.findByIdAndDelete(mainCategoryId);

    return null;
  } catch (err) {
    return err;
  }
}

export function _formatCategory(doc: ICategoryDB): CategoryResult {
  return {
    id: doc._id!.toString(),
    name: doc.name,
    commissionPerRequest: doc.commissionPerRequest,
    isActive: doc.isActive,
  };
}
