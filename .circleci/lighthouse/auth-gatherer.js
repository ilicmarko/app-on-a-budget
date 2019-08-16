const Gatherer = require('/usr/local/lib/node_modules/lighthouse').Gatherer;
const puppeteer = require('puppeteer');

class Auth extends Gatherer {
    async beforePass(options) {

        const ws = await options.driver.wsEndpoint();

        const browser = await puppeteer.connect({
            browserWSEndpoint: ws,
        });
        console.log(ws);

        const page = await browser.newPage();
        await page.goto(process.env.TEST_URL);

        console.log(process.env.ADMIN_USER);
        console.log(process.env.ADMIN_PASSWORD);

        await page.click('input[name=username]');
        await page.keyboard.type(process.env.ADMIN_USER);

        await page.click('input[name=password]');
        await page.keyboard.type(process.env.ADMIN_PASSWORD);

        console.log('click');
        console.log(await page.content());
        await page.click('button[type="submit"]');
        console.log('waiting');
        console.log(await page.content());
        await page.waitForSelector('#logout');
        console.log('done');

        browser.disconnect();
        return {};
    }
}

module.exports = Auth;
