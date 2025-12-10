function projectJobLocators(page) {
    return {
        jobsTab: page.getByText('Jobs', { exact: true }),
        jobsTabPanel: page.getByRole('tabpanel', { name: 'Jobs' }),

        addJobMenu: page.getByRole('tabpanel', { name: 'Jobs' }).getByTestId('bt-add-row-menu'),
        addJobMenuItem: (name) => page.getByRole('menuitem', { name }),
        viewDetailsButton: page.locator('button[title="View Details"]').last(),
        deleteButton: page.locator('button[aria-label="Delete Row"]').first(),
        inviteVendorsToBidButton: page.locator("button:has-text('Invite Vendors To Bid')"),
        manageVendorsToggle: page.locator('p:has-text("Manage Vendors")'),

        titleCell: page.locator(`div[role="gridcell"][col-id="title"]:has-text('—')`).first(),
        inputBox: page.locator('div[role="gridcell"][col-id="title"] input').first(),

        jobType: page.locator('div[col-id="job_type"] span:has-text("Unit Interior")'),
        unitInteriorSpan: page.locator('span:has-text("UNIT INTERIOR")'),
        jobTypeDropdownOption: (typeText) =>
            page.locator(`[data-testid="bird-table-select-dropdown"] p:has-text("${typeText}")`),

        jobSummaryTab: page.locator('.mantine-Tabs-tabLabel:has-text("Job Summary")'),
        descriptionInput: page.locator('input[placeholder="Enter job description"]'),

        selectStartDateBtn: page.getByRole('button', { name: 'Select start date' }),
        selectEndDateBtn: page.getByRole('button', { name: 'Select end date' }),
        dateButtonByAriaLabel: (ariaLabel) => page.locator(`button[aria-label="${ariaLabel}"]`),

        bidsTab: page.locator('.mantine-Tabs-tabLabel:has-text("Bids")'),
        bidsTabPanel: page.getByRole('tabpanel', { name: 'Bids' }),
        addRowMenu: page.getByTestId('bt-add-row-menu'),
        addRowBtn: page.getByTestId('bt-add-row'),
        bidSearchInput: page.getByTestId('bird-table-select-search'),
        firstGridCell: page.locator(`div[role="gridcell"][col-id="scope"]`).first(),
        lastGridCell: page.locator(`div[role="gridcell"][col-id="scope"]`).last(),
        firstRowScopeCell: page.locator('div[row-id]').first().locator('div[col-id="scope"]'),

        inviteVendorsFallback: page.locator("//div[@class='m_8bffd616 mantine-Flex-root __m__-_r_af_']//span[@class='m_8d3afb97 mantine-ActionIcon-icon']"),

        templateMenuButton: page.locator('button:has(svg.lucide-file-text)').nth(2),
        templateMenuDropdown: page.locator('[data-menu-dropdown="true"]'),
        templateMenuFirstOption: page.locator('[data-menu-dropdown="true"]').locator('button >> text=Tailorbird Baseline Bid Book - Detailed'),
        templateMenuSecondOption: page.locator('[data-menu-dropdown="true"]').locator('button >> text=Save as Template'),
        templateMenuGlobeIcon: page.locator('[data-menu-dropdown="true"]').locator('button svg.lucide-globe'),
        templateMenuFirstDivider: page.locator('[data-menu-dropdown="true"]').locator('.mantine-Menu-divider').nth(0),

        applyTemplateDialog: page.locator('[data-modal-content="true"]'),
        applyTemplateTitle: page.locator('[data-modal-content="true"]').locator('h2'),
        applyTemplateMessage: page.locator('[data-modal-content="true"]').locator('p'),
        applyTemplateCancelBtn: page.locator('[data-modal-content="true"]').locator('button:has-text("Cancel")'),
        applyTemplateApplyBtn: page.locator('[data-modal-content="true"]').locator('button:has-text("Apply Template")'),

        saveTemplateDialog: page.locator('[data-modal-content="true"]'),
        saveTemplateHeader: page.locator('[data-modal-content="true"]').locator('h2'),
        saveTemplateNameLabel: page.locator('[data-modal-content="true"]').locator('label:has-text("Template Name")'),
        saveTemplateNameInput: page.locator('[data-modal-content="true"]').locator('input[placeholder="Enter template name"]'),
        saveTemplateDescLabel: page.locator('[data-modal-content="true"]').locator('label:has-text("Description")'),
        saveTemplateDescInput: page.locator('[data-modal-content="true"]').locator('textarea[placeholder*="template description"]'),
        saveTemplateCancelBtn: page.locator('[data-modal-content="true"]').locator('button:has-text("Cancel")'),
        saveTemplateSaveBtn: page.locator('[data-modal-content="true"]').locator('button:has-text("Save Template")'),

        notificationRoot: page.locator('.mantine-Notification-root'),
        notificationRootFirst: page.locator('.mantine-Notification-root').nth(0),

        agCenterColsVisible: page.locator('.ag-center-cols-container:visible'),
        firstAgRow: page.locator('.ag-center-cols-container .ag-row').first(),
        agRowCells: () => page.locator('.ag-center-cols-container .ag-row').first().locator('.ag-cell'),
        agCellEditorInput: page.locator('.ag-cell-edit-input, input.ag-input-field-input, input'),
        agCellEditorTextarea: page.locator('textarea'),
        bidsGridRootWithActions: page.locator('.ag-root:has-text("Actions")').first(),

        bidQuantityCell: page.locator('div[row-index="0"] div[col-id="quantity"]').first(),
        bidUnitCostCell: page.locator('div[row-index="0"] div[col-id="unit_cost"]').first(),

        filterButton: page.getByRole('button').filter({ has: page.locator('svg.lucide-funnel') }),
        exportButton: page.locator('.lucide-download:visible'),
        deleteRowBtn: page.locator('button[aria-label="Delete Row"]').first(),
        deleteConfirmBtn: page.locator(".mantine-Popover-dropdown button:has-text('Delete')")
    };
}

module.exports = { projectJobLocators };
