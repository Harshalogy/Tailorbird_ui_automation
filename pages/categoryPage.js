const { expect } = require("@playwright/test");

class FinancialsCategoryPage {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        this.page = page;

        this.financialsNav = page.locator(
            'nav a.mantine-NavLink-root:has-text("Financials")'
        );

        this.categoryLink = page.locator(
            'a.mantine-NavLink-root:has(span.mantine-NavLink-label:has-text("Category"))'
        );

        this.tableSelectors = [
            'table',
            '.ag-root-wrapper',
            '.mantine-Table-root',
            '[role="table"]',
            '[role="grid"]',
        ];

        this.downloadSelectors = [
            'button:has(svg.lucide-download)',
            'button[title*="Download"]',
            'button[title*="Export"]',
            'button:has-text("Export")',
            'button:has-text("Download")',
        ];

        this.errorIndicators = [
            'text=/error/i',
            'text=/not found/i',
            'text=/404/i',
            '.mantine-Alert-root[color="red"]',
        ];

        this.resetTableIcon = page.locator(
            'button[data-variant="subtle"][data-size="md"]:has(svg.lucide-rotate-ccw)'
        );

        this.resetModal = page.locator('section[role="dialog"]');
        this.resetModalHeader = this.resetModal.locator(
            'h2.mantine-Modal-title'
        );
        this.resetModalBody = this.resetModal.locator(
            'div.mantine-Modal-body p'
        );
        this.resetCancelBtn = this.resetModal.locator(
            'button:has-text("Cancel")'
        );
        this.resetConfirmBtn = this.resetModal.locator(
            'button:has-text("Reset Table")'
        );

        // ❗ FIXED: role selector must use getByRole
        this.uploadFilesButton = page.getByRole("button", {
            name: "Upload Files",
        });

        this.uploadDialog = page.locator('dialog[open]');
        this.uploadFileInput = page.locator('input[type="file"]');
        this.uploadListDialog = page.locator(
            'dialog[open] uc-upload-list'
        );

        this.manageColumnsDrawer = page.locator(
            'section[role="dialog"]'
        );

        this.tableSettingsButton = page.locator(
            'button:has(svg.lucide-settings)'
        );

        this.viewDetailsBtn = page.locator(
            'button[title="View Details"]'
        );

        this.documentsHeader = page.locator(
            'text=Property Documents'
        );

        this.documentsSubHeader = page.locator(
            'text=Files and images related to this property'
        );

