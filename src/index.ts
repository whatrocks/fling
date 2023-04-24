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
const FNAME = process.env.FNAME || 'taro';
const FLING_SYMBOL = '⌆';
const FLING_STARTER = `${FLING_SYMBOL}\n`;

// Commander.js setup
const program = new Command();
program.name('fling');
program.description('⌆ Fling - how did your stuff go today?');
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

async function sendCast(flingcast: string) {
  // check if today's cast exists
  let todays_cast_exists = false;
  const today = new Date();
  console.log('today is : ', today);
  updateSpinnerText('Searching for user @' + FNAME);
  const user = await apiClient.lookupUserByUsername(FNAME);
  if (user === undefined) {
    throw new Error('no user found');
  }
  spinnerSuccess();
  updateSpinnerText('Getting casts for user @' + FNAME);

  let count = 0;

  for await (const cast of apiClient.fetchCastsForUser(user)) {
    spinnerSuccess();
    console.log(cast);

    // // check if same date
    // const castDate = convertUnixTsToDate(cast.timestamp);
    // const castIsToday = isSameDay(today, castDate);

    if (cast.text[0] === FLING_SYMBOL) {
      console.log('found');
      todays_cast_exists = true;
      await apiClient.publishCast(flingcast, cast);
      break;
    }

    count++;
    if (count > 10) {
      break;
    }
  }
  // if it does not, create it with the FLING_TEXT
  if (!todays_cast_exists) {
    console.log('i need to create todays cast');
    const cast = `${FLING_STARTER}${flingcast}`;
    await apiClient.publishCast(cast);
  }
  console.log('I am done');
}

// function convertUnixTsToDate(timestamp) {
//   var date = new Date(timestamp * 1000);
//   return date.toLocaleDateString('en-US');
// }

// function isSameDay(date1, date2) {
//   return (
//     date1.getFullYear() === date2.getFullYear() &&
//     date1.getMonth() === date2.getMonth() &&
//     date1.getDate() === date2.getDate()
//   );
// }
