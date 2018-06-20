const { extractMetrics, extractTimings, aggregateData } = require('./metrics');

/**
 * Only return the metrics of the page. It combines metrics which can be
 * extracted from `window` object or from Chrome Dev Tools
 *
 * @param  {Object} page                  The puppeteer page object we are working on.
 * @param  {Object} client                The puppeteer client we are working with.
 * @param  {number} loadCompleteTimestamp The time when the reload of the page has been completed.
 * @return {Object} The full metrics object we
 */
const extractAllMetrics = async (page, client, loadCompleteTimestamp) => {
    return {
        ...(await extractMetrics(page, client)),
        ...(await extractTimings(page, loadCompleteTimestamp)),
    };
};

/**
 * Extracts the page metrics as many time as the repeat parameter.
 *
 * @param  {Object}  page           The puppeteer page object we are working on.
 * @param  {Object}  client         The puppeteer client we are working with.
 * @param  {number}  repeat         The number of times we want to extract data.
 * @return {Object}  All collected metrics.
 */
module.exports = async (page, client, repeat, logStep) => {
    let i = 0;
    const data = [];

    while (i < repeat) {
        logStep(i + 1, repeat);

        await page.reload({
            waitUntil: 'load',
        });

        const loadCompleteTimestamp = +new Date();

        data.push(await extractAllMetrics(page, client, loadCompleteTimestamp));

        i++;
    }

    return aggregateData(data);
};
