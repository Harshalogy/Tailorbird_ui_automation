require('dotenv').config();

const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/loginPage');
const { Logger } = require('../utils/logger');

test.describe('Tailorbird Login Flow', () => {

  let context;
  let page;
  let login;

  test('@sanity User should be able to submit credentials successfully', async ({ browser }) => {
    Logger.info('Starting Tailorbird login test...');

    context = await browser.newContext();
    page = await context.newPage();
    login = new LoginPage(page);

    await test.step('Go to login page', async () => {
      Logger.step('Navigating to login URL...');
      await page.goto(process.env.LOGIN_URL, { waitUntil: 'load' });
    });

    await test.step('Perform login', async () => {
      Logger.step('Using credentials from .env...');
      await login.login(process.env.TEST_EMAIL, process.env.TEST_PASSWORD);
    });

    await test.step('Store Session', async () => {
      await page.context().storageState({ path: 'sessionState.json' });
      Logger.success('💾 Session stored successfully at sessionState.json');
    });

    await test.step('Close Context', async () => {
      await context.close();
    });
  });

  test('@sanity User should be able to navigate to dashboard successfully', async ({ browser }) => {
    Logger.info('Verifying dashboard navigation after login...');

    context = await browser.newContext({ storageState: 'sessionState.json' });
    page = await context.newPage();
    login = new LoginPage(page);

    await test.step('Navigate to dashboard URL', async () => {
      Logger.step('Navigating to dashboard using stored session...');
      await page.goto(process.env.DASHBOARD_URL, { waitUntil: 'load' });
      await expect(page).toHaveURL(process.env.DASHBOARD_URL);
      Logger.success('✅ User navigated to dashboard successfully!');
    });

    await test.step('Close Context', async () => {
      await context.close();
    });
  });

});
