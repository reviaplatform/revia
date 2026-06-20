export interface BrandChatMessageResult {
  role: string;
  content: string;
  type: string;
  mimetype?: string;
  createdAt: string;
}

export interface BrandChatSessionResult {
  id: string;
  brandId: string;
  providerId: string;
  messages: BrandChatMessageResult[];
  createdAt: string;
  updatedAt: string;
}

export interface SendBrandMessageData {
  content?: string;
  file?: Express.Multer.File;
}
