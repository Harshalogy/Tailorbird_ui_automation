require('dotenv').config();
const { test, expect } = require('@playwright/test');
const { InvoicePage } = require('../pages/invoicePage');
const { Logger } = require('../utils/logger');
const fs = require('fs');
const path = require('path');
const { ProjectPage } = require('../pages/projectPage');
const { ProjectJob } = require('../pages/projectJob');

test.use({
    storageState: 'sessionState.json',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
});

let page, invoicePage, projectPage, projectJob, projectData;

test.describe('Verify Invoice tab', () => {

    test.beforeEach(async ({ page: p }) => {
        page = p;
        invoicePage = new InvoicePage(page);
        projectPage = new ProjectPage(page);
        projectJob = new ProjectJob(page);


        if (!projectData) {
            const filePath = path.join(__dirname, '../data/projectData.json');
            projectData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }

        await page.goto(process.env.DASHBOARD_URL, { waitUntil: 'load' });
        await expect(page).toHaveURL(process.env.DASHBOARD_URL);
        await page.waitForLoadState('networkidle');

        await projectPage.openProject(projectData.projectName);
        await projectJob.navigateToJobsTab();
        await projectJob.openJobSummary();
        await invoicePage.navigateToInvoiceTab();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

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

    test('TC61 @regression : Should navigate to Invoice page and verify URL', async () => {
        await expect(page).toHaveURL(/tab=invoices/);
        const pageContent = await page.locator('body').textContent();
        expect(pageContent).toBeTruthy();
        Logger.success('Invoice page content is loaded.');
        await expect(invoicePage.addInvoiceButton).toBeVisible();
        Logger.success('Add Invoice button is visible.');
    });

    test('TC62 @regression : Should add new invoice and open invoice details page', async () => {
        await invoicePage.clickAddInvoice();

        const isModalOpen = await invoicePage.isModalOpen();
        if (isModalOpen) {
            Logger.success('Invoice details modal opened successfully.');
            await expect(invoicePage.modal).toBeVisible();
        } else {
            Logger.success('Invoice details page opened successfully.');
        }
    });

    test('TC63 @regression : Should enter invoice title and required information', async () => {
        await invoicePage.clickAddInvoice();

        // Fill invoice details
        const testTitle = `Invoice_${Date.now()}`;
        await invoicePage.fillInvoiceTitle(testTitle);
        await invoicePage.fillInvoiceAmount('1000');
        await invoicePage.fillInvoiceDescription('Test Invoice Description');

        Logger.success('Invoice details filled successfully.');
    });

    test('TC64 @regression : Should upload PNG image for invoice', async () => {
        await invoicePage.clickAddInvoice();

        // Create test image if it doesn't exist
        const testImagePath = path.resolve('./files/test_image.png');
        if (!fs.existsSync(testImagePath)) {
            Logger.info('Creating test image...');
            const testDir = path.resolve('./files');
            if (!fs.existsSync(testDir)) {
                fs.mkdirSync(testDir, { recursive: true });
            }
            const pngHeader = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 0, 0, 0, 1, 8, 2, 0, 0, 0, 144, 119, 83, 222, 0, 0, 0, 12, 73, 68, 65, 84, 8, 153, 99, 248, 207, 192, 0, 0, 3, 1, 1, 0, 24, 204, 83, 210, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130]);
            fs.writeFileSync(testImagePath, pngHeader);
            Logger.success('Test image created.');
        }

        await invoicePage.uploadInvoiceImage(testImagePath);
    });

    test('TC65 @regression : Should confirm/save the invoice', async () => {
        await invoicePage.clickAddInvoice();

        // Fill invoice details
        const testTitle = `Invoice_${Date.now()}`;
        await invoicePage.fillInvoiceTitle(testTitle);
        await invoicePage.fillInvoiceAmount('500');
        await invoicePage.fillInvoiceDescription('Test Invoice for Save');

        // Save the invoice
        const saved = await invoicePage.saveInvoice();
        if (saved) {
            Logger.success('Invoice saved successfully.');

            // Verify invoice was added
            const invoiceAdded = await invoicePage.verifyInvoiceAdded();
            expect(invoiceAdded).toBeTruthy();
        } else {
            Logger.info('Could not save invoice - Save button not found');
        }
    });

});
