import { test, expect } from '../fixtures/test';
import { ProductsPage } from '../pages/ProductsPage';
import { ProductDetailsPage } from '../pages/ProductDetailsPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { PaymentPage } from '../pages/PaymentPage';

const PAYMENT_DETAILS = {
  nameOnCard: 'Test User',
  cardNumber: '4111111111111111',
  cvc: '123',
  expiryMonth: '12',
  expiryYear: '2030',
};

test.describe('Checkout', () => {
  test('TC-CHECKOUT-001 - successful order placement end-to-end', async ({
    page,
    registeredUser,
  }) => {
    const detailsPage = new ProductDetailsPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);
    const paymentPage = new PaymentPage(page);

    await detailsPage.goto(1);
    await detailsPage.addToCart();
    await detailsPage.dismissAddedModal();

    await cartPage.goto();
    await cartPage.proceedToCheckout();
    await checkoutPage.placeOrder();

    await expect(page).toHaveURL(/\/payment$/);
    await paymentPage.fillPaymentDetails(PAYMENT_DETAILS);
    await paymentPage.confirmPayment();

    // Confirmed (docs/automation-notes.md, 2026-07-26): exact heading/message text.
    await expect(page).toHaveURL(/\/payment_done\/\d+$/);
    await expect(page.getByText('Order Placed!')).toBeVisible();
    await expect(
      page.getByText('Congratulations! Your order has been confirmed!')
    ).toBeVisible();
  });

  test.describe('TC-CHECKOUT-002 - checkout with an empty cart', () => {
    test('no checkout control exists on an empty cart page', async ({ page, registeredUser }) => {
      const cartPage = new CartPage(page);
      await cartPage.goto();

      await expect(page.getByText('Cart is empty!')).toBeVisible();
      // Confirmed: not disabled - entirely absent from the DOM.
      await expect(page.locator('.check_out')).toHaveCount(0);
    });

    test('BUG-003 - direct URL to /checkout with an empty cart is not blocked', async ({
      page,
      registeredUser,
    }) => {
      await page.goto('/checkout');

      // Documents the confirmed defect (docs/bug-reports/empty-cart-checkout-direct-url.md):
      // no redirect, no "cart is empty" message - the page renders normally with a
      // working "Place Order" attached to a Rs. 0 order.
      await expect(page).toHaveURL(/\/checkout$/);
      await expect(page.getByText('Total Amount')).toBeVisible();
      await expect(page.getByText('Rs. 0')).toBeVisible();
      await expect(page.getByRole('link', { name: 'Place Order' })).toBeVisible();
    });
  });

  test('TC-CHECKOUT-003 - no order history link exists after a completed order', async ({
    page,
    registeredUser,
  }) => {
    const detailsPage = new ProductDetailsPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);
    const paymentPage = new PaymentPage(page);

    await detailsPage.goto(1);
    await detailsPage.addToCart();
    await detailsPage.dismissAddedModal();
    await cartPage.goto();
    await cartPage.proceedToCheckout();
    await checkoutPage.placeOrder();
    await paymentPage.fillPaymentDetails(PAYMENT_DETAILS);
    await paymentPage.confirmPayment();

    // Confirmed: no "My Orders"/"Order History" link anywhere in the nav.
    // "Download Invoice" is scoped to this one order, not a history list, so
    // it's deliberately not treated as a match here.
    const orderLinks = page.locator('.shop-menu a', { hasText: /order/i });
    await expect(orderLinks).toHaveCount(0);
  });

  test('TC-CHECKOUT-004 - quantity is not editable on the checkout page', async ({
    page,
    registeredUser,
  }) => {
    const detailsPage = new ProductDetailsPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await detailsPage.goto(1);
    await detailsPage.setQuantity(2);
    await detailsPage.addToCart();
    await detailsPage.dismissAddedModal();

    await cartPage.goto();
    await cartPage.proceedToCheckout();

    // Confirmed: displayed as static text, not an input field.
    await expect(page.locator('#cart_info_table input[type="number"]')).toHaveCount(0);
    await expect(checkoutPage.orderItemRows().first()).toContainText('2');
  });

  test('TC-CHECKOUT-005 - double-clicking Pay and Confirm Order creates exactly one order', async ({
    page,
    registeredUser,
  }) => {
    const detailsPage = new ProductDetailsPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);
    const paymentPage = new PaymentPage(page);

    await detailsPage.goto(1);
    await detailsPage.addToCart();
    await detailsPage.dismissAddedModal();
    await cartPage.goto();
    await cartPage.proceedToCheckout();
    await checkoutPage.placeOrder();
    await paymentPage.fillPaymentDetails(PAYMENT_DETAILS);

    let paymentPostCount = 0;
    page.on('request', (req) => {
      if (req.url().endsWith('/payment') && req.method() === 'POST') {
        paymentPostCount++;
      }
    });

    // Correction (docs/test-cases/checkout.md, TC-CHECKOUT-005): "Place Order"
    // is a plain nav link, not a submit action - the real order-creating step
    // is this button. Two native clicks dispatched synchronously (not two
    // locator.click() calls, which serialize and can't represent a real rapid
    // double-click) is the same technique used for TC-CART-002/BUG-001.
    await page.evaluate(() => {
      const btn = document.querySelector('[data-qa="pay-button"]') as HTMLButtonElement;
      btn.click();
      btn.click();
    });

    await expect(page).toHaveURL(/\/payment_done\/\d+$/);
    expect(paymentPostCount).toBe(1);
  });

  test('TC-CHECKOUT-006 - reloading the confirmation page does not resubmit the order', async ({
    page,
    registeredUser,
  }) => {
    const detailsPage = new ProductDetailsPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);
    const paymentPage = new PaymentPage(page);

    await detailsPage.goto(1);
    await detailsPage.addToCart();
    await detailsPage.dismissAddedModal();
    await cartPage.goto();
    await cartPage.proceedToCheckout();
    await checkoutPage.placeOrder();
    await paymentPage.fillPaymentDetails(PAYMENT_DETAILS);
    await paymentPage.confirmPayment();

    const confirmationUrl = page.url();

    let postRequestFiredOnReload = false;
    page.on('request', (req) => {
      // Scoped to the app's own origin - defense-in-depth beyond the
      // ad-domain blocking in fixtures/test.ts, after a real CI failure
      // (2026-07-26) where an unrelated third-party POST
      // (pagead2.googlesyndication.com/pagead/ping) tripped this exact
      // assertion. Ad blocking is the primary fix; this scoping means a
      // future unblocked third party can't cause the same false failure.
      if (req.method() === 'POST' && req.url().includes('automationexercise.com')) {
        postRequestFiredOnReload = true;
      }
    });

    await page.reload();

    // Confirmed: the order id is baked into the URL path, so a reload is just
    // a GET/display - no resubmission risk.
    await expect(page).toHaveURL(confirmationUrl);
    await expect(page.getByText('Order Placed!')).toBeVisible();
    expect(postRequestFiredOnReload).toBe(false);
  });
});
