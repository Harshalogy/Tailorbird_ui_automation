const { expect } = require("@playwright/test");
const { Logger } = require('../utils/logger');

class InvoicePage {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        this.page = page;

        // Add Invoice button
        this.addInvoiceButton = page.locator('button:has-text("Invoice")').last();

        // Add Change Order button
        this.addChangeOrderButton = page.locator('button:has-text("Change Order")').last();

        // Invoice table/grid
        this.invoiceTable = page.locator('[role="grid"]');
        this.invoiceRows = page.locator('[role="row"]');
        this.invoiceTab = page.locator('.mantine-Tabs-tabLabel:has-text("Invoice")');
        this.changeOrderTab = page.locator('.mantine-Tabs-tabLabel:has-text("Change Orders")');

        // Invoice detail form selectors
        this.titleInput = page.locator('input[placeholder*="Title"], input[placeholder*="title"], input[name*="title"]').first();
        this.amountInput = page.locator('input[placeholder*="Amount"], input[placeholder*="amount"], input[name*="amount"]').first();
        this.descriptionInput = page.locator('textarea, input[placeholder*="Description"], input[placeholder*="description"]').first();

        // File upload
        this.fileUploadInput = page.locator('input[type="file"]');
        this.uploadButton = page.locator('button:has-text("Upload"), label:has-text("Upload")').first();

        // Buttons
        this.saveButton = page.locator('button:has-text("Save"), button:has-text("Confirm"), button:has-text("Submit")').first();
        this.cancelButton = page.locator('button:has-text("Cancel")').first();
        this.deleteButton = page.locator('button:has-text("Delete")').first();

        // Modal/Dialog
        this.modal = page.locator('dialog, [role="dialog"], .mantine-Modal-root').first();

        // View Invoice button
        this.viewInvoiceButton = page.locator('button[title="View Invoice"]').first();

        // Success message
        this.successMessage = page.locator('text=/[Ss]uccess|[Cc]ompleted|[Ss]aved/').first();

