import {expect, Page} from '@playwright/test';
import {LoginPage} from "./LoginPage";

export class MainPage {
    constructor(private readonly page: Page) {
        this.page = page;
    }

    async goto() {
        await this.page.goto('/');
    }

    async expectToHaveTitle(title: string) {
        await expect(this.page).toHaveTitle(title);
    }


    async searchForMaterial(searchTerm: string) {
        const searchBar = this.page.locator('input[type="search"]');
        await expect(searchBar).toBeVisible();

        await searchBar.fill(searchTerm);
        await searchBar.press('Enter');
    }

    async expectToHaveSearchResults() {
        const searchResultsHeader = this.page.locator('h1', {hasText: 'Hakutulokset'});
        await expect(searchResultsHeader).toBeVisible();
    }

    async searchByEducationalLevels(searchTerm: string) {
        await this.searchFromDropDown('ng-select#educationalLevels', searchTerm)

    }

    async expectToHaveSearchThingy(searchTerm: string, amountOfMatches: number) {
        const options = this.page.locator('div[role="option"]', {hasText: searchTerm});
        const count = await options.count()
        expect(count).toBe(amountOfMatches)
    }

    async searchByEducationalSubject(searchTerm: string) {
        await this.searchFromDropDown('ng-select#educationalSubjects', searchTerm)

    }

    async searchFromDropDown(locator: string, searchTerm: string) {
        const dropdownContainer = this.page.locator(locator);
        await dropdownContainer.click();

        const inputField = dropdownContainer.locator('input[type="text"]');
        await inputField.fill(searchTerm);
    }

    async searchByLearningResourceTypes(searchTerm: string) {
        await this.searchFromDropDown('ng-select#learningResourceTypes', searchTerm)
    }

    async login() {
        const loginComponent = this.page.locator('app-nav-login');
        await loginComponent.locator('button').click();

        const loginPage = new LoginPage(this.page)

        await loginPage.login('aoeuser', 'password123')
    }

    async expectUserHasLoggedIn() {
        await expect(this.page.locator('a[href="#/omat-oppimateriaalit"]')).toBeVisible();
    }

    async logout() {
        await this.page.locator('#user-details-dropdown i.fa-user-circle-o').click();
        await this.page.locator('.dropdown-menu .dropdown-item', { hasText: 'Kirjaudu ulos' }).click();
    }

    async expectUserHasLoggedOut() {
        await expect(this.page.locator('a[href="#/omat-oppimateriaalit"]')).toHaveCount(0)
        await expect(this.page.locator('app-logout-view h1', { hasText: 'Olet kirjautunut ulos palvelusta' })).toBeVisible();
    }
}