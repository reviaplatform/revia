// src/lib/api/types.ts

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface AuthSession {
  accessToken: string;
  access_token?: string;
  refreshToken?: string;
  refresh_token?: string;
  expiresIn?: number;
  accessTokenExpireTime?: string;
  refreshTokenExpireTime?: string;
}

export interface PreRegToken {
  registerToken: string;
}

export interface OtpResponse {
  user: number; // 0 = new (register), 1 = existing (login)
  message?: string;
}

export interface User {
  id: string;
  phoneNumber: string;
  name: string;
  gender: "male" | "female";
  email: string;
  birthday: string;
  languagePreference: "en" | "ar";
  createdAt: string;
  updatedAt?: string;
  location?: {
    latitude: number;
    longitude: number;
  } | null;
}

export type Profile = User;

export interface Device {
  id: string;
  customerId?: string;
  category: {
    id: string;
    name: {
      en: string;
      ar: string;
    };
  };
  name: string;
  manufacturer: string;
  deviceModel: string;
  platform: string;
  osVersion?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDevicePayload {
  categoryId: string;
  name: string;
  manufacturer: string;
  platform: string;
  deviceModel: string;
  osVersion?: string;
}

export type UpdateDevicePayload = Partial<CreateDevicePayload>;

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Category {
  id: string;
  name: {
    en: string;
    ar: string;
  };
  commissionPerRequest?: number;
  description?: string;
  icon?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export enum RepairRequestFlow {
  DIRECT = 'direct',
  AI_CHAT = 'ai_chat',
}

export enum RepairRequestStatus {
  AI_ASSESSING = 'ai_assessing',
  PENDING_BRAND_SELECTION = 'pending_brand_selection',
  PENDING_OFFERS = 'pending_offers',
  OFFER_SELECTED = 'offer_selected',
  INSPECTION_PENDING = 'inspection_pending',
  INSPECTION_DONE = 'inspection_done',
  PAYMENT_PENDING = 'payment_pending',
  PAYMENT_DONE = 'payment_done',
  PENDING_PROVIDER_REPAIR = 'pending_provider_repair',
  PENDING_USER_DEVICE_PICKUP = 'pending_user_device_pickup',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface StatusLog {
  status: RepairRequestStatus;
  timestamp: string;
}

export interface RepairRequest {
  id: string;
  customerId: string;
  deviceId: string;
  deviceName: string;
  issueText: string;
  flow: RepairRequestFlow;
  status: RepairRequestStatus;
  aiReport: string[];
  statusLogs: StatusLog[];
  createdAt: string;
  isReview: boolean;
  review?: {
    rating: number;
    comment: string;
    createdAt: string;
  };
  selectedOfferId?: string | null;
  device?: Device;
}

export interface CreateRepairPayload {
  deviceId: string;
  issueText: string;
  flow: 'direct' | 'ai_chat';
  attachments?: File[];
}

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  repairRequestId?: string;
  createdAt: string;
  type?: 'text' | 'image' | 'voice' | 'system';
  mimetype?: string;
  timestamp?: string; // Keeping for compatibility
}

export interface ChatSession {
  id: string;
  repairRequestId: string;
  customerId: string;
  messages: ChatMessage[];
  isFinished: boolean;
  aiReport: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatFinishedPayload {
  repairRequestId: string;
  diagnosticReport: string[];
  isFinished: boolean;
}

export interface OfferItem {
  expectedIssue: string;
  priceRange: {
    min: number;
    max: number;
  };
  expectedFinishDate: string;
}

export interface OfferBrand {
  id: string;
  logo: string;
  name: string;
  completedRepairs: number;
  rating: number;
  ratingCount: number;
}

export interface Offer {
  id: string;
  repairRequestId: string;
  brand: OfferBrand;
  offerItems: OfferItem[];
  distanceKm: number;
  inspectionPrice: number;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  createdAt: string;
}

export interface Payment {
  id: string;
  requestId: string;
  type: 'inspection' | 'final';
  amount: number;
  status: 'pending' | 'success' | 'failed';
  method: 'card' | 'wallet' | 'cash';
  transactionReference?: string;
}

export interface Reel {
  id: string;
  title: string | { en: string; ar: string };
  description?: string | { en: string; ar: string };
  creatorName?: string;
  videoUrl: string;
  thumbnailUrl: string;
  video?: string;      // Compatibility for different backend versions
  thumbnail?: string;  // Compatibility for different backend versions
  likesCount: number;
  viewsCount: number;
  isLiked: boolean;
  createdAt: string;
}


export enum SupportTicketStatus {
    OPEN = 'OPEN',
    IN_PROGRESS = 'IN_PROGRESS',
    RESOLVED = 'RESOLVED',
    CLOSED = 'CLOSED',
}

export enum SupportTicketPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
}

export enum SupportTicketSenderType {
    CUSTOMER = 'Customer',
    BRAND = 'Brand',
}

export interface SupportTicket {
    id: string;
    senderType: SupportTicketSenderType;
    customerId?: string;
    customerName?: string;
    brandId?: string;
    brandName?: string;
    subject: string;
    message: string;
    status: SupportTicketStatus;
    priority: SupportTicketPriority;
    adminNote?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateSupportTicketPayload {
  subject: string;
  message: string;
  priority?: SupportTicketPriority;
}

// API Response Wrappers
export interface SupportTicketResponse {
    status: 'success' | 'error';
    data: SupportTicket;
}

export interface SupportTicketsListResponse {
    status: 'success' | 'error';
    data: SupportTicket[];
}
