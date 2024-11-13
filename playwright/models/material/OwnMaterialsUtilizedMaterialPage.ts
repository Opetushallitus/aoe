import {expect, Page} from "@playwright/test";

export class OwnMaterialsUtilizedMaterialPage {
    constructor(private readonly page: Page) {
        this.page = page;
    }


    async setUtilizedMaterials() {
        //TODO: add values
        await this.page.locator('form').locator('button[type="submit"]', { hasText: 'Seuraava' }).click();

        await this.page.waitForURL(/.*#\/lisaa-oppimateriaali\/7$/);
        await expect(this.page).toHaveURL(/.*#\/lisaa-oppimateriaali\/7$/);

    }


}