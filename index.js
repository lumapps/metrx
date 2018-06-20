const puppeteer = require('puppeteer');
const ora = require('ora');

const runMetricsExtracter = require('./js/runner');

const {
    DEFAULT_REPEAT_TIMES,
    DEFAULT_VIEWPORT_SIZE,
    DEFAULT_OUTPUT_FORMAT,
    OUTPUT_FORMATS,
    URL_REGEX,
} = require('./js/constants');

const output = require('./js/output');

async function start({
    url,
    repeat = DEFAULT_REPEAT_TIMES,
    headless = true,
    height = DEFAULT_VIEWPORT_SIZE.HEIGHT,
    width = DEFAULT_VIEWPORT_SIZE.WIDTH,
    outputFormat = DEFAULT_OUTPUT_FORMAT.DEFAULT,
    outputFile = false,
    customPath,
}) {
    // TODO: Make function to check options.
    if (url === undefined || !URL_REGEX.test(url)) {
        throw 'Invalid URL';
    }

    if (!OUTPUT_FORMATS.includes(outputFormat)) {
        throw 'Unsupported output format';
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

        const aggregatedData = await runMetricsExtracter(page, client, repeat, logStep);

        spinner.stop();

        await browser.close();

        return output(aggregatedData, outputFormat, outputFile);
    } catch (exception) {
        console.error(exception);

        await browser.close();
    }
}

module.exports = params => start(params);
