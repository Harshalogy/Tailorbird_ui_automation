const { expect } = require("@playwright/test");
const { Logger } = require('../utils/logger');

class InvoicePage {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        this.page = page;

        // Add Invoice button - navigates to invoice creation page
        this.addInvoiceButton = page.getByRole('button', { name: 'Invoice', exact: true });

        // Add Change Order button
        this.addChangeOrderButton = page.getByRole('button', { name: 'Change Order' }).last();

        // Invoice table/grid - AG Grid structure
        // Multiple selectors for robustness - use locator with filter to find the invoice grid
        this.invoiceTable = page.locator('[role="grid"]').filter({ hasText: 'Invoice Number' }).first();
        this.invoiceRows = page.locator('[role="grid"]').filter({ hasText: 'Invoice Number' }).locator('[role="row"]');
        this.invoiceTab = page.getByRole('tab', { name: 'Invoice' });
        this.changeOrderTab = page.getByRole('tab', { name: 'Change Orders' });

        // Invoice detail form selectors (on invoice detail page)
        this.titleInput = page.locator('textbox[placeholder="Enter title"]').or(page.locator('input[placeholder*="title"]')).first();
        this.amountInput = page.locator('input[type="number"]').or(page.locator('input[placeholder*="amount"]')).first();
        this.descriptionInput = page.locator('textbox[placeholder="Enter description"]').or(page.locator('textarea')).first();

        // File upload
        this.fileUploadInput = page.locator('input[type="file"]');
        this.uploadButton = page.locator('button').filter({ hasText: /upload|Upload/i }).first();

        // Buttons
        this.saveButton = page.getByRole('button', { name: /save|confirm|submit/i }).first();
        this.cancelButton = page.getByRole('button', { name: 'Cancel' }).or(page.getByRole('button', { name: 'Go Back' })).first();
        this.deleteButton = page.getByRole('button', { name: /delete/i }).first();
        this.goBackButton = page.getByRole('button', { name: 'Go Back' });

        // View Invoice button
        this.viewInvoiceButton = page.getByRole('button', { name: 'View Invoice' }).first();

        // Success message
        this.successMessage = page.locator('text=/[Ss]uccess|[Cc]ompleted|[Ss]aved/').first();

