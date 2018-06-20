const { BYTES_BASED_VALUES } = require('./constants');

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
 * Convert raw ms values to readable values.
 *
 * @param   {number} ms The number of milliseconds.
 * @returns {string} The redable value.
 */
const addMsSuffix = ms => `${Math.floor(ms)} ms`;

/**
 *
 * @param  {string} key   The metric's name to display
 * @param  {value}  value The metric's value.
 * @return {string} The ready to display value.
 */
const toReadableValue = (key, value) => (BYTES_BASED_VALUES.includes(key) ? bytesToSize(value) : addMsSuffix(value));

module.exports = {
    bytesToSize,
    getAverage,
    getMedian,
    getStandardDeviation,
    toCamelCase,
    toReadableValue,
};
