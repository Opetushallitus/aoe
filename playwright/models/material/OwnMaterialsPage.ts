import {expect, Page} from "@playwright/test";

export class OwnMaterialsPage {
    constructor(private readonly page: Page) {
        this.page = page;
    }

    private readonly newMaterialSelector = 'a[href="#/lisaa-oppimateriaali/1"]';

    async expectToHaveLinkToCreateNewMaterial() {
        await expect(this.page.locator(this.newMaterialSelector)).toBeVisible();

    }

    async startCreateNewMaterial() {
        await this.page.locator(this.newMaterialSelector).click()
    }

}