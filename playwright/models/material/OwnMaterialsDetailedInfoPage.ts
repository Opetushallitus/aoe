import {expect, Page} from "@playwright/test";

export class OwnMaterialsDetailedInfoPage {
    constructor(private readonly page: Page) {
        this.page = page;
    }

    async setDetailedInfo() {
        //TODO: add values
        await this.page.locator('form').locator('button[type="submit"]', { hasText: 'Seuraava' }).click();

        await this.page.waitForURL(/.*#\/lisaa-oppimateriaali\/5$/);
        await expect(this.page).toHaveURL(/.*#\/lisaa-oppimateriaali\/5$/);
    }

}