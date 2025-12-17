require('dotenv').config();
const { test, expect } = require('@playwright/test');
const { FinancialsCategoryPage } = require('../pages/categoryPage');
const { ProjectPage } = require('../pages/projectPage');
const { ProjectJob } = require('../pages/projectJob');
const { Logger } = require('../utils/logger');
const fs = require('fs');
const path = require('path');
const PropertiesHelper = require('../pages/properties');

test.use({
    storageState: 'sessionState.json',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
});

let page, projectPage, projectJob, projectData, prop, financialsCategoryPage;

test.describe('Verify category tab', () => {

    test.beforeEach(async ({ page: p }) => {
        page = p;
        projectPage = new ProjectPage(page);
        projectJob = new ProjectJob(page);
        prop = new PropertiesHelper(page);
        financialsCategoryPage = new FinancialsCategoryPage(page);

        if (!projectData) {
            const filePath = path.join(__dirname, '../data/projectData.json');
            projectData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }

        await page.goto(process.env.DASHBOARD_URL, { waitUntil: 'load' });
        await expect(page).toHaveURL(process.env.DASHBOARD_URL);
        await page.waitForLoadState('networkidle');

        page.on('domcontentloaded', async () => {
            await page.evaluate(() => {
                const elements = document.querySelectorAll('main, .mantine-AppShell-navbar');
                elements.forEach(el => { el.style.zoom = '70%'; });
            });
        });

        await page.evaluate(() => {
            const elements = document.querySelectorAll('main, .mantine-AppShell-navbar');
            elements.forEach(el => { el.style.zoom = '70%'; });
        });
    });

    test('TC49 @regression : Should expand Financials section and show Category option', async () => {
        // await financialsCategoryPage.expandFinancialsSection();
        await expect(financialsCategoryPage.categoryLink).toBeVisible();
    });

    test('TC50 @regression : Should navigate to Category page and verify URL', async () => {
        await financialsCategoryPage.goToCategory();
        await expect(page).toHaveURL(/\/category/);
    });

    test('TC51 @regression : Should load Category page content and not be blank', async () => {
        await financialsCategoryPage.goToCategory();
        await expect(page).toHaveURL(/\/category/);
        await page.waitForTimeout(1000);
        const pageContent = await page.locator('body').textContent();
        expect(pageContent).toBeTruthy();
    });

    test('TC52 @regression : Should show data table/grid if present', async () => {
        await financialsCategoryPage.goToCategory();
        await expect(page).toHaveURL(/\/category/);
        // Table is optional, so no assertion here
        await financialsCategoryPage.isTableVisible();
    });

    test('TC53 @regression : Should show Download/Export button', async () => {
        await financialsCategoryPage.goToCategory();
        await expect(page).toHaveURL(/\/category/);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(5000);
        const downloadButtonFound = await financialsCategoryPage.isDownloadButtonVisible();
        expect(downloadButtonFound).toBeTruthy();
    });

    test('TC54 @regression : Should not show any error indicators on Category page', async () => {
        await financialsCategoryPage.goToCategory();
        await expect(page).toHaveURL(/\/category/);
        const errorFound = await financialsCategoryPage.hasErrorIndicators();
        expect(errorFound).toBeFalsy();
    });

    test('TC55 @regression : Validate export job is working as expected', async () => {
        await financialsCategoryPage.goToCategory();
        await expect(page).toHaveURL(/\/category/);
        await prop.exportButton();
    });

    test('TC56 @regression : Validate reset table option is working as expected', async () => {
        await financialsCategoryPage.goToCategory();
        await expect(page).toHaveURL(/\/category/);
        await projectPage.openResetTableModal();
        await financialsCategoryPage.validateResetCategoryContent();
        await projectPage.confirmResetTable();
        await projectPage.assertRowCountAfterReset();
    });

    test('TC57 @regression : Validate Upload category option is working as expected', async () => {
        await financialsCategoryPage.goToCategory();
        await expect(page).toHaveURL(/\/category/);
        await financialsCategoryPage.uploadCategory(path.resolve("./files/category_data.csv"));
    });

    test('TC58 @regression : Add data option is working as expected', async () => {
        await financialsCategoryPage.goToCategory();
        await expect(page).toHaveURL(/\/category/);
        await page.getByTestId('bt-add-row-menu').click();
        await prop.addColumndata();
        await prop.manageColumns("Test Column");
    });

    test('TC59 @regression : Add category option is working as expected', async () => {
        await financialsCategoryPage.goToCategory();
        await expect(page).toHaveURL(/\/category/);
        await page.getByTestId('bt-add-row-menu').click();
        await prop.addRowDetail();
        await prop.deleteRow();
    });

    test.skip('TC60 @sanity : filter option is working as expected', async () => {
        // Navigate to the category page with specific URL
        await page.goto('https://beta.tailorbird.com/financials/category?propertyId=678&tab=bids', { waitUntil: 'networkidle' });
        await expect(page).toHaveURL(/\/category/);

        // Filter by Category Code = 100 and verify results
        const filteredRowCount = await financialsCategoryPage.filterCategoryAndVerify("Category Code", "100");
        expect(filteredRowCount).toBeGreaterThan(0);
    });

});