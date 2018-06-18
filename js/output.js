const Table = require('cli-table');
const chalk = require('chalk');

const { toReadableValue } = require('./utils');

/**
 * Build a table ready for the console output.
 *
 * @param  {Array}  data The object containing the data we want to display.
 * @return {string} The ready to display table.
 */
const buildTable = data => {
    const head = [''].concat(Object.keys(data[0].metrics)).map(entry => {
        return chalk.blue(entry);
    });

    for (const key in data) {
        if (!data.hasOwnProperty(key)) {
            return;
        }

        const table = new Table({
            head,
        });

        data.forEach(entry => {
            table.push([
                chalk.bold(entry.key),
                toReadableValue(entry.key, entry.metrics.average),
                toReadableValue(entry.key, entry.metrics.min),
                toReadableValue(entry.key, entry.metrics.median),
                toReadableValue(entry.key, entry.metrics.max),
                toReadableValue(entry.key, entry.metrics.standardDeviation),
            ]);
        });

        return table.toString();
    }
};

/**
 * Outputs the aggregated data to a correct JSON object.
 *
 * @param  {Array} data The object containing the data we want to convert to JSON.
 * @return {JSON}  The valid JSON Object.
 */
const toJson = data => {
    const json = {};

    data.forEach(metric => {
        const key = metric.key;
        const metrics = metric.metrics;

        json[key] = metrics;
    });

    return JSON.stringify(json);
};

/**
 * Outputs the aggregated data to a CSV string.
 *
 * @param  {Array}  data The object containing the data we want to convert to CSV.
 * @return {string} The CSV ready string.
 */
const toCsv = data => {
    return data;
};

module.exports = (data, format) => {
    switch (format) {
        case 'table':
            return buildTable(data);

        case 'json':
            return toJson(data);

        case 'csv':
            return toCsv(data);

        default:
            return data;
    }
};
