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

    async assertProjectCreated(name, description) {
        try {
            const verifyText = async (locator, expectedText, label) => {
                Logger.step(`Verifying project ${label} "${expectedText}" is visible on the dashboard...`);

                const element = locator.locator(`p:has-text("${expectedText}")`).last();
                await element.waitFor({ state: 'visible' });
                await expect(element).toContainText(expectedText);

                const actualText = (await element.textContent())?.trim();
                expect(actualText).toBe(expectedText);

                Logger.success(`✅ Project ${label} "${expectedText}" is correctly visible on the dashboard.`);
            };

            await verifyText(this.createdProjectName, name, 'name');
            await verifyText(this.createdDescription, description, 'description');
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

};
