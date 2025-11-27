export const propertyLocators = {
    tableViewHeader: '.ag-header-cell .mantine-Text-root',
    tableScrollContainer: '.ag-center-cols-viewport',
    tableViewHeader: '.ag-header-cell .mantine-Text-root',
    tableScrollContainer: '.ag-center-cols-viewport',
    viewDetailsButton: 'button[title="View Details"]',
    tabs: tabName => `role=tab[name="${tabName}"]`,
    overviewFieldLabel: label => `text="${label}"`,
    overviewFieldValue: label => `xpath=//p[text()="${label}"]/./following-sibling::div//p`,
    propertyDocumentsTitle: 'p.mantine-Text-root:has-text("Property Documents")',
    uploadFilesButton: 'role=button[name="Upload Files"]',
    uploadDialog: 'dialog[open]',
    uploadFileInput: 'input[type="file"]',
    uploadListDialog: 'dialog[open] uc-upload-list',
    manageColumnsDrawer: 'section[role="dialog"]',
    tableSettingsButton: 'button:has(svg.lucide-settings)',
    viewDetailsBtn: 'button[title="View Details"]',
    documentsHeader: 'text=Property Documents',
    documentsSubHeader: 'text=Files and images related to this property',
    uploadFilesBtn: 'button:has-text("Upload Files")',
    tableHeaders: 'table thead th',
    tableRows: 'table tbody tr',
    tableRowCells: 'td',
    addDataButton: 'button[data-testid="bt-add-column"]',
    nameInput: 'input[placeholder^="Enter column name"]',
    descInput: 'input[placeholder^="Enter column description"]',
    typeButtons: 'div[style*="grid-template-columns"] button',
    submitAddColumn: 'button:has-text("Add column"):not([disabled])',

    propertiesNavLink: ".mantine-NavLink-root:has-text('Properties')",
    breadcrumbsProperties: ".mantine-Breadcrumbs-root:has-text('Properties')",
    createPropertyButton: "button:has-text('Create Property')",
    addPropertyModalHeader: ".mantine-Modal-header:has-text('Add property')",
    addressSuggestion: address => `.mantine-Autocomplete-option:has-text("${address}")`,
    propertyTypeOption: type => `.mantine-Select-option:has-text("${type}")`,
    propertiesBreadcrumbByName: name => `.mantine-Breadcrumbs-root:has-text('${name}')`,
    propertiesGridCardByName: name => `.mantine-SimpleGrid-root p:has-text('${name}')`,

    layoutListIcon: ".lucide.lucide-layout-list",
    viewMenuItemLabel: view => `.mantine-Menu-itemLabel:has-text('${view}')`,
    gridRootWrapper: ".ag-root-wrapper",
 
    filterPanelTitle: ".mantine-Paper-root p:has-text('Filter')",
    filterCheckbox: value => `input[value="${value}"]`,
    filterBadges: '.ag-center-cols-container .mantine-Badge-label',
    clearAllFiltersLink: '.mantine-Paper-root a:has-text("Clear All Filters")',

    downloadIcon: '.lucide-download',

    searchInput: 'input[placeholder="Search."]',
    firstRowNameCell: '.ag-center-cols-container div[role="row"] div[col-id="name"]',

    propertyNameCell: name => `.ag-center-cols-container p[title="${name}"], span:has-text("${name}")`,
    rowFromCell: "xpath=ancestor::div[@role='row']",
    rowDeleteIcon: rowIndex => `.ag-pinned-right-cols-container div[row-index="${rowIndex}"] .lucide-trash-2`,
    deleteButtonInPopover: '.mantine-Popover-dropdown button:has-text("Delete")',

    viewDetailsBtn: 'button[title="View Details"]',

    // Location Tab
    locationsTab: 'button:has-text("Locations")',

    // Add Site / Add Data
    addButton: 'button[data-testid="bt-add-row-menu"]:visible',
    addSite: '[data-testid="bt-add-row"]',
    addDataOption: 'role=menuitem[name="Add Data"]',

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
