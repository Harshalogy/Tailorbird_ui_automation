const { expect } = require("@playwright/test");
const loc = require("../locators/organization");
const data = require("../fixture/organization.json");
const ModalHandler = require('../pages/modalHandler');
import { propertyLocators } from '../locators/propertyLocator.js';
import testData from '../fixture/property.json';
const prop = require('../locators/locationLocator');

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
        console.log("=== 🏠 START: Create Property Flow ===");

        try {
            console.log("⏳ Waiting for page to stabilize...");
            await this.page.waitForLoadState("networkidle");
            await this.page.waitForTimeout(3000);

            console.log("🔎 Waiting for *Create Property* button...");
            await this.page.locator(propertyLocators.createPropertyButton).waitFor({ state: "visible" });

            console.log("🖱 Clicking *Create Property* button...");
            await this.page.locator(propertyLocators.createPropertyButton).click({ force: true });

            console.log("📌 Waiting for Add Property modal to appear...");
            await this.page.locator(propertyLocators.addPropertyModalHeader).waitFor({ state: "visible" });

            console.log("📝 Verifying modal field presence...");
            await this.verifyModalFields();

            console.log(`✍ Entering Name: ${name}`);
            await this.nameInput.fill(name);

            console.log(`✍ Entering Address: ${address}`);
            await this.addressInput.fill(address);

            console.log(`🔍 Selecting address suggestion for: ${address}`);
            await this.page.locator(propertyLocators.addressSuggestion(address)).nth(0).waitFor({ state: "visible" });
            await this.page.locator(propertyLocators.addressSuggestion(address)).nth(0).click();

            console.log(`🏷 Entering Property Type: ${type}`);
            await this.typeInput.fill(type);

            console.log("📍 Selecting property type from dropdown...");
            await this.page.locator(propertyLocators.propertyTypeOption(type)).waitFor({ state: "visible" });
            await this.page.locator(propertyLocators.propertyTypeOption(type)).click();

            console.log("⏳ Waiting for request to settle...");
            await this.page.waitForLoadState("networkidle");
            await this.page.waitForTimeout(3000);

            console.log("💾 Clicking *Add Property*...");
            await this.addPropertyBtn.click();

            console.log(`🔄 Wait for property creation: verifying breadcrumb '${name}'`);
            await this.page.locator(`.mantine-Breadcrumbs-root:has-text('${name}')`).waitFor({ state: "visible" });

            console.log("⬅ Navigating back to property list...");
            await this.page.locator(propertyLocators.propertiesNavLink).nth(0).waitFor({ state: "visible" });
            await this.page.locator(propertyLocators.propertiesNavLink).nth(0).click();

            console.log(`🔍 Validating property '${name}' appears in list...`);
            await this.page.locator(`.mantine-SimpleGrid-root p:has-text('${name}')`).nth(0).waitFor({ state: "visible" });

            console.log(`🎉 SUCCESS: Property '${name}' created and verified successfully!`);

        } catch (error) {
            console.log("❌ ERROR during Create Property Flow ❌");
            console.log("Message:", error.message);
            console.log("Stack:", error.stack);
            throw error; // rethrow so test fails properly
        }

        console.log("=== 🏁 END: Create Property Flow ===");
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

    async exportButton() {
        console.log("\n========== 📁 EXPORT FILE FLOW STARTED ==========\n");

        try {
            console.log("⏳ Step 1: Preparing to wait for file download and click export button...");
            console.log("👉 Waiting for event: 'download'");

            const [download] = await Promise.all([
                this.page.waitForEvent("download"), // waiting for file to start downloading
                this.page.click('.mantine-ActionIcon-icon .lucide-download:visible') // actual export click
            ]);

            console.log("✔ Step 1 Completed → Download event detected");

            // Get file name
            console.log("\n⏳ Step 2: Extracting downloaded file name...");
            const fileName = download.suggestedFilename();
            console.log(`📄 Suggested download filename received: "${fileName}"`);

            // Save to downloads folder
            console.log("\n⏳ Step 3: Saving file to system...");
            const savePath = `./downloads/${fileName}`;
            console.log(`💾 Destination Path → ${savePath}`);

            await download.saveAs(savePath);
            console.log("✔ File saved successfully →", savePath);

            // Validate download file type
            console.log("\n⏳ Step 4: Validating file format extension...");
            console.log("Allowed Extensions → .xlsx | .csv | .pdf");

            expect(fileName).toMatch(/\.xlsx$|\.csv$|\.pdf$/);
            console.log(`✔ File format validation passed: "${fileName}" is a valid exported file.`);

            console.log("\n🎉 EXPORT FLOW SUCCESSFULLY COMPLETED\n");

        } catch (error) {
            console.log("\n❌ EXPORT FILE FLOW FAILED ❌");
            console.log("Error Message:", error.message);
            console.log("Stack Trace:", error.stack);
            throw error;
        }

        console.log("\n========== 📁 EXPORT FILE FLOW ENDED ==========\n");
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

    async scrollBackToStart() {
        const scrollContainer = this.page.locator(propertyLocators.tableScrollContainer);
        await scrollContainer.evaluate(el => el.scrollTo({ left: 0 }));
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
        console.log(`[ASSERT] Navigated to Property Details → ${propertyName} and title is -> ${title}`);
    }

    async validateTabs(tabs = ["Overview", "Asset Viewer", "Takeoffs", "Locations"]) {
        for (const tab of tabs) {
            const tabEl = this.page.getByRole('tab', { name: tab });
            await expect(tabEl).toBeVisible();
            console.log(`[ASSERT] Tab visible → ${tab}`);
        }
        const overviewTab = this.page.getByRole("tab", { name: "Overview" });
        await expect(overviewTab).toHaveAttribute("data-active", "true");
        console.log("[ASSERT] Overview tab is active by default");
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
            console.log(`[ASSERT] ${field.label} → Expected: ${field.value}`);
            // await expect(valueEl).toHaveText(String(field.value), { timeout: 10000 });
        }
    }

    async uploadPropertyDocument(filePath) {
        await this.page.locator(propertyLocators.uploadFilesBtn).first().click();
        await this.page.locator(propertyLocators.uploadDialog).waitFor();

        // Intercept and cancel native dialog (THIS IS THE FIX)
        this.page.once("filechooser", async (chooser) => {
            console.log("📁 File chooser opened — Auto selecting file");
            await chooser.setFiles(filePath);       // No Windows dialog shown anymore
        });

        await this.page.getByText("From device").click();  // still required
        console.log("✔ Upload completed without Windows dialog");

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
        console.log("file uploaded successfully");
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

        await this.validateMultiCollapseExpand(
            'button.mantine-ActionIcon-root:has(svg.lucide-chevron-down)'
        );


        const randomNameRow = drawer.locator(`p:has-text("${deleteColumn}")`);
        if (await randomNameRow.count() > 0) {
            const deleteBtn = randomNameRow.locator('xpath=ancestor::div[contains(@style,"cursor")]').locator('button:has(svg.lucide-trash-2)');
            await deleteBtn.click();
            // DELETE COLUMN
            await this.page.locator(propertyLocators.deleteColumnIcon).click();
            await this.page.locator(propertyLocators.deleteConfirmBtn).click();
            console.log("✔ Custom column deleted");
        }
    }

    async validateMultiCollapseExpand(buttonSelector) {

        const toggles = this.page.locator(buttonSelector);
        const total = await toggles.count();

        console.log(`\n🔍 Found ${total} collapsible sections`);

        if (total === 0) throw new Error("❌ No expand/collapse toggles found");

        console.log("\n⬇ Collapsing all sections...");

        for (let i = 0; i < total; i++) await toggles.nth(i).click();

        for (let i = 0; i < total; i++) {

            const rows = this.page.locator(buttonSelector)
                .nth(i)
                .locator(`xpath=ancestor::div[contains(@style,"cursor")]/
                      following-sibling::div//p`);

            await expect(rows.first()).not.toBeVisible({ timeout: 2000 });
        }

        console.log("✔ Verified — All sections collapsed");

        console.log("\n⬆ Expanding one by one...");

        for (let i = 0; i < total; i++) {

            console.log(`🧪 Checking section ${i + 1}`);

            await toggles.nth(i).click();   // Expand this section only

            const rows = this.page.locator(buttonSelector)
                .nth(i)
                .locator(`xpath=ancestor::div[contains(@style,"cursor")]/
                      following-sibling::div//p`);

            await expect(rows.first()).toBeVisible({ timeout: 2000 });
            console.log("✔ Expanded → Rows visible");

            await toggles.nth(i).click();   // Collapse back
            await expect(rows.first()).not.toBeVisible({ timeout: 2000 });
            console.log("✔ Collapsed → Rows hidden");
        }

        console.log(`\n🎉 Collapse/Expand Validation Completed Successfully\n`);

        await toggles.nth(1).click();
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

        console.log("\n========== 📂 VALIDATING PROPERTY DOCUMENTS SECTION ==========\n");

        try {

            console.log("⏳ Step 1: Locating Documents Header...");
            const header = this.page.locator(propertyLocators.documentsHeader);
            await expect(header).toBeVisible();
            console.log("✔ Documents Header is visible on page.");

            console.log("\n⏳ Step 2: Locating Documents Sub-header...");
            const subHeader = this.page.locator(propertyLocators.documentsSubHeader);
            await expect(subHeader).toBeVisible();
            console.log("✔ Documents Sub-header is visible.");

            console.log("\n⏳ Step 3: Locating Upload Files button...");
            const uploadButton = this.page.locator(propertyLocators.uploadFilesBtn);
            await expect(uploadButton.first()).toBeVisible();
            console.log("✔ Upload Files button is visible and ready.");

            console.log("\n🎉 VALIDATION SUCCESS — Property Documents Section Loaded Correctly\n");

        } catch (error) {
            console.log("\n❌ ERROR IN validatePropertyDocumentsSection()");
            console.log("Message →", error.message);
            console.log("Stack Trace →", error.stack);
            throw error; // keep failure visible in test
        }

        console.log("========== 📂 VALIDATION COMPLETED ==========\n");
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

        console.log("\n========== 📄 VALIDATE FIRST TABLE ROW VALUES START ==========\n");

        try {
            console.log("⏳ Step 1: Locating first table row...");
            const firstRow = this.page.locator(propertyLocators.tableRows).first();

            console.log("\n⏳ Step 2: Extracting cell elements inside first row...");
            const cells = firstRow.locator(propertyLocators.tableRowCells);

            const count = await cells.count();
            console.log(`🔍 Total cells detected inside first row → ${count}`);

            console.log("\n📊 Step 3: Iterating through each cell & logging value\n");

            for (let i = 0; i < count; i++) {
                console.log(`➡ Reading Cell ${i + 1}/${count}...`);
                const text = await cells.nth(i).innerText();
                console.log(`📌 Cell ${i} Value → "${text.trim()}"`);

                console.log("🔍 Validating cell is not empty...");
                expect(text.trim().length).toBeGreaterThan(0);
                console.log(`✔ Cell ${i} validation passed.`);
                console.log("---------------------------------------------");
            }

            console.log("\n🎉 FIRST ROW VALIDATION SUCCESSFUL — All cells contain data\n");

        } catch (error) {
            console.log("\n❌ ERROR in validateFirstRowValues()");
            console.log("Message →", error.message);
            console.log("Stack Trace →", error.stack);
            throw error; // do not eat test failure
        }

        console.log("\n========== 📄 VALIDATION END ==========\n");
    }

    async openAddDataModal() {
        const btn = this.page.locator(propertyLocators.addDataButton);
        await btn.waitFor({ state: 'visible' });
        await btn.click();
    }

    async filterPropertyNew(type) {

        console.log("\n========== 🔎 FILTER PROPERTY START ==========\n");
        console.log(`🎯 Filter selected → "${type}"\n`);

        try {
            console.log("⏳ Step 1: Opening Filter section...");
            await this.page.locator(".mantine-Paper-root p:has-text('Filter')").waitFor({ state: "visible" });
            console.log("✔ Filter UI loaded\n");

            console.log(`⏳ Step 2: Selecting checkbox option "${type}"...`);
            await this.page.locator(`.mantine-Checkbox-labelWrapper label:has-text("${type}")`).waitFor({ state: "visible" });
            await this.page.locator(`.mantine-Checkbox-labelWrapper label:has-text("${type}")`).click();
            console.log(`✔ "${type}" checkbox clicked\n`);

            console.log("⏳ Step 3: Waiting for data refresh...");
            await this.page.waitForLoadState("networkidle");
            await this.page.waitForTimeout(3000);
            console.log("✔ Data loaded successfully\n");

            console.log("⏳ Step 4: Checking badge results in table...");
            const badges = this.page.locator('.ag-center-cols-container div[col-id="floorplan_id"]');
            const count = await badges.count();
            console.log(`📊 Total rows returned after filter = ${count}\n`);

            // 🔥 If no data found for filter
            if (count === 0) {
                console.log(`⚠ No records found for type "${type}".`);
                console.log("⏳ Clicking Clear All Filters...");
                await this.page.locator('.mantine-Paper-root a:has-text("Clear All Filters")').waitFor({ state: "visible" });
                await this.page.locator('.mantine-Paper-root a:has-text("Clear All Filters")').click();
                console.log("✔ Filters cleared\n");
                console.log("========== ❗ FILTER COMPLETED – No Records ==========\n");
                return;
            }

            console.log("⏳ Step 5: Reading first badge value...");
            const firstBadge = badges.first();
            await firstBadge.waitFor({ state: "visible", timeout: 5000 });

            const text = (await firstBadge.textContent()).trim();
            console.log(`📍 First row value -> "${text}"`);
            expect(text).toBe(type);
            console.log("✔ Badge text matches filter ✔\n");

            console.log("⏳ Step 6: Clearing applied filters...");
            await this.page.locator('.mantine-Paper-root a:has-text("Clear All Filters")').waitFor({ state: "visible" });
            await this.page.locator('.mantine-Paper-root a:has-text("Clear All Filters")').click();
            console.log("✔ Filters cleared successfully\n");

        } catch (err) {
            console.log(`❌ ERROR in filterPropertyNew("${type}")`);
            console.log("Message →", err.message);
            console.log("Stack →", err.stack);
            throw err;
        }

        console.log("========== 🎉 FILTER COMPLETE SUCCESS ==========\n");
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
            // "MADEIRA"
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
        console.log(`START: addPropertyTakeOff('${tab}')`);

        try {

            console.log("Step 1 → Waiting for add icon to appear...");
            await this.page.locator(".lucide-plus:visible").waitFor({ state: "visible" });
            console.log("Add icon visible");

            await this.page.locator(".lucide-plus:visible").click();
            console.log("Clicked add icon");

            console.log(`Step 2 → Waiting for button 'Add Property_${tab}_takeoff' ...`);
            await this.page.locator(`button:has-text('Add Property_${tab}_takeoff')`).waitFor({ state: "visible" });

            console.log(`➡ Clicking Add Property_${tab}_takeoff`);
            await this.page.locator(`button:has-text('Add Property_${tab}_takeoff')`).click();
            console.log("✔ Navigation to Add Takeoff modal triggered");

            // ===================== INTERIOR =====================
            if (tab === 'interior') {

                console.log("\n INTERIOR TAKEOFF SELECTED");

                console.log("⏳ Selecting Floorplan...");
                await this.page.locator('.ag-floating-top div[col-id="floorplan_id"]').waitFor({ state: "visible" });
                await this.page.locator('.ag-floating-top div[col-id="floorplan_id"]').dblclick();
                console.log("✔ Floorplan dropdown opened");

                await this.page.locator('.mantine-ScrollArea-content p').first().waitFor({ state: "visible" });
                await this.page.locator('.mantine-ScrollArea-content p').first().click();
                console.log("✔ First floorplan item selected");

                console.log("\n⏳ Editing unit_mix_quantity...");
                await this.page.waitForLoadState("networkidle");
                await this.page.waitForTimeout(3000);

                const qtyCell = this.page.locator('div[row-index="0"] div[col-id="unit_mix_quantity"]');
                await qtyCell.waitFor({ state: "visible" });
                await qtyCell.dblclick();
                console.log("✔ unit_mix_quantity cell activated for editing");

                await qtyCell.locator('input').fill('100');
                await qtyCell.locator('input').press('Enter');
                console.log("✔ Quantity set → 100");

                await this.page.waitForLoadState("networkidle");
                await this.page.waitForTimeout(3000);

                const val = await this.page.locator('div[row-index="0"] div[col-id="count"]').textContent();
                console.log(`📌 Count cell value read → "${val?.trim()}"`);

                expect.soft(val.trim(), `Count mismatch → expected 100`).toBe('100');
                console.log("🎉 Interior Takeoff validated successfully!");

            }

            // ===================== EXTERIOR =====================
            else if (tab === 'exterior') {

                console.log("\n🟠 EXTERIOR TAKEOFF SELECTED");

                console.log("⏳ Selecting Building Type...");
                await this.page.locator('.ag-floating-top div[col-id="building_type_id"]').waitFor({ state: "visible" });
                await this.page.locator('.ag-floating-top div[col-id="building_type_id"]').dblclick();
                console.log("✔ Building Type dropdown opened");

                await this.page.locator('.mantine-ScrollArea-content p').first().waitFor({ state: "visible" });
                await this.page.locator('.mantine-ScrollArea-content p').first().click();
                console.log("✔ First building type selected");

                console.log("\n⏳ Editing unit_mix_quantity...");
                await this.page.waitForLoadState("networkidle");
                await this.page.waitForTimeout(3000);

                const qtyCell = this.page.locator('div[row-index="0"] div[col-id="unit_mix_quantity"]');
                await qtyCell.waitFor({ state: "visible" });
                await qtyCell.dblclick();
                console.log("✔ unit_mix_quantity cell opened for edit");

                await qtyCell.locator('input').fill('100');
                await qtyCell.locator('input').press('Enter');
                console.log("✔ Quantity set → 100");

                await this.page.waitForLoadState("networkidle");
                await this.page.waitForTimeout(3000);

                const val = await this.page.locator('div[row-index="0"] div[col-id="count"]').textContent();
                console.log(`📌 Count cell value read → "${val?.trim()}"`);

                expect.soft(val.trim(), `Count mismatch → expected 100`).toBe('100');
                console.log("🎉 Exterior Takeoff validated successfully!");
            }

            console.log("addPropertyTakeOff SUCCESS");

        } catch (error) {
            console.log("\n ERROR in addPropertyTakeOff()");
            console.log("Tab:", tab);
            console.log("Message:", error.message);
            console.log("Stack:", error.stack);
            throw error;
        }
    }

    async addColumnTakeOff(tab) {
        console.log(`START: addColumnTakeOff('${tab}')`);

        try {
            console.log("⏳ Step 1 → Waiting for [+] button...");
            await this.page.locator(".lucide-plus:visible").waitFor({ state: "visible" });
            console.log("✔ [+] icon found → clicking");
            await this.page.locator(".lucide-plus:visible").click();

            console.log("\n⏳ Step 2 → Waiting for 'Add Data' button...");
            await this.page.locator(`button:has-text('Add Data')`).waitFor({ state: "visible" });
            console.log("✔ 'Add Data' button visible → clicking");
            await this.page.locator(`button:has-text('Add Data')`).click();

            // Create unique column
            let columnName = `columnName_${Date.now()}`;
            console.log(`\n🆕 Generating new column → ${columnName}`);

            console.log("⏳ Waiting for 'Add column' modal...");
            await this.page.locator(`.mantine-Paper-root p:has-text('Add column')`).waitFor({ state: "visible" });

            console.log("➡ Typing column name");
            await this.page.locator(`input[placeholder="Enter column name (letters, numbers, spaces, hyphens only)"]`).fill(columnName);

            console.log("➡ Typing column description");
            await this.page.locator(`input[placeholder="Enter column description (required)"]`).fill(columnName);

            console.log("➡ Selecting Text Type");
            await this.page.locator(`button:has-text('Text')`).click();

            console.log("➡ Clicking Add Column");
            await this.page.locator(`button:has-text('Add column')`).click();

            console.log("\n⏳ Waiting for column to be created...");
            await this.page.waitForLoadState("networkidle");
            await this.page.waitForTimeout(3000);
            console.log(`✔ Column submitted successfully → ${columnName}`);

            // ================== Settings Column Validation ==================
            console.log("\n🔍 Opening column settings to validate...");

            await this.page.locator(`.lucide.lucide-settings:visible`).waitFor({ state: "visible" });
            console.log("➡ Clicking settings icon");
            await this.page.locator(`.lucide.lucide-settings:visible`).click();

            console.log("⏳ Waiting for Manage Columns panel...");
            await this.page.locator(`header:has-text('Manage Columns')`).waitFor({ state: "visible" });

            console.log(`🔎 Checking newly added column exists → '${columnName}'`);
            await expect.soft(this.page.locator(`p:has-text('${columnName}')`).nth(0))
                .toBeVisible({ timeout: 5000 });

            console.log(`🎉 COLUMN VERIFIED SUCCESSFULLY → '${columnName}'`);

            console.log("\n➡ Closing Manage Columns");
            await this.page.locator(`.mantine-CloseButton-root:visible`).nth(0).click();

            console.log("\n=================================================");
            console.log(`✨ SUCCESS: addColumnTakeOff('${tab}') complete`);
            console.log("=================================================\n");
        }

        catch (err) {
            console.log("\n❌ ERROR in addColumnTakeOff()");
            console.log(`📌 Tab: ${tab}`);
            console.log(`💥 Message: ${err.message}`);
            console.log("📜 Stack trace →");
            console.log(err.stack);
            throw err;   // rethrow so test fails properly
        }
    }
    async viewDetailsButton() {
        const viewDetailsBtn = this.page.locator(propertyLocators.viewDetailsButton).first();
        await expect(viewDetailsBtn).toBeVisible({ timeout: 5000 });
        await viewDetailsBtn.click();
        await this.page.waitForTimeout(3000);
    }
    async addDataColoumn() {
        console.log("✔ clicking on add data button");
        const addDataButton = this.page.locator(propertyLocators.addColumn);
        await addDataButton.waitFor({ state: 'visible' });
        await addDataButton.click();
    }
    async addData() {

        const nameInputModal = this.page.locator(propertyLocators.nameInputModal);
        const descInput = this.page.locator(propertyLocators.descInput);
        const typeButtons = this.page.locator(propertyLocators.typeButtons);
        const submitButton = this.page.locator(propertyLocators.submitButton);
        const modal = new ModalHandler(this.page);
        await modal.addData({
            nameInputLocator: nameInputModal,
            descInputLocator: descInput,
            typeButtonsLocator: typeButtons,
            submitButtonLocator: submitButton,
            name: 'Random Name',
            description: 'Random_description_' + Date.now()
        });

    }
    async openLocationTab() {
        const locationsTab = this.page.locator(prop.locationsTab);
        await expect(locationsTab).toBeVisible();
        await locationsTab.click();
        await expect(locationsTab).toHaveAttribute('data-active', 'true');
        console.log("✔ Locations tab opened");

    }
    async addButton() {
        const addButton = this.page.locator(prop.addButton);
        await addButton.waitFor({ state: 'visible' });
        await addButton.click();
        console.log("✔ Add dropdown opened");

    }
    async addRowDetail() {

        // Select Add Site
        const addSite = this.page.locator(prop.addSite);
        await expect(addSite).toBeVisible();
        await addSite.click();
        const newRow = this.page.getByRole('row', { name: /—/ }).first();
        await expect(newRow).toBeVisible();

        // Add Name
        await this.page.locator(prop.nameCell).dblclick();
        await this.page.locator(prop.nameInput).fill("My Test Name");
        await this.page.keyboard.press("Enter");
        await this.page.waitForTimeout(1500);
        console.log("✔ New site name added");
    }
    async deleteRow() {
        const deleteRow = this.page.locator(prop.deleteRowBtn).first();
        await deleteRow.click({ delay: 200 });
        await this.page.locator(prop.deleteConfirmBtn).click();
        console.log("✔ Row deleted");
    }
    async addColumndata() {
        const addData = this.page.locator(prop.addDataOption);
        await expect(addData).toBeVisible();
        await addData.click();

        // MODAL – Add Column
        const modal = this.page.locator(prop.modal_AddColumn);
        await expect(modal).toBeVisible();
        console.log("✔ Add Column modal open");

        await this.page.locator(prop.columnNameInput).fill("Test Column");
        await this.page.locator(prop.descriptionInput).fill("This is a test description.");
        await this.page.locator(prop.addColumnBtn).waitFor({ state: "visible" });
        await expect(this.page.locator(prop.addColumnBtn)).toBeEnabled();

        await this.page.locator(prop.addColumnBtn).click();
        console.log("✔ New column added");
    }
    async settingsPanel() {
        await this.page.locator(prop.tableSettingBtn).click();

        const drawer = this.page.locator(prop.settingsDrawer);
        await expect(drawer).toBeVisible();
        await expect(drawer.locator(prop.drawerTitle)).toBeVisible();
        await expect(drawer.locator(prop.drawerClose)).toBeVisible();
        await expect(drawer.locator(prop.defaultColumnText)).toBeVisible();
        await expect(drawer.locator(prop.customColumnsText)).toBeVisible();
        console.log("✔ Settings drawer validated");
    }
    async deleteCustomColumn() {
        await this.page.locator(prop.deleteColumnIcon).click();
        await this.page.locator(prop.deleteConfirmBtn).click();
        console.log("✔ Custom column deleted");
    }
    async selectLocation(type) {
        await this.page.click(prop.locationDropdown, { force: true });
        await this.page.click(prop.locationDropdownOption(type));
        console.log(`✔ Location switched to: ${type}`);
    }
    async expectUnitTable() {
        await expect(this.page.locator(prop.unitHeader)).toBeVisible();
        const unitRowCount = await this.page.locator(prop.visibleRows).count();
        expect(unitRowCount).toBeGreaterThan(1);
        console.log(`✔ Unit rows verified (${unitRowCount})`);
    }
    async expectBuildingTable() {
        const headers = ['Name', 'Building', 'Site', 'Actions'];
        for (const header of headers) {
            await expect(this.page.getByRole('columnheader', { name: header })).toBeVisible();
        }
        console.log("✔ Building header validation complete");

        const buildingRowCount = await this.page.locator('div[role="row"]').count();
        expect(buildingRowCount).toBeGreaterThan(1);
        console.log(`✔ Building rows verified (${buildingRowCount})`);
    }
    async takeoffOption() {
        const takeoffsTab = this.page.locator('button:has-text("Takeoffs")');
        await expect(takeoffsTab).toBeVisible();
        await takeoffsTab.click();
        await expect(takeoffsTab).toHaveAttribute('data-active', 'true');
        console.log("Takeoffs tab opened");
    }
    async interiorANDexteriorTab() {
        // Selectors for tabs
        const interiorTab = this.page.locator(propertyLocators.interiorTab);
        const exteriorTab = this.page.locator(propertyLocators.exteriorTab);

        // Assert both tabs are visible
        await expect(interiorTab).toBeVisible();
        console.log("Interior tab is visible");
        await expect(exteriorTab).toBeVisible();
        console.log("Exterior tab is visible");

        // Assert Interior is selected
        await expect(interiorTab).toHaveAttribute('aria-selected', 'true');
        await expect(interiorTab).toHaveAttribute('data-active', 'true');

        // Assert Exterior is NOT selected
        await expect(exteriorTab).toHaveAttribute('aria-selected', 'false');
        await expect(exteriorTab).not.toHaveAttribute('data-active', 'true');

    }
    async filtertab() {
        await this.page.locator(".mantine-ActionIcon-icon .lucide.lucide-funnel:visible").waitFor({ state: "visible" });
        await this.page.locator(".mantine-ActionIcon-icon .lucide.lucide-funnel:visible").click();
        await this.filterPropertyNew('CALEDESI');
        await this.filterPropertyNew('CAPTIVA');
        await this.filterPropertyNew('CLEARWTR');
        await this.filterPropertyNew('DESOTO');
        await this.filterPropertyNew('MADEIRA');
        await this.page.locator(".mantine-Paper-root .mantine-CloseButton-root").waitFor({ state: "visible" });
        await this.page.locator(".mantine-Paper-root .mantine-CloseButton-root").click();
    }
    async clickExteriortab() {
        const exteriorTab = this.page.locator(propertyLocators.exteriorTab);
        await exteriorTab.click();
    }
    async searchInvalidProperty(name) {
        await this.page.locator('input[placeholder="Search..."]').fill(name);
        await this.page.waitForLoadState("networkidle");
        await this.page.waitForTimeout(3000);
    }
    async clickAssetViewer() {
        const assetViewerTab = this.page.locator(propertyLocators.assetViewer);
        await assetViewerTab.waitFor({ state: 'visible' });
        await assetViewerTab.click();
    }

    async exportBtn() {
        const assetViewerTab = this.page.locator(propertyLocators.assetViewer);
        const panelId = await assetViewerTab.getAttribute('aria-controls');
        const assetViewerPanel = this.page.locator(`#${panelId}`);
        const exportBtn = assetViewerPanel.locator('button:has-text("Export")');
        await expect(exportBtn).toBeVisible();
    }
    async clickexportBtn() {
        const assetViewerTab = this.page.locator(propertyLocators.assetViewer);
        const panelId = await assetViewerTab.getAttribute('aria-controls');
        const assetViewerPanel = this.page.locator(`#${panelId}`);
        const exportBtn = assetViewerPanel.locator('button:has-text("Export")');
        await exportBtn.click();
    }
    async placeholder_Text() {
        const assetViewerTab = this.page.locator(propertyLocators.assetViewer);
        const panelId = await assetViewerTab.getAttribute('aria-controls');
        const assetViewerPanel = this.page.locator(`#${panelId}`);
        const placeholderText = assetViewerPanel.locator('text=No 3D View Selected');
        await expect(placeholderText).toBeVisible();
        const placeholderSubText = assetViewerPanel.locator('text=Select a type, item, and view from the dropdowns above');
        await expect(placeholderSubText).toBeVisible();
        const typeDropdownInput = this.page.locator('label:has-text("Type") + div input');
        await typeDropdownInput.click();
        const typeDropdownPanel = this.page.locator('div[role="listbox"] >> text=Site');
        await expect(typeDropdownPanel.nth(1)).toBeVisible({ timeout: 5000 });
    }
    async assertOptions() {
        const options = this.page.locator('div[role="option"]');
        // await expect(options).toHaveCount(6);
        await expect(options.nth(3)).toHaveText('Site');
        await expect(options.nth(4)).toHaveText('Floorplan Types');
        await expect(options.nth(5)).toHaveText('Building Types');
    }
    async assertselectAllOption() {
        const drawer = this.page.locator('section[role="dialog"]');
        await expect(drawer).toBeVisible({ timeout: 5000 });
        const title = drawer.locator('h2 >> text=Export Views');
        await expect(title).toBeVisible();
        const closeButton = drawer.locator('button[aria-label="Close"], button:has(svg)');
        await expect(closeButton.nth(0)).toBeVisible();
        const topText = drawer.locator('p:has-text("0 of 0 views selected")');
        await expect(topText).toBeVisible();
        const selectAllBtn = drawer.locator(propertyLocators.selectall);
        const selectNoneBtn = drawer.locator(propertyLocators.selectNone);
        await expect(selectAllBtn).toBeDisabled();
        await expect(selectNoneBtn).toBeDisabled();
    }
    async bottonActionassertion() {
        const drawer = this.page.locator('section[role="dialog"]');
        await expect(drawer).toBeVisible({ timeout: 5000 });
        const cancelBtn = drawer.locator(propertyLocators.cancelbtn);
        const downloadBtn = drawer.locator(propertyLocators.selectDownload);
        await expect(cancelBtn).toBeVisible();
        await expect(downloadBtn).toBeDisabled();
    }
    async iconAssertion() {
        const drawer = this.page.locator('section[role="dialog"]');
        const cancelBtn = drawer.locator(propertyLocators.cancelbtn);
        const downloadBtn = drawer.locator(propertyLocators.selectDownload);
        const downloadIcon = downloadBtn.locator('svg');
        const cancelIcon = cancelBtn.locator('svg');
        await expect(downloadIcon).toBeVisible();
        await expect(cancelIcon).toBeVisible();
    }
    async assetViewerpanel() {
        const assetViewerTab = this.page.locator(propertyLocators.assetViewer)
        const panelId = await assetViewerTab.getAttribute('aria-controls');
        const assetViewerPanel = this.page.locator(`#${panelId}`);
        await expect(assetViewerPanel).toBeVisible({ timeout: 5000 });
        const typeDropdown = assetViewerPanel.locator('label:has-text("Type") + div input');
        const siteDropdown = assetViewerPanel.locator('label:has-text("Site") + div input');
        const viewDropdown = assetViewerPanel.locator('label:has-text("View") + div input');

        await expect(typeDropdown).toHaveValue('Site'); // Default selected value
        // await expect(siteDropdown).toBeEnabled();     // Initially disabled
        // await expect(viewDropdown).toBeDisabled();     // Initially disabled
    }

    async validateJobDetails(fields) {
        const jobFields = [
            { label: "Job Name", value: fields["Job Name"] },
            { label: "Job Type", value: fields["Job Type"] },
            { label: "Description", value: fields["Description"] }
        ];

        for (const field of jobFields) {
            const labelEl = this.page.locator(`text="${field.label}"`).first();
            const valueEl = labelEl.locator('xpath=..//following-sibling::div//p').first();
            await expect(valueEl).toBeVisible({ timeout: 10000 });

            console.log(`[ASSERT] ${field.label} → Expected: ${field.value}`);

            await expect(valueEl).toHaveText(String(field.value), { timeout: 10000 });
        }
    }

}

module.exports = PropertiesHelper;
