import {expect, test} from '@playwright/test';
import {MainPage} from "../models/MainPage";
import {OwnMaterialsFilePage} from "../models/material/OwnMaterialsFilePage";
import {OwnMaterialsBasicInfoPage} from "../models/material/OwnMaterialsBasicInfoPage";
import {OwnMaterialsEducationalLevelsPage} from "../models/material/OwnMaterialsEducationalLevelsPage";
import {OwnMaterialsDetailedInfoPage} from "../models/material/OwnMaterialsDetailedInfoPage";
import {OwnMaterialsLicensePage} from "../models/material/OwnMaterialsLicensePage";
import {OwnMaterialsUtilizedMaterialPage} from "../models/material/OwnMaterialsUtilizedMaterialPage";
import {OwnMaterialsSummary} from "../models/material/OwnMaterialsSummary";
import {OwnMaterialsPage} from "../models/material/OwnMaterialsPage";
import {TermsAndConditionsPage} from "../models/TermsAndConditionsPage";

test.describe("should be possible to create new material", () => {

    test.beforeEach(async ({page}) => {
        const aoe = new MainPage(page);
        await aoe.goto()
        await aoe.login()
        await aoe.expectUserHasLoggedIn()
    })

    test("should be able to create new pdf material", async ({page}) => {
        const aoe = new MainPage(page)
        await aoe.moveToOwnEducationalMaterialsView()

        if (page.url().includes('hyvaksynta')) {
            const termsAndConditions = new TermsAndConditionsPage(page)
            await termsAndConditions.accept()
            await termsAndConditions.save()
            await aoe.moveToOwnEducationalMaterialsView()
        }


        const ownMaterials = new OwnMaterialsPage(page)
        await ownMaterials.expectToHaveLinkToCreateNewMaterial()
        await ownMaterials.startCreateNewMaterial()

        const filePage = new OwnMaterialsFilePage(page)

        await filePage.verifyFilesSection()
        await filePage.setMaterialName('playwright_test')
        await filePage.uploadMaterial()

        const basicInfo = new OwnMaterialsBasicInfoPage(page)

        await basicInfo.setBasicInfo()

        const eduLevels = new OwnMaterialsEducationalLevelsPage(page)
        await eduLevels.setEducationalLevels()

        const detailedInfo = new OwnMaterialsDetailedInfoPage(page)
        await detailedInfo.setDetailedInfo()

        const license = new OwnMaterialsLicensePage(page)
        await license.setLicenseInfo()

        const utilizedMaterials = new OwnMaterialsUtilizedMaterialPage(page)

        await utilizedMaterials.setUtilizedMaterials()

        const summary = new OwnMaterialsSummary(page)

        await summary.save()

    })

})