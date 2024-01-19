# rxPoweredUp

[![GitHub license](https://img.shields.io/github/license/nvsukhanov/rxpoweredup)](https://github.com/nvsukhanov/rxpoweredup/blob/main/LICENSE)
[![CI Status](https://github.com/nvsukhanov/rxpoweredup/actions/workflows/ci.yml/badge.svg)](https://github.com/nvsukhanov/rxpoweredup/actions)
[![NPM Version](https://img.shields.io/npm/v/rxpoweredup.svg?style=flat)](https://www.npmjs.com/package/rxpoweredup)

This is a Nx monorepo for rxPoweredUp packages.

## Packages

- [rxPoweredUp](https://github.com/nvsukhanov/rxPoweredUp/tree/main/lib/rxpoweredup) - A Typescript RxJS-based library for controlling LEGO Powered UP hubs & peripherals.
- [toolbox](https://github.com/nvsukhanov/rxPoweredUp/tree/main/apps/toolbox) - A web-based toolbox for probing hub & peripheral capabilities, testing rxPoweredUp library and reverse-engineering LEGO Powered UP protocol. Live demo can be found [here](https://rxpoweredup.pages.dev/).
- [examples](https://github.com/nvsukhanov/rxPoweredUp/tree/main/apps/examples) - Examples of using rxPoweredUp library in Node.js and browser environments.

## Installation

Clone the repository and run the following command in the root folder:

```bash
npm install
```

## Toolbox

To run the toolbox app, execute the following command in the root folder:

```bash
npm run start:toolbox
```

Then open `http://localhost:4200` in the browser.

## Browser examples

Browser examples can be run by opening the corresponding HTML files in the browser. Examples are located in the `apps/examples/browser` folder.

## Node.js examples

To compile Node.js examples, execute

```bash
npm run build:node-examples
```

Compiled examples will be placed in the `dist/node-examples` folder and can be run using `node` command, e.g.:

```bash
node dist/node-examples/motor-speed.mjs
```

## Disclaimer

LEGO® is a trademark of the LEGO Group of companies which does not sponsor, authorize or endorse this application.
