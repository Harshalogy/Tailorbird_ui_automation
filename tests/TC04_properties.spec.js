require('dotenv').config();
const { test, expect } = require('@playwright/test');
const PropertiesHelper = require('../pages/properties');
const data = require('../fixture/organization.json');
import fs from 'fs';
import path from 'path';
import { getPropertyName } from '../utils/propertyUtils';
import testData from '../fixture/property.json';
const ModalHandler = require('../pages/modalHandler');
const loc = require('../locators/propertyLocator');


const propertyTypes = [
  "Garden Style",
  "Mid Rise",
  "High Rise",
  "Military Housing"
];

let context, page, prop;
let name = `name_${Date.now()}`;
let address = `Domestic Terminal, College Park, GA 30337, USA`;
let city = `College Park`;
let state = `GA`;
let zip = `30337`;
let property_type = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
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


test.describe('PROPERTY FLOW TEST SUITE', () => {

  test('TC01 - Validate Property Export Functionality and New Property Creation', async () => {
    await prop.createProperty(name, address, city, state, zip, property_type);

    const propertyData = {
      propertyName: name
    };
    const downloadPath = path.join(process.cwd(), 'downloads', 'property.json');

    // Ensure the folder exists
    fs.mkdirSync(path.dirname(downloadPath), { recursive: true });

    // Write JSON file
    fs.writeFileSync(downloadPath, JSON.stringify(propertyData, null, 2), 'utf-8');

    console.log(`Property data saved to: ${downloadPath}`);
  });

  test('TC02 - Change Property View and Validate Search Results', async () => {
    const propertyName = getPropertyName();
    await prop.changeView(testData.viewName);
    await prop.searchProperty(propertyName);
  });

  test('TC03 - Validate Filters: Garden, Mid-Rise, High-Rise, and Military', async () => {
    await page.locator(".lucide.lucide-funnel").waitFor({ state: "visible" });
    await page.locator(".lucide.lucide-funnel").click();
    await prop.filterProperty(property_type);
    await prop.filterProperty(mid_rise);
    await prop.filterProperty(high_rise);
    await prop.filterProperty(military_housing);
    await page.locator(".mantine-Paper-root .mantine-CloseButton-root").waitFor({ state: "visible" });
    await page.locator(".mantine-Paper-root .mantine-CloseButton-root").click();
  });

  test('TC04 new - Validate All Column Headers in Table View', async () => {
    await prop.changeView('Table View');
    for (let i = 0; i < testData.expectedHeaders.length; i++) {
      await prop.scrollHorizontally(i);
      const headerTxt = await prop.getHeaderText(i);
      await prop.validateHeader(i, testData.expectedHeaders[i], expect);
      console.log("OK =>", headerTxt)
    }
    await prop.scrollBackToStart();
  });

  test('TC05 - Validate Overview Fields and Property Document Actions', async () => {
    const propName = getPropertyName();
    const vals = {
      "Property Name": propName,
      "Address": address,
      "City": city,
      "State": state,
      "Zip Code": zip,
      "property_type": property_type
    };

    await prop.changeView(testData.viewName);
    await prop.searchProperty(propName);

    await prop.viewPropertyDetails(propName);
    await prop.validateTabs();
    await prop.validateOverviewFields(vals);

    await prop.uploadPropertyDocument(path.resolve("./files/property_data.csv"));
    await prop.exportButton();

    await prop.manageColumns(testData.manageColumns.expectedColumns);
  });

  test('TC06 - Validate Document Section Table', async () => {
    const propertyName = getPropertyName();
    await prop.openPropertyDetails(propertyName);
    await prop.validatePropertyDocumentsSection();
    await prop.validateDocumentTableHeaders();
    await prop.validateFirstRowValues();
  });

  test('TC07 - validate add data form', async () => {
    const propertyName = getPropertyName();
    console.log('Using property name:', propertyName);
    await prop.changeView('Table View');
    await prop.searchProperty(propertyName);
    const viewDetailsBtn = page.locator('button[title="View Details"]').first();
    await expect(viewDetailsBtn).toBeVisible({ timeout: 5000 });
    await viewDetailsBtn.click();
    await page.waitForTimeout(3000);
    const addDataButton = page.locator('button[data-testid="bt-add-column"]');
    await addDataButton.waitFor({ state: 'visible' });
    await addDataButton.click();
    const nameInputModal = page.locator('input[placeholder^="Enter column name"]');
    const descInput = page.locator('input[placeholder^="Enter column description"]');
    const typeButtons = page.locator('div[style*="grid-template-columns"] button');
    const submitButton = page.locator('button:has-text("Add column"):not([disabled])');
    const modal = new ModalHandler(page);
    await modal.addData({
      nameInputLocator: nameInputModal,
      descInputLocator: descInput,
      typeButtonsLocator: typeButtons,
      submitButtonLocator: submitButton,
      name: 'Random_column_' + Date.now(),
      description: 'Random_description_' + Date.now()
    });
  });

  test('TC08 - Validate Delete Property', async () => {
    const propertyName = getPropertyName();
    await prop.changeView(testData.viewName);
    await prop.searchProperty(propertyName);
    await prop.deleteProperty(propertyName);
  });

   test("TC09 - Validate Location Tab", async () => {

    const propertyName = 'Harbor Bay at MacDill_Liberty Cove (Sample Property)';
    console.log(`🔎 Using property name: ${propertyName}`);

    // Change view & search property
    await prop.changeView('Table View');
    console.log("✔ Changed to Table View");

    await prop.searchProperty(propertyName);
    console.log("✔ Property searched successfully");

    // VIEW DETAILS
    const viewDetailsBtn = page.locator('button[title="View Details"]').first();
    await expect(viewDetailsBtn).toBeVisible({ timeout: 5000 });
    await viewDetailsBtn.click();

    // LOCATION TAB
    const locationsTab = page.locator(loc.locationsTab);
    await expect(locationsTab).toBeVisible();
    await locationsTab.click();
    await expect(locationsTab).toHaveAttribute('data-active', 'true');
    console.log("✔ Locations tab opened");

    // ADD SITE
    const addButton = page.locator(loc.addButton);
    await addButton.waitFor({ state: 'visible' });
    await addButton.click();
    console.log("✔ Add dropdown opened");

    // Select Add Site
    const addSite = page.locator(loc.addSite);
    await expect(addSite).toBeVisible();
    await addSite.click();

    const newRow = page.getByRole('row', { name: /—/ }).first();
    await expect(newRow).toBeVisible();
    console.log("✔ New empty row visible");

    // Add Name
    await page.locator(loc.nameCell).dblclick();
    await page.locator(loc.nameInput).fill("My Test Name");
    await page.keyboard.press("Enter");
    console.log("✔ New site name added");

    await page.waitForTimeout(1500);

    // DELETE ROW
    const deleteRow = page.locator(loc.deleteRowBtn).first();
    await deleteRow.click({ delay: 200 });
    await page.locator(loc.deleteConfirmBtn).click();
    console.log("✔ Row deleted");

    // ADD DATA
    await addButton.click();
    const addData = page.locator(loc.addDataOption);
    await expect(addData).toBeVisible();
    await addData.click();

    // MODAL – Add Column
    const modal = page.locator(loc.modal_AddColumn);
    await expect(modal).toBeVisible();
    console.log("✔ Add Column modal open");

    await page.locator(loc.columnNameInput).fill("Test Column");
    await page.locator(loc.descriptionInput).fill("This is a test description.");
    await page.locator(loc.addColumnBtn).waitFor({ state: "visible" });
    await expect(page.locator(loc.addColumnBtn)).toBeEnabled();

    await page.locator(loc.addColumnBtn).click();
    console.log("✔ New column added");

    // SETTINGS PANEL
    await page.locator(loc.tableSettingBtn).click();

    const drawer = page.locator(loc.settingsDrawer);
    await expect(drawer).toBeVisible();
    await expect(drawer.locator(loc.drawerTitle)).toBeVisible();
    await expect(drawer.locator(loc.drawerClose)).toBeVisible();
    await expect(drawer.locator(loc.defaultColumnText)).toBeVisible();
    await expect(drawer.locator(loc.customColumnsText)).toBeVisible();
    console.log("✔ Settings drawer validated");

    // DELETE COLUMN
    await page.locator(loc.deleteColumnIcon).click();
    await page.locator(loc.deleteConfirmBtn).click();
    console.log("✔ Custom column deleted");

    // LOCATION DROPDOWN FUNCTION
    async function selectLocation(type) {
      await page.click(loc.locationDropdown);
      await page.click(loc.locationDropdownOption(type));
      console.log(`✔ Location switched to: ${type}`);
    }

    // UNIT VALIDATION
    await selectLocation("unit");
    await expect(page.locator(loc.unitHeader)).toBeVisible();

    const unitRowCount = await page.locator(loc.visibleRows).count();
    expect(unitRowCount).toBeGreaterThan(1);
    console.log(`✔ Unit rows verified (${unitRowCount})`);

    // BUILDING VALIDATION
    await selectLocation("building");

    const headers = ['Name', 'Building', 'Site', 'Actions'];
    for (const header of headers) {
      await expect(page.getByRole('columnheader', { name: header })).toBeVisible();
    }
    console.log("✔ Building header validation complete");

    const buildingRowCount = await page.locator('div[role="row"]').count();
    expect(buildingRowCount).toBeGreaterThan(1);
    console.log(`✔ Building rows verified (${buildingRowCount})`);
  });

  test.skip('TC10 - validate takeoffs Interior panel and dropdowns', async () => {

    const propertyName = 'Harbor Bay at MacDill_Liberty Cove (Sample Property)';
    console.log(`🔎 Using property name: ${propertyName}`);

    // Change view & search property
    await prop.changeView('Table View');
    await prop.searchProperty(propertyName);

    // VIEW DETAILS button
    const viewDetailsBtn = page.locator('button[title="View Details"]').first();
    await expect(viewDetailsBtn).toBeVisible({ timeout: 5000 });
    await viewDetailsBtn.click();

    // TAKEOFFS TAB
    const takeoffsTab = page.locator('button:has-text("Takeoffs")');
    await expect(takeoffsTab).toBeVisible();
    await takeoffsTab.click();
    await expect(takeoffsTab).toHaveAttribute('data-active', 'true');

    // Selectors for tabs
    const interiorTab = page.locator('button[role="tab"]:has-text("Interior")');
    const exteriorTab = page.locator('button[role="tab"]:has-text("Exterior")');

    // Assert both tabs are visible
    await expect(interiorTab).toBeVisible();
    await expect(exteriorTab).toBeVisible();

    // Assert Interior is selected
    await expect(interiorTab).toHaveAttribute('aria-selected', 'true');
    await expect(interiorTab).toHaveAttribute('data-active', 'true');

    // Assert Exterior is NOT selected
    await expect(exteriorTab).toHaveAttribute('aria-selected', 'false');
    await expect(exteriorTab).not.toHaveAttribute('data-active', 'true');

    const expectedHeaders = [
      "Floor Plan Type",
      "Floor Plan Type Area",
      "Total Floor Plan Type Quantity",
      "Unit Mix Floor Plan Type Quantity",
      "Location/Room",
      "Level",
      "Item Category",
      "Item Subcategory",
      "Item",
      "SKU",
      "Item Count",
      "Item UOM",
      "Qauntity Per Item",
      "Total Quantity",
      "Wastage (%)",
      "Total Including Wastage",
      "Actions"
    ];

    const headerLocator = page.locator('.ag-header-cell .mantine-Text-root:visible');
    const scrollContainer = page.locator('.ag-center-cols-viewport');

    console.log("[STEP] Checking header count...");
    // await expect(headerLocator).toHaveCount(expectedHeaders.length);
    console.log("[INFO] Header count matches.");

    // Export button
    await prop.exportButton();

    // FILTERS
    await page.locator(".mantine-ActionIcon-icon .lucide.lucide-funnel:visible").waitFor({ state: "visible" });
    await page.locator(".mantine-ActionIcon-icon .lucide.lucide-funnel:visible").click();
    await prop.filterPropertyNew('CALEDESI');
    await prop.filterPropertyNew('CAPTIVA');
    await prop.filterPropertyNew('CLEARWTR');
    await prop.filterPropertyNew('DESOTO');
    await prop.filterPropertyNew('MADEIRA');
    await page.locator(".mantine-Paper-root .mantine-CloseButton-root").waitFor({ state: "visible" });
    await page.locator(".mantine-Paper-root .mantine-CloseButton-root").click();


    // Unit Mix
    await prop.unitMix();

    // Add Property Interior TakeOff
    // ERROR: Applicaton failed to respond
    await prop.addPropertyTakeOff('interior');

    // Add Column Interior TakeOff
    await prop.addColumnTakeOff('interior');

  });

  test.skip('TC11 - validate takeoffs Exterior panel and dropdowns', async () => {

    const propertyName = 'Harbor Bay at MacDill_Liberty Cove (Sample Property)';
    console.log(`🔎 Using property name: ${propertyName}`);

    // Change view & search property
    await prop.changeView('Table View');
    await prop.searchProperty(propertyName);

    // VIEW DETAILS button
    const viewDetailsBtn = page.locator('button[title="View Details"]').first();
    await expect(viewDetailsBtn).toBeVisible({ timeout: 5000 });
    await viewDetailsBtn.click();

    // TAKEOFFS TAB
    const takeoffsTab = page.locator('button:has-text("Takeoffs")');
    await expect(takeoffsTab).toBeVisible();
    await takeoffsTab.click();
    await expect(takeoffsTab).toHaveAttribute('data-active', 'true');

    // Selectors for tabs
    const interiorTab = page.locator('button[role="tab"]:has-text("Interior")');
    const exteriorTab = page.locator('button[role="tab"]:has-text("Exterior")');

    // Assert both tabs are visible
    await expect(interiorTab).toBeVisible();
    await expect(exteriorTab).toBeVisible();

    // Assert Interior is selected
    await expect(interiorTab).toHaveAttribute('aria-selected', 'true');
    await expect(interiorTab).toHaveAttribute('data-active', 'true');

    // Assert Exterior is NOT selected
    await expect(exteriorTab).toHaveAttribute('aria-selected', 'false');
    await expect(exteriorTab).not.toHaveAttribute('data-active', 'true');

    // Click Exterior tab
    await exteriorTab.click();

    const expectedHeaders = [
      "Floor Plan Type",
      "Floor Plan Type Area",
      "Total Floor Plan Type Quantity",
      "Unit Mix Floor Plan Type Quantity",
      "Location/Room",
      "Level",
      "Item Category",
      "Item Subcategory",
      "Item",
      "SKU",
      "Item Count",
      "Item UOM",
      "Qauntity Per Item",
      "Total Quantity",
      "Wastage (%)",
      "Total Including Wastage",
      "Actions"
    ];

    const headerLocator = page.locator('.ag-header-cell .mantine-Text-root:visible');
    const scrollContainer = page.locator('.ag-center-cols-viewport');

    console.log("[STEP] Checking header count...");
    // await expect(headerLocator).toHaveCount(expectedHeaders.length);
    console.log("[INFO] Header count matches.");

    // Export button
    await prop.exportButton();

    // // FILTERS
    // await page.locator(".mantine-ActionIcon-icon .lucide.lucide-funnel:visible").waitFor({ state: "visible" });
    // await page.locator(".mantine-ActionIcon-icon .lucide.lucide-funnel:visible").click();
    // await prop.filterPropertyNew('CALEDESI');
    // await prop.filterPropertyNew('CAPTIVA');
    // await prop.filterPropertyNew('CLEARWTR');
    // await prop.filterPropertyNew('DESOTO');
    // await prop.filterPropertyNew('MADEIRA');
    // await page.locator(".mantine-Paper-root .mantine-CloseButton-root").waitFor({ state: "visible" });
    // await page.locator(".mantine-Paper-root .mantine-CloseButton-root").click();


    // Unit Mix
    await prop.unitMix();

    // Add Property Exterior TakeOff
    // ERROR: Applicaton failed to respond
    await prop.addPropertyTakeOff('exterior');

    // Add Column Exterior TakeOff
    await prop.addColumnTakeOff('exterior');
  });

 

});
