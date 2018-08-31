const { BYTES_BASED_VALUES } = require('./constants');

/**
 * Convert raw ms values to readable values.
 *
 * @param   {number} ms The number of milliseconds.
 * @returns {string} The redable value.
 */
const addMsSuffix = ms => `${Math.floor(ms)} ms`;

/**
 * Returns an array containing statistics made with extracted metrics.
 * Returns the min value, the max value, the average, the median and the standard deviation.
 *
 * @param  {Array}  data The data we'll build the stats on.
 * @return {Array}  The aggregated data.
 */
const buildStats = data => {
    const aggregatedData = [];

    // Then, make statistics over those metrics.
    for (const key in data) {
        const datas = data[key];

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

/**
 * Convert bytes into readable value.
 * See : https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript/18650828
 *
 * @param   {number} bytes The number of bytes to convert.
 * @returns {string} The redable value.
 */
const bytesToSize = bytes => {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Byte';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return `${parseFloat(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

/**
 * Return the median value for an array of raw values.
 *
 * @param  {Array}  values The array of values.
 * @return {number} The median value.
 */
const getMedian = values => {
    values.sort((a, b) => a - b);
    const pivot = Math.floor(values.length / 2);

    return values.length % 2 ? values[pivot] : (values[pivot - 1] + values[pivot]) / 2;
};

/**
 * Calculate the average value for an array of raw values.
 *
 * @param  {Array}  values The array of values.
 * @return {number} The average value.
 */
const getAverage = values => values.reduce((a, b) => a + b, 0) / values.length;

/**
 * Makes the diff between a time and the navigation start to get a useable time un ms.
 *
 * @param  {integer} time            The time we want the metric from
 * @param  {integer} navigationStart The navigation time.
 * @return {integer} The difference between time variable and navigation time.
 */
const getRelevantTime = (time, navigationStart) => (time - navigationStart) * 1000;

/**
 * Calculate standard deviation for an array of raw values.
 *
 * @param  {Array}  values The array of values to get the standard deviation from.
 * @return {number} The stantdard deviation.
 */
const getStandardDeviation = values => {
    const avg = getAverage(values);
    const squareDiffs = values.map(value => Math.pow(value - avg, 2));

    return Math.sqrt(getAverage(squareDiffs));
};

/**
 * Populates a data object. An array of values will be associated to each key.
 *
 * @param {Object} objectToPopulate The object containing all the data as key => Array<value>
 * @param {Object} dataObject       The object contanin the key => value pair.
 */
const populateDataObject = (objectToPopulate, dataObject) => {
    objectToPopulate = objectToPopulate || {};

    for (const key in dataObject) {
        const value = dataObject[key];

        if (objectToPopulate[key]) {
            objectToPopulate[key].push(value);
        } else {
            objectToPopulate[key] = [value];
        }
    }
};

/**
 * Transforms a snake-case string to camelCase.
 *
 * @param {string} value The string to transform.
 */
const toCamelCase = value => {
    return value.replace(/(\-[a-z])/g, function($1) {
        return $1.toUpperCase().replace('-', '');
    });
};

/**
 * Humanize values.
 *
 * @param  {string} key   The metric's name to display
 * @param  {value}  value The metric's value.
 * @return {string} The ready to display value.
 */
const toReadableValue = (key, value) => (BYTES_BASED_VALUES.includes(key) ? bytesToSize(value) : addMsSuffix(value));

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

module.exports = {
    bytesToSize,
    buildStats,
    getRelevantTime,
    populateDataObject,
    toCamelCase,
    toReadableValue,
    translateMetrics,
};
