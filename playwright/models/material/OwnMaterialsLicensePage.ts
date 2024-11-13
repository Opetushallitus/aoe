import {expect, Page} from "@playwright/test";

export class OwnMaterialsLicensePage {
    constructor(private readonly page: Page) {
        this.page = page;
    }

    async setLicenseInfo() {
        await this.page.locator('label.custom-control-label', { hasText: 'CC BY 4.0' }).click();
        await this.page.locator('form').locator('button[type="submit"]', { hasText: 'Seuraava' }).click();

        await this.page.waitForURL(/.*#\/lisaa-oppimateriaali\/6$/);
        await expect(this.page).toHaveURL(/.*#\/lisaa-oppimateriaali\/6$/);

    }

}