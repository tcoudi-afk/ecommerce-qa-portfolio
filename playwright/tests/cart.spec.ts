import { test, expect } from '../fixtures/test';
import { ProductsPage } from '../pages/ProductsPage';
import { ProductDetailsPage } from '../pages/ProductDetailsPage';
import { CartPage } from '../pages/CartPage';
import { LoginPage } from '../pages/LoginPage';
import { NavBar } from '../pages/components/NavBar';

test.describe('Cart', () => {
  test('TC-CART-001 - no header cart count/price badge exists', async ({ page, registeredUser }) => {
    const productsPage = new ProductsPage(page);
    await productsPage.goto();

    // Add two different products, same as the exploration script - the
    // number of items shouldn't matter for this test, but matches the
    // documented steps in docs/test-cases/cart.md.
    await page.locator('.productinfo a.add-to-cart').nth(0).click();
    await page.getByRole('button', { name: 'Continue Shopping' }).click();
    await page.locator('.productinfo a.add-to-cart').nth(1).click();
    await page.getByRole('button', { name: 'Continue Shopping' }).click();

    // Scoped to .shop-menu - a[href="/view_cart"] alone also matches the
    // "View Cart" link inside the "Added!" modal body, which stays in the
    // DOM after the modal is dismissed (confirmed in the exploration run).
    const navCartLink = page.locator('.shop-menu a[href="/view_cart"]');
    const text = (await navCartLink.textContent())?.trim();

    // Confirmed (docs/automation-notes.md, 2026-07-26): no dynamic
    // count/price badge exists anywhere in the header - just an icon and
    // the static word "Cart".
    expect(text).toBe('Cart');
  });

  test('TC-CART-002 - adding the same item twice increments quantity to 2', async ({
    page,
    registeredUser,
  }) => {
    // BUG-001 (quantity stays at 1) was retracted on 2026-07-26 after a
    // network-level trace showed both "Add to cart" clicks independently
    // succeed and correctly increment quantity - see
    // docs/bug-reports/cart-duplicate-add-quantity.md and
    // docs/exploration/findings-cart-002-network.json. No retries needed
    // here - this isn't flaky, it's a confirmed, deterministic behaviour.
    const detailsPage = new ProductDetailsPage(page);
    const cartPage = new CartPage(page);

    await detailsPage.goto(1);
    await detailsPage.addToCart();
    await detailsPage.dismissAddedModal();

    await detailsPage.goto(1);
    await detailsPage.addToCart();
    await detailsPage.dismissAddedModal();

    await cartPage.goto();
    await expect(cartPage.getItemQuantity()).resolves.toContain('2');
  });

  test('TC-CART-003 - cart persists after logout and re-login', async ({ page, registeredUser }) => {
    const productsPage = new ProductsPage(page);
    const cartPage = new CartPage(page);
    const navBar = new NavBar(page);
    const loginPage = new LoginPage(page);

    await productsPage.goto();
    await page.locator('.productinfo a.add-to-cart').first().click();
    await page.getByRole('button', { name: 'Continue Shopping' }).click();

    await navBar.logout();
    await loginPage.goto();
    await loginPage.login(registeredUser.email, registeredUser.password);

    await cartPage.goto();
    const rows = await cartPage.getRows();

    // Confirmed: cart is tied to the account, not the anonymous session -
    // contents reappear after logging back in.
    expect(rows).toHaveLength(1);
  });

  test('TC-CART-004 - cart state survives a page reload', async ({ page, registeredUser }) => {
    const detailsPage = new ProductDetailsPage(page);
    const cartPage = new CartPage(page);

    await detailsPage.goto(1);
    await detailsPage.setQuantity(2);
    await detailsPage.addToCart();
    await detailsPage.dismissAddedModal();

    await cartPage.goto();
    const beforeReload = await cartPage.getRows();

    await page.reload();
    const afterReload = await cartPage.getRows();

    // Confirmed: quantity/price/total are unchanged by a reload.
    expect(afterReload).toEqual(beforeReload);
  });

  test('TC-CART-005 - removing an item updates the cart correctly', async ({
    page,
    registeredUser,
  }) => {
    const detailsPage = new ProductDetailsPage(page);
    const cartPage = new CartPage(page);

    await detailsPage.goto(1);
    await detailsPage.addToCart();
    await detailsPage.dismissAddedModal();
    await detailsPage.goto(2);
    await detailsPage.addToCart();
    await detailsPage.dismissAddedModal();

    await cartPage.goto();
    const beforeDelete = await cartPage.getRows();
    expect(beforeDelete).toHaveLength(2);

    await cartPage.deleteFirstItem();
    await page.locator('#product-1').waitFor({ state: 'detached' });

    const afterDelete = await cartPage.getRows();

    // Confirmed: the removed row is gone, and the remaining row's own data
    // is untouched. There is no cart-wide grand total to check separately -
    // see TC-CART-001/005 in docs/test-cases/cart.md.
    expect(afterDelete).toHaveLength(1);
    expect(afterDelete[0]).toEqual(
      beforeDelete.find((row) => row.rowId !== 'product-1')
    );
  });
});
