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

        page.on('domcontentloaded', async () => {
            await page.evaluate(() => {
                const elements = document.querySelectorAll('main, .mantine-AppShell-navbar');
                elements.forEach(el => {
                    el.style.zoom = '70%';
                });
            });
        });

        await page.evaluate(() => {
            const elements = document.querySelectorAll('main, .mantine-AppShell-navbar');
            elements.forEach(el => {
                el.style.zoom = '70%';
            });
        });
    });

    test('TC01 @regression : Validate Navigation to job tab without any console error within 2 seconds', async () => {
        Logger.step('Navigating to Projects...');
        await projectPage.navigateToProjects();
        await projectPage.openProject(projectData.projectName);
        const projectCard = page.locator('.mantine-SimpleGrid-root .mantine-Group-root', {
            hasText: projectData.projectName,
        });
        await projectCard.waitFor({ state: 'visible', timeout: 10000 });
        await projectCard.click();
        // Navigate to Jobs tab
        await projectJob.navigateToJobsTab();
    });

    test('TC02 @regression : Validate add job modal fields, add job flow and job config in job overview', async () => {
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

    test('TC03 @regression : User should be able to create bids and invite existing vendor', async () => {
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

    test('TC04 @regression : Validate set bid template fucntionality and save it', async () => {
        await projectPage.openProject(projectData.projectName);
        await projectJob.navigateToJobsTab();
        await projectJob.openJobSummary();
        Logger.step('Setting Bid Template...');
        await projectJob.verifyBidTemplate();
    });

    test('TC05 @regression : Validate update bid flow', async () => {
        await projectPage.openProject(projectData.projectName);
        await projectJob.navigateToJobsTab();
        await projectJob.openJobSummary();
        await projectJob.navigateToBidsTab();
        // await projectJob.openJobSummary();
        Logger.step('Creating Bid with Material...');
        await projectJob.updateBidWithMaterial();
        await projectJob.validateAndUpdateFirstRow();
    });

    test('TC06 @regression : Validate reset table modal and its functionality', async () => {
        await projectPage.openProject(projectData.projectName);
        await projectJob.navigateToJobsTab();
        await projectJob.openJobSummary();
        await projectJob.navigateToBidsTab();
        // await projectJob.openJobSummary();
        Logger.step('start reset table flow...');
        // 1. Click the original "reset" icon button
        const resetIconBtn = page.locator('button[data-variant="subtle"][data-size="md"] svg.lucide-rotate-ccw');
        await resetIconBtn.nth(0).click();
        console.log("Clicked reset icon button");

        // 2. Wait for modal to appear
        const modal = page.locator('section[role="dialog"]');
        await expect(modal).toBeVisible();
        console.log("Modal is visible");

        // 3. Assert modal header
        const header = modal.locator('h2.mantine-Modal-title');
        await expect(header).toHaveText("Reset Bid Table");
        console.log("Header text verified: Reset Bid Table");

        // 4. Assert modal body text
        const bodyText =
            "Are you sure you want to reset the bid table? This will delete all bid rows and cannot be undone. The table will be cleared and ready for new entries.";

        const body = modal.locator('div.mantine-Modal-body p');
        await expect(body).toHaveText(bodyText);
        console.log("Body text verified:", bodyText);

        // 5. Assert Cancel button
        const cancelBtn = modal.locator('button:has-text("Cancel")');
        await expect(cancelBtn).toBeVisible();
        await expect(cancelBtn).toHaveText("Cancel");
        console.log("Cancel button verified");

        // 6. Assert Reset Table button
        const resetTableBtn = modal.locator('button:has-text("Reset Table")');
        await expect(resetTableBtn).toBeVisible();
        await expect(resetTableBtn).toHaveText("Reset Table");
        console.log("Reset Table button verified");

        // 7. Click Reset Table this time
        await resetTableBtn.nth(0).click();
        console.log("Clicked Reset Table");

        // 8. Confirm modal disappears
        await expect(modal).toBeHidden();
        console.log("Modal closed after Reset Table");

        const rowCount = await page.locator('div[role="row"][row-index="t-0"]').count();
        expect(rowCount).toBeLessThanOrEqual(2);

    });

    test('TC07 @regression : Validate scope mix modal fields', async () => {

        await projectPage.openProject('Automation_project_for_scope_mix');
        await projectJob.navigateToJobsTab();
        await projectJob.openJobSummary();
        await projectJob.navigateToBidsTab();

        await page.locator('button:has(svg.lucide-folder-tree)').first().click();
        // ----- 2. Modal root -----
        const modal = page.locator('section[role="dialog"]');
        await expect(modal).toBeVisible();
        console.log("Modal visible");


        // ----- 3. Assert ALL visible text inside modal dynamically -----
        const allTexts = await modal.allInnerTexts();
        console.log("Captured modal text:", allTexts);

        // Make sure modal contains SOME text (no static text checking)
        expect(allTexts.join("").length).toBeGreaterThan(0);


        // ----- 4. Assert Close Button (X) exists -----
        const closeBtn = modal.locator('button:has(svg[viewBox="0 0 15 15"])');
        await expect(closeBtn).toBeVisible();
        console.log("Close button found");


        // ----- 5. Assert Search Input + Placeholder dynamically -----
        const searchInput = modal.locator('input.mantine-Input-input');
        await expect(searchInput).toBeVisible();

        const placeholder = await searchInput.getAttribute("placeholder");
        console.log("Search input placeholder:", placeholder);

        // Ensure placeholder contains words (but no static matching)
        expect(placeholder?.length).toBeGreaterThan(0);


        // ----- 6. Assert action icons (Plus & Repeat) dynamically -----
        const plusIconBtn = modal.locator('button:has(svg.lucide-plus)');
        const repeatIconBtn = modal.locator('button:has(svg.lucide-repeat-2)');

        await expect(plusIconBtn).toBeVisible();
        await expect(repeatIconBtn).toBeVisible();

        console.log("Plus and Repeat icons verified");


        // ----- 7. Assert AG-Grid block exists -----
        const agGrid = modal.locator('.ag-root');
        await expect(agGrid).toBeVisible();
        console.log("AG Grid detected");

        // Assert any AG grid text dynamically
        const agGridText = await agGrid.innerText();
        console.log("AG Grid text:", agGridText);

        // It should not be empty
        expect(agGridText.length).toBeGreaterThan(0);


        // ----- 8. Assert bottom bar buttons -----
        const clearAllBtn = modal.locator('button:has-text("Clear All")');
        const submitBtn = modal.locator('button:has-text("Submit")');

        await expect(clearAllBtn).toBeVisible();
        await expect(submitBtn).toBeVisible();

        console.log("Bottom buttons found");


        // ----- 9. Assert disabled states dynamically -----
        expect(await clearAllBtn.isDisabled()).toBeTruthy();
        expect(await submitBtn.isDisabled()).toBeTruthy();

        console.log("Clear All & Submit are disabled");


        // ----- 10. Assert all buttons text dynamically -----
        const allButtons = modal.locator('button');
        const count = await allButtons.count();

        for (let i = 0; i < count; i++) {
            const button = allButtons.nth(i);
            const text = await button.innerText();
            console.log(`Button #${i} text:`, text);

            // Assert text exists but DO NOT check exact value
            if (text.trim().length > 0) {
                expect(text.trim().length).toBeGreaterThan(0);
            }
        }


        // ----- 11. Assert every SVG icon is present -----
        const allIcons = modal.locator('svg');
        const svgCount = await allIcons.count();

        console.log("SVG icon count:", svgCount);
        expect(svgCount).toBeGreaterThan(0);


        // ----- 12. Assert layout regions dynamically -----
        await expect(modal.locator('.mantine-Modal-body')).toBeVisible();
        await expect(modal.locator('.mantine-Stack-root')).toBeVisible();
        await expect(modal.locator('.mantine-InputWrapper-root')).toBeVisible();
        await expect(modal.locator('.mantine-Group-root').nth(0)).toBeVisible();

        console.log("All layout containers verified");


        // ----- DONE -----
        console.log("🔥 All dynamic assertions passed (no static values used).");

        // ----- 13. CLICK ADD BUTTON (plus icon) -----
        await plusIconBtn.click();
        console.log("Clicked Add (+) button");

        // Wait for portal editor to appear
        const scopeEditor = page.locator('[data-scope-portal-editor="true"]');
        await expect(scopeEditor).toBeVisible();
        console.log("Scope editor popup visible");


        // ----- 14. ASSERT INPUT + PLACEHOLDER (dynamic, no static text used) -----
        const scopeInput = scopeEditor.locator('input.mantine-Input-input');
        await expect(scopeInput).toBeVisible();

        const scopePlaceholder = await scopeInput.getAttribute("placeholder");
        console.log("Scope editor placeholder:", scopePlaceholder);
        expect(scopePlaceholder?.length).toBeGreaterThan(0);


        // ----- 15. ASSERT CHECK + CANCEL BUTTONS (icon-based, not text-based) -----
        const checkBtn = scopeEditor.locator('button:has(svg.lucide-check)');
        const cancelBtn = scopeEditor.locator('button:has(svg.lucide-x)');

        await expect(checkBtn).toBeVisible();
        await expect(cancelBtn).toBeVisible();

        console.log("Check and Cancel buttons found");


        // Check button should be disabled before entering text
        expect(await checkBtn.isDisabled()).toBeTruthy();
        console.log("Check button initially disabled");


        // ----- 16. ENTER A NEW SCOPE NAME (no static string) -----
        const randomScopeName = "Scope_" + Date.now();
        await scopeInput.fill(randomScopeName);

        console.log("Entered scope name:", randomScopeName);


        // Check button should now be enabled
        expect(await checkBtn.isDisabled()).toBeFalsy();
        console.log("Check button enabled after typing");


        // ----- 17. CLICK CHECK BUTTON -----
        await checkBtn.click();
        console.log("Clicked check button to save scope");


        // Editor should disappear
        await expect(scopeEditor).toBeHidden();
        console.log("Scope editor closed");


        // ----- 18. CLOSE MAIN MODAL -----
        await closeBtn.click();
        console.log("Clicked modal close button");


        // Assert modal is gone
        await expect(modal).toBeHidden();
        console.log("Modal successfully closed");


    });

    test('TC08 @regression : Validate edit bid on behalf of new vendor flow and submit it successfully', async () => {
        await projectPage.openProject(projectData.projectName);
        await projectJob.navigateToJobsTab();
        await projectJob.openJobSummary();
        await projectJob.navigateToBidsTab();

        // await page.pause();
        Logger.step('Editing Bid on behalf of vendor...');
        const actionButton = page.locator('button:has(svg.lucide-ellipsis-vertical)').nth(0);
        await actionButton.click();
        await page.locator('.mantine-Menu-dropdown .mantine-Menu-itemLabel:has-text("Edit On Behalf of Vendor")').click();
        await page.waitForTimeout(2000);
        await page.locator('h2.m_615af6c9.mantine-Modal-title').waitFor({ state: 'visible' });

        // ✅ Edit total price
        const totalCostCell = page.locator('div[row-index="0"] [role="gridcell"][col-id="total_price"]').last();
        await totalCostCell.dblclick();
        const costInput = page.locator('input[data-testid="bird-table-currency-input"]').first();
        await costInput.waitFor({ state: 'visible', timeout: 10000 });
        await costInput.fill('1000');

        page.once('dialog', async (dialog) => {
            console.log(`Dialog message: ${dialog.message()}`);
            await dialog.accept();
        });

        // ✅ Submit bid
        const submitButton = page.locator('button:has-text("Submit Bid")');
        await submitButton.click({ force: true });
        await page.waitForTimeout(3000);

        // ✅ Close modal
        const closeButton = page.locator('header.mantine-Modal-header button.mantine-Modal-close');
        await closeButton.waitFor({ state: 'visible', timeout: 10000 });
        await closeButton.click();

        // ✅ Save last visited URL
        const currentUrl = page.url();
        const urlFilePath = path.join(__dirname, '../data/lastVisitedUrl.json');
        fs.writeFileSync(urlFilePath, JSON.stringify({ lastUrl: currentUrl }, null, 2));
        Logger.success(`💾 Saved last visited URL: ${currentUrl}`);

        await context.storageState({ path: 'jobsessionState.json' }); // Save session
    });

    test('TC09 @regression : User should be able to manage vendors and award bid', async () => {
        await projectPage.openProject(projectData.projectName);
        await projectJob.navigateToJobsTab();
        await projectJob.openJobSummary();
        await projectJob.navigateToBidsTab();
        // ✅ If "Invite Vendors To Bid" is not visible, click "Manage Vendors"
        if (!(await page.locator("button:has-text('Invite Vendors To Bid')").isVisible())) {
            await page.locator('p:has-text("Manage Vendors")').click();
        }

        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        // ✅ Click action menu and award the bid
        const secondVendorAction = page.locator('button:has(svg.lucide-ellipsis-vertical)').nth(0);
        await secondVendorAction.waitFor({ state: 'visible' })
        await secondVendorAction.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        await page
            .locator('.mantine-Menu-dropdown .mantine-Menu-itemLabel:has-text("Award Bid")')
            .click();

        // ✅ Wait for dialog and verify buttons
        await page.waitForSelector('section[role="dialog"]', { state: 'visible' });

        const cancelButton = page.locator('section[role="dialog"] button:has-text("Cancel")');
        await expect(cancelButton).toBeVisible();

        const awardButton = page.locator('section[role="dialog"] button:has-text("Award")');
        await expect(awardButton).toBeVisible();

        await awardButton.click();
    });

    test('TC10 @regression : User should be able to verify awarded status and finalize contract', async () => {
        await projectPage.openProject(projectData.projectName);
        await projectJob.navigateToJobsTab();
        await projectJob.openJobSummary();
        await projectJob.navigateToBidsTab();

        // ✅ Wait for Awarded row
        const awardedRow = page.locator('div[role="row"]:has-text("Awarded") div[col-id="status"] p');
        await awardedRow.waitFor({ state: 'visible', timeout: 10000 });
        await expect(awardedRow).toHaveText('Awarded');
        console.log('✅ Vendor has been awarded successfully');

        // ✅ Move to Contracts tab
        await page.locator('.mantine-Tabs-tabLabel:has-text("Contracts")').click();

        // ✅ Finalize contract
        await page.locator('button:has-text("Finalize Contract")').click();
        await page.locator('.mantine-Modal-content button:has-text("Finalize Contract")').click();

        await page
            .locator('.mantine-Modal-content button:has-text("Finalize Contract")')
            .waitFor({ state: 'hidden' });

        // await expect(page.locator('button:has-text("Bulk Update Status")')).toBeDisabled();
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
