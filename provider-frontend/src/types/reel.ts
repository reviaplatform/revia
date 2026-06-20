export interface ReelCaption {
    en: string;
    ar: string;
}

export interface Reel {
    id: string;
    videoUrl: string;
    thumbnailUrl?: string;
    caption: ReelCaption;
    isVisible: boolean;
    createdAt: string;
    tags: string[];
    likesCount?: number;
    viewsCount?: number;
    sharesCount?: number;
}

export interface UpdateReelRequest {
    caption?: ReelCaption;
    isVisible?: boolean;
    tags?: string[];
}
