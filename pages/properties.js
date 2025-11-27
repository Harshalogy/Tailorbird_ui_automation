const { expect } = require("@playwright/test");
const loc = require("../locators/organization");
const data = require("../fixture/organization.json");
import { propertyLocators } from '../locators/propertyLocator.js';
import testData from '../fixture/property.json';

class PropertiesHelper {
    constructor(page) {
        this.page = page;
        this.nameInput = page.getByLabel('Name');
        this.addressInput = page.getByRole('textbox', { name: 'Address' });
        this.cityInput = page.getByLabel('City');
        this.stateInput = page.getByLabel('State');
        this.zipInput = page.getByLabel('Zipcode');
        this.typeInput = page.locator('input[placeholder="Select type"]');
        this.cancelBtn = page.getByRole('button', { name: 'Cancel' });
        this.addPropertyBtn = page.getByRole('button', { name: /add property/i });
    }

    log(msg) {
        console.log(`[PropertiesHelper] ${msg}`);
    }

    fillDynamic(str, email) {
        return str.replace("{{email}}", email);
    }

    async goto(url) {
        try {
            this.log(`Navigating to URL: ${url}`);
            await this.page.goto(url, { waitUntil: "load" });
            await this.page.waitForLoadState("networkidle");
            this.log(`Navigation successful: ${url}`);
        } catch (err) {
            this.log(`ERROR navigating to ${url}: ${err}`);
            throw err;
        }
    }

    async goToProperties() {
        await this.page.locator(propertyLocators.propertiesNavLink).waitFor({ state: "visible" });
        await this.page.locator(propertyLocators.propertiesNavLink).click();
        await this.page.locator(propertyLocators.breadcrumbsProperties).waitFor({ state: "visible" });
        await expect(this.page).toHaveURL(/.*\/properties/);
    }

    async createProperty(name, address, city, state, zip, type) {
        await this.page.waitForLoadState("networkidle");
        await this.page.waitForTimeout(3000);
        await this.page.locator(propertyLocators.createPropertyButton).waitFor({ state: "visible" });
        await this.page.locator(propertyLocators.createPropertyButton).click({ force: true });
        await this.page.locator(propertyLocators.addPropertyModalHeader).waitFor({ state: "visible" });
        await this.verifyModalFields();
        await this.nameInput.fill(name);
        await this.addressInput.fill(address);
        await this.page.locator(propertyLocators.addressSuggestion(address)).nth(0).waitFor({ state: "visible" });
        await this.page.locator(propertyLocators.addressSuggestion(address)).nth(0).click();
        await this.typeInput.fill(type);
        await this.page.locator(propertyLocators.propertyTypeOption(type)).waitFor({ state: "visible" });
        await this.page.locator(propertyLocators.propertyTypeOption(type)).click();
        await this.page.waitForLoadState("networkidle");
        await this.page.waitForTimeout(3000);
        await this.addPropertyBtn.click();
        await this.page.locator(`.mantine-Breadcrumbs-root:has-text('${name}')`).waitFor({ state: "visible" });
        await this.page.locator(propertyLocators.propertiesNavLink).nth(0).waitFor({ state: "visible" });
        await this.page.locator(propertyLocators.propertiesNavLink).nth(0).click();
        await this.page.locator(`.mantine-SimpleGrid-root p:has-text('${name}')`).nth(0).waitFor({ state: "visible" });
    }

    async verifyModalFields() {
        await expect(this.nameInput).toBeVisible();
        await expect(this.addressInput).toBeVisible();
        await expect(this.cityInput).toBeVisible();
        await expect(this.stateInput).toBeVisible();
        await expect(this.zipInput).toBeVisible();
        await expect(this.typeInput).toBeVisible();
        await expect(this.cancelBtn).toBeVisible();
        await expect(this.addPropertyBtn).toBeVisible();
    }

    async changeView(view) {
        await this.page.waitForLoadState("networkidle");
        await this.page.waitForTimeout(2000);
        await this.page.locator(propertyLocators.layoutListIcon).waitFor({ state: "visible" });
        await this.page.locator(propertyLocators.layoutListIcon).click();
        await this.page.locator(propertyLocators.viewMenuItemLabel(view)).waitFor({ state: "visible" });
        await this.page.locator(propertyLocators.viewMenuItemLabel(view)).click();
        await this.page.locator(propertyLocators.gridRootWrapper).waitFor({ state: "visible" });
        await this.page.waitForLoadState("networkidle");
        await this.page.waitForTimeout(2000);
    }

