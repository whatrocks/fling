#!/usr/bin/env node
import { Command } from 'commander';
import { MerkleAPIClient } from '@standard-crypto/farcaster-js';
import { Wallet } from 'ethers';

import {
  spinnerSuccess,
  updateSpinnerText,
  spinnerError,
  stopSpinner,
} from './spinner';

// Farcaster setup
const mnemonic = process.env.MNEMONIC || '';
const wallet = Wallet.fromMnemonic(mnemonic);
const apiClient = new MerkleAPIClient(wallet);
const FNAME = process.env.FNAME || 'whatrocks';

// Commander.js setup
const program = new Command();
program.name('fling');
program.description('🪃  Fling - how did your day go?');
program.version('0.0.1');

program
  .command('it')
  .description('Fling a message or two to remember your day')
  .option('-m, --message <message>', 'message to cast')
  .action(async (message) => {
    if (!message.message) {
      await getCasts();
    } else {
      await sendCast(message.message);
    }
  });

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

main();

async function getCasts() {
  updateSpinnerText('Searching for user @' + FNAME);
  const user = await apiClient.lookupUserByUsername(FNAME);
  if (user === undefined) {
    throw new Error('no user found');
  }
  spinnerSuccess();

  updateSpinnerText('Getting casts for user @' + FNAME);
  for await (const cast of apiClient.fetchCastsForUser(user)) {
    spinnerSuccess();
    console.table({
      text: cast.text,
    });
    break;
  }
}

async function sendCast(cast: string) {
  console.log('you message is ', cast);
}
