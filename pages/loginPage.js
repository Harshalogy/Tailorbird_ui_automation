const { expect } = require('@playwright/test');
const { Logger } = require('../utils/logger');

class LoginPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;

    // Locators
    this.emailInput = page.locator('input[name="email"], input[type="email"]');
    this.passwordInput = page.locator('input[name="password"], input[type="password"]');
    this.continueButton = page.locator('button[type="submit"]:has-text("Continue")');
    this.signInButton = page.locator('button[name="intent"]:has-text("Sign in")');
    this.errorMessage = page.locator('.error, .form-error');
    this.organizationSelect = page.locator("button:has-text('Tailorbird_QA_Automations')");
  }

  /**
   * Navigates to the login page.
   */
  async goto() {
    const LOGIN_URL = process.env.LOGIN_URL || 'https://stalwart-collection-11-staging.authkit.app/';
    Logger.step(`Navigating to login page: ${LOGIN_URL}`);
    await this.page.goto(LOGIN_URL, { waitUntil: 'load' });
  }

  /**
   * Performs login using provided email and password.
   * @param {string} email 
   * @param {string} password 
   */
  async login(email, password) {
    Logger.step('Step 1: Entering Email...');
    await this.emailInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.emailInput.fill(email);

    Logger.step('Step 2: Clicking Continue...');
    await Promise.all([
      this.page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      this.continueButton.click()
    ]);

    Logger.step('Step 3: Waiting for password input...');
    await this.passwordInput.waitFor({ state: 'visible', timeout: 15000 });
    await this.passwordInput.fill(password);

    Logger.step('Step 4: Clicking Sign in...');
    await Promise.all([
      this.page.waitForNavigation({ waitUntil: 'networkidle' }),
      this.signInButton.click()
    ]);

    Logger.step('Step 6: Verifying successful login...');
    await this.page.waitForTimeout(5000);
    await this.organizationSelect.click();

    Logger.step('Step 6: Verifying successful login...');
    await this.page.waitForTimeout(5000);
    await expect(this.page).toHaveURL(process.env.DASHBOARD_URL || /financials\/capex/);
    Logger.success('✅ User successfully logged in and redirected to dashboard.');
  }

  /**
   * Checks if login error is visible.
   * @returns {Promise<boolean>}
   */
  async isLoginErrorVisible() {
    Logger.step('Checking for login error message...');
    return this.errorMessage.isVisible();
  }
}

module.exports = { LoginPage };
