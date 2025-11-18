// locators.js
module.exports = {
    leftPanelLabels: 'nav a.mantine-NavLink-root .mantine-NavLink-label',
    leftPanelItem: (label) => `nav a.mantine-NavLink-root:has-text("${label}")`,
    collapseContainer: 'xpath=following-sibling::div[contains(@class,"mantine-NavLink-collapse")][1]',
    subOptions: 'a.mantine-NavLink-root',
    firstLeftPanelToggle: 'nav a.mantine-NavLink-root',
    profileButton: 'button[aria-label="Profile"]',
    profileMenuOptions: 'div.mantine-Menu-dropdown button[role="menuitem"] div.mantine-Menu-itemLabel'
};