    async filterProperty(type) {
        await this.page.locator(propertyLocators.filterPanelTitle).waitFor({ state: "visible" });
        const normalizedType = type.toLowerCase().replace(/\s+/g, "_");
        await this.page.locator(propertyLocators.filterCheckbox(normalizedType)).waitFor({ state: "visible" });
        await this.page.locator(propertyLocators.filterCheckbox(normalizedType)).click();
        await this.page.waitForLoadState("networkidle");
        await this.page.waitForTimeout(3000);
        const badges = this.page.locator(propertyLocators.filterBadges);
        const count = await badges.count();
        if (count === 0) {
            console.log(`Checking "${type}" filter has no data in the table.`);
            await this.page.locator(propertyLocators.clearAllFiltersLink).waitFor({ state: "visible" });
            await this.page.locator(propertyLocators.clearAllFiltersLink).click();
            return;
        }
        const firstBadge = badges.first();
        await firstBadge.waitFor({ state: "visible", timeout: 5000 });
        const text = (await firstBadge.textContent()).trim();
        expect(text).toBe(type);
        console.log(`Checking "${type}" filter gives "${count}" rows are visible in the table.`);
        await this.page.locator(propertyLocators.clearAllFiltersLink).waitFor({ state: "visible" });
        await this.page.locator(propertyLocators.clearAllFiltersLink).click();
    }

    // async exportButton() {
    //     const [download] = await Promise.all([
    //         this.page.waitForEvent("download"),
    //         this.page.click(propertyLocators.downloadIcon)
    //     ]);
    //     const fileName = download.suggestedFilename();
    //     console.log("Downloaded:", fileName);
    //     await download.saveAs(`./downloads/${fileName}`);
    //     expect(fileName).toMatch(/\.xlsx$|\.csv$|\.pdf$/);
    // }

    
    async exportButton() {

        const [download] = await Promise.all([
            this.page.waitForEvent("download"),     
            this.page.click('.mantine-ActionIcon-icon .lucide-download:visible') 
        ]);

        // Get file name
        const fileName = download.suggestedFilename();
        console.log("Downloaded:", fileName);

        // Save to desired folder
        await download.saveAs(`./downloads/${fileName}`);

        // Assert file is downloaded
        expect(fileName).toMatch(/\.xlsx$|\.csv$|\.pdf$/);
    }


    async searchProperty(name) {
        await this.page.locator('input[placeholder="Search..."]').fill(name);
        await this.page.waitForLoadState("networkidle");
        await this.page.waitForTimeout(3000);
        const firstRowNameCell = this.page.locator(propertyLocators.firstRowNameCell);
        await expect(firstRowNameCell).toHaveText(name);
        console.log(`Search successful → Found: ${name}`);
    }

    async deleteProperty(name) {
        const cell = this.page.locator(propertyLocators.propertyNameCell(name));
        const row = cell.locator(propertyLocators.rowFromCell).nth(0);
        const rowIndex = await row.getAttribute("row-index");
        await this.page.waitForLoadState("networkidle");
        await this.page.waitForTimeout(3000);
        await this.page.locator(propertyLocators.rowDeleteIcon(rowIndex)).waitFor({ state: "visible" });
        await this.page.locator(propertyLocators.rowDeleteIcon(rowIndex)).click();
        await this.page.locator(propertyLocators.deleteButtonInPopover).waitFor({ state: "visible" });
        await this.page.locator(propertyLocators.deleteButtonInPopover).click();
        await this.page.locator(`.ag-center-cols-container p[title="${name}"]`).first().waitFor({ state: "hidden" });
        await expect(this.page.locator(`.ag-center-cols-container p[title="${name}"]`)).not.toBeVisible();
        console.log(`Property: ${name} is Deleted.`);
    }

