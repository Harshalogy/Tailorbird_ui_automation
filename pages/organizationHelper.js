const { expect } = require("@playwright/test");
const loc = require("../locators/organization");
const data = require("../fixture/organization.json");

class OrganizationHelper {
  constructor(page) {
    this.page = page;
  }

  log(msg) {
    console.log(`[OrganizationHelper] ${msg}`);
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

module.exports = OrganizationHelper;
