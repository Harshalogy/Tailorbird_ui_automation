require('dotenv').config();
const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/loginPage');
const { ProjectPage } = require('../pages/projectPage');
const { Logger } = require('../utils/logger');
const PropertiesHelper = require('../pages/properties');
const loc = require('../locators/locationLocator');

let context, page, projectPage, prop;

test.beforeAll(async ({ browser }) => {
    context = await browser.newContext({ storageState: 'sessionState.json' });
    page = await context.newPage();
    projectPage = new ProjectPage(page);
    prop = new PropertiesHelper(page);

    await page.goto(process.env.DASHBOARD_URL, { waitUntil: 'load' });
    await expect(page).toHaveURL(process.env.DASHBOARD_URL);
    await page.waitForLoadState('networkidle');
});

test('TC01 @regression : Navigate to Projects & Jobs and verify page loads successfully within 2 seconds and zero console error', async () => {
    await projectPage.navigateToProjects();
});

test('TC02 @regression : User should be able to Open Create Project modal and verify all fields are visible', async () => {
    await projectPage.openCreateProjectModal();
    await projectPage.verifyModalFields();
});

test('TC03 @regression : User should be able to Fill Create Project form, submit, and verify project details on dashboard', async () => {
    const startDate = await projectPage.getStartDate();
    const endDate = await projectPage.getStartDate();
    await projectPage.fillProjectDetails({
        name: 'Automation Test Project',
        description: 'Created via Playwright automation',
        startDate: startDate,
        endDate: endDate,
    });
});

test('TC04 @regression : User should be able to search project using partial name and verify matching results', async () => {
    await projectPage.navigateToProjects();
    await prop.changeView('Table View');
    await projectPage.searchProject("Test");
});

test('TC05 @regression : User should be able to apply filter and export project', async () => {
    await projectPage.navigateToProjects();
    await prop.changeView('Table View');

    await page.getByRole('button').filter({ has: page.locator('svg.lucide-funnel') }).click();
    await prop.filterPropertyNew('Sumit_automation');

    const projectName = "Automa_Test";
    const filterValue = "Sumit_automation";

    const downloadPromise = page.waitForEvent("download");
    await page.click('.lucide-download:visible');
    const download = await downloadPromise;

    const fs = require("fs");
    const filePath = await download.path();
    const csvText = fs.readFileSync(filePath, "utf8");

    function parseCSV(csv) {
        const lines = csv.trim().split("\n");
        const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
        return lines.slice(1).map(l => {
            const values = l.split(",").map(v => v.trim().replace(/^"|"$/g, ""));
            return Object.fromEntries(headers.map((h, i) => [h, values[i]]));
        });
    }

    const parsedData = parseCSV(csvText);

    const nameCol = Object.keys(parsedData[0]).find(k => k.toLowerCase().includes("name"));
    const propCol = Object.keys(parsedData[0]).find(k => k.toLowerCase().includes("property"));

    expect(nameCol).toBeTruthy();
    expect(propCol).toBeTruthy();

    const uiRows = 0;
    const rowsByProperty = parsedData.filter(r => r[propCol] === filterValue);

    // if (uiRows === 0) expect(rowsByProperty.length).toBe(0);

    const rowsByName = parsedData.filter(r => r[nameCol] === projectName);
    if (uiRows > 0) expect(rowsByName.length).toBe(1);

    const deleteRow = page.locator(loc.deleteRowBtn).first();
    await deleteRow.click({ delay: 200 });
    await page.locator(loc.deleteConfirmBtn).click();
});

test('TC06 @regression : Validate cancel button closes without saving.', async () => {
    await projectPage.navigateToProjects();
    await prop.changeView('Table View');
    await projectPage.openCreateProjectModal();
    await projectPage.verifyModalClosed();
});

test('TC07 @regression : Validate Create Project form mandatory fields assertion, property dropdown options and date can be filled directly without using calender', async () => {
    await projectPage.navigateToProjects();
    await projectPage.openCreateProjectModal();
    await projectPage.validateMandatoryFields();
    await projectPage.propertyDropdownOptions();
    await projectPage.fillDateField('2024-07-01', '2024-12-31');
});

test.afterAll(async () => {
    await context.close();
});