    async openInvite() {
        try {
            this.log("Opening Invite User dialog...");
            const btn = this.page.locator(loc.inviteButton);
            await btn.click();
            this.log("Invite button clicked");
            const dlg = this.page.locator(loc.dialogRoot).first();
            await expect(dlg).toBeVisible();
            this.log("Invite dialog opened successfully");
            return {
                dlg,
                email: dlg.locator(loc.dialogEmailInput),
                role: dlg.locator(loc.dialogRoleSelect),
                invite: dlg.locator(`button:has-text("${data.inviteButtonText}")`)
            };
        } catch (err) {
            this.log("ERROR opening invite dialog: " + err);
            throw err;
        }
    }

    async selectRole(trigger, role) {
        try {
            await trigger.click();
            const menu = this.page.locator(loc.roleMenu);
            await menu.locator(`.rt-SelectItem:has-text("${role}")`).click();
        } catch (err) {
            this.log(`ERROR selecting role ${role}: ${err}`);
            throw err;
        }
    }

    async inviteUser(email, role) {
        try {
            this.log(`Inviting user: ${email} with role: ${role}`);
            const d = await this.openInvite();
            this.log(`Filling email...${email}`);
            await d.email.fill(email);
            this.log(`Selecting role: ${role}`);
            await this.selectRole(d.role, role);
            this.log("Clicking Invite button...");
            await d.invite.click();
            this.log("Waiting for invite dialog to close...");
            await d.dlg.waitFor({ state: "hidden" });
            this.log(`User invited successfully → ${email}`);
        } catch (err) {
            this.log(`ERROR inviting user ${email}: ${err}`);
            throw err;
        }
    }

    async search(value) {
        try {
            this.log(`Searching for: ${value}`);
            await this.page.locator(loc.searchInputPlaceholder).fill(value);
            await this.page.waitForTimeout(1800);
            this.log(`Search completed: ${value}`);
        } catch (err) {
            this.log(`ERROR searching ${value}: ${err}`);
            throw err;
        }
    }

    async validateInvitedBadge(row, email) {
        try {
            this.log(`Validating 'Invited' badge for: ${email}`);
            const invitedBadge = row.locator(`span.rt-Badge:has-text("${data.invitedBadgeText}")`);
            await expect(invitedBadge).toBeVisible({ timeout: 4000 });
            this.log(`'Invited' badge is visible for: ${email}`);
            return true;
        } catch (err) {
            this.log(`❌ ERROR validating Invited badge for ${email}: ${err}`);
            throw err;
        }
    }

    async visibleRowCount() {
        try {
            const count = await this.page.locator("table tbody tr:visible").count();
            this.log(`Visible row count: ${count}`);
            return count;
        } catch (err) {
            this.log("ERROR fetching visible row count: " + err);
            throw err;
        }
    }

    async getRow(text) {
        try {
            this.log(`Locating row with text: ${text}`);
            const row = this.page.locator("table tbody tr").filter({ hasText: text }).first();
            await row.waitFor({ state: "visible", timeout: 15000 });
            this.log(`Row found for: ${text}`);
            return row;
        } catch (err) {
            this.log(`ERROR locating row for ${text}: ${err}`);
            throw err;
        }
    }

    async revoke(row, email) {
        try {
            this.log(`Revoking invitation for: ${email}`);
            const menu = row.locator(loc.userActionsBtn);
            await menu.click();
            this.log("Opened user action menu.");
            await this.page.locator(loc.menuItemRevoke).click();
            this.log("Clicked 'Revoke invite'.");
            const modal = this.page.locator(loc.modal);
            await expect(modal).toBeVisible({ timeout: 5000 });
            this.log("Revoke modal visible.");
            const title = modal.locator(loc.modalTitle);
            await expect(title).toHaveText(data.revokeDialogTitle);
            this.log("Revoke dialog title validated.");
            const expectedMsg = this.fillDynamic(data.revokeDialogMessage, email);
            const msgLocator = modal.locator("p");
            const actualMsg = (await msgLocator.innerText()).trim();
            this.log("Extracted message: " + actualMsg);
            await expect(msgLocator).toHaveText(expectedMsg);
            this.log("Revoke message validated.");
            await modal.locator(`button:has-text("${data.revokeConfirmButton}")`).click();
            this.log("Clicked revoke confirm.");
            await modal.waitFor({ state: "hidden" });
            this.log(`Invitation revoked for ${email}.`);
        } catch (err) {
            this.log(`❌ ERROR revoking invitation for ${email}: ${err}`);
            throw err;
        }
    }

