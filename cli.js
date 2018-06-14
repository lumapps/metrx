#!/usr/bin/env node

'use strict';

const program = require('commander');

const start = require('./');
const { buildTable } = require('./js/utils');

const { DEFAULT_REPEAT_TIMES, DEFAULT_VIEWPORT_SIZE } = require('./js/constants');

program
    .description('Measures web application loading metrics')
    .usage('<url> [options] ')
    .arguments('<url>')
    .action(url => {
        program.url = url;
    })
    .option('-r, --repeat [n]', 'The number of times the page metrics are measured', DEFAULT_REPEAT_TIMES)
    .option('-w, --width [width]', "The viewport's width to set", DEFAULT_VIEWPORT_SIZE.WIDTH)
    .option('-H, --height [height]', "The viewport's height to set", DEFAULT_VIEWPORT_SIZE.HEIGHT)
    .option('-c, --custom-path [custom-path]', 'Path to custom path configuration file')
    .option('--no-headless', 'Defines if we dont want to use puppeteer headless mode')
    .parse(process.argv);

if (!program.url) {
    program.help();
    process.exit(1);
} else {
    try {
        start(program).then(data => {
            console.log(buildTable(data));
        });
    } catch (e) {
        console.error(e);
    }
}
