#!/usr/bin/env node

import { Command } from 'commander';

import { spinnerError, stopSpinner } from './spinner';
import { widgets } from './widgets';

const program = new Command();
program.option('-v, --verbose', 'verbose logging');
program.description('Fling - a not-so serious Farcaster client');
program.version('0.0.1');
program.addCommand(widgets);

process.on('unhandledRejection', function (err: Error) {
  const debug = program.opts().verbose;
  if (debug) {
    console.error(err.stack);
  }
  spinnerError();
  stopSpinner();
  program.error('', { exitCode: 1 });
});

async function main() {
  await program.parseAsync();
}

console.log();
main();
