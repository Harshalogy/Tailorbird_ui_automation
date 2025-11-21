require('dotenv').config();
const { test, expect } = require('@playwright/test');
const PropertiesHelper = require('../pages/properties');
const data = require('../fixture/organization.json');

let context, page, prop;
let name = `name_${Date.now()}`;
let address = `Domestic Terminal`;
let city = `city_${Date.now()}`;
let state = `state_${Date.now()}`;
let zip = `zip_${Date.now()}`;
let garden_style = `Garden Style`;
let mid_rise = `Mid Rise`;
let high_rise = `High Rise`;
let military_housing = `Military Housing`;

test.beforeAll(async ({ browser }) => {
  context = await browser.newContext({ storageState: 'sessionState.json' });
  page = await context.newPage();
  prop = new PropertiesHelper(page);
  await prop.goto(data.dashboardUrl);
  await prop.goToProperties();
});

test.afterAll(async () => {
  if (context) await context.close();
});

test.describe('Property Flow Test Suite', () => {

  test('TC01 - Export & Create Property', async () => {
    await prop.exportButton();
    await prop.createProperty(name, address, city, state, zip, garden_style);
  });

  test('TC02 - Change View & Search Property', async () => {
    await prop.changeView('Table View');
    await prop.searchProperty(name);
  });

  test('TC03 - Filter Property', async () => {
    await page.locator(".lucide.lucide-funnel").waitFor({ state: "visible" });
    await page.locator(".lucide.lucide-funnel").click();
    await prop.filterProperty(garden_style);
    await prop.filterProperty(mid_rise);
    await prop.filterProperty(high_rise);
    await prop.filterProperty(military_housing);
    await page.locator(".mantine-Paper-root .mantine-CloseButton-root").waitFor({ state: "visible" });
    await page.locator(".mantine-Paper-root .mantine-CloseButton-root").click();
  });

  test('TC04 - Delete Property', async () => {
    await prop.deleteProperty(name);
  });
});
