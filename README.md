# metrx

This tool measures any web application performances. This project uses [Puppeteer](https://github.com/GoogleChrome/puppeteer) to make painless automation.

You can read this [great article](https://michaljanaszek.com/blog/test-website-performance-with-puppeteer) written by `Michał Janaszek` for further informations.

<p align="center">
    <br>
        <img width=480 src="https://github.com/lumapps/metrx/blob/master/metrx-example.gif?raw=true" alt="metrx example" />
    <br>
</p>

## Installation

To install metrx :

```bash
npm install -g metrx
```

## Usage

To run the application, juste use :

```bash
metrx <url>
```

Several options are available to enhance metrics at ease. Use `-h (--help)` to display them.

```console
➜ metrx -h

  Usage: metrx [options] <url ...>

  Measures web application loading metrics

  Options:

    -r, --repeat [n]                     The number of times the page metrics are measured (default: 5)
    -w, --width [width]                  The viewport's width to set (default: 1920)
    -H, --height [height]                The viewport's height to set (default: 1080)
    -c, --custom-path [custom-path]      Path to custom path configuration file
    -o, --output-format [output-format]  The desired output format (default: table)
    --output-file [output-file]          Whether we want to export data in a file, and the desired path to the file
    --wait-until [wait-until]            The waitUntil value of the Page.reload options accepted by puppeteer
    --no-headless                        Defines if we dont want to use puppeteer headless mode
    -h, --help                           output usage information
```

### Custom user path

A custom file path can be set in the cli options. That way, you can tell puppeteer what he should do before measuring any kind of metric.

This option can be usefull if you need to be logged in before beeing able to access to your application.

To include your file into the proccess, juste use `-c <relative path to your file>` option.

```bash
metrx localhost:8000 -c '../../custom-path.js'
```

The `custom-path.js` file shoud contain an exported ES module.

```javascript
// index.js: The custom path function is called like so :
if (customPath) {
    const customPathFunction = require(customPath);
    await customPathFunction(page, logInfo);
}

// custom-path.js: example of login process
const LOGIN_INPUT = 'input[type="login"]';
const PASSWORD_INPUT = 'input[type="password"]';

module.exports = async (page, logInfo) => {
    const login = 'my-secret-login';
    const password = 'my-really-secret-password';
    const loginUrl = 'http://localhost:8080/login';

    logInfo(`Loading ${loginUrl}`);

    // Go to the login page url, and wait for the selector to be ready.
    await page.goto(loginUrl);
    await page.waitForSelector(LOGIN_INPUT);

    logInfo('Logging in...');

    // Type creditentials.
    await page.type(LOGIN_INPUT, login);
    await page.type(PASSWORD_INPUT, password);

    logInfo('Redirecting');

    // The process will continue once the redirect is resolved.
    return page.waitForNavigation();
};
```

Those functions have accessed to two arguments :

-   `page` (The `Page` puppeteer object to be able to access to the full [puppeteer page instance API](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#class-page))
-   `logInfo` (To log custom informations)

### Export data in a file

You can choose to export in multiple formats and export formated data in a file. For now, only `table`, `raw`, `json` and `csv` are available.
`table` and `raw` data will be exported in a `txt` file. To use it, just type.

```bash
metrx localhost:8000 --output-format json --output-file ~/results.json
```

If you don't provide any filename, a file will automatically be created in your current directory.

### "Wait until" option

To make a page reload, `metrx` does a `Page.reload()` from puppeteers `Page` object. This object accepts accepts a `waitUntil` parameter, which defines when the page navigation has succeded, and when the application should collect the metrics and reload the page. You can find more informations about `Page.reload()` [right here](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagereloadoptions).

To use, just add `--wait-until` flag and the desired options. Since `Page.reload` accepts and `Array` of `Strings`, if you want to add multiple options, just split them with a `,`

For example:

```bash
metrx localhost:8000 --wait-until networkidle0,load
```

## Usefull Ressources

-   [Commander documentation](https://github.com/tj/commander.js)
-   [Puppeteer API](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md)
