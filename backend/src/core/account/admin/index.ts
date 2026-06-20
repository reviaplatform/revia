import bcrypt from 'bcrypt';
import { AsyncSafeResult, PASSWORD_SALT_ROUNDS } from "@/core/types";
import { AdminData, AdminResult } from "./interfaces";
import AdminModel, { IAdminDB } from "@/database/models/admin";
import { ApiFeatures } from "@/core/utils/apiFeatures";
import { converToTimeZone, generateStrongPassword } from "@/core/utils/functions";
import { ApiError } from "@/core/errors";

// admin api
export async function getAllAdmins(
    query: Record<string, any>,
    adminId: string,
): AsyncSafeResult<AdminResult[]> {
    try {
        const adminQuery = AdminModel.find({ _id: { $ne: adminId } })
            .select('+password')
            .sort('-createdAt');

        const apiFeatures = new ApiFeatures(adminQuery, query).filter().searchAccounts().paginate();
        const admins = await apiFeatures.dbQuery;

        const result = admins.map(_formatAdmin);

        return { result: result, error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}

// admin api
export async function getAdmin(adminId: string): AsyncSafeResult<AdminResult> {
    try {
        const admin = await AdminModel.findById(adminId).select('+password');
        if (!admin) throw ApiError.notFoundAdmin();

        return { result: _formatAdmin(admin), error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}

// admin api
export async function createAdmin(data: AdminData): AsyncSafeResult<AdminResult> {
    try {
        const adminExist = await AdminModel.findOne({
            $or: [{ phoneNumber: data.phoneNumber }, { email: data.email }],
        });
        if (adminExist) throw ApiError.duplicateAdmin();

        const password = generateStrongPassword();
        const hashedPassword = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);

        const admin = await AdminModel.create({
            name: data.name,
            email: data.email,
            phoneNumber: data.phoneNumber,
            role: data.role,
            password: hashedPassword,
        });

        return { result: _formatAdmin(admin), error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}

// admin api
export async function updateAdmin(
    adminId: string,
    data: Partial<AdminData>,
): AsyncSafeResult<AdminResult> {
    try {
        if (data.password) {
            data.password = await bcrypt.hash(data.password, PASSWORD_SALT_ROUNDS);
            // When admin updates another admin's password, force them to reset on next login
            (data as any).resetPasswordAt = new Date();
        }

        const admin = await AdminModel.findByIdAndUpdate(adminId, { $set: data }, { new: true });
        if (!admin) throw ApiError.notFoundAdmin();

        return { result: _formatAdmin(admin), error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}

// admin api
export async function banAdmin(adminId: string): Promise<ApiError | null> {
    try {
        const admin = await AdminModel.findById(adminId);
        if (!admin) throw ApiError.notFoundAdmin();

        if (admin.deletedAt) return null;

        admin.deletedAt = new Date();
        await admin.save();

        return null;
    } catch (err) {
        return err;
    }
}

// admin api
export async function unBanAdmin(adminId: string): Promise<ApiError | null> {
    try {
        const admin = await AdminModel.findById(adminId);
        if (!admin) throw ApiError.notFoundAdmin();

        if (!admin.deletedAt) return null;

        admin.deletedAt = null;
        await admin.save();

        return null;
    } catch (err) {
        return err;
    }
}

export function _formatAdmin(doc: IAdminDB): AdminResult {
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
    };
}