        // Invoice stats
        this.currentContractAmount = page.locator('text=Current Contract').locator('..').locator('p').first();
        this.approvedInvoiceAmount = page.locator('text=Approved Invoices').locator('..').locator('p').first();
        this.contractRemaining = page.locator('text=Contract Remaining').locator('..').locator('p').first();
        this.pendingInvoiceAmount = page.locator('text=Pending Invoices').locator('..').locator('p').first();
    }

    // Getter to ensure fresh dialog locator - uses multiple selectors for robustness
    get modal() {
        // Try multiple selectors to find the dialog/modal
        return this.page.locator('dialog, [role="dialog"]').first();
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
            
            // Get current URL to verify navigation
            const currentUrl = this.page.url();
            Logger.info(`Current URL before click: ${currentUrl}`);
            
            // Click the button - it will navigate to invoice details page
            await this.addInvoiceButton.click();
            
            // Wait for navigation to invoice details page (or just wait for page load if already there)
            try {
                await this.page.waitForURL(/\/invoices\/\d+/, { timeout: 5000 });
            } catch {
                Logger.info('Already on or navigating to invoice page');
            }
            
            // Wait for the page to be fully loaded
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
            // Try multiple selectors for title input
            let titleInputElement = await this.page.locator('textbox[placeholder="Enter title"]').first().isVisible({ timeout: 2000 }).catch(() => false);
            
            if (!titleInputElement) {
                titleInputElement = await this.page.locator('input[placeholder*="title"]').first().isVisible({ timeout: 2000 }).catch(() => false);
            }
            
            if (titleInputElement) {
                const input = this.page.locator('textbox[placeholder="Enter title"]').or(this.page.locator('input[placeholder*="title"]')).first();
                await input.fill(title);
                await input.blur();
                Logger.success(`Invoice title filled: ${title}`);
            } else {
                Logger.info('Title input not found - may not be visible yet');
            }
        } catch (error) {
            Logger.error(`Error filling title: ${error.message}`);
            throw error;
        }
    }

    async fillInvoiceAmount(amount) {
        try {
            Logger.step(`Attempting to fill invoice amount: ${amount}`);
            // Note: The invoice form does not have an amount input field
            // Amount is determined by the selected items in the invoice grid
            Logger.info('Amount is not directly fillable - it is calculated from invoice items');
            return true;
        } catch (error) {
            Logger.error(`Error with amount: ${error.message}`);
            throw error;
        }
    }

    async fillInvoiceDescription(description) {
        try {
            Logger.step(`Filling invoice description: ${description}`);
            // Look for description input in the Overview section
            const descInputElement = this.page.locator('input[placeholder="Enter description"], textarea[placeholder="Enter description"]').first();
            
            if (await descInputElement.isVisible({ timeout: 5000 }).catch(() => false)) {
                await descInputElement.fill(description);
                await descInputElement.blur();
                Logger.success(`Invoice description filled: ${description}`);
            } else {
                Logger.info('Description input not found in visible form');
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
            // Look for save/confirm button on invoice detail page
            let saveBtn = await this.page.getByRole('button').filter({ hasText: /save|confirm|submit/i }).first().isVisible({ timeout: 3000 }).catch(() => false);
            
            if (saveBtn) {
                await this.page.getByRole('button').filter({ hasText: /save|confirm|submit/i }).first().click();
                await this.page.waitForLoadState('networkidle');
                await this.page.waitForTimeout(1500);
                Logger.success('Invoice saved successfully.');
                return true;
            } else {
                // Try to find save action button
                const actionButton = await this.page.locator('button').filter({ hasText: /save|confirm/i }).first().isVisible({ timeout: 3000 }).catch(() => false);
                if (actionButton) {
                    await this.page.locator('button').filter({ hasText: /save|confirm/i }).first().click();
                    await this.page.waitForLoadState('networkidle');
                    await this.page.waitForTimeout(1500);
                    Logger.success('Invoice saved successfully.');
                    return true;
                } else {
                    Logger.info('Save button not found');
                    return false;
                }
            }
        } catch (error) {
            Logger.error(`Error saving invoice: ${error.message}`);
            throw error;
        }
    }

    async isModalOpen() {
        try {
            // Check if we're on an invoice details page (which shows as a dialog)
            const isOnInvoicePage = this.page.url().includes('/invoices/');
            const isDialogVisible = await this.page.locator('dialog').isVisible({ timeout: 2000 }).catch(() => false);
            
            return isOnInvoicePage || isDialogVisible;
        } catch (error) {
            Logger.error(`Error checking modal: ${error.message}`);
            return false;
        }
    }

    async closeModal() {
        try {
            Logger.step('Closing invoice details page...');
            
            // Try pressing Escape key first (most reliable)
            await this.page.keyboard.press('Escape');
            await this.page.waitForLoadState('networkidle');
            await this.page.waitForTimeout(800);
            Logger.success('Closed invoice details page with Escape key.');
            
            // Ensure we're back on the Invoice tab
            await this.navigateToInvoiceTab().catch(() => {
                Logger.info('Could not navigate to Invoice tab after close');
            });
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
            const invoiceTab = this.page.getByRole('tab', { name: 'Invoice' });
            await invoiceTab.waitFor({ state: 'visible', timeout: 10000 });
            await invoiceTab.click();
            await this.page.waitForLoadState('networkidle');
            await this.page.waitForURL(/tab=invoices/);
            await this.page.waitForTimeout(2000);
            Logger.success('Navigated to Invoice tab successfully.');
        } catch (error) {
            Logger.error(`Error in navigateToInvoiceTab: ${error.message}`);
            throw error;
        }
    }

    async navigateToChangeOrderTab() {
        try {
            Logger.step('Navigating to Change Order tab...');
            // Try multiple selectors to find Change Orders tab
            let changeOrderTab = await this.page.locator('[role="tab"]:has-text("Change Orders")').first().isVisible({ timeout: 3000 }).catch(() => false);
            
            if (!changeOrderTab) {
                changeOrderTab = await this.page.locator('button, [role="tab"]').filter({ hasText: 'Change Orders' }).first().isVisible({ timeout: 3000 }).catch(() => false);
            }
            
            if (changeOrderTab) {
                await this.page.locator('[role="tab"]:has-text("Change Orders")').or(this.page.locator('button').filter({ hasText: 'Change Orders' })).first().click();
            } else {
                Logger.info('Change Orders tab not found, trying generic tab selector');
                await this.page.getByRole('tab').filter({ hasText: /Change Order/ }).click();
            }
            
            await this.page.waitForLoadState('networkidle');
            await this.page.waitForTimeout(2000);
            Logger.success('Navigated to Change Order tab successfully.');
        } catch (error) {
            Logger.error(`Error in navigateToChangeOrderTab: ${error.message}`);
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
