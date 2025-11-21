const { expect } = require("@playwright/test");
const loc = require("../locators/organization");
const data = require("../fixture/organization.json");

class PropertiesHelper {
    constructor(page) {
        this.page = page;



        // Modal fields
        this.nameInput = page.getByLabel('Name');
        this.addressInput = page.getByRole('textbox', { name: 'Address' });
        this.cityInput = page.getByLabel('City');
        this.stateInput = page.getByLabel('State');
        this.zipInput = page.getByLabel('Zipcode');
        this.typeInput = page.locator('input[placeholder="Select type"]');

        // Buttons
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

        await this.page.locator(".mantine-NavLink-root:has-text('Properties')").waitFor({ state: "visible" });
        await this.page.locator(".mantine-NavLink-root:has-text('Properties')").click();

        await this.page.locator(".mantine-Breadcrumbs-root:has-text('Properties')").waitFor({ state: "visible" });
        await expect(this.page).toHaveURL(/.*\/properties/);
    }

    async createProperty(name, address, city, state, zip, type) {

        await this.page.waitForLoadState("networkidle");
        await this.page.waitForTimeout(3000);
        await this.page.locator("button:has-text('Create Property')").waitFor({ state: "visible" });
        await this.page.locator("button:has-text('Create Property')").click({ force: true });

        await this.page.locator(".mantine-Modal-header:has-text('Add property')").waitFor({ state: "visible" });
        await this.verifyModalFields();

        await this.nameInput.fill(name);
        await this.addressInput.fill(address);
        await this.page.locator(`.mantine-Autocomplete-option:has-text("${address}")`).waitFor({ state: "visible" });
        await this.page.locator(`.mantine-Autocomplete-option:has-text("${address}")`).click();
        // await this.cityInput.fill(city);
        // await this.stateInput.fill(state);
        // await this.zipInput.fill(zip);
        await this.typeInput.fill(type);
        await this.page.locator(`.mantine-Select-option:has-text("${type}")`).waitFor({ state: "visible" });
        await this.page.locator(`.mantine-Select-option:has-text("${type}")`).click();
        await this.page.waitForLoadState("networkidle");
        await this.page.waitForTimeout(3000);
        await this.addPropertyBtn.click();


        await this.page.locator(`.mantine-Breadcrumbs-root:has-text('${name}')`).waitFor({ state: "visible" });

        await this.page.locator(".mantine-NavLink-root:has-text('Properties')").waitFor({ state: "visible" });
        await this.page.locator(".mantine-NavLink-root:has-text('Properties')").click();

        await this.page.locator(`.mantine-SimpleGrid-root p:has-text('${name}')`).waitFor({ state: "visible" });

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

        // Table View
        // Grid View
        await this.page.waitForLoadState("networkidle");
        await this.page.waitForTimeout(2000);
        await this.page.locator(".lucide.lucide-layout-list").waitFor({ state: "visible" });
        await this.page.locator(".lucide.lucide-layout-list").click();
        await this.page.locator(`.mantine-Menu-itemLabel:has-text('${view}')`).waitFor({ state: "visible" });
        await this.page.locator(`.mantine-Menu-itemLabel:has-text('${view}')`).click();
        await this.page.locator(".ag-root-wrapper").waitFor({ state: "visible" });
        await this.page.waitForLoadState("networkidle");
        await this.page.waitForTimeout(2000);
    }

    async filterProperty(type) {

        await this.page.locator(".mantine-Paper-root p:has-text('Filter')").waitFor({ state: "visible" });

        // convert "Garden Style" to "garden_style"
        const normalizedType = type.toLowerCase().replace(/\s+/g, "_");
        await this.page.locator(`input[value="${normalizedType}"]`).waitFor({ state: "visible" });
        await this.page.locator(`input[value="${normalizedType}"]`).click();
        await this.page.waitForLoadState("networkidle");
        await this.page.waitForTimeout(3000);

        const badges = this.page.locator('.ag-center-cols-container .mantine-Badge-label');

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

    async exportButton() {

        const [download] = await Promise.all([
            this.page.waitForEvent("download"),         // 1️⃣ wait for browser download event
            this.page.click('.lucide-download') // 2️⃣ trigger the export
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

        const firstRowNameCell = this.page.locator(
            '.ag-center-cols-container div[role="row"] div[col-id="name"]'
        ).first();

        // Wait until row matches search text
        await expect(firstRowNameCell).toHaveText(name);

        console.log(`Search successful → Found: ${name}`);
        await this.page.locator('input[placeholder="Search..."]').clear();
    }

    async deleteProperty(name) {

        // Find the Row index of passed Property
        const cell = this.page.locator(`.ag-center-cols-container p[title="${name}"], span:has-text("${name}")`);
        const row = cell.locator("xpath=ancestor::div[@role='row']");
        const rowIndex = await row.getAttribute("row-index");
        // console.log(`Row index of "${name}":`, rowIndex);

        // delete button
        await this.page.waitForLoadState("networkidle");
        await this.page.waitForTimeout(3000);
        await this.page.locator(`.ag-pinned-right-cols-container div[row-index="${rowIndex}"] .lucide-trash-2`).waitFor({ state: "visible" });
        await this.page.locator(`.ag-pinned-right-cols-container div[row-index="${rowIndex}"] .lucide-trash-2`).click();

        await this.page.locator('.mantine-Popover-dropdown button:has-text("Delete")').waitFor({ state: "visible" });
        await this.page.locator('.mantine-Popover-dropdown button:has-text("Delete")').click();

        await this.page.locator(`.ag-center-cols-container p[title="${name}"]`).waitFor({ state: "hidden" });
        await expect(this.page.locator(`.ag-center-cols-container p[title="${name}"]`)).not.toBeVisible();
        console.log(`Property: ${name} is Deleted.`)
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
}

module.exports = PropertiesHelper;