        // Invoice stats
        this.currentContractAmount = page.locator('text=Current Contract').locator('..').locator('p').first();
        this.approvedInvoiceAmount = page.locator('text=Approved Invoices').locator('..').locator('p').first();
        this.contractRemaining = page.locator('text=Contract Remaining').locator('..').locator('p').first();
        this.pendingInvoiceAmount = page.locator('text=Pending Invoices').locator('..').locator('p').first();
    }

    async navigateToInvoices(jobUrl) {
        try {
            Logger.step('Navigating to Invoice tab...');
            await this.page.goto(jobUrl, { waitUntil: 'networkidle' });
            await expect(this.page).toHaveURL(/tab=invoices/);
            await this.page.waitForTimeout(1000);
            Logger.success('Navigated to Invoice tab successfully.');
        } catch (error) {
            Logger.error(`Error navigating to invoices: ${error.message}`);
            throw error;
        }
    }

    async clickAddInvoice() {
        try {
            Logger.step('Clicking Add Invoice button...');
            await this.addInvoiceButton.waitFor({ state: 'visible', timeout: 10000 });
            await this.addInvoiceButton.click();
            await this.page.waitForLoadState('networkidle');
            await this.page.waitForTimeout(1000);
            Logger.success('Add Invoice button clicked.');
        } catch (error) {
            Logger.error(`Error clicking Add Invoice: ${error.message}`);
            throw error;
        }
    }

    async fillInvoiceTitle(title) {
        try {
            Logger.step(`Filling invoice title: ${title}`);
            if (await this.titleInput.isVisible({ timeout: 5000 }).catch(() => false)) {
                await this.titleInput.fill(title);
                Logger.success(`Invoice title filled: ${title}`);
            } else {
                Logger.info('Title input not found');
            }
        } catch (error) {
            Logger.error(`Error filling title: ${error.message}`);
            throw error;
        }
    }

    async fillInvoiceAmount(amount) {
        try {
            Logger.step(`Filling invoice amount: ${amount}`);
            if (await this.amountInput.isVisible({ timeout: 5000 }).catch(() => false)) {
                await this.amountInput.fill(amount);
                Logger.success(`Invoice amount filled: ${amount}`);
            } else {
                Logger.info('Amount input not found');
            }
        } catch (error) {
            Logger.error(`Error filling amount: ${error.message}`);
            throw error;
        }
    }

    async fillInvoiceDescription(description) {
        try {
            Logger.step(`Filling invoice description: ${description}`);
            if (await this.descriptionInput.isVisible({ timeout: 5000 }).catch(() => false)) {
                await this.descriptionInput.fill(description);
                Logger.success(`Invoice description filled: ${description}`);
            } else {
                Logger.info('Description input not found');
            }
        } catch (error) {
            Logger.error(`Error filling description: ${error.message}`);
            throw error;
        }
    }

    async uploadInvoiceImage(filePath) {
        try {
            Logger.step(`Uploading invoice image: ${filePath}`);
            if (await this.fileUploadInput.isVisible({ timeout: 5000 }).catch(() => false)) {
                await this.fileUploadInput.setInputFiles(filePath);
                await this.page.waitForLoadState('networkidle');
                await this.page.waitForTimeout(1000);
                Logger.success(`Invoice image uploaded: ${filePath}`);
            } else {
                Logger.info('File upload input not found');
            }
        } catch (error) {
            Logger.error(`Error uploading image: ${error.message}`);
            throw error;
        }
    }

    async saveInvoice() {
        try {
            Logger.step('Saving invoice...');
            if (await this.saveButton.isVisible({ timeout: 5000 }).catch(() => false)) {
                await this.saveButton.click();
                await this.page.waitForLoadState('networkidle');
                await this.page.waitForTimeout(1000);
                Logger.success('Invoice saved successfully.');
                return true;
            } else {
                Logger.info('Save button not found');
                return false;
            }
        } catch (error) {
            Logger.error(`Error saving invoice: ${error.message}`);
            throw error;
        }
    }

    async isModalOpen() {
        try {
            return await this.modal.isVisible({ timeout: 3000 }).catch(() => false);
        } catch (error) {
            Logger.error(`Error checking modal: ${error.message}`);
            return false;
        }
    }

    async closeModal() {
        try {
            Logger.step('Closing modal...');
            if (await this.cancelButton.isVisible({ timeout: 3000 }).catch(() => false)) {
                await this.cancelButton.click();
                await this.page.waitForTimeout(500);
                Logger.success('Modal closed.');
            } else {
                // Try pressing Escape key
                await this.page.keyboard.press('Escape');
                Logger.success('Closed modal with Escape key.');
            }
        } catch (error) {
            Logger.error(`Error closing modal: ${error.message}`);
            throw error;
        }
    }

    async verifyInvoiceAdded() {
        try {
            Logger.step('Verifying invoice was added...');
            const invoiceCount = await this.invoiceRows.count();
            if (invoiceCount > 0) {
                Logger.success(`Invoice added. Total invoices: ${invoiceCount}`);
                return true;
            } else {
                Logger.info('No invoices found');
                return false;
            }
        } catch (error) {
            Logger.error(`Error verifying invoice: ${error.message}`);
            throw error;
        }
    }

    async getInvoiceStats() {
        try {
            Logger.step('Fetching invoice statistics...');
            const currentContract = await this.currentContractAmount.textContent().catch(() => null);
            const approvedInvoices = await this.approvedInvoiceAmount.textContent().catch(() => null);
            const remaining = await this.contractRemaining.textContent().catch(() => null);
            const pending = await this.pendingInvoiceAmount.textContent().catch(() => null);

            return {
                currentContract,
                approvedInvoices,
                remaining,
                pending
            };
        } catch (error) {
            Logger.error(`Error fetching stats: ${error.message}`);
            throw error;
        }
    }

    async navigateToInvoiceTab() {
        try {
            Logger.step('Navigating to Invoice tab...');
            await expect(this.invoiceTab).toBeEnabled();
            await this.invoiceTab.click();
            await this.page.waitForLoadState('networkidle');
            await this.page.waitForTimeout(3000);
        } catch (error) {
            Logger.step(`Error in navigateToInvoiceTab: ${error.message}`);
            throw error;
        }
    }

     async navigateToChangeOrderTab() {
        try {
            Logger.step('Navigating to Change Order tab...');
            await expect(this.changeOrderTab).toBeEnabled();
            await this.changeOrderTab.click();
            await this.page.waitForLoadState('networkidle');
            await this.page.waitForTimeout(3000);
        } catch (error) {
            Logger.step(`Error in navigateToChangeOrderTab: ${error.message}`);
            throw error;
        }
    }

    async clickAddChangeOrder() {
        try {
            Logger.step('Clicking Add Change Order button...');
            await this.addChangeOrderButton.waitFor({ state: 'visible', timeout: 10000 });
            await this.addChangeOrderButton.click();
            await this.page.waitForLoadState('networkidle');
            await this.page.waitForTimeout(1000);
            Logger.success('Add Change Order button clicked.');
        } catch (error) {
            Logger.error(`Error clicking Add Change Order: ${error.message}`);
            throw error;
        }
    }

    async fillChangeOrderTitle(title) {
        try {
            Logger.step(`Filling change order title: ${title}`);
            if (await this.titleInput.isVisible({ timeout: 5000 }).catch(() => false)) {
                await this.titleInput.fill(title);
                Logger.success(`Change order title filled: ${title}`);
            } else {
                Logger.info('Title input not found');
            }
        } catch (error) {
            Logger.error(`Error filling title: ${error.message}`);
            throw error;
        }
    }

    async fillChangeOrderAmount(amount) {
        try {
            Logger.step(`Filling change order amount: ${amount}`);
            if (await this.amountInput.isVisible({ timeout: 5000 }).catch(() => false)) {
                await this.amountInput.fill(amount);
                Logger.success(`Change order amount filled: ${amount}`);
            } else {
                Logger.info('Amount input not found');
            }
        } catch (error) {
            Logger.error(`Error filling amount: ${error.message}`);
            throw error;
        }
    }

    async fillChangeOrderDescription(description) {
        try {
            Logger.step(`Filling change order description: ${description}`);
            if (await this.descriptionInput.isVisible({ timeout: 5000 }).catch(() => false)) {
                await this.descriptionInput.fill(description);
                Logger.success(`Change order description filled: ${description}`);
            } else {
                Logger.info('Description input not found');
            }
        } catch (error) {
            Logger.error(`Error filling description: ${error.message}`);
            throw error;
        }
    }

    async uploadChangeOrderImage(filePath) {
        try {
            Logger.step(`Uploading change order image: ${filePath}`);
            if (await this.fileUploadInput.isVisible({ timeout: 5000 }).catch(() => false)) {
                await this.fileUploadInput.setInputFiles(filePath);
                await this.page.waitForLoadState('networkidle');
                await this.page.waitForTimeout(1000);
                Logger.success(`Change order image uploaded: ${filePath}`);
            } else {
                Logger.info('File upload input not found');
            }
        } catch (error) {
            Logger.error(`Error uploading image: ${error.message}`);
            throw error;
        }
    }

    async saveChangeOrder() {
        try {
            Logger.step('Saving change order...');
            if (await this.saveButton.isVisible({ timeout: 5000 }).catch(() => false)) {
                await this.saveButton.click();
                await this.page.waitForLoadState('networkidle');
                await this.page.waitForTimeout(1000);
                Logger.success('Change order saved successfully.');
                return true;
            } else {
                Logger.info('Save button not found');
                return false;
            }
        } catch (error) {
            Logger.error(`Error saving change order: ${error.message}`);
            throw error;
        }
    }

    async verifyChangeOrderAdded() {
        try {
            Logger.step('Verifying change order was added...');
            const rowCount = await this.invoiceRows.count();
            if (rowCount > 0) {
                Logger.success(`Change order added. Total rows: ${rowCount}`);
                return true;
            } else {
                Logger.info('No change orders found');
                return false;
            }
        } catch (error) {
            Logger.error(`Error verifying change order: ${error.message}`);
            throw error;
        }
    }

    async exportChangeOrderData() {
        try {
            Logger.step('Exporting change order data...');
            const exportButton = this.page.locator('button:has-text("Export"), button:has-text("Download")').first();
            if (await exportButton.isVisible({ timeout: 5000 }).catch(() => false)) {
                await exportButton.click();
                await this.page.waitForLoadState('networkidle');
                await this.page.waitForTimeout(2000);
                Logger.success('Change order data exported.');
                return true;
            } else {
                Logger.info('Export button not found');
                return false;
            }
        } catch (error) {
            Logger.error(`Error exporting data: ${error.message}`);
            throw error;
        }
    }

    async addDataToChangeOrder(dataFields) {
        try {
            Logger.step('Adding data to change order...');
            if (dataFields.title) {
                await this.fillChangeOrderTitle(dataFields.title);
            }
            if (dataFields.amount) {
                await this.fillChangeOrderAmount(dataFields.amount);
            }
            if (dataFields.description) {
                await this.fillChangeOrderDescription(dataFields.description);
            }
            Logger.success('Change order data added successfully.');
        } catch (error) {
            Logger.error(`Error adding data: ${error.message}`);
            throw error;
        }
    }
}

module.exports = { InvoicePage };