    async verifyNoResults() {
        try {
            this.log("Verifying no results message...");
            const msg = this.page.locator(`tbody tr td >> text=${data.noResultsText}`);
            await expect(msg).toBeVisible();
            this.log("No results verified.");
        } catch (err) {
            this.log("ERROR verifying no results: " + err);
            throw err;
        }
    }

    async openFirstMenu() {
        try {
            this.log("Opening first row menu...");
            await this.page.locator(loc.firstRowMenuBtn).click();
            this.log("First row menu opened.");
        } catch (err) {
            this.log("ERROR opening first row menu: " + err);
            throw err;
        }
    }

    async resendInvite(email) {
        try {
            this.log(`Initiating resend invite for: ${email}`);
            await this.page.locator(loc.menuItemResend).click();
            this.log("Clicked Resend.");
            const firstDialog = this.page.getByRole("alertdialog").filter({ hasText: data.resendDialogTitle });
            await expect(firstDialog).toBeVisible();
            this.log("First Resend dialog visible.");
            await expect(firstDialog.locator("h1")).toHaveText(data.resendDialogTitle);
            this.log("First title validated.");
            const expectedMsg = this.fillDynamic(data.resendDialogMessage, email);
            const msgLocator = firstDialog.locator("p");
            const actualMsg = (await msgLocator.innerText()).trim();
            this.log("First message: " + actualMsg);
            await expect(msgLocator).toHaveText(expectedMsg);
            this.log("First message validated.");
            await firstDialog.locator(`button:has-text("${data.resendConfirmButton}")`).click();
            this.log("Clicked Resend.");
        } catch (err) {
            this.log("❌ ERROR in resendInvite: " + err);
            throw err;
        }
    }

    async verifyResendSuccess(email) {
        try {
            this.log("Verifying resend success second dialog...");
            const secondDialog = this.page.getByRole("dialog").filter({ hasText: data.resendSuccessTitle });
            await expect(secondDialog).toBeVisible();
            this.log("Second dialog visible.");
            await expect(secondDialog.locator("h1")).toHaveText(data.resendSuccessTitle);
            this.log("Second title validated.");
            const expectedMsg = this.fillDynamic(data.resendSuccessMessage, email);
            const msgLocator = secondDialog.locator("p");
            const actualMsg = (await msgLocator.innerText()).trim();
            this.log("Second message: " + actualMsg);
            await expect(msgLocator).toHaveText(expectedMsg);
            this.log("Second message validated.");
            await secondDialog.locator(`button:has-text("${data.resendSuccessCloseButton}")`).click();
            this.log("Clicked Close.");
            await expect(this.page.getByRole("dialog")).toBeHidden({ timeout: 5000 });
            await expect(this.page.getByRole("alertdialog")).toBeHidden({ timeout: 5000 });
            this.log("Both dialogs closed.");
        } catch (err) {
            this.log("❌ ERROR verifying resend success: " + err);
            throw err;
        }
    }

    async toggleRole(row) {
        try {
            this.log("Opening Edit Role...");
            const menu = row.locator(loc.userActionsBtn);
            await menu.click();
            await this.page.getByRole("menuitem", { name: data.editRoleDialogTitle }).click();
            const modal = this.page.getByRole("dialog").filter({ hasText: data.editRoleDialogTitle });
            const roleTrigger = modal.locator('[role="combobox"]');
            const current = (await roleTrigger.innerText()).trim();
            const next = current === data.roles[0] ? data.roles[1] : data.roles[0];
            this.log(`Current: ${current}, Changing to: ${next}`);
            await roleTrigger.click();
            await this.page.getByRole("option", { name: next }).click();
            await modal.getByRole("button", { name: data.saveButtonText }).click();
            await modal.waitFor({ state: "hidden" });
            this.log(`Role changed: ${current} → ${next}`);
            return next;
        } catch (err) {
            this.log("ERROR toggling role: " + err);
            throw err;
        }
    }

    async getRole(email) {
        try {
            this.log(`Fetching role for: ${email}`);
            const row = await this.getRow(email);
            const cell = row.locator("td:nth-child(1) span");
            const role = (await cell.innerText()).trim();
            this.log(`Current role for ${email}: ${role}`);
            return role;
        } catch (err) {
            this.log("ERROR getting role: " + err);
            throw err;
        }
    }