        this.uploadFilesBtn = page.locator(
            'button:has(svg.lucide-upload)'
        );
    }

    async expandFinancialsSection() {
        await this.financialsNav.waitFor({ state: "visible" });
        const isExpanded =
            await this.financialsNav.getAttribute("aria-expanded");

        if (isExpanded !== "true") {
            await this.financialsNav.click();
            await this.page.waitForTimeout(300);
        }
    }

    async goToCategory() {
        await this.categoryLink.waitFor({ state: "visible" });
        await this.categoryLink.click();
        await this.page.waitForLoadState("networkidle");
        await this.page.waitForTimeout(300);
    }

    async isTableVisible() {
        for (const selector of this.tableSelectors) {
            const table = this.page.locator(selector).first();
            if (
                (await table.count()) &&
                (await table
                    .isVisible({ timeout: 2000 })
                    .catch(() => false))
            ) {
                return true;
            }
        }
        return false;
    }

    async isDownloadButtonVisible() {
        for (const selector of this.downloadSelectors) {
            const btn = this.page.locator(selector).first();
            if (
                (await btn.count()) &&
                (await btn
                    .isVisible({ timeout: 2000 })
                    .catch(() => false))
            ) {
                return true;
            }
        }
        return false;
    }

    async hasErrorIndicators() {
        for (const selector of this.errorIndicators) {
            const err = this.page.locator(selector);
            if (
                (await err.count()) &&
                (await err
                    .isVisible({ timeout: 1000 })
                    .catch(() => false))
            ) {
                return true;
            }
        }
        return false;
    }

    async validateResetCategoryContent() {
        await expect(this.resetModalHeader).toHaveText(
            "Reset Category Table"
        );

        const expectedText =
            "Are you sure you want to reset the category table? This will permanently delete all categories and set category references to null in: tasks, property assets, budget items, and job scopes. This action cannot be undone.";

        await expect(this.resetModalBody).toHaveText(expectedText);
        await expect(this.resetCancelBtn).toBeVisible();
        await expect(this.resetConfirmBtn).toBeVisible();
    }

    async uploadCategory(filePath) {
        await this.uploadFilesBtn.first().click();
        await this.uploadDialog.waitFor();

        this.page.once("filechooser", async (chooser) => {
            await chooser.setFiles(filePath);
        });

        await this.page.getByText("From device").click();

        await expect(this.uploadListDialog).toBeVisible();

        const uploadedFileName =
            this.uploadListDialog.locator(".uc-file-name");
        await expect(uploadedFileName.first()).toBeVisible();

        const toolbarBtns = ["Remove", "Clear", /Add more/i, "Done"];
        for (const btn of toolbarBtns) {
            const btnEl = this.uploadListDialog.getByRole("button", {
                name: btn,
            });
            await expect(btnEl.first()).toBeVisible();
        }

        await this.uploadListDialog
            .getByRole("button", { name: "Done" })
            .click();
    }

    async filterCategory(columnName, filterValue) {
        const filterBtn = this.page.locator('button:has(svg.lucide-funnel)');
        await expect(filterBtn).toBeVisible();
        await filterBtn.click();
        const filterPopover = this.page.locator(
            '.mantine-Paper-root:has-text("Filters")'
        );
        await expect(filterPopover).toBeVisible();
        const header = filterPopover.getByText("Filters", { exact: true });
        await expect(header).toBeVisible();
        const closeBtn = filterPopover.locator(
            'button.mantine-CloseButton-root'
        );
        await expect(closeBtn).toBeVisible();
        const columnBlock = filterPopover.locator(
            `div:has(p:has-text("${columnName}"))`
        );
        await expect(columnBlock).toBeVisible();
        const columnLabel = columnBlock.getByText(columnName, { exact: true });
        await expect(columnLabel).toBeVisible();
        const filterInput = columnBlock.locator(
            'input.mantine-PillsInputField-field'
        );
        await expect(filterInput).toBeVisible();
        await expect(filterInput).toBeEditable();
        await filterInput.fill(filterValue);
        await expect(filterInput).toHaveValue(filterValue);
    }

    async filterCategoryAndVerify(columnName, filterValue) {
        // Step 1: Click filter button
        const filterBtn = this.page.locator('button:has(svg.lucide-funnel)');
        await expect(filterBtn).toBeVisible();
        await filterBtn.click();

        // Step 2: Verify filter popover is visible
        const filterPopover = this.page.locator(
            '.mantine-Paper-root:has-text("Filters")'
        );
        await expect(filterPopover).toBeVisible();

        // Step 3: Locate and fill the filter input for the specified column
        const columnBlock = filterPopover.locator(
            `div:has(p:has-text("${columnName}"))`
        );
        await expect(columnBlock).toBeVisible();

        const filterInput = columnBlock.locator(
            'input.mantine-PillsInputField-field'
        );
        await expect(filterInput).toBeVisible();
        await expect(filterInput).toBeEditable();
        await filterInput.fill(filterValue);
        await expect(filterInput).toHaveValue(filterValue);

        // Step 4: Wait for filter to apply and data to update
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(1000);

        // Step 5: Verify filtered results - check that all visible rows contain the filter value
        const tableRows = this.page.locator('table tbody tr, .ag-center-cols-container .ag-row, [role="row"]');
        const rowCount = await tableRows.count();
        
        if (rowCount === 0) {
            throw new Error(`No rows found after filtering by ${columnName} = ${filterValue}`);
        }

        // Verify each row contains the filter value
        for (let i = 0; i < rowCount; i++) {
            const rowText = (await tableRows.nth(i).innerText()).trim();
            if (!rowText.includes(filterValue)) {
                throw new Error(`Row ${i} does not contain expected filter value: ${filterValue}`);
            }
        }

        // Step 6: Close the filter modal
        const closeBtn = filterPopover.locator(
            'button.mantine-CloseButton-root'
        );
        await expect(closeBtn).toBeVisible();
        await closeBtn.click();

        // Step 7: Verify filter modal is closed
        await expect(filterPopover).toBeHidden({ timeout: 2000 });

        return rowCount;
    }

}

module.exports = { FinancialsCategoryPage };
