const fs = require('fs');
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

/**
 * Writes all the extracted data in a file asynchronously.
 *
 * @param {Array|string} data            The previously formated data.
 * @param {string}       [fileExtension] The file extension the file should get.
 * @param {string}       [fileName]      The desired file name.
 */
const exportDataInFile = (data, fileExtension = 'txt', fileName) => {
    fileName = fileName || `${+new Date()}.${fileExtension}`;

    // Make sure we get the good file extension.
    if (fileName.slice(-fileExtension.length) !== fileExtension) {
        fileName += `.${fileExtension}`;
    }

    fs.writeFile(fileName, data, error => {
        if (error) {
            throw error;
        }
    });
};

module.exports = (data, format, outputFile, fileName) => {
    let formatedData;
    let fileExtension;

    switch (format) {
        case 'table':
            formatedData = buildTable(data);
            break;

        case 'json':
            formatedData = toJson(data);
            fileExtension = 'json';
            break;

        case 'csv':
            formatedData = toCsv(data);
            fileExtension = 'csv';
            break;

        default:
            formatedData = data;
            break;
    }

    if (outputFile) {
        exportDataInFile(formatedData, fileExtension, fileName);
    }

    return formatedData;
};
