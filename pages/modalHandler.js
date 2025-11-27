class ModalHandler {
  constructor(page) {
    this.page = page;
  }

  /**
   * Generic reusable method for Add Data modal
   */
  async addData({ nameInputLocator, descInputLocator, typeButtonsLocator, submitButtonLocator, name, description }) {
    // Fill inputs
    await nameInputLocator.fill(name);
    await descInputLocator.fill(description);

    // Random type selection
    const typeButtons = await typeButtonsLocator.elementHandles();
    const randomIndex = Math.floor(Math.random() * typeButtons.length);
    await typeButtons[randomIndex].click();

    // Submit
    await submitButtonLocator.waitFor({ state: 'visible' });
    await submitButtonLocator.click();

    await this.page.waitForTimeout(3000);
  }
}

module.exports = ModalHandler;
