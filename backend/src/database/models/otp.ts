import mongoose, { Schema, Document } from 'mongoose';

export enum OTPType {
  PHONE_VERIFICATION = 1,
  EMAIL_VERIFICATION,
  FORGOT_PASSWORD,
}

export interface IOTPDB extends Document {
  code: string;
  email?: string;
  phoneNumber?: string;
  expireAt: Date;
  otpType: OTPType;
  createdAt: Date;
  updatedAt: Date;
}

const otpSchema = new Schema<IOTPDB>(
  {
    code: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    expireAt: {
      type: Date,
      required: true,
      index: { expires: '15m' },
    },
    otpType: {
      type: Number,
      required: true,
      enum: [OTPType.PHONE_VERIFICATION, OTPType.EMAIL_VERIFICATION, OTPType.FORGOT_PASSWORD],
    },
  },
  { timestamps: true, strict: true },
);

otpSchema.index({ email: 1, otpType: 1 });
otpSchema.index({ phoneNumber: 1, otpType: 1 });

const OTPModel = mongoose.model<IOTPDB>('OTP', otpSchema);

export default OTPModel;
