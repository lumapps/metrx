const { getAverage, getMedian, getStandardDeviation, toCamelCase } = require('./utils');

/**
 * Transforms the metrics Object into a more readable object.
 *
 * @param  {Object} metrics The metrics Object we get from Chrome Dev Tools.
 * @return {Object} The correctly translated metrics.
 */
const translateMetrics = ({ metrics }) => {
    return metrics.reduce((obj, item) => {
        return {
            ...obj,
            [item.name]: item.value,
        };
    }, {});
};

/**
 * Makes the diff between a time and the navigation start to get a useable time un ms.
 *
 * @param  {integer} time            The time we want the metric from
 * @param  {integer} navigationStart The navigation time.
 * @return {integer} The difference between time variable and navigation time.
 */
const getRelevantTime = (time, navigationStart) => (time - navigationStart) * 1000;

/**
 * Collect and extract metrics with the puppeteer API.
 * Those metrics are extracted from Chrome Dev Tool.
 *
 * @param  {Object} page   The puppeteer page instance we are working with.
 * @param  {Object} client The puppeteer client instance we are working with.
 * @return {Object} The extracted metrics.
 */
const extractMetrics = async (page, client) => {
    await client.send('Performance.enable');
    let firstMeaningfulPaint = 0;
    let translatedMetrics;

    while (firstMeaningfulPaint === 0) {
        await page.waitFor(100);
        let performanceMetrics = await client.send('Performance.getMetrics');
        translatedMetrics = translateMetrics(performanceMetrics);
        firstMeaningfulPaint = translatedMetrics.FirstMeaningfulPaint;
    }

    const navigationStart = translatedMetrics.NavigationStart;

    const extratedData = {
        JSHeapUsedSize: translatedMetrics.JSHeapUsedSize,
        JSHeapTotalSize: translatedMetrics.JSHeapTotalSize,
        ScriptDuration: translatedMetrics.ScriptDuration * 1000,
        FirstMeaningfulPaint: getRelevantTime(firstMeaningfulPaint, navigationStart),
        DomContentLoaded: getRelevantTime(translatedMetrics.DomContentLoaded, navigationStart),
    };

    return extratedData;
};

/**
 * Extract metrics which are accessible via the `window` object.
 *
 * @param  {Object} page                  The puppeteer page instance we are working with.
 * @param  {number} loadCompleteTimestamp The time when the reload of the page has been completed.
 * @return {Object} The extracted relevant metrics.
 */
const extractTimings = async (page, loadCompleteTimestamp) => {
    // Get timing performance metrics from the `window` object.
    const performanceTimings = JSON.parse(await page.evaluate(() => JSON.stringify(window.performance.timing)));
    const paintTimings = JSON.parse(await page.evaluate(() => JSON.stringify(performance.getEntriesByType('paint'))));

    const navigationStart = performanceTimings.navigationStart;

    const relevantDataKeys = ['domInteractive', 'loadEventEnd', 'responseEnd'];

    const relevantData = {};

    relevantDataKeys.forEach(name => {
        relevantData[name] = performanceTimings[name] - navigationStart;
    });

    paintTimings.forEach(timing => {
        relevantData[toCamelCase(timing.name)] = timing.startTime;
    });

    return {
        firstPaint: relevantData.firstPaint,
        firstContentfulPaint: relevantData.firstContentfulPaint,
        responseEnd: relevantData.responseEnd,
        loadEventEnd: relevantData.loadEventEnd,
    };
};

/**
 * Returns an object containing statistics made  withextracted metrics.
 * Returns the min value, the max value, the average, the median and the standard deviation.
 *
 * @param  {Array}  data The data to aggregate.
 * @return {Object} The aggregated data.
 */
const aggregateData = data => {
    const dataToAggregate = {};

    // First, build an object containing each metric value in an array which has the metric name as key.
    data.forEach(metrics => {
        for (const key in metrics) {
            const metric = metrics[key];

            if (dataToAggregate[key]) {
                dataToAggregate[key].push(metric);
                continue;
            }

            dataToAggregate[key] = [metric];
        }
    });

    const aggregatedData = [];

    // Then, make statistics over those metrics.
    for (const key in dataToAggregate) {
        const datas = dataToAggregate[key];

        aggregatedData.push({
            key,
            metrics: {
                average: getAverage(datas),
                min: Math.min(...datas),
                median: getMedian(datas),
                max: Math.max(...datas),
                standardDeviation: getStandardDeviation(datas),
            },
        });
    }

    return aggregatedData;
};

module.exports = {
    aggregateData,
    extractMetrics,
    extractTimings,
};
