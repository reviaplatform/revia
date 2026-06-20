import Config, { Env } from '@/config/env';
import { ApiError } from '../../errors';
import { log } from '@/log';
import axios, { AxiosResponse } from 'axios';

interface KashierGeneralResponse {
  response: any;
  messages: {
    en: string;
    ar: string;
  };
  status: 'SUCCESS' | 'FAILURE';
}

interface KashierCreatePaymentSessionResponse {
  status: string;
  failureAttempts: number;
  capturedAmount: number;
  refundedAmount: number;
  _id: string;
  merchantId: string;
  expireAt: string;
  maxFailureAttempts: number;
  paymentParams: {
    display: string;
    paymentType: string;
    amount: number;
    currency: string;
    order: string;
    merchantRedirect: string;
    type: string;
    allowedMethods: string;
    redirectMethod: string | null;
    iframeBackgroundColor: string;
    metaData: {
      [key: string]: any;
    };
    failureRedirect: boolean;
    brandColor: string;
    defaultMethod: string;
    description: string;
    manualCapture: boolean;
    customer: {
      email: string;
      reference: string;
    };
    saveCard: string;
    retrieveSavedCard: boolean;
    interactionSource: string;
    enable3DS: boolean;
    serverWebhook: string;
    notes: string;
    storeName?: string;
    store?: string;
    originalAmount?: number;
    hash?: string;
  };
  apiKey: string;
  history: Array<{
    status: string;
    date: string;
  }>;
  apmTraceId: string;
  webhookNotifications: any[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  sessionUrl: string;
}

interface KashierRefundPaymentResponse {
  response: {
    apiOperation: 'REFUND';
    operation: 'refund';
    currency: 'EGP';
    result: 'SUCCESS' | string;
    status: 'REFUNDED' | string;
    authorizationNumber: string;
    amount: number;
    creationTime: string;
    lastUpdatedTime: string;
    merchantCurrency: string;
    reference: string;
    totalAuthorizedAmount: number;
    totalCapturedAmount: number;
    totalDisbursedAmount: number;
    totalRefundedAmount: number;
    authentication: Record<string, unknown>;
    paymentMethod: {
      type: string;
      card: {
        cardBrand: string;
        number: string;
        nameOnCard: string;
        expiry: {
          month: string;
          year: string;
        };
      };
    };
    metaData: {
      [key: string]: any;
      customKey?: string;
      displayNotes?: Record<string, any>;
      'kashier payment UI version'?: string;
      termsAndConditions?: {
        ip: string;
      };
    };
    customer: {
      email: string;
      reference: string;
    };
    reconciliation: {
      webhookUrl: string;
      redirect: boolean;
    };
    merchantId: string;
    order: {
      amount: number;
      currency: string;
      originalAmount: number;
      callbackURL: string;
      systemOrderId: string;
      reference: string;
    };
    apiKeyId: string;
    method: string;
    creationDate: string;
    orderId: string;
    provider: string;
    merchantOrderId: string;
    orderReference: string;
    interactionSource: string;
    device: {
      browserDetails: {
        javaEnabled: boolean;
        language: string;
        screenHeight: number;
        screenWidth: number;
        timeZone: number;
        colorDepth: number;
        '3DSecureChallengeWindowSize': string;
      };
      browser: string;
      ipAddress: string;
    };
    transactionId: string;
    transactionResponseCode: string;
    transactionResponseMessage: {
      en: string;
      ar: string;
    };
  };
  messages: {
    en: string;
    ar: string;
  };
  status: 'SUCCESS' | 'FAILURE';
  statusCode: number;
}

export class KashierPaymentServices {
  private webhook_url: string;
  private redirection_url: string;

  constructor() {
    /*
    this.base = Config.DOMAIN.startsWith('https')
      ? Config.DOMAIN
      : `https://api.${Config.DOMAIN}`

    if (Config.NODE_ENV === Env.PRODUCTION) {
      this.webhook_url = `${this.base}/api/v1/webhook/kashier/payment-webhook`;
      this.redirection_url = `https://${Config.DOMAIN}/payment/status`;
    } else if (Config.NODE_ENV === Env.STAGING) {
      this.webhook_url = `${this.base}/api/v1/webhook/kashier/payment-webhook`;
      this.redirection_url = `https://${Config.DOMAIN}/payment/status`;
    } else {
      this.webhook_url = `${this.base}/api/v1/webhook/kashier/payment-webhook`;
      this.redirection_url = `https://${Config.DOMAIN}/payment/status`;
    }
    */

    this.webhook_url = `https://lightsalmon-ibis-912038.hostingersite.com/api/v1/webhook/kashier/payment-webhook`;
    this.redirection_url = `https://www.reviaplatform.me/payment/status`;
  }

