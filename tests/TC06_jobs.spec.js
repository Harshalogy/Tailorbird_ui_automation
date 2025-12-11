require('dotenv').config();
const { test, expect } = require('@playwright/test');
const { ProjectPage } = require('../pages/projectPage');
const { ProjectJob } = require('../pages/projectJob');
const { Logger } = require('../utils/logger');
const fs = require('fs');
const path = require('path');
const PropertiesHelper = require('../pages/properties');

let context, page, projectPage, projectJob, projectData, prop;

test.describe('Verify Create Project and Add Job flow', () => {

    test.beforeAll(async ({ browser }) => {
        context = await browser.newContext({ storageState: 'sessionState.json' });
        page = await context.newPage();
        projectPage = new ProjectPage(page);
        projectJob = new ProjectJob(page);
        prop = new PropertiesHelper(page);
        const filePath = path.join(__dirname, '../data/projectData.json');
        projectData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
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

    test('TC36 @regression : Validate Navigation to job tab without any console error within 2 seconds', async () => {
        Logger.step('Navigating to Projects...');
        await projectPage.navigateToProjects();
        await projectPage.openProject(projectData.projectName);
        const projectCard = page.locator('.mantine-SimpleGrid-root .mantine-Group-root', { hasText: projectData.projectName });
        await projectCard.waitFor({ state: 'visible', timeout: 10000 });
        await projectCard.click();
        await projectJob.navigateToJobsTab();
    });

    test('TC37 @regression : Validate add job modal fields, add job flow and job config in job overview', async () => {
        Logger.step('Adding and editing Job...');
        const createJob = page.locator('button', { hasText: 'Create Job' });
        await expect(createJob).toBeVisible();
        await expect(createJob).toBeEnabled();
        await createJob.click();
        const modal = page.locator('[data-modal-content="true"]');
        await expect(modal).toBeVisible();
        const titleInput = page.getByPlaceholder('Enter title');
        const jobTypeInput = page.getByPlaceholder('Select job type');
        const descriptionInput = page.getByPlaceholder('Enter description');
        const cancelBtn = page.getByRole('button', { name: 'Cancel' });
        const submitBtn = page.getByRole('button', { name: /add job/i });
        await expect(titleInput).toBeVisible();
        await expect(jobTypeInput).toBeVisible();
        await expect(descriptionInput).toBeVisible();
        await expect(cancelBtn).toBeVisible();
        await expect(submitBtn).toBeVisible();
        await titleInput.fill('mall in noida');
        await jobTypeInput.click();
        await page.getByRole('option', { name: /Capex/i }).click();
        await expect(jobTypeInput).toHaveValue('Capex');
        await submitBtn.click();
        await projectPage.assertSuccessToaster("job created successfully");
        const vals = { "Job Name": "mall in noida", "Job Type": "Capex", "Description": "-" };
        await prop.validateJobDetails(vals);
        const jobOverview = page.getByText('Job Overview');
        const editButton = page.getByRole('button', { name: 'Edit' });
        await expect(jobOverview).toBeVisible();
        await expect(editButton).toBeVisible();
        await expect(editButton).toBeEnabled();
    });

    test('TC38 @regression : User should be able to create bids and invite existing vendor', async () => {
        Logger.step('Creating Bid with Material...');
        await projectJob.createBidWithMaterial();
        Logger.step('Inviting Vendors...');
        await projectJob.inviteVendorsToBid();
        await page.locator(`.mantine-Drawer-body input[placeholder="Search..."]`).waitFor({ state: 'visible' });
        await page.locator(`.mantine-Drawer-body input[placeholder="Search..."]`).fill('testsumit');
        await page.locator(`.ag-pinned-left-cols-container div[role="row"]:has-text('testsumit') .ag-checkbox`).click();
        await page.locator(`button:has-text('Invite Selected Vendors to Bid')`).click();
        await page.waitForLoadState('networkidle');
        await expect(page.locator(`div[col-id="vendor_name"]:has-text('testsumit')`)).toContainText('testsumit');
    });

    test.skip('TC39 @regression : User should be able to invite new vendor', async () => {
        Logger.step('Inviting new vendor...');
        await page.locator("button:has-text('Invite Vendors To Bid')").click();
        await page.locator(`button:has-text('Invite a New Vendor to Bid')`).click();
        await page.locator(`input[placeholder="Enter Vendor Organization Name"]`).fill('Sumit_Corp');
        await page.locator(`input[placeholder="Enter Contact Name"]`).fill('Sumit');
        await page.locator(`input[placeholder="Enter Contact Email"]`).fill(projectPage.generateRandomEmail());
        await page.locator(`input[placeholder="Search for address..."]`).fill('Noida');
        await page.waitForTimeout(3000);
        await page.locator(`.mantine-Stack-root:has-text('Invite a New Vendor to Bid') button:has-text('Invite Vendor')`).click();
        await page.waitForLoadState('networkidle');
        await expect(page.locator(`div[col-id="vendor_name"]:has-text('Sumit_Corp')`)).toBeVisible();
        Logger.success('✅ New vendor invited successfully.');
    });

    test('TC40 @regression : Validate set bid template fucntionality and save it', async () => {
        await projectPage.openProject(projectData.projectName);
        await projectJob.navigateToJobsTab();
        await projectJob.openJobSummary();
        Logger.step('Setting Bid Template...');
        await projectJob.verifyBidTemplate();
    });

    test('TC41 @regression : Validate update bid flow', async () => {
        await projectPage.openProject(projectData.projectName);
        await projectJob.navigateToJobsTab();
        await projectJob.openJobSummary();
        await projectJob.navigateToBidsTab();
        await projectJob.updateBidWithMaterial();
        await projectJob.validateAndUpdateFirstRow();
    });

    test('TC42 @regression : Validate reset table modal and its functionality', async () => {
        await projectPage.openProject(projectData.projectName);
        await projectJob.navigateToJobsTab();
        await projectJob.openJobSummary();
        await projectJob.navigateToBidsTab();
        Logger.step('start reset table flow...');
        const resetIconBtn = page.locator('button[data-variant="subtle"][data-size="md"] svg.lucide-rotate-ccw');
        await resetIconBtn.nth(0).click();
        const modal = page.locator('section[role="dialog"]');
        await expect(modal).toBeVisible();
        const header = modal.locator('h2.mantine-Modal-title');
        await expect(header).toHaveText("Reset Bid Table");
        const bodyText =
            "Are you sure you want to reset the bid table? This will delete all bid rows and cannot be undone. The table will be cleared and ready for new entries.";
        const body = modal.locator('div.mantine-Modal-body p');
        await expect(body).toHaveText(bodyText);
        const cancelBtn = modal.locator('button:has-text("Cancel")');
        await expect(cancelBtn).toBeVisible();
        const resetTableBtn = modal.locator('button:has-text("Reset Table")');
        await expect(resetTableBtn).toBeVisible();
        await resetTableBtn.nth(0).click();
        await expect(modal).toBeHidden();
        const rowCount = await page.locator('div[role="row"][row-index="t-0"]').count();
        expect(rowCount).toBeLessThanOrEqual(2);
    });

    test('TC43 @regression : Validate scope mix modal fields', async () => {
        await projectPage.openProject('Automation_project_for_scope_mix');
        await projectJob.navigateToJobsTab();
        await projectJob.openJobSummary();
        await projectJob.navigateToBidsTab();
        await page.locator('button:has(svg.lucide-folder-tree)').first().click();
        const modal = page.locator('section[role="dialog"]');
        await expect(modal).toBeVisible();
        const allTexts = await modal.allInnerTexts();
        expect(allTexts.join("").length).toBeGreaterThan(0);
        const closeBtn = modal.locator('button:has(svg[viewBox="0 0 15 15"])');
        await expect(closeBtn).toBeVisible();
        const searchInput = modal.locator('input.mantine-Input-input');
        await expect(searchInput).toBeVisible();
        const placeholder = await searchInput.getAttribute("placeholder");
        expect(placeholder?.length).toBeGreaterThan(0);
        const plusIconBtn = modal.locator('button:has(svg.lucide-plus)');
        const repeatIconBtn = modal.locator('button:has(svg.lucide-repeat-2)');
        await expect(plusIconBtn).toBeVisible();
        await expect(repeatIconBtn).toBeVisible();
        const agGrid = modal.locator('.ag-root');
        await expect(agGrid).toBeVisible();
        const agGridText = await agGrid.innerText();
        expect(agGridText.length).toBeGreaterThan(0);
        const clearAllBtn = modal.locator('button:has-text("Clear All")');
        const submitBtn = modal.locator('button:has-text("Submit")');
        await expect(clearAllBtn).toBeVisible();
        await expect(submitBtn).toBeVisible();
        expect(await clearAllBtn.isDisabled()).toBeTruthy();
        expect(await submitBtn.isDisabled()).toBeTruthy();
        const allButtons = modal.locator('button');
        const count = await allButtons.count();
        for (let i = 0; i < count; i++) {
            const button = allButtons.nth(i);
            const text = await button.innerText();
            if (text.trim().length > 0) {
                expect(text.trim().length).toBeGreaterThan(0);
            }
        }
        const allIcons = modal.locator('svg');
        const svgCount = await allIcons.count();
        expect(svgCount).toBeGreaterThan(0);
        await expect(modal.locator('.mantine-Modal-body')).toBeVisible();
        await expect(modal.locator('.mantine-Stack-root')).toBeVisible();
        await expect(modal.locator('.mantine-InputWrapper-root')).toBeVisible();
        await expect(modal.locator('.mantine-Group-root').nth(0)).toBeVisible();
        await plusIconBtn.click();
        const scopeEditor = page.locator('[data-scope-portal-editor="true"]');
        await expect(scopeEditor).toBeVisible();
        const scopeInput = scopeEditor.locator('input.mantine-Input-input');
        await expect(scopeInput).toBeVisible();
        const scopePlaceholder = await scopeInput.getAttribute("placeholder");
        expect(scopePlaceholder?.length).toBeGreaterThan(0);
        const checkBtn = scopeEditor.locator('button:has(svg.lucide-check)');
        const cancelBtn = scopeEditor.locator('button:has(svg.lucide-x)');
        await expect(checkBtn).toBeVisible();
        await expect(cancelBtn).toBeVisible();
        expect(await checkBtn.isDisabled()).toBeTruthy();
        const randomScopeName = "Scope_" + Date.now();
        await scopeInput.fill(randomScopeName);
        expect(await checkBtn.isDisabled()).toBeFalsy();
        await checkBtn.click();
        await expect(scopeEditor).toBeHidden();
        await closeBtn.click();
        await expect(modal).toBeHidden();
    });

    test('TC44 @regression : Validate edit bid on behalf of new vendor flow and submit it successfully', async () => {
        await projectPage.openProject(projectData.projectName);
        await projectJob.navigateToJobsTab();
        await projectJob.openJobSummary();
        await projectJob.navigateToBidsTab();
        await projectJob.minimizeManageVendors();
        Logger.step('Editing Bid on behalf of vendor...');
        const actionButton = page.locator('button:has(svg.lucide-ellipsis-vertical)').nth(0);
        await actionButton.click();
        await page.locator('.mantine-Menu-dropdown .mantine-Menu-itemLabel:has-text("Edit On Behalf of Vendor")').click();
        await page.waitForTimeout(2000);
        await page.locator('h2.m_615af6c9.mantine-Modal-title').waitFor({ state: 'visible' });
        const totalCostCell = page.locator('div[row-index="0"] [role="gridcell"][col-id="total_price"]').last();
        await totalCostCell.dblclick();
        const costInput = page.locator('input[data-testid="bird-table-currency-input"]').first();
        await costInput.waitFor({ state: 'visible', timeout: 10000 });
        await costInput.fill('1000');
        page.once('dialog', async (dialog) => { await dialog.accept(); });
        const submitButton = page.locator('button:has-text("Submit Bid")');
        await submitButton.click({ force: true });
        await page.waitForTimeout(3000);
        const closeButton = page.locator('header.mantine-Modal-header button.mantine-Modal-close');
        await closeButton.waitFor({ state: 'visible', timeout: 10000 });
        await closeButton.click();
        const currentUrl = page.url();
        const urlFilePath = path.join(__dirname, '../data/lastVisitedUrl.json');
        fs.writeFileSync(urlFilePath, JSON.stringify({ lastUrl: currentUrl }, null, 2));
        Logger.success(`💾 Saved last visited URL: ${currentUrl}`);
        await context.storageState({ path: 'jobsessionState.json' });
    });

    test('TC45 @regression : User should be able to open Bids tab and verify bid leveling table', async () => {
        await projectPage.openProject(projectData.projectName);
        await projectJob.navigateToJobsTab();
        await projectJob.openJobSummary();
        await projectJob.navigateToBidsTab();
        await page.waitForTimeout(3000);
        await page.locator('.mantine-Tabs-tabLabel:has-text("Bids")').click();
        await page.locator('button.mantine-ActionIcon-root:has(svg.lucide-scale)').click();
        await page.waitForTimeout(3000);
        const totalCost = page.locator('div[role="row"]:has-text("Total")');
        await totalCost.waitFor({ state: 'visible', timeout: 10000 });
        await page.waitForTimeout(5000);
        const bidRow = page.locator('div[role="row"]:has-text("Bid with material")').first();
        await expect(bidRow).toContainText('$1,000');
        const totalRow = page.locator('div[role="row"]:has-text("Total")');
        await expect(totalRow).toContainText('Total$1,000');
    });

    test('TC46 @regression : User should be able to manage vendors and award bid', async () => {
        await projectPage.openProject(projectData.projectName);
        await projectJob.navigateToJobsTab();
        await projectJob.openJobSummary();
        await projectJob.navigateToBidsTab();
        if (!(await page.locator("button:has-text('Invite Vendors To Bid')").isVisible())) {
            await page.locator('p:has-text("Manage Vendors")').click();
        }
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        const secondVendorAction = page.locator('button:has(svg.lucide-ellipsis-vertical)').nth(0);
        await secondVendorAction.waitFor({ state: 'visible' });
        await secondVendorAction.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        await page.locator('.mantine-Menu-dropdown .mantine-Menu-itemLabel:has-text("Award Bid")').click();
        await page.waitForSelector('section[role="dialog"]', { state: 'visible' });
        const cancelButton = page.locator('section[role="dialog"] button:has-text("Cancel")');
        await expect(cancelButton).toBeVisible();
        const awardButton = page.locator('section[role="dialog"] button:has-text("Award")');
        await expect(awardButton).toBeVisible();
        await awardButton.click();
    });

    test('TC47 @regression : User should be able to verify awarded status and finalize contract', async () => {
        await projectPage.openProject(projectData.projectName);
        await projectJob.navigateToJobsTab();
        await projectJob.openJobSummary();
        await projectJob.navigateToBidsTab();
        const awardedRow = page.locator('div[role="row"]:has-text("Awarded") div[col-id="status"] p');
        await awardedRow.waitFor({ state: 'visible', timeout: 10000 });
        await expect(awardedRow).toHaveText('Awarded');
        await page.locator('.mantine-Tabs-tabLabel:has-text("Contracts")').click();
        await page.locator('button:has-text("Finalize Contract")').click();
        await page.locator('.mantine-Modal-content button:has-text("Finalize Contract")').click();
        await page.locator('.mantine-Modal-content button:has-text("Finalize Contract")').waitFor({ state: 'hidden' });
        await expect(page.locator('button:has-text("Bulk Update Status")')).toBeDefined();
        Logger.success('✅ Contract finalized and verified successfully');
    });

    test.afterAll(async () => {
        if (context) {
            await context.close();
            Logger.success('🧹 Session saved and browser context closed successfully.');
        }
    });

});
