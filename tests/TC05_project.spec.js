require('dotenv').config();
const { test, expect } = require('@playwright/test');
const { ProjectJob } = require('../pages/projectJob');
const { ProjectPage } = require('../pages/projectPage');
const PropertiesHelper = require('../pages/properties');

let context, page, projectPage, projectJob, prop;

test.beforeAll(async ({ browser }) => {
    context = await browser.newContext({ storageState: 'sessionState.json' });
    page = await context.newPage();
    projectPage = new ProjectPage(page);
    projectJob = new ProjectJob(page);
    prop = new PropertiesHelper(page);
    await page.goto(process.env.DASHBOARD_URL, { waitUntil: 'load' });
    await expect(page).toHaveURL(process.env.DASHBOARD_URL);
    await page.waitForLoadState('networkidle');
});

test('TC29 @regression : Navigate to Projects & Jobs and verify page loads successfully within 2 seconds and zero console error', async () => {
    await projectPage.navigateToProjects();
});

test('TC30 @regression : User should be able to Open Create Project modal and verify all fields are visible', async () => {
    await projectPage.openCreateProjectModal();
    await projectPage.verifyModalFields();
});

test('TC31 @regression : User should be able to Fill Create Project form, submit, and verify project details on dashboard', async () => {
    const startDate = await projectPage.getStartDate();
    const endDate = await projectPage.getStartDate();
    await projectPage.fillProjectDetails({
        name: 'Automation Test Project',
        description: 'Created via Playwright automation',
        startDate,
        endDate
    });
});

test('TC32 @regression : User should be able to search project using partial name and verify matching results', async () => {
    await projectPage.navigateToProjects();
    await prop.changeView('Table View');
    await projectPage.searchProject('Test');
});

test('TC33 @regression : User should be able to apply filter and export project', async () => {
    await projectPage.navigateToProjects();
    await prop.changeView('Table View');
    // await page.pause();
    await projectJob.applyFilterAndExport('Sumit_automation', 'Automa_Test');
    await projectJob.deleteFirstProjectRow();
});

test('TC34 @regression : Validate cancel button closes without saving.', async () => {
    await projectPage.navigateToProjects();
    await prop.changeView('Table View');
    await projectPage.openCreateProjectModal();
    await projectPage.verifyModalClosed();
});

test('TC35 @regression : Validate Create Project form mandatory fields assertion, property dropdown options and date can be filled directly without using calender', async () => {
    await projectPage.navigateToProjects();
    await projectPage.openCreateProjectModal();
    await projectPage.validateMandatoryFields();
    await projectPage.propertyDropdownOptions();
    await projectPage.fillDateField('2024-07-01', '2024-12-31');
});

test.afterAll(async () => {
    await context.close();
});
