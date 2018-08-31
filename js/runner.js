const PuppeteerHar = require('puppeteer-har');

const { extractPerformanceMetrics, extractRequestsMetrics } = require('./metrics');
const { buildStats } = require('./utils');

/**
 * Extracts the page metrics as many time as the repeat parameter.
 *
 * @param  {Object}  page      The puppeteer page object we are working on.
 * @param  {Object}  client    The puppeteer client we are working with.
 * @param  {number}  repeat    The number of times we want to extract data.
 * @param  {string}  waitUntil The `waitUntil` value to set to the reload.
 *                             See https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagereloadoptions
 *                             for more informations.
 * @return {Object}  All collected metrics.
 */
module.exports = async (page, client, repeat, waitUntil = 'load', logStep) => {
    let i = 0;
    const pageMetrics = {};
    const requestMetrics = {};

    while (i < repeat) {
        logStep(i + 1, repeat);

        const har = new PuppeteerHar(page);
        await har.start({ path: 'temp.har' });

        await page.tracing.start({ path: 'trace.json' });
        await page.reload({
            waitUntil: waitUntil.split(','),
        });

        // page.on('requestfinished', request => {
        //     extractRequestsMetrics(requestMetrics, request);
        // });

        await extractPerformanceMetrics(pageMetrics, page, client);
        await page.waitFor(1000);
        await har.stop();
        await page.tracing.stop();
        i++;
    }

    return buildStats(pageMetrics);
};
