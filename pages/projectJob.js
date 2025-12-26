const { expect } = require('@playwright/test');
const { Logger } = require('../utils/logger');
const { projectJobLocators } = require('../locators/projectJobLocator');
const PropertiesHelper = require('../pages/properties');

let prop;


exports.ProjectJob = class ProjectJob {
    constructor(page) {
        this.page = page;
        this.locators = projectJobLocators(page);
        this.prop = new PropertiesHelper(page);

    }

    async navigateToJobsTab() {
        try {
            Logger.step('Navigating to Jobs tab...');
            await this.locators.jobsTab.click();
            await this.page.waitForLoadState('networkidle');
            await this.page.waitForTimeout(3000);
            await this.locators.jobsTab.click();
            await this.page.waitForURL(/tab=jobs/, { timeout: 10000 });
            Logger.success('Navigated to Job screen.');
        } catch (error) {
            Logger.step(`Error in navigateToJobsTab: ${error.message}`);
            throw error;
        }
    }

    async addJob() {
        try {
            Logger.step('Opening Add Job dropdown...');
            await this.locators.addJobMenu.waitFor({ state: 'visible' });
            await this.locators.addJobMenu.click();
            await this.page.waitForSelector('div[role="menu"], .mantine-Menu-dropdown', { timeout: 5000 });
            await this.locators.addJobMenuItem('Add Job').click();
            await this.page.waitForSelector('div[role="gridcell"][col-id="title"]', { timeout: 15000 });
            await expect(this.locators.viewDetailsButton).toBeVisible({ timeout: 10000 });
            await expect(this.locators.deleteButton).toBeVisible({ timeout: 10000 });
            Logger.success('New job row added successfully.');
        } catch (error) {
            Logger.step(`Error in addJob: ${error.message}`);
            throw error;
        }
    }

    async editJobTitle(newTitle) {
        try {
            Logger.info('Editing job title...');
            await this.locators.titleCell.waitFor({ state: 'visible' });
            await this.locators.titleCell.dblclick();
            await this.locators.inputBox.waitFor({ state: 'visible' });
            await this.locators.inputBox.fill(newTitle);
            await this.page.waitForLoadState('networkidle');
            await this.page.waitForTimeout(2000);
            await this.page.keyboard.press('Enter');
            Logger.success(`Job title updated to: ${newTitle}`);
        } catch (error) {
            Logger.step(`Error in editJobTitle: ${error.message}`);
            throw error;
        }
    }

    async selectJobType(typeText) {
        try {
            Logger.info(`Selecting Job Type: ${typeText}`);
            await this.page.waitForLoadState('networkidle');
            await this.page.waitForTimeout(2000);
            await this.locators.unitInteriorSpan.waitFor({ state: 'visible', timeout: 10000 });
            await this.locators.unitInteriorSpan.dblclick();
            await this.page.waitForLoadState('networkidle');
            await this.page.waitForTimeout(2000);
            const typeOption = this.locators.jobTypeDropdownOption(typeText);
            await typeOption.waitFor({ state: 'visible' });
            await typeOption.click();
        } catch (error) {
            Logger.step(`Error in selectJobType: ${error.message}`);
            throw error;
        }
    }

    async openJobSummary() {
        try {
            Logger.step('Opening Job Summary...');
            await this.page.waitForLoadState('networkidle');
            await this.page.waitForTimeout(3000);
            await this.locators.viewDetailsButton.click();
            await this.page.waitForLoadState('networkidle');
            await this.page.waitForTimeout(3000);
        } catch (error) {
            Logger.step(`Error in openJobSummary: ${error.message}`);
            throw error;
        }
    }

    async fillJobDescription(description) {
        try {
            Logger.info('Filling Job Summary description...');
            await this.locators.descriptionInput.fill(description);
        } catch (error) {
            Logger.step(`Error in fillJobDescription: ${error.message}`);
            throw error;
        }
    }

    async selectStartEndDates() {
        try {
            const today = new Date();
            const startDate = today.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            const endDate = tomorrow.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
            Logger.info(`Selecting Start Date: ${startDate}`);
            await this.locators.selectStartDateBtn.click();
            await this.page.waitForTimeout(1000);
            await this.locators.dateButtonByAriaLabel(startDate).click();
            Logger.info(`Selecting End Date: ${endDate}`);
            await this.locators.selectEndDateBtn.click();
            await this.page.waitForTimeout(1000);
            await this.locators.dateButtonByAriaLabel(endDate).click();
            await expect(this.page).toHaveURL(/tab=summary/);
            Logger.success('Job Summary page verified successfully.');
        } catch (error) {
            Logger.step(`Error in selectStartEndDates: ${error.message}`);
            throw error;
        }
    }

    async createBidWithMaterial() {
        try {
            Logger.step('Checking Bids tab status...');
            await expect(this.locators.bidsTab).toBeVisible();
            await expect(this.locators.bidsTab).toBeEnabled();
            Logger.info('Bids tab is visible and enabled');
            Logger.step('Creating Bid with Material...');
            await this.locators.bidsTab.click();
            await this.locators.bidsTabPanel.getByTestId('bt-add-row').nth(0).click();
            await this.locators.addRowBtn.nth(0).click();
            await this.locators.firstGridCell.dblclick();
            await this.locators.bidSearchInput.fill('Bid with material');
            await this.locators.bidSearchInput.press('Enter');
            await this.page.waitForLoadState('networkidle');
            await this.page.waitForTimeout(2000);
            Logger.success('Created Bid with Material.');
        } catch (error) {
            Logger.step(`Error in createBidWithMaterial: ${error.message}`);
            throw error;
        }
    }

    async createBidWithoutMaterial() {
        try {
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
            Logger.success('Created Bid without Material.');
        } catch (error) {
            Logger.step(`Error in createBidWithoutMaterial: ${error.message}`);
            throw error;
        }
    }

    // async inviteVendorsToBid() {
    //     try {
    //         Logger.step('Inviting Vendors to Bid...');
    //         const addVendorsButton = this.page.getByRole('button', { name: 'Add Vendors' });

    //         await expect(this.addVendorsButton).toBeVisible({ timeout: 10000 });
    //         await expect(this.addVendorsButton).toBeEnabled();
    //         await this.addVendorsButton.click();

    //         if (!(await this.locators.inviteVendorsToBidButton.isVisible())) {
    //             await this.locators.manageVendorsToggle.click();
    //         }
    //         await this.locators.inviteVendorsToBidButton.click();
    //         await this.page.waitForTimeout(4000);
    //     } catch (error) {
    //         Logger.step(`Error in inviteVendorsToBid: ${error.message}`);
    //         throw error;
    //     }
    // }

    async inviteVendorsToBid() {
        try {
            Logger.step('Inviting Vendors to Bid...');

            const addVendorsButton = this.page.getByRole('button', { name: /add vendors/i });

            // If Add Vendors button is not visible, expand Manage Vendors panel
            if (!(await addVendorsButton.isVisible())) {
                Logger.step('Add Vendors button not visible, opening Manage Vendors panel...');
                await this.locators.manageVendorsToggle.click();
            }

            await expect(addVendorsButton).toBeVisible({ timeout: 15000 });
            await expect(addVendorsButton).toBeEnabled();

            await addVendorsButton.scrollIntoViewIfNeeded();
            await addVendorsButton.click();
            await this.page.waitForTimeout(3000);

            

        } catch (error) {
            Logger.step(`Error in inviteVendorsToBid: ${error.message}`);
            throw error;
        }
    }


    async verifyBidTemplate() {
        try {
            Logger.step('click on bid tab...');
            await this.locators.bidsTab.click();
            await this.page.waitForLoadState('networkidle');
            await this.page.waitForTimeout(3000);
            if (await this.locators.inviteVendorsToBidButton.isVisible()) {
                await this.locators.manageVendorsToggle.click();
                await this.page.waitForTimeout(2000);
                Logger.success('Manage Vendors pane minimized.');
            }
            Logger.step('Verifying bid template...');
            await this.locators.templateMenuButton.click();
            const modal = this.locators.templateMenuDropdown;
            await expect(modal).toBeVisible();
            const firstOption = this.locators.templateMenuFirstOption;
            const secondOption = this.locators.templateMenuSecondOption;
            await expect(firstOption).toBeVisible();
            await expect(this.locators.templateMenuGlobeIcon).toBeVisible();
            await expect(this.locators.templateMenuFirstDivider).toBeVisible();
            await expect(secondOption).toBeVisible();
            Logger.step('Clicking first menu option...');
            await firstOption.click();
            Logger.step('Waiting for Apply Template dialog...');
            const applyDialog = this.locators.applyTemplateDialog;
            await expect(applyDialog).toBeVisible();
            const applyTitle = this.locators.applyTemplateTitle;
            const applyMessage = this.locators.applyTemplateMessage;
            const applyCancel = this.locators.applyTemplateCancelBtn;
            const applyTemplate = this.locators.applyTemplateApplyBtn;
            Logger.step(`Dialog Title: ${await applyTitle.textContent()}`);
            Logger.step(`Dialog Message: ${await applyMessage.textContent()}`);
            await expect(applyCancel).toBeVisible();
            await expect(applyTemplate).toBeVisible();
            const before = await this.locators.agCenterColsVisible.innerText();
            Logger.step('Clicking Apply Template...');
            await applyTemplate.waitFor({ state: 'visible' });
            await applyTemplate.click();
            await applyTemplate.waitFor({ state: 'hidden' });
            Logger.step('Waiting for Template Applied notification...');
            const notif1 = this.locators.notificationRoot;
            await expect(notif1).toBeVisible({ timeout: 15000 });
            await expect(notif1).toContainText('Template Applied');
            await expect(notif1).toContainText('has been applied successfully');
            const after = await this.locators.agCenterColsVisible.innerText();
            await this.page.waitForLoadState('networkidle');
            await this.page.waitForTimeout(5000);
            expect(after).not.toBe(before);
            Logger.step('Re-opening bid template menu...');
            await this.locators.templateMenuButton.click();
            await expect(modal).toBeVisible();
            Logger.step('Clicking second menu option...');
            await secondOption.click();
            Logger.step('Waiting for Save as Template dialog...');
            const saveDialog = this.locators.saveTemplateDialog;
            await expect(saveDialog).toBeVisible();
            const header = this.locators.saveTemplateHeader;
            const nameLabel = this.locators.saveTemplateNameLabel;
            const nameInput = this.locators.saveTemplateNameInput;
            const descLabel = this.locators.saveTemplateDescLabel;
            const descInput = this.locators.saveTemplateDescInput;
            const saveCancel = this.locators.saveTemplateCancelBtn;
            const saveBtn = this.locators.saveTemplateSaveBtn;
            await expect(header).toHaveText('Save as Template');
            await expect(nameLabel).toBeVisible();
            await expect(nameInput).toBeVisible();
            await expect(descLabel).toBeVisible();
            await expect(descInput).toBeVisible();
            await expect(saveCancel).toBeVisible();
            await expect(saveBtn).toBeVisible();
            const generatedName = 'Automation Template ' + Date.now();
            await nameInput.fill(generatedName);
            await descInput.fill('This is an automation-generated template.');
            Logger.step('Clicking Save Template...');
            await saveBtn.click();
            const notif2 = this.locators.notificationRootFirst;
            await expect(notif2).toBeVisible({ timeout: 15000 });
            await expect(notif2).toContainText('Template Saved');
            await expect(notif2).toContainText('has been saved successfully');
        } catch (error) {
            Logger.step(`Error in verifyBidTemplate: ${error.message}`);
            throw error;
        }
    }

    async validateAndUpdateFirstRow() {
        try {
            Logger.step('Validating & updating first row of AG Grid...');
            const firstRow = this.locators.firstAgRow;
            await expect(firstRow).toBeVisible();
            const cells = this.locators.agRowCells();
            const cellCount = await cells.count();
            Logger.step(`Total cells in the first row: ${cellCount}`);
            for (let i = 0; i < cellCount; i++) {
                const cell = cells.nth(i);
                await cell.scrollIntoViewIfNeeded();
                let updatedValue = '';
                switch (i) {
                    case 0:
                        updatedValue = 'Appliance';
                        break;
                    case 1:
                    case 2:
                    case 3:
                        updatedValue = 'UpdatedValue_' + Math.floor(Math.random() * 900 + 100);
                        break;
                    case 4:
                        updatedValue = '110';
                        break;
                    default:
                        updatedValue = 'Updated_' + (i + 1);
                        break;
                }
                await cell.click({ force: true });
                await this.page.waitForTimeout(150);
                const input = this.locators.agCellEditorInput;
                const textarea = this.locators.agCellEditorTextarea;
                const editorFound = await Promise.race([
                    input.first().isVisible().then(v => v).catch(() => false),
                    textarea.first().isVisible().then(v => v).catch(() => false)
                ]);
                if (editorFound && (await input.first().isVisible().catch(() => false))) {
                    await input.first().fill(updatedValue);
                } else if (editorFound && (await textarea.first().isVisible().catch(() => false))) {
                    await textarea.first().fill(updatedValue);
                } else {
                    await cell.pressSequentially(updatedValue);
                }
                await this.page.keyboard.press('Enter');
                await this.page.waitForTimeout(150);
            }
        } catch (error) {
            Logger.step(`Error in validateAndUpdateFirstRow: ${error.message}`);
            throw error;
        }
    }

    async updateBidWithMaterial() {
        try {
            Logger.step('Checking bid tab status...');
            await expect(this.locators.bidsTab).toBeVisible();
            await expect(this.locators.bidsTab).toBeEnabled();
            Logger.step('Creating Bid with Material...');
            await this.locators.bidsTab.click();
            await this.locators.bidsTabPanel.getByTestId('bt-add-row').nth(0).click();
            await this.locators.addRowBtn.nth(0).click();
            await this.locators.firstGridCell.dblclick();
            await this.locators.bidSearchInput.fill('Bid with material');
            await this.locators.bidSearchInput.press('Enter');
            await this.page.waitForLoadState('networkidle');
            await this.page.waitForTimeout(5000);
            const quantityCell = this.locators.bidQuantityCell;
            await expect(quantityCell).toBeVisible();
            await quantityCell.dblclick({ force: true });
            await this.page.waitForTimeout(2000);
            await quantityCell.locator('input').fill('100');
            await this.page.waitForLoadState('networkidle');
            await this.page.waitForTimeout(2000);
            await quantityCell.locator('input').press('Enter');
            await this.page.waitForTimeout(200);
            await this.page.waitForLoadState('networkidle');
            await this.page.waitForTimeout(5000);
            const unitPriceCell = this.locators.bidUnitCostCell;
            await expect(unitPriceCell).toBeVisible();
            await unitPriceCell.dblclick({ force: true });
            await this.page.waitForTimeout(2000);
            await unitPriceCell.locator('input').fill('100');
            await unitPriceCell.locator('input').press('Enter');
            await this.page.waitForTimeout(200);
        } catch (error) {
            Logger.step(`Error in updateBidWithMaterial: ${error.message}`);
            throw error;
        }
    }

    async navigateToBidsTab() {
        try {
            Logger.step('Navigating to Bids tab...');
            await expect(this.locators.bidsTab).toBeEnabled();
            await this.locators.bidsTab.click();
            await this.page.waitForLoadState('networkidle');
            await this.page.waitForTimeout(3000);
        } catch (error) {
            Logger.step(`Error in navigateToBidsTab: ${error.message}`);
            throw error;
        }
    }

    async minimizeManageVendors() {
        try {
            Logger.step('Minimizing Manage Vendors pane...');
            if (!(await this.locators.inviteVendorsToBidButton.isVisible())) {
                await this.locators.manageVendorsToggle.click();
                await this.page.waitForTimeout(2000);
            }
        } catch (error) {
            Logger.step(`Error in minimizeManageVendors: ${error.message}`);
            throw error;
        }
    }

    async openFilterPanel() {
        try {
            Logger.step('Opening filter panel...');
            await this.page.getByRole('button').filter({ has: this.page.locator('svg.lucide-funnel') }).click();
            await this.page.waitForTimeout(1000);
        } catch (error) {
            Logger.step(`Error in openFilterPanel: ${error.message}`);
            throw error;
        }
    }

    async applyFilter(filterValue) {
        try {
            Logger.step(`Applying filter: ${filterValue}`);
            // await this.page.getByPlaceholder('Search').fill(filterValue);
            await this.page.locator(`p:has-text("${filterValue}")`).click();
            await this.page.waitForLoadState('networkidle');
            await this.page.waitForTimeout(1500);
        } catch (error) {
            Logger.step(`Error in applyFilter: ${error.message}`);
            throw error;
        }
    }

    async exportProjectList() {
        try {
            Logger.step('Exporting project list...');
            const downloadPromise = this.page.waitForEvent('download');
            await this.locators.exportButton.click();
            return await downloadPromise;
        } catch (error) {
            Logger.step(`Error in exportProjectList: ${error.message}`);
            throw error;
        }
    }

    async downloadAndParseCSV(download) {
        try {
            Logger.step('Parsing downloaded CSV...');
            const filePath = await download.path();
            const fs = require('fs');
            const csvText = fs.readFileSync(filePath, 'utf8');
            const lines = csvText.trim().split('\n');
            const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, ''));
            return lines.slice(1).map(row => {
                const values = row.split(',').map(v => v.replace(/^"|"$/g, ''));
                return Object.fromEntries(headers.map((h, i) => [h, values[i]]));
            });
        } catch (error) {
            Logger.step(`Error in downloadAndParseCSV: ${error.message}`);
            throw error;
        }
    }

    async validateExportResults(parsedData, projectName, filterValue) {
        try {
            Logger.step('Validating exported CSV...');
            const nameCol = Object.keys(parsedData[0]).find(k => k.toLowerCase().includes('name'));
            const propCol = Object.keys(parsedData[0]).find(k => k.toLowerCase().includes('property'));
            expect(nameCol).toBeTruthy();
            expect(propCol).toBeTruthy();
            const rowsByProperty = parsedData.filter(r => r[propCol] === filterValue);
            const rowsByName = parsedData.filter(r => r[nameCol] === projectName);
            Logger.success(`CSV validation complete. Property matches: ${rowsByProperty.length}, Name matches: ${rowsByName.length}`);
        } catch (error) {
            Logger.step(`Error in validateExportResults: ${error.message}`);
            throw error;
        }
    }

    async applyFilterAndExport(filterValue, projectName) {
        try {
            // await this.openFilterPanel();
            // await this.applyFilter(filterValue);
            await this.page.locator(".mantine-ActionIcon-icon .lucide.lucide-funnel:visible").click();
            await this.prop.filterPropertyNew(filterValue);
            const download = await this.exportProjectList();
            const parsed = await this.downloadAndParseCSV(download);
            await this.validateExportResults(parsed, projectName, filterValue);
        } catch (error) {
            Logger.step(`Error in applyFilterAndExport: ${error.message}`);
            throw error;
        }
    }

    async deleteFirstProjectRow() {
        try {
            Logger.step('Deleting first project row...');
            await this.locators.deleteRowBtn.first().click();
            await this.locators.deleteConfirmBtn.click();
        } catch (error) {
            Logger.step(`Error in deleteFirstProjectRow: ${error.message}`);
            throw error;
        }
    }
};