  public async getKashierPaymentData(orderId: string): Promise<any> {
    try {
      const getPaymentUrl =
        Config.NODE_ENV == Env.PRODUCTION
          ? `https://api.kashier.io/payments/orders/${orderId}`
          : `https://test-api.kashier.io/payments/orders/${orderId}`;

      const response: AxiosResponse<KashierGeneralResponse> = await axios.get(getPaymentUrl, {
        headers: {
          Authorization: Config.KASHIER_SECRET_KEY,
          'Content-Type': 'application/json',
        },
      });

      if (response.data.status == 'FAILURE') {
        log.error(
          `Failed to fetch payment data for order ${orderId}: ${JSON.stringify(response.data.messages)}`,
        );
        throw ApiError.pleaseTryAgain();
      }

      return response.data.response;
    } catch (err: any) {
      log.error(
        `Error fetching payment data for order ${orderId}: ${JSON.stringify(err?.response?.data) || JSON.stringify(err)}`,
      );

      throw ApiError.pleaseTryAgain();
    }
  }

  public async createKashierPaymentSessionsLink(
    user: any,
    amount: number,
    paymentReference: string,
  ): Promise<{ orderId: string; sessionId: string; sessionUrl: string }> {
    try {
      const createPaymentSessionsLinkUrl =
        Config.NODE_ENV == Env.PRODUCTION
          ? 'https://api.kashier.io/v3/payment/sessions'
          : 'https://test-api.kashier.io/v3/payment/sessions';

      const payload = {
        expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h expiry
        maxFailureAttempts: 5,
        amount: amount.toString(),
        currency: 'EGP',
        order: paymentReference,
        merchantId: Config.KASHIER_MERCHANT_ID,
        metaData: {
          'Customer Name': user.fullName,
          'Customer Phone': `${user.phoneCountryCode} ${user.phoneNumber}`,
          'Customer Email': user.email,
        },
        description: 'Revia',
        defaultMethod: 'card',
        merchantRedirect: this.redirection_url,
        serverWebhook: this.webhook_url,
        redirectMethod: 'get',
        failureRedirect: false,
        iframeBackgroundColor: '#FFFFFF',
        brandColor: '#3b82f6',
        display: user.languagePreference.toLowerCase() == 'ar' ? 'ar' : 'en',
        manualCapture: false,
        customer: {
          email: user.email,
          reference: user.id.toString(),
        },
        saveCard: 'optional',
        retrieveSavedCard: true,
        enable3DS: true,
        notes: '',
        interactionSource: 'ECOMMERCE',
        paymentType: 'credit',
      };

      const response: AxiosResponse<KashierGeneralResponse> = await axios.post(
        createPaymentSessionsLinkUrl,
        payload,
        {
          headers: {
            Authorization: Config.KASHIER_SECRET_KEY.replace(/\\/g, ''),
            'api-key': Config.KASHIER_API_KEY,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.data.status === 'FAILURE') {
        log.error(`Failed to create payment session: ${JSON.stringify(response.data.messages)}`);
        throw ApiError.pleaseTryAgain();
      }

      const responseData = response.data as unknown as KashierCreatePaymentSessionResponse;

      return {
        orderId: paymentReference,
        sessionId: responseData._id,
        sessionUrl: responseData.sessionUrl,
      };
    } catch (err: any) {
      log.error(
        `Error creating payment session: ${JSON.stringify(err?.response?.data) || JSON.stringify(err)}`,
      );

      throw ApiError.pleaseTryAgain();
    }
  }

  public async refundKashierPayment(
    orderId: string,
    refundAmount: number,
    reason: string,
  ): Promise<KashierRefundPaymentResponse> {
    try {
      const refundPaymentUrl =
        Config.NODE_ENV == Env.PRODUCTION
          ? `https://fep.kashier.io/v3/orders/${orderId}`
          : `https://test-fep.kashier.io/v3/orders/${orderId}`;

      const payload = {
        apiOperation: 'REFUND',
        reason: reason,
        transaction: {
          amount: Number(refundAmount),
        },
      };

      const response: AxiosResponse<KashierRefundPaymentResponse> = await axios.put(
        refundPaymentUrl,
        payload,
        {
          headers: {
            Authorization: Config.KASHIER_SECRET_KEY,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.data.status === 'FAILURE') {
        log.error(`Failed to refund payment: ${JSON.stringify(response.data.messages)}`);
        throw ApiError.pleaseTryAgain();
      }

      return response.data;
    } catch (err: any) {
      log.error(
        `Error refunding payment: ${JSON.stringify(err?.response?.data) || JSON.stringify(err)}`,
      );

      throw ApiError.pleaseTryAgain();
    }
  }
}
