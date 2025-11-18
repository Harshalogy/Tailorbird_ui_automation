// leftPanelHelper.js
const locators = require('../locators/leftPanelLocator');
const { Logger } = require('../utils/logger');
const { expect } = require('@playwright/test');

module.exports = {

    // getLeftPanelLabels: async function(page) {
    //     const items = page.locator(locators.leftPanelLabels);
    //     const count = await items.count();
    //     Logger.info(`Total labels found: ${count}`);

    //     const labels = [];
    //     for (let i = 0; i < count; i++) {
    //         const text = (await items.nth(i).innerText()).trim();
    //         if (text) labels.push(text);
    //         Logger.info(`Fetched label ${i + 1}: "${text}"`);
    //     }
    //     return labels;
    // },

    getLeftPanelLabels: async function(page) {
    // Expand the left panel if collapsed
    const toggleBtn = page.locator('nav a.mantine-NavLink-root').first();
    const expanded = await toggleBtn.getAttribute('aria-expanded');
    // if (expanded !== 'true') {
    //     await toggleBtn.click();
    //     await page.waitForTimeout(300); // wait for animation
    // }

    const items = page.locator(locators.leftPanelLabels);
    const count = await items.count();
    Logger.info(`Total labels found (including hidden): ${count}`);

    const labels = [];
    for (let i = 0; i < count; i++) {
        const text = (await items.nth(i).innerText()).trim();
        if (text) labels.push(text);
        Logger.info(`Fetched label ${i + 1}: "${text}"`);
    }

    if (labels.length === 0) {
        Logger.info('No left panel labels were fetched even after expanding the panel.');
    }

    return labels;
},



    getSectionLocators: async function (page, label) {
        const parent = page.locator(locators.leftPanelItem(label));
        const collapse = parent.locator(locators.collapseContainer);
        return { parent, collapse };
    },

    listVisibleSuboptions: async function (collapseLocator) {
        const anchors = collapseLocator.locator(locators.subOptions);
        const n = await anchors.count();
        const visibleNames = [];
        for (let i = 0; i < n; i++) {
            const el = anchors.nth(i);
            if (await el.isVisible()) {
                const text = (await el.innerText()).trim();
                if (text) visibleNames.push(text);
            }
        }
        return visibleNames;
    },

    runTwoClickTest: async function (page, label) {
        const { parent, collapse } = await this.getSectionLocators(page, label);
        await parent.waitFor({ state: 'visible' });

        const beforeList = await this.listVisibleSuboptions(collapse);
        Logger.info(`[Before] ${label} visible: ${beforeList}`);

        await parent.click();
        await page.waitForTimeout(200);
        const afterCollapse = await this.listVisibleSuboptions(collapse);
        Logger.info(`[After Collapse] ${label} visible: ${afterCollapse}`);
        expect(afterCollapse.length).toBe(0);

        await parent.click();
        await page.waitForTimeout(200);
        const afterExpand = await this.listVisibleSuboptions(collapse);
        Logger.info(`[After Expand] ${label} visible: ${afterExpand}`);
        expect(afterExpand.length).toBeGreaterThan(0);
    }

};
