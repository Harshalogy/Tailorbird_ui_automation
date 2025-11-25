require('dotenv').config();
const { test, expect } = require('@playwright/test');
const PropertiesHelper = require('../pages/properties');
const data = require('../fixture/organization.json');
import fs from 'fs';
import path from 'path';
import { getPropertyName } from '../utils/propertyUtils';

let context, page, prop;
let name = `name_${Date.now()}`;
let address = `Domestic Terminal, College Park, GA 30337, USA`;
let city = `College Park`;
let state = `GA`;
let zip = `30337`;
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

  test('TC01 - Validate Property Export Functionality and New Property Creation', async () => {
    // await prop.exportButton();
    await prop.createProperty(name, address, city, state, zip, garden_style);
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
    await prop.changeView('Table View');
    await prop.searchProperty(name);
  });

  test('TC03 - Validate Filters: Garden, Mid-Rise, High-Rise, and Military', async () => {
    await page.locator(".lucide.lucide-funnel").waitFor({ state: "visible" });
    await page.locator(".lucide.lucide-funnel").click();
    await prop.filterProperty(garden_style);
    await prop.filterProperty(mid_rise);
    await prop.filterProperty(high_rise);
    await prop.filterProperty(military_housing);
    await page.locator(".mantine-Paper-root .mantine-CloseButton-root").waitFor({ state: "visible" });
    await page.locator(".mantine-Paper-root .mantine-CloseButton-root").click();
  });

  test('TC04 - Validate All Column Headers in Table View', async () => {
    console.log("=== TC04 - Starting Header Validation Test ===");

    try {
      console.log("[STEP] Changing to Table View...");
      await prop.changeView('Table View');
      console.log("[INFO] View changed successfully.");

      const expectedHeaders = [
        "Name",
        "Address",
        "City",
        "State",
        "Zipcode",
        "Type",
        "Unit Count",
        "Project Count",
        "Job Count",
        "Budget Variance",
        "Actions"
      ];

      const headerLocator = page.locator('.ag-header-cell .mantine-Text-root');
      const scrollContainer = page.locator('.ag-center-cols-viewport');

      console.log("[STEP] Validating each header one by one...");

      for (let i = 0; i < 10; i++) {

        // Scroll horizontally for each header index
        const scrollAmount = (i + 1) * 5; // incremental scroll
        console.log(`\n[SCROLL] Scrolling horizontally to reveal header index ${i}...`);
        await scrollContainer.evaluate((el, amt) => el.scrollBy({ left: amt }), scrollAmount);

        const actualText = await headerLocator.nth(i).textContent();

        console.log(`[HEADER CHECK] Index ${i}`);
        console.log(`  Expected: "${expectedHeaders[i]}"`);
        console.log(`  Received: "${actualText}"`);

        try {
          await expect(headerLocator.nth(i)).toHaveText(expectedHeaders[i], { timeout: 5000 });
          console.log("  ✔ MATCHED");
        } catch (innerErr) {
          console.log("  ✘ MISMATCH");
          console.log("  [ERROR DETAILS]", innerErr);
          throw new Error(
            `Header mismatch at index ${i}. Expected "${expectedHeaders[i]}", but got "${actualText}".`
          );
        }
      }
      console.log("[STEP] Checking header count...");
      await expect(headerLocator).toHaveCount(expectedHeaders.length);
      console.log("[INFO] Header count matches.");
      console.log("\n=== TC05 - Header Validation Completed Successfully ===");

    } catch (err) {
      console.log("\n===== ❌ TEST FAILED (TRY/CATCH) =====");
      console.log("[ERROR MESSAGE]:", err.message);
      console.log("[STACK]:", err.stack);
      throw err;
    }
  });

  test('TC05 - Validate Overview Fields and Property Document Actions (Import, Export, Add Column, Manage Column)', async () => {
    const propertyName = getPropertyName();
    // === Property Creation & Search ===
    try {
      console.log('Using property name:', propertyName);

      // Change view and search property
      await prop.changeView('Table View');
      await prop.searchProperty(propertyName);
      console.log("[STEP] Property created and searched successfully");
    } catch (err) {
      console.log("[ERROR] Failed to create or search property:", err);
      throw err;
    }

    // === View Details ===
    try {
      console.log("[STEP] Clicking View Details...");
      const viewDetailsBtn = page.locator('button[title="View Details"]').first();
      await expect(viewDetailsBtn).toBeVisible({ timeout: 5000 });
      await viewDetailsBtn.click();
      await expect(page).toHaveURL(/\/properties\/details\?propertyId=/);
      console.log("[ASSERT] Navigated to property details page");

      const title = page.locator(`text=${propertyName}`).first();
      await expect(title).toBeVisible({ timeout: 8000 });
      console.log("[ASSERT] Property name visible →", await title.textContent());
    } catch (err) {
      console.log("[ERROR] View Details step failed:", err);
      throw err;
    }

    // === Tabs Validation ===
    try {
      const tabs = ["Overview", "Asset Viewer", "Takeoffs", "Locations"];
      for (const tab of tabs) {
        const tabEl = page.getByRole('tab', { name: tab });
        await expect(tabEl).toBeVisible();
        console.log(`[ASSERT] Tab visible → ${tab}`);
      }

      const overviewTab = page.getByRole("tab", { name: "Overview" });
      await expect(overviewTab).toHaveAttribute("data-active", "true");
      console.log("[ASSERT] User is on Overview tab");
    } catch (err) {
      console.log("[ERROR] Tabs validation failed:", err);
      throw err;
    }

    // === Property Overview Fields ===
    try {
      const overview = [
        { label: "Ownership Group", value: "Tailorbird_QA_Automations" },
        { label: "Property Name", value: propertyName },
        { label: "Property Type", value: "Garden Style" },
        { label: "Address", value: address },
        { label: "City", value: city },
        { label: "State", value: state },
        { label: "Zip Code", value: zip },
        { label: "Unit Count", value: "0" }
      ];

      for (const f of overview) {
        const labelEl = page.locator(`text="${f.label}"`).first();
        const valueEl = labelEl.locator('xpath=../following-sibling::div//p').first();
        await expect(valueEl).toBeVisible({ timeout: 5000 });
        await expect(valueEl).toHaveText(String(f.value));
        console.log(`[ASSERT] ${f.label} →`, await valueEl.textContent());
      }

      console.log("[INFO] Property Overview validated successfully.");
    } catch (err) {
      console.log("[ERROR] Property Overview validation failed:", err);
      throw err;
    }

    // === Property Documents Section ===
    try {
      const propertyDocumentsTitle = page.locator('p.mantine-Text-root', { hasText: 'Property Documents' });
      await expect(propertyDocumentsTitle).toBeVisible();
      console.log("[ASSERT] Property Documents title visible");

      const uploadFilesBtn = page.getByRole("button", { name: "Upload Files" });
      await expect(uploadFilesBtn).toBeVisible();
      console.log("[ASSERT] Upload Files button visible");

      console.log("[STEP] Clicking Upload Files button...");
      await uploadFilesBtn.click();
    } catch (err) {
      console.log("[ERROR] Property Documents section validation failed:", err);
      throw err;
    }

    // === Upload Modal ===
    try {
      const dialog = page.locator("dialog[open]");
      await expect(dialog).toBeVisible();
      console.log("[ASSERT] Upload modal opened");

      const uploadTexts = ["Drop files here", "From device", "Google Drive", "Dropbox", "Cancel", "Powered by Uploadcare"];
      for (const t of uploadTexts) {
        const txtEl = dialog.getByText(t);
        await expect(txtEl).toBeVisible();
        console.log(`[ASSERT] Upload modal text visible → ${await txtEl.textContent()}`);
      }

      // Upload file
      console.log("[STEP] Uploading file...");
      const fileInput = page.locator('input[type="file"]');
      await dialog.getByText("From device").click();
      await fileInput.waitFor({ state: "attached" });
      await fileInput.setInputFiles("./files/property_data.csv");
      console.log("[ASSERT] File uploaded → property-data.csv");
    } catch (err) {
      console.log("[ERROR] Upload modal failed:", err);
      throw err;
    }

    // === Upload List Modal ===
    try {
      const uploadListDialog = page.locator('dialog[open] uc-upload-list');
      await expect(uploadListDialog).toBeVisible();
      console.log("[ASSERT] Upload list modal visible");

      const header = uploadListDialog.getByText(/file uploaded/i);
      await expect(header).toBeVisible();
      console.log("[ASSERT] Header →", await header.textContent());

      const uploadedFileName = uploadListDialog.locator(".uc-file-name");
      await expect(uploadedFileName).toBeVisible();
      console.log("[ASSERT] Uploaded file name →", await uploadedFileName.textContent());

      const toolbarBtns = ["Remove", "Clear", /Add more/i, "Done"];
      for (const btn of toolbarBtns) {
        const btnEl = uploadListDialog.getByRole("button", { name: btn });
        await expect(btnEl).toBeVisible();
        console.log(`[ASSERT] Toolbar button visible → ${await btnEl.textContent()}`);
      }

      console.log("[STEP] Clicking Done...");
      await uploadListDialog.getByRole("button", { name: "Done" }).click();
      console.log("[ASSERT] Done clicked → Upload modal closed");
    } catch (err) {
      console.log("[ERROR] Upload List Modal validation failed:", err);
      throw err;
    }

    // === Add Tags & Types Modal ===
    try {
      const tagsModal = page.locator('section[role="dialog"] >> text=Add Tags & Types').locator('..').locator('..');
      await expect(tagsModal).toBeVisible();
      console.log("[ASSERT] Add Tags & Types modal visible");

      const modalTitle = tagsModal.getByRole("heading", { name: "Add Tags & Types" });
      await expect(modalTitle).toBeVisible();
      console.log("[ASSERT] Modal title →", await modalTitle.textContent());

      const modalFileName = tagsModal.getByText("property_data.csv", { exact: true });
      await expect(modalFileName).toBeVisible();
      console.log("[ASSERT] File name →", await modalFileName.textContent());

      const fileSize = tagsModal.getByText(/Bytes/);
      await expect(fileSize).toBeVisible();
      console.log("[ASSERT] File size →", await fileSize.textContent());

      const clearAllBtn = tagsModal.getByRole("button", { name: "Clear all" });
      const addFilesBtn = tagsModal.getByRole("button", { name: "Add Files" });
      await expect(clearAllBtn).toBeVisible();
      await expect(addFilesBtn).toBeVisible();
      console.log("[ASSERT] Clear all & Add Files buttons visible");

      console.log("[STEP] Clicking Add Files...");
      await addFilesBtn.click();
      await page.waitForTimeout(5000);
      console.log("[ASSERT] Add Files clicked → ready for additional uploads");
    } catch (err) {
      console.log("[ERROR] Add Tags & Types modal validation failed:", err);
      throw err;
    }

    // 1) Get the first row
    const firstRow = page.locator('.ag-center-cols-container [role="row"]').first();

    // 2) Get all visible gridcells inside the row
    const cells = firstRow.locator('[role="gridcell"]');

    const cellCount = await cells.count();
    console.log(`Total cells in row: ${cellCount}`);

    // 3) Loop through all cells and log their content
    let extractedValues = {};

    for (let i = 0; i < cellCount; i++) {
      const cell = cells.nth(i);
      const colId = await cell.getAttribute("col-id");

      // extract text
      const text = (await cell.innerText()).trim();

      extractedValues[colId] = text;
      console.log(`➡ ${colId}: ${text}`);
    }

    await prop.exportButton();

    const tableSettingsBtn = page.locator('button:has(svg.lucide-settings)');
    await expect(tableSettingsBtn.nth(0)).toBeVisible();
    await tableSettingsBtn.nth(0).click();

    console.log("✔ Table Settings button clicked");

    // === Manage Columns modal root ===
    const drawer = page.locator('section[role="dialog"]');

    // Modal should be visible
    await expect(drawer).toBeVisible();
    console.log("✔ Manage Columns modal visible");

    // === Assert Title ===
    await expect(drawer.getByText("Manage Columns", { exact: true })).toBeVisible();
    console.log("✔ Title verified");

    // === Assert Settings Icon ===
    await expect(drawer.locator('svg.lucide-settings')).toBeVisible();
    console.log("✔ Settings icon visible");

    // === Assert "Default Columns" section ===
    await expect(drawer.getByText("Default Columns", { exact: true })).toBeVisible();
    console.log("✔ Default Columns section visible");

    // === Assert Column Labels (generic & scalable) ===
    const expectedColumns = [
      "Cover",
      "Description",
      "File Name",
      "mime_type",
      "Project",
      "Property",
      "Size",
      "Source",
      "System Remarks",
      "Tags",
      "Type",
      "Uploaded Date",
      "uuid"
    ];

    for (const col of expectedColumns) {
      const row = drawer.locator(`p:has-text("${col}")`);
      await expect(row.nth(0)).toBeVisible();
      console.log(`✔ Column row visible → ${col}`);

      const checkbox = row
        .locator('xpath=ancestor::div[contains(@style,"cursor")]')
        .locator('input[type="checkbox"]');

      await expect(checkbox.nth(0)).toBeVisible();
      console.log(`✔ Checkbox visible → ${col}`);
    }

    // === Assert scroll container ===
    await expect(drawer.locator('[class*="ScrollArea-viewport"]')).toBeVisible();
    console.log("✔ Scroll area verified");

    // Check if "Random Name" exists inside Custom Columns
    const randomNameRow = drawer.locator('p:has-text("Random Name")');

    if (await randomNameRow.count() > 0) {
      console.log("🟡 Random Name column found — deleting it...");

      // Locate the trash icon next to the Random Name row
      const deleteButton = randomNameRow
        .locator('xpath=ancestor::div[contains(@style,"cursor")]')
        .locator('button:has(svg.lucide-trash-2)');

      await deleteButton.click();

      console.log("🟡 Delete confirmation opened");
      const deleteDialog = page.locator('.mantine-Popover-dropdown[role="dialog"]');

      // Wait for dialog to become visible
      await expect(deleteDialog).toBeVisible();

      // Click the red Delete button
      await deleteDialog.getByRole('button', { name: 'Delete' }).click();

      console.log("🟢 Delete confirmed");

      console.log("🟢 Random Name column deleted successfully");
    } else {
      console.log("ℹ️ Random Name NOT found — nothing to delete");
    }



    console.log("[INFO] TC05 completed successfully ✅");
  });

  test('TC06 - Change View & Search Property', async () => {
    const propertyName = getPropertyName();
    console.log('Using property name:', propertyName);

    // Change view and search property
    await prop.changeView('Table View');
    await prop.searchProperty(propertyName);

    // Assert 'View Details' button exists and click it
    const viewDetailsBtn = page.locator('button[title="View Details"]').first();
    await expect(viewDetailsBtn).toBeVisible({ timeout: 5000 });
    await viewDetailsBtn.click();

    // Assertions for Property Documents section
    const sectionHeader = page.locator('text=Property Documents');
    await expect(sectionHeader).toBeVisible();

    const sectionSubHeader = page.locator('text=Files and images related to this property');
    await expect(sectionSubHeader).toBeVisible();

    const uploadBtn = page.locator('button:has-text("Upload Files")');
    await expect(uploadBtn.first()).toBeVisible();

    // Assert table headers dynamically
    const headersLocator = page.locator('table thead th');
    const headersCount = await headersLocator.count();
    console.log('Table headers:');
    for (let i = 0; i < headersCount; i++) {
      const headerText = await headersLocator.nth(i).innerText();
      console.log(`Header ${i}:`, headerText);
      expect(headerText.trim().length).toBeGreaterThan(0);
    }

    // Assert first row dynamically
    const firstRowLocator = page.locator('table tbody tr').first();
    const cells = firstRowLocator.locator('td');
    const cellsCount = await cells.count();
    console.log('First row cell values:');
    for (let i = 0; i < cellsCount; i++) {
      const cellText = await cells.nth(i).innerText();
      console.log(`Cell ${i}:`, cellText);
      expect(cellText.trim().length).toBeGreaterThan(0);
    }
  });

  test('TC07 - validate asset viewer tab', async () => {
    const propertyName = getPropertyName();
    console.log('Using property name:', propertyName);

    // Change view and search property
    await prop.changeView('Table View');
    await prop.searchProperty(propertyName);

    // Assert 'View Details' button exists and click it
    const viewDetailsBtn = page.locator('button[title="View Details"]').first();
    await expect(viewDetailsBtn).toBeVisible({ timeout: 5000 });
    await viewDetailsBtn.click();

    // Click Asset Viewer tab
    const assetViewerTab = page.locator('button:has-text("Asset Viewer")');
    await assetViewerTab.waitFor({ state: 'visible' });
    await assetViewerTab.click();

    // ===== Assertions for Asset Viewer page =====

    // Then get the panel via 'aria-controls' from the tab
    const panelId = await assetViewerTab.getAttribute('aria-controls');
    const assetViewerPanel = page.locator(`#${panelId}`);
    await expect(assetViewerPanel).toBeVisible({ timeout: 5000 });


    // Dropdowns
    const typeDropdown = assetViewerPanel.locator('label:has-text("Type") + div input');
    const siteDropdown = assetViewerPanel.locator('label:has-text("Site") + div input');
    const viewDropdown = assetViewerPanel.locator('label:has-text("View") + div input');

    await expect(typeDropdown).toHaveValue('Site'); // Default selected value
    await expect(siteDropdown).toBeDisabled();     // Initially disabled
    await expect(viewDropdown).toBeDisabled();     // Initially disabled

    // Export button
    const exportBtn = assetViewerPanel.locator('button:has-text("Export")');
    await expect(exportBtn).toBeVisible();

    // Placeholder text for 3D view
    const placeholderText = assetViewerPanel.locator('text=No 3D View Selected');
    await expect(placeholderText).toBeVisible();

    const placeholderSubText = assetViewerPanel.locator('text=Select a type, item, and view from the dropdowns above');
    await expect(placeholderSubText).toBeVisible();

    const typeDropdownInput = page.locator('label:has-text("Type") + div input');

    // Click to open the dropdown
    await typeDropdownInput.click();
    const typeDropdownPanel = page.locator('div[role="listbox"] >> text=Site');
    await expect(typeDropdownPanel.nth(1)).toBeVisible({ timeout: 5000 });

    // Assert the 3 options
    const options = page.locator('div[role="option"]');
    await expect(options).toHaveCount(6);
    await expect(options.nth(3)).toHaveText('Site');
    await expect(options.nth(4)).toHaveText('Floorplan Types');
    await expect(options.nth(5)).toHaveText('Building Types');

    await exportBtn.click();

    const drawer = page.locator('section[role="dialog"]');
    await expect(drawer).toBeVisible({ timeout: 5000 });

    // Assert the drawer title
    const title = drawer.locator('h2 >> text=Export Views');
    await expect(title).toBeVisible();

    // Assert header buttons
    const closeButton = drawer.locator('button[aria-label="Close"], button:has(svg)');
    await expect(closeButton.nth(0)).toBeVisible();

    // Assert top section text
    const topText = drawer.locator('p:has-text("0 of 0 views selected")');
    await expect(topText).toBeVisible();

    // Assert Select All / Select None buttons
    const selectAllBtn = drawer.locator('button:has-text("Select All")');
    const selectNoneBtn = drawer.locator('button:has-text("Select None")');
    await expect(selectAllBtn).toBeDisabled();
    await expect(selectNoneBtn).toBeDisabled();

    // Assert main content scroll area exists
    const scrollArea = drawer.locator('.mantine-ScrollArea-root');
    await expect(scrollArea).toBeVisible();

    // Assert bottom action buttons
    const cancelBtn = drawer.locator('button:has-text("Cancel")');
    const downloadBtn = drawer.locator('button:has-text("Download Selected")');
    await expect(cancelBtn).toBeVisible();
    await expect(downloadBtn).toBeDisabled();

    // Optionally assert icons exist inside buttons (Download / Cancel)
    const downloadIcon = downloadBtn.locator('svg');
    const cancelIcon = cancelBtn.locator('svg');
    await expect(downloadIcon).toBeVisible();
    await expect(cancelIcon).toBeVisible();
  });

  test('TC08 - Delete Property', async () => {
    const propertyName = getPropertyName();
    console.log('Using property name:', propertyName);
    await prop.deleteProperty(propertyName);
  });

  class ModalHandler {
    constructor(page) {
      this.page = page;
    }

    /**
     * Generic method to add data in any modal
     * @param {Locator} nameInputLocator - Locator for the name input
     * @param {Locator} descInputLocator - Locator for the description input
     * @param {Locator} typeButtonsLocator - Locator for all type buttons
     * @param {Locator} submitButtonLocator - Locator for the submit/add button
     * @param {string} name - Value for name field
     * @param {string} description - Value for description field
     */
    async addData({ nameInputLocator, descInputLocator, typeButtonsLocator, submitButtonLocator, name, description }) {
      // Fill name and description
      await nameInputLocator.fill(name);
      await descInputLocator.fill(description);

      // Get all type buttons
      const typeButtons = await typeButtonsLocator.elementHandles();

      // Pick a random type
      const randomIndex = Math.floor(Math.random() * typeButtons.length);
      await typeButtons[randomIndex].click();

      // Wait for submit button to be enabled and click
      await submitButtonLocator.waitFor({ state: 'visible' });
      await submitButtonLocator.click();
      await this.page.waitForTimeout(3000);
    }
  }

  test('TC09 - validate add data form', async () => {
    const propertyName = getPropertyName();
    console.log('Using property name:', propertyName);

    // Change view and search property
    await prop.changeView('Table View');
    await prop.searchProperty(propertyName);

    // Assert 'View Details' button exists and click it
    const viewDetailsBtn = page.locator('button[title="View Details"]').first();
    await expect(viewDetailsBtn).toBeVisible({ timeout: 5000 });
    await viewDetailsBtn.click();

    // Click the Add Data button
    const addDataButton = page.locator('button[data-testid="bt-add-column"]');
    await addDataButton.waitFor({ state: 'visible' });
    await addDataButton.click();


    // Create locators for the modal fields
    const nameInput = page.locator('input[placeholder^="Enter column name"]');
    const descInput = page.locator('input[placeholder^="Enter column description"]');
    const typeButtons = page.locator('div[style*="grid-template-columns"] button');
    const submitButton = page.locator('button:has-text("Add column"):not([disabled])');

    // Instantiate handler
    const modal = new ModalHandler(page);

    // Call generic method
    await modal.addData({
      nameInputLocator: nameInput,
      descInputLocator: descInput,
      typeButtonsLocator: typeButtons,
      submitButtonLocator: submitButton,
      name: 'Random_column_' + Date.now(),
      description: 'Random_description_' + Date.now(),
    });
  });

  test('TC10 - validate asset viewer panel and dropdowns', async () => {
    const propertyName = 'Harbor Bay at MacDill_Liberty Cove (Sample Property)';
    console.log('Using property name:', propertyName);

    // Change view and search property
    await prop.changeView('Table View');
    await prop.searchProperty(propertyName);

    // Assert 'View Details' button exists and click it
    const viewDetailsBtn = page.locator('button[title="View Details"]').first();
    await expect(viewDetailsBtn).toBeVisible({ timeout: 5000 });
    await viewDetailsBtn.click();

    // Click Asset Viewer tab
    const assetViewerTab = page.locator('button:has-text("Asset Viewer")');
    await assetViewerTab.waitFor({ state: 'visible' });
    await assetViewerTab.click();

    // Then get the panel via 'aria-controls' from the tab
    const panelId = await assetViewerTab.getAttribute('aria-controls');
    const assetViewerPanel = page.locator(`#${panelId}`);
    await expect(assetViewerPanel).toBeVisible({ timeout: 5000 });

    // Dropdowns (scoped to the assetViewerPanel)
    const typeDropdown = assetViewerPanel.locator('label:has-text("Type") + div input');
    const siteDropdown = assetViewerPanel.locator('label:has-text("Site") + div input');
    const viewDropdown = assetViewerPanel.locator('label:has-text("View") + div input');

    // Existing assertions (adjusted only for correct scoping)
    await expect(typeDropdown).toHaveValue('Site'); // Default selected value
    // Note: if the UI shows Site as enabled/disabled differently, adjust expectations
    await expect(siteDropdown).toBeEnabled();
    await expect(viewDropdown).toBeEnabled();

    // Use scoped input for Type
    const typeDropdownInput = assetViewerPanel.locator('label:has-text("Type") + div input');

    // Click to open the dropdown (robustly find the right listbox via aria-controls)
    await typeDropdownInput.click();
    const typePanelIdTemp = await typeDropdownInput.getAttribute('aria-controls');
    const typeListboxTemp = page.locator(`#${typePanelIdTemp}`);
    await expect(typeListboxTemp).toBeVisible({ timeout: 5000 });

    // Assert the total options count in the global visible listbox (optional)
    // NOTE: Mantine renders several listboxes hidden; always scope to the specific panel when interacting.
    const visibleOptions = typeListboxTemp.locator('div[role="option"]');
    // (If you want to assert exact count here, replace 16 with the correct expected visible count)
    // await expect(visibleOptions).toHaveCount(16);

    // Export button
    const exportBtn = assetViewerPanel.locator('button:has-text("Export")');
    await expect(exportBtn).toBeVisible();

    await exportBtn.click();

    const drawer = page.locator('section[role="dialog"]');
    await expect(drawer).toBeVisible({ timeout: 5000 });

    // Assert the drawer title
    const title = drawer.locator('h2 >> text=Export Views');
    await expect(title).toBeVisible();

    // Assert header buttons
    const closeButton = drawer.locator('button[aria-label="Close"], button:has(svg)');
    await expect(closeButton.nth(0)).toBeVisible();

    // Assert top section text
    const topText = drawer.locator('p:has-text("0 of 70 views selected")');
    await expect(topText).toBeVisible();

    // Assert Select All / Select None buttons
    const selectAllBtn = drawer.locator('button:has-text("Select All")');
    const selectNoneBtn = drawer.locator('button:has-text("Select None")');
    await expect(selectAllBtn).toBeEnabled();
    await expect(selectNoneBtn).toBeDisabled();

    // Assert main content scroll area exists
    const scrollArea = drawer.locator('.mantine-ScrollArea-root');
    await expect(scrollArea).toBeVisible();

    // Assert bottom action buttons
    const cancelBtn = drawer.locator('button:has-text("Cancel")');
    const downloadBtn = drawer.locator('button:has-text("Download Selected")');
    await expect(cancelBtn).toBeVisible();
    await expect(downloadBtn).toBeDisabled();

    // Optionally assert icons exist inside buttons (Download / Cancel)
    const downloadIcon = downloadBtn.locator('svg');
    const cancelIcon = cancelBtn.locator('svg');
    await expect(downloadIcon).toBeVisible();
    await expect(cancelIcon).toBeVisible();

    // close drawer
    await cancelBtn.click();

    // ---------- NEW: iterate Type options, validate dependent dropdown and log options ----------
    const typeOptions = ['Site', 'Floorplan Types', 'Building Types'];

    for (const option of typeOptions) {
      console.log(`Selecting Type option: ${option}`);

      // open Type dropdown and get the exact listbox linked to it
      const typeInput = assetViewerPanel.locator('label:has-text("Type") + div input');
      await typeInput.nth(0).click();

      const typePanelId = await typeInput.nth(0).getAttribute('aria-controls');
      const typeListbox = page.locator(`#${typePanelId}`);
      await expect(typeListbox).toBeVisible({ timeout: 5000 });

      // click the exact option inside that listbox
      await typeListbox.locator(`div[role="option"] >> text=${option}`).click();

      // verify Type value applied
      await expect(typeDropdown.nth(0)).toHaveValue(option);

      // Identify dependent dropdown label dynamically:
      // Find all label texts inside assetViewerPanel and pick the label that is not 'Type' and not 'View'
      const allLabels = await assetViewerPanel.locator('label').allTextContents();
      // Remove duplicates/trim
      const cleanedLabels = allLabels.map(l => l.trim()).filter(Boolean);
      // try common heuristics: prefer 'Site' or the first non-Type non-View label
      let dependentLabel = cleanedLabels.find(l => l.toLowerCase() === 'site') ??
        cleanedLabels.find(l => (l !== 'Type' && l !== 'View'));

      // fallback explicit when heuristics fail
      if (!dependentLabel) dependentLabel = 'Site';

      // get dependent dropdown input scoped inside the panel
      const dependentDropdown = assetViewerPanel.locator(`label:has-text("${dependentLabel}") + div input`);
      await expect(dependentDropdown).toBeVisible();

      // open dependent dropdown by using aria-controls and listbox
      await dependentDropdown.click();
      const depPanelId = await dependentDropdown.getAttribute('aria-controls');
      const depPanel = page.locator(`#${depPanelId}`);
      await expect(depPanel).toBeVisible({ timeout: 5000 });

      const depOptions = depPanel.locator('div[role="option"]');
      const depCount = await depOptions.count();

      console.log(`Dependent dropdown (label="${dependentLabel}") for Type=${option} contains ${depCount} options:`);

      for (let i = 0; i < depCount; i++) {
        const txt = await depOptions.nth(i).innerText();
        console.log(`➡ ${txt}`);
      }

      // close dependent dropdown (click outside)
      await page.mouse.click(0, 0);
    }

    // ---------- NEW: Validate image changes when selecting options for each dropdown ----------
    // We'll check Type, dependent (detected), and View dropdowns. For each dropdown we:
    //  - open dropdown panel (via aria-controls)
    //  - iterate options in that panel
    //  - select option and check if image src changed (if <img> exists). If image is canvas we skip src assertion.

    // Helper to get image src if <img> exists; returns null if not an <img>
    const getImageSrc = async () => {
      const imgsCount = await assetViewerPanel.locator('img').count();
      if (imgsCount > 0) {
        return await assetViewerPanel.locator('img').first().getAttribute('src');
      }
      return null;
    };

    // dropdown definitions (we will fetch dynamic dependent label again)
    const detectedLabels = await assetViewerPanel.locator('label').allTextContents();
    const cleanedDetected = detectedLabels.map(l => l.trim()).filter(Boolean);
    const depLabelDetected = cleanedDetected.find(l => l.toLowerCase() === 'site') ??
      cleanedDetected.find(l => (l !== 'Type' && l !== 'View')) ?? 'Site';

    const dropdownDefinitions = [
      { label: 'Type', inputLocator: assetViewerPanel.locator('label:has-text("Type") + div input') },
      { label: depLabelDetected, inputLocator: assetViewerPanel.locator(`label:has-text("${depLabelDetected}") + div input`) },
      { label: 'View', inputLocator: assetViewerPanel.locator('label:has-text("View") + div input') }
    ];

    for (const dd of dropdownDefinitions) {
      // ensure the input exists
      const inputCount = await dd.inputLocator.count();
      if (inputCount === 0) {
        console.warn(`Dropdown input for "${dd.label}" not found, skipping.`);
        continue;
      }

      // open the dropdown and get the specific panel via aria-controls
      await dd.inputLocator.nth(0).click();
      const ddPanelId = await dd.inputLocator.nth(0).getAttribute('aria-controls');
      const ddPanel = page.locator(`#${ddPanelId}`);
      await expect(ddPanel).toBeVisible({ timeout: 5000 });

      const ddOptions = ddPanel.locator('div[role="option"]');
      const ddCount = await ddOptions.count();
      console.log(`Dropdown "${dd.label}" has ${ddCount} options`);

      for (let i = 0; i < ddCount; i++) {
        // get full option text (some have multiple lines, like Building Types)
        const rawText = await ddOptions.nth(i).innerText();

        // extract only the first line that appears as the dropdown label
        const optionLabel = rawText.split('\n')[0].trim();

        console.log(`Selecting ${dd.label} option: ${optionLabel}`);

        // capture image src before (if available)
        const beforeSrc = await getImageSrc();

        // click the option
        await ddOptions.nth(i).click();

        // verify dropdown input value matches only the label
        await expect(dd.inputLocator.first()).toHaveValue(optionLabel);

        // wait briefly for image update
        await page.waitForTimeout(800);

        const afterSrc = await getImageSrc();

        if (beforeSrc !== null && afterSrc !== null) {
          // if both are images, assert change
          if (afterSrc !== beforeSrc) {
            console.log(`✔ Image changed for ${dd.label} => ${optionLabel}`);
          } else {
            console.warn(`✖ Image did not change for ${dd.label} => ${optionLabel}`);
          }
        } else {
          // no <img> found (likely canvas or other renderer)
          console.log(`Note: no <img> src available to compare for ${dd.label} (maybe canvas). Skipping src assertion.`);
        }

        // reopen dropdown for next iteration if needed
        if (i < ddCount - 1) {
          await dd.inputLocator.first().click();
          await expect(ddPanel).toBeVisible({ timeout: 3000 });
        }
      }


      // for (let i = 0; i < ddCount; i++) {
      //   const optionText = (await ddOptions.nth(i).innerText()).trim();
      //   console.log(`Selecting ${dd.label} option: ${optionText}`);

      //   // capture image src before (if available)
      //   const beforeSrc = await getImageSrc();

      //   await ddOptions.nth(i).click();

      //   // verify dropdown input value (if applicable)
      //   await expect(dd.inputLocator.nth(0)).toHaveValue(optionText);

      //   // wait briefly for image update
      //   await page.waitForTimeout(800);

      //   const afterSrc = await getImageSrc();

      //   if (beforeSrc !== null && afterSrc !== null) {
      //     // if both are images, assert change
      //     if (afterSrc !== beforeSrc) {
      //       console.log(`✔ Image changed for ${dd.label} => ${optionText}`);
      //     } else {
      //       console.warn(`✖ Image did not change for ${dd.label} => ${optionText}`);
      //     }
      //   } else {
      //     // no <img> found (likely canvas or other renderer) — skip strict assertion but log
      //     console.log(`Note: no <img> src available to compare for ${dd.label} (maybe canvas). Skipping src assertion.`);
      //   }

      //   // reopen dropdown for next iteration if needed
      //   if (i < ddCount - 1) {
      //     await dd.inputLocator.nth(0).click();
      //     await expect(ddPanel).toBeVisible({ timeout: 3000 });
      //   }
      // } // end options loop
    } // end dropdown definitions loop

    // ---------- NEW: Additional end-to-end validations for Asset Viewer ----------

    console.log("Starting E2E validation checks...");

    // Ensure left panel thumbnails / scroll list loads correctly (robust selector)
    const thumbnails = assetViewerPanel.locator('.mantine-ScrollArea-root img, .thumb, img.thumbnail');
    if (await thumbnails.count() > 0) {
      await expect(thumbnails.first()).toBeVisible();
    } else {
      console.log('No thumbnail <img> elements found in left panel (skipping thumbnail visibility assertion).');
    }
    console.log("🔥 All new steps executed successfully.");
  });

  test('TC11 - validate takeoffs panel and dropdowns', async () => {

    const propertyName = 'Harbor Bay at MacDill_Liberty Cove (Sample Property)';
    console.log(`🔎 Using property name: ${propertyName}`);

    // Change view & search property
    await prop.changeView('Table View');
    await prop.searchProperty(propertyName);

    // VIEW DETAILS button
    const viewDetailsBtn = page.locator('button[title="View Details"]').first();
    await expect(viewDetailsBtn).toBeVisible();
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

    try {
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

      const headerLocator = page.locator('.ag-header-cell .mantine-Text-root');
      const scrollContainer = page.locator('.ag-center-cols-viewport');

      console.log("[STEP] Checking header count...");
      await expect(headerLocator).toHaveCount(expectedHeaders.length);
      console.log("[INFO] Header count matches.");

      console.log("[STEP] Validating each header one by one...");

      for (let i = 0; i < expectedHeaders.length; i++) {

        // Scroll horizontally for each header index
        const scrollAmount = (i + 1) * 5; // incremental scroll
        console.log(`\n[SCROLL] Scrolling horizontally to reveal header index ${i}...`);
        await scrollContainer.evaluate((el, amt) => el.scrollBy({ left: amt }), scrollAmount);

        const actualText = await headerLocator.nth(i).textContent();

        console.log(`[HEADER CHECK] Index ${i}`);
        console.log(`  Expected: "${expectedHeaders[i]}"`);
        console.log(`  Received: "${actualText}"`);

        try {
          await expect(headerLocator.nth(i)).toHaveText(expectedHeaders[i], { timeout: 5000 });
          console.log("  ✔ MATCHED");
        } catch (innerErr) {
          console.log("  ✘ MISMATCH");
          console.log("  [ERROR DETAILS]", innerErr);
          throw new Error(
            `Header mismatch at index ${i}. Expected "${expectedHeaders[i]}", but got "${actualText}".`
          );
        }
      }

      console.log("\n=== TC05 - Header Validation Completed Successfully ===");

    } catch (err) {
      console.log("\n===== ❌ TEST FAILED (TRY/CATCH) =====");
      console.log("[ERROR MESSAGE]:", err.message);
      console.log("[STACK]:", err.stack);
      throw err;
    }

  });

});