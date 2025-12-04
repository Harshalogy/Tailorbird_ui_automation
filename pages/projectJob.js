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
        // await this.locators.viewDetailsButton.click();
        await this.locators.jobSummaryTab.click();
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
};
