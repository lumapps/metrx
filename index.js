const puppeteer = require('puppeteer');
const ora = require('ora');

const runMetricsExtracter = require('./js/runner');
const { URL_REGEX } = require('./js/constants');

async function start({ url, headless, height, width, repeat, takeScreenshot, customPath }) {
    if (url === 'undefined' || !URL_REGEX.test(url)) {
        throw 'Invalid URL';
    }

    const spinner = ora('Launching Browser').start();

    const logStep = (step, repeat) => {
        spinner.text = `Extracting metrics ${step}/${repeat}`;
    };

    const logInfo = log => {
        spinner.text = log;
    };

    const browser = await puppeteer.launch({
        headless,
    });

    const page = await browser.newPage();

    // Set the viewport.
    await page.setViewport({
        width: parseInt(width, 10),
        height: parseInt(height, 10),
    });

    try {
        let client;

        if (customPath) {
            const customPathFunction = require(customPath);
            await customPathFunction(page, logInfo);
        }

        // If we want tu use a custom url, reach it before making metrics.
        logInfo(`Testing ${url}...`);

        await page.goto(url);

        if (!client) {
            client = await page.target().createCDPSession();
            await client.send('Performance.enable');
        }

        const aggregatedData = await runMetricsExtracter(page, client, repeat, takeScreenshot, logStep);

        spinner.stop();

        await browser.close();

        return aggregatedData;
    } catch (exception) {
        console.error(exception);

        if (takeScreenshot) {
            await page.screenshot({
                path: `./screenshots/error_${+new Date()}.png`,
            });
        }

        await browser.close();
    }
}

module.exports = params => start(params);