    async verifyUpdatedRole(email, expectedRole) {
        try {
            this.log(`Verifying updated role for ${email}`);
            const row = await this.getRow(email);
            const cell = row.locator("td").nth(0).locator("span");
            const updatedRole = (await cell.innerText()).trim();
            this.log(`Fetched updated role: ${updatedRole}`);
            await this.page.waitForLoadState("networkidle");
            await this.page.waitForTimeout(2000);
            expect(updatedRole).toBe(expectedRole);
            this.log(`Role verification PASSED → ${email}: ${updatedRole} == ${expectedRole}`);
            return updatedRole;
        } catch (err) {
            this.log(`ERROR verifying updated role for ${email}. Expected ${expectedRole}. Error: ${err}`);
            throw err;
        }
    }

    async scrollHorizontally(index) {
        const scrollContainer = this.page.locator(propertyLocators.tableScrollContainer);
        const amount = (index + 1) * testData.scrollIncrement;
        await scrollContainer.evaluate((el, amt) => el.scrollBy({ left: amt }), amount);
    }

    async getHeaderText(index) {
        const headerLocator = this.page.locator(propertyLocators.tableViewHeader);
        return headerLocator.nth(index).textContent();
    }

    async validateHeader(index, expectedText, expectInstance) {
        const headerLocator = this.page.locator(propertyLocators.tableViewHeader);
        await expectInstance(headerLocator.nth(index)).toHaveText(expectedText, { timeout: 5000 });
    }

    async viewPropertyDetails(propertyName) {
        const viewDetailsBtn = this.page.locator(propertyLocators.viewDetailsButton).first();
        await expect(viewDetailsBtn).toBeVisible();
        await viewDetailsBtn.click();
        await expect(this.page).toHaveURL(/\/properties\/details\?propertyId=/);
        const title = this.page.locator(`text=${propertyName}`).first();
        await expect(title).toBeVisible();
    }

    async validateTabs(tabs = ["Overview", "Asset Viewer", "Takeoffs", "Locations"]) {
        for (const tab of tabs) {
            const tabEl = this.page.getByRole('tab', { name: tab });
            await expect(tabEl).toBeVisible();
        }
        const overviewTab = this.page.getByRole("tab", { name: "Overview" });
        await expect(overviewTab).toHaveAttribute("data-active", "true");
    }

    async validateOverviewFields(dynamicValues) {
        const overviewFields = [
            { label: "Ownership Group", value: "Tailorbird_QA_Automations" },
            { label: "Property Name", value: dynamicValues["Property Name"] },
            { label: "Property Type", value: dynamicValues["property_type"] },
            { label: "Address", value: dynamicValues["Address"] },
            { label: "City", value: dynamicValues["City"] },
            { label: "State", value: dynamicValues["State"] },
            { label: "Zip Code", value: dynamicValues["Zip Code"] },
            { label: "Unit Count", value: "0" }
        ];
        for (const field of overviewFields) {
            const labelEl = this.page.locator(`text="${field.label}"`).first();
            const valueEl = labelEl.locator('xpath=..//following-sibling::div//p').first();
            await expect(valueEl).toBeVisible({ timeout: 10000 });
            // await expect(valueEl).toHaveText(String(field.value), { timeout: 10000 });
        }
    }

