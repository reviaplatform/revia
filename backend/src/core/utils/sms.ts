import axios, { AxiosResponse } from 'axios';
import Config from '@/config/env';
import { log } from '@/log';

interface beonSmsResponse {
  status: string;
  message: string;
  data: {
    otp: string;
    message_id: number;
  };
}

class SmsServices {
  private beonAccessToken: string;

  constructor() {
    this.beonAccessToken = Config.SMS_ACCESS_TOKEN;
  }

  // Private method to send OTP using Beon provider
  private async beonSendOTP(
    recipientPhoneNumber: string,
    otp: string,
    language: string = 'ar',
  ): Promise<string | null> {
    if (this.beonAccessToken === 'null' || !this.beonAccessToken) {
      log.info(`[MOCK] SMS bypassed for ${recipientPhoneNumber}. OTP is: ${otp}`);
      return otp;
    }
    const payload = {
      phoneNumber: `+2${recipientPhoneNumber}`,
      name: 'Revia',
      type: 'sms',
      otp_length: 6,
      lang: language,
      reference: otp,
      custom_code: otp,
    };

    try {
      const response: AxiosResponse<beonSmsResponse> = await axios.post(
        'https://v3.api.beon.chat/api/v3/messages/otp',
        payload,
        {
          headers: {
            'beon-token': this.beonAccessToken,
          },
        },
      );

      return response.data.status.toString() === '200'
        ? response.data.data.otp.toString() || null
        : null;
    } catch (error) {
      log.error(`Error sending beon OTP: ${error}`);
      return null;
    }
  }

  // Send OTP using SMS Misr provider
  public async sendOTP(
    recipientPhoneNumber: string,
    otp: string,
    language: string,
  ): Promise<boolean> {
    const otpSent = await this.beonSendOTP(recipientPhoneNumber, otp, language);
    if (otpSent) {
      return true;
    }
    return false;
  }

}

export default new SmsServices();
