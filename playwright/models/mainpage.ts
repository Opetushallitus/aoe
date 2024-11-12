import {test, expect, Page} from '@playwright/test';

export class Mainpage {
    constructor(private readonly page: Page) {
    }

    async goto() {
        await this.page.goto('/')
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
        const options = this.page.locator('div[role="option"]', { hasText: searchTerm });
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
}