import {expect, Page} from "@playwright/test";

export class OwnMaterialsEducationalLevelsPage {
    constructor(private readonly page: Page) {
        this.page = page;
    }

    async setEducationalLevels() {
        await this.searchFromDropDown('ng-select#educationalLevels', 'perusopetus')

        await this.page.locator('input#educationalLevels').press('Enter')

        await this.page.locator('form').locator('button[type="submit"]', { hasText: 'Seuraava' }).click();

        await this.page.waitForURL(/.*#\/lisaa-oppimateriaali\/4$/);
        await expect(this.page).toHaveURL(/.*#\/lisaa-oppimateriaali\/4$/);

    }

    async searchFromDropDown(locator: string, searchTerm: string) {
        const dropdownContainer = this.page.locator(locator);
        await dropdownContainer.click();

        const inputField = dropdownContainer.locator('input[type="text"]');
        await inputField.fill(searchTerm);
    }


}