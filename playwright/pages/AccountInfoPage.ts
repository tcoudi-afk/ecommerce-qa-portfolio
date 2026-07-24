import { Page } from '@playwright/test';

export class AccountInfoPage {
  constructor(private page: Page) {}

  private passwordInput = () => this.page.locator('#password');
  private firstNameInput = () => this.page.locator('#first_name');
  private lastNameInput = () => this.page.locator('#last_name');
  private address1Input = () => this.page.locator('#address1');
  private stateInput = () => this.page.locator('#state');
  private cityInput = () => this.page.locator('#city');
  private zipcodeInput = () => this.page.locator('#zipcode');
  private mobileNumberInput = () => this.page.locator('#mobile_number');
  private createAccountButton = () => this.page.getByTestId('create-account');
  private continueButton = () => this.page.getByTestId('continue-button');

  // No 'private' here, unlike the fields above — the test needs to assert on
  // this element directly (TC-LOGIN-001 checks the confirmation is shown),
  // and assertions live in the test, not in the page object. This is the
  // first locator in the POM layer that a test needs to reach, so it's
  // worth a second look in review: is "expose it, no wrapper method" the
  // right convention going forward, or should it be a getter method instead?
  accountCreatedHeading = () => this.page.getByTestId('account-created');

  // Marker for "we're on /signup and it succeeded" — confirmed baseline
  // (2026-07-24): the app redirects to /signup on BOTH success and email-
  // already-exists, so URL alone can't distinguish them. Presence/absence of
  // this heading is the actual discriminator.
  accountInfoHeading = () => this.page.getByText('Enter Account Information');

  async fillAccountInfo(details: {
    password: string;
    firstName: string;
    lastName: string;
    address1: string;
    state: string;
    city: string;
    zipcode: string;
    mobileNumber: string;
  }) {
    await this.passwordInput().fill(details.password);
    await this.firstNameInput().fill(details.firstName);
    await this.lastNameInput().fill(details.lastName);
    await this.address1Input().fill(details.address1);
    await this.stateInput().fill(details.state);
    await this.cityInput().fill(details.city);
    await this.zipcodeInput().fill(details.zipcode);
    await this.mobileNumberInput().fill(details.mobileNumber);
  }

  async createAccount() {
    await this.createAccountButton().click();
  }

  async continueAfterAccountCreated() {
    await this.continueButton().click();
  }
}
