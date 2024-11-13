import {expect, Page} from "@playwright/test";

export class TermsAndConditionsPage {
    private page: Page;
    constructor(page: Page) {
        this.page = page;
    }

    async accept() {
        await this.page.locator('label[for="acceptance"]').click();
        await expect(this.page.locator('#acceptance')).toBeChecked();
    }

    async save() {
        await this.page.locator('form').locator('button[type="submit"]', { hasText: 'Tallenna' }).click();
    }
}