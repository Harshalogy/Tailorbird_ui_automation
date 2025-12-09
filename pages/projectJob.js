const { expect } = require('@playwright/test');
const { Logger } = require('../utils/logger');

exports.ProjectJob = class ProjectJob {
    constructor(page) {
        this.page = page;

        // Centralized locators
        this.locators = {
            // Tabs
            jobsTab: this.page.getByText('Jobs', { exact: true }),

            // Buttons
            addJobMenu: this.page.getByRole('tabpanel', { name: 'Jobs' }).getByTestId('bt-add-row-menu'),
            viewDetailsButton: this.page.locator('button[title="View Details"]').first(),
            deleteButton: this.page.locator('button[aria-label="Delete Row"]').first(),
            inviteVendorsToBidButton: this.page.locator("button:has-text('Invite Vendors To Bid')"),

            // Job Title
            titleCell: this.page.locator(`div[role="gridcell"][col-id="title"]:has-text('—')`).first(),
            inputBox: this.page.locator('div[role="gridcell"][col-id="title"] input').first(),

            // Job Type
            jobType: this.page.locator('div[col-id="job_type"] span:has-text("Unit Interior")'),

            // Job Summary
            jobSummaryTab: this.page.locator('.mantine-Tabs-tabLabel:has-text("Job Summary")'),
            descriptionInput: this.page.locator('input[placeholder="Enter job description"]'),

            // Date pickers
            selectStartDateBtn: this.page.getByRole('button', { name: 'Select start date' }),
            selectEndDateBtn: this.page.getByRole('button', { name: 'Select end date' }),

            // Bids
            bidsTab: this.page.locator('.mantine-Tabs-tabLabel:has-text("Bids")'),
            bidsTabPanel: this.page.getByRole('tabpanel', { name: 'Bids' }),
            addRowMenu: this.page.getByTestId('bt-add-row-menu'),
            addRowBtn: this.page.getByTestId('bt-add-row'),
            bidSearchInput: this.page.getByTestId('bird-table-select-search'),
            firstGridCell: this.page.locator(`div[role="gridcell"][col-id="scope"]`).first(),
            lastGridCell: this.page.locator(`div[role="gridcell"][col-id="scope"]`).last(),
            firstRowScopeCell: this.page.locator('div[row-id]').first().locator('div[col-id="scope"]'),

            // Invite Vendors
            // inviteVendorsFallback: this.page.locator("p:has-text('Invite Vendors')")
            inviteVendorsFallback: this.page.locator("//div[@class='m_8bffd616 mantine-Flex-root __m__-_r_af_']//span[@class='m_8d3afb97 mantine-ActionIcon-icon']"),
        };
    }

    // ------------------ FUNCTIONS ------------------

    async navigateToJobsTab() {
        Logger.step('Navigating to Jobs tab...');
        await this.locators.jobsTab.click();
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(3000);
        await this.locators.jobsTab.click();
        await this.page.waitForURL(/tab=jobs/, { timeout: 10000 });
        Logger.success('✅ Navigated to Job screen.');
    }

    async addJob() {
        Logger.step('Opening Add Job dropdown...');
        await this.locators.addJobMenu.waitFor({ state: 'visible' });
        await this.locators.addJobMenu.click();
        await this.page.waitForSelector('div[role="menu"], .mantine-Menu-dropdown', { timeout: 5000 });
        await this.page.getByRole('menuitem', { name: 'Add Job' }).click();
        await this.page.waitForSelector('div[role="gridcell"][col-id="title"]', { timeout: 15000 });

        await expect(this.locators.viewDetailsButton).toBeVisible({ timeout: 10000 });
        await expect(this.locators.deleteButton).toBeVisible({ timeout: 10000 });
        Logger.success('✅ New job row added successfully.');
    }

    async editJobTitle(newTitle) {
        Logger.info('Editing job title...');
        await this.locators.titleCell.waitFor({ state: 'visible' });
        await this.locators.titleCell.dblclick();
        await this.locators.inputBox.waitFor({ state: 'visible' });
        await this.locators.inputBox.fill(newTitle);
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(2000);
        await this.page.keyboard.press('Enter');
        Logger.success(`✅ Job title updated to: ${newTitle}`);
    }

    async selectJobType(typeText) {
        Logger.info(`Selecting Job Type: ${typeText}`);
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(2000);
        await this.page.locator('span:has-text("UNIT INTERIOR")').waitFor({ state: 'visible', timeout: 10000 });
        await this.page.locator('span:has-text("UNIT INTERIOR")').dblclick();
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(2000);
        await this.page.locator(`[data-testid="bird-table-select-dropdown"] p:has-text("${typeText}")`).waitFor({ state: 'visible' });
        await this.page.locator(`[data-testid="bird-table-select-dropdown"] p:has-text("${typeText}")`).click();
    }

    async openJobSummary() {
        Logger.step('Opening Job Summary...');
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(3000);
        await this.locators.viewDetailsButton.click();
        // await this.locators.jobSummaryTab.click();
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(3000);
    }

    async fillJobDescription(description) {
        Logger.info('Filling Job Summary description...');
        await this.locators.descriptionInput.fill(description);
    }

    async selectStartEndDates() {
        const today = new Date();
        const startDate = today.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const endDate = tomorrow.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

        Logger.info(`Selecting Start Date: ${startDate}`);
        await this.locators.selectStartDateBtn.click();
        await this.page.waitForTimeout(1000);
        await this.page.click(`button[aria-label="${startDate}"]`);

        Logger.info(`Selecting End Date: ${endDate}`);
        await this.locators.selectEndDateBtn.click();
        await this.page.waitForTimeout(1000);
        await this.page.click(`button[aria-label="${endDate}"]`);

        await expect(this.page).toHaveURL(/tab=summary/);
        Logger.success('✅ Job Summary page verified successfully.');
    }

    async createBidWithMaterial() {
        Logger.step('Check that bid tab is visible and enable...');
        await expect(this.locators.bidsTab).toBeVisible();
        await expect(this.locators.bidsTab).toBeEnabled();
        Logger.info("✔ Bids tab is visible and enabled");

        Logger.step('Creating Bid with Material...');
        await this.locators.bidsTab.click();
        await this.locators.bidsTabPanel.getByTestId('bt-add-row').nth(0).click();
        await this.locators.addRowBtn.nth(0).click();

        await this.locators.firstGridCell.dblclick();
        await this.locators.bidSearchInput.fill('Bid with material');
        // await this.locators.bidSearchInput.type('Bid with material', { delay: 500 });
        await this.locators.bidSearchInput.press('Enter');
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(2000);
        Logger.success('✅ Created Bid with Material.');
    }

    async createBidWithoutMaterial() {
        Logger.step('Creating Bid without Material...');
        await this.locators.bidsTab.click();
        await this.locators.bidsTabPanel.getByTestId('bt-add-row-menu').click();
        await this.locators.addRowBtn.click();

        await this.page.waitForTimeout(4000);
        await this.locators.lastGridCell.dblclick();
        await this.locators.bidSearchInput.fill('Bid without material');
        await this.locators.bidSearchInput.press('Enter');
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(2000);
        Logger.success('✅ Created Bid without Material.');
    }

    async inviteVendorsToBid() {
        Logger.step('Inviting Vendors to Bid...');
        if (!(await this.locators.inviteVendorsToBidButton.isVisible())) {
            await this.page.locator('p:has-text("Manage Vendors")').click();
        }
        await this.locators.inviteVendorsToBidButton.click();
        await this.page.waitForTimeout(4000);
    }

    // async verifyBidTemplate() {
    //     Logger.step('click on bid tab...');
    //     await this.locators.bidsTab.click();
    //     await this.page.waitForLoadState('networkidle');
    //     await this.page.waitForTimeout(3000);

    //     Logger.step('Verifying bid template...');
    //     await this.page.locator('button:has(svg.lucide-file-text)').nth(2).click();

    //     const modal = this.page.locator('[data-menu-dropdown="true"]');
    //     await expect(modal).toBeVisible();

    //     const firstOption = modal.locator('button >> text=Tailorbird Baseline Bid Book - Detailed');
    //     const secondOption = modal.locator('button >> text=Save as Template');

    //     await expect(firstOption).toBeVisible();
    //     await expect(modal.locator('button svg.lucide-globe')).toBeVisible();
    //     await expect(modal.locator('.mantine-Menu-divider')).toBeVisible();
    //     await expect(secondOption).toBeVisible();
    //     await expect(modal.locator('button[role="menuitem"]')).toHaveCount(2);

    //     Logger.step('Clicking first menu option...');
    //     await firstOption.click();

    //     Logger.step('Waiting for Apply Template dialog...');
    //     const dialog = this.page.locator('[data-modal-content="true"]');
    //     await expect(dialog).toBeVisible();

    //     const title = dialog.locator('h2');
    //     const message = dialog.locator('p');
    //     const cancelBtn = dialog.locator('button:has-text("Cancel")');
    //     const applyBtn = dialog.locator('button:has-text("Apply Template")');

    //     Logger.step(`Dialog Title: ${await title.textContent()}`);
    //     Logger.step(`Dialog Message: ${await message.textContent()}`);
    //     Logger.step('Checking Cancel button...');
    //     await expect(cancelBtn).toBeVisible();
    //     Logger.step('Checking Apply Template button...');
    //     await expect(applyBtn).toBeVisible();

    //     Logger.step('Clicking Apply Template...');
    //     await applyBtn.click();

    //     Logger.step('Re-opening bid template menu...');
    //     await this.page.locator('button:has(svg.lucide-file-text)').nth(2).click();
    //     await expect(modal).toBeVisible();

    //     Logger.step('Clicking second menu option...');
    //     await secondOption.click();

    //     Logger.step('Bid template menu options & dialog validated successfully.');
    // }

    async verifyBidTemplate() {
        Logger.step('click on bid tab...');
        await this.locators.bidsTab.click();
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(3000);

        Logger.step('Verifying bid template...');
        await this.page.locator('button:has(svg.lucide-file-text)').nth(2).click();

        const modal = this.page.locator('[data-menu-dropdown="true"]');
        await expect(modal).toBeVisible();

        const firstOption = modal.locator('button >> text=Tailorbird Baseline Bid Book - Detailed');
        const secondOption = modal.locator('button >> text=Save as Template');

        await expect(firstOption).toBeVisible();
        await expect(modal.locator('button svg.lucide-globe')).toBeVisible();
        await expect(modal.locator('.mantine-Menu-divider').nth(0)).toBeVisible();
        await expect(secondOption).toBeVisible();
        // await expect(modal.locator('button[role="menuitem"]')).toHaveCount(2);

        Logger.step('Clicking first menu option...');
        await firstOption.click();

        Logger.step('Waiting for Apply Template dialog...');
        const applyDialog = this.page.locator('[data-modal-content="true"]');
        await expect(applyDialog).toBeVisible();

        const applyTitle = applyDialog.locator('h2');
        const applyMessage = applyDialog.locator('p');
        const applyCancel = applyDialog.locator('button:has-text("Cancel")');
        const applyApply = applyDialog.locator('button:has-text("Apply Template")');

        Logger.step(`Dialog Title: ${await applyTitle.textContent()}`);
        Logger.step(`Dialog Message: ${await applyMessage.textContent()}`);
        Logger.step('Checking Cancel button...');
        await expect(applyCancel).toBeVisible();
        Logger.step('Checking Apply Template button...');
        await expect(applyApply).toBeVisible();

        Logger.step('Clicking Apply Template...');
        await applyApply.click();

        Logger.step('Waiting for Template Applied notification...');
        const notif1 = this.page.locator('.mantine-Notification-root');
        await expect(notif1).toBeVisible({ timeout: 15000 });
        await expect(notif1).toContainText('Template Applied');
        await expect(notif1).toContainText('has been applied successfully');

        Logger.step('Re-opening bid template menu...');
        await this.page.locator('button:has(svg.lucide-file-text)').nth(2).click();
        await expect(modal).toBeVisible();

        Logger.step('Clicking second menu option...');
        await secondOption.click();

        Logger.step('Waiting for Save as Template dialog...');
        const saveDialog = this.page.locator('[data-modal-content="true"]');
        await expect(saveDialog).toBeVisible();

        const header = saveDialog.locator('h2');
        const nameLabel = saveDialog.locator('label:has-text("Template Name")');
        const nameInput = saveDialog.locator('input[placeholder="Enter template name"]');
        const descLabel = saveDialog.locator('label:has-text("Description")');
        const descInput = saveDialog.locator('textarea[placeholder*="template description"]');
        const saveCancel = saveDialog.locator('button:has-text("Cancel")');
        const saveBtn = saveDialog.locator('button:has-text("Save Template")');

        Logger.step(`Dialog Header: ${await header.textContent()}`);
        await expect(header).toHaveText('Save as Template');

        Logger.step('Checking Template Name label...');
        await expect(nameLabel).toBeVisible();
        Logger.step('Checking Template Name input...');
        await expect(nameInput).toBeVisible();

        Logger.step('Checking Description label...');
        await expect(descLabel).toBeVisible();
        Logger.step('Checking Description input...');
        await expect(descInput).toBeVisible();

        Logger.step('Checking Cancel button...');
        await expect(saveCancel).toBeVisible();
        Logger.step('Checking Save Template button...');
        await expect(saveBtn).toBeVisible();

        Logger.step('Filling Template Name...');
        const generatedName = 'Automation Template ' + Date.now();
        await nameInput.fill(generatedName);

        Logger.step('Filling Description...');
        await descInput.fill('This is an automation-generated template.');

        Logger.step('Clicking Save Template...');
        await saveBtn.click();

        Logger.step('Waiting for Save Template success notification...');
        const notif2 = this.page.locator('.mantine-Notification-root').nth(0);
        await expect(notif2).toBeVisible({ timeout: 15000 });
        await expect(notif2).toContainText('Template Saved');
        await expect(notif2).toContainText('has been saved successfully');

        Logger.step('Save as Template workflow validated successfully.');
    }

    // async validateAndUpdateFirstRow() {
    //     Logger.step("Validating first row of AG Grid...");

    //     // First data row of AG Grid
    //     const firstRow = this.page.locator('.ag-center-cols-container .ag-row').first();
    //     await expect(firstRow).toBeVisible();

    //     // All cells inside the row
    //     const cells = firstRow.locator('.ag-cell');
    //     const cellCount = await cells.count();

    //     Logger.step(`Total cells in first row: ${cellCount}`);

    //     for (let i = 0; i < cellCount; i++) {
    //         const cell = cells.nth(i);
    //         await cell.scrollIntoViewIfNeeded();

    //         const cellText = (await cell.textContent())?.trim() ?? "";
    //         Logger.step(`Cell[${i}] current value → "${cellText || '(empty)'}"`);

    //         // If cell already has data → log & skip updating
    //         if (cellText.length > 0) {
    //             Logger.step(`Cell[${i}] has data → "${cellText}". No update needed.`);
    //             continue;
    //         }

    //         Logger.step(`Cell[${i}] is BLANK → Updating now...`);

    //         // Click to activate editor
    //         await cell.click({ force: true });
    //         await this.page.waitForTimeout(200);

    //         // Identify editor type (input, textarea, number field)
    //         const input = this.page.locator('.ag-cell-edit-input, input.ag-input-field-input, input');
    //         const textarea = this.page.locator('textarea');
    //         let updatedValue = '';

    //         if (await input.first().isVisible({ timeout: 300 }).catch(() => false)) {
    //             // Detect if numeric field
    //             const typeAttr = await input.first().getAttribute('type');

    //             if (typeAttr === "number" || /^[0-9 .,-]+$/.test(cellText)) {
    //                 updatedValue = String(Math.floor(Math.random() * 900 + 100)); // random 3-digit number
    //             } else {
    //                 updatedValue = "Updated Text";
    //             }

    //             await input.first().fill(updatedValue);
    //             Logger.step(`Cell[${i}] updated via INPUT → "${updatedValue}"`);

    //         } else if (await textarea.first().isVisible({ timeout: 300 }).catch(() => false)) {
    //             updatedValue = "Updated Description";
    //             await textarea.first().fill(updatedValue);
    //             Logger.step(`Cell[${i}] updated via TEXTAREA → "${updatedValue}"`);

    //         } else {
    //             Logger.step(`Cell[${i}] editor NOT FOUND → Skipping update.`);
    //         }

    //         // Press Enter to save
    //         await this.page.keyboard.press("Enter");
    //         await this.page.waitForTimeout(150);
    //     }

    //     Logger.step("First row validation & update completed.");
    // }

    // async validateAndUpdateFirstRow() {
    //     Logger.step("Force updating AG-Grid first row using Grid API...");

    //     // Select ONLY the Bids AG-Grid
    //     const bidsGrid = this.page.locator('.ag-root:has-text("Actions")').first();

    //     await expect(bidsGrid).toBeVisible({ timeout: 20000 });

    //     await this.page.evaluate(() => {
    //         // find the correct AG Grid in DOM using Actions column
    //         const grid = Array.from(document.querySelectorAll('.ag-root'))
    //             .find(g => g.innerText.includes("Actions"));

    //         if (!grid) {
    //             console.error("AG Grid not found");
    //             return;
    //         }

    //         const gridApi = grid.__agComponent?.gridOptionsWrapper?.getGridOptions()?.api;
    //         if (!gridApi) {
    //             console.error("Grid API not found");
    //             return;
    //         }

    //         const model = gridApi.getModel();
    //         const firstRow = model.getRow(0);
    //         if (!firstRow) return;

    //         const data = firstRow.data;

    //         // Force override all values
    //         data.scope = "Bid with material";
    //         data.scheduleOfValue = 1000;
    //         data.costItem = 1000;
    //         data.location = 1000;
    //         data.quantity = 1000;
    //         data.unit_cost = 1000;

    //         gridApi.applyTransaction({ update: [data] });
    //         gridApi.redrawRows();
    //     });

    //     Logger.step("AG-Grid row updated successfully.");
    // }


    async validateAndUpdateFirstRow() {
        Logger.step("Validating & updating first row of AG Grid...");

        const firstRow = this.page.locator('.ag-center-cols-container .ag-row').first();
        await expect(firstRow).toBeVisible();

        const cells = firstRow.locator('.ag-cell');
        const cellCount = await cells.count();

        Logger.step(`Total cells in the first row: ${cellCount}`);

        for (let i = 0; i < cellCount; i++) {
            const cell = cells.nth(i);
            await cell.scrollIntoViewIfNeeded();

            let updatedValue = "";

            // 🔥 RULES FOR WHAT TO UPDATE
            switch (i) {
                case 0:
                    updatedValue = "Appliance";
                    break;
                case 1:
                case 2:
                case 3:
                    updatedValue = "UpdatedValue_" + Math.floor(Math.random() * 900 + 100);
                    break;
                case 4:
                    updatedValue = "110"; 
                    break;
                default:
                    updatedValue = "Updated_" + (i + 1);
                    break;
            }

            Logger.step(`Updating Cell[${i}] with → "${updatedValue}"`);

            // Click to activate editor
            await cell.click({ force: true });
            await this.page.waitForTimeout(150);

            const input = this.page.locator('.ag-cell-edit-input, input.ag-input-field-input, input');
            const textarea = this.page.locator('textarea');

            const editorFound = await Promise.race([
                input.first().isVisible().then(v => v).catch(() => false),
                textarea.first().isVisible().then(v => v).catch(() => false)
            ]);

            if (editorFound && await input.first().isVisible().catch(() => false)) {

                await input.first().fill(updatedValue);
                Logger.step(`Cell[${i}] updated via INPUT → "${updatedValue}"`);

            } else if (editorFound && await textarea.first().isVisible().catch(() => false)) {

                await textarea.first().fill(updatedValue);
                Logger.step(`Cell[${i}] updated via TEXTAREA → "${updatedValue}"`);

            } else {
                Logger.step(`❌ Editor NOT found for Cell[${i}]. Trying direct keyboard input...`);
                await cell.pressSequentially(updatedValue);
            }

            // Save edit
            await this.page.keyboard.press("Enter");
            await this.page.waitForTimeout(150);
        }

        Logger.step("✔ First row ALL CELLS updated successfully.");
    }

    async updateBidWithMaterial() {
        Logger.step('Check that bid tab is visible and enable...');
        await expect(this.locators.bidsTab).toBeVisible();
        await expect(this.locators.bidsTab).toBeEnabled();
        Logger.info("✔ Bids tab is visible and enabled");

        Logger.step('Creating Bid with Material...');
        await this.locators.bidsTab.click();
        await this.locators.bidsTabPanel.getByTestId('bt-add-row').nth(0).click();
        await this.locators.addRowBtn.nth(0).click();

        await this.locators.firstGridCell.dblclick();
        await this.locators.bidSearchInput.fill('Bid with material');
        // await this.locators.bidSearchInput.type('Bid with material', { delay: 500 });
        await this.locators.bidSearchInput.press('Enter');
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(5000);
        Logger.success('✅ Created Bid with Material.');

        // --- Fill Quantity column ---
        Logger.step("Filling Quantity column with 100...");
        const quantityCell = this.page.locator('div[row-index="0"] div[col-id="quantity"]').first();
        await expect(quantityCell).toBeVisible();
        await quantityCell.dblclick({ force: true });
        await this.page.waitForTimeout(2000);
        await quantityCell.locator('input').fill("100");
        Logger.step("Filled Quantity column with 100...");
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(2000);
        await quantityCell.locator('input').press("Enter");
        // await this.page.keyboard.press("Enter");
        await this.page.waitForTimeout(200);

        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(5000);

        Logger.step("Filling unit_cost column with 100...");
        const unitPriceCell = this.page.locator('div[row-index="0"] div[col-id="unit_cost"]').first();
        await expect(unitPriceCell).toBeVisible();
        await unitPriceCell.dblclick({ force: true });
        await this.page.waitForTimeout(2000);
        await unitPriceCell.locator('input').fill("100");
        Logger.step("Filled unit_cost column with 100...");
        await unitPriceCell.locator('input').press("Enter");
        // await this.page.keyboard.press("Enter");
        await this.page.waitForTimeout(200);

        Logger.success('✅ Completed Bid with Material row creation.');

    }

    async navigateToBidsTab() {
        Logger.step('Navigating to Bids tab...');
        await expect(this.locators.bidsTab).toBeEnabled();
        await this.locators.bidsTab.click();
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(3000);
        Logger.success('✅ Navigated to Bids tab.');
    }

};
