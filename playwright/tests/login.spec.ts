import { test} from '@playwright/test';
import {MainPage} from "../models/MainPage";


test.describe("should be possible to login and logout from aoe", () => {

    test.beforeEach(async ({page}) => {
        const aoe = new MainPage(page);
        await aoe.goto()
    })

    test("should be able to login and logout", async ({page}) => {
        const aoe = new MainPage(page)
        await aoe.login()
        await aoe.expectUserHasLoggedIn()
        await aoe.logout()
        await aoe.expectUserHasLoggedOut()
    })

})