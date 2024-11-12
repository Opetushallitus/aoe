import {test} from '@playwright/test';
import {Mainpage} from "../models/mainpage";

test.describe('AOE.fi Homepage Tests', () => {

    test.beforeEach(async ({page}) => {
        const aoe = new Mainpage(page);
        await aoe.goto()
    })

    test('homepage has the correct title', async ({page}) => {
        const aoe = new Mainpage(page)
        await aoe.expectToHaveTitle('Etusivu - Avointen oppimateriaalien kirjasto (aoe.fi)');
    });

    test('should have a functional search bar', async ({page}) => {
        const aoe = new Mainpage(page)
        await aoe.searchForMaterial("pdf")
        await aoe.expectToHaveSearchResults()
    });

    test("should have education levels dropdown menu", async ({page}) => {
        const aoe = new Mainpage(page)
        await aoe.searchByEducationalLevels('varhaiskasv')
        await aoe.expectToHaveSearchThingy('varhaiskasvatus', 1)
    });

    test("should have educational subjects dropdown menu", async ({page}) => {
        const aoe = new Mainpage(page)
        await aoe.searchByEducationalSubject('suomen')
        await aoe.expectToHaveSearchThingy('Suomen Kieli ja kirjallisuus', 2)
    });

    test("should have learning resource types dropdown menu", async ({page}) => {
        const aoe = new Mainpage(page)
        await aoe.searchByLearningResourceTypes('dataset')
        await aoe.expectToHaveSearchThingy('datasetti', 1)
    })

});