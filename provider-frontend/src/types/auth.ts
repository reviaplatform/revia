export interface LoginResponse {
    message: string;
    data: {
        accessToken: string;
        refreshToken?: string;
    };
}

export interface ProviderData {
    name: string;
    email: string;
    phoneNumber: string;
    password?: string;
}

export interface BrandBranch {
    name: {
        en: string;
        ar: string;
    };
    location: {
        latitude: number;
        longitude: number;
    };
}

export interface BrandData {
    name: {
        en: string;
        ar: string;
    };
    crn: string;
    tin: string;
    allowPayUsePOS: boolean;
    branches: BrandBranch[];
    categories: string[];
}
