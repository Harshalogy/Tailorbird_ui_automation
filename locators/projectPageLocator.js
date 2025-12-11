const projectJobLocators = (page) => ({

    projectsTab: page.locator('span.m_1f6ac4c4.mantine-NavLink-label', { hasText: 'Projects & Jobs' }),
    jobsTab: page.locator('.mantine-Tabs-tabLabel:has-text("Jobs")'),
    bidsTab: page.locator('.mantine-Tabs-tabLabel:has-text("Bids")'),
    contractsTab: page.locator('.mantine-Tabs-tabLabel:has-text("Contracts")'),

    modal: page.locator('section[role="dialog"][data-modal-content="true"]'),
    anyDialog: page.locator('section[role="dialog"]'),
    modalTitleAddProject: page.getByRole('heading', { name: /Add project/i }),

    createProjectButton: page.locator('button:has-text("Create Project")'),
    searchProjectInput: page.locator('input[placeholder="Search..."]'),
    propertyDropdown: page.getByRole('textbox', { name: 'Property' }),
    nameInput: page.getByLabel('Name'),
    descInput: page.getByLabel('Description'),
    startDateInput: page.getByLabel('Start Date'),
    endDateInput: page.getByLabel('End Date'),
    cancelProjectButton: page.getByRole('button', { name: 'Cancel' }),
    addProjectButton: page.getByRole('button', { name: /add project/i }),

    projectCardByName: (name) =>
        page.locator('.mantine-SimpleGrid-root .mantine-Group-root', { hasText: name }),

    dynamicText: (text) =>
        page.locator(`p:has-text("${text}")`),

    gridRowByText: (text) =>
        page.locator(`div[role="row"]:has-text("${text}")`),

    optionByName: (name) =>
        page.getByRole('option', { name }),

    successToaster: page.locator('.mantine-Notification-root'),
    successToasterFirst: page.locator('.mantine-Notification-root').first(),

    projectGridName: page.locator(`.mantine-Grid-inner:has-text("Project Name")`),
    projectGridDescription: page.locator(`.mantine-Grid-inner:has-text("Description")`),

    createJobButton: page.locator('button', { hasText: 'Create Job' }),
    jobModal: page.locator('[data-modal-content="true"]'),
    jobTitleInput: page.getByPlaceholder('Enter title'),
    jobTypeInput: page.getByPlaceholder('Select job type'),
    jobDescriptionInput: page.getByPlaceholder('Enter description'),
    jobCancelBtn: page.locator('button:has-text("Cancel")'),
    jobSubmitBtn: page.getByRole('button', { name: /add job/i }),
    jobTypeOption: (type) =>
        page.getByRole('option', { name: new RegExp(type, 'i') }),

    viewDetailsButton: page.locator('button:has-text("View Details")'),
    editButton: page.getByRole('button', { name: 'Edit' }),
    jobOverviewTitle: page.getByText('Job Overview'),

    bidsTabPanel: page.locator('.mantine-Tabs-panel'),
    addRowBtn: page.getByTestId('bt-add-row'),
    addRowMenuBtn: page.getByTestId('bt-add-row-menu'),
    firstGridCell: page.locator('div[role="gridcell"]').first(),
    lastGridCell: page.locator('div[role="gridcell"]').last(),
    bidSearchInput: page.locator('input[data-testid="bird-table-text-input"]'),

    bidQuantityCell: page.locator('[col-id="quantity"]'),
    bidUnitCostCell: page.locator('[col-id="unit_cost"]'),

    inviteVendorsToBidButton: page.locator("button:has-text('Invite Vendors To Bid')"),
    manageVendorsToggle: page.locator('p:has-text("Manage Vendors")'),

    vendorSearchInput: page.locator('.mantine-Drawer-body input[placeholder="Search..."]'),
    vendorCheckboxByName: (vendor) =>
        page.locator(`.ag-pinned-left-cols-container div[role="row"]:has-text("${vendor}") .ag-checkbox`),
    inviteSelectedVendorsBtn: page.locator('button:has-text("Invite Selected Vendors to Bid")'),

    vendorNameCell: (vendor) =>
        page.locator(`div[col-id="vendor_name"]:has-text("${vendor}")`),

    templateMenuButton: page.locator('button:has(svg.lucide-globe)'),
    templateMenuDropdown: page.locator('.mantine-Menu-dropdown'),
    templateMenuFirstOption: page.locator('.mantine-Menu-itemLabel').nth(0),
    templateMenuSecondOption: page.locator('.mantine-Menu-itemLabel').nth(1),
    templateMenuGlobeIcon: page.locator('svg.lucide-globe'),
    templateMenuFirstDivider: page.locator('.mantine-Menu-divider').first(),

    applyTemplateDialog: page.locator('section[role="dialog"]'),
    applyTemplateTitle: page.locator('section[role="dialog"] h2'),
    applyTemplateMessage: page.locator('section[role="dialog"] p'),
    applyTemplateCancelBtn: page.locator('button:has-text("Cancel")'),
    applyTemplateApplyBtn: page.locator('button:has-text("Apply Template")'),

    saveTemplateDialog: page.locator('section[role="dialog"]'),
    saveTemplateHeader: page.locator('section[role="dialog"] h2'),
    saveTemplateNameLabel: page.locator('label:has-text("Name")'),
    saveTemplateNameInput: page.locator('input[placeholder="Enter name"]'),
    saveTemplateDescLabel: page.locator('label:has-text("Description")'),
    saveTemplateDescInput: page.locator('textarea'),
    saveTemplateCancelBtn: page.locator('button:has-text("Cancel")'),
    saveTemplateSaveBtn: page.locator('button:has-text("Save Template")'),

    notificationRoot: page.locator('.mantine-Notification-root'),
    notificationRootFirst: page.locator('.mantine-Notification-root').first(),

    scopeMixButton: page.locator('button:has(svg.lucide-folder-tree)'),
    scopeModal: page.locator('section[role="dialog"]'),
    scopeSearchInput: page.locator('input.mantine-Input-input'),
    plusIcon: page.locator('button:has(svg.lucide-plus)'),
    repeatIcon: page.locator('button:has(svg.lucide-repeat-2)'),
    scopeGrid: page.locator('.ag-root'),
    scopeClearAllBtn: page.locator('button:has-text("Clear All")'),
    scopeSubmitBtn: page.locator('button:has-text("Submit")'),
    scopeCloseButton: page.locator('button:has(svg[viewBox="0 0 15 15"])'),

    scopeEditorPopup: page.locator('[data-scope-portal-editor="true"]'),
    scopeEditorInput: page.locator('[data-scope-portal-editor="true"] input'),
    scopeEditorCheckBtn: page.locator('[data-scope-portal-editor="true"] button:has(svg.lucide-check)'),
    scopeEditorCancelBtn: page.locator('[data-scope-portal-editor="true"] button:has(svg.lucide-x)'),

    resetTableIcon: page.locator('button[data-variant="subtle"][data-size="md"] svg.lucide-rotate-ccw'),
    resetTableModal: page.locator('section[role="dialog"]'),
    resetTableHeader: page.locator('section[role="dialog"] h2.mantine-Modal-title'),
    resetTableBodyText: page.locator('section[role="dialog"] .mantine-Modal-body p'),
    resetCancelBtn: page.locator('button:has-text("Cancel")'),
    resetConfirmBtn: page.locator('button:has-text("Reset Table")'),

    bidLevelingButton: page.locator('button.mantine-ActionIcon-root:has(svg.lucide-scale)'),
    levelingTotalRow: page.locator('div[role="row"]:has-text("Total")'),
    levelingBidRow: page.locator('div[role="row"]:has-text("Bid with material")'),

    vendorActionsButton: page.locator('button:has(svg.lucide-ellipsis-vertical)').nth(0),
    awardBidMenuItem: page.locator('.mantine-Menu-itemLabel:has-text("Award Bid")'),
    awardDialogCancelBtn: page.locator('section[role="dialog"] button:has-text("Cancel")'),
    awardDialogAwardBtn: page.locator('section[role="dialog"] button:has-text("Award")'),

    awardedStatusCell: page.locator('div[role="row"]:has-text("Awarded") div[col-id="status"] p'),

    finalizeContractBtn: page.locator('button:has-text("Finalize Contract")'),
    finalizeContractConfirmBtn: page.locator('.mantine-Modal-content button:has-text("Finalize Contract")'),

    filterIconBtn: page.locator('.mantine-ActionIcon-icon .lucide.lucide-funnel'),

    exportButton: page.locator('button:has-text("Export")'),

    agCellEditorInput: page.locator('input[data-testid="bird-table-text-input"]'),
    agCellEditorTextarea: page.locator('textarea[data-testid="bird-table-text-input"]'),
    firstAgRow: page.locator('div[role="row"][row-index="0"]'),
    agRowCells: () => page.locator('div[role="row"][row-index="0"] [role="gridcell"]')

});

module.exports = { projectJobLocators };
