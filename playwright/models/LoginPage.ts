import {Page} from "@playwright/test";

export class LoginPage {
    constructor(private readonly page: Page) {
        this.page = page;
    }

    async login(username: string, password: string) {
        await this.page.locator('#Input_Username').fill(username);
        await this.page.locator('#Input_Password').fill(password);
        await this.page.locator('button[value="login"]').click();
    }
}