    async uploadPropertyDocument(filePath) {
        try {
            const uploadFilesBtn = this.page.locator(propertyLocators.uploadFilesBtn);
            await expect(uploadFilesBtn.first()).toBeVisible({ timeout: 5000 });
            await uploadFilesBtn.first().click();
            console.log("[STEP] Upload Files button clicked");
            const dialog = this.page.locator(propertyLocators.uploadDialog);
            await expect(dialog).toBeVisible();
            console.log("[ASSERT] Upload modal opened");
            const uploadTexts = ["Drop files here", "From device", "Google Drive", "Dropbox", "Cancel", "Powered by Uploadcare"];
            for (const t of uploadTexts) {
                const txtEl = dialog.getByText(t);
                await expect(txtEl).toBeVisible();
            }
            const fileInput = this.page.locator(propertyLocators.uploadFileInput);
            await dialog.getByText("From device").click();
            await fileInput.waitFor({ state: "attached" });
            await fileInput.setInputFiles(filePath);
            console.log(`[ASSERT] File uploaded → ${filePath}`);
            const uploadListDialog = this.page.locator(propertyLocators.uploadListDialog);
            await expect(uploadListDialog).toBeVisible();
            const uploadedFileName = uploadListDialog.locator(".uc-file-name");
            await expect(uploadedFileName.first()).toBeVisible();
            const toolbarBtns = ["Remove", "Clear", /Add more/i, "Done"];
            for (const btn of toolbarBtns) {
                const btnEl = uploadListDialog.getByRole("button", { name: btn });
                await expect(btnEl.first()).toBeVisible();
            }
            await uploadListDialog.getByRole("button", { name: "Done" }).click();
            console.log("[ASSERT] Done clicked → Upload modal closed");
            const tagsModal = this.page.locator('section[role="dialog"] >> text=Add Tags & Types').locator('..').locator('..');
            await expect(tagsModal).toBeVisible();
            const modalTitle = tagsModal.getByRole("heading", { name: "Add Tags & Types" });
            await expect(modalTitle).toBeVisible();
            const fileSize = tagsModal.getByText(/Bytes/);
            await expect(fileSize).toBeVisible();
            const clearAllBtn = tagsModal.getByRole("button", { name: "Clear all" });
            const addFilesBtn = tagsModal.getByRole("button", { name: "Add Files" });
            await expect(clearAllBtn).toBeVisible();
            await expect(addFilesBtn).toBeVisible();
            console.log("[STEP] Clicking Add Files...");
            await addFilesBtn.click();
            await this.page.waitForTimeout(5000);
            console.log("[ASSERT] Add Files clicked → ready for additional uploads");
        } catch (err) {
            console.log("[ERROR] uploadPropertyDocument failed:", err);
            throw err;
        }
    }

    async manageColumns(expectedColumns, deleteColumn = "Random Name") {
        const tableSettingsBtn = this.page.locator(propertyLocators.tableSettingsButton).first();
        await expect(tableSettingsBtn).toBeVisible();
        await tableSettingsBtn.click();
        const drawer = this.page.locator(propertyLocators.manageColumnsDrawer);
        await expect(drawer).toBeVisible();
        await expect(drawer.getByText("Manage Columns", { exact: true })).toBeVisible();
        for (const col of expectedColumns) {
            const row = drawer.locator(`p:has-text("${col}")`);
            await expect(row.first()).toBeVisible();
            const checkbox = row.locator('xpath=ancestor::div[contains(@style,"cursor")]').locator('input[type="checkbox"]');
            await expect(checkbox.first()).toBeVisible();
        }
        const randomNameRow = drawer.locator(`p:has-text("${deleteColumn}")`);
        if (await randomNameRow.count() > 0) {
            const deleteBtn = randomNameRow.locator('xpath=ancestor::div[contains(@style,"cursor")]').locator('button:has(svg.lucide-trash-2)');
            await deleteBtn.click();
            const deleteDialog = this.page.locator(propertyLocators.deletePopoverDialog);
            await expect(deleteDialog).toBeVisible();
            await deleteDialog.getByRole('button', { name: 'Delete' }).click();
        }
    }

    async openPropertyDetails(propertyName) {
        await this.changeView('Table View');
        await this.searchProperty(propertyName);
        const viewBtn = this.page.locator(propertyLocators.viewDetailsBtn).first();
        await expect(viewBtn).toBeVisible({ timeout: 5000 });
        await viewBtn.click();
        await expect(this.page).toHaveURL(/properties\/details/);
    }

    async validatePropertyDocumentsSection() {
        const header = this.page.locator(propertyLocators.documentsHeader);
        const subHeader = this.page.locator(propertyLocators.documentsSubHeader);
        const uploadButton = this.page.locator(propertyLocators.uploadFilesBtn);
        await expect(header).toBeVisible();
        await expect(subHeader).toBeVisible();
        await expect(uploadButton.first()).toBeVisible();
    }

