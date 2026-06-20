import { AsyncSafeResult } from "@/core/types";
import { CustomerData, CustomerResult } from "./interfaces";
import CustomerModel, { CustomerStatus, ICustomerDB } from "@/database/models/customer";
import { ApiFeatures } from "@/core/utils/apiFeatures";
import { ApiError } from "@/core/errors";
import { deleteFile, getFileUrl, uploadFile } from "@/core/utils/storage";
import { converToTimeZone } from "@/core/utils/functions";
import { v4 as uuidv4 } from 'uuid';

// admin api
export async function getAllCustomers(query: Record<string, any>): AsyncSafeResult<CustomerResult[]> {
    try {
        const customerQuery = CustomerModel.find().sort('-createdAt');
        const apiFeatures = new ApiFeatures(customerQuery, query).filter().searchAccounts().paginate();
        const Customers = await apiFeatures.dbQuery;

        const result = await Promise.all(Customers.map(user => _formatUser(user)));

        return { result, error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}

// admin api
export async function getCustomer(userId: string): AsyncSafeResult<CustomerResult> {
    try {
        const user = await CustomerModel.findById(userId);
        if (!user) throw ApiError.notFoundUser();

        return { result: await _formatUser(user), error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}

// admin api
export async function createCustomer(data: CustomerData): AsyncSafeResult<CustomerResult> {
    try {
        const existingUser = await CustomerModel.findOne({
            $or: [{ phoneNumber: data.phoneNumber }, { email: data.email }],
        });
        if (existingUser) throw ApiError.duplicateUser();

        const user = await CustomerModel.create({
            name: data.name,
            phoneNumber: data.phoneNumber,
            email: data.email ?? null,
            languagePreference: data.languagePreference,
            gender: data.gender,
            birthday: data.birthday ?? null,
            location: data.location ?? null,
        });

        return { result: await _formatUser(user), error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}

// app api
export async function updateCustomer(
    user: ICustomerDB,
    data: Partial<CustomerData>,
): AsyncSafeResult<CustomerResult> {
    const filename = `CustomerProfile-${uuidv4()}-${Date.now()}.jpeg`;

    try {
        if (data.email) {
            const existingUser = await CustomerModel.findOne({
                email: data.email,
                _id: { $ne: user._id },
            });
            if (existingUser) throw ApiError.duplicateMail();
        }

        if (data.picture) {
            if (user.picture) await deleteFile(user.picture);

            await uploadFile(data.picture as Buffer, filename, 'image/jpeg');
            data.picture = filename;
        }

        Object.assign(user, data);

        await user.save();

        return { result: await _formatUser(user), error: null };
    } catch (err) {
        if (data.picture) await deleteFile(filename);

        return { error: err, result: null };
    }
}

// admin api - app api
export async function adminUpdateCustomer(
    userId: string,
    data: Partial<CustomerData>,
): AsyncSafeResult<CustomerResult> {
    const filename = `userProfile-${uuidv4()}-${Date.now()}.jpeg`;

    try {
        const user = await CustomerModel.findById(userId);
        if (!user) throw ApiError.notFoundUser();

        if (data.email) {
            const existingUser = await CustomerModel.findOne({
                email: data.email,
                _id: { $ne: user._id },
            });
            if (existingUser) throw ApiError.duplicateMail();
        }

        if (data.picture) {
            if (user.picture) await deleteFile(user.picture);

            await uploadFile(data.picture as Buffer, filename, 'image/jpeg');
            data.picture = filename;
        }

        const newUser = await CustomerModel.findByIdAndUpdate(userId, { $set: data }, { new: true });

        return { result: await _formatUser(newUser!), error: null };
    } catch (err) {
        if (data.picture) await deleteFile(filename);

        return { error: err, result: null };
    }
}

// app api
export async function deleteCustomer(user: ICustomerDB): Promise<ApiError | null> {
    try {
        if (user.status == CustomerStatus.DELETED) return null;


        user.deletedAt = new Date();
        user.status = CustomerStatus.DELETED;
        await user.save();

        return null;
    } catch (err) {
        return err;
    }
}

// admin api
export async function restoreCustomer(userId: string): Promise<ApiError | null> {
    try {
        const user = await CustomerModel.findById(userId);
        if (!user) throw ApiError.notFoundUser();

        if (user.status != CustomerStatus.DELETED) throw ApiError.UserAccountMustDeleted();

        user.deletedAt = undefined as unknown as Date;
        user.status = CustomerStatus.ACTIVE;
        await user.save();

        return null;
    } catch (err) {
        return err;
    }
}

// admin api
export async function banCustomer(userId: string): Promise<ApiError | null> {
    try {
        const user = await CustomerModel.findById(userId);
        if (!user) throw ApiError.notFoundUser();

        if (user.status == CustomerStatus.DELETED) throw ApiError.UserDeleteAccount();

        if (user.deletedAt) return null;

        user.deletedAt = new Date();
        user.status = CustomerStatus.BANNED;
        await user.save();

        return null;
    } catch (err) {
        return err;
    }
}

// admin api
export async function unBanCustomer(userId: string): Promise<ApiError | null> {
    try {
        const user = await CustomerModel.findById(userId);
        if (!user) throw ApiError.notFoundUser();

        if (user.status == CustomerStatus.DELETED) throw ApiError.UserDeleteAccount();

        if (!user.deletedAt) return null;

        user.deletedAt = undefined as unknown as Date;
        user.status = CustomerStatus.ACTIVE;
        await user.save();

        return null;
    } catch (err) {
        return err;
    }
}

export async function _formatUser(doc: ICustomerDB): Promise<CustomerResult> {
    return {
        id: doc._id!.toString(),
        name: doc.name,
        picture: doc.picture ? await getFileUrl(doc.picture) : null,
        phoneNumber: doc.phoneNumber,
        status: doc.status,
        email: doc.email,
        languagePreference: doc.languagePreference || 'en',
        gender: doc.gender,
        birthday: doc.birthday,
        location: doc.location,
        deletedAt: doc.deletedAt ? converToTimeZone(doc.deletedAt) : null,
        lastLoginAt: converToTimeZone(doc.lastLoginAt),
        createdAt: converToTimeZone(doc.createdAt),
    };
}
