import { ICustomerDB } from '@/database/models/customer';
import { ApiError } from '../../errors';
import { KashierPaymentServices } from './kashier';

class PaymentServices {
  private kashierService: KashierPaymentServices;

  constructor() {
    this.kashierService = new KashierPaymentServices();
  }

  public async createPaymentLink(
    user: ICustomerDB,
    paymentId: string,
    amount: number,
  ): Promise<string> {
    try {
      let finalPaymentUrl: string = '';

      const paymentReference = `${paymentId.toString()}|${Date.now().toString()}`;

      const { sessionUrl } = await this.kashierService.createKashierPaymentSessionsLink(
        user,
        amount,
        paymentReference,
      );

      finalPaymentUrl = sessionUrl;

      return finalPaymentUrl;
    } catch (err) {
      throw ApiError.pleaseTryAgain();
    }
  }
}

export default new PaymentServices();