    async validateDocumentTableHeaders() {
        const headers = this.page.locator(propertyLocators.tableHeaders);
        const count = await headers.count();
        for (let i = 0; i < count; i++) {
            const text = await headers.nth(i).innerText();
            console.log(`Header ${i}: ${text}`);
            expect(text.trim().length).toBeGreaterThan(0);
        }
    }

    async validateFirstRowValues() {
        const firstRow = this.page.locator(propertyLocators.tableRows).first();
        const cells = firstRow.locator(propertyLocators.tableRowCells);
        const count = await cells.count();
        for (let i = 0; i < count; i++) {
            const text = await cells.nth(i).innerText();
            console.log(`Cell ${i}: ${text}`);
            expect(text.trim().length).toBeGreaterThan(0);
        }
    }

    async openAddDataModal() {
        const btn = this.page.locator(propertyLocators.addDataButton);
        await btn.waitFor({ state: 'visible' });
        await btn.click();
    }

    async filterPropertyNew(type) {

        await this.page.locator(".mantine-Paper-root p:has-text('Filter')").waitFor({ state: "visible" });

        // convert "Garden Style" to "garden_style"
        await this.page.locator(`.mantine-Checkbox-labelWrapper label:has-text("${type}")`).waitFor({ state: "visible" });
        await this.page.locator(`.mantine-Checkbox-labelWrapper label:has-text("${type}")`).click();

        await this.page.waitForLoadState("networkidle");
        await this.page.waitForTimeout(3000);

        const badges = this.page.locator('.ag-center-cols-container div[col-id="floorplan_id"]');

        const count = await badges.count();

        if (count === 0) {
            console.log(`Checking "${type}" filter has no data in the table.`);
            await this.page.locator('.mantine-Paper-root a:has-text("Clear All Filters")').waitFor({ state: "visible" });
            await this.page.locator('.mantine-Paper-root a:has-text("Clear All Filters")').click();
            return; // ❗ prevent further execution
        }

        const firstBadge = badges.first();

        // Wait ONLY for first badge, not networkidle
        await firstBadge.waitFor({ state: "visible", timeout: 5000 });

        const text = (await firstBadge.textContent()).trim();
        expect(text).toBe(type);

        console.log(`Checking "${type}" filter gives "${count}" rows are visible in the table.`);


        await this.page.locator('.mantine-Paper-root a:has-text("Clear All Filters")').waitFor({ state: "visible" });
        await this.page.locator('.mantine-Paper-root a:has-text("Clear All Filters")').click();
    }

    async unitMix() {

        await this.page.locator('button[title="Unit Mix"]:visible').click();
        await this.page.locator(".mantine-Modal-content header:has-text('Unit Mix'):visible").waitFor({ state: "visible" });
        await this.page.locator(".mantine-Modal-content header:has-text('Unit Mix'):visible").click();

        // Expected floorplan names
        const expected = [
            "CALEDESI",
            "CAPTIVA",
            "CLEARWTR",
            "DESOTO",
            "MADEIRA"
        ];

        // Locate all elements in the left pinned column
        const floorplanCells = this.page.locator('.mantine-Modal-content [col-id="floorplan_name"]');
        await floorplanCells.first().waitFor({ state: "visible" });

        // Extract text from all matched elements
        let actual = await floorplanCells.allTextContents();

        actual = actual
            .map(x => x.trim())
            .filter(x => expected.includes(x));

        // Assert exact match
        expect(actual).toEqual(expected);
        console.log(`✅ Unit Mix floorplan names verified successfully.`);
        console.log(`Floor Plan Type Visible in Unit Mix Modal: ${expected}`);

        await this.page.locator(".mantine-Modal-close:visible").waitFor({ state: "visible" });
        await this.page.locator(".mantine-Modal-close:visible").click();

    }

