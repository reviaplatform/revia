export interface ProviderAccount {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    role: string;
    languagePreference?: string;
    isBanned?: boolean;
    deletedAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateAccountRequest {
    name: string;
    email: string;
    phoneNumber: string;
    role: string;
    providerRole: string;
    password?: string;
    languagePreference: string;
}

export interface UpdateAccountRequest {
    role?: string;
    providerRole?: string;
    name?: string;
    email?: string;
    phoneNumber?: string;
    languagePreference?: string;
}

export interface AccountListResponse {
    message?: string;
    data: ProviderAccount[] | {
        docs: ProviderAccount[];
        totalDocs?: number;
        limit?: number;
        totalPages?: number;
        page?: number;
    };
}
