module.exports = {

        // View details
    viewDetailsBtn: 'button[title="View Details"]',

    // Location Tab
    locationsTab: 'button:has-text("Locations")',

    // Add Site / Add Data
    addButton: 'button[data-testid="bt-add-row-menu"]:visible',
    addSite: '[data-testid="bt-add-row"]',
    addDataOption: 'role=menuitem[name="Add Data"]',
    addUnitOption: 'role=menuitem[name="Add Unit"]',

    // Grid elements
    newRow: 'role=row[name*="—"] >> nth=0',
    nameCell: '[role="gridcell"][col-id="name"]:visible',
    nameInput: 'input[type="text"]:visible, textarea',
    deleteRowBtn: 'button[title="Delete Row"]:visible',
    deleteConfirmBtn: ".mantine-Popover-dropdown button:has-text('Delete')",

    // Add Column Modal
    modal_AddColumn: 'div.mantine-Paper-root:has-text("Add column")',
    columnNameInput: 'role=textbox[name^="Enter column name"]',
    descriptionInput: 'role=textbox[name^="Enter column description"]',
    addColumnBtn: 'role=button[name="Add column"]',
    

    // SETTINGS Drawer
    tableSettingBtn: 'button:has(svg.lucide-settings):visible',
    settingsDrawer: 'section.mantine-Drawer-content[role="dialog"]',
    drawerTitle: 'h2:has-text("Manage Columns")',
    drawerClose: 'button.mantine-Drawer-close',
    defaultColumnText: 'p:has-text("Default Columns")',
    customColumnsText: 'p:has-text("Custom Columns")',
    deleteColumnIcon: ".mantine-Group-root:has-text('Test Column') .lucide-trash2",

    // Location Dropdown Select
    locationDropdown: 'input[placeholder="Select location type"]',
    locationDropdownOption: (type) => `.mantine-Select-option[value="${type}"]`,

    // Table Headers / Rows
    unitHeader: 'text=Unit Name',
    tableColumnHeader: (header) => `role=columnheader[name="${header}"]`,
    visibleRows: 'div[role="row"]:visible'
};