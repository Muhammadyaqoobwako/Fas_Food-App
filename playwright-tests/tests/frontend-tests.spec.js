const { test, expect } = require('@playwright/test');

test.describe('Fas Food App Frontend E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to the React Native Web frontend (port 8081)
    await page.goto('/');
  });

  test('Verify Login Screen loads successfully [KAN-3]', async ({ page }) => {
    // Verify the main title is visible
    await expect(page.locator('text=Fas Food')).toBeVisible();
    await expect(page.locator('text=Premium Ordering Platform')).toBeVisible();

    // Verify role selection tabs are visible
    await expect(page.locator('text=Customer')).toBeVisible();
    await expect(page.locator('text=Owner / Hotel')).toBeVisible();
    await expect(page.locator('text=Rider')).toBeVisible();
    await expect(page.locator('text=Staff / Admin')).toBeVisible();

    // Verify username and password fields are visible
    const usernameInput = page.locator('input[placeholder="Username"]');
    const passwordInput = page.locator('input[placeholder="Password"]');
    await expect(usernameInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test('Verify Login flow with Owner account and transition to Home/Management [KAN-3]', async ({ page }) => {
    const usernameInput = page.locator('input[placeholder="Username"]');
    const passwordInput = page.locator('input[placeholder="Password"]');
    const signInBtn = page.locator('text="Sign In"');

    // Fill in credentials
    await usernameInput.fill('owner');
    await passwordInput.fill('owner');

    // Click Sign In
    await signInBtn.click();

    // Verify transition to main screen by checking if "Menu" or tabs are visible
    await expect(page.getByRole('heading', { name: 'Menu', exact: true })).toBeVisible();
    await expect(page.locator('text=Manage Store')).toBeVisible();
    await expect(page.locator('text=Analytics')).toBeVisible();
  });

  test('Verify Store Management - Add and Delete Menu Item flow [KAN-3]', async ({ page }) => {
    // 1. Log in as owner
    const usernameInput = page.locator('input[placeholder="Username"]');
    const passwordInput = page.locator('input[placeholder="Password"]');
    const signInBtn = page.locator('text="Sign In"');

    await usernameInput.fill('owner');
    await passwordInput.fill('owner');
    await signInBtn.click();

    // 2. Navigate to Store Management tab
    const manageStoreTab = page.locator('text=Manage Store');
    await expect(manageStoreTab).toBeVisible();
    await manageStoreTab.click();

    // 3. Verify Store Management screen loads
    await expect(page.locator('text=Current Products Catalog')).toBeVisible();

    // 4. Click the '+' button to toggle the add form
    const addToggleBtn = page.getByTestId('add-toggle-button');
    await addToggleBtn.click();

    // 5. Fill out the add menu item form
    const nameField = page.locator('input[placeholder*="Product Name"]');
    const priceField = page.locator('input[placeholder*="Price"]');
    const sizeField = page.locator('input[placeholder*="Size"]');
    const customizationField = page.locator('input[placeholder*="Customizations"]');

    await nameField.fill('E2E Gourmet Burger');
    await priceField.fill('75.50');
    await sizeField.fill('Double Patty');
    await customizationField.fill('Extra Jalapenos, Extra Cheese');

    // Select category (Burger is selected by default, let's select Burger explicitly)
    await page.getByTestId('category-btn-Burger').click();

    // Catch the alert dialog and accept
    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('Product Added');
      await dialog.accept();
    });

    // Click submit
    const submitBtn = page.locator('text=Add Product to Menu');
    await submitBtn.click();

    // 6. Verify the product is added and displayed in the catalog
    await expect(page.locator('text=E2E Gourmet Burger')).toBeVisible();

    // 7. Test delete flow
    // Locate delete button (trash icon) for our added product.
    // Since it's the last product, or we can look for the container containing "E2E Gourmet Burger" and find the trash-outline within it.
    const productCard = page.getByTestId('product-card-E2E Gourmet Burger');
    const deleteBtn = productCard.getByTestId('delete-product-button');

    // Catch the confirm dialog and the confirmation success alert
    page.on('dialog', async dialog => {
      if (dialog.type() === 'confirm') {
        await dialog.accept();
      } else {
        expect(dialog.message()).toContain('deleted'); // or menu item deleted alert
        await dialog.accept();
      }
    });

    await deleteBtn.click();

    // Verify it is removed from the catalog
    await expect(page.locator('text=E2E Gourmet Burger')).not.toBeVisible();
  });
});
