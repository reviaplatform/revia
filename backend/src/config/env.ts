// Enum for different environment types
export enum Env {
  LOCAL = 'local',
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  STAGING = 'staging',
}

// Configuration object to hold environment variables
const Config = {
  PORT: Number(process.env['PORT']!), // Server port
  NODE_ENV: process.env['NODE_ENV']!.toString(), // Node environment
  MONGODB_URI: process.env['MONGODB_URI']!.toString(), // MongoDB connection URI

  ADMIN_ACCESS_TOKEN_KEY: process.env['ADMIN_ACCESS_TOKEN_KEY']!.toString(), // Admin access token key
  ADMIN_ACCESS_TOKEN_EXP: process.env['ADMIN_ACCESS_TOKEN_EXP']!.toString(), // Admin access token expiration
  PROVIDER_ACCESS_TOKEN_KEY: process.env['PROVIDER_ACCESS_TOKEN_KEY']!.toString(), // Provider access token key
  PROVIDER_ACCESS_TOKEN_EXP: process.env['PROVIDER_ACCESS_TOKEN_EXP']!.toString(), // Provider access token expiration
  USER_ACCESS_TOKEN_KEY: process.env['USER_ACCESS_TOKEN_KEY']!.toString(), // User access token key
  USER_ACCESS_TOKEN_EXP: process.env['USER_ACCESS_TOKEN_EXP']!.toString(), // User access token expiration
  USER_REFRESH_TOKEN_KEY: process.env['USER_REFRESH_TOKEN_KEY']!.toString(), // User refresh token key
  USER_REFRESH_TOKEN_EXP: process.env['USER_REFRESH_TOKEN_EXP']!.toString(), // User refresh token expiration
  REGISTER_ACCESS_TOKEN_KEY: process.env['REGISTER_ACCESS_TOKEN_KEY']!.toString(), // Register access token key
  REGISTER_ACCESS_TOKEN_EXP: process.env['REGISTER_ACCESS_TOKEN_EXP']!.toString(), // Register access token expiration

  EMAIL_SENDER: process.env['EMAIL_SENDER']!.toString(), // Email sender
  EMAIL_SENDER_NAME: process.env['EMAIL_SENDER_NAME']!.toString(), // Email sender name
  EMAIL_SENDER_PASSWORD: process.env['EMAIL_SENDER_PASSWORD']!.toString(), // Email sender password

  SMS_ACCESS_TOKEN: process.env['SMS_ACCESS_TOKEN']!.toString(), // Beon access token

  // Storage provider: 's3' | 'local'  (default: 's3')
  STORAGE_PROVIDER: (process.env['STORAGE_PROVIDER'] ?? 's3').toString() as 's3' | 'local',

  S3_BUCKET_NAME: (process.env['S3_BUCKET_NAME'] ?? '').toString(), // S3 bucket name
  S3_REGION: (process.env['S3_REGION'] ?? '').toString(), // S3 region
  S3_ACCESS_KEY_ID: (process.env['S3_ACCESS_KEY_ID'] ?? '').toString(), // S3 access key id
  S3_SECRET_ACCESS_KEY: (process.env['S3_SECRET_ACCESS_KEY'] ?? '').toString(), // S3 secret access key

  DOMAIN: process.env['DOMAIN']!.toString(),

  KASHIER_SECRET_KEY: process.env['KASHIER_SECRET_KEY']!.toString(),
  KASHIER_API_KEY: process.env['KASHIER_API_KEY']!.toString(),
  KASHIER_MERCHANT_ID: process.env['KASHIER_MERCHANT_ID']!.toString(),

  GEMINI_API_KEY: process.env['GEMINI_API_KEY']!.toString(),
  SUPABASE_URL: (process.env['SUPABASE_URL'] ?? '').toString(),
  SUPABASE_ANON_KEY: (process.env['SUPABASE_ANON_KEY'] ?? '').toString(),
};

export default Config;
