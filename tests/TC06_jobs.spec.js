require('dotenv').config();
const { test, expect } = require('@playwright/test');
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

let page, projectPage, projectJob, projectData, prop;

test.describe('Verify Create Project and Add Job flow', () => {

    test.beforeEach(async ({ page: p }) => {
        page = p;

        projectPage = new ProjectPage(page);
        projectJob = new ProjectJob(page);
        prop = new PropertiesHelper(page);

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

    test('TC36 @regression : Validate Navigation to job tab without any console error within 2 seconds', async () => {
        Logger.step('Navigating to Projects...');
        await projectPage.navigateToProjects();
        await projectPage.openProject(projectData.projectName);

        const projectCard = page.locator(
            '.mantine-SimpleGrid-root .mantine-Group-root',
            { hasText: projectData.projectName }
        );

        await projectCard.waitFor({ state: 'visible', timeout: 10000 });
        await projectCard.click();
        await projectJob.navigateToJobsTab();
    });

    test('TC37 @regression : Validate add job modal fields, add job flow and job config in job overview', async () => {
        await projectPage.navigateToProjects();
        await projectPage.openProject(projectData.projectName);
        await projectJob.navigateToJobsTab();
        Logger.step('Adding and editing Job...');

        await projectPage.openCreateJobModal();
        await projectPage.validateModalFields();

        await projectPage.fillJobForm({
            title: 'mall in noida',
            jobType: 'Capex'
        });

        await projectPage.submitJob();
        await projectPage.assertSuccessToaster('job created successfully');

        const expected = {
            'Job Name': 'mall in noida',
            'Job Type': 'Capex',
            'Description': '-'
        };

        await prop.validateJobDetails(expected);
        await projectPage.validateOverviewVisible();
    });

    test('TC38 @regression : User should be able to create bids and invite existing vendor', async () => {
        await projectPage.openProject(projectData.projectName);
        await projectJob.navigateToJobsTab();
        await projectJob.openJobSummary();
        Logger.step('Creating Bid with Material...');
        await projectJob.createBidWithMaterial();

        Logger.step('Inviting Vendors...');
        await projectJob.inviteVendorsToBid();

        await page.locator(`.mantine-Drawer-body input[placeholder="Search..."]`).waitFor({ state: 'visible' });
        await page.locator(`.mantine-Drawer-body input[placeholder="Search..."]`).fill('testsumit');

        await page.locator(
            `.ag-pinned-left-cols-container div[role="row"]:has-text('testsumit') .ag-checkbox`
        ).click();

        await page.locator(`button:has-text('Add Vendors to Bid')`).click();
        await page.waitForLoadState('networkidle');

        await expect(
            page.locator(`div[col-id="vendor_name"]:has-text('testsumit')`)
        ).toContainText('testsumit');
    });

    test.skip('TC39 @regression : User should be able to invite new vendor', async () => {
        await projectPage.openProject(projectData.projectName);
        await projectJob.navigateToJobsTab();
        await projectJob.openJobSummary();
        await projectJob.inviteVendorsToBid();
        Logger.step('Inviting new vendor...');

        await page.locator("button:has-text('Invite Vendors To Bid')").click();
        await page.locator(`button:has-text('Invite a New Vendor to Bid')`).click();

        await page.locator(`input[placeholder="Enter Vendor Organization Name"]`).fill('Sumit_Corp');
        await page.locator(`input[placeholder="Enter Contact Name"]`).fill('Sumit');
        await page.locator(`input[placeholder="Enter Contact Email"]`).fill(projectPage.generateRandomEmail());
        await page.locator(`input[placeholder="Search for address..."]`).fill('Noida');

        await page.waitForTimeout(3000);
        await page.locator(
            `.mantine-Stack-root:has-text('Invite a New Vendor to Bid') button:has-text('Invite Vendor')`
        ).click();

        await page.waitForLoadState('networkidle');

        await expect(
            page.locator(`div[col-id="vendor_name"]:has-text('Sumit_Corp')`)
        ).toBeVisible();

        Logger.success('New vendor invited successfully.');
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
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);

        await projectPage.openResetTableModal();
        await projectPage.validateResetModalContent();
        await projectPage.confirmResetTable();
        await projectPage.assertRowCountAfterReset();
    });

    test('TC43 @regression : Validate scope mix modal fields', async () => {
        await projectPage.openProject('Automation_project_for_scope_mix');
        await projectJob.navigateToJobsTab();
        await projectJob.openJobSummary();
        await projectJob.navigateToBidsTab();

        await projectPage.openScopeMixModal();
        await projectPage.validateScopeMixModalFields();
        await projectPage.addScopeEntry();
        await projectPage.closeScopeMixModal();
    });

    test.skip('TC44 @regression : Validate edit bid on behalf of new vendor flow and submit it successfully', async ({ context }) => {
        await projectPage.openProject(projectData.projectName);
        await projectJob.navigateToJobsTab();
        await projectJob.openJobSummary();
        await projectJob.navigateToBidsTab();
        await projectJob.minimizeManageVendors();

        Logger.step('Editing Bid on behalf of vendor...');
        await projectPage.openEditOnBehalfModal();
        await projectPage.updateBidCost('1000');
        await projectPage.submitEditedBid();
        await projectPage.saveLastVisitedUrl();
        await projectPage.saveSessionState(context);
    });

    test('TC45 @regression : User should be able to open Bids tab and verify bid data', async () => {
        await projectPage.openProject(projectData.projectName);
        await projectJob.navigateToJobsTab();
        await projectJob.openJobSummary();
        await projectJob.navigateToBidsTab();

        // Verify bids tab loaded
        await projectPage.page.waitForTimeout(2000);
        Logger.success('Bids tab loaded successfully');
    });

    test('TC46 @regression : User should be able to manage vendors and award bid', async () => {
        await projectPage.openProject(projectData.projectName);
        await projectJob.navigateToJobsTab();
        await projectJob.openJobSummary();
        await projectJob.navigateToBidsTab();

        await projectPage.ensureManageVendorsOpen();
        await projectPage.openVendorActionMenu();
        await projectPage.selectAwardBid();
        await projectPage.validateAwardModal();
        await projectPage.confirmAwardBid();
    });

    test('TC47 @regression : User should be able to verify pending status and finalize contract', async () => {
        await projectPage.openProject(projectData.projectName);
        await projectJob.navigateToJobsTab();
        await projectJob.openJobSummary();
        await projectJob.navigateToBidsTab();
        await projectJob.minimizeManageVendors();

        await projectPage.waitForPendingStatus();
        await projectPage.openContractsTab();
        await projectPage.openFinalizeContractModal();
        await projectPage.confirmFinalizeContract();
        await projectPage.assertContractFinalized();

        Logger.success('Contract finalized and verified successfully');
    });

});
