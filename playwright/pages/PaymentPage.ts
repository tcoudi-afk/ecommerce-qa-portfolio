import { Page } from '@playwright/test';

export class PaymentPage {
  constructor(private page: Page) {}

  private nameOnCardInput = () => this.page.getByTestId('name-on-card');
  private cardNumberInput = () => this.page.getByTestId('card-number');
  private cvcInput = () => this.page.getByTestId('cvc');
  private expiryMonthInput = () => this.page.getByTestId('expiry-month');
  private expiryYearInput = () => this.page.getByTestId('expiry-year');
  private payButton = () => this.page.getByTestId('pay-button');

  async fillPaymentDetails(details: {
    nameOnCard: string;
    cardNumber: string;
    cvc: string;
    expiryMonth: string;
    expiryYear: string;
  }) {
    await this.nameOnCardInput().fill(details.nameOnCard);
    await this.cardNumberInput().fill(details.cardNumber);
    await this.cvcInput().fill(details.cvc);
    await this.expiryMonthInput().fill(details.expiryMonth);
    await this.expiryYearInput().fill(details.expiryYear);
  }

  async confirmPayment() {
    await this.payButton().click();
  }
}