    async addPropertyTakeOff(tab) {
        await this.page.locator(".lucide-plus:visible").waitFor({ state: "visible" });
        await this.page.locator(".lucide-plus:visible").click();

        await this.page.locator(`button:has-text('Add Property_${tab}_takeoff')`).waitFor({ state: "visible" });
        await this.page.locator(`button:has-text('Add Property_${tab}_takeoff')`).click();

        if (tab === 'interior') {
            // Select Floorplan
            await this.page.locator('.ag-floating-top div[col-id="floorplan_id"]').waitFor({ state: "visible" });
            await this.page.locator('.ag-floating-top div[col-id="floorplan_id"]').dblclick();
            await this.page.locator('.mantine-ScrollArea-content p').first().waitFor({ state: "visible" });
            await this.page.locator('.mantine-ScrollArea-content p').first().click();

            // unit_mix_quantity
            await this.page.waitForLoadState("networkidle");
            await this.page.waitForTimeout(3000);
            const unit_mix_quantity = this.page.locator('div[row-index="0"] div[col-id="unit_mix_quantity"]');
            await unit_mix_quantity.waitFor({ state: "visible" });
            await unit_mix_quantity.dblclick();
            await this.page.waitForLoadState("networkidle");
            await this.page.waitForTimeout(3000);
            await unit_mix_quantity.locator('input').fill('100');
            await unit_mix_quantity.locator('input').press('Enter');
            await this.page.waitForLoadState("networkidle");
            await this.page.waitForTimeout(3000);
            const cellValue = await this.page.locator('div[row-index="0"] div[col-id="count"]').textContent();
            expect.soft(cellValue?.trim(), `Count mismatch → expected: 100, got: ${cellValue}`).toBe('100');


        } else if (tab === 'exterior') {
            // Select Building Type
            await this.page.locator('.ag-floating-top div[col-id="building_type_id"]').waitFor({ state: "visible" });
            await this.page.locator('.ag-floating-top div[col-id="building_type_id"]').dblclick();
            await this.page.locator('.mantine-ScrollArea-content p').first().waitFor({ state: "visible" });
            await this.page.locator('.mantine-ScrollArea-content p').first().click();

            // unit_mix_quantity
            await this.page.waitForLoadState("networkidle");
            await this.page.waitForTimeout(3000);
            const unit_mix_quantity = this.page.locator('div[row-index="0"] div[col-id="unit_mix_quantity"]');
            await unit_mix_quantity.waitFor({ state: "visible" });
            await unit_mix_quantity.dblclick();
            await this.page.waitForLoadState("networkidle");
            await this.page.waitForTimeout(3000);
            await unit_mix_quantity.locator('input').fill('100');
            await unit_mix_quantity.locator('input').press('Enter');
            await this.page.waitForLoadState("networkidle");
            await this.page.waitForTimeout(3000);

            const cellValue = await this.page.locator('div[row-index="0"] div[col-id="count"]').textContent();
            expect.soft(cellValue?.trim(), `Count mismatch → expected: 100, got: ${cellValue}`).toBe('100');


        }

    }

    async addColumnTakeOff(tab) {

        await this.page.locator(".lucide-plus:visible").waitFor({ state: "visible" });
        await this.page.locator(".lucide-plus:visible").click();

        await this.page.locator(`button:has-text('Add Data')`).waitFor({ state: "visible" });
        await this.page.locator(`button:has-text('Add Data')`).click();

        // column
        let columnName = `columnName${Date.now()}`;
        await this.page.locator(`.mantine-Paper-root p:has-text('Add column')`).waitFor({ state: "visible" });
        await this.page.locator(`input[placeholder="Enter column name (letters, numbers, spaces, hyphens only)"]`).fill(columnName);
        await this.page.locator(`input[placeholder="Enter column description (required)"]`).fill(columnName);
        await this.page.locator(`button:has-text('Text')`).click();
        await this.page.locator(`button:has-text('Add column')`).click();

        await this.page.waitForLoadState("networkidle");
        await this.page.waitForTimeout(3000);
        // await this.page.locator(`p:has-text('${columnName}')`).waitFor({ state: "visible" });
        // await expect.soft(this.page.locator(`p:has-text('${columnName}')`)).toBeVisible();

        // Column Assertions in Settings icon
        await this.page.locator(`.lucide.lucide-settings:visible`).waitFor({ state: "visible" });
        await this.page.locator(`.lucide.lucide-settings:visible`).click();
        await this.page.locator(`header:has-text('Manage Columns')`).waitFor({ state: "visible" });
        await expect.soft(this.page.locator(`p:has-text('${columnName}')`)).toBeVisible();

        await this.page.locator(`.mantine-CloseButton-root:visible`).waitFor({ state: "visible" });
        await this.page.locator(`.mantine-CloseButton-root:visible`).click();
    }
}

module.exports = PropertiesHelper;
