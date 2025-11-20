require('dotenv').config();
const { test, expect } = require('@playwright/test');
const OrganizationHelper = require('../pages/organizationHelper');
const data = require('../fixture/organization.json');

let context, page, org;

test.beforeAll(async ({ browser }) => {
  context = await browser.newContext({ storageState: 'sessionState.json' });
  page = await context.newPage();
  org = new OrganizationHelper(page);
  await org.goto(data.dashboardUrl);
  await org.goto(data.organizationUrl);
  await expect(page).toHaveURL(/organization/);
});

test.afterAll(async () => {
  if (context) await context.close();
});

test.describe('Organization Flow - Clean POM', () => {

  test('TC01 - Invite new user to organization with Member role', async () => {
    const email = `member_${Date.now()}@yopmail.com`;
    await org.inviteUser(email, 'Member');
    await org.search(email);
    const row = await org.getRow(email);
    await org.validateInvitedBadge(row, email);
    expect(await org.visibleRowCount()).toBeGreaterThan(0);
  });

  test('TC02 - Invite new user to organization with Admin role', async () => {
    const email = `admin_${Date.now()}@yopmail.com`;
    await org.inviteUser(email, 'Admin');
    await org.search(email);
    const row = await org.getRow(email);
    await org.validateInvitedBadge(row, email);
    expect(await org.visibleRowCount()).toBeGreaterThan(0);
  });

  test('TC03 - Revoke user invitation to organization', async () => {
    const email = `revoke_${Date.now()}@yopmail.com`;
    await org.inviteUser(email, 'Admin');
    await org.search(email);
    const row = await org.getRow(email);
    await org.revoke(row, email);
    await org.search(email);
    await org.verifyNoResults();
  });

  test('TC04 - Resend user invitation to organization', async () => {
    await org.goto(data.organizationUrl);
    const email = `revoke_${Date.now()}@yopmail.com`;
    await org.inviteUser(email, 'Admin');
    await org.search(email);
    const row = await org.getRow(email);
    await org.openFirstMenu();
    await org.resendInvite(email);
    await org.verifyResendSuccess(email);
  });

  test('TC05 - Edit user role to organization', async () => {
    const email = 'tailorbird-admin@tailorbird.us';
    await org.search(email);
    const row = await org.getRow(email);
    const newRole = await org.toggleRole(row);
    await org.search(email);
    await org.verifyUpdatedRole(email, newRole);
  });

});
