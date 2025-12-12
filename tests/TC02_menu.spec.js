require('dotenv').config();
const { test, expect } = require('@playwright/test');
const { Logger } = require('../utils/logger');
const helper = require('../pages/leftPanel');
const locators = require('../locators/leftPanelLocator');
const data = require('../fixture/leftPanel.json');

let page;

test.use({
  storageState: 'sessionState.json'
});

test.beforeEach(async ({ page: testPage }) => {
    page = testPage;

    Logger.info(`Navigating to dashboard: ${process.env.DASHBOARD_URL}`);
    await page.goto(process.env.DASHBOARD_URL, { waitUntil: 'load' });
    await page.waitForLoadState('networkidle');
    Logger.info('Dashboard loaded successfully.');
});

test.afterAll(async () => {
    Logger.info('Closing browser context...');
});


test.describe('Tailorbird Left Panel Flow - Modular', () => {

    test('TC03 @sanity Verify all menu options are available', async () => {
        const actualLabels = await helper.getLeftPanelLabels(page);

        if (actualLabels.length === 0)
            throw new Error('Left panel labels not found.');

        for (const label of data.expectedLabels) {
            expect(actualLabels).toContain(label);
            Logger.info(`✅ Label matched: "${label}"`);
        }
    });

    test('TC04 @sanity Verify all menu navigation', async () => {
        const actualLabels = await helper.getLeftPanelLabels(page);
        expect(actualLabels.length).toBeGreaterThan(0);

        for (const item of data.menuItems) {
            const { label, url } = item;

            expect(actualLabels).toContain(label);
            Logger.info(`✔ Menu item located: ${label}`);

            const menuLocator = page.locator(
                `a.mantine-NavLink-root:has(span.mantine-NavLink-label:has-text("${label}"))`
            );

            await menuLocator.click({ timeout: 5000 });

            await expect(page).toHaveURL(new RegExp(url.replace(/\//g, "\\/")));
            Logger.info(`🌍 Navigation Valid → "${label}" → matches URL: ${url}`);
        }

        Logger.info("\n🎉 All Sidebar Menu Navigation Validated Successfully\n");
    });

    test('TC05 @sanity Verify main menu toggle functionality', async () => {
        const toggleBtn = page.locator(locators.firstLeftPanelToggle).first();
        await expect(toggleBtn).toHaveCount(1);

        const beforeAttr = await toggleBtn.getAttribute('aria-expanded');
        Logger.info('[Before Click] aria-expanded = ' + beforeAttr);

        await toggleBtn.click();
        await page.waitForTimeout(200);
        const after1 = await toggleBtn.getAttribute('aria-expanded');
        Logger.info('[After 1st Click] aria-expanded = ' + after1);

        await toggleBtn.click();
        await page.waitForTimeout(200);
        const after2 = await toggleBtn.getAttribute('aria-expanded');
        Logger.info('[After 2nd Click] aria-expanded = ' + after2);
    });

    test('TC06 @sanity Verify Financials expand/collapse', async () => {
        await helper.runTwoClickTest(page, "Financials");
    });

    test('TC07 @sanity Verify Trackers expand/collapse', async () => {
        await helper.runTwoClickTest(page, "Trackers");
    });

    test('TC08 @sanity Verify Documents expand/collapse', async () => {
        await helper.runTwoClickTest(page, "Documents");
    });

});
