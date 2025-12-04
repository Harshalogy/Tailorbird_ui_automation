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

        // ✅ Load project data
        const filePath = path.join(__dirname, '../data/projectData.json');
        projectData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        await page.goto(process.env.DASHBOARD_URL, { waitUntil: 'load' });
        await expect(page).toHaveURL(process.env.DASHBOARD_URL);
        await page.waitForLoadState('networkidle');
    });

    test('User should be able to navigate to existing project', async () => {
        Logger.step('Navigating to Projects...');
        await projectPage.navigateToProjects();
        Logger.step(`Opening project "${projectData.projectName}"...`);
        const searchProject = page.locator('input[placeholder="Search..."]');
        await searchProject.waitFor({ state: 'visible', timeout: 30000 });
        await searchProject.click();
        await searchProject.fill(projectData.projectName);
        //await page.waitForSelector('input[placeholder="Search..."]', { state: 'visible', timeout: 30000 });
        const projectCard = page.locator('.mantine-SimpleGrid-root .mantine-Group-root', {
            hasText: projectData.projectName,
        });
        await projectCard.waitFor({ state: 'visible', timeout: 10000 });
        await projectCard.click();

        // Navigate to Jobs tab
        await projectJob.navigateToJobsTab();
    });

    test('User should be able to add and configure job details', async () => {
        Logger.step('Adding and editing Job...');

        const createJob = page.locator('button', { hasText: 'Create Job' });
        await expect(createJob).toBeVisible();
        await expect(createJob).toBeEnabled();
        await createJob.click();
        console.log('Create Job button is visible enable & clicked');

        const modal = page.locator('[data-modal-content="true"]');
        await expect(modal).toBeVisible();

        // Define field locators using stable attributes
        const titleInput = page.getByPlaceholder('Enter title');
        const jobTypeInput = page.getByPlaceholder('Select job type');
        const descriptionInput = page.getByPlaceholder('Enter description');
        const cancelBtn = page.getByRole('button', { name: 'Cancel' });
        const submitBtn = page.getByRole('button', { name: /add job/i });

        // Assert all fields are visible
        await expect(titleInput).toBeVisible();
        await expect(jobTypeInput).toBeVisible();
        await expect(descriptionInput).toBeVisible();
        await expect(cancelBtn).toBeVisible();
        await expect(submitBtn).toBeVisible();

        // Fill title field
        await titleInput.fill('mall in noida');

        // Select Job Type: click input, then choose 'Interior'
        await jobTypeInput.click();
        const capexOption = page.getByRole('option', { name: /Capex/i });
        const unitInteriorOption = page.getByRole('option', { name: /Unit Interior/i });
        await expect(capexOption).toBeVisible();
        await expect(unitInteriorOption).toBeVisible();
        console.log("Capex & unit Interior options are visible");

        await page.getByRole('option', { name: /Capex/i }).click();

        // Optionally verify selection
        await expect(jobTypeInput).toHaveValue('Capex');

        await submitBtn.click();

        await projectPage.assertSuccessToaster("job created successfully");

        Logger.step('Opening Job Summary...');
        await projectJob.openJobSummary();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);

        const vals = {
            "Job Name": "mall in noida",
            "Job Type": "Capex",
            "Description": "-"
        };

        await prop.validateJobDetails(vals);

        // Job Overview title
        const jobOverview = page.getByText('Job Overview');

        // Edit button (safe selector)
        const editButton = page.getByRole('button', { name: 'Edit' });

        // Assertions
        await expect(jobOverview).toBeVisible();
        await expect(editButton).toBeVisible();
        await expect(editButton).toBeEnabled();

        console.log("✔ Job Overview and Edit button are visible and edit button is enabled");
    });

    test.only('User should be able to create bids and invite existing vendor', async () => {
        await page.goto('https://beta.tailorbird.com/jobs/1529?propertyId=727&tab=summary');
        Logger.step('Creating Bid with Material...');
        await projectJob.createBidWithMaterial();

        // Invite Vendors
        Logger.step('Inviting Vendors...');
        await projectJob.inviteVendorsToBid();

        await page.locator(`.mantine-Drawer-body input[placeholder="Search..."]`).waitFor({ state: 'visible' });
        await page.locator(`.mantine-Drawer-body input[placeholder="Search..."]`).fill('testsumit');
     
        // ✅ Invite existing vendor
        await page.locator(`.ag-pinned-left-cols-container div[role="row"]:has-text('testsumit') .ag-checkbox`).click();
        await page.locator(`button:has-text('Invite Selected Vendors to Bid')`).click();
        await page.waitForLoadState('networkidle');
        await expect(page.locator(`div[col-id="vendor_name"]:has-text('testsumit')`)).toContainText('testsumit');

    });

    test.afterAll(async () => {
        if (context) {
            await context.close();
            Logger.success('🧹 Session saved and browser context closed successfully.');
        }
    });
});
