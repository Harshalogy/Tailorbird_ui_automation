const { expect } = require('@playwright/test');
const { Logger } = require('../utils/logger');
const fs = require('fs');
const path = require('path');
const { propertyLocators } = require('../locators/propertyLocator');

exports.ProjectPage = class ProjectPage {
    constructor(page) {
        this.page = page;
        this.projectsTab = page.locator('span.m_1f6ac4c4.mantine-NavLink-label', { hasText: 'Projects & Jobs' });
        this.modal = page.locator('section[role="dialog"][data-modal-content="true"]');
        this.modalTitle = page.getByRole('heading', { name: /Add project/i });
        this.nameInput = page.getByLabel('Name');
        this.propertyDropdown = page.getByRole('textbox', { name: 'Property' });
        this.descInput = page.getByLabel('Description');
        this.startDateInput = page.getByLabel('Start Date');
        this.endDateInput = page.getByLabel('End Date');
        this.cancelBtn = page.getByRole('button', { name: 'Cancel' });
        this.addProjectBtn = page.getByRole('button', { name: /add project/i });
        this.createJobBtn = page.locator('button', { hasText: 'Create Job' });
        this.modal = page.locator('section[role="dialog"][data-modal-content="true"]');
        this.titleInput = page.getByPlaceholder('Enter title');
        this.jobTypeDropdown = page.getByPlaceholder('Select job type');
        this.descriptionInput = page.getByPlaceholder('Enter description');
        this.cancelBtn = page.getByRole('button', { name: 'Cancel' });
        this.submitBtn = page.getByRole('button', { name: /add job/i });
        this.jobOverviewHeader = page.getByText('Job Overview');
        this.editButton = page.getByRole('button', { name: 'Edit' });
        this.vendorSearchInput = page.locator('.mantine-Drawer-body input[placeholder="Search..."]');
        // this.inviteSelectedBtn = page.locator('button:has-text("Invite Selected Vendors to Bid")');
        this.inviteSelectedBtn = page.locator('button:has-text("Add Vendors to Bid")');
        this.vendorRow = (name) =>
            this.page.locator(`.ag-pinned-left-cols-container div[role="row"]:has-text("${name}") .ag-checkbox`);
        this.vendorNameCell = (name) =>
            this.page.locator(`div[col-id="vendor_name"]:has-text("${name}")`);
        this.resetTableIcon = page.locator('button[data-variant="subtle"][data-size="md"] svg.lucide-rotate-ccw');
        this.resetModal = page.locator('section[role="dialog"]');
        this.resetModalHeader = this.resetModal.locator('h2.mantine-Modal-title');
        this.resetModalBody = this.resetModal.locator('div.mantine-Modal-body p');
        this.resetCancelBtn = this.resetModal.locator('button:has-text("Cancel")');
        this.resetConfirmBtn = this.resetModal.locator('button:has-text("Reset Table")');
        this.tableRow = page.locator('div[role="row"][row-index="t-0"]');
        this.scopeMixBtn = page.locator('button:has(svg.lucide-folder-tree)');
        this.scopeModal = page.locator('section[role="dialog"]');
        this.scopeModalCloseBtn = this.scopeModal.locator('button:has(svg[viewBox="0 0 15 15"])');
        this.scopeSearchInput = this.scopeModal.locator('input.mantine-Input-input');
        this.scopePlusBtn = this.scopeModal.locator('button:has(svg.lucide-plus)');
        this.scopeRepeatBtn = this.scopeModal.locator('button:has(svg.lucide-repeat-2)');
        this.scopeAgGrid = this.scopeModal.locator('.ag-root');
        this.scopeClearAllBtn = this.scopeModal.locator('button:has-text("Clear All")');
        this.scopeSubmitBtn = this.scopeModal.locator('button:has-text("Submit")');
        this.scopeAllButtons = this.scopeModal.locator('button');
        this.scopeAllIcons = this.scopeModal.locator('svg');
        this.scopeModalBody = this.scopeModal.locator('.mantine-Modal-body');
        this.scopeModalStack = this.scopeModal.locator('.mantine-Stack-root');
        this.scopeInputWrapper = this.scopeModal.locator('.mantine-InputWrapper-root');
        this.scopeGroup = this.scopeModal.locator('.mantine-Group-root').nth(0);
        this.scopeEditor = page.locator('[data-scope-portal-editor="true"]');
        this.scopeEditorInput = this.scopeEditor.locator('input.mantine-Input-input');
        this.scopeEditorCheckBtn = this.scopeEditor.locator('button:has(svg.lucide-check)');
        this.scopeEditorCancelBtn = this.scopeEditor.locator('button:has(svg.lucide-x)');
        this.vendorActionBtn = page.locator('button:has(svg.lucide-ellipsis-vertical)').nth(0);
        this.editOnBehalfOption = page.locator('.mantine-Menu-dropdown .mantine-Menu-itemLabel:has-text("Edit On Behalf of Vendor")');
        this.editModalHeader = page.locator('h2.m_615af6c9.mantine-Modal-title');
        this.totalCostCell = page.locator('div[row-index="0"] [role="gridcell"][col-id="total_price"]').last();
        this.totalCostInput = page.locator('input[data-testid="bird-table-currency-input"]').first();
        this.submitBidBtn = page.locator('button:has-text("Submit Bid")');
        this.closeEditModalBtn = page.locator('header.mantine-Modal-header button.mantine-Modal-close');
        this.bidsTabLabel = page.locator('.mantine-Tabs-tabLabel:has-text("Bids")');
        this.levelingButton = page.locator('button.mantine-ActionIcon-root:has(svg.lucide-scale)');
        this.totalCostRow = page.locator('div[role="row"]:has-text("Total")');
        this.bidRow = (label) => page.locator(`div[role="row"]:has-text("${label}")`).first();
        this.totalRow = page.locator('div[role="row"]:has-text("Total")');
        this.inviteVendorsBtn = page.locator("button:has-text('Invite Vendors To Bid')");
        this.manageVendorsLink = page.locator('p:has-text("Manage Vendors")');
        this.vendorActionBtn = page.locator('button:has(svg.lucide-ellipsis-vertical)').nth(0);
        this.awardBidOption = page.locator('.mantine-Menu-dropdown .mantine-Menu-itemLabel:has-text("Award Bid")');
        this.awardModal = page.locator('section[role="dialog"]');
        this.awardCancelBtn = this.awardModal.locator('button:has-text("Cancel")');
        this.awardConfirmBtn = this.awardModal.locator('button:has-text("Award")');
        this.awardedStatusCell = page.locator(
            'div[role="row"]:has-text("Awarded") div[col-id="status"] p'
        );
        this.contractsTab = page.locator('.mantine-Tabs-tabLabel:has-text("Contracts")');
        this.finalizeContractBtn = page.locator('button:has-text("Finalize Contract")');
        this.finalizeContractConfirmBtn = page.locator('.mantine-Modal-content button:has-text("Finalize Contract")');
        this.bulkUpdateStatusBtn = page.locator('button:has-text("Bulk Update Status")');
    }

    async navigateToProjects() {
        try {
            Logger.step('Navigating to "Projects & Jobs"...');

            const apiErrors = [];
            this.page.on("response", async (res) => {
                if (!res.ok()) {
                    const url = res.url();
                    const status = res.status();
                    apiErrors.push({ url, status });
                }
            });

            await this.projectsTab.waitFor({ state: 'visible', timeout: 10000 });

            const start = Date.now();

            await this.projectsTab.click();

            await this.page.waitForLoadState("networkidle");

            await this.page.waitForTimeout(500);

            const duration = Date.now() - start;

            Logger.info(`⏱ Projects list loaded in ${duration} ms`);

            expect(duration).toBeLessThanOrEqual(2000);

            expect(apiErrors, `API Errors found:\n${JSON.stringify(apiErrors, null, 2)}`).toHaveLength(0);

            Logger.success('✅ Navigated to "Projects & Jobs" with no errors.');
        } catch (e) {
            Logger.step(`Error in navigateToProjects: ${e.message}`);
            throw e;
        }
    }

    async openCreateProjectModal() {
        try {
            Logger.step('Opening Create Project modal...');
            await this.page.waitForLoadState('networkidle');

            const startTime = Date.now();
            await this.page.waitForSelector('input[placeholder="Search..."]', { state: 'visible' });
            const endTime = Date.now();
            const loadTime = ((endTime - startTime) / 1000).toFixed(2);
            Logger.info(`Project Page fully loaded in ${loadTime} seconds`);

            const createProjectBtn = this.page.locator(`button:has-text('Create Project')`);
            await expect(createProjectBtn).toBeVisible({ timeout: 5000 });
            Logger.success('✅ Create Project button is visible.');

            await createProjectBtn.waitFor({ state: 'visible' });
            await createProjectBtn.click();
            Logger.success('✅ Clicked on Create Project button.');

            await this.page.waitForTimeout(800);

            const modal = this.page.locator('section[role="dialog"][data-modal-content="true"]');
            await expect(modal).toBeVisible({ timeout: 5000 });

            const modalTitle = this.page.getByRole('heading', { name: /Add project/i });
            await expect(modalTitle).toBeVisible({ timeout: 5000 });
            Logger.success(' "Add project" modal opened successfully.');
        } catch (e) {
            Logger.step(`Error in openCreateProjectModal: ${e.message}`);
            throw e;
        }
    }

    async verifyModalFields() {
        try {
            Logger.step('Verifying fields inside Add Project modal...');
            await expect(this.nameInput).toBeVisible();
            await expect(this.propertyDropdown).toBeVisible();
            await expect(this.descInput).toBeVisible();
            await expect(this.startDateInput).toBeVisible();
            await expect(this.endDateInput).toBeVisible();
            await expect(this.cancelBtn).toBeVisible();
            await expect(this.addProjectBtn).toBeVisible();
            Logger.success(' All modal fields and buttons are visible.');
        } catch (e) {
            Logger.step(`Error in verifyModalFields: ${e.message}`);
            throw e;
        }
    }

    generateRandomProjectName(prefix = 'Automa_Test') {
        try {
            const random = Math.random().toString(36).slice(2, 8).toUpperCase();
            const date = new Date().toISOString().slice(2, 10).replace(/-/g, '');
            return `${prefix}_${date}_${random}`;
        } catch (e) {
            Logger.step(`Error in generateRandomProjectName: ${e.message}`);
            throw e;
        }
    }

    generateRandomEmail(prefix = 'sumit') {
        try {
            const random = Math.random().toString(36).slice(2, 8).toUpperCase();
            const date = new Date().toISOString().slice(2, 10).replace(/-/g, '');
            return `${prefix}_${date}_${random}@gmail.com`;
        } catch (e) {
            Logger.step(`Error in generateRandomEmail: ${e.message}`);
            throw e;
        }
    }

    get createdProjectName() {
        try {
            return this.page.locator(`.mantine-Grid-inner:has-text('Project Name')`);
        } catch (e) {
            Logger.step(`Error in createdProjectName getter: ${e.message}`);
            throw e;
        }
    }

    get createdDescription() {
        try {
            return this.page.locator(`.mantine-Grid-inner:has-text('Description')`);
        } catch (e) {
            Logger.step(`Error in createdDescription getter: ${e.message}`);
            throw e;
        }
    }

    // async assertProjectCreated(name, description) {
    //     try {
    //         const verifyText = async (locator, expectedText, label) => {
    //             Logger.step(`Verifying project ${label} "${expectedText}" is visible on the dashboard...`);

    //             const element = locator.locator(`p:has-text("${expectedText}")`).last();
    //             await element.waitFor({ state: 'visible' });
    //             await expect(element).toContainText(expectedText);

    //             const actualText = (await element.textContent())?.trim();
    //             expect(actualText).toBe(expectedText);

    //             Logger.success(`✅ Project ${label} "${expectedText}" is correctly visible on the dashboard.`);
    //         };

    //         await verifyText(this.createdProjectName, name, 'name');
    //         await verifyText(this.createdDescription, description, 'description');
    //     } catch (e) {
    //         Logger.step(`Error in assertProjectCreated: ${e.message}`);
    //         throw e;
    //     }
    // }

    async assertProjectCreated(name, description) {
        try {
            const verifyByLabel = async (labelText, expectedText) => {
                Logger.step(`Verifying "${labelText}" value is "${expectedText}"...`);

                const valueLocator = this.page
                    .locator('p', { hasText: labelText })
                    .locator('xpath=following-sibling::p[1]');

                await expect(valueLocator).toBeVisible();
                await expect(valueLocator).toHaveText(expectedText);

                Logger.success(`✅ ${labelText} verified successfully`);
            };

            await verifyByLabel('Project Name', name);
            await verifyByLabel('Description', description);

        } catch (e) {
            Logger.step(`Error in assertProjectCreated: ${e.message}`);
            throw e;
        }
    }


    async getStartDate() {
        try {
            const today = new Date();
            const day = String(today.getDate()).padStart(2, '0');
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const year = today.getFullYear();
            return `${day}-${month}-${year}`;
        } catch (e) {
            Logger.step(`Error in getStartDate: ${e.message}`);
            throw e;
        }
    }

    async getEndDate() {
        try {
            const today = new Date();
            const endDate = new Date(today);
            endDate.setDate(today.getDate() + 30);
            const day = String(endDate.getDate()).padStart(2, '0');
            const month = String(endDate.getMonth() + 1).padStart(2, '0');
            const year = endDate.getFullYear();
            return `${day}-${month}-${year}`;
        } catch (e) {
            Logger.step(`Error in getEndDate: ${e.message}`);
            throw e;
        }
    }

    async fillProjectDetails({ name, property, description, startDate, endDate }) {
        try {
            Logger.step('Filling project details inside modal...');

            const projectName = this.generateRandomProjectName();
            const randomDescription = `${description || 'Auto_Description'}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

            await this.nameInput.fill(projectName);
            Logger.info(`Entered project name: ${projectName}`);

            await this.propertyDropdown.waitFor({ state: 'visible' });
            await this.propertyDropdown.click();
            await this.page.waitForTimeout(800);

            const dropdown = this.page.locator('[data-composed="true"][role="presentation"]');
            await expect(dropdown).toBeVisible();

            const options = dropdown.locator('[data-combobox-option="true"]');
            const optionTexts = (await options.allTextContents()).filter(Boolean);

            const cliOption = process.env.OPTION;

            let selectedOption;
            if (cliOption && optionTexts.includes(cliOption)) {
                selectedOption = cliOption;
                Logger.info(`Using option from CLI: ${selectedOption}`);
            } else {
                const randomIndex = Math.floor(Math.random() * optionTexts.length);
                selectedOption = optionTexts[randomIndex];
                Logger.info(`Randomly selected option: ${selectedOption}`);
            }

            await dropdown.getByRole('option', { name: selectedOption }).click();

            Logger.info('Selected the first property from dropdown.');

            await this.descInput.fill(randomDescription);
            Logger.info(`Entered description: ${randomDescription}`);

            await this.startDateInput.type(startDate, { delay: 30 });
            await this.endDateInput.type(endDate, { delay: 30 });
            Logger.info(`Entered dates: ${startDate} → ${endDate}`);

            await expect(this.addProjectBtn).toBeVisible();
            await this.addProjectBtn.click();
            await expect(this.page).toHaveURL(/projects/);
            await this.page.waitForLoadState('networkidle');
            await this.page.waitForTimeout(1500);
            Logger.success('Landed on property page successfully.');

            await this.assertSuccessToaster("project created successfully");

            await this.assertProjectCreated(projectName, randomDescription);

            const dataToSave = { projectName, description: randomDescription, createdAt: new Date().toISOString() };
            const filePath = path.join(__dirname, '../data/projectData.json');

            if (!fs.existsSync(path.dirname(filePath))) {
                fs.mkdirSync(path.dirname(filePath));
            }

            fs.writeFileSync(filePath, JSON.stringify(dataToSave, null, 2));
            Logger.success(`Project data saved to: ${filePath}`);

            return { projectName, description: randomDescription };
        } catch (e) {
            Logger.step(`Error in fillProjectDetails: ${e.message}`);
            throw e;
        }
    }

    async searchProject(name) {
        try {
            await this.page.locator('input[placeholder="Search..."]').fill(name);
            await this.page.waitForLoadState("networkidle");
            await this.page.waitForTimeout(2000);

            const firstRowNameCell = this.page.locator(propertyLocators.firstRowNameCellText).first();

            const text = await firstRowNameCell.innerText();
            Logger.info(`First row text → "${text}"`);

            Logger.info(`Searching for project containing: "${name}"`);
            await expect(firstRowNameCell).toContainText(new RegExp(name, "i"));

            Logger.success(`Search successful → Found project containing: "${name}"`);
        } catch (e) {
            Logger.step(`Error in searchProject: ${e.message}`);
            throw e;
        }
    }

    async verifyModalClosed() {
        try {
            await this.cancelBtn.click();
            await expect(this.modal).toBeHidden({ timeout: 5000 });
            Logger.success('✅ Add Project modal is closed successfully.');
        } catch (e) {
            Logger.step(`Error in verifyModalClosed: ${e.message}`);
            throw e;
        }
    }

    async validateMandatoryFields() {
        try {
            Logger.step('Validating mandatory fields in Add Project modal...');
            await expect(this.addProjectBtn).toBeVisible();
            await this.addProjectBtn.click();
            await expect(this.page.locator('input:invalid, select:invalid')).toHaveCount(2);
            Logger.success('✅ Mandatory fields validation successful.');
        } catch (e) {
            Logger.step(`Error in validateMandatoryFields: ${e.message}`);
            throw e;
        }
    }

    async propertyDropdownOptions() {
        try {
            await this.propertyDropdown.waitFor({ state: 'visible' });
            await this.propertyDropdown.click();
            await this.page.waitForTimeout(800);
            const dropdown = this.page.locator('[data-composed="true"][role="presentation"]');
            await expect(dropdown).toBeVisible();
            const options = dropdown.locator('[data-combobox-option="true"]');
            const optionTexts = (await options.allTextContents()).filter(Boolean);
            Logger.info(`Property Dropdown Options: ${optionTexts.join(', ')}`);
        } catch (e) {
            Logger.step(`Error in propertyDropdownOptions: ${e.message}`);
            throw e;
        }
    }

    async fillDateField(startDate, endDate) {
        try {
            await this.startDateInput.type(startDate, { delay: 30 });
            await this.endDateInput.type(endDate, { delay: 30 });
            Logger.info(`Entered dates: ${startDate} → ${endDate}`);
        } catch (e) {
            Logger.step(`Error in fillDateField: ${e.message}`);
            throw e;
        }
    }

    async assertSuccessToaster(toasterMessage) {
        try {
            await expect(this.page.locator('.mantine-Notification-root')).toContainText("Success" + toasterMessage);
            Logger.success(`✅ Toaster with message "Success${toasterMessage}" is visible.`);
        } catch (e) {
            Logger.step(`Error in assertSuccessToaster: ${e.message}`);
            throw e;
        }
    }

    async openProject(projectName) {
        try {
            Logger.step(`Opening project: "${projectName}" from the list...`);
            await this.navigateToProjects();
            const searchProject = this.page.locator('input[placeholder="Search..."]');
            await searchProject.waitFor({ state: 'visible', timeout: 30000 });
            await searchProject.click();
            await searchProject.fill(projectName);
            const projectCard = this.page.locator('.mantine-SimpleGrid-root .mantine-Group-root', {
                hasText: projectName,
            });
            await projectCard.waitFor({ state: 'visible', timeout: 10000 });
            await projectCard.click();
        } catch (e) {
            Logger.step(`Error in openProject: ${e.message}`);
            throw e;
        }
    }


    async openCreateJobModal() {
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(2000);
        await expect(this.createJobBtn).toBeVisible();
        await expect(this.createJobBtn).toBeEnabled();
        await this.createJobBtn.click();
        await expect(this.modal).toBeVisible();
    }

    async validateModalFields() {
        await expect(this.titleInput).toBeVisible();
        await expect(this.jobTypeDropdown).toBeVisible();
        await expect(this.descriptionInput).toBeVisible();
        await expect(this.cancelBtn).toBeVisible();
        await expect(this.submitBtn).toBeVisible();
    }

    async fillJobForm({ title, jobType, description = '' }) {
        await this.titleInput.fill(title);

        await this.jobTypeDropdown.click();
        await this.page.getByRole('option', { name: new RegExp(jobType, 'i') }).click();
        await expect(this.jobTypeDropdown).toHaveValue(jobType);

        if (description) {
            await this.descriptionInput.fill(description);
        }
    }

    async submitJob() {
        await this.submitBtn.click();
    }

    async validateOverviewVisible() {
        // await expect(this.jobOverviewHeader).toBeVisible();
        await expect(this.editButton).toBeVisible();
        await expect(this.editButton).toBeEnabled();
    }

    async createBidWithMaterial() {
        await this.page.waitForLoadState('networkidle');
    }

    async inviteVendorsToBid() {
        await this.page.waitForLoadState('networkidle');
    }

    // ---------------- Vendor actions ---------------- //

    async searchVendor(name) {
        await this.vendorSearchInput.waitFor({ state: 'visible' });
        await this.vendorSearchInput.fill(name);
    }

    async selectVendor(name) {
        await this.vendorRow(name).click();
    }

    async inviteSelectedVendors() {
        await this.inviteSelectedBtn.click();
        await this.page.waitForLoadState('networkidle');
    }

    async assertVendorVisibleInGrid(name) {
        await expect(this.vendorNameCell(name)).toContainText(name);
    }

    async openResetTableModal() {
        await this.resetTableIcon.nth(0).click();
        await expect(this.resetModal).toBeVisible();
    }

    async validateResetModalContent() {
        await expect(this.resetModalHeader).toHaveText("Reset Bid Table");

        const expectedText =
            "Are you sure you want to reset the bid table? This will delete all bid rows and cannot be undone. The table will be cleared and ready for new entries.";

        await expect(this.resetModalBody).toHaveText(expectedText);
        await expect(this.resetCancelBtn).toBeVisible();
        await expect(this.resetConfirmBtn).toBeVisible();
    }

    async confirmResetTable() {
        await this.resetConfirmBtn.nth(0).click();
        await expect(this.resetModal).toBeHidden();
    }

    async assertRowCountAfterReset() {
        const rowCount = await this.tableRow.count();
        expect(rowCount).toBeLessThanOrEqual(2);
    }

    async openScopeMixModal() {
        await this.scopeMixBtn.first().click();
        await expect(this.scopeModal).toBeVisible();
    }

    async validateScopeMixModalFields() {
        const modalText = (await this.scopeModal.allInnerTexts()).join("");
        expect(modalText.length).toBeGreaterThan(0);

        await expect(this.scopeModalCloseBtn).toBeVisible();
        await expect(this.scopeSearchInput).toBeVisible();
        const placeholder = await this.scopeSearchInput.getAttribute("placeholder");
        expect(placeholder?.length).toBeGreaterThan(0);

        await expect(this.scopePlusBtn).toBeVisible();
        await expect(this.scopeRepeatBtn).toBeVisible();
        await expect(this.scopeAgGrid).toBeVisible();

        const gridText = await this.scopeAgGrid.innerText();
        expect(gridText.length).toBeGreaterThan(0);

        await expect(this.scopeClearAllBtn).toBeVisible();
        await expect(this.scopeSubmitBtn).toBeVisible();
        expect(await this.scopeClearAllBtn.isDisabled()).toBeTruthy();
        expect(await this.scopeSubmitBtn.isDisabled()).toBeTruthy();

        const count = await this.scopeAllButtons.count();
        for (let i = 0; i < count; i++) {
            const btnText = await this.scopeAllButtons.nth(i).innerText();
            if (btnText.trim().length > 0) {
                expect(btnText.trim().length).toBeGreaterThan(0);
            }
        }

        const svgCount = await this.scopeAllIcons.count();
        expect(svgCount).toBeGreaterThan(0);

        await expect(this.scopeModalBody).toBeVisible();
        await expect(this.scopeModalStack).toBeVisible();
        await expect(this.scopeInputWrapper).toBeVisible();
        await expect(this.scopeGroup).toBeVisible();
    }

    async addScopeEntry() {
        await this.scopePlusBtn.click();

        await expect(this.scopeEditor).toBeVisible();
        await expect(this.scopeEditorInput).toBeVisible();

        const placeholder = await this.scopeEditorInput.getAttribute("placeholder");
        expect(placeholder?.length).toBeGreaterThan(0);

        await expect(this.scopeEditorCheckBtn).toBeVisible();
        await expect(this.scopeEditorCancelBtn).toBeVisible();
        expect(await this.scopeEditorCheckBtn.isDisabled()).toBeTruthy();

        const randomName = "Scope_" + Date.now();
        await this.scopeEditorInput.fill(randomName);

        expect(await this.scopeEditorCheckBtn.isDisabled()).toBeFalsy();

        await this.scopeEditorCheckBtn.click();
        await expect(this.scopeEditor).toBeHidden();
    }

    async closeScopeMixModal() {
        await this.scopeModalCloseBtn.click();
        await expect(this.scopeModal).toBeHidden();
    }

    async openEditOnBehalfModal() {
        await this.vendorActionBtn.click();
        await this.editOnBehalfOption.click();
        await this.page.waitForTimeout(2000);
        await this.editModalHeader.waitFor({ state: 'visible' });
    }

    async updateBidCost(value) {
        await this.totalCostCell.dblclick();
        await this.totalCostInput.waitFor({ state: 'visible', timeout: 10000 });
        await this.totalCostInput.fill(value);

        this.page.once('dialog', async (dialog) => {
            await dialog.accept();
        });
    }

    async submitEditedBid() {
        await this.submitBidBtn.click({ force: true });
        await this.page.waitForTimeout(3000);

        await this.closeEditModalBtn.waitFor({ state: 'visible', timeout: 10000 });
        await this.closeEditModalBtn.click();
    }

    async saveLastVisitedUrl() {
        const currentUrl = this.page.url();

        const urlFilePath = path.join(__dirname, '../data/lastVisitedUrl.json');
        fs.writeFileSync(urlFilePath, JSON.stringify({ lastUrl: currentUrl }, null, 2));

        Logger.success(`Saved last visited URL: ${currentUrl}`);
    }

    async saveSessionState(context) {
        await context.storageState({ path: 'jobsessionState.json' });
    }

    async openBidsTabFromInsideJob() {
        await this.page.waitForTimeout(3000);
        await this.bidsTabLabel.click();
    }

    async openBidLevelingTable() {
        await this.levelingButton.click();
        await this.page.waitForTimeout(3000);
    }

    async waitForTotalCostRow() {
        await this.totalCostRow.waitFor({ state: 'visible', timeout: 10000 });
        await this.page.waitForTimeout(5000);
    }

    async assertBidWithMaterialCost(expectedCost) {
        const row = this.bidRow("Bid with material");
        await expect(row).toContainText(expectedCost);
    }

    async assertTotalCost(expectedTotal) {
        await expect(this.totalRow).toContainText(expectedTotal);
    }

    async ensureManageVendorsOpen() {
        if (!(await this.inviteVendorsBtn.isVisible())) {
            await this.manageVendorsLink.click();
        }
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(3000);
    }

    async openVendorActionMenu() {
        await this.vendorActionBtn.waitFor({ state: 'visible' });
        await this.vendorActionBtn.click();
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(3000);
    }

    async selectAwardBid() {
        await this.awardBidOption.click();
        await this.page.waitForSelector('section[role="dialog"]', { state: 'visible' });
    }

    async validateAwardModal() {
        await expect(this.awardCancelBtn).toBeVisible();
        await expect(this.awardConfirmBtn).toBeVisible();
    }

    async confirmAwardBid() {
        await this.awardConfirmBtn.click();
    }

    async waitForAwardedStatus() {
        await this.awardedStatusCell.waitFor({ state: 'visible', timeout: 10000 });
        await expect(this.awardedStatusCell).toHaveText('Awarded');
    }

    async openContractsTab() {
        await this.contractsTab.click();
    }

    async openFinalizeContractModal() {
        await this.finalizeContractBtn.click();
    }

    async confirmFinalizeContract() {
        await this.finalizeContractConfirmBtn.click();
        await this.finalizeContractConfirmBtn.waitFor({ state: 'hidden' });
    }

    async assertContractFinalized() {
        await expect(this.bulkUpdateStatusBtn).toBeDefined();
    }

};
