import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './',
    use: {
        baseURL: process.env.BASE_URL || 'https://demo.aoe.fi',
        locale: 'fi-FI',

    },
    reporter: [
        ['list'],
        [
            'html',
            {
                outputFolder: 'playwright-results/playwright-report/',
                open: 'never'
            }
        ]
    ],
    outputDir: 'playwright-results/test-results/',
    projects: [
        {
            name: 'chromium',
            use: { browserName: 'chromium' },
        },
        {
            name: 'firefox',
            use: { browserName: 'firefox' },
        },
        {
            name: 'webkit',
            use: { browserName: 'webkit' },
        },
    ],
});