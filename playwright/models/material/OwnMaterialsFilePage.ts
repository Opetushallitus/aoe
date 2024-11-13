import {expect, Page} from "@playwright/test";
import path from "path";

export class OwnMaterialsFilePage {
    constructor(private readonly page: Page) {
        this.page = page;
    }

    async setMaterialName(materialName: string) {
        await this.page.locator('#name').fill(materialName)
    }

    async uploadMaterial() {
        const filePath = path.join(__dirname, '../../test-resources/uploads/test.pdf');

        await this.page.locator('#file0').setInputFiles(filePath);

        await this.page.locator('form').locator('button[type="submit"]', { hasText: 'Seuraava' }).click();

        await this.page.waitForURL(/.*#\/lisaa-oppimateriaali\/2$/);
        await expect(this.page).toHaveURL(/.*#\/lisaa-oppimateriaali\/2$/);
    }


    async verifyFilesSection() {
        await expect(this.page.locator('#name')).toBeVisible();
        await expect(this.page.locator('#file0')).toBeVisible();
        await expect(this.page.locator('#link0')).toBeVisible();
        await expect(this.page.locator('input#language0[type="text"]')).toBeVisible();
        await expect(this.page.locator('#displayName0')).toBeVisible();
        await expect(this.page.locator('#file1')).toBeVisible();
        await expect(this.page.locator('#link1')).toBeVisible();
        await expect(this.page.locator('input#language1[type="text"]')).toBeVisible();
        await expect(this.page.locator('#displayName1')).toBeVisible();
    }

}