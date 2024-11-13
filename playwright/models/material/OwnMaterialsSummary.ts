import {expect, Page} from "@playwright/test";

export class OwnMaterialsSummary {
    constructor(private readonly page: Page) {
        this.page = page;
    }

    async save() {
        await this.page.locator('label[for="confirm"]').click();
        await expect(this.page.locator('#confirm')).toBeChecked();

        await this.page.locator('form').locator('button[type="submit"]', { hasText: 'Tallenna' }).click();
        await this.page.waitForURL(/.*#\/materiaali.*/);
    }


}