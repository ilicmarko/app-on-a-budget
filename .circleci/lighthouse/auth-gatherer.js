const Gatherer = require('/usr/local/lib/node_modules/lighthouse').Gatherer;
const puppeteer = require('puppeteer');

class Auth extends Gatherer {
    async beforePass(options) {

        const ws = await options.driver.wsEndpoint();

        const browser = await puppeteer.connect({
            browserWSEndpoint: ws,
        });

        const page = await browser.newPage();
        await page.goto(process.env.TEST_URL);

        await page.click('input[name=username]');
        await page.keyboard.type(process.env.ADMIN_USER);

        await page.click('input[name=password]');
        await page.keyboard.type(process.env.ADMIN_PASSWORD);

        await page.click('button[type="submit"]');
        await page.waitForSelector('#logout');

        browser.disconnect();
        return {};
    }
}

module.exports = Auth;
