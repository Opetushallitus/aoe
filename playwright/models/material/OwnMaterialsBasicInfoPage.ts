import {expect, Page} from "@playwright/test";

export class OwnMaterialsBasicInfoPage {
    constructor(private readonly page: Page) {
        this.page = page;
    }

    async setBasicInfo() {
        await this.page.locator('button[type="button"]', { hasText: 'Lisää henkilö' }).click();
        await this.page.locator('#author0').fill('Doe, John');

        await this.page.locator('input#affiliate0').click()
        await this.page.waitForSelector('ng-dropdown-panel');
        await this.page.locator('.ng-dropdown-panel .ng-option').first().click();
        await expect(this.page.locator('ng-select#affiliate0 .ng-value-label')).toHaveText(' iheart Finland ry/rf ')

        await this.page.locator('input#keywords').click()
        await this.page.locator('.ng-dropdown-panel .ng-option').first().click();
        await expect(this.page.locator('#keywords .ng-value-label')).toHaveText('2-dieetti');


        await this.searchFromDropDown('ng-select#learningResourceTypes', 'opas')
        await this.page.locator('ng-select#learningResourceTypes').press('Enter')

        await this.page.locator('form').locator('button[type="submit"]', { hasText: 'Seuraava' }).click();

        await this.page.waitForURL(/.*#\/lisaa-oppimateriaali\/3$/);
        await expect(this.page).toHaveURL(/.*#\/lisaa-oppimateriaali\/3$/);

    }

    async searchFromDropDown(locator: string, searchTerm: string) {
        const dropdownContainer = this.page.locator(locator);
        await dropdownContainer.click();

        const inputField = dropdownContainer.locator('input[type="text"]');
        await inputField.fill(searchTerm);
    }